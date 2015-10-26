
;(function($) {
	'use strict';
	
	var   delay = 1000
		, menus = []
		, mainParentClass = 'menu-' + (+new Date)
		, bodyInited = false
	;
	
	setInterval(outClose, delay);
	
	function outClose(justClose) {
	
		menus.forEach(function( div ) {
			var   $menu = $(div)
				, date = +new Date
				, closeDate = div.closeDate
				, diffTime = date - closeDate
				
				, hasHover = $menu.find('.hover').length || $menu.hasClass('hover')
				, isCloseTime = diffTime > delay
				, mouseOutside = !div.inside
			;
			
			if ( justClose || mouseOutside && isCloseTime && hasHover ) {
				closeTree( $menu );
			}
		});
		
	}
	
	$.fn.hoverMenu = function() {
		
		
		return this.each(function() {
			var   div = this
				, $div = $(this)
			;
			
			if ( !bodyInited ) {
				bodyInited = true;
				
				$('body').on('click', function(e) {
					var   target = e.target
						, $target = $(target)
						, $menu = $target.is('.' + mainParentClass) ? $target : $target.parents('.' + mainParentClass)
					;
					
					if ( !$menu.length ) {
						outClose(true);
					}
				});
			}
			
			$div
				.addClass(mainParentClass)
				.on('mouseout', function(e) {
					e.stopPropagation();
					
					var 
						  target = e.target
						, $target = $(target)
						, $mainParent = $target.is('.' + mainParentClass) ? $target : $target.parents('.' + mainParentClass)
					;
					
					if ( $mainParent.length ) {
						div.inside = false;
						div.closeDate = +new Date;
					}
				})
				.on('mouseover', function(e) {
					e.stopPropagation();
					
					var 
						  target = e.target
						, $target = $(target)
						, $li = $target.is('li') ? $target : $target.parents('li:first')
						, $ul = $li.children('ul')
					;
				
					if ( $target.is('a') ) {
						showTree($li);
						if ( $ul.length ) {
							closeNeighbors( $li, 'li' );
						}
					}
					
					div.inside = true;
				})
				
			;
			
			div.inside = false;
			div.closeDate = +new Date;
			
			menus.push(div);
		});
		
	}
	
	function closeNeighbors($li) {
		var $neighbors = $li.neighbors('li');
		
		$neighbors.each(function() {
			closeTree($(this));
		})
	}
	
	function closeTree($li) {
		$li.find('ul')
			.each(function() {
				var   $ul = $(this)
					, $parent = $ul.parent()
				;
				
				if ( $parent.hasClass('hover') ) {
					$ul.fadeOut(300, function() {
						
						$ul.removeAttr('style');
						$parent.removeClass('hover');
					});
				}
			});
	}
	
	function showTree($li) {
		if ( !$li.is('.hover') ) {
			$li.addClass('hover');
			showUl( $li.children('ul') );
		}
		
		$li.parents('li:not(.hover)').addClass('hover')
			.each(function() {
				showUl( $(this).children('ul') );
			});
			
		function showUl($ul) {
			$ul.hide().slideDown(300, function() {
				$ul.removeAttr('style');
			})
		}
	}
	
})(jQuery);
