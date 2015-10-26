var f = {
			// функции для проверок и тд
			classOf : function( a ) {
				return {}.toString.call( a ).slice(8, -1);
			}
			, isCollection : function( a ) {
				return f.isArray( a ) && a.length == 1 && f.isObject( a[0] )
					|| f.isArray( a ) && a.length == 2 && f.isObject( a[0] ) && f.isObject( a[1] )
				;
			}

			, isFileList: function(a) {
				return f.classOf(a) == 'FileList';
			}

			, isFunction : function( a ) {
				return typeof a === 'function';
			}
			, isArray : function( a ) {
				return f.classOf( a ) == 'Array';
			}
			, isObject : function( a ) {
				return f.classOf( a ) == 'Object';
			}
			, isObjOrArr : function(a) {
				return f.isObject(a) || f.isArray(a);
			}
			, isString : function( a ) {
				return typeof a == 'string';
			}
			, isNumber : function( a ) {
				return typeof a == 'number';
			}
			, isTypeWithParams : function( a ) {
				/*
					a === ['type', { ... }]
				*/
				return f.isArray( a ) && a.length == 2 && f.isString( a[0] ) && f.isObject( a[1] );
			}
			, isFile : function(a) {
				return a instanceof window.File || a instanceof window.Blob;
			}
			// проверяем является ли объект непосредственным наследником Object.prototype
			, isEasyObject: function(obj) {
				if ( !f.isObject(obj) ) {
					return false;
				}

				return Object.getPrototypeOf(obj) === Object.prototype;
			}
			, isArrayWithFuncs: function(arr) {
				if ( !f.isArray(arr) ) {
					return false;
				}

				for (var i=0, n=arr.length; i<n; i++) {
					if ( !f.isFunction(arr[i]) ) {
						return false;
					}
				}

				return true;
			}
			, isEvent: function(ev) {
				var out = false;
				if ( typeof jQuery != 'undefined' || typeof Events != 'undefined' ) {

					if ( typeof jQuery != 'undefined' ) {
						out = out || ev instanceof jQuery.Event;
					}

					if ( typeof Events != 'undefined' ) {
						out = out || ev instanceof Events;
					}
				}
				return out;
			}
			, isNaN: function(a) {
				return f.isNumber(obj) && +a !== a;
			}
			, isPrimitive: function(a) {
				return typeof a !== 'object' && a !== null;
			}
		};
	
	f.deepMixin = function() {
		var obj = {},
			objs = [];

		[].forEach.call(arguments, function(obj) {
			if ( f.isObject(obj) ) {
				objs.push(obj);
			}
		});

		function mixin(a, b) {
			var value;

			for (var key in b) {
				value = b[key];

				if ( f.isEasyObject(value) ) {
					if ( !f.isObject(a[key]) ) {
						a[key] = {};
					}
					mixin(a[key], value);
				} else
				if ( f.isArray(value) ) {
					a[key] = [];
					value.forEach(function(elem) {
						a[key].push( f.deepClone({x:elem}).x );
					});
				} else {
					a[key] = value;
				}
			}

			return a;
		}

		objs.forEach(function(copyObj) {
			mixin(obj, copyObj);
		});

		return obj;
	};
	
	f.deepClone = function(obj) {

		function cloneValue(value) {
			var out = value,
					arr;

			if ( f.isEasyObject(value) ) {
				out = f.deepClone(value);
			} else
			if ( f.isArray(value) ) {
				arr = [];
				for (var i=0, n=value.length; i<n; i++) {
					arr[i] = cloneValue(value[i]);
				}
				out = arr;
			}

			return out;
		}

		var clone = {}, value;
		for (var key in obj) {
			clone[key] = cloneValue( obj[key] );
		}

		return clone;
	};
	
	module.exports = f;