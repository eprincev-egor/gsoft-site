define([
  'jquery',
  'eva'
], function($, Events) {

  var $body = $(document.body);
  // стабилизация скролла под разные браузеры
  function isScrollElem(elem) {
    return elem.clientHeight < elem.scrollHeight - 13
  }

  $(window).on('mousewheel DOMMouseScroll', function(e) {


    var event = e.originalEvent,
        delta = event.detail ? event.detail * -40 : event.wheelDelta,
        $target = $(e.target),
        $parents = $target.parents(),
        $scrollElem,
        currentScroll = 0;

    if ( isScrollElem(e.target) ) {
      $scrollElem = $target;
    } else {
      $parents.each(function() {
        if ( isScrollElem(this) ) {
          $scrollElem = $(this);
          return false;
        }
      })
    }

    if ( !$scrollElem ) {
      $scrollElem = $body;
    }

    if ( !$scrollElem.hasClass('stable-scroll') ) {
      return;
    }

    e.preventDefault();
    currentScroll = $scrollElem.scrollTop();

    $scrollElem.scrollTop(currentScroll - delta);

  })


})
