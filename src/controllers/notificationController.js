const notificationController = {};
const {User, Post, Notification} = require("../models");

async function fetchAllNotifications(userId){
  try {
    const notifications = await Notification.findAll({
      include : [{
        model : User,
        as: "owner",
        attributes : ['username', 'fullName', 'profilePicture'],
      }, {
        model : Post,
        attributes : ['id'],
        required : false
      }],
      order: [['createdAt', 'DESC']],
      where: {id: userId}
    });

    return notifications.map(noti => {
      const notiData = noti.get({plain : true});
      return {
        id: notiData.id,
        avatar: notiData.User.profilePicture || 'images/avatar.png',
        hyperlink: notiData.Post.postId || notiData.User.username,
        content: notiData.content,
        timestamp: notiData.createdAt,
        isRead: notiData.isRead
      }
    })
  }
  catch (e){
    console.error(e);
    console.log("Error fetching notifications");
    return [];
  }
}

notificationController.loadData = async (req, res) => {
  let thisUser = await req.user;
  if (thisUser != null)
    res.locals.username = await thisUser.username;
  else
    return res.redirect("/login");

  res.locals.isLoggedIn = true;
  res.locals.notifications = [];
  res.render("notifications");
}

notificationController.removeNotification = async (req, res) => {
  let notiId = req.params.id;
  try {
    await Notification.destroy({where: {id : notiId}});
    res.redirect("/notifications");
  } catch (e){
    console.error(e);
    res.status(500).send("Can't delete notification.");
  }
}

notificationController.seenNotification = async (req, res) => {
  let notiId = req.params.id;
  try {
    await Notification.update({isRead: true}, {where: {id : notiId}});
    res.redirect("/notifications");
  } catch (e){
    console.error(e);
    res.status(500).send("Can't seen notification.");
  }
}

// notificationController.commentNotification = async (req, res) => {
//   let thisUser = await req.user;
//   if (thisUser == null)
//     return res.status(500).send("Error on notifying");
//
//   try {
//     const {postId} = req.params;
//     await Notification.create({
//       postId: postId,
//       otherId: thisUser.id,
//       content: " has commented on your post.",
//       isRead: false
//     })
//   } catch (e){
//     console.error(e);
//     res.status(500).send("Error on notifying");
//   }
// }
//
// notificationController.reactNotification = async (req, res) => {
//   let thisUser = await req.user;
//   if (thisUser == null)
//     return res.status(500).send("Error on notifying");
//
//   try {
//     const {postId} = req.params;
//     await Notification.create({
//       postId: postId,
//       otherId: thisUser.id,
//       content: " has reacted on your post.",
//       isRead: false
//     })
//   } catch (e){
//     console.error(e);
//     res.status(500).send("Error on notifying");
//   }
// }
//
// notificationController.followNotification = async (req, res) => {
//   let thisUser = await req.user;
//   if (thisUser == null)
//     return res.status(500).send("Error on notifying");
//
//   try {
//     const {otherId} = req.params;
//     await Notification.create({
//       userId: otherId,
//       otherId: thisUser.id,
//       content: " has followed you!",
//       isRead: false
//     })
//   } catch (e){
//     console.error(e);
//     res.status(500).send("Error on notifying");
//   }
// }

module.exports = notificationController;
