define([
	"funcs",
	"eva",
	"jquery",
	"classes/__Entity__/model/__Entity__Model",
	"classes/__Entity__/view/__Entity__View",
	"css!classes/__Entity__/css/__Entity__.css"
], function(f, Events, $, __Entity__Model, __Entity__View) {
	"use strict";
	
	var __Entity__ = f.CreateClass("__Entity__", {
		Model: __Entity__Model,
		View: __Entity__View
	}, Events);
	
	__Entity__.prototype.init = function(params) {
		params = params || {};
		for (var key in params) {
			this[key] = params[key];
		}
		
		this.initBox(params);
		this.initModel(params);
		this.initView(params);
	}
	
	__Entity__.prototype.initBox = f.initBox;
	
	__Entity__.prototype.initModel = function(params) {
		this.model = new this.Model(params.data);
	};
	
	__Entity__.prototype.initView = function(params) {
		this.view = new this.View({
			model: this.model,
			__entity__: this,
			el: this.box
		});
	};
	
	return __Entity__;
})