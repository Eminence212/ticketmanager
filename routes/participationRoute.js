const router = require("express").Router();
const participationController = require("../controllers/participationController");
const auth = require("../middlewares/auth");
const authAdmin = require("../middlewares/authAdmin");
router.post("/add", auth, participationController.register);
router.get("/:id", auth, participationController.getById);
router.get("/", auth, participationController.getAll);
router.patch("/update/:id", auth, participationController.update);
router.delete("/delete/:id", auth, authAdmin, participationController.delete);
module.exports = router;
