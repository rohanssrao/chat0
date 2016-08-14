require(['hello'], function(hello) {
   hello.sayHello();
});

$('form').submit(function() {
   if ($('input').val() !== '') {
      $.get($('input').val(), function(data) {
         $('pre').text(data);
      }).fail(function() {
         $('pre').text('Not a valid URL :(');
      });
   }
   return false;
});
