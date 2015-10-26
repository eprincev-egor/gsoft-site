	"use strict";
	var fs = require("fs");
	var f = require("./f");
	
	function Boost(name, entityPath) {
		this.name = name || "default";
		this.path = "boost/" + this.name;
		this.entityPath = entityPath;
		
		var entity = entityPath.split("/").slice(-1)[0];
		
		this.entity = entity;
		this.__Entity__ = entity[0].toUpperCase() + entity.slice(1);
		this.__entity__ = entity[0].toLowerCase() + entity.slice(1);
		
		this.initConfig();
		this.initRegExp();
		this.initVars(entity, name);
		this.run();
	}
	
	Boost.prototype.run = function() {
		this.outPath = this.entityPath.split("/").slice(0, -1).join("/");
		if ( this.initOutDir() === false ) {
			return;
		}
		
		this.deepCopy(this.path, this.outPath);
		console.log("success! " + this.outPath);
	};
	
	Boost.prototype.initOutDir = function() {
		try {
			fs.mkdirSync(this.outPath);
		} catch(e) {
			if ( this.config.autoRemove ) {
				try {
					this.deepRemove(this.outPath);
					fs.mkdirSync(this.outPath);
				} catch (e) {
					console.log(e);
				}
			} else {
				console.log("please remove dir: " + this.outPath);
				return false;
			}
		}
	};
	
	Boost.prototype.deepRemove = function(path) {
		var stats = fs.statSync(path);
		if ( stats.isDirectory() ) {
			var files = fs.readdirSync(path);
			for (var i in files) {
				this.deepRemove(path + "/" + files[i]);
			}
			fs.rmdirSync(path);
		} else 
		if ( stats.isFile() ) {
			fs.unlinkSync(path);
		}
	};
	
	Boost.prototype.initConfig = function() {
		this.configFile = "boost.js";
		this.config = {};
		var config = {
			prefix: "__",
			postfix: "__",
			path: ""
		};
		
		var plugin;
		try {
			plugin = fs.readFileSync(this.path + "/" + this.configFile).toString();
			plugin = new Function("require", plugin);
			plugin.apply(this, [require]);
			this.config = this.mixinConfig(config, this.config);
		} catch(e) {
			console.log(e);
			this.config = config;
			console.log("started with default config");
		}
	};
	
	Boost.prototype.mixinConfig = function(a, b) {
		return f.deepMixin(a, b);
	};
	
	Boost.prototype.initVars = function() {
		this.vars = {
			entity: this.__entity__,
			Entity: this.__Entity__
		};
	};
	
	Boost.prototype.isSystemFile = function(name, path) {
		return this.configFile == name;
	}
	
	Boost.prototype.initRegExp = function() {
		this.regExp = new RegExp(this.config.prefix + "(\\w+)" + this.config.postfix, "g");
	};
	
	Boost.prototype.replaceWords = function(text) {
		return text.replace(this.regExp, function(str, varName) {
			if ( varName in this.vars ) {
				return this.vars[varName];
			} else {
				return str;
			}
		}.bind(this));
	}
	
	Boost.prototype.deepCopy = function(from, to) {
		var files = fs.readdirSync(from);
		var name, stats, text, data, topath, frompath;
		
		for (var i in files) {
			name = files[i];
			if ( this.isSystemFile(name, from) ) {
				continue;
			}
			
			frompath = from + "/" + name;
			topath = to + "/" + this.replaceWords(name);
			
			stats = fs.statSync(frompath);
			
			if ( stats.isFile() ) {
				data = fs.readFileSync(from + "/" + name);
				if ( /(\.js|\.css|\.html)$/.test(name) ) {
					text = data.toString();
					fs.writeFileSync(topath, this.replaceWords(text));
				} else {
					fs.writeFileSync(topath, data);
				}
			} else
			if ( stats.isDirectory() ) {
				fs.mkdirSync(topath);
				this.deepCopy(frompath, topath);
			}
		}
	}
	
	module.exports = Boost;