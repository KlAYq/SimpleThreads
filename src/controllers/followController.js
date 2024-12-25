const {Notification} = require("../models");
const followController = {}
const Follow = require("../models").Follow;

followController.followUser = async (req, res) => {
    const currentUser = await req.user;
    const targetUserId = req.params.id;

    try {
        await Follow.create({
            followingUserId: currentUser.id,
            followedUserId: targetUserId
        });

        await Notification.create({
          userId: targetUserId,
          otherId: currentUser.id,
          content: " has followed you!",
          isRead: false
        })
        res.status(200).send()
    } catch (error) {
        console.log(error)
        res.status(500).send("Can not follow user")
    }
}

followController.unfollowUser = async (req, res) => {
    const currentUser = await req.user;
    const targetUserId = req.params.id;

    try {
        let follow = await Follow.findOne({
            followingUserId: currentUser.id,
            followedUserId: targetUserId
        });
        await follow.destroy();
        res.status(200).send()
    } catch (error) {
        console.log(error)
        res.status(500).send("Can not unfollow user")
    }
}

module.exports = followController;
