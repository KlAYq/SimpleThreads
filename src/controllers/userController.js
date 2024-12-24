const userController = {}
const User = require("../models").User;
const Post = require("../models").Post;
// const { posts } = require('../public/temp/posts')

userController.init = async (req, res, next) => {
  next();
}

userController.showProfile = async (req, res) => {
    // let user = users.filter(obj =>{
    //     return obj.username == req.user.username;
    // })[0]
    // const thisUser = await User.findOne({where : {username : "testUser"}});
    //
    // if (thisUser) {
    //     res.locals.user = thisUser;
    //     // DETERMINE DISPLAY FOR SESSION USER / OTHER USER
    //     // if (req.sessionUser === req.username) {
    //     //     res.locals.isSessionUser = true;
    //     //     res.locals.page = 'session-user';
    //     // }
    //     res.render("profile");
    // }
    // else
    //     res.send("User not found");

    let getUser = req.username;
    console.log(getUser);

    let thisUser = await User.findOne({where : {username : getUser}});
    if (thisUser){
      // res.locals.username = thisUser.username;
      res.locals.user = {
        username : thisUser.username,
        name : "sample name"
      }
      res.render("profile");
    }
    else res.send("User not found");

}

userController.showPostDetail = async (req, res) => {
    let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
    // res.locals.posts = posts.filter(obj =>{
    //     return obj.postId == id;
    // })[0]
    res.locals.post = await Post.findAll({where: {postId : id}});
    res.locals.isPostView = true
    // res.locals.username = req.sessionUser;
    res.render("post-view");
}

module.exports = userController
