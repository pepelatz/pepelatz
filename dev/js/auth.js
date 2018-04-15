/* eslint-disable no-undef */
$(function() {
  // toggle
  var flag = true;
  $('.switch-button').on('click', function(e) {
    e.preventDefault();

    if (flag) {
      flag = false;
      $('.register').show('slow');
      $('.login').hide();
    } else {
      flag = true;
      $('.login').show('slow');
      $('.register').hide();
    }
  });
});
/* eslint-enable no-undef */
