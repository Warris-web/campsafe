const router = require("express").Router();
const ctrl = require("../controllers/simulatorController");

router.get("/tags",              ctrl.listTags);
router.post("/tags",             ctrl.createTag);
router.delete("/tags/:id",       ctrl.deleteTag);
router.post("/tags/:id/move",    ctrl.moveTag);
router.post("/tags/:id/sos",     ctrl.toggleSos);
router.post("/reset",            ctrl.resetAll);

module.exports = router;