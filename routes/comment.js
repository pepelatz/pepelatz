const express = require('express');
const router = express.Router();

const models = require('../models');

// POST is add
router.post('/add', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  console.log(req.body);

  if (!userId || !userLogin) {
    res.json({
      ok: false
    });
  } else {
    const post = req.body.post;
    const body = req.body.body;
    const parent = req.body.parent;

    try {
      if (!parent) {
        await models.Comment.create({
          post,
          body,
          owner: userId
        });
      } else {
        const parentComment = await models.Comment.findById(parent);
        if (!parentComment) {
          res.json({
            ok: false
          });
        }

        const comment = await models.Comment.create({
          post,
          body,
          parent,
          owner: userId
        });

        const children = parentComment.children;
        children.push(comment.id);
        parentComment.children = children;
        await parentComment.save();
      }
    } catch (error) {
      res.json({
        ok: false
      });
    }
  }
});

module.exports = router;
