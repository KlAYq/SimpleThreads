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
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const {upload, uploadResult} = require('./image-upload-config');

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
const sendConfirmMail = require('./node-mailer-config');
const {render} = require("express/lib/application");
const { User, Post, Comment, Reaction, Notification } = require('./models');
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

if (!fs.existsSync("./uploads")){
  fs.mkdirSync("./uploads");
}

async function getUserByUsername(username) {
  return await User.findOne({where: {username: username}});
}

async function getUserById(id) {
  return await User.findOne({where: {id : id}});
}

initPpt(passport,
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
            }
        }
    })
)

app.set("view engine", "hbs");

app.get("/", (req, res) => {
    res.redirect("/home");
})

// ADD SESSION USER TO DISPLAY SIDEBAR / NAVBAR

// Helper function to format timestamp
const formatTimestamp = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Function to fetch all posts with related data(like/ comment count, fullname, username)
async function fetchAllPosts() {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['username', 'fullName', 'profilePicture'],
        },
        {
          model: Comment,
          attributes: ['id'],
        },
        {
          model: Reaction,
          where: { type: 'LIKE' },
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return posts.map(post => {
      const postData = post.get({ plain: true });
      return {
        postId: postData.id,
        username: postData.User.username,
        name: postData.User.fullName,
        avatar: postData.User.profilePicture || 'images/avatar.png', // replace with real avatar here
        timestamp: formatTimestamp(postData.createdAt),
        description: postData.description,
        imagePath: postData.image ? [postData.image] : ["images/sample01.jpg", "images/sample01.jpg"], // replace with real images here
        likeCount: postData.Reactions.length,
        commentCount: postData.Comments.length,
      };
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

app.get("/home", async (req, res) => {
  res.locals.page = "home";
  let thisUser = await req.user;
  if (thisUser != null) {
    res.locals.username = await thisUser.username;
  }
  res.locals.isLoggedIn = thisUser != null;
  try {
    const posts = await fetchAllPosts();
    res.render("home", { posts });
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
  if (!res.locals.avatar)
    res.locals.avatar = 'images/temp.png'; // default avatar here
  res.locals.name = await thisUser.fullName;
  res.locals.username = await thisUser.username;
  res.render("create-post");
})

app.post("/create-post", checkAuthenticated, async function (req, res, next)  {
  try {
    let thisUser = await req.user;
    const userId = await thisUser.id;
    const currentTime = new Date();
    const result = await Post.findAll();

    const newPostId = result.length + 1;

    await upload(req, res, async function(err) {
      let resultUrl;
      if (await req.file != null){
        let filepath = "./uploads/" + req.file.filename;
        resultUrl = await uploadResult(filepath, [{quality : 'auto', fetch_format: 'auto'}]);
        fs.unlink(filepath, (e) => {
          if (e) {
            console.log(e);
          }
        })
      } else {
        resultUrl = null;
      }

      const { description } = req.body;
      // Yes, this does need to be here
      const newPost = await Post.create({
        id: newPostId,
        description: description,
        createdAt: currentTime,
        updatedAt: currentTime,
        userId: userId,
        image: resultUrl,
      });

      console.log('New post created:', newPost);
      res.redirect('/home');
    })
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).send('An error occurred while creating the post');
  }
});

async function fetchAllNotifications(){
  try {
    const notifications = await Notification.findAll({
      include : [{
        model : User,
        attributes : ['username', 'fullName', 'profilePicture']
      }, {
        model : Post,
        attributes : ['id'],
        required : false
      }],
      order: [['createdAt', 'DESC']],
    });

    return notifications.map(noti => {
      const notiData = noti.get({plain : true});
      return {
        id: notiData.id,
        avatar: notiData.User.profilePicture || 'images/avatar.png',
        hyperlink: notiData.Post.postId || notiData.User.username,
        content: notiData.content,
        timestamp: notiData.createdAt,
        isRead: notiData.isRead
      }
    })
  }
  catch (e){
    console.error(e);
    console.log("Error fetching notifications");
    return [];
  }
}

app.get("/notifications", checkAuthenticated, async (req, res) => {
    res.locals.page = "notifications";
  let thisUser = await req.user;
  if (thisUser != null)
    res.locals.username = await thisUser.username;
  res.locals.isLoggedIn = thisUser != null;
  res.locals.notifications = await fetchAllNotifications();
  res.render("notifications");
})

app.delete("/notifications/:id", async (req, res) => {
  let notiId = req.params.id;
  try {
    await Notification.destroy({where: {id : notiId}});
    res.redirect("/notifications");
  } catch (e){
    console.error(e);
    res.status(500).send("Can't delete user.");
  }
})

// Auth
app.get("/login", checkNotAuthenticated, async (req, res) => {
  res.render("auth/login", {layout: false});
})

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

app.use("/search", require("./routes/searchRouter"))

app.use("/edit-profile", async (req, res, next) => {next();}, require("./routes/editProfileRouter"));

// ROUTER FOR USERNAME AND POST
app.use("/:username", async (req, res, next) => {
  req.username = req.params.username;
  next();
}, require("./routes/userRouter"));





app.listen(port, () => console.log(`Simple Threads starting.... port: ${port}`))

module.exports = {
  checkAuthenticated,
  checkNotAuthenticated
}
