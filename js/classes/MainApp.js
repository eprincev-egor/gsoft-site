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
		this.$header = $(".header");
		$(window).on("scroll", this.onScroll.bind(this));
		this.onScroll();
	};

	MainApp.prototype.onScroll = function() {
		var scroll = f.getScroll();
		this.$header.toggleClass("sticky", scroll.top > 100);
	};

	return MainApp;
})
