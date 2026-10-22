const express = require("express");
const router = express.Router();
const MissionController = require("../controllers/missionController");

// Admin Routes (Placed before /:id to prevent route shadowing)
router.get("/admin/all", MissionController.getAllMissionsAdmin);
router.post("/", MissionController.createMission);

// Public / Student Routes
router.get("/", MissionController.getAllPublishedMissions);
router.get("/progress", MissionController.getUserMissionsProgress);
router.get("/seed", MissionController.seedMissions);
router.post("/seed", MissionController.seedMissions);

// Parameterized Mission Routes
router.get("/:id", MissionController.getMissionById);
router.post("/:id/submit-task", MissionController.submitMissionTask);
router.put("/:id", MissionController.updateMission);
router.delete("/:id", MissionController.deleteMission);

module.exports = router;
