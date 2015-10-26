define([
  'jquery',
  'funcs',
  'plugins/tinyscrollbar'
], function($, f) {
  'use strict';

  function ScrollBar() {
    return this.init.apply(this, arguments);
  }

  ScrollBar.prototype.init = function(params, elem) {
    if ( !params ) {
      params = {}
    }

    var that = this,
        $elem = $(elem),
        horizontalPlugin = $elem.tinyscrollbar({
          axis: 'x',
          wheel: false,
          getOverviewSize: params.getOverviewSize,
          getViewportSize: params.getViewportSize,
          noTouch: true,
          ingnoreOffset: 3
        }, true).data('plugin_tinyscrollbar'),
        verticalPlugin = $elem.tinyscrollbar({
          axis: 'y',
          getOverviewSize: params.getOverviewSize,
          getViewportSize: params.getViewportSize,
          noTouch: true,
          wheelSpeed: 8
        }, true).data('plugin_tinyscrollbar')
      ;

      that.elem = elem;
      that.$elem = $elem;
      that.verticalPlugin = verticalPlugin;
      that.horizontalPlugin = horizontalPlugin;

      that.rowHeight = params.rowHeight;
      this.initTouch();
      this.params = params;

      return that;
  };

  ScrollBar.prototype.initTouch = function() {
      var $elem = this.$elem;
      var start = false;

      $elem.on('touchstart', function(e) {
          if ( !this.checkTouchElem(e) ) {
              return;
          }

          e.stopPropagation();
          e.preventDefault();
          var point = f.getTouchPoint(e);
          start = {
              point: point,
              position: this.getScrollPosition()
          }

      }.bind(this));

      $(document).on('touchmove', function(e) {
          if ( !start ) {
              return;
          }
          e.preventDefault();
          e.stopPropagation();

          var point = f.getTouchPoint(e);
          var x = start.position.left + start.point.x - point.x;
          var y = start.position.top + start.point.y - point.y;
          var overviewWidth = this.horizontalPlugin.getOverviewSize().width,
              viewportWidth = this.horizontalPlugin.getViewportSize().width;

          var left = Math.min( Math.max(x, 0), overviewWidth - viewportWidth );

          var position = {
              left: left,
              top: Math.max(y, 0)
          };

          this.setPosition(position);
      }.bind(this));

      $(document).on('touchend', function(e) {
          start = false;
      }.bind(this));
  };

  ScrollBar.prototype.checkTouchElem = function(e) {
      var checkFunc = this.params.checkTouchElem;

      if ( typeof checkFunc == 'function' ) {
          return checkFunc(e);
      } else {
          return $(e.target).parents('.overview:first').length > 0;
      }
  };

  ScrollBar.prototype.getScrollPosition = function() {
      return {
          left: this.getScrollLeft(),
          top: this.getScrollTop()
      };
  };

  ScrollBar.prototype.getScrollLeft = ScrollBar.prototype.getLeft = function() {
    return this.horizontalPlugin.getScrollPosition();
  };

  ScrollBar.prototype.getScrollTop = function() {
    return this.verticalPlugin.getScrollPosition();
  };

  ScrollBar.prototype.updateBy = function(x, y) {
    this.horizontalPlugin.update(x);
    this.verticalPlugin.update(y);
  };

  ScrollBar.prototype.update = function() {
    this.horizontalPlugin.update(this.horizontalPlugin.contentPosition);
    this.verticalPlugin.update(this.verticalPlugin.contentPosition);
  };

  ScrollBar.prototype.setPosition = function(pos, options) {
      options = f.easyMixin({
        trigger: true
      }, options);

      this.horizontalPlugin.update(pos.left);
      this.verticalPlugin.update(pos.top);

      if ( options.trigger ) {
        this.$elem.trigger('move');
      }
  };

  ScrollBar.prototype.setLeft = function(x, options) {
    options = f.easyMixin({
      trigger: true
    }, options);

    this.horizontalPlugin.update(x);
    if ( options.trigger ) {
      this.$elem.trigger('move');
    }
  };

  ScrollBar.prototype.setTop = function(x, options) {
    options = f.easyMixin({
      trigger: true
    }, options);

    this.verticalPlugin.update(x);
    if ( options.trigger ) {
      this.$elem.trigger('move');
    }
  };

  ScrollBar.prototype.animateUpTo = function(top, callback) {
      this.verticalPlugin.animateTo(top, 200, callback);
  };

  ScrollBar.prototype.getHeight = function() {
      return this.verticalPlugin.contentSize;
  };

  $.fn.scrollbar = function(params) {
    return this.each(function() {

      $(this).data('plugin_scrollbar', new ScrollBar(params, this));

    })
  };

})
