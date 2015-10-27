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

		var aboutBrow = f.aboutBrow();
		$(document.body).toggleClass("mobile", aboutBrow.isMobile);

		// some inits...
		this.$header = $(".header");
		$(window).on("scroll", this.onScroll.bind(this));
		this.onScroll();

		this.initClients();
	};

	MainApp.prototype.onScroll = function() {
		var scroll = f.getScroll();
		this.$header.toggleClass("sticky", scroll.top > 100);
	};

	MainApp.prototype.initClients = function() {
		this.$sectionClients = $(".section-clients");
		this.$clients = this.$sectionClients.find(".clients li");

		this.$clients.each(function() {
			var $li = $(this);
			$li.data("top", $li.css("top"));
		});

		this.$clientsNav = this.$sectionClients.find(".nav");
		this.$clientsNavAllFilter = this.$clientsNav.find("a[href='#all']").parent();
		this.$clientsNav.on("click", function(e) {
			if ( e.target.tagName.toLowerCase() != "a" ) {
				return;
			}

			e.preventDefault();
			var $a = $(e.target),
				href = $a.attr("href"),
				tag = href.slice(1),
				$li = $a.parent();

			if ( tag != "all" ) {
				$li.toggleClass("active");
				if ( $li.hasClass("active")  ) {
					this.$clientsNavAllFilter.removeClass("active");
				}

				if ( this.getClientsActiveTags().length == 0 ) {
					this.$clientsNavAllFilter.addClass("active");
				}
			} else {
				this.$clientsNav.find("li").removeClass("active");
				$li.addClass("active");
			}

			this.filterClients();
		}.bind(this));

	};

	MainApp.prototype.getClientsActiveTags = function() {
		var tags = [];
		this.$clientsNav.find(".active").each(function() {
			var $li = $(this),
				$a = $li.children(),
				href = $a.attr("href"),
				tag = href.slice(1);

			tags.push(tag);
		});
		return tags;
	}

	MainApp.prototype.filterClients = function() {
		var toShowCount = 0;
		var activeTags = this.getClientsActiveTags();
		this.$clients.each(function() {
			var $li = $(this),
				tags = $li.data("tags").split(" "),
				toShow =  activeTags.length == 0,
				top = parseInt($li.data("top"));

			for (var i=0, n=activeTags.length; i<n; i++) {
				if ( tags.indexOf(activeTags[i]) != -1 ) {
					toShow = true;
					break;
				}
			}


			$li.css("opacity", toShow ? 1 : 0);

			if ( toShow ) {
				toShowCount++;
			} else {
				top -= 50;
			}

			$li.stop().clearQueue()
				.animate({
					"top": top + "px"
				});
		});

		this.$sectionClients.toggleClass("no-items", toShowCount == 0)
	};

	return MainApp;
})
