const express = require("express");
const AuthController = require("../controllers/AuthController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", AuthController.register);

router.post("/login", AuthController.login);

router.get("/profile", auth, AuthController.getProfile);

router.put("/profile", auth, AuthController.updateProfile);

module.exports = router;