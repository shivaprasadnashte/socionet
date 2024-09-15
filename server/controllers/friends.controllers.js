import express from "express";
import User from "../models/user.model.js";
import FriendRequest from "../models/friendRequest.model.js";

export const getMyFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("friends");
    return res.status(200).json(user.friends);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

export const addFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const user = await User.findById(req.user._id);
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(400).send("Friend not found");
    }

    if (user.friends.includes(friendId)) {
      return res.status(400).send("Friend already exists");
    }

    user.friends.push(friendId);

    await user.save();
    return res.status(200).send("Friend added successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

export const mutualFriends = async (req, res) => {
    try {
      // Find the current user and populate their friends
      const user = await User.findById(req.user._id).populate('friends', 'friends username email');
  
      if (!user || user.friends.length === 0) {
        return res.status(404).json({ message: 'User has no friends' });
      }
  
      // Create a map to store mutual friend counts
      const mutualFriendCount = new Map();
  
      // Iterate through the user's friends
      for (const friend of user.friends) {
        // For each friend, find their friends
        const friendData = await User.findById(friend._id).populate('friends', 'username email');
  
        if (friendData) {
          // Iterate through the friends of this friend
          for (const mutualFriend of friendData.friends) {
            // Skip if the mutual friend is the user themself or already a direct friend
            if (mutualFriend._id.toString() === req.user._id.toString() || user.friends.some(f => f._id.equals(mutualFriend._id))) {
              continue;
            }
  
            // Increase the mutual count for this mutual friend
            mutualFriendCount.set(
              mutualFriend._id.toString(),
              (mutualFriendCount.get(mutualFriend._id.toString()) || 0) + 1
            );
          }
        }
      }
  
      // Convert the mutualFriendCount map into an array and sort by mutual friend count
      const sortedMutualFriends = Array.from(mutualFriendCount.entries())
        .sort((a, b) => b[1] - a[1]) // Sort in decreasing order of mutual friend count
        .map(([id, count]) => ({ id, count })); // Map each entry to an object with id and count
  
      // Fetch detailed information of the sorted mutual friends
      const mutualFriendsDetails = await User.find({ _id: { $in: sortedMutualFriends.map(f => f.id) } }).select('username email');
  
      // Map user details and append mutual count
      const mutualFriendsWithCount = mutualFriendsDetails.map(friend => ({
        _id: friend._id,
        username: friend.username,
        email: friend.email,
        mutualCount: mutualFriendCount.get(friend._id.toString()), // Attach the mutual count
      }));
  
      return res.status(200).json(mutualFriendsWithCount);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  export const getUsers = async (req, res) => {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      const currentUser = await User.findById(userId).populate("friends");
  
      const usersWithMutualFriends = await User.find({
        _id: { $ne: userId },
        friends: { $in: currentUser.friends },
      })
        .populate("friends")
        .skip(skip)
        .limit(limit);
  
      let users = [];
  
      if (usersWithMutualFriends.length > 0) {
        users = usersWithMutualFriends.map((user) => {
          const mutualFriends = currentUser.friends.filter((friend) =>
            user.friends.includes(friend._id)
          );
  
          return {
            _id: user._id,
            username: user.username,
            mutualFriends: mutualFriends.length > 0 ? mutualFriends : null,
          };
        });
      } else {
        users = await User.find({ _id: { $ne: userId } })
          .skip(skip)
          .limit(limit)
          .select("_id username");
      }
  
      const totalUsers = await User.countDocuments({ _id: { $ne: userId } });
      const totalPages = Math.ceil(totalUsers / limit);
  
      res.status(200).json({
        page,
        totalPages,
        users,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
  
export const recommendFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id, { friends: 1 });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Aggregate to find users who are not already friends but have mutual friends
    const recommendations = await User.aggregate([
      {
        $match: {
          _id: { $nin: [...user.friends, req.user._id] }, // Exclude current friends and the user themselves
        },
      },
      {
        $lookup: {
          from: "users", // Collection to join with
          localField: "friends",
          foreignField: "_id",
          as: "mutualFriends",
        },
      },
      {
        $project: {
          username: 1,
          email: 1,
          mutualFriends: {
            $filter: {
              input: "$mutualFriends",
              as: "friend",
              cond: { $in: ["$$friend._id", user.friends] },
            },
          },
          mutualFriendsCount: { $size: "$mutualFriends" }, // Count of mutual friends
        },
      },
      {
        $match: {
          mutualFriendsCount: { $gt: 0 }, // Only recommend users with mutual friends
        },
      },
      {
        $sort: { mutualFriendsCount: -1 }, // Sort by most mutual friends
      },
    ]);

    return res.status(200).json(recommendations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;

    const sender = await User.findById(req.user._id);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res
        .status(404)
        .json({ message: "User to send request not found" });
    }

    // Check if a pending request already exists
    const existingRequest = await FriendRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Create new friend request
    const friendRequest = await FriendRequest.create({
      sender: req.user._id,
      receiver: receiverId,
    });

    // Add the friend request to both users' friendRequests array
    sender.friendRequests.push(friendRequest._id);
    receiver.friendRequests.push(friendRequest._id);

    await sender.save();
    await receiver.save();

    return res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "friendRequests",
      match: { status: "pending", receiver: req.user._id }, // Only show requests where the user is the receiver
      populate: { path: "sender", select: "username email" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.friendRequests);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest || friendRequest.status !== "pending") {
      return res
        .status(404)
        .json({ message: "Friend request not found or already processed" });
    }

    // Check if the current user is the receiver
    if (friendRequest.receiver.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          message: "You do not have permission to accept this friend request",
        });
    }

    // Update the friend request status to accepted
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add sender and receiver to each other's friends list
    const sender = await User.findById(friendRequest.sender);
    const receiver = await User.findById(friendRequest.receiver);

    sender.friends.push(receiver._id);
    receiver.friends.push(sender._id);

    // Remove friend request from both users' friendRequests array
    sender.friendRequests.pull(friendRequest._id);
    receiver.friendRequests.pull(friendRequest._id);

    await sender.save();
    await receiver.save();

    return res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest || friendRequest.status !== "pending") {
      return res
        .status(404)
        .json({ message: "Friend request not found or already processed" });
    }

    // Check if the current user is the receiver
    if (friendRequest.receiver.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          message: "You do not have permission to reject this friend request",
        });
    }

    // Update the friend request status to rejected
    friendRequest.status = "rejected";
    await friendRequest.save();

    // Remove the friend request from both users' friendRequests array
    const sender = await User.findById(friendRequest.sender);
    const receiver = await User.findById(friendRequest.receiver);

    sender.friendRequests.pull(friendRequest._id);
    receiver.friendRequests.pull(friendRequest._id);

    await sender.save();
    await receiver.save();

    return res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const searchUsers = async (req, res) => {
    try {
      const { keyword } = req.body; // Extract search keyword from query params
  
      if (!keyword) {
        return res.status(400).json({ message: 'Please provide a search keyword' });
      }
  
      const users = await User.find({
        $or: [
          { username: { $regex: keyword, $options: 'i' } }, // Case-insensitive search for username
          { email: { $regex: keyword, $options: 'i' } },    // Case-insensitive search for email
        ],
      }).select('username email');
  
      if (!users.length) {
        return res.status(404).json({ message: 'No users found' });
      }
  
      return res.status(200).json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  

  export const unfriendUser = async (req, res) => {
    try {
      const { friendId } = req.body; // The ID of the friend to unfriend
  
      const user = await User.findById(req.user._id); // Current logged-in user
      const friend = await User.findById(friendId);   // Friend to unfriend
  
      if (!user || !friend) {
        return res.status(404).json({ message: 'User or friend not found' });
      }
  
      // Check if they are already friends
      if (!user.friends.includes(friendId)) {
        return res.status(400).json({ message: 'You are not friends with this user' });
      }
  
      // Remove friendId from user's friends list
      user.friends.pull(friendId);
      await user.save();
  
      // Remove userId from friend's friends list
      friend.friends.pull(req.user._id);
      await friend.save();
  
      return res.status(200).json({ message: 'Successfully unfriended the user' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  