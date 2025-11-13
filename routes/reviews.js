const express = require("express");
const ReviewController = require("../controllers/ReviewController");

const router = express.Router();
router.post("/", ReviewController.createReview);
router.get("/", ReviewController.getAllReviews);
router.post("/:id/helpful", ReviewController.incrementHelpful);
router.delete("/:id", ReviewController.deleteReview);

module.exports = router;
