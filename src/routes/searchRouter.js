const searchRouter = require("express").Router()
const { showList } = require("../controllers/searchController")

searchRouter.get("/", showList)

module.exports = searchRouter;