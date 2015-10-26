define([
	"funcs",
	"marionette",
	"template!classes/__Entity__/template/__Entity__.html"
], function(f, Marionette) {
	"use strict";
	
	var __Entity__View = Marionette.CompositeView.extend({
		tagName: "div",
		className: "__entity__",
		template: "#__Entity__",
		
		initialize: function(params) {
			this.__entity__ = params.__entity__;
		}
	});
	
	return __Entity__View;
})