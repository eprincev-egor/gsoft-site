define([
	"funcs",
	"marionette",
	"template!classes/__Entity__/template/__entity__.html"
], function(f, Marionette) {
	"use strict";
	
	var __Entity__View = Marionette.ItemView.extend({
		tagName: "div",
		className: "__entity__",
		template: "#__entity__-template",
		
		initialize: function(params) {
			params = params || {};
			this.__entity__ = params.__entity__;
		},
		
		onRender: function() {
			
		}
	});
	
	return __Entity__View;
})