
/*
	CSS Slider v1.1
	15.06.2014
	
	jQuery plugin by EPRINCEV EGOR
	need jQuery 1.5
	
	jQuery next functions will used:
		$.extend
		$.addClass		
		$.removeClass		
		$.find
		$.attr
		$.click
		$.each
		$.hide
		$.show
		$.fadeIn
		$.fadeOut
		$.eq
		$.after
	
*/
;(function($) {
	"use strict";
	$.fn.slider = function( settings ) {
		
		
		var DEFAULT_options = {
		
			slide : 				'[slide], .slide',
			first_class :			'first',
			prev_class :			'prev',
			to_left_class :			'to-left',
			to_right_class :		'to-right',
			active :				'active',
			trans : 				'slider_trans',
			attr_name : 			'i',
			prev_button : 			'.btn-1',
			next_button : 			'.btn-2',
			ie_support : 			true,
			ie_time :				400,
			start_i : 				0,
			
			random_interval : 4,
			
			after_or_before : 		"after",
			menu_show : 			true,
			menu_wrap_class1 : 		'buttons',
			menu_wrap_class2 : 		'iview-items',
			menu_wrap_class3 : 		'ul',
			menu_a_class : 			'iview-control',
			menu_a_attr : 			'rel',
			menu_a_active_class :	'active',
			
			auto_play : 			true,
			auto_time :				10000
			
			
		}
		settings = $.extend( DEFAULT_options, settings );
		
		var ie_lt_10 = is_ie_lt_10()  &&  settings.ie_support ;
		
		
		//---- init for all
		return $(this).each(function() {
			
			var div = this;
			var rnd = parseInt( Math.random()*10000 );
			div.rnd = rnd;
			
			var $slides = $(div).find(  settings.slide  );
			div.slides_count = $slides.length;
			
			if ( div.sliderPluginInited ) {
				return;
			}
			div.sliderPluginInited = true;
			
			
			if ( div.slides_count == 1 ) {
				$(div).addClass('one-slide');
				
				$slides.eq(0).addClass(settings.active);
				$(  settings.prev_button +','+ settings.next_button  ).hide();
				
				return;
			}
			
			$(  settings.prev_button  ).click(function(){
				settings.auto_play = false;
				list_slide.call(div, -1);
			});
			$(  settings.next_button  ).click(function(){
				settings.auto_play = false;
				list_slide.call(div, 1);
			});
			
			div.list_slide = list_slide;
			div.current_slide = settings.start_i;
			
			$slides.each(function(index) {

				$(this).attr(  settings.attr_name, index);

				$(this).addClass(  settings.trans  );
				if ( index == settings.start_i )
					$(this).addClass(  settings.active + ' ' + settings.first_class  );
						
				if ( ie_lt_10 ) {
					
					$(this).addClass(  settings.active + ' ' + settings.first_class  );
					$(this).hide();
					if ( index == settings.start_i )
						$(this).show();
				}
				
				
			});
			
			//--- menu write
			if ( settings.menu_show ) {
				var menu_html = '';
				
				menu_html += '\
				<div class="'+ settings.menu_wrap_class1 +' rnd-' + rnd + '">\
					<div class="'+ settings.menu_wrap_class2 +'">\
						<ul class="'+ settings.menu_wrap_class3 +'">\
				';
				
				for (var i=0; i<div.slides_count; i++) {
				
					menu_html += '<li class="item-' + (i+1) + '"><a class="'+ 
													settings.menu_a_class
												 +'" '+ 
													settings.menu_a_attr
												 +'="'+ 
													i 
												 +'" href="javascript:void(0);">'+ 
													(i+1) 
												 +'</a></li>';
				}
				
				menu_html += '\
						</ul>\
					</div>\
				</div>\
				';
				
				$(div)[ settings.after_or_before ]( menu_html );
				
				//attach handler on 'click event' for 'slide menu'
				$(".rnd-" + rnd + "." + settings.menu_wrap_class1).find( '.' + settings.menu_a_class ).each(function(aindex){
					
					if ( aindex == div.current_slide ) $(this).addClass( settings.menu_a_active_class );
					
					$(this).click(function(){
						settings.auto_play = false;
						var x = +$(this).attr( settings.menu_a_attr );//get my index
						
						if ( div.current_slide == x ) return;//if current index not my
						
						//remove class 'active' for all <a> linked from this DIV
						$(".rnd-" + rnd + "." + settings.menu_wrap_class1).find( '.' + settings.menu_a_class ).removeClass( settings.menu_a_active_class );
						//add class 'active' on current <a>
						$(this).addClass( settings.menu_a_active_class );
						
						var v = +div.current_slide - +aindex,
							a = ( -v / Math.abs(v) );
						
						//run animation and save new index
						var prev_i = div.current_slide;
						div.current_slide = x;
						activate_slide.call( div, x, a, prev_i );
					})
					
				});
			}
			//--- /menu write
			
			//--- Auto play:
			if ( settings.auto_play ) {
				
				setTimeout( auto_slide, settings.auto_time );
			}
			
			function auto_slide() {
				if (!settings.auto_play)
					return;
				
				//run animation and repeat over auto_time
				list_slide.call( div, 1 );
				setTimeout( auto_slide, settings.auto_time );
			}
		});
		
		//--------------------
		function list_slide( a ) {
			//a - is vector, 1 - to right, -1 - to left
			
			var div = this,
				current_slide = div.current_slide,	//number, current active slide
				slides_count = div.slides_count,	//number, slides length
				prev_i = current_slide,
				rnd = div.rnd
			;			
			current_slide += (+a);
			
			//cycle
			if ( current_slide < 0 && a < 0 ) current_slide = slides_count - 1;
			if ( current_slide >= slides_count && a > 0 ) current_slide = 0;
			
			//remove calss 'active' for all <a> linked from this DIV
			$(".rnd-" + rnd + "." + settings.menu_wrap_class1).find( '.' + settings.menu_a_class )
				.removeClass( settings.menu_a_active_class );
			//add class 'active' on current <a>
			$(".rnd-" + rnd + "." + settings.menu_wrap_class1)
				.find( '.' + settings.menu_a_class )
				.eq( current_slide )
					.addClass( settings.menu_a_active_class );
			
			//run animation and save new index
			activate_slide.call( div, current_slide, a, prev_i );
			div.current_slide = current_slide;
			
		}
		
		//--------------------
		// remove class 'active' for all and add class 'active' for current slide
		function activate_slide( i, a, prev_i ) {
			
			var div = this;
			
			if ( ie_lt_10 ) return activate_slide_for_ielt10.call(div, i);
			
			$(div)
				.removeClass(  settings.to_left_class  )
				.removeClass(  settings.to_right_class  )
				// moving vector
				.addClass( a > 0 ? settings.to_right_class : settings.to_left_class )
			;
			
			$(div).find( settings.slide )
				.removeClass(  settings.active  )
				.removeClass(  settings.first_class  )
				.removeClass(  settings.prev_class  )
			;
			
			//remove random classes
			for (var k = 0, n = +settings.random_interval; k < n; k++)
				$(div).removeClass( 'rnd-' + k );
			
			// add new random class
			$(div).addClass( 'rnd-' + parseInt( Math.random() * settings.random_interval ) );
			
			// add class active to new slide
			$(div).find( "["+ settings.attr_name +"='"+ i +"']" )
				.addClass(  settings.active  )
			;
			
			// set previous class
			$(div).find( "["+ settings.attr_name +"='"+ prev_i +"']" )
				.addClass(  settings.prev_class  )
			;
		}
		
		//--animateion for ie
		function activate_slide_for_ielt10( i ){
			
			var div = this;
			
			$(div).find( settings.slide + ':not('+ "["+ settings.attr_name +"='"+ i +"']" +')' ).fadeOut(  settings.ie_time  );
			$(div).find( settings.slide ).eq(i).fadeIn(  settings.ie_time  );
		}
		
		//---------if ie version less 10 then return true
		function is_ie_lt_10() {
			var brow = navigator.vendor == '' && typeof navigator.vendor == 'string' ? 'Mozilla' : ( navigator.vendor ? navigator.vendor.split(' ')[0] : 'IE' );
			var vers = navigator.appVersion.toLowerCase();
			try{
			vers = ({
				'opera' :function(){ return vers.split('opr/')[1] },
				'mozilla' :function(){ return vers.split(' ')[0] },
				'ie' :function(){ return vers.split('msie ')[1].split(';')[0] },
				'apple' :function(){ return vers.split('version/')[1] },
				'google' :function(){ return vers.split('chrome/')[1].split(' ')[0] }
			})[brow.toLowerCase()]();
			}catch(e){
				return true;
			}
			return brow == 'IE' && +vers.split('.')[0] < 10;
		}
		//----
	}
	
})(jQuery);
