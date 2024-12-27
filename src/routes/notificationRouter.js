const notificationRouter = require("express").Router();
const {loadData, removeNotification, seenNotification, doRemoveSeenNotification, doRemoveAllNotification, seenAllNotification, goToNotification} = require("../controllers/notificationController")

notificationRouter.get("/", loadData);
notificationRouter.post("/:id", goToNotification);
notificationRouter.post("/seen/:id", seenNotification);
notificationRouter.post("/seen/all", seenAllNotification);

notificationRouter.delete("/:id", removeNotification);
notificationRouter.delete("/remove/seen", doRemoveSeenNotification);
notificationRouter.delete("/remove/all", doRemoveAllNotification);



module.exports = notificationRouter;
