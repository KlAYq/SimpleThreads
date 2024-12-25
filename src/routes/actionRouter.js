const actionRouter = require("express").Router()
const {changePassword, resetPassword, actionMenu, changePasswordConfirm} = require("../controllers/actionController");

actionRouter.get("/", actionMenu);
actionRouter.get("/change-password/:reset_token", changePassword);
actionRouter.get("/reset-password", resetPassword);

actionRouter.post("/change-password/:reset_token", changePasswordConfirm);


actionRouter.delete('/logout', (req, res, next) => {
  req.logOut( (error) =>{
    if (error) { return next(error); }
    res.redirect('/');
  });
  // res.redirect('/login');
})


module.exports = actionRouter;
