const postRouter = require("express").Router()
const {loadPost, commentPost, likePost} = require("../controllers/postController");

postRouter.get("/:id", loadPost);
postRouter.post("/:id/like", likePost);
postRouter.post("/:postId/comment", commentPost);

module.exports = postRouter;
