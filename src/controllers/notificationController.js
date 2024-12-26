const notificationController = {};
const {User, Post, Notification} = require("../models");

const formatTimestamp = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

async function fetchAllNotifications(userId){
  try {
    const notifications = await Notification.findAll({
      include : [{
        model : User,
        as: "owner",
        attributes : ['id'],
        where: {id: userId}
      }, {
        model : Post,
        attributes : ['id'],
        required : false
      } , {
        model : User,
        as: "other",
        attributes : ['username', 'fullName', 'profilePicture'],
      }],
      order: [['createdAt', 'DESC']],
    });

    return notifications.map(noti => {
      const notiData = noti.get({plain : true});
      let link;
      if (notiData.Post == null)
        link = notiData.other.username;
      else
        link = "post/" + notiData.Post.id;

      const message = notiData.other.username + notiData.content;

      return {
        id: notiData.id,
        avatar: notiData.other.profilePicture,
        hyperlink: link,
        content: message,
        timestamp: formatTimestamp(notiData.createdAt),
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
  res.locals.notifications = await fetchAllNotifications(thisUser.id);
  // console.log(res.locals.notifications);
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

module.exports = notificationController;
