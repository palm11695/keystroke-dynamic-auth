const express = require("express");
const mysql = require("mysql2");
const bp = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv").config();

const app = express();
app.use(cors({ credentials: true }));
app.use(bp.urlencoded({ extended: true }));

const router = express.Router();
app.use("/", router);
router.use(bp.json());

var dbConnect = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

dbConnect.connect(function(err) {
    if(err) throw err;

    console.log(`Connected DB: ${process.env.DB_NAME}`);
});

app.listen(process.env.PORT, function() {
    console.log(`Server listening at Port ${process.env.PORT}`);
});

app.post("/register", (req, res) => {
    const username = req.body.username;

    const info = {
        username : req.body.username,
        password : req.body.password,
        avgSpeed0 : req.body.avgSpeed0,
        avgSpeed1 : req.body.avgSpeed1,
        avgSpeed2 : req.body.avgSpeed2
    }

    dbConnect.query(
        "SELECT username FROM login_info WHERE username = ?", [username], 
        (err, result) => {
            if (err) res.send({ err: true });
            if (!result.length > 0) {
                dbConnect.query(
                    "INSERT INTO login_info SET ?", [info], 
                    (err) => {
                        if (err) res.send({ err: true });
                        res.send({ err: false });
                    }
                )
            }
            else {
                res.send({ err: true , message: "This username is already used." });
            }
        }
    )
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const avgSpeed = req.body.avgSpeed;

    dbConnect.query(
        "SELECT avgSpeed0, avgSpeed1, avgSpeed2 FROM login_info WHERE username = ? AND password = ?", 
        [username, password],
        (err, result) => {
            if (err) res.send({ err: true });

            console.log(result);
            console.log('Received Avg Speed: ', avgSpeed);

            if(result.length > 0) {
                let verifiedAvgSpeed = [];
                verifiedAvgSpeed.push(result[0].avgSpeed0);
                verifiedAvgSpeed.push(result[0].avgSpeed1);
                verifiedAvgSpeed.push(result[0].avgSpeed2);

                let total = 0;
                verifiedAvgSpeed.forEach((each) => {
                    total += each;
                });

                const allAvgSpeed = total / verifiedAvgSpeed.length;
                const margin = allAvgSpeed * 0.2;

                verifiedAvgSpeed.sort();
                const fastestWithMargin = verifiedAvgSpeed[0] + margin;
                const slowestWithMargin = verifiedAvgSpeed[2] - margin;
                const matchSpeed = slowestWithMargin <= avgSpeed && fastestWithMargin >= avgSpeed
                
                matchSpeed 
                ? res.send({ err: false, message: "Login Successful!"}) :
                res.send({ err: true, message: "Authentication failed"});
            }
            else {
                res.send({ err: true, message: "Incorrect username or password." });
            }
        }
    )
});