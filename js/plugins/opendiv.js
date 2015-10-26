
;(function( $ ) {
	'use strict';
	
	var time = +new Date()
		, closerClass = 'js-closer' + time
	;
	
	$.fn.openDiv = function(params) {
		
		params = params || {};
		
		$('body')
			.off('click', closeDivs)
			.on('click', closeDivs)
		;
		
		return this.each(function() {
			this.params = params;
			$(this)
				.off('click', toogleDiv)
				.on('click', toogleDiv)
			;
			
			$($(this).attr('href')).each(function() {
				this.params = params;
			});
		});
	}
	
	function toogleDiv( e ) {
		
		var $a = $(this)
				, href = $a.attr('href')
				, $div = $(href)
				, params = this.params
				, toggleFunc = params.toggleFunc
				, toggleFuncArguments = params.toggleFuncArguments || []
			;
		
		if ( typeof toggleFunc != 'function' ) {
			toggleFunc = $.fn.slideToggle;
		}
		
		toggleFunc.apply($div, toggleFuncArguments);
		$div.addClass(closerClass);
		
		return false;
	}
	
	function closeDivs( e ) {
		var targ = e.srcElement || e.target
			, $targ = $(targ)
			, $divs
			, params = {}
			, closeFunc
			, closeFuncArguments
		;
		
		// если клик внутри одного из открытых дивов
		if ( $targ.parents('.' + closerClass).length )
			return;
		
		$divs = $('.' + closerClass);
		$divs.each(function() {
			close(this);
		});
	}
	
	function close(div) {
		var params = div.params || {}
			, $div = $(div)
			, closeFunc = params.closeFunc
			, closeFuncArguments = params.closeFuncArguments || []
		;
		
		if ( typeof closeFunc != 'function' ) {
			closeFunc = $.fn.fadeOut;
		}
		
		closeFunc.apply($div, closeFuncArguments);
	}
}(jQuery));

