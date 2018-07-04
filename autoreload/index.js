const watch = require('node-watch'); // eslint-disable-line
const expressModifyResponse = require('express-modify-response'); // eslint-disable-line
const path = require('path');
// eslint-disable-next-line
module.exports = function expressDevAutoReload(options) {
  var queue = [];
  // eslint-disable-next-line
  var watcher = watch(
    path.join(__dirname, '..', 'views'),
    { recursive: true },
    (evt, name) => {
      for (var i of queue) {
        try {
          i(name);
        } catch (e) {
          console.log(e.stack);
        }
      }
      queue = [];
    }
  );
  return function expressDevAutoReload(req, res, next) {
    if (req.path == '/__dev_autoreload__/livereload.js') {
      res.sendFile(__dirname + '/livereload.js');
      return;
    }
    if (req.path == '/__dev_autoreload__/watch') {
      queue.push(() => {
        res.send('ok');
      });
      return;
    }
    expressModifyResponse(
      (req, res) => {
        return (
          res.getHeader('Content-Type') &&
          res.getHeader('Content-Type').startsWith('text/html')
        );
      },
      (req, res, body) => {
        body = body.toString();
        var pos = body.search(new RegExp('</ *body *>', 'i'));
        if (pos == -1) pos = body.length;
        body =
          body.slice(0, pos) +
          '<script src="/__dev_autoreload__/livereload.js"></script>\n' +
          body.slice(pos);
        return body;
      }
    )(req, res, next);
  };
};
