const Comment = require("../models/commentsModel");

//依照餐廳的placeId搜尋所有評論
const getCommentsByRestaurant = async (req, res, next) => {
  try {
    const placeId = req.params.placeId;

    const restaurantComments = await Comment.find({ placeId });
    res.json(restaurantComments);
  } catch (err) {
    res.status(500).json({ message: "Cannot get comments by placeId" });
  }
};

//依照使用者userId搜尋所有評論
const getCommentsByUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    console.log(userId);

    const userComments = await Comment.find({ userId });
    res.json(userComments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Cannot get comments by userId" });
  }
};

//新增一筆評論
const createComment = async (req, res, next) => {
  try {
    const { userId, placeId, content, rating } = req.body;

    if (!userId || !placeId || !content || !rating) {
      res
        .status(400)
        .json({ message: "UserId, placeId, content, and rating are required" });
      return;
    }

    const newComment = new Comment(req.body);
    const savedComment = await newComment.save();
    res.json(savedComment);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Cannot post a new comment" });
  }
};

//更新一筆評論
const updateComment = async (req, res, next) => {
  const commentId = req.params.id;

  try {
    const { userId, placeId, content, rating } = req.body;

    if (!userId || !placeId || !content || !rating) {
      res
        .status(400)
        .json({ message: "UserId, placeId, content, and rating are required" });
      return;
    }

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      {
        ...req.body,
        updatedAt: new Date(),
      },
      { new: true },
      //回傳已更新的結果
    );
    res.json(comment);
  } catch (err) {
    res.status(400).json({ message: "Cannot update this comment" });
  }
};

//刪除一筆評論
const deleteComment = async (req, res, next) => {
  const commentId = req.params.id;

  try {
    await Comment.findByIdAndUpdate(commentId, {
      isDeleted: true,
      updatedAt: new Date(),
    });
    res.json({ message: "This comment is deleted" });
  } catch (err) {
    res.status(400).json({ message: "Cannot delete this comment" });
  }
};

//更新評論讚數
//前端直接提供新的讚數數字在body給後端更新
const updateLikes = async (req, res, next) => {
  const commentId = req.params.id;
  const newLikesCount = req.body.likes;

  try {
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      {
        likes: newLikesCount,
      },
      {
        new: true,
      },
    );
    res.json(comment);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Cannot update the likes count of this comment" });
  }
};

module.exports = {
  getCommentsByRestaurant,
  getCommentsByUser,
  createComment,
  updateComment,
  deleteComment,
  updateLikes,
};
