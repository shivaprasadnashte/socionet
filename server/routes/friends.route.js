import express from "express";
import { acceptFriendRequest, addFriend, getFriendRequests, getMyFriends, mutualFriends, recommendFriends, rejectFriendRequest, searchUsers, sendFriendRequest, unfriendUser } from "../controllers/friends.controllers.js";
import protect from "../middleware/auth.middleware.js";

const friendsRouter = express.Router();

friendsRouter.route("/getmyfriends").get(protect, getMyFriends);
friendsRouter.route("/addfriend").post(protect, addFriend);
friendsRouter.route("/mutualfriends").get(protect, mutualFriends);
friendsRouter.route("/recommendfriends").get(protect, recommendFriends);
friendsRouter.route("/sendfriendrequest").post(protect, sendFriendRequest);
friendsRouter.route("/getfriendrequests").get(protect, getFriendRequests);
friendsRouter.route("/acceptfriendrequest").post(protect, acceptFriendRequest);
friendsRouter.route("/rejectfriendrequest").post(protect, rejectFriendRequest);
friendsRouter.route("/searchusers").get(protect, searchUsers);
friendsRouter.route("/unfrienduser").delete(protect, unfriendUser);

export default friendsRouter;
