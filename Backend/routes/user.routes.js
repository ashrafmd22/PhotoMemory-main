import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  imageUpload,
  allimages
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {verifyCookies} from "../middlewares/verifytoken.js"

const router = Router();

router.route("/register").post(
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.post('/image-upload', verifyJWT, upload.single('image'), imageUpload);
router.get('/get-images',verifyJWT,allimages);
router.get('/check-auth', verifyJWT, getCurrentUser);
router.get('/some-protected-route', verifyCookies, (req, res) => {
  res.status(200).json({ message: "You have valid tokens!"});
});
// router.route("/update-account").patch(verifyJWT, updateAccountDetails);


export default router;
