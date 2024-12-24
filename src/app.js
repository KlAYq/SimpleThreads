if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

const express = require('express')
const viewEngine = require('express-handlebars')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const nodeMailer = require('nodemailer');
const crypto = require('crypto');


const app = express()
const port = 4000
const { posts } = require('./public/temp/posts')
const initPpt = require('./passport-config')
const sendConfirmMail = require('./node-mailer-config');
const {render} = require("express/lib/application");
const User = require('./models').User;
const ConfirmInstance = require('./models').ConfirmInstance;

// Helper functions
function isValidUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_]{6,}$/; // Alphanumeric and underscores, min 6 characters
  return usernameRegex.test(username);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format validation
  return emailRegex.test(email);
}

// TEMPORARY SESSION USER
// const sessionUser = "faker.t1"

async function getUserByUsername(username) {

  // const result = await pool.query('SELECT * FROM public."Users" WHERE username = $1', [username]);
  // if (result.rows.length === 0) {
  //   return null;
  // }
  // return result.rows[0];
  return await User.findOne({where: {username: username}});
}

async function getUserById(id) {
  // const result = await pool.query('SELECT * FROM public."Users" WHERE id = $1', [id]);
  // if (result.rows.length === 0) {
  //   return null;
  // }
  // return result.rows[0];
  return await User.findOne({where: {id : id}});
}

initPpt(passport,
  // Replace with real database
  getUserByUsername,
  getUserById
)


app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({extended: false}));
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}))
app.use(methodOverride('_method'))

app.engine(
    "hbs",
    viewEngine.engine({
        layoutsDir: __dirname + "/views/layouts",
        partialsDir: __dirname + "/views/partials",
        extname: "hbs",
        defaultLayout: "layout",
        helpers: {
            getIconClass: (page, clss) => {
                const classes = new Map([
                    ["home", ["bi-house", "bi-house-fill"]],
                    ["create-post", ["bi-plus-square", "bi-plus-square-fill"]],
                    ["notifications", ["bi-bell", "bi-bell-fill"]],
                    ["session-user", ["bi-person", "bi-person-fill"]],
                ]);
                return classes.get(clss)[clss == page ? 1 : 0]
            }
        }
    })
)

app.set("view engine", "hbs");

app.get("/", (req, res) => {
    res.redirect("/home");
})

// ADD SESSION USER TO DISPLAY SIDEBAR / NAVBAR
app.get("/home", async (req, res) => {
    res.locals.page = "home";
    let thisUser = await req.user;
    if (thisUser != null){
      res.locals.username = await thisUser.username;
    }
    res.locals.isLoggedIn = thisUser != null;

    res.locals.posts = posts;
    res.render("home");
})

app.get("/create-post", checkAuthenticated, async (req, res) => {
    res.locals.page = "create-post";
  let thisUser = await req.user;
  if (thisUser != null)
    res.locals.username = await thisUser.username;
    res.render("create-post");
})

app.get("/notifications", checkAuthenticated, async (req, res) => {
    res.locals.page = "notifications";
  let thisUser = await req.user;
  if (thisUser != null)
    res.locals.username = await thisUser.username;
    res.render("notifications");
})

// app.get("/my-profile", (req, res) => {
//     res.locals.page = "my-profile"
//     res.render("profile")
// })

// Auth
app.get("/login", checkNotAuthenticated, async (req, res) => {
  res.render("auth/login", {layout: false});
})

// app.get("/post_view/:id", (req, res) => {
//     let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
//     res.locals.posts = posts.filter(obj =>{
//         return obj.postId == id;
//     })[0]
//     res.locals.isPostView = true
//     res.render("post_view");
// })

// Auth
app.get("/login", checkNotAuthenticated, async (req, res) => {
  res.render("login");
})

app.get("/register", checkNotAuthenticated, async (req, res) => {
  res.render("auth/register", {layout: false});
})

app.post("/login", checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}))

app.post("/register", checkNotAuthenticated, async (req, res) => {
  const {username, email, password, confirmPassword} = req.body;

  try {
    // Input validation
    if (!isValidUsername(username)) {
      // res.render('/register', { message: 'An error occurred, please try again.', type: 'error' });
      console.log('invalid username');
      return res.redirect('/register');
    }
    if (!isValidEmail(email)) {
      console.log('invalid email');
      // res.render('/register', { message: 'An error occurred, please try again.', type: 'error' });
      return res.redirect('/register');
    }
    if (password !== confirmPassword) {
      console.log('wrong confirm password');
      // res.render('/register', { message: 'An error occurred, please try again.', type: 'error' });
      return res.redirect('/register');
    }
    // const userExists = await pool.query('SELECT * FROM public."Users" WHERE username = $1', [username]);
    const userExists = await User.findOne({where: {username: username}});
    if (userExists != null) {
      console.log('username already exist');
      // res.render('/register', { message: 'An error occurred, please try again.', type: 'error' });
      return res.redirect('/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // const result = await pool.query('SELECT * FROM public."Users"');

    let token;
    token = crypto.randomBytes(48).toString('hex');

    await ConfirmInstance.create({
      confirmToken: token,
      email: email,
      username: username,
      password: hashedPassword
    })

    await sendConfirmMail(email, token);
    // console.log("Create account successfully");
    res.redirect('/confirm_email');
  } catch (error) {
    console.error('Error during registration:', error);
    res.redirect('/register');
  }
})

app.get("/confirm_email", (req, res)=>{
  res.render("auth/confirm_email", {layout: false})
})

app.get("/return_to_login", (req, res)=>{
  res.render("auth/return_to_login", {layout: false})
})

app.use('/confirmation_key/:confirmation_key', (req, res, next) => {
  req.confirmation_key = req.params.confirmation_key;
  next();
}, require("./routes/verifyRouter"))

app.delete('/logout', (req, res, next) => {
  req.logOut( (error) =>{
    if (error) { return next(error); }
    res.redirect('/');
  });
  // res.redirect('/login');
})

function checkAuthenticated(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }

  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next){
  if (!req.isAuthenticated()){
    return next();
  }

  res.redirect('/');
}

// ROUTER FOR USERNAME AND POST
app.use("/:username", (req, res, next) => {req.username = req.params.username; next()}, require("./routes/userRouter"));

app.listen(port, () => console.log(`Simple Threads starting.... port: ${port}`))
