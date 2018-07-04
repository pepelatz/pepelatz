/* eslint-disable */
(function() {
  if (window.__livereload) return;
  window.__livereload = true;
  document.addEventListener('DOMContentLoaded', function() {
    var prefix =
      location.href
        .split('/')
        .slice(0, 3)
        .join('/') + '/';
    var urls = [];
    urls.push(document.location.href);
    for (var tag of document.getElementsByTagName('script')) {
      urls.push(tag.src);
    }
    for (var tag of document.getElementsByTagName('link')) {
      urls.push(tag.href);
    }
    urls = urls.map(function(i) {
      if (i.indexOf('?') >= 0) i = i.slice(0, i.indexOf('?'));
      return i;
    });
    urls = urls.filter(function(i) {
      if (!i.startsWith(prefix)) return false;
      if (i.indexOf('__dev_autoreload__') >= 0) return false;
      return true;
    });
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/__dev_autoreload__/watch');
    xhr.send(null);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        location.reload();
      }
    };
  });
})();

/* eslint-enable */
