define([
	"funcs",
	"classes/Api"
], function(f, Api) {
	"use strict";
	
	var __Entity__Api = Api.extend("__Entity__Api", {
		entity: "__entity__"
	});
	
	__Entity__Api.prototype.init = function(params) {
		params = params || {};
		
		for (var key in params) {
			this[key] = params[key];
		}
		
		
	};
	
	return __Entity__Api;
});