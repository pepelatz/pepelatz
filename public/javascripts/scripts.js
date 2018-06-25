/* eslint-disable no-undef */
$(function() {
  // remove errors
  function removeErrors() {
    $('form.login p.error, form.register p.error').remove();
    $('form.login input, form.register input').removeClass('error');
  }

  // toggle
  var flag = true;
  $('.switch-button').on('click', function(e) {
    e.preventDefault();

    $('input').val('');
    removeErrors();

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

  // clear
  $('form.login input, form.register input').on('focus', function() {
    removeErrors();
  });

  // register
  $('.register-button').on('click', function(e) {
    e.preventDefault();
    removeErrors();

    var data = {
      login: $('#register-login').val(),
      password: $('#register-password').val(),
      passwordConfirm: $('#register-password-confirm').val()
    };

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/api/auth/register'
    }).done(function(data) {
      if (!data.ok) {
        $('.register h2').after('<p class="error">' + data.error + '</p>');
        if (data.fields) {
          data.fields.forEach(function(item) {
            $('input[name=' + item + ']').addClass('error');
          });
        }
      } else {
        // $('.register h2').after('<p class="success">Отлично!</p>');
        $(location).attr('href', '/');
      }
    });
  });

  // login
  $('.login-button').on('click', function(e) {
    e.preventDefault();
    removeErrors();

    var data = {
      login: $('#login-login').val(),
      password: $('#login-password').val()
    };

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/api/auth/login'
    }).done(function(data) {
      if (!data.ok) {
        $('.login h2').after('<p class="error">' + data.error + '</p>');
        if (data.fields) {
          data.fields.forEach(function(item) {
            $('input[name=' + item + ']').addClass('error');
          });
        }
      } else {
        // $('.login h2').after('<p class="success">Отлично!</p>');
        $(location).attr('href', '/');
      }
    });
  });
});

/* eslint-enable no-undef */

/* eslint-disable no-undef */
$(function() {
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
  $('.publish-button, .save-button').on('click', function(e) {
    e.preventDefault();
    removeErrors();

    var isDraft =
      $(this)
        .attr('class')
        .split(' ')[0] === 'save-button';

    var data = {
      title: $('#post-title').val(),
      body: $('#post-body').val(),
      isDraft: isDraft,
      postId: $('#post-id').val()
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
        // $(location).attr('href', '/');
        if (isDraft) {
          $(location).attr('href', '/post/edit/' + data.post.id);
        } else {
          $(location).attr('href', '/posts/' + data.post.url);
        }
      }
    });
  });

  // upload
  $('#file').on('change', function() {
    // e.preventDefault();

    var formData = new FormData();
    formData.append('postId', $('#post-id').val());
    formData.append('file', $('#file')[0].files[0]);

    $.ajax({
      type: 'POST',
      url: '/upload/image',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data) {
        console.log(data);
        $('#fileinfo').prepend(
          '<div class="img-container"><img src="/uploads' +
            data.filePath +
            '" alt="" /></div>'
        );
      },
      error: function(e) {
        console.log(e);
      }
    });
  });

  // inserting image
  $('.img-container').on('click', function() {
    var imageId = $(this).attr('id');
    var txt = $('#post-body');
    var caretPos = txt[0].selectionStart;
    var textAreaTxt = txt.val();
    var txtToAdd = '![alt text](image' + imageId + ')';
    txt.val(
      textAreaTxt.substring(0, caretPos) +
        txtToAdd +
        textAreaTxt.substring(caretPos)
    );
  });
});

/* eslint-enable no-undef */

/* eslint-disable no-undef */
$(function() {
  var commentForm;
  var parentId;

  function form(isNew, comment) {
    $('.reply').show();

    if (commentForm) {
      commentForm.remove();
    }
    parentId = null;

    commentForm = $('.comment').clone(true, true);

    if (isNew) {
      commentForm.find('.cancel').hide();
      commentForm.appendTo('.comment-list');
    } else {
      var parentComment = $(comment).parent();
      parentId = parentComment.attr('id');
      $(comment).after(commentForm);
    }

    commentForm.css({ display: 'flex' });
  }

  // load
  form(true);

  // add form
  $('.reply').on('click', function() {
    form(false, this);
    $(this).hide();
  });

  // add form
  $('form.comment .cancel').on('click', function(e) {
    e.preventDefault();
    commentForm.remove();
    // load
    form(true);
  });

  // publish
  $('form.comment .send').on('click', function(e) {
    e.preventDefault();
    // removeErrors();

    var data = {
      post: $('.comments').attr('id'),
      body: commentForm.find('textarea').val(),
      parent: parentId
    };

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/comment/add'
    }).done(function(data) {
      console.log(data);
      if (!data.ok) {
        if (data.error === undefined) {
          data.error = 'Неизвестная ошибка!';
        }
        $(commentForm).prepend('<p class="error">' + data.error + '</p>');
      } else {
        var newComment =
          '<ul><li style="background-color:#ffffe0;"><div class="head"><a href="/users/' +
          data.login +
          '">' +
          data.login +
          '</a><spam class="date">Только что</spam></div>' +
          data.body +
          '</li></ul>';

        $(commentForm).after(newComment);
        form(true);
      }
    });
  });
});
