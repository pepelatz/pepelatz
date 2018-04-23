/* eslint-disable no-undef */
$(function() {
  // eslint-disable-next-line
  var editor = new MediumEditor('#post-body', {
    placeholder: {
      text: '',
      hideOnClick: true
    }
  });

  // remove errors
  function removeErrors() {
    $('.post-form p.error').remove();
    $('.post-form input, #post-body').removeClass('error');
  }

  // clear
  $('.post-form input, #post-body').on('focus', function() {
    removeErrors();
  });

  // publish
  $('.publish-button').on('click', function(e) {
    e.preventDefault();
    removeErrors();

    var data = {
      title: $('#post-title').val(),
      body: $('#post-body').html()
    };

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/post/add'
    }).done(function(data) {
      console.log(data);
      if (!data.ok) {
        $('.post-form h2').after('<p class="error">' + data.error + '</p>');
        if (data.fields) {
          data.fields.forEach(function(item) {
            $('#post-' + item).addClass('error');
          });
        }
      } else {
        // $('.register h2').after('<p class="success">Отлично!</p>');
        $(location).attr('href', '/');
      }
    });
  });
});

/* eslint-enable no-undef */
