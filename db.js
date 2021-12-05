const mongoose = require("mongoose");
console.log(process.env.MONGO_URL);
const DB_URL = (process.env.MONGO_URL || 'mongodb://db/test');
console.log(DB_URL);

const dbConnect = function() {
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error: '));
    return mongoose.connect(DB_URL, { useNewUrlParser: true });
}

module.exports = dbConnect;