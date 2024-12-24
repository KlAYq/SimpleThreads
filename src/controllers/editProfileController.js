const {upload, uploadResult} = require("../image-upload-config");
const fs = require("fs");
const editProfileController = {}
const User = require("../models").User;

editProfileController.loadData = async (req, res) => {
  const thisUser = await req.user;

  if (thisUser == null){
    res.render("home")
    return;
  }

  res.locals.user = {
    username: thisUser.username,
    name: thisUser.fullName,
    avatar: thisUser.profilePicture || 'images/avatar.png',
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
    let resultUrl;
    if (await req.file != null){
      let filepath = "./uploads/" + req.file.filename;
      resultUrl = await uploadResult(filepath, [{quality: 'auto', fetch_format: 'auto'}]);
      fs.unlink(filepath, (e) => {
        if (e) {
          console.log(e);
        }
      })
    } else {
      resultUrl = null;
    }
    try {
      const {username, fullName, bio} = req.body;

      let sampleUser= await User.findOne({where: {username: username}});

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
