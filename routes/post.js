const express = require('express');
const router = express.Router();

// const models = require('../models');

// GET for add
router.get('/add', (req, res) => {
  const id = req.session.userId;
  const login = req.session.userLogin;

  res.render('post/add', {
    user: {
      id,
      login
    }
  });
});

// POST is register
router.post('/add', (req, res) => {
  console.log(req.body);
  res.json({
    ok: true
  });
});

module.exports = router;
