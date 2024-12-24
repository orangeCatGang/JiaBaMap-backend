const express = require("express");
const router = express.Router();
const controller = require("../controllers/commentsController");

//依照餐廳的placeId搜尋所有評論
router.get("/restaurant/:placeId", controller.getCommentsByRestaurant);

//依照使用者userId搜尋所有評論
router.get("/user/:userId", controller.getCommentsByUser);

//新增一筆評論
router.post("/", controller.createComment);

//更新一筆評論
router.put("/:id", controller.updateComment);

//刪除一筆評論
router.delete("/:id", controller.deleteComment);

//更新讚數
//body直接提供更新後的數字
router.put("/likes/:id", controller.updateLikes);

module.exports = router;
