const express = require("express");
const router = express.Router();
const slotController = require("../controllers/slotController");

router.post("/slots", slotController.createSlot);
router.get("/mentors", slotController.getMentorsWithSlots);
router.post("/book", slotController.bookSlot);
router.get("/mentor/:mentorId", slotController.getMentorSlots);

module.exports = router;
