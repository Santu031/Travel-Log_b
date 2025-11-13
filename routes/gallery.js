const express = require("express");
const GalleryController = require("../controllers/GalleryController");

const router = express.Router();
router.get("/photos", GalleryController.getPhotos);
router.post("/photos", GalleryController.createPhoto);
router.delete("/photos/:id", GalleryController.deletePhoto);

router.get("/posts", GalleryController.getPosts);
router.get("/posts/trending", GalleryController.getTrendingPosts);

router.get("/friends", GalleryController.getFriends);
router.post("/friends", GalleryController.addFriend);
router.delete("/friends", GalleryController.removeFriend);

router.get("/friends/profile", GalleryController.getFriendProfile);

// New endpoint for searching users
router.get("/users", GalleryController.getAllUsers);

module.exports = router;