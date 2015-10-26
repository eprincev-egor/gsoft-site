define([
	"funcs",
	"marionette",
	"template!classes/__Entity__/template/__Entity__-item.html"
], function(f, Marionette) {
	"use strict";
	
	var __Entity__ItemView = Marionette.ItemView.extend({
		tagName: "div",
		className: "__entity__-item",
		template: "#__Entity__-item"
	});
	
	return __Entity__ItemView;
})