const searchController = {}
const { User, Follow } = require("../models");
const { Op } = require('sequelize');

searchController.showList = async (req, res) => {
    let q = req.query.q;
    let currentUser = await req.user;
    if (currentUser != null) {
        let limit = 20;
        let options = {
            where: { id: { [Op.ne]: currentUser.id } },
            include: [{
                model: Follow,
                as: 'Following',
                required: false,
                where: {
                    followingUserId: currentUser.id,
                },
                attributes: ['id']
            }],
            attributes: ['id', 'username', 'fullName', 'profilePicture', 'description']
        };

        if (q != null && q.trim() !== "") {
            options.where[Op.or] = {
                username: { [Op.iLike]: `%${q.trim()}%` },
                fullName: { [Op.iLike]: `%${q.trim()}%` }
            }
        }

        let users = await User.findAll({...options, limit})
        users = users.map(user => {
            return {
                ...user.toJSON(),
                following: user.Following.length > 0,
              };
        })
        res.locals.users = users
    }
    res.locals.isLoggedIn = currentUser != null;
    res.render("search")
}

module.exports = searchController;
