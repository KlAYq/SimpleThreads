const notificationRouter = require("express").Router();
const {loadData, removeNotification, seenNotification, doRemoveSeenNotification, doRemoveAllNotification, seenAllNotification} = require("../controllers/notificationController")

notificationRouter.get("/", loadData);
notificationRouter.post("/:id", seenNotification);
notificationRouter.post("/seen/all", seenAllNotification);

notificationRouter.delete("/:id", removeNotification);
notificationRouter.delete("/remove/seen", doRemoveSeenNotification);
notificationRouter.delete("/remove/all", doRemoveAllNotification);



module.exports = notificationRouter;
