const express = require("express");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
require("dotenv").config();

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// 🔗 Load model API URL from .env
const MODEL_API_URL = process.env.MODEL_API_URL;

// ───────────────────────────────────────────────
// POST /api/analyze-bird
// Accepts an uploaded image file and forwards it to FastAPI
// ───────────────────────────────────────────────
router.post("/analyze-bird", upload.single("file"), async (req, res) => {
  try {
    if (!MODEL_API_URL) {
      throw new Error("MODEL_API_URL not configured in .env");
    }

    // 🧠 Build form-data for FastAPI
    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    // 🚀 Forward the request to your FastAPI model
    const response = await axios.post(MODEL_API_URL, formData, {
      headers: formData.getHeaders(),
    });

    // ✅ Return FastAPI's prediction result to the frontend
    res.json(response.data);
  } catch (err) {
    console.error("Error forwarding to model:", err.response?.data || err.message);
    res.status(500).json({ error: "Model API error" });
  }
});

module.exports = router;
