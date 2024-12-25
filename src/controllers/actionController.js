const actionController = {}
const User = require("../models").User;
const ResetInstance = require("../models").ResetInstance;
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const {sendResetMail} = require("../node-mailer-config");

actionController.actionMenu = async (req, res) => {
  const thisUser = await req.user;

  if (thisUser == null){
    res.redirect("home")
    return;
  }

  res.render("auth/account_settings", {layout: "auth.hbs"});
}

actionController.changePassword = async (req, res) => {
  const reset_token = req.params.reset_token;
  const getResetRequest = await ResetInstance.findOne({where : {resetToken : reset_token}});

  if (getResetRequest == null){
    res.render("error", {layout: false, errorText: "Reset request doesn't exist."});
    return;
  }

  res.render("auth/change_password", {layout: false});
}

actionController.changePasswordConfirm = async (req, res, next) => {
  const reset_token = req.params.reset_token;
  const {password, confirmPassword} = req.body;

  if (password !== confirmPassword){
    console.error("New passwords does not match.");
    res.redirect(`/account-settings/change-password/${reset_token}`);
  }
  else {
    const newHashedPassword = await bcrypt.hash(password, 10);
    const getResetRequest = await ResetInstance.findOne({where: {resetToken: reset_token}});

    await User.update({password: newHashedPassword},{where: {id : getResetRequest.userId}});
    await ResetInstance.destroy({where: {resetToken : reset_token}});

    req.logOut( (error) =>{
      if (error) { return next(error); }
      res.redirect('/');
    });
  }
}

actionController.resetPassword = async (req, res) => {
  const thisUser = await req.user;

  if (thisUser == null){
    res.redirect("home")
    return;
  }

  let token;
  token = crypto.randomBytes(48).toString('hex');

  await ResetInstance.destroy({where:
      {userId: thisUser.id}
  })

  await ResetInstance.create({
    resetToken: token,
    userId: thisUser.id
  })

  await sendResetMail(thisUser.email, token);

  let coveredEmail = thisUser.email;

  res.render("auth/reset_password", {layout: "auth.hbs", email: thisUser.email});
}

module.exports = actionController;
