// if (process.env.NODE_ENV != 'production'){
//   require('dotenv').config();
// }

const express = require('express')
const viewEngine = require('express-handlebars')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const app = express()
const port = 4000
const { posts } = require('./public/temp/posts')
const initPpt = require('./passport-config')

initPpt(passport,
  // Replace with real database
    email => {users.find(user => user.email === email)},
    id => {users.find(user => user.id === id)}
)

// Replace with real database
const users = [];

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({extended: false}));
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

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


// Auth
app.get("/login", (req, res) => {
  res.render("login");
})

app.get("/register", (req, res) => {
  res.render("register");
})

app.post("/login", passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}))



app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch (e){
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
  req.logOut();
  req.redirect('/login');
})

function checkAuthenticated(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }

  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next){
  if (!req.isAuthenticated()){
    return res.redirect('/home');
  }

  next();
}


app.listen(port, () => console.log(`Simple Threads starting.... port: ${port}`))
