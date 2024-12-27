const postController = {};
const {Post, User, Comment, Reaction, Notification} = require("../models");
const {formatTimestamp} = require("../global-functions");

// Fetch a single post with related data
async function fetchPost(postId, userId) {
  try {
    const post = await Post.findOne({
      where: { id: postId },
      include: [
        {
          model: User,
          attributes: ['username', 'fullName', 'profilePicture'],
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ['username', 'fullName', 'profilePicture'],
            },
          ],
          required: false,
        },
        {
          model: Reaction,
          where: { type: 'LIKE' },
          required: false,
        },
      ],
      order: [
        [Comment, 'createdAt', 'DESC']
      ]
    });

    if (!post) {
      return null;
    }

    const postData = post.get({ plain: true });

    return {
      postId: postData.id,
      username: postData.User.username,
      name: postData.User.fullName,
      avatar: postData.User.profilePicture || 'https://res.cloudinary.com/dg2mnbjbc/image/upload/v1735137493/ebxsypux55w41iqgiqwt.png',
      timestamp: formatTimestamp(postData.createdAt),
      description: postData.description,
      imagePath: postData.image ? postData.image.split('<>') : [],
      likeCount: postData.Reactions.length,
      commentCount: postData.Comments.length,
      isLiked: postData.Reactions.some(reaction => reaction.userId === userId),
      comments: postData.Comments.map(comment => ({
        avatar: comment.User.profilePicture || 'https://res.cloudinary.com/dg2mnbjbc/image/upload/v1735137493/ebxsypux55w41iqgiqwt.png',
        username: comment.User.username,
        fullname: comment.User.fullName,
        timestamp: formatTimestamp(comment.createdAt),
        text: comment.content,
      })),
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

postController.loadPost = async (req, res) => {
  const postId = req.params.id;
  let thisUser = await req.user;
  const userId = thisUser.id;
  res.locals.isLoggedIn = true;

  try {
    const post = await fetchPost(postId, userId);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    res.render("post-view", { posts: post });
  } catch (error) {
    console.error('Error rendering post view:', error);
    res.status(500).send('An error occurred while loading the post');
  }
}

postController.likePost = async (req, res) => {
  const postId = req.params.id;
  let thisUser = await req.user;
  const userId = await thisUser.id;

  try {
    const existingLike = await Reaction.findOne({
      where: { postId, userId, type: 'LIKE' }
    });

    if (existingLike) {
      await existingLike.destroy();
    } else {
      await Reaction.create({ postId, userId, type: 'LIKE' });

      const thisPost = await Post.findOne({where: {id: postId}});
      if (userId !== thisPost.userId){
        await Notification.create({
          postId: postId,
          otherId: userId,
          userId: thisPost.userId,
          content: " has reacted on your post.",
          isRead: false
        })
      }
    }

    const likeCount = await Reaction.count({
      where: { postId, type: 'LIKE' }
    });

    res.json({ likeCount, isLiked: !existingLike });
  } catch (error) {
    console.error('Error handling like:', error);
    res.status(500).json({ error: 'An error occurred while processing the like' });
  }
}

postController.commentPost = async function (req, res, next) {
  try {
    const postId = req.params.postId;
    let thisUser = await req.user
    const userId = thisUser.id;
    const content = req.body.content;

    const currentTime = new Date();
    const currentTimeFormated = formatTimestamp(currentTime);
    console.log("post: " + postId + ", userId: " + userId + ", content: " + content);
    const newComment = await Comment.create({
      content: content,
      createdAt: currentTime,
      updatedAt: currentTime,
      userId: userId,
      postId: postId
    });

    const thisPost = await Post.findOne({where: {id: postId}});
    if (userId !== thisPost.userId){
      await Notification.create({
        postId: postId,
        otherId: userId,
        userId: thisPost.userId,
        content: " has commented on your post.",
        isRead: false
      })
    }


    // Retrieve the comment data to send back
    const commentData = {
      username: thisUser.username,
      fullname: thisUser.fullName,
      avatar: thisUser.profilePicture,
      timestamp: currentTimeFormated,
      text: content
    };

    res.json({ success: true, commentData: commentData });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).send('An error occurred while creating the comment');
  }
}

module.exports = postController;
