// This code was developed with assistance from OpenAI's ChatGPT.

const express = require("express");
const multer = require("multer");
require("dotenv").config();

const router = express.Router();
const db_birds = include('database/birds');
const { logEndpointRequest } = require('../utils');
const messages = require('../lang/messages/en/bird');
const { imgMessages } = require('../lang/messages/en/images');

const upload = multer({ storage: multer.memoryStorage() });
const { Readable } = require('stream');
const cloudinary = require('../cloudinaryConfig.js');

const MODEL_API_URL = process.env.MODEL_API_URL;

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

    const loggedUserId = await logEndpointRequest(req, res, "POST", {
      userNotFound: messages.userNotFound,
      unauthorized: messages.unauthorized,
      failedToLogRequest: messages.failedToLogRequest
    }, userId);
    if (!loggedUserId) return; // Error response already sent

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

        const uploadResult = await uploadImageToCloudinary(req.file.buffer);

        const imgId = await db_birds.createImageEntry({
          img_title: req.file.originalname || "Bird Image",
          img_url: uploadResult.secure_url,
          img_public_id: uploadResult.public_id,
        });

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

async function uploadImageToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const bufferToStream = (buffer) => {
      const readable = new Readable();
      readable._read = () => {};
      readable.push(buffer);
      readable.push(null);
      return readable;
    };

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "birds",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    bufferToStream(fileBuffer).pipe(stream);
  });
}

module.exports = router;
