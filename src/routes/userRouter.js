const userRouter = require("express").Router()
const { init, showProfile, showProfileEdit ,showPostDetail, verifyUser } = require("../controllers/userController")

// SHOW USER PROFILE
userRouter.get("/", init)
userRouter.get("/", showProfile)

// SHOW POST DETAIL
userRouter.get("/post/:id", showPostDetail)

module.exports = userRouter