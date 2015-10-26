define([
	"funcs",
	"eva",
	"jquery"
], function(f, Events, $) {
	"use strict";
	
	var __Entity__App = f.CreateClass("__Entity__App", {}, Events);
	
	__Entity__App.prototype.init = function(params) {
		params = params || {};
		for (var key in params) {
			this[key] = params[key];
		}
		
		// some inits...
	};
	
	return __Entity__App;
})