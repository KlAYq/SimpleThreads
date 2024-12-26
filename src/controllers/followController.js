const { where } = require("sequelize");
const { Op } = require('sequelize');
const { User, Follow, Notification } = require("../models");
const followController = {}

followController.followUser = async (req, res) => {
    const currentUser = await req.user;
    const targetUserId = req.params.id;

    try {
        await Follow.create({
            followingUserId: currentUser.id,
            followedUserId: targetUserId
        });

        await Notification.create({
          userId: targetUserId,
          otherId: currentUser.id,
          content: " has followed you!",
          isRead: false
        })
        res.status(200).send()
    } catch (error) {
        console.log(error)
        res.status(500).send("Can not follow user")
    }
}

followController.unfollowUser = async (req, res) => {
    const currentUser = await req.user;
    const targetUserId = req.params.id;

    try {
        let follow = await Follow.findOne({
            where: {
                followingUserId: currentUser.id,
                followedUserId: targetUserId
            }
        });
        await follow.destroy();
        res.status(200).send()
    } catch (error) {
        console.log(error)
        res.status(500).send("Can not unfollow user")
    }
}

followController.showFollows = async (req, res) => {
    let targetUsername = req.username;
    let currentUser = await req.user;

    if (currentUser == null) {
      console.log("not logged in");
      res.redirect("/login");
    }

    res.locals.isLoggedIn = true;
    let targetUser = await User.findOne({where : {username : targetUsername}});
    if (targetUser) {
        let followedId = await Follow.findAll({
            where: {followingUserId: targetUser.id}, 
            attributes: ['followedUserId']
        });

        let followingId = await Follow.findAll({
            where: {followedUserId: targetUser.id}, 
            attributes: ['followingUserId']
        });

        followingId = followingId.map(follow => follow.followingUserId);
        followedId = followedId.map(follow => follow.followedUserId);
        
        let followees = await User.findAll({
            where: {id: {[Op.in]: followedId}},
            include: {model: Follow, 
                as: "Followed", 
                required: false, 
                where: {followingUserId: currentUser.id}, 
                attributes: ['id']
            },
            attributes: ['id', 'username', 'fullName', 'profilePicture', 'description']
        });
        
        let followers = await User.findAll({
            where: {id: {[Op.in]: followingId}},
            include: {
                model: Follow, 
                as: "Followed", 
                required: false, 
                where: {followingUserId: currentUser.id}, 
                attributes: ['id']
            },
            attributes: ['id', 'username', 'fullName', 'profilePicture', 'description']
        });

        followees = followees.map(user => {
            return {
                ...user.toJSON(),
                followable: user.id !== currentUser.id,
                following: user.Followed.length > 0
            };
        });

        followers = followers.map(user => {
            return {
                ...user.toJSON(),
                followable: user.id !== currentUser.id,
                following: user.Followed.length > 0
            };
        });

        res.locals.followees = followees;
        res.locals.followers = followers;
    }

    res.render("follows")
}

module.exports = followController;
