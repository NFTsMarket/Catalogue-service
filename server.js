const db = require("./db.js");
var express = require("express");
var bodyParser = require("body-parser");

var BASE_API_PATH = "/api/v1";

var app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("<html><body><h1>My server</h1></body></html>");
});

app.get(BASE_API_PATH + "/healthz", (req, res) => {
    res.sendStatus(200);
});

app.get(BASE_API_PATH + "/products", (req, res) => {
    console.log(Date() + " - GET /products");

    db.find({}, (err, products) => {
        if (err) {
            console.log(Date() + " - " + err);
            res.sendStatus(500);
        } else {
            res.send(products.map((item) => {
                delete item._id;
                return item;
            }));
        }
    });
});

app.post(BASE_API_PATH + "/products", (req, res) => {
    console.log(Date() + " - POST /products");
    var item = req.body;
    db.insert(item, (err) => {
        if (err) {
            console.log(Date() + " - " + err);
            res.sendStatus(500);
        } else {
            res.sendStatus(201);
        }
    });
});

module.exports = app;