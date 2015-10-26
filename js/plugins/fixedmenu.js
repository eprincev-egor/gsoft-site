
;(function($) {
	'use strict';
	var index = 0;
	
	$.fn.fixedMenu = function() {
		return this.each(function() {
			var   elem = this
				, $elem = $(elem)
				, top = $elem.prev().height()
				, height
				, id = index++
				, dom_id = 'js-help-fixed-' + id
				, $helper
			;
			
			$elem.after('<div id="'+dom_id+'"/>');
			$helper = $("#" + dom_id);
			
			$(window).on('scroll', function() {
				var scroll = getScroll().top;
				
				if ( scroll >= top ) {
					if ( $elem.hasClass('fixed') ) {
						return;
					}
					
					$elem.addClass('fixed');
					height = $elem.outerHeight(true);
					$helper.height(height);
					$helper.show();
				} else {
					$elem.removeClass('fixed');
					$helper.hide();
				}
			});
		});
	}
	
}(jQuery));
