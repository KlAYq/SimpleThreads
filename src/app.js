const express = require('express')
const viewEngine = require('express-handlebars')
const app = express()
const port = 4000
const { posts } = require('./public/temp/posts')

app.use(express.static(__dirname + "/public"))

app.engine(
    "hbs",
    viewEngine.engine({
        layoutsDir: __dirname + "/views/layouts",
        partialsDir: __dirname + "/views/partials",
        extname: "hbs",
        defaultLayout: "layout",
        helpers: {
            getClassForPage: (page, clss) => {
                const classes = new Map([
                    // Icon class
                    ["home", ["bi-house", "bi-house-fill"]],
                    ["create-post", ["bi-plus-square", "bi-plus-square-fill"]],
                    ["notifications", ["bi-bell", "bi-bell-fill"]],
                    ["my-profile", ["bi-person", "bi-person-fill"]],
                    // Display class
                    ["post_view", ["d-none", ""]]
                ]);
                return classes.get(clss)[clss == page ? 1 : 0]
            }
        }
    })
)

app.set("view engine", "hbs")

app.get("/", (req, res) => {
    res.redirect("/home")
})

app.get("/home", (req, res) => {
    res.locals.page = "home"
    res.locals.posts = posts
    res.render("home")
})

app.get("/create-post", (req, res) => {
    res.locals.page = "create-post"
    res.render("create-post")
})

app.get("/notifications", (req, res) => {
    res.locals.page = "notifications"
    res.render("notifications")
})

app.get("/my-profile", (req, res) => {
    res.locals.page = "my-profile"
    res.render("my-profile")
})

app.get("/post_view/:id", (req, res) => {
    let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
    res.locals.posts = posts.filter(obj =>{
        return obj.postId == id;
    })
    res.locals.page = "post_view"
    res.render("post_view");
})


app.listen(port, () => console.log(`Simple Threads starting.... port: ${port}`))