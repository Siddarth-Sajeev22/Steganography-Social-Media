import express from "express";
import { getAccessKey, getFeedPosts, getUserPosts, likePost } from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";
import { getUserFriends } from "../controllers/users.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);
router.get("/:picturePath/getAccessKey", getAccessKey);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);

export default router;
