const app = require("./server.js");
const dbConnect = require("./db.js");
const Subscriptions = require("./models/subscriptions");
const { getLabels } = require("./externalAPI/imageLabeling");

require("dotenv").config();

var port = process.env.PORT || 4000;

console.log("Starting API server at " + port);

const subscriptions = new Subscriptions();
subscriptions.initialize();
subscriptions.execute();

const labels = async() => {
  let res;
  try {
    res = await getLabels("https://www.inferdo.com/img/label-1.jpg");
    console.log(res);
  } catch (err) {
    console.log(err);
  }

  return res;
  
}
console.log(labels());

dbConnect().then(
  () => {
    app.listen(port);
    console.log("Server ready!");
  },
  (err) => {
    console.log("Connection error - " + err);
  }
);
