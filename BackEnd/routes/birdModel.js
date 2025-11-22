// This code was developed with assistance from OpenAI's ChatGPT.

const express = require("express");
const multer = require("multer");
require("dotenv").config();

const router = express.Router();
const db_birds = include('database/birds');
const db_logging = include('database/logging');
const messages = require('../lang/messages/en/bird');

const upload = multer({ storage: multer.memoryStorage() });

const MODEL_API_URL = process.env.MODEL_API_URL || "http://localhost:3000";

// ───────────────────────────────────────────────
// POST /api/analyze-bird
// Accepts an uploaded image file and forwards it to the bird classification model
// Implements API consumption limit, logging, bird matching, and collection logic
// ───────────────────────────────────────────────
router.post("/analyze-bird", upload.single("image"), async (req, res) => {
  try {
    let userId;
    if (req.user && req.user.id) {
      userId = req.user.id;
    } else if (req.session.authenticated && req.session.email) {
      // Fallback to session-based auth
      const userByEmail = await db_birds.getUserByEmail(req.session.email);
      if (!userByEmail) {
        return res.status(404).json({ error: messages.userNotFound });
      }
      userId = userByEmail.user_id;
    } else {
      return res.status(401).json({ error: messages.unauthorized });
    }

    if (!req.file) {
      return res.status(400).json({ error: messages.noImageFile });
    }

    const user = await db_birds.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: messages.userNotFound });
    }

    if (user.api_consumption >= 20) {
      return res.status(403).json({ message: messages.apiLimitReached });
    }

    await db_birds.incrementApiConsumption(userId);

    const methodId = await db_logging.getOrCreateMethod("POST");
    if (!methodId) {
      console.error("Failed to get or create method");
      return res.status(500).json({ error: messages.failedToLogRequest });
    }

    const endpointId = await db_logging.getOrCreateEndpoint(methodId, req.baseUrl + req.path);
    if (!endpointId) {
      console.error("Failed to get or create endpoint");
      return res.status(500).json({ error: messages.failedToLogRequest });
    }

    await db_logging.logRequest(endpointId, userId);

    // Forward the request to the bird classification model
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'image/jpeg' });
    const formData = new FormData();
    formData.append("image", blob, req.file.originalname);

    const classifyUrl = `${MODEL_API_URL}/classify`;
    const response = await fetch(classifyUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(messages.modelApiError(response.status, errorText));
    }

    const classifierResult = await response.json();
    const { label, probability, classId } = classifierResult;

    const bird = await db_birds.findBirdByName(label);
    
    let message = "";
    let updatedScore = user.score;

    if (bird) {
      const isInCollection = await db_birds.checkBirdInCollection(userId, bird.bird_id);

      if (!isInCollection) {
        // Bird is not in collection - add it
        // Create an image entry for the collection (img_id is required)
        const imgId = await db_birds.createImageEntry(
          req.file.originalname || 'bird_image',
          '' // img_url can be empty for now
        );

        if (imgId) {
          await db_birds.addBirdToCollection(userId, bird.bird_id, imgId);
        }

        const rareTypeInfo = await db_birds.getRareTypeInfo(bird.rare_type_id);
        updatedScore = user.score + rareTypeInfo.score;
        await db_birds.updateUserScore(userId, updatedScore);

        message = messages.birdDiscovered(rareTypeInfo.rare_type);
      } else {
        message = messages.birdAlreadyFound;
      }
    } else {
      message = messages.birdNotFoundInDatabase;
    }

    res.json({
      label,
      probability,
      classId,
      message,
      score: updatedScore
    });

  } catch (err) {
    console.error("Error in analyze-bird endpoint:", err.message);
    res.status(500).json({ 
      error: messages.internalServerError,
      details: err.message 
    });
  }
});

module.exports = router;
