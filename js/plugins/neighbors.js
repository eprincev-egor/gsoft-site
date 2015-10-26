
;(function($) {
	'use strict';
	
	$.fn.neighbors = function(filter) {
		var   $elem = this
			, elem = $elem.get(0)
			, $neighbors = $elem.parent().children(filter).not(function() {
				return this == elem;
			})
		;
		
		return $neighbors;
	}
	
})(jQuery);

