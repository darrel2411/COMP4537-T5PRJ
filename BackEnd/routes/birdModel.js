const express = require("express");
const multer = require("multer");
require("dotenv").config();

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Load model API URL from .env (e.g., http://localhost:3000)
const MODEL_API_URL = process.env.MODEL_API_URL || "http://localhost:3000";

// ───────────────────────────────────────────────
// POST /api/analyze-bird
// Accepts an uploaded image file and forwards it to the bird classification model
// ───────────────────────────────────────────────
router.post("/analyze-bird", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Build form-data for the model API using native FormData (Node.js 18+)
    // Convert buffer to Blob for native FormData
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'image/jpeg' });
    const formData = new FormData();
    formData.append("image", blob, req.file.originalname);

    // Forward the request to the bird classification model
    const classifyUrl = `${MODEL_API_URL}/classify`;
    const response = await fetch(classifyUrl, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header - fetch will set it automatically with boundary
    });

    if (!response.ok) {
      const errorText = await response.text();      
      throw new Error(`Model API returned ${response.status}: ${errorText}`);
    }

    // Return the model's prediction result (label, probability, classId) to the frontend
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error forwarding to model:", err.message);
    res.status(500).json({ 
      error: "Model API error",
      details: err.message 
    });
  }
});

module.exports = router;
