/*

  Плагин был модифицирован
*/
;(function (factory)
{
    if (typeof define === 'function' && define.amd)
    {
        define(['jquery', 'plugins/realSize'], factory);
    }
    else if (typeof exports === 'object')
    {
        factory(require('jquery'));
    }
    else
    {
        factory(jQuery);
    }
}
(function ($)
{
    "use strict";

    var pluginName = "tinyscrollbar"
    ,   defaults   =
        {
            axis         : 'y'    // Vertical or horizontal scrollbar? ( x || y ).
        ,   wheel        : true   // Enable or disable the mousewheel;
        ,   wheelSpeed   : 40     // How many pixels must the mouswheel scroll at a time.
        ,   wheelLock    : true   // Lock default window wheel scrolling when there is no more content to scroll.
        ,   touchLock    : true   // Lock default window touch scrolling when there is no more content to scroll.
        ,   trackSize    : false  // Set the size of the scrollbar to auto(false) or a fixed number.
        ,   thumbSize    : false  // Set the size of the thumb to auto(false) or a fixed number
        ,   thumbSizeMin : 20     // Minimum thumb size.
		    ,   trackSizeAuto : false
		    ,   noTouch : false
        ,   getViewportSize : false
        ,   getOverviewSize : false
        // кол-во пикселей, которые будут игнорироватся при задание ширины трека
        ,   ingnoreOffset : 0
        }
    ;

    function Plugin($container, options)
    {
        this.options   = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name     = pluginName;

        var self        = this
        ,   isHorizontal = this.options.axis === 'x'

        ,   $viewport   = $container.find(".viewport")
        ,   $overview   = $container.find(".overview")
        ,   $scrollbar  = $container.find(".scrollbar-" + this.options.axis )
        ,   $track      = $scrollbar.find(".track")
        ,   $thumb      = $scrollbar.find(".thumb")

        ,   hasTouchEvents = ("ontouchstart" in document.documentElement) && !this.options.noTouch
        ,   wheelEvent     = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
                             document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
                             "DOMMouseScroll" // let's assume that remaining browsers are older Firefox
        ,   sizeLabel    = isHorizontal ? "width" : "height"
        ,   posiLabel    = isHorizontal ? "left" : "top"
		    ,  	isMargin	 = !!this.options.isMargin

        ,   mousePosition = 0
        ;

        if ( !$scrollbar.length ) {
          $scrollbar = $container.find('.scrollbar')
        }

        this.contentPosition = 0;
        this.viewportSize    = 0;
        this.contentSize     = 0;
        this.contentRatio    = 0;
        this.trackSize       = 0;
        this.trackRatio      = 0;
        this.thumbSize       = 0;
        this.thumbPosition   = 0;

        function initialize()
        {
            self.update();
            setEvents();

            return self;
        }

        // получение размеров, либо из настроеек либо из плагина
        var getViewportSize, getOverviewSize;

        // получение размера видимой области
        if ( typeof this.options.getViewportSize != 'function' ) {
          getViewportSize = function() {
            return $viewport.realSize();
          };
        } else {
          getViewportSize = this.options.getViewportSize;
        }

        // получение размера области контента
        if ( typeof this.options.getOverviewSize != 'function' ) {
          getOverviewSize = function() {
            return $overview.realSize();
          };
        } else {
          getOverviewSize = this.options.getOverviewSize;
        }

    this.getViewportSize = getViewportSize;
    this.getOverviewSize = getOverviewSize;

    this.getScrollPosition = function() {
      return this.contentPosition;
    }

		this.animateTo = function( scrollTo, time, callback ) {
			callback = typeof callback === 'function' ? callback : function(){};
			time *= 1;
			if ( time !== time ) { time = 600 }

			var that = this
				, stepTime = 20
				, count = Math.floor( time / stepTime ) / 2 // кол-во шагов, немного оптимизируем

				, position = that.contentPosition
				, step = Math.floor( (scrollTo - position) / count )

				, i = 0
				, timer
			;
            //that.update( scrollTo, {trigger:true} );
            //callback.call( that );

			timer = setInterval(function() {
				i++;
				position += step;
				that.update( position, {trigger:true} );

				if ( i >= count ) {
					clearInterval(timer);
					setTimeout(function() {

						that.update( scrollTo, {trigger:true} );
						callback.call( that );

					}, stepTime);
				}

			}, stepTime);

		}

        this.update = function(scrollTo, settings)
        {
            // если флаг выставить в true, то сработает событие,
            // автоматического сброса скролла в ноль
            var autoClearEvent = false;

            settings = $.extend({
                trigger: false
            }, settings);

            var sizeLabelCap   = sizeLabel.charAt(0).toUpperCase() + sizeLabel.slice(1).toLowerCase()
      				, viewportSize = getViewportSize() //  changed
      				, contentSize = getOverviewSize() //  changed
      			;

            this.viewportSize  = viewportSize[ sizeLabelCap.toLowerCase() ];  //  changed
            this.contentSize   = contentSize[ sizeLabelCap.toLowerCase() ] - this.options.ingnoreOffset; //  changed
            this.contentRatio  = this.viewportSize / this.contentSize;

            if ( this.viewportSize >= this.contentSize ) {
              scrollTo = 0;
              autoClearEvent = true;
            }

      			if ( this.options.trackSizeAuto ) {
      				this.trackSize     = $track.height();
      			} else {
      				this.trackSize     = this.options.trackSize || this.viewportSize;
      			}
      			this.thumbSize     = Math.min(this.trackSize, Math.max(this.options.thumbSizeMin, (this.options.thumbSize || (this.trackSize * this.contentRatio))));

            this.trackRatio    = (this.contentSize - this.viewportSize) / (this.trackSize - this.thumbSize);

            if ( this.contentRatio >= 1 ) {
              $scrollbar.addClass("disable");
            } else {
              $scrollbar.removeClass("disable");
            }

            switch (scrollTo)
            {
                case "bottom":
                    this.contentPosition = Math.max(this.contentSize - this.viewportSize, 0);
                    break;

                case "relative":
                    this.contentPosition = Math.min(Math.max(this.contentSize - this.viewportSize, 0), Math.max(0, this.contentPosition));
                    break;

                default:
                    this.contentPosition = parseInt(scrollTo, 10) || 0;
            }

            this.thumbPosition = this.contentPosition / this.trackRatio;

            setCss();
            if ( settings.trigger || autoClearEvent ) {
                $container.trigger('move');
            }

            return self;
        };

        function setCss()
        {
            $thumb.css(posiLabel, self.thumbPosition);
            if ( !isMargin ) {
            	$overview.css(posiLabel, -self.contentPosition);
            } else {
            	$overview.css('margin-' + posiLabel, -self.contentPosition);
            }

            $scrollbar.css(sizeLabel, self.trackSize);
            $track.css(sizeLabel, self.trackSize);
            $thumb.css(sizeLabel, self.thumbSize);
        }

        function setEvents()
        {
            if(hasTouchEvents)
            {
                $viewport[0].ontouchstart = function(event)
                {
                    if(1 === event.touches.length)
                    {
                        event.stopPropagation();

                        start(event.touches[0]);
                    }
                };
            }
            else
            {
                $thumb.bind("mousedown", function(event){
                    event.stopPropagation();
                    start(event);
                });
                $track.bind("mousedown", function(event){
                    start(event, true);
                });
            }

            $(window).resize(function()
            {
                self.update("relative");
            });

            if(self.options.wheel && window.addEventListener)
            {
                $container[0].addEventListener(wheelEvent, wheel, false);
            }
            else if(self.options.wheel)
            {
                $container[0].onmousewheel = wheel;
            }
        }

        function isAtBegin()
        {
            return self.contentPosition > 0;
        }

        function isAtEnd()
        {
			var isAtEnd_result = self.contentPosition <= (self.contentSize - self.viewportSize) - 5;
            return isAtEnd_result;
        }

        function start(event, gotoMouse)
        {
            $("body").addClass("no-select");

            mousePosition = gotoMouse ? $thumb.offset()[posiLabel] : (isHorizontal ? event.pageX : event.pageY);

            if(hasTouchEvents)
            {
                document.ontouchmove = function(event)
                {
                    if(self.options.touchLock || isAtBegin() && isAtEnd())
                    {
                        event.preventDefault();
                    }
                    drag(event.touches[0]);
                };
                document.ontouchend = end;
            }
            else
            {
                $(document).bind("mousemove", drag);
                $(document).bind("mouseup", end);
                $thumb.bind("mouseup", end);
                $track.bind("mouseup", end);
            }

            drag(event);
        }

        function wheel(event)
        {
            event.stopPropagation();
            if(self.contentRatio < 1)
            {
                // Trying to make sense of all the different wheel event implementations..
                //
                var evntObj    = event || window.event
                ,   wheelDelta = -(evntObj.deltaY || evntObj.detail || (-1 / 3 * evntObj.wheelDelta)) / 40
                ,   multiply   = (evntObj.deltaMode === 1) ? self.options.wheelSpeed : 1
                ;

                self.contentPosition -= wheelDelta * multiply * self.options.wheelSpeed;
                self.contentPosition = Math.min((self.contentSize - self.viewportSize), Math.max(0, self.contentPosition));
                self.thumbPosition   = self.contentPosition / self.trackRatio;

                $container.trigger("move");

                $thumb.css(posiLabel, self.thumbPosition);
				if ( !isMargin ) {
					$overview.css(posiLabel, -self.contentPosition);
				} else {
					$overview.css('margin-' + posiLabel, -self.contentPosition);
				}

                if(self.options.wheelLock || isAtBegin() && isAtEnd())
                {
					if ( $viewport.is(':visible') ) {
						evntObj = $.event.fix(evntObj);
						evntObj.preventDefault();
					}
                }

				if ( !isAtEnd() ) {
					$container.trigger('scroll_end');
				} else
				if ( self.contentPosition < 10 ) {
					$container.trigger('scroll_start');
				}
            }
        }

        function drag(event)
        {
            if(self.contentRatio < 1)
            {
                var mousePositionNew   = isHorizontal ? event.pageX : event.pageY
                ,   thumbPositionDelta = mousePositionNew - mousePosition
                ;

                if(hasTouchEvents)
                {
                    thumbPositionDelta = mousePosition - mousePositionNew;
                }

                var thumbPositionNew = Math.min((self.trackSize - self.thumbSize), Math.max(0, self.thumbPosition + thumbPositionDelta));
                self.contentPosition = thumbPositionNew * self.trackRatio;

                $container.trigger("move");

                $thumb.css(posiLabel, thumbPositionNew);
				if ( !isMargin ) {
					$overview.css(posiLabel, -self.contentPosition);
				} else {
					$overview.css('margin-' + posiLabel, -self.contentPosition);
				}
            }
        }

        function end()
        {
            self.thumbPosition = parseInt($thumb.css(posiLabel), 10) || 0;

            $("body").removeClass("no-select");
            $(document).unbind("mousemove", drag);
            $(document).unbind("mouseup", end);
            $thumb.unbind("mouseup", end);
            $track.unbind("mouseup", end);
            document.ontouchmove = document.ontouchend = null;

			if ( !isAtEnd() ) {
				$container.trigger('scroll_end');
			} else if ( self.contentPosition < 10 ) {
				$container.trigger('scroll_start');
			}
        }

        return initialize();
    }

    $.fn[pluginName] = function(options, strictInit)
    {
        return this.each(function()
        {
            if(!$.data(this, "plugin_" + pluginName) || strictInit)
            {
                $.data(this, "plugin_" + pluginName, new Plugin($(this), options));
            }
        });
    };
}));
