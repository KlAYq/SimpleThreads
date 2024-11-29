const router = require("express").Router()
const { showProfile, showProfileEdit ,showPostDetail } = require("../controllers/controller")

// SHOW USER PROFILE
router.get("/", showProfile)
// SHOW POST DETAIL
router.get("/post/:id", showPostDetail)

module.exports = router