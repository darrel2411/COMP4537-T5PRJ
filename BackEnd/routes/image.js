const express = require("express");
const db_users = include('database/users');
const multer = require('multer');
const { Readable } = require('stream');
const cloudinary = require('../cloudinaryConfig.js');
const upload = multer({ storage: multer.memoryStorage() });

const { imgMessages } = require('../lang/messages/en/images.js');
const { logEndpointRequest } = require('../utils');

const router = express.Router();

/**
 * @swagger
 * /uploadProfileImage:
 *   post:
 *     summary: Upload a profile image for the authenticated user
 *     tags: [Images]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload as profile picture
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 img_url:
 *                   type: string
 *                   format: uri
 *                   description: URL of the uploaded image
 *                 msg:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: No file provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Server error or upload failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                 details:
 *                   type: object
 *                   description: Error details (if available)
 */
router.post('/uploadProfileImage', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: imgMessages.noFileProvided, ok: false });

        const userId = req.session?.userId || null;

        // Log the endpoint request
        const loggedUserId = await logEndpointRequest(
            req,
            res,
            "POST",
            {
                userNotFound: imgMessages.serverError,
                unauthorized: imgMessages.serverError,
                failedToLogRequest: imgMessages.serverError
            },
            userId
        );
        if (!loggedUserId) return;

        // Use the logged user ID for consistency
        const finalUserId = loggedUserId;

        const bufferToStream = (buffer) => {
            const readable = new Readable();
            readable._read = () => { }; // no-op (required method)
            readable.push(buffer);
            readable.push(null);
            return readable;
        };

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'bird-quest/profile-images',
                resource_type: 'image'
            },
            async (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return res.status(500).json({ msg: imgMessages.errorUploadingImg, ok: true, details: error });
                }

                const oldProfilePicture = await db_users.getProfilePictureID({ user_id: finalUserId });
                
                // Store the image in our database
                const uploaded = await db_users.UploadImage({
                    img_url: result.secure_url,
                    img_public_id: result.public_id,
                });

                // Connect the image to the user
                const updateUser = await db_users.updateImageId({
                    user_id: finalUserId,
                    img_id: uploaded.insertId,
                });

                // Delete Old picture
                if (oldProfilePicture.length > 0) {
                    console.log("Deleted old image:", oldProfilePicture);
                    await db_users.deleteImage({ img_id: oldProfilePicture[0].img_id });
                    await cloudinary.uploader.destroy(oldProfilePicture[0].img_public_id);
                }

                if (updateUser) {
                    return res.json({
                        ok: true,
                        img_url: result.secure_url,
                        msg: imgMessages.successUploadedPicture
                    });
                } else {
                    return res.json({
                        ok: false,
                        msg: imgMessages.failUploadingPicture
                    });
                }
            }
        );

        bufferToStream(req.file.buffer).pipe(stream);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: messages.serverError, ok: false });
    }
});

module.exports = router