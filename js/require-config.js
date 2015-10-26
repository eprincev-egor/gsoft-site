define([], function() {
    'use strict';

    window.CKEDITOR_BASEPATH = "/components/ckeditor/";

  require.config({
    //urlArgs: "bust=" + (new Date()).getTime(),
    shim: {
      backbone: {
        deps: ['underscore', 'jquery'],
        exports: 'Backbone'
      },
      marionette: {
        deps: ['jquery', 'underscore', 'backbone']
      },
      underscore: {
        exports: '_'
      },
      datetimepicker: {
        deps: ['jquery']
      },
	  jqueryui: {
		deps: ["css!/components/jquery-ui/themes/base/all"]
	  },
	  owl: {
		deps: ["css!/css/owl.carousel"]
	  },
	  bootstrap: {
	    deps: ["css!/components/bootstrap/dist/css/bootstrap.min"]
	  }
    },
    paths: {
		lodash: '/components/lodash/lodash.min',
		owl: 'plugins/owl.carousel.min',
		ymaps: 'http://api-maps.yandex.ru/2.1/?lang=ru_RU',
		template: "lib/require.template",
		css: "lib/require.css",
		text: 'lib/require.text',
		jquery: '/components/jquery/dist/jquery.min',
		jqueryui: '/components/jquery-ui/jquery-ui.min',
		bootstrap: '/components/bootstrap/dist/js/bootstrap.min',
		backbone: '/components/backbone.marionette/lib/backbone.marionette.min',
		underscore: '/components/underscore/underscore-min',
		eva: 'classes/Events',
		templater: 'classes/parser/Templater',
		funcs: 'funcs',
		datetimepicker: 'plugins/jquery.datetimepicker'
    }
  });

})
