const { where } = require("sequelize");
const userController = {}
const {User, Post, Follow, Comment, Reaction} = require("../models");
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
        where: {followedUserId: targetUser.id},
        attributes: ['id', 'followingUserId']
      })
      let followingCount = await Follow.count({where: {followingUserId: targetUser.id}})
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

      const profileUser = await User.findOne({ where: { username: req.username } });
      if (!profileUser) {
        res.status(404).send("User not found");
        return;
      }

      // Get posts created by the profile user
      const posts = await Post.findAll({
        where: { userId: profileUser.id },
        include: [
          {
            model: User,
            attributes: ['username', 'fullName', 'profilePicture']
          },
          {
            model: Comment,
            attributes: ['id']
          },
          {
            model: Reaction,
            where: { type: 'LIKE' },
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Format posts for rendering
      const formattedPosts = posts.map(post => {
        const postData = post.get({ plain: true });
        return {
          postId: postData.id,
          username: postData.User.username,
          name: postData.User.fullName,
          avatar: postData.User.profilePicture || '/images/default-avatar.png',
          timestamp: formatTimestamp(postData.createdAt),
          description: postData.description,
          imagePath: postData.image ? postData.image.split('<>') : [],
          likeCount: postData.Reactions.length,
          commentCount: postData.Comments.length,
          isLiked: postData.Reactions.some(reaction => reaction.userId === profileUser.id)
        };
      });
      res.locals.posts = formattedPosts;
      console.log("number of post: " + formattedPosts.length);
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

// Helper function to format timestamp
const formatTimestamp = (date) => {
  const now = new Date();
  const postDate = new Date(date);
  const diffInMs = now - postDate;

  // Time difference in minutes and hours
  const diffMinutes = Math.floor(diffInMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 60) {
      // If within the same hour, display as minutes
      return `${diffMinutes}m`;
  } else if (diffHours < 24 && postDate.getDate() === now.getDate()) {
      // If within the same day, display as hours and minutes
      const remainingMinutes = diffMinutes % 60;
      return `${diffHours}h${remainingMinutes}m`;
  } else if (postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear()) {
      // If within the same month, display as HH:mm, dd/MM
      return postDate.toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
      });
  } else {
      // Default display as HH:mm, dd/MM/YYYY
      return postDate.toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
      });
  }
};

module.exports = userController
