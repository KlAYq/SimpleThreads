const userController = {}
const Post = require("../models").Post;
const User = require("../models").User;
// const { posts } = require('../public/temp/posts')

userController.init = async (req, res, next) => {
  next();
}

userController.showProfile = async (req, res) => {
    let getUser = req.username;
    let currentUser = await req.user;

    let thisUser = await User.findOne({where : {username : getUser}});
    if (thisUser){
      res.locals.user = {
        username: thisUser.username,
        name: thisUser.fullName,
        avatar: thisUser.profilePicture || 'images/avatar.png',
        followerCount: 12,
        followingCount: 24,
        bio: thisUser.description
      }

      res.locals.isSessionUser = (currentUser != null) && (thisUser.username === currentUser.username);

      res.render("profile");
    }
    else res.send("User not found");
}

userController.showPostDetail = async (req, res) => {
    let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
    res.locals.post = await Post.findAll({where: {postId : id}});
    res.locals.isPostView = true
    // res.locals.username = req.sessionUser;
    res.render("post-view");
}

module.exports = userController
