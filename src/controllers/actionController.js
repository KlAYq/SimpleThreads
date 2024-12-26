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

  let confirmDate = getResetRequest.createdAt;
  if (Date.now() - confirmDate >= 1000 * 60 * 2){
    await ResetInstance.destroy({where: {resetToken : reset_token}});
    return res.render("error", {layout: false, errorText : "Link expired."});
  }

  res.render("auth/change_password", {layout: false});
}

actionController.changePasswordConfirm = async (req, res, next) => {
  const reset_token = req.params.reset_token;
  const {password, confirmPassword} = req.body;

  const getResetRequest = await ResetInstance.findOne({where: {resetToken: reset_token}});

  if (getResetRequest == null){
    res.render("error", {layout: false, errorText : "Invalid link."});
  }

  if (password !== confirmPassword){
    console.error("New passwords does not match.");
    res.redirect(`/account-settings/change-password/${reset_token}`);
  }
  else {
    const newHashedPassword = await bcrypt.hash(password, 10);
    await User.update({password: newHashedPassword},{where: {id : getResetRequest.userId}});
    await ResetInstance.destroy({where: {resetToken : reset_token}});

    req.logOut( (error) =>{
      if (error) { return next(error); }
      res.redirect('/');
    });
  }
}

actionController.resetPassword = async (req, res, next) => {
  const thisUser = await req.user;

  if (thisUser == null){
    res.redirect("home")
    return;
  }

  let token;
  do {
    token = crypto.randomBytes(48).toString('hex');
  } while (await ResetInstance.findOne({where: {resetToken: token}}) != null)

  await ResetInstance.destroy({where:
      {userId: thisUser.id}
  })

  await ResetInstance.create({
    resetToken: token,
    userId: thisUser.id
  })

  await sendResetMail(thisUser.email, token);

  let coveredEmail = thisUser.email;
  const splitMail = coveredEmail.split("@");
  const prefix = splitMail[0][0] + splitMail[0][1] + splitMail[0][2] +  "*".repeat(splitMail[0].length - 3);
  coveredEmail = prefix + "@" + splitMail[1];

  req.logOut( (error) =>{
    if (error) { return next(error); }
    res.render("auth/reset_password", {layout: "auth.hbs", email: coveredEmail});
  });
}

module.exports = actionController;
