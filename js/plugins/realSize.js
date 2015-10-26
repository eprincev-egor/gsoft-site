define([
  'jquery'
], function() {

  ;(function($) {
  	"use strict";

  	$.fn.realSize = function(  ) {

  		var that = this[0];
  		if ( !that )
  			return {width:0, height:0};

  		return getOuterWH( that );
  	}

  	function styleDisplay( elem ) {
  		var disp,
        attrStyle = elem.getAttribute('style')
  		;

      if ( attrStyle ) {
        attrStyle.replace(/display\s*:\s*((\w|-)+)/gi,
  				function(str, value) {
  					disp = value;
  					return str;
  				})
      }

  		return disp;
  	}

  	function showIt( elem ) {
  		elem.__disp = styleDisplay( elem );

  		elem.style.display = 'block';
  	}

  	function hideIt( elem ) {

  		if ( elem.__disp ) {
  			elem.style.display = elem.__disp;
  			//$elem.css('display', elem.__disp);
  			delete elem.__disp;
  			return;
  		}

  		var stl = elem.getAttribute('style');

      if ( stl ) {
        stl = stl.replace(/display\s*:\s*((\w|-)+)/gi, function() {
    			return "";
    		})
      } else {
        stl = '';
      }

      if ( stl != ';' ) {
  		  elem.setAttribute('style', stl);
      } else {
        elem.removeAttribute('style');
      }
  	}

  	function getOuterWH(elem) {
      var h = elem.offsetHeight,
  			  w = elem.offsetWidth;

      if ( w && h ) {
        return {
          width: w,
          height: h
        };
      }

  		parentsEach( elem, showIt );
  		h = elem.offsetHeight;
  		w = elem.offsetWidth;

  		parentsEach( elem, hideIt );

  		return {
  			width: w,
  			height: h
  		};
  	}

  	function parentsEach( elem, callback ) {

  		while( elem.parentNode && elem.parentNode != document ) {
  			elem = elem.parentNode;

  			callback(elem);
  		}
  	}
  })(jQuery);
})
