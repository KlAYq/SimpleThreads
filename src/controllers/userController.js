const { where } = require("sequelize");

const userController = {}
const {User, Post, Follow} = require("../models");
// const { posts } = require('../public/temp/posts')

userController.init = async (req, res, next) => {
  next();
}

userController.showProfile = async (req, res) => {
    let targetUsername = req.username;
    let currentUser = await req.user;

    if (currentUser == null){
      console.log("not logged in");
      res.redirect("/login");
    }

    res.locals.isLoggedIn = true;

    let targetUser = await User.findOne({where : {username : targetUsername}});
    if (targetUser) {
      let isSessionUser = (currentUser != null) && (targetUser.username === currentUser.username);
      let following = false;
      let followers = await Follow.findAll({
        where: { followedUserId: targetUser.id },
        attributes: ['id', 'followingUserId']
      })
      let followingCount = await Follow.count({where: { followingUserId: targetUser.id }})
      let followerCount = followers.length;

      if (!isSessionUser) {
        if (currentUser != null) {
          following = followers.some(follow => follow.followingUserId === currentUser.id)
        }
      }

      res.locals.user = {
        id: targetUser.id,
        username: targetUser.username,
        name: targetUser.fullName,
        avatar: targetUser.profilePicture || 'images/avatar.png',
        followerCount: followerCount,
        followingCount: followingCount,
        bio: targetUser.description,
        isSessionUser: isSessionUser,
        following: following
      }

      // res.locals.username = targetUsername;
      // res.locals.isSessionUser = isSessionUser;
      // res.locals.following = following;
      res.render("profile");
    }
    // else res.send("User not found");
}

userController.showPostDetail = async (req, res) => {
    let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
    res.locals.post = await Post.findAll({where: {postId : id}});
    res.locals.isPostView = true
    // res.locals.username = req.sessionUser;
    res.render("post-view");
}

module.exports = userController
