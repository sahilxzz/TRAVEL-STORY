require("dotenv").config();
const PORT = process.env.PORT || 8000;
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const upload = require("./multer");

const { authenticateToken } = require("./utilities");

const User = require("./models/user.model");
const TravelStory = require("./models/travelStory.model");

mongoose.connect(process.env.MONGO_URI);

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Create Account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: true, message: "All fields are required" });
  }

  const isUser = await User.findOne({ email });
  if (isUser) {
    return res.status(400).json({ error: true, message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ fullName, email, password: hashedPassword });
  await user.save();

  const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "72h" });

  return res.status(201).json({
    error: false,
    user: { fullName: user.fullName, email: user.email },
    accessToken,
    message: "Registration Successfull",
  });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "72h" });

  return res.json({
    error: false,
    message: "Login successfull",
    user: { fullName: user.fullName, email: user.email },
    accessToken,
  });
});

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
  const { userId } = req.user;

  const isUser = await User.findOne({ _id: userId });
  if (!isUser) return res.sendStatus(401);

  return res.json({ user: isUser, message: "" });
});

// Add Travel Story
app.post("/add-travel-story", authenticateToken, async (req, res) => {
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
  const { userId } = req.user;

  if (!title || !story || !visitedLocation || !imageUrl || !visitedDate) {
    return res.status(400).json({ error: true, message: "All fields are required" });
  }

  const travelStory = new TravelStory({
    title,
    story,
    visitedLocation,
    userId,
    imageUrl,
    visitedDate,
  });

  await travelStory.save();
  res.status(201).json({ story: travelStory, message: "Added successfully" });
});

// Get All Travel Stories
app.get("/get-all-stories", authenticateToken, async (req, res) => {
  const { userId } = req.user;

  try {
    const travelStories = await TravelStory.find({ userId }).sort({ isFavourite: -1 });
    res.status(200).json({ stories: travelStories });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Upload Image (assumes Cloudinary)
app.post("/image-upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: true, message: "No image uploaded" });
    }

    return res.status(200).json({ imageUrl: req.file.path });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
});

// Edit Travel Story
app.put("/edit-story/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
  const { userId } = req.user;

  if (!title || !story || !visitedLocation || !visitedDate) {
    return res.status(400).json({ error: true, message: "All fields are required" });
  }

  try {
    const travelStory = await TravelStory.findOne({ _id: id, userId });
    if (!travelStory) return res.status(404).json({ error: true, message: "Travel Story not found" });

    travelStory.title = title;
    travelStory.story = story;
    travelStory.visitedLocation = visitedLocation;
    travelStory.imageUrl = imageUrl;
    travelStory.visitedDate = visitedDate;

    await travelStory.save();
    res.status(200).json({ story: travelStory, message: "Update Successful" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Delete Travel Story
app.delete("/delete-story/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const travelStory = await TravelStory.findOne({ _id: id, userId });
    if (!travelStory) return res.status(404).json({ error: true, message: "Travel Story not found" });

    await TravelStory.deleteOne({ _id: id, userId });
    res.status(200).json({ message: "Travel Story deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Update isFavourite
app.put("/update-is-favourite/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { isFavourite } = req.body;
  const { userId } = req.user;

  try {
    const travelStory = await TravelStory.findOne({ _id: id, userId });
    if (!travelStory) return res.status(404).json({ error: true, message: "Travel Story not found" });

    travelStory.isFavourite = isFavourite;
    await travelStory.save();

    res.status(200).json({ message: "Update successful" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Search Travel Stories
app.get("/search", authenticateToken, async (req, res) => {
  const { query } = req.query;
  const { userId } = req.user;

  if (!query) return res.status(404).json({ message: "query is required" });

  try {
    const searchResults = await TravelStory.find({
      userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { story: { $regex: query, $options: "i" } },
        { visitedLocation: { $regex: query, $options: "i" } },
      ],
    }).sort({ isFavourite: -1 });

    res.status(200).json({ stories: searchResults });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Filter Travel Stories by date range
app.get("/travel-stories/filter", authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;
  const { userId } = req.user;

  try {
    const start = new Date(parseInt(startDate));
    const end = new Date(parseInt(endDate));

    const filteredStories = await TravelStory.find({
      userId,
      visitedDate: { $gte: start, $lte: end },
    }).sort({ isFavourite: -1 });

    res.status(200).json({ stories: filteredStories });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
