
;(function($) {
	'use strict';
		// автоплагинация
	var jqPluginAttr = 'jq-plugin';
	
	
	$.fn.autoPlugin = function( _pluginNames ) {
	
		return this.each(function() {
			var el = this
				, $el = $(this)
				, pluginNames = (_pluginNames || $el.attr(jqPluginAttr) || "").split(/\s*,\s*/ig)
				, plugins = pluginNames.map(function( pluginName ) {
					return $.fn[ pluginName ] || function() {}
				})
				, args = $el.attr('params') == 'dataset' ? [$el.data()] : []
			;
			
			plugins.forEach(function( plugin ) {
				plugin.apply($el, args);
			});
		});
	}
	$.fn.autoPlugin.jqPluginAttr = jqPluginAttr;
})(jQuery);

