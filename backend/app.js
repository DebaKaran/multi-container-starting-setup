require("dotenv").config(); // Loads .env

const fs = require("fs");
const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const { MONGODB_URL } = require("./utils/db");
const Goal = require("./models/goal");

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "logs", "access.log"),
  { flags: "a" }
);

app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/goals", async (req, res) => {
  console.log("TRYING TO FETCH GOALS");
  try {
    const goals = await Goal.find();
    res.status(200).json({
      goals: goals.map((goal) => ({
        id: goal.id,
        text: goal.text,
      })),
    });
    console.log("FETCHED GOALS");
  } catch (err) {
    console.error("ERROR FETCHING GOALS");
    console.error(err.message);
    res.status(500).json({ message: "Failed to load goals." });
  }
});

app.post("/goals", async (req, res) => {
  console.log("TRYING TO STORE GOAL");
  const goalText = req.body.text;

  if (!goalText || goalText.trim().length === 0) {
    console.log("INVALID INPUT - NO TEXT");
    return res.status(422).json({ message: "Invalid goal text." });
  }

  const goal = new Goal({
    text: goalText,
  });

  try {
    await goal.save();
    res
      .status(201)
      .json({ message: "Goal saved", goal: { id: goal.id, text: goalText } });
    console.log("STORED NEW GOAL");
  } catch (err) {
    console.error("ERROR FETCHING GOALS");
    console.error(err.message);
    res.status(500).json({ message: "Failed to save goal." });
  }
});

app.delete("/goals/:id", async (req, res) => {
  console.log("TRYING TO DELETE GOAL");
  try {
    await Goal.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Deleted goal!" });
    console.log("DELETED GOAL");
  } catch (err) {
    console.error("ERROR FETCHING GOALS");
    console.error(err.message);
    res.status(500).json({ message: "Failed to delete goal." });
  }
});

// const MONGO_INITDB_ROOT_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME;
// const MONGO_INITDB_ROOT_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD;
// const MONGODB_DATABASE = process.env.MONGODB_DATABASE;

// Construct the MongoDB connection string
//const MONGODB_URL = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@mongodb:27017/${MONGODB_DATABASE}`;

//const MONGODB_URL = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@mongodb:27017/${MONGODB_DATABASE}?authSource=admin`;

// const MONGODB_URL = process.env.MONGODB_URL

const PORT = process.env.APP_PORT || 80;

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("CONNECTED TO MONGODB");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("FAILED TO CONNECT TO MONGODB");
    console.error(err);
    process.exit(1); // Exit on DB connection failure
  }
};

startServer();
