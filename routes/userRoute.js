const router = require("express").Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");
const authAdmin = require("../middlewares/authAdmin");

router.post("/register", auth, authAdmin, userController.register);
router.post("/activation", userController.activateAccount);
router.post("/login", userController.login);
router.post("/refresh_token", userController.getAccessToken);
router.post("/forgot", userController.forgotPassword);
router.post("/reset", userController.resetPassword);
router.get("/infor", auth, userController.getUserInfor);
router.get("/all_infor", auth, authAdmin, userController.getUsersAllInfor);
router.get("/logout", userController.logout);
router.patch("/update/:id", auth, userController.updateUser);
router.patch(
  "/update_role/:id",
  auth,
  authAdmin,
  userController.updateUsersRole
);
router.patch("/update_profil/:id", auth, userController.updateUserProfile);
router.delete("/delete/:id", auth, authAdmin, userController.deleteUser);

module.exports = router;
