const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

function initPassport(passport, getUserByUsername, getUserById){
  const authenticateUser = async (username, password, done) => {
    const user = await getUserByUsername(username);
    
    if (user == null) {
      console.log("No user with that username")
      return done(null, false, {message: 'No user'})
    }


    try {
      if (await bcrypt.compare(password, user.password)){
        return done(null, user);
      }
      else {
        console.log("Incorrect password")
        return done(null, false, {message : 'Wrong password.'});
      }
    } catch (e) {
      return done(e);
    }
  }

  passport.use(new LocalStrategy({usernameField: 'username'},  authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
      return done(null, getUserById(id))
  });
}


module.exports = initPassport
