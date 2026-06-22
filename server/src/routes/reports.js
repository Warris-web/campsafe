const router = require("express").Router();
const { incidentSummary } = require("../controllers/reportController");

router.get("/incident-summary", incidentSummary);

module.exports = router;