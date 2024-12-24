const editProfileRouter = require('express').Router();
const {loadData, editProfile} = require("../controllers/editProfileController");

editProfileRouter.get("/", loadData);
editProfileRouter.post("/", editProfile);

module.exports = editProfileRouter;
