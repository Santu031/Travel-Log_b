const express = require("express");
const TravelController = require("../controllers/TravelController");

const router = express.Router();
router.post("/", TravelController.createTravelLog);
router.get("/", TravelController.getAllTravelLogs);
router.get("/:id", TravelController.getTravelLogById);
router.put("/:id", TravelController.updateTravelLog);
router.delete("/:id", TravelController.deleteTravelLog);

module.exports = router;



