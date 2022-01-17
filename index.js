const app = require("./server.js");
const dbConnect = require("./db.js");
const Subscriptions = require("./models/subscriptions");

require("dotenv").config();

var port = process.env.PORT || 4000;

console.log("Starting API server at " + port);

const subscriptions = new Subscriptions();
subscriptions.initialize();
subscriptions.execute();

dbConnect().then(
  () => {
    app.listen(port);
    console.log("Server ready!");
  },
  (err) => {
    console.log("Connection error - " + err);
  }
);
