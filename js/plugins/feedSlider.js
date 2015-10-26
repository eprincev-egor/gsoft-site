define([
  'jquery'
], function($) {
  'use strict';

  var $body;

  function FeedSlider() {
    return this.init.apply(this, arguments);
  }

  FeedSlider.prototype.init = function(params, context) {
    if ( !$body ) {
      $body = $(document.body);
    }

    params = $.extend({
        // default settings

        // настройки скорости
        speed: 5, // единичое перемещение в пикселях
        speedUp: 1.05,  // коэффициент ускорения
        // ширина слайдера
        width: 500
    }, params);

    this.el = context;
    this.$el = $(context);

    this.width = params.width;
    this.arrowWidth = 26;

    this._currentSpeedUp = 1;
    this._speedUp = params.speedUp;
    this.speed = params.speed;


    this.initElems(params);
    // for debug
    window.feedSlider = this;

    return this;
  }

  FeedSlider.prototype.initElems = function(params) {
    if ( this.$el.parent().hasClass('.feed-slider-wrap') ) {
      return;
    }

    // стрелки будут иметь position: absolute,
    // поэтому если родитель статичный, то стрелки уедут в далекие дали
    if ( this.$el.css('position') == 'static' ) {
      this.$el.css({
        'position': 'relative',
        'width': '1000%'
      });
    }

    var height = this.$el.height();
    this.$el.wrap('<div class="feed-slider-wrap"></div>');
    this.$wrap = this.$el.parent();

    if ( height != 0 ) {
      height = height + 'px';
    } else {
      height = 'auto';
    }

    this.$wrap.css({
        'position': this.$el.css('position'),
        'width': params.width + 'px',
        'height': height,
        'overflow': 'hidden'
    })

    this.$mover = this.$el;

    this.initArrows(params);
  };

  FeedSlider.prototype.initArrows = function(params) {
    var $wrap = this.$wrap;

    // удаляем при реините
    $wrap.children('.slider-arrow').each(function(index, elem) {
      elem.outerHTML = '';
    });

    $wrap.prepend("<span class='feed-slider-arrow feed-slider-arrow-left'></span>");
    $wrap.append("<span class='feed-slider-arrow feed-slider-arrow-right'></span>");

    this.$leftArrow = $wrap.children('.feed-slider-arrow-left');
    this.$rightArrow = $wrap.children('.feed-slider-arrow-right');

    this.initArrowAction(params);
  };

  FeedSlider.prototype.initArrowAction = function(params) {

    var interval;

    this.$wrap.children('.feed-slider-arrow')
        .on('mousedown touchstart', function(e) {
          e.preventDefault();

          var vector = $(e.target).hasClass('feed-slider-arrow-left') ? 1 : -1;
          this.startMove(vector);

        }.bind(this));

    $(window).on('mouseup touchend', this.stopMove.bind(this));

  };

  FeedSlider.prototype.getX = function() {
    return parseInt( this.$mover.css('margin-left') ) || 0;
  };

  FeedSlider.prototype.setX = function(x) {
    this.$mover.css('margin-left', x + 'px');
  };

  FeedSlider.prototype.speedUp = function() {
    this._currentSpeedUp *= this._speedUp;
  };

  FeedSlider.prototype.clearSpeedUp = function() {
    this._currentSpeedUp = 1;
  };

  FeedSlider.prototype.startMove = function(vector) {
    $body.addClass('no-select');

    clearInterval(this.interval);
    this.interval = setInterval(this.moveByVector.bind(this, vector), 30 );
  };

  FeedSlider.prototype.stopMove = function() {
    $body.removeClass('no-select');
    this.clearSpeedUp();
    clearInterval(this.interval);
  };

  FeedSlider.prototype.moveByVector = function(vector) {
    var nx = this.mathNX(vector);

    this.setX(nx);
    this.speedUp();
  };

  FeedSlider.prototype.mathNX = function(vector) {
    var x = this.getX(),
        diff = vector * this.speed * this._currentSpeedUp,
        contentWidth = this.getContentWidth(),
        nx = x + diff;

    // diff может быть больше чем размер стрелки,
    // поэтому опредяем nx по границе (левой или правой)
    if ( !this.checkX(contentWidth, nx, vector) ) {
      nx = this.mathBound(contentWidth, vector);
    }

    return nx;
  };

  FeedSlider.prototype.mathBound = function(contentWidth, vector) {
    if ( arguments.length == 1 ) {
      vector = contentWidth;
      contentWidth = this.getContentWidth();
    }

    var x;
    if ( vector > 0 ) {
      x = this.arrowWidth;
    } else {
      x = -(contentWidth - this.width + this.arrowWidth);
    }

    return x;
  };

  // проверка, входит ли x в рамки слайдера
  FeedSlider.prototype.checkX = function(cw, x, v) {
    if ( arguments.length == 2 ) {
      v = x;
      x = cw;
      cw = this.getContentWidth();
    }
    var contentWidth = cw,
        arrowWidth = this.arrowWidth;

    if ( v > 0 ) {
      return x < arrowWidth;
    } else {
      return Math.abs(x) < contentWidth - this.width + arrowWidth;
    }
  };

  FeedSlider.prototype.getContentWidth = function() {
    var $el = this.$el,
        //$wrap = this.$wrap,
        width = 0;

    /*
    $wrap.css('width', 'auto');
    $el.css('width', 'auto');
    width = $el.width();
    $el.css('width', '1000%');
    $wrap.css('width', this.width + 'px');
    */
    $el.children().each(function() {
      width += $(this).outerWidth(true);
    });

    return width;
  };

  // если ширина контента меньше чем ширина слайдера,
  // то отрубаем кнопки
  FeedSlider.prototype.update = function(params) {
    params = $.extend({
      width: this.width,
      x: 'auto'
    }, params);

    if ( params.width != this.width ) {
      this.setWidth(params.width);
    }

    var width = this.width,
        contentWidth = this.getContentWidth();

    if ( contentWidth < width ) {
      this.$wrap.addClass('disable');
    } else {
      this.$wrap.removeClass('disable');
    }

    if ( params.x == 'auto' ) {
      this.autoX();
    } else {
      this.setX(params.x);
    }
  };

  FeedSlider.prototype.getWidth = function(width) {
    return this.width;
  };

  FeedSlider.prototype.setWidth = function(width) {
    this.width = width;
    this.$wrap.width(width);
  };

  FeedSlider.prototype.autoX = function() {
    var $active = this.$el.find('.active');

    if ( !$active.length ) {
      this.setX(0);
      return;
    }

    var
        offsetLeft = $active.get(0).offsetLeft,
        activeWidth = $active.width(),
        centerX = Math.max( (this.width - activeWidth) / 2, this.arrowWidth ),
        x = -(offsetLeft - centerX),
        contentWidth = this.getContentWidth(),
        leftBound = this.mathBound(contentWidth, 1),
        rightBound = this.mathBound(contentWidth, -1)
    ;

    if ( contentWidth < this.width ) {
      this.setX(0);
      return;
    }

    if ( x > leftBound ) {
        x = leftBound;
    } else
    if ( x + activeWidth < rightBound ) {
        x = rightBound
    }

    this.setX(x);
  };

  $.fn.feedSlider = function(params) {
    return this.each(function() {
      $(this).data('feedSlider', new FeedSlider(params, this));
    })
  };

  return FeedSlider;
})
