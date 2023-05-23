const router = require("express").Router();
const participantController = require("../controllers/participantController");
const auth = require("../middlewares/auth");
const authAdmin = require("../middlewares/authAdmin");
router.post("/add", auth, participantController.register);
router.get("/:id", auth, participantController.getById);
router.get("/", auth, participantController.getAll);
router.patch("/update/:id", auth, participantController.update);
router.delete("/delete/:id", auth, authAdmin, participantController.delete);
module.exports = router;