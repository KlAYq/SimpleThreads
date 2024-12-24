const verifyRouter = require("express").Router();
const {verifyUser} = require("../controllers/verifyController")

verifyRouter.get("/", verifyUser);

module.exports = verifyRouter;
