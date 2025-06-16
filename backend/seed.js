require("dotenv").config();
const mongoose = require("mongoose");
const { MONGODB_URL } = require("./utils/db");

// Define a sample schema and model
const goalSchema = new mongoose.Schema({
  text: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Goal = mongoose.model("Goal", goalSchema);

// Seed function
const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB for seeding.");

    // Optional: Clear existing data
    await Goal.deleteMany({});
    console.log("Cleared existing goals.");

    // Insert seed data
    const goals = [
      { text: "Learn Docker Compose" },
      { text: "Build a MERN stack app" },
      { text: "Deploy on production" },
    ];

    await Goal.insertMany(goals);
    console.log("Seeding complete!");

    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedData();
