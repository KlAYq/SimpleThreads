const { ConfirmInstance } = require("../models");
const User = require("../models").User;
const verifyController = {};

verifyController.verifyUser = async (req, res) => {

  let confirmation = await req.confirmation_key;
  let result = await ConfirmInstance.findOne({where : {confirmToken: confirmation}});

  if (result != null){
    const userResult = await User.findAll();

    let confirmDate = result.createdAt;
    if (Date.now() - confirmDate >= 1000 * 60 * 2){
      await ConfirmInstance.destroy({where : {confirmToken: confirmation}});
      return res.render("error", {layout: false, errorText : "Link expired."});
    } // 2 minutes

    // Check if result.rows is defined and has a length
    const newId = userResult.length + 1; // Default to 1 if no rows found

    await User.create({
      id: newId,
      email: result.email,
      username: result.username,
      password: result.password,
      profilePicture: "https://res.cloudinary.com/dg2mnbjbc/image/upload/v1735137493/ebxsypux55w41iqgiqwt.png",
      fullName: "",
    })

    await ConfirmInstance.destroy({where : {confirmToken: confirmation}});
  res.render('auth/return_to_login', {layout : "auth.hbs"});
  }
  else
    res.render("error", {layout: false, errorText : "Link expired."});
}

module.exports = verifyController
