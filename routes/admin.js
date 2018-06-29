const express = require('express');
const router = express.Router();
const showdown = require('showdown');

const config = require('../config');
const models = require('../models');

router.get('/', async (req, res, next) => {
  const { userId, userLogin, userRole } = req.session;

  if (!userId || !userLogin || userRole !== 'admin') {
    res.redirect('/');
    return;
  }

  res.send('Hello World!');
});

// users posts
router.get('/posts/:page*?', async (req, res) => {
  const { userId, userLogin, userRole } = req.session;
  const perPage = +config.PER_PAGE;
  const page = req.params.page || 1;

  try {
    let posts = await models.Post.find({
      status: 'moderated'
    })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate('owner')
      .populate('uploads')
      .sort({ createdAt: -1 });

    const converter = new showdown.Converter();

    posts = posts.map(post => {
      let body = post.body;
      if (post.uploads.length) {
        post.uploads.forEach(upload => {
          body = body.replace(
            `image${upload.id}`,
            `/${config.UPLOADS_ROUTE}${upload.path}`
          );
        });
      }

      return Object.assign(post, {
        body: converter.makeHtml(body)
      });
    });

    // console.log(posts);

    const count = await models.Post.count();

    res.render('admin/posts', {
      posts,
      current: page,
      pages: Math.ceil(count / perPage),
      user: {
        id: userId,
        login: userLogin,
        role: userRole
      }
    });
  } catch (error) {
    throw new Error('Server Error');
  }
});

module.exports = router;
