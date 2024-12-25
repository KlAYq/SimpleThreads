const {upload, uploadResult} = require("../image-upload-config");
const fs = require("fs");
const {Op} = require("sequelize");
const editProfileController = {}
const User = require("../models").User;

editProfileController.loadData = async (req, res) => {
  const thisUser = await req.user;

  if (thisUser == null){
    res.redirect("/login")
    return;
  }

  res.locals.user = {
    username: thisUser.username,
    name: thisUser.fullName,
    avatar: await thisUser.profilePicture,
    bio: thisUser.description
  }
  res.render("edit-profile");
}

editProfileController.editProfile = async (req, res) => {
  const thisUser = await req.user;

  if (thisUser == null){
    res.render("home")
    return;
  }

  await upload(req, res, async function(err) {
    let resultUrl = thisUser.profilePicture;
    if (await req.file != null){
      let filepath = "./uploads/" + req.file.filename;
      resultUrl = await uploadResult(filepath, [{quality: 'auto', fetch_format: 'auto'}, {gravity: "auto", width: 400, height: 400, crop: "fill"}]);
      fs.unlink(filepath, (e) => {
        if (e) {
          console.log(e);
        }
      })
    } else {
      resultUrl = thisUser.profilePicture;
    }
    try {
      const {username, fullName, bio} = req.body;

      let sampleUser= await User.findOne({where: {username: username, id:{[Op.ne] : thisUser.id}}});

      if (sampleUser != null)
        throw Error("Already exist username");

      User.update({
        username : username,
        fullName : fullName,
        description : bio,
        profilePicture : resultUrl,
      }, {where : {id : thisUser.id}});

      res.redirect(`/${username}`);
    } catch (e){
      res.status(500).send("Can't update user.");
      console.error(e);
    }

  })
}

module.exports = editProfileController;
