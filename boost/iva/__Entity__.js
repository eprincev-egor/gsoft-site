define([
	"funcs",
	"eva",
	"classes/__Entity__/view/__Entity__View",
	"classes/__Entity__/model/__Entity__Items",
	"classes/__Entity__/api/__Entity__Api",
	"css!classes/__Entity__/css/__Entity__"
], function(f, Events, __Entity__View, __Entity__Items, __Entity__Api) {
	"use strict";
	
	var __Entity__ = f.CreateClass("__Entity__", {
		Api: __Entity__Api,
		Items: __Entity__Items,
		View: __Entity__View
	}, Events);

	__Entity__.prototype.init = function(params) {
		params = params || {};

		for (var key in params) {
			this[key] = params[key];
		}

		this.initBox(params);
		this.initItems(params);
		this.initView(params);
		this.initApi(params);
	};

	__Entity__.prototype.initItems = function(params) {
		this.items = new (this.Items || __Entity__Items)();
	};

	__Entity__.prototype.initView = function(params) {
		this.view = new (this.View || __Entity__View)({
			__entity__: this,
			collection: this.items,
			el: this.box
		});
	};

	__Entity__.prototype.initApi = function(params) {
		this.api = new (this.Api || __Entity__Api)({
			__entity__: this
		});
	};

	__Entity__.prototype.initBox = f.initBox;

	return __Entity__;
})
