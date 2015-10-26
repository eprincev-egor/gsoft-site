define([
	"funcs",
	"eva",
	"jquery"
], function(f, Events, $) {
	
	var MainApp = f.CreateClass("MainApp", {}, Events);
	
	MainApp.prototype.init = function(params) {
		params = params || {};
		for (var key in params) {
			this[key] = params[key];
		}
		
		// some inits...
	};
	
	return MainApp;
})