const router = require("express").Router();
const { getAll, resolve } = require("../controllers/alertController");

router.get("/",              getAll);
router.post("/:id/resolve",  resolve);

module.exports = router;
