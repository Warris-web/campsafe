const router = require("express").Router();
const { getLogs, getSummary } = require("../controllers/staffController");

router.get("/logs",    getLogs);
router.get("/summary", getSummary);

module.exports = router;
