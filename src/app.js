const express = require('express')
const viewEngine = require('express-handlebars')
const app = express()
const port = 4000

app.use(express.static(__dirname + "/public"))

app.engine(
    "hbs",
    viewEngine.engine({
        layoutsDir: __dirname + "/views/layouts",
        partialsDir: __dirname + "/views/partials",
        extname: "hbs",
        defaultLayout: "layout",
        helpers: {
            getIcon: (page, icon) => {
                const icons = new Map([
                    ["home", ["bi-house", "bi-house-fill"]],
                    ["create-post", ["bi-plus-square", "bi-plus-square-fill"]],
                    ["notifications", ["bi-bell", "bi-bell-fill"]],
                    ["my-profile", ["bi-person", "bi-person-fill"]]
                ]);
                return icons.get(icon)[icon == page ? 1 : 0]
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

app.listen(port, () => console.log(`Simple Threads starting.... port: ${port}`))