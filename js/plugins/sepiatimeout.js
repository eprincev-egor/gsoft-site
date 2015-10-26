define([
    'jquery'
], function($) {

    $.fn.sepiatimeout = function(params) {
        params = $.extend({
            className: "sepia",
            timeout: 5000
        }, params);
        return this.each(function() {

            var $elem = $(this),
                timer = newTimer();

            $elem.on('click keydown', function() {
                clearTimeout(timer);
                timer = newTimer();
                $elem.removeClass(params.className);
            });

            function newTimer() {
                return setTimeout(function() {
                    $elem.addClass(params.className);
                }, params.timeout);
            }
        });

    };

})
