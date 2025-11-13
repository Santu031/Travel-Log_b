const express = require("express");
const AIController = require("../controllers/AIController");

const router = express.Router();

router.post("/search", AIController.aiSearch);

router.post("/recommendations", AIController.aiRecommendations);


module.exports = router;