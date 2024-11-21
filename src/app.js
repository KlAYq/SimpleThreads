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
        defaultLayout: "layout"
    })
)

app.set("view engine", "hbs")

app.get("/", (req, res) => {
    res.redirect("/home")
})

app.get("/home", (req, res) => {
    res.render("home")
})

app.listen(port, () => console.log(`Simple Threads starting.... port: ${port}`))