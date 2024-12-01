const controller = {}
const { users } = require('../public/temp/users')
const { posts } = require('../public/temp/posts')

controller.showProfile = (req, res) => {
    let user = users.filter(obj =>{
        return obj.username == req.username;
    })[0]
    if (user) {
        res.locals.user = user
        // DETERMINE DISPLAY FOR SESSION USER / OTHER USER
        if (req.sessionUser == req.username) {
            res.locals.isSessionUser = true
            res.locals.page = 'session-user'
        }
        res.render("profile")
    }
    else
        res.send("user not found")
}

controller.showPostDetail = (req, res) => {
    let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
    res.locals.posts = posts.filter(obj =>{
        return obj.postId == id;
    })[0]
    res.locals.isPostView = true
    res.locals.username = req.sessionUser
    res.render("post-view");
}

module.exports = controller