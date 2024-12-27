require('dotenv').config({path: __dirname + "/../.env"});
const express = require('express')
const viewEngine = require('express-handlebars')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const nodeMailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');
const fsPromises = require('fs').promises;
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const {upload, uploadResult} = require('./image-upload-config');
const { Op, Sequelize } = require('sequelize');
const {
  fetchAllPosts,
  formatTimestamp,
  getUserByEmail,
  getUserById, getUserByUsername,
  checkAuthenticated, checkNotAuthenticated,
  isValidEmail, isValidUsername
} = require('./global-functions');

(async function() {
  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
  });
})();

const app = express()
const port = 4000;
const initPpt = require('./passport-config')
const {sendConfirmMail, sendResetMail} = require('./node-mailer-config');
const {render} = require("express/lib/application");
const { User, Post, Comment, Reaction, Notification, ResetInstance, ConfirmInstance, Follow} = require('./models');


if (!fs.existsSync("./uploads")){
  fs.mkdirSync("./uploads");
}

initPpt(passport,
  getUserByUsername,
  getUserById,
  getUserByEmail
)

app.use(express.json()); // for comment feature
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
        runtimeOptions: {
          allowProtoPropertiesByDefault: true
        },
        helpers: {
            getIconClass: (page, clss) => {
                const classes = new Map([
                    ["home", ["bi-house", "bi-house-fill"]],
                    ["create-post", ["bi-plus-square", "bi-plus-square-fill"]],
                    ["notifications", ["bi-bell", "bi-bell-fill"]],
                    ["session-user", ["bi-person", "bi-person-fill"]],
                ]);
                return classes.get(clss)[clss == page ? 1 : 0]
            },
            ifCond: (listSample, options) => {
              if ((listSample == null) || (listSample.length === 0))
                options.inverse(this);
              else
                options.fn(this);
            }
        }
    })
)

app.set("view engine", "hbs");

app.get("/", (req, res) => {
    res.redirect("/home");
})

app.get("/home", async (req, res) => {
  res.locals.page = "home";
  let thisUser = await req.user;
  if (thisUser != null) {
    res.locals.username = await thisUser.username;
  }
  res.locals.isLoggedIn = thisUser != null;
  try {
    const posts = await fetchAllPosts(thisUser);
    res.render("home", {posts});
  } catch (error) {
    console.error('Error rendering home page:', error);
    res.status(500).send('An error occurred while loading the home page');
  }
});

app.get("/create-post", checkAuthenticated, async (req, res) => {
  res.locals.page = "create-post";
  let thisUser = await req.user;
  if (thisUser != null)
    res.locals.avatar = await thisUser.profilePicture;
  res.locals.isLoggedIn = thisUser != null;

  res.locals.name = await thisUser.fullName;
  res.locals.username = await thisUser.username;
  res.render("create-post");
})

app.post("/create-post", checkAuthenticated, async function (req, res, next) {
  try {
    await upload(req, res, async function (err) {
      if (err) {
        console.error("Error uploading files:", err);
        return res.status(500).json({ success: false, message: "An error occurred while uploading images" });
      }

      let thisUser = await req.user;
      const userId = await thisUser.id;
      const currentTime = new Date();
      const result = await Post.findAll();

      const newPostId = result.length + 1;

      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        console.log("Total file num: " + req.files.length);
        const filePaths = req.files.map((file) => file.path);
        imageUrls = await uploadResult(filePaths, [
          { quality: "auto", fetch_format: "auto" },
        ]);

        for (const filePath of filePaths) {
          try {
            await fsPromises.unlink(filePath);
          } catch (err) {
            console.error("Error deleting file:", err);
          }
        }
      }

      const { description } = req.body;

      const newPost = await Post.create({
        id: newPostId,
        description: description,
        createdAt: currentTime,
        updatedAt: currentTime,
        userId: userId,
        image: imageUrls.join("<>"), // Join image URLs with '<>' separator
      });

      console.log("New post created:", newPost);
      res.json({ success: true, message: "Post created successfully", postId: newPostId});
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ success: false, message: "An error occurred while creating the post" });
  }
});

app.use("/notifications", (req, res, next) => {next();}, require("./routes/notificationRouter"))

// Auth
app.get("/login", checkNotAuthenticated, async (req, res) => {
  res.render("auth/login", {layout: "auth.hbs"});
})

app.get("/register", checkNotAuthenticated, async (req, res) => {
  res.render("auth/register", {layout: "auth.hbs"});
})

app.post("/login", checkNotAuthenticated, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('error', 'Incorrect login data');
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/home');
    });
  })(req, res, next);
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
  const {username, email, password, confirmPassword} = req.body;

  try {
    // Input validation
    if (!isValidUsername(username)) {
      // res.render('/register', { message: 'An error occurred, please try again.', type: 'error' });
      // console.log('invalid username');
      req.flash('error', 'Username not valid');
      return res.redirect('/register');
    }
    if (!isValidEmail(email)) {
      console.log('invalid email');
      // res.render('/register', { message: 'An error occurred, please try again.', type: 'error' });
      req.flash('error', 'Email not valid');
      return res.redirect('/register');
    }
    if (password !== confirmPassword) {
      console.log('wrong confirm password');
      // res.render('/register', { message: 'An error occurred, please try again.', type: 'error' });
      req.flash('error', 'Passwords does not match');
      return res.redirect('/register');
    }
    // const userExists = await pool.query('SELECT * FROM public."Users" WHERE username = $1', [username]);
    const userExists = await User.findOne({where: {username: username}});
    if (userExists != null) {
      console.log('Username already exist');
      // res.render('/register', { message: 'An error occurred, please try again.', type: 'error' });
      req.flash('error', 'Username already taken');
      return res.redirect('/register');
    }

    const emailExists = await User.findOne({where: {email: email}});
    if (emailExists != null) {
      console.log('Email already exist');
      // res.render('/register', { message: 'An error occurred, please try again.', type: 'error' });
      req.flash('error', 'An account already using this email');
      return res.redirect('/register');
    }

    const requestExistsUsername = await ConfirmInstance.findOne({where: {username: username}});
    if (requestExistsUsername != null) {
      console.log('username already exist');
      // res.render('/register', { message: 'An error occurred, please try again.', type: 'error' });
      req.flash('error', 'Username already taken');
      return res.redirect('/register');
    }

    const requestExistsEmail = await ConfirmInstance.findOne({where: {email: email}});
    if (requestExistsEmail != null) {
      console.log('email already exist');
      // res.render('/register', { message: 'An error occurred, please try again.', type: 'error' });
      req.flash('error', 'An account already using this email');
      return res.redirect('/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // const result = await pool.query('SELECT * FROM public."Users"');

    let token;
    do {
      token = crypto.randomBytes(48).toString('hex');
    } while (await ConfirmInstance.findOne({where: {confirmToken: token}}) != null)

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
  res.render("auth/confirm_email", {layout: "auth.hbs"})
})

app.get("/return_to_login", (req, res)=>{
  res.render("auth/return_to_login", {layout: "auth.hbs"})
})

app.use('/confirmation_key/:confirmation_key', (req, res, next) => {
  req.confirmation_key = req.params.confirmation_key;
  next();
}, require("./routes/verifyRouter"))

app.get("/forgot-password", checkNotAuthenticated, async (req, res) => {
  res.render("auth/forgot_password", {layout: "auth.hbs"})
})

app.post("/forgot-password", async (req, res) => {
  const {username} = req.body;

  if (username == null){
    req.flash('error', "Please enter an account");
    res.redirect("/forgot-password");
  }

  const getUser = await User.findOne({where: {[Op.or] : [{username: username}, {email: username}]}});
  if (getUser == null){
    req.flash('error', "Account does not exist");
    res.redirect("/forgot-password");
  }
  else{

    await ResetInstance.destroy({where:
        {userId: getUser.id}
    })

    let token;
    do {
      token = crypto.randomBytes(48).toString('hex');
    } while (await ResetInstance.findOne({where: {resetToken: token}}) != null)

    await ResetInstance.create({
      resetToken: token,
      userId: getUser.id
    })

    await sendResetMail(getUser.email, token);

    let coveredEmail = getUser.email;
    const splitMail = coveredEmail.split("@");
    const prefix = splitMail[0][0] + splitMail[0][1] + splitMail[0][2] +  "*".repeat(splitMail[0].length - 3);
    coveredEmail = prefix + "@" + splitMail[1];

    res.render("auth/reset_password", {layout: "auth.hbs", email: coveredEmail});
  }
})


app.delete('/logout', (req, res, next) => {
  req.logOut( (error) =>{
    if (error) { return next(error); }
    res.redirect('/');
  });
  // res.redirect('/login');
})

app.use("/search", require("./routes/searchRouter"))
app.use("/post", checkAuthenticated, require("./routes/postRouter"))
app.use("/edit-profile", checkAuthenticated, require("./routes/editProfileRouter"));
app.use("/account-settings", checkAuthenticated, require("./routes/actionRouter"))

// ROUTER FOR USERNAME AND POST
app.use("/:username", async (req, res, next) => {
  req.username = req.params.username;
  next();
}, require("./routes/userRouter"));

app.listen(port, () => console.log(`Simple Threads starting.... port: ${port}`))

app.get('*', function(req, res){
  res.render("error", {layout: false, errorText: "Page not found."});
});

module.exports = {
  checkAuthenticated,
  checkNotAuthenticated,
  formatTimestamp
}
