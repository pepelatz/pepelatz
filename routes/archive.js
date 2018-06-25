const express = require('express');
const router = express.Router();
const moment = require('moment');
moment.locale('ru');
const showdown = require('showdown');

const config = require('../config');
const models = require('../models');

async function posts(req, res) {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const perPage = +config.PER_PAGE;
  const page = req.params.page || 1;

  try {
    let posts = await models.Post.find({
      status: 'published'
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
            `/${config.DESTINATION}${upload.path}`
          );
        });
      }

      return Object.assign(post, {
        body: converter.makeHtml(body)
      });
    });

    // console.log(posts);

    const count = await models.Post.count();

    res.render('archive/index', {
      posts,
      current: page,
      pages: Math.ceil(count / perPage),
      user: {
        id: userId,
        login: userLogin
      }
    });
  } catch (error) {
    throw new Error('Server Error');
  }
}

// routers
router.get('/', (req, res) => posts(req, res));
router.get('/archive/:page', (req, res) => posts(req, res));

router.get('/posts/:post', async (req, res, next) => {
  const url = req.params.post.trim().replace(/ +(?= )/g, '');
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!url) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  } else {
    try {
      const post = await models.Post.findOne({
        url,
        status: 'published'
      }).populate('uploads');

      if (!post) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
      } else {
        const comments = await models.Comment.find({
          post: post.id,
          parent: { $exists: false }
        });
        // .populate({
        //   path: 'children',
        //   populate: {
        //     path: 'children',
        //     populate: {
        //       path: 'children'
        //     }
        //   }
        // });

        // console.log(comments);

        //
        const converter = new showdown.Converter();

        let body = post.body;
        if (post.uploads.length) {
          post.uploads.forEach(upload => {
            body = body.replace(
              `image${upload.id}`,
              `/${config.DESTINATION}${upload.path}`
            );
          });
        }

        res.render('post/post', {
          post: Object.assign(post, {
            body: converter.makeHtml(body)
          }),
          comments,
          moment,
          user: {
            id: userId,
            login: userLogin
          }
        });
      }
    } catch (error) {
      throw new Error('Server Error');
    }
  }
});

// users posts
router.get('/users/:login/:page*?', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const perPage = +config.PER_PAGE;
  const page = req.params.page || 1;
  const login = req.params.login;

  try {
    const user = await models.User.findOne({
      login
    });

    let posts = await models.Post.find({
      owner: user.id
    })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .populate('uploads');

    const count = await models.Post.count({
      owner: user.id
    });

    const converter = new showdown.Converter();

    posts = posts.map(post => {
      let body = post.body;
      if (post.uploads.length) {
        post.uploads.forEach(upload => {
          body = body.replace(
            `image${upload.id}`,
            `/${config.DESTINATION}${upload.path}`
          );
        });
      }

      return Object.assign(post, {
        body: converter.makeHtml(body)
      });
    });

    res.render('archive/user', {
      posts,
      _user: user,
      current: page,
      pages: Math.ceil(count / perPage),
      user: {
        id: userId,
        login: userLogin
      }
    });
  } catch (error) {
    throw new Error('Server Error');
  }
});

module.exports = router;
