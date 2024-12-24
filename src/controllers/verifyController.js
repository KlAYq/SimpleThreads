const { ConfirmInstance } = require("../models");
const User = require("../models").User;
const verifyController = {};

verifyController.verifyUser = async (req, res) => {

  let confirmation = await req.confirmation_key;
  let result = await ConfirmInstance.findOne({where : {confirmToken: confirmation}});

  if (result != null){
    console.log("hello" + result);
    const userResult = await User.findAll();

    // Check if result.rows is defined and has a length
    const newId = userResult.length + 1; // Default to 1 if no rows found

    await User.create({
      id: newId,
      email: result.email,
      username: result.username,
      password: result.password
    })
  res.render('auth/return_to_login', {layout : false});
  }
  else
    res.send("Confirmation key doesn't exist.");
}

module.exports = verifyController
