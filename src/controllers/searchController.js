const searchController = {}
const User = require("../models").User;

searchController.showList = async (req, res) => {
    let q = req.query.q;
    let users;
    if (q.trim() != "") {
        users = await User.findAll({limit: 20, where: { username: q }})
    } else {
        users = await User.findAll({limit: 20})
    }
    res.locals.users = users
    res.render("search")
    console.log(users)
}

module.exports = searchController;