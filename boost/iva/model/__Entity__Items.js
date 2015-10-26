define([
	"funcs",
	"backbone",
	"classes/__Entity__/model/__Entity__Model"
], function(f, Backbone, __Entity__Model) {
	"use strict";
	
	var __Entity__Items = Backbone.Collection.extend({
		model: __Entity__Model
	});
	
	return __Entity__Items;
})