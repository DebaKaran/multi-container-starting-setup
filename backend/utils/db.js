// backend/util/db.js
require("dotenv").config();

const USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME;
const PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD;
const DATABASE = process.env.MONGODB_DATABASE;
const HOST = "mongodb"; // Docker service name

const MONGODB_URL = `mongodb://${USERNAME}:${PASSWORD}@${HOST}:27017/${DATABASE}?authSource=admin`;

module.exports = { MONGODB_URL };
