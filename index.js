const app = require("./server.js");
const dbConnect = require("./db.js");
const Subscriptions = require("./models/subscriptions");
const { getLabels } = require("./externalAPI/imageLabeling");

require("dotenv").config();

var port = process.env.PORT || 3000;

console.log("Starting API server at " + port);

const subscriptions = new Subscriptions();
subscriptions.initialize();
subscriptions.execute();

console.log("Trying to call the API")


dbConnect().then(
  () => {
    app.listen(port);
    console.log("Server ready!");
  },
  (err) => {
    console.log("Connection error - " + err);
  }
);
