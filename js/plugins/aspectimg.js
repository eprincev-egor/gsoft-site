
;(function($) {
	'use strict';
	
	$.fn.aspectImg = function() {
		return this.each(function() {
			var   elem = this
				, $elem = $(elem)
				, $img = $elem.find('img.photo')
				, img = $img.get(0)
			;
			
			if ( isLoaded( $img ) ) {
				toCenterMe(img);
				$elem.removeClass('loading');
			}
			
			$img.on('load', function() {
				toCenterMe(img);
				$elem.removeClass('loading');
			})
		});
	}
	
	function isLoaded($img) {
		return !!$img.width();
	}
	
	function toCenterMe( img ) {
		
		var   $img = $(img)
			, $parent = $img.parent()
		;
		
		$img.css({
			  'width' : 'auto'
			, 'height' : 'auto'
		});
		
		var
			  iw = $img.width() || parseInt($img.css('width'))
			, mw = $parent.width() || parseInt($parent.css('width'))
			, ih = $img.height() || parseInt($img.css('height'))
			, mh = $parent.height() || parseInt($parent.css('height'))
			
			, aspect
			, invertAspect = !!( $img.attr('aspect-content') == 'full' )
			, x
		;
		
		aspect = iw/ih > mw/mh;
		if ( invertAspect ) {
			aspect = !aspect;
		}
		
		if ( aspect ) {
			$img.css({
				'height' : '100%',
				'width' : 'auto'
			});
			
			x = ((mw - $img.width())/2) * 100 / mw;
			$img.css({'margin-left': x + '%' });
			
		} else {
			$img.css({
				'width' : '100%',
				'height' : 'auto'
			});
			
			x = ((mh - $img.height())/2) * 100 / mh;
			$img.css({'margin-top': x + '%' });
		}
		
	}
})(jQuery);
