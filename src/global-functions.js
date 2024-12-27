const {Follow, User, Comment, Reaction, Post} = require("./models");
const {Sequelize} = require("sequelize");
const globalFunctions = {};

// Helper function to format timestamp
globalFunctions.formatTimestamp = (date) => {
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


globalFunctions.fetchAllPosts = async (thisUser) => {
  try {
    // get followed user id to prioritize display posts from them first
    let followedUserIds = [];
    if (thisUser) {
      const followedUsers = await Follow.findAll({
        attributes: ['followedUserId'],
        where: { followingUserId: thisUser.id },
      });
      followedUserIds = followedUsers.map(follow => follow.followedUserId);
    }

    // Normal query posts, ordered by time created desc
    let queryOptions = {
      include: [
        {
          model: User,
          attributes: ['username', 'fullName', 'profilePicture'],
        },
        {
          model: Comment,
          attributes: ['id'],
        },
        {
          model: Reaction,
          where: { type: 'LIKE' },
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    };
    // if the user is as least following someone, sort by posts from them first, then sort by time.
    if (followedUserIds.length > 0) {
      queryOptions.order = [
        [Sequelize.literal(`CASE WHEN "Post"."userId" IN (${followedUserIds.join(',')}) THEN 0 ELSE 1 END`), 'ASC'],
        ['createdAt', 'DESC']
      ];
    }
    const posts = await Post.findAll(queryOptions);

    return posts.map(post => {
      const postData = post.get({ plain: true });
      return {
        postId: postData.id,
        username: postData.User.username,
        name: postData.User.fullName,
        avatar: postData.User.profilePicture || 'images/avatar.png',
        timestamp: globalFunctions.formatTimestamp(postData.createdAt),
        description: postData.description,
        imagePath: postData.image ? postData.image.split('<>') : [],
        likeCount: postData.Reactions.length,
        commentCount: postData.Comments.length,
        isLiked: thisUser ? postData.Reactions.some(reaction => reaction.userId === thisUser.id) : false,
      };
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}


globalFunctions.getUserByUsername = async (username) => {
  return await User.findOne({where: {username: username}});
}

globalFunctions.getUserById = async (id) => {
  return await User.findOne({where: {id : id}});
}

globalFunctions.getUserByEmail = async (email) => {
  return await User.findOne({where: {email: email}});
}

globalFunctions.checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()){
    return next();
  }

  res.redirect('/login');
}

globalFunctions.checkNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

// Helper functions
globalFunctions.isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{6,30}$/; // Alphanumeric and underscores, min 6 characters
  return usernameRegex.test(username);
}

globalFunctions.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format validation
  return emailRegex.test(email);
}



module.exports = globalFunctions;
