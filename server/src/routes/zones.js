const router = require("express").Router();
const { getAll } = require("../controllers/zoneController");

router.get("/", getAll);

module.exports = router;
