const router = require("express").Router();
const ctrl   = require("../controllers/camperController");

router.get("/",                    ctrl.getAll);
router.get("/search",              ctrl.search);
router.get("/:id",                 ctrl.getById);
router.post("/",                   ctrl.create);
router.put("/:id",                 ctrl.update);
router.delete("/:id",              ctrl.remove);
router.post("/:id/checkin",        ctrl.checkIn);
router.post("/:id/toggle-incamp",  ctrl.toggleInCamp);
router.post("/:id/assign-device",  ctrl.assignDevice);

module.exports = router;
