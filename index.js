var express = require('express');
 var bodyParser = require('body-parser');

 var port = 3000;
 var BASE_API_PATH = "/api/v1";


 console.log("Starting API server...");

 var app = express();
 app.use(bodyParser.json());

 app.get("/", (req, res) => {
     res.send("<html><body><h1>My server</h1></body></html>");
 });

 app.get(BASE_API_PATH + "/catalogue", (req, res) => {
     console.log(Date() + " - GET /catalogue");
     res.send(catalogue);
 });

 app.post(BASE_API_PATH + "/catalogue", (req, res) => {
     console.log(Date() + " - POST /catalogue");
     var product = req.body;
     catalogue.push(product);
     res.sendStatus(201);
 });

 app.listen(port);

 console.log("Server ready!");