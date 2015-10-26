define([
	"funcs",
	"eva"
], function(f, Events) {
	"use strict";
	
	var __Entity__ = f.CreateClass("__Entity__", {}, Events);
	
	__Entity__.prototype.init = function(params) {
		params = params || {};
		
		for (var key in params) {
			this[key] = params[key];
		}
		
		
	};
	
	return __Entity__;
})