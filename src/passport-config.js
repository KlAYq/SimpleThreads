const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initPassport(passport, getUserByUsername, getUserById) {
  const authenticateUser = async (username, password, done) => {
    const user = await getUserByUsername(username);
    
    if (user == null) {
      console.log("No user with that username")
      return done(null, false);
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        console.log("Incorrect password")
        return done(null, false);
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await getUserById(id);
      done(null, user);
    } catch (e) {
      done(e);
    }
  });
}

module.exports = initPassport;
