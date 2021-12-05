var express = require('express')
var bodyParser = require('body-parser');
var DataStore = require('nedb');

var port = 3000;
var BASE_API_PATH = "/api/v1";
var DB_FILE_NAME = __dirname + "/products.json";

console.log("Starting API server...");

var app = express();
app.use(bodyParser.json());

var db = new DataStore({
    filename: DB_FILE_NAME,
    autoload: true
});

app.get("/", (req, res) => {
    res.send("<html><body><h1>My server</h1></body></html>");
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

app.listen(port);
console.log("Server ready!");