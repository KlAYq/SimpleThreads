const notificationRouter = require("express").Router();
const {loadData, removeNotification, seenNotification, commentNotification, reactNotification, followNotification} = require("../controllers/notificationController")

notificationRouter.get("/", loadData);
notificationRouter.delete("/:id", removeNotification);
notificationRouter.post("/:id", seenNotification);
// notificationRouter.post("/comment/:postId", commentNotification);
// notificationRouter.post("/react/:postId", reactNotification);
// notificationRouter.post("/follow/:otherId", followNotification);


module.exports = notificationRouter;
