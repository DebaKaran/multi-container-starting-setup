// backend/util/db.js
require("dotenv").config();

const username = process.env.MONGO_INITDB_ROOT_USERNAME;
const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
const database = process.env.MONGODB_DATABASE;
const host = "mongodb"; // Docker service name

const MONGODB_URL = `mongodb://${username}:${password}@${host}:27017/${database}?authSource=admin`;

module.exports = { MONGODB_URL };
