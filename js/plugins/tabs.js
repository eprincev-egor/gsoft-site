
;(function() {
	'use strict';
	
	$.fn.tabs = function() {
		return this.each(function() {
			var 
				  div = this
				, $div = $(div)
				, $a = $div.find('[href]')
				, $li = $a.parent()
				, $tabs = $div.find('[id]')
			;
			
			$a
				.off('click')
				.on('click', function(e) {
					e.preventDefault();
					
					var   $el = $(this)
						, href = $el.attr('href')
					;
					
					$li.removeClass('active');
					$el.parent().addClass('active');
					
					$tabs.removeClass('active');
					$tabs.filter(href).addClass('active');
				})
		});
	};
	
})();