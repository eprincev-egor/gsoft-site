
;(function($) {
	'use strict';
	var   mapStack = []
		, isReady = false
		, id = 0
	;
	
	setTimeout(function() {
		// on all scripts ready
		app.on('yamap:ready', function() {
			isReady = true;
		});
		
		new app.Timer({
			  delay : 100
			, events : {
				time : function() {
					if ( !isReady ) {
						return;
					}
					
					go();
				}
			}
		})
	}, 50);
	
	$.fn.yamap = function() {
		return this.each(function() {
			var   elem = this
				, $elem = $(elem)
				, dataname = $elem.attr('yamap-name') || "map"
				, data = app.pageData[ dataname ] || {}
			;
			
			mapStack.push({
				  elem : elem
				, $elem : $elem
				, data : data
			});
		});
	}
	
	function go() {
		// рисуем карты
		
		mapStack.forEach(function(map, index) {
			var   $elem = map.$elem
				, data = map.data
				, dom_map_id = 'yamap_' + id++
				, myMap
				, center = [data.x, data.y]
			;
			
			$elem.attr('id', dom_map_id);
			myMap = new ymaps.Map(dom_map_id, {
				center: center,
				zoom: data.zoom || 14
			});
			
			if ( data.title ) {
			  myMap.geoObjects.add(
				new ymaps.Placemark(center, {
					balloonContentBody: data.title
				}, {
					preset: 'islands#redDotIcon'
				})
			  );
			}
			
			mapStack.splice(index, 1);
		})
	}
}(jQuery));
