const userRouter = require("express").Router()
const { followUser, unfollowUser, showFollows } = require("../controllers/followController")
const { init, showProfile, showProfileEdit ,showPostDetail, verifyUser } = require("../controllers/userController")

// SHOW USER PROFILE
userRouter.get("/", init)
userRouter.get("/", showProfile)

// SHOW POST DETAIL
userRouter.get("/post/:id", showPostDetail)

// FOLLOW FUNCTION
userRouter.post("/follow/:id", followUser)
userRouter.post("/unfollow/:id", unfollowUser)
userRouter.get("/follows", showFollows)

module.exports = userRouter