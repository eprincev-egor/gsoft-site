;(function(define, window) {
define([], function() {
	'use strict';

	// http://ejohn.org/blog/objectgetprototypeof/
	// определение прототипа объекта
	if ( typeof Object.getPrototypeOf !== "function" ) {
	  if ( typeof "test".__proto__ === "object" ) {
	    Object.getPrototypeOf = function(object){
	      return object.__proto__;
	    };
	  } else {
	    Object.getPrototypeOf = function(object){
	      // May break if the constructor has been tampered with
	      return object.constructor.prototype;
	    };
	  }
	}

	String.prototype.has = function( subStr ) {return !!~this.indexOf( subStr );}
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
				return typeof a == 'number' && +a === a;
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
				return typeof a == 'number' && +a !== a;
			}
			, isPrimitive: function(a) {
				return typeof a !== 'object' && a !== null;
			}
			, isDate: function(a) {
				return f.classOf(a) == "Date";
			}
			, isDateDistance: function(a) {
				return f.isObject(a) && f.isNumber(a.start) && f.isNumber(a.end);
			}
			, isBoolean: function(a) {
				return typeof a === "boolean";
			}
		}
	;

	function gwh(doc){
		doc = doc || document;
		var elem  = doc.compatMode == 'CSS1Compat' ? doc.documentElement : doc.body;
		return [elem.clientWidth, elem.clientHeight];
	}
	window.gwh = f.gwh = gwh;


	f.extend = function(Child, Parent) {
		var F;
		if ( Parent._className ) {
			F = new Function("", "function "+ Parent._className +"(){}")
		} else {
			F = function(){};
		}
		F.prototype = Parent.prototype;
		Child.prototype = new F();
		Child.prototype.constructor = Child;
		Child.superclass = Parent.prototype;

		if ( !Parent.Children ) {
			Parent.Children = [];
		}

		if ( Parent.Children.indexOf(Child) == -1 ) {
			Parent.Children.push(Child);
		}
	};


	f.getPrototypes = function(obj) {
		var proto = Object.getPrototypeOf(obj),
				protos = [];

		while (proto) {

			if ( proto == Object.prototype ) {
				return protos;
			}

			protos.push(proto);
			proto = Object.getPrototypeOf(proto);
		}

		return protos;
	};

	var calls = [];
	calls.indexOf = function(context, name) {
		var index = -1;

		for (var i=0, n=this.length; i<n; i++) {
			if ( this[i].context === context && this[i].name === name ) {
				index = i;
				break;
			}
		}

		return index;
	};
	calls.add = function(context, name, data) {
		var index = this.indexOf(context, name);
		if ( index != -1 ) {
			return this;
		}

		this.push({
			context: context,
			name: name,
			data: data
		});
		return this;
	};
	calls.remove = function(context, name) {
		var index = this.indexOf(context, name);
		if ( index == -1 ) {
			return this;
		}

		this.splice(index, 1);
		return this;
	};
	calls.get = function(context, name) {
		var index = this.indexOf(context, name);
		if ( index != -1 ) {
			return this[index].data;
		}
	};
	calls.set = function(context, name, data) {
		var index = this.indexOf(context, name);
		if ( index == -1 ) {
			this.push({
				context: context,
				name: name,
				data: data
			})
		} else {
			this[index].data = data;
		}
	};
	calls.clear = function() {
		while(this.pop()){}
	};

	f.applyParentMethod = function(context, name, args) {
		if ( arguments.length < 3 ) {
			console.error('Invalid call');
		}

		var call = calls.get(context, name);
		if ( call ) {
			return call.apply(this, arguments);
		}

		var protos = f.getPrototypes(context),
			methods = [],
			method,
			result;

		for (var i=0, n=protos.length; i<n; i++) {
			if ( f.isFunction(protos[i][name]) ) {
				methods.push( protos[i][name] );
			}
		}

		if ( methods.length < 2 ) {
			return;
		}

		methods.shift();
		method = methods.shift();
		calls.set(context, name, function(_context, _name, _args) {
			method = methods.shift();
			if ( !f.isFunction(method) ) {
				return;
			}

			return method.apply(context, _args);
		});

		result = method.apply(context, args);
		calls.remove(context, name);

		return result;
	};

	f.callParentMethod = function(context, name) {
		var args = [].slice.call(arguments, 2);
		f.applyParentMethod(context, name, args);
	};

	f.CreateConstructor = function(className, func) {
		var defClassName = "MyClass";

		if ( arguments.length == 0 ) {
			className = defClassName;
		}

		if ( f.isFunction(className) ) {
			if ( f.isFunction(func) ) {
				var originalConstructuctor = className,
					otherConstructor = func;

				func = function() {
					// для Singleton
					var that = originalConstructuctor.apply(this, arguments);
					otherConstructor.apply(that, arguments);
					return that;
				}
			} else {
				func = className;
			}

			if ( /^function \w+/gi.test(className.toString()) ) {
				className = className.toString().match(/function (\w+)/)[1] || defClassName;
			} else {
				className = defClassName;
			}
		}

		if ( !func ) {
			func = f.defaultConstructor();
		}
		// для того, чтобы в консоли объекты класса
		// подписивались именем className, воспользуемся new Function
		var MyClass = new Function("func", "return function " + className + "(){\n\rif(!this.constructor){this.constructor = "+ className +"};\n\r return func.apply(this, arguments)};")(func);
		MyClass._className = className;
		return MyClass;
	};

	f.findMethodBy = function(MyClass, name) {
		if ( f.isFunction(MyClass.prototype[name]) ) {
			return MyClass.prototype[name];
		}

		while ( MyClass.Parent ) {
			MyClass = MyClass.Parent;
			if ( f.isFunction(MyClass.prototype[name]) ) {
				return MyClass.prototype[name];
			}
		}
	};

	f.applyAction = function(MyClass, actionNames, context, args) {
		if ( !f.isString(actionNames) ) {
			actionNames = actionNames+"";
		}

		var names = actionNames.split(/\s+/);
		for (var i=0, name, method, n=names.length; i<n; i++) {
			name = names[i];
			// если в прототипе есть метод, то вызваем его
			method = f.findMethodBy(MyClass, 'action_' + name);

			if ( f.isFunction(method) ) {
				method.apply(context, args);
			}
		}
	};

	f.CreateClass = function(className, proto, Parent) {
		var MyClass;
		if ( f.isFunction(className) ) {
			MyClass = f.CreateConstructor(className, f.defaultConstructor());
			className = MyClass._className;
		} else {
			MyClass = f.CreateConstructor(className);
		}

		// наследование и
		// ссылка на конструктор родителя
		if ( f.isFunction(Parent) ) {
			f.extend(MyClass, Parent);
			MyClass.Parent = Parent;
		} else {
			MyClass.Parent = null;
		}


		// запись имени класса
		MyClass._className = className || "MyClass";
		// объект, из которого будет заполнятся каждый новый объект
		MyClass._defaults = {};

	    // если в прототипе будут лежать св-ва-не методы
	    // то изменение этих св-в приведет к глобальному изменению св-ва у всех объектов,
	    // привязанных к прототипу
	    // поэтому разделяем объект proto на методы и "значения по умолчанию"
		for (var key in proto) {
			if ( f.isFunction(proto[key]) ) {
				MyClass.prototype[key] = proto[key];
			} else {
				MyClass._defaults[key] = proto[key];
			}
		}

		MyClass.applyAction = function(actionNames, context, args) {
			return f.applyAction(MyClass, actionNames, context, args);
		}

		MyClass.applyMethod = function(name, context, args) {
			var method = f.findMethodBy(MyClass, name);
			if ( f.isFunction( method ) ) {
				return method.apply(context, args);
			}
		}

		MyClass.callMethod = function(name, context) {
			var args = [].slice.call(arguments, 2);
			return this.applyMethod(name, context, args);
		};

		MyClass.mathDefaults = function() {
			return mathDefaults(MyClass);
		}

		MyClass.extend = function(_className, proto) {
			var SelfClass = this;

			if ( arguments.length == 0 ) {
				_className = "Child" + className;
			}

			if ( arguments.length == 1 && f.isObject(_className) ) {
				proto = _className;
				_className = "Child" + className;
			}

			if ( !f.isObject( proto ) ) {
		      proto = {};
		    }

			return f.CreateClass(_className, proto, SelfClass);
		};

		return MyClass;
	};

	// проходим по цепочке конструкторов и собираем
	// значения по умолчанию в один объект
	function mathDefaults(Child) {
		if ( !Child ) {
			Child = this.constructor;
		}

		var defaultsArr = [Child._defaults],
				defaults = {};

		while ( f.isFunction( Child.Parent ) ) {
			Child = Child.Parent;
			defaultsArr.push(Child._defaults);
		}

		defaults = f.deepMixin.apply(f, defaultsArr.reverse());
		//defaultsArr.reverse().forEach(function(_defaults) {
		//	defaults = f.deepMixin(defaults, f.deepClone(_defaults));
		//})

		return defaults;
	}
	f.mathDefaults = mathDefaults;

	f.defaultConstructor = function() {
		var DefConstructor = function(params) {
			var that = this;
			if ( !f.isObject(that) ) {
				that = {};
			}

			if ( !f.isObject(params) ) {
				params = {};
			}

			if ( f.isFunction(that.eventInit) ) {
				that.eventInit(params.events);
			}

			var defaults = mathDefaults.call(that);
			// значения по умолчанию
			for (var key in defaults) {
				that[key] = defaults[key];
			}

			if ( f.isFunction( that.init ) ) {
				that.init.apply(that, arguments);
			}

			return that;
		};

		return DefConstructor;
	};

	f.initParams = function(that, def, params) {
		if ( !f.isObject(that) ) {
			that = {};
		}
		if ( !f.isObject(def) ) {
			def = {};
		}
		if ( !f.isObject(params) ) {
			params = {};
		}

		for (var key in def) {
			if ( key in params ) {
				that[key] = params[key];
			} else {
				that[key] = def[key];
			}
		}

		for (var key in params) {
			if ( key in def ) {
				continue;
			}

			that[key] = params[key];
		}

		return that;
	};

	f.justClone = function(obj) {
		var clone = {};

		for (var key in obj) {
			clone[key] = obj[key];
		}

		return clone;
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

		var clone, value;
		if ( f.isObject(obj) ) {
			clone = {};
			for (var key in obj) {
				clone[key] = cloneValue( obj[key] );
			}
		} else {
			clone = cloneValue(obj);
		}

		return clone;
	};

	f.json2formDataArr = function(data, keyPrefix) {

		function value2arr(value, keyPrefix) {
			if ( !keyPrefix ) {
				keyPrefix = "";
			}

			var out = [];

			if ( f.isFileList(value) ) {
				for(var i=0, val, n=value.length; i<n; i++) {
					val = value[i];
					out = out.concat(value2arr(val, keyPrefix + '[]'));
				}
			} else

			if ( f.isArray(value) ) {
				for(var i=0, val, n=value.length; i<n; i++) {
					val = value[i];
					out = out.concat(value2arr(val, keyPrefix + '[]'));
				}
			} else
			if ( f.isObject(value) ) {
				out = out.concat(f.json2formDataArr(value, keyPrefix));
			} else {
				out.push({
					key: keyPrefix,
					value: value
				})
			}

			return out;
		}

		if (!keyPrefix) {
			keyPrefix = "";
		}

		var out = [];
		for (var key in data) {
			if ( keyPrefix ) {
				out = out.concat(value2arr(data[key], keyPrefix + '[' + key + ']' ));
			} else {
				out = out.concat(value2arr(data[key], key ));
			}
		}

		return out;
	};

	function http_build_query(formdata, arg_separator) {

	  var value, key, tmp = [],
		that = this;

	  var _http_build_query_helper = function(key, val, arg_separator) {
		var k, tmp = [];
		if (val === true) {
		  val = '1';
		} else if (val === false) {
		  val = '0';
		}
		if (val != null) {
		  if (typeof val === 'object') {
			for (k in val) {
			  if (val[k] != null) {
				tmp.push(_http_build_query_helper(key + '[' + k + ']', val[k], arg_separator));
			  }
			}
			return tmp.join(arg_separator);
		  } else if (typeof val !== 'function') {
			return encodeURIComponent(key) + '=' + encodeURIComponent(val);
		  } else {
			throw new Error('There was an error processing for http_build_query().');
		  }
		} else {
		  return '';
		}
	  };

	  if (!arg_separator) {
		arg_separator = '&';
	  }
	  for (key in formdata) {
		value = formdata[key];
		var query = _http_build_query_helper(key, value, arg_separator);
		if (query !== '') {
		  tmp.push(query);
		}
	  }

	  return tmp.join(arg_separator);
	}
	window.http_build_query = f.http_build_query = http_build_query;

	function getScroll() {
	  var     x = 0
			, y = 0
			, html = document.getElementsByTagName('html')[0]
			, body = document.body;

		if ( window.pageXOffset != undefined ) {
			y = pageYOffset;
			x = pageXOffset;
		} else {
			y = (html.scrollTop||body&&body.scrollTop||0) - html.clientTop;
			x = (html.scrollLeft||body&&body.scrollLeft||0) - html.clientLeft;
		}

		return {
				top : y,
				left : x
			};
	}
	window.getScroll = f.getScroll = getScroll;

	f.easyMixin = function(defParams, options) {
		var obj = {};

		if ( !f.isObject(options) ) {
			options = {};
		}

		for (var key in defParams) {
			if ( key in options ) {
				obj[key] = options[key];
			} else {
				obj[key] = defParams[key];
			}
		}

		return obj;
	}

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

	f.mixin = function(a, b) {
		var obj = {};

		for (var key in a) {
			obj[key] = a[key];
		}

		for (var key in b) {
			obj[key] = b[key];
		}

		return obj;
	}

	f.cloneObj = function(obj) {
		var clone = {};
		for (var key in obj) {
			clone[key] = obj[key];
		}
		return clone;
	};

	// http://javascript.ru/ajax/intro
	f.getXHR = function() {
		var xmlhttp;
		try {
			xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (E) {
				xmlhttp = false;
			}
		}
		if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
			xmlhttp = new XMLHttpRequest();
		}
		return xmlhttp;
	};

	// объеденение массивов
	f.arrayMerge = function(a, b) {
		var c = b.slice();

		for (var i=0, n=a.length; i<n; i++) {
			if ( b.indexOf(a[i]) == -1 ) {
				c.push(a[i]);
			}
		}

		return c;
	};

	f.ajaxSend = function(){};
	// кроссбраузерная отправка данных с файлами
	// если есть FormData, то используем его, иначе Iframe
	;(function() {
		function createElem(tagName) {
			var elem = document.createElement(tagName);
			elem.id = 'js-temp-elem-' + (+new Date()) + parseInt( Math.random() * 10000 );
			document.body.appendChild(elem);
			elem = document.getElementById(elem.id);
			return elem;
		}


		if ( window.FormData ) {
			f.ajaxSend = function(params) {
				if ( arguments.length > 1 ) {
					params = {
						method: params,
						url: arguments[1],
						data: arguments[2],
						onSuccess: arguments[3],
						onError: arguments[4]
					}
				};

				params = $.extend({
					noConsoleError: false,
					method: 'POST',
					url: "_blank.html",
					data: {},
					onSuccess: function(){},
					onError: function(){},
					onProgress: function(){}
				}, params);

				var onSuccess = params.onSuccess;
				var onError = params.onError;
				var onProgress = params.onProgress;
				var data = params.data;
				var url = params.url;
				var method = params.method;

				if ( !f.isFunction(onSuccess) ) {
					onSuccess = function(){}
				}

				if ( !f.isFunction(onError) ) {
					onError = function(){}
				}

				if ( !f.isFunction(onProgress) ) {
					onProgress = function(){}
				}

				var xhr = f.getXHR(),
					formData = new FormData(),
					values = f.json2formDataArr(data);

				values.forEach(function(elem) {
					formData.append(elem.key, elem.value);
				});

				xhr.open(method, url);
				xhr.onload = function() {
					if ( xhr.status != 200 ) {
						return;
					}

					var response = xhr.responseText;
					var json = {};
					try {
						json = $.parseJSON(response);
					} catch(e) {
						json = {};
						if ( !params.noConsoleError ) {
							console.error(e);
						}
					}

					onSuccess(json);
				};

				xhr.onreadystatechange = function() {
					if ( xhr.readyState != 4 ) {
						return;
					}

					if ( xhr.status != 200 ) {
						onError(xhr);
					}
				};

				xhr.onprogress = onProgress;

				xhr.send(formData);
			}
		} else {
			// а здесь пока ничего не придумал =)
			f.ajaxSend = function(method, url, data, callback) {

			}
		}
	})();

	;(function() {
		var copy2clipboard,
			elem;

		if ( typeof document == 'undefined' ) {
			return;
		}

		if ( window.clipboardData ) { // IE
			copy2clipboard = function(text) {
				window.clipboardData.setData('text', text);
			}
		} else { // Other
			elem = document.createElement('pre');
			elem.style.visibility = 'hidden';
			elem.style.position = 'absolute';
			elem.style.top = '-999999px';
			elem.style.left = '-999999px';

			//elem.contentEditable = true; // Mozilla
			//document.designMode = 'On';

			elem.id = 'js-clipboard-elem-' + +new Date();
			document.body.appendChild(elem);
			elem = document.getElementById(elem.id);

			copy2clipboard = function(text) {
				elem.innerHTML = text;
				elem.style.visibility = 'visible';

				window.getSelection().removeAllRanges();
				var range = document.createRange();
				range.selectNodeContents(elem);
				window.getSelection().addRange(range);

				try {
				// Now that we've selected the anchor text, execute the copy command
					document.execCommand('copy');
				} catch(err) {

				}

				// Remove the selections - NOTE: Should use
				// removeRange(range) when it is supported
				window.getSelection().removeAllRanges();
				elem.style.visibility = 'hidden';
			}
		}


		f.copy2clipboard = copy2clipboard;
	})();

	f.getMousePoint = function(e) {
		return f.getTouchPoint(e);
	};

	f.getTouchPoint = function(e) {
		if ( e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length > 0 ) {
			return {
	            x: e.originalEvent.touches[0].pageX,
	            y: e.originalEvent.touches[0].pageY
	        };
		} else {
			return {
				x: e.pageX,
				y: e.pageY
			}
		}
    };

	f.removeRepeat = function(arr) {
		var newArr = [];
		for (var i=0, n=arr.length; i<n; i++) {
			if ( newArr.indexOf(arr[i]) == -1 ) {
				newArr.push(arr[i]);
			}
		}
		return newArr;
	};

	f.timestamp2userdate = function(timestamp) {
        var date = new Date(timestamp);
        var month = date.getMonth() + 1;

		// дата некорректна
        if ( month + "" == "NaN" ) {
            return "";
        }

		var hours = date.getHours();
		var minutes = date.getHours();

        if ( month < 10 ) {
            month = "0" + month;
        }
		if ( hours < 10 ) {
			hours = "0" + hours;
		}
		if ( minutes < 10 ) {
			minutes = "0" + minutes;
		}

		var day = date.getDate();
		if ( day < 10 ) {
			day = "0" + day;
		}

        return day + "." + month + "." + date.getFullYear() + " " + hours + ":" + minutes;
    }

	function isVirtualId(id) {
        return !id || /^virtual/.test(id);
    }
	// на входе получаем 2 массива строк
	// на выходе получаем 3 массива:
	// массив строк на добавление
	// массив строк на удаление
	// массив строк на ищменение
	f.mathChanges = function(last, current) {
		if ( !f.isArray(last) ) {
			last = [];
		}

		if ( !f.isArray(current) ) {
			current = [];
		}

        var changes = {
            update: [],
            remove: [],
            create: []
        };

        // сравниваем состояние строк
        function eq(current, last) {
            for (var key in current) {
                if ( !(key in last) || current[key] != last[key] ) {
                    return false;
                }
            }

            for (var key in last) {
                if ( !(key in current) || current[key] != last[key] ) {
                    return false;
                }
            }

            return true;
        }

        // сначало найдем строки, которые необходимо удалить
        // а это все строки, которых нет в current, но есть в last
        // и эти строки имеют "настоящий" id (начинается не с virtual-id)
        var id, toRemove;
        for (var i=0, n=last.length; i<n; i++) {
            id = last[i]._id;
            if ( isVirtualId(id) ) {
                continue;
            }

            toRemove = true;
            for (var j=0, m=current.length; j<m; j++) {
                if ( current[j]._id != id ) {
                    continue;
                }

                toRemove = false;
                break;
            }

            if ( toRemove ) {
                changes.remove.push(last[i]);
            }
        }

        // поиск по current:
        // теперь найдем те строки, которые имеют виртуальный id
        // их отправим на добавления, а те кто имеют настоящий id
        // сравним с предыдущим состоянием, и если состояние изменилось,
        // то отправим их на update
        var row, toUpdate;
        for (var i=0, n=current.length; i<n; i++) {
            row = current[i];
            if ( isVirtualId(row._id) ) {
                changes.create.push(row);
                continue;
            }

            toUpdate = true;
            for (var j=0, m=last.length; j<m; j++) {
                if ( last[j]._id != row._id ) {
                    continue;
                }

                if ( eq(row, last[j]) ) {
                    toUpdate = false;
                    break;
                }
            }

            if ( toUpdate ) {
                changes.update.push(row);
            }
        }

        return changes;
    };

	f.initBox = function(params) {
		if ( !f.isObject(params) ) {
			params = {};
		}

		var $box, box;
		// { box: "selector" }
		if ( f.isString(params.box) ) {
			$box = $(params.box);
			box = $box.get(0);
		} else
		// { $box: "selector" }
		if ( f.isString(params.$box) ) {
			$box = $(params.$box);
			box = $box.get(0);
		} else
		// { box: jQueryObject }
		if ( params.box instanceof $ ) {
			$box = params.box;
			box = $box.get(0);
		} else
		// { $box: jQueryObject }
		if ( params.$box instanceof $ ) {
			$box = params.$box;
			box = $box.get(0);
		} else
		// { $box: Element or str }
		if ( params.$box ) {
			$box = $(params.$box);
			box = $box.get(0);
		} else
		// { box: Element or str }
		if ( params.box ) {
			$box = $(params.box);
			box = $box.get(0);
		}

		if ( !(box instanceof Element) ) {
			throw new Error("Box is not are DOMElement");
		}

		this.box = box;
		this.$box = $box;
	}

	// результат - объект, разница между двумя исходными объектами
	// данные в результате будут взяты из объекта b
	// сравнение не строгое
	f.deepChangedData = function(a, b) {

		if ( !f.isObject(a) ) {
			a = {};
		}

		if ( !f.isObject(b) ) {
			b = {};
		}

		function diff(a, b) {
			var out = {};

			for (var key in b) {
				if ( !f.isObject(b[key]) ) {
					if ( a[key] != b[key] ) {
						out[key] = f.deepClone(b[key]);
					}
				} else {
					if ( f.isObject(a[key]) ) {
						out[key] = diff(a[key], b[key]);
						if ( JSON.stringify(out[key]) == "{}" ) {
							delete out[key];
						}
					} else {
						out[key] = f.deepClone(b[key]);
					}
				}
			}

			return out;
		}

		return diff(a, b);
	};

	// на ВХОДЕ может быть:
	// unixTimestamp,
	// timestamp,
	// объект Date,
	// то что может распарсить f.parseDate (dd.mm.yyyy hh:mm:ss и подобное),
	// то что может распарсить Date.parse
	// на ВЫХОДЕ
	// unixTimestamp или
	// NaN - если не удалось распарсить время
	f.clientTime2serverTime = function(clientTime) {
		var timestamp;

		timestamp = +f.parseDate(clientTime+"").date;
		if ( f.isNaN(timestamp) ) {
			timestamp = Date.parse(clientTime);
		}

		return f.unixTimestamp2serverTime(timestamp);
	};

	f.parseDate = function(str) {
		var defFormat = 'd.m.Y H:i';

		var date, format,
			year, month, day, hours, minutes, seconds, ms;

		if ( f.isNumber(+str) ) {
			date = new Date(+str);
			format = defFormat;
		} else
		if ( f.isDate(str) ) {
			date = str;
			format = defFormat;
		} else
		if ( f.isString(str) ) {
			str = str.trim();

			// сначало проверяем на формат ISO
			// 2015-08-31T21:00:00.000Z
			if ( /^\d\d\d\d\-\d\d\-\d\dT\d\d\:\d\d\:\d\d/.test(str) ) {
				return {
					format: "YYYY-MM-DDTHH:mm:ss.sssZ",
					date: new Date(Date.parse(str))
				}
			}
			// дописываем неполные даты

			// указан только год
			if ( /^\d\d\d\d$/.test(str) ) {
				str = "01." + str;
			}

			// указан месяц без нуля и год
			if ( /^\d.\d\d\d\d$/.test(str) ) {
				str = "01.0" + str;
			}
			// указан месяц с нулем и год
			if ( /^\d\d.\d\d\d\d$/.test(str) ) {
				str = "01." + str;
			}

			// день указан без нуля, месяц с нулем или без, год
			if ( /^\d.(\d\d|\d).\d\d\d\d$/.test(str) ) {
				str = "0" + str;
			}
			// день, месяц без нуля, год
			if ( /^\d\d.\d.\d\d\d\d$/.test(str) ) {
				str = str.slice(0, 3) + "0" + str.slice(3);
			}

			// разделители могут абсолютно любые
			// day.month.year hours:minutes:seconds:ms
			// 26.06.2015 12:03:48:123
			// year.month.day hours:minutes:seconds:ms
			// 2015.06.26 12:03:48:123
			if ( /^(\d\d.\d\d.\d\d\d\d|\d\d\d\d.\d\d.\d\d)(.\d\d.\d\d(.\d\d(.\d\d\d)?)?)?/.test(str) ) {

				if ( /^\d\d\d\d/.test(str) ) {
					day = str.slice(8, 10);
					month = str.slice(5, 7)-1;
					year = str.slice(0, 4);
					format = [
							"Y",
							str.slice(4, 5),
							"m",
							str.slice(7, 8),
							"d"
						].join('');
				} else {
					day = str.slice(0, 2);
					month = str.slice(3, 5)-1;
					year = str.slice(6, 10);
					format = [
							"d",
							str.slice(2, 3),
							"m",
							str.slice(5, 6),
							"Y"
						].join('');
				}

				if ( str.length > 10 ) {
					hours = str.slice(11, 13);
					minutes = str.slice(14, 16);

					format += [
						str.slice(10, 11),
						"H",
						str.slice(13, 14),
						"i"
					].join('')

					if ( str.length > 16 ) {
						seconds = str.slice(17, 19);
						format += [
							str.slice(16, 17),
							"s"
						].join('');

						/*
						if ( str.length > 19 ) {
							ms = str.slice(20, 23);
								format += [
								str.slice(19, 20),
								"xxx"
							].join('');
							date = new Date(year, month, day, hours, minutes, seconds, ms);
						} else {
						*/
							date = new Date(year, month, day, hours, minutes, seconds);
						//}
					} else {
						date = new Date(year, month, day, hours, minutes);
					}
				} else {
					date = new Date(year, month, day);
				}
			} else {
				date = new Date(str);
				format = defFormat;
				// unknown date
			}
		} else {
			date = new Date();
			format = defFormat;
		}

		return {date: date, format: format};
	};

	f.unixTimestamp2serverTime = function(unixTimestamp) {
		return new Date(unixTimestamp).toISOString();
	};

	f.serverTime2timestamp = function(isoString) {
		return Date.parse(toISOString);
	};

	f.stripTags = function(html) {
		if ( !f.isString(html) ) {
			return "";
		}

		return html
				.replace(/<br[^>]*>/gi, "\n")
				.replace(/<[^>]*>/g, "")
				.replace(/&gt;/g, ">")
				.replace(/&lt;/g, "<")
				.replace(/&amp;/g, "&")
		;
	};

	f.aboutBrow = function() {
		var brow = navigator.vendor == '' && typeof navigator.vendor == 'string' ? 'Firefox' : ( navigator.vendor ? navigator.vendor.split(' ')[0] : 'Internet Explorer' );
		var platform = navigator.platform;
		var screenW = screen.availWidth;
		var screenH = screen.availHeight;
		var vers = navigator.appVersion.toLowerCase();
		var fullData = '';

		if ( brow == "Google" && f.isObject(window.opr) ) {
			brow = "Opera";
		}

		if ( f.isFunction(window.msClearImmediate) ) {
			brow = "Internet Explorer";
			vers = "11.0";
		} else {
			try{
				vers = ({
					'opera' :function(){ return vers.split('opr/')[1] },
					'firefox' :function(){ return vers.split(' ')[0] },
					'internet explorer' :function(){ return vers.split('msie ')[1].split(';')[0] },
					'apple' :function(){ return vers.split('version/')[1] },
					'google' :function(){ return vers.split('chrome/')[1].split(' ')[0] }
				})[brow.toLowerCase()]();
			} catch( e ) {
				brow = 'unknown';
				vers = 'unknow';
				fullData = '\n\r' + navigator.vendor + '; ' + navigator.platform + ';' + navigator.appVersion;
			}
		}


		var   isIphone = platform.toLowerCase().indexOf('iphone') != -1 || navigator.userAgent.indexOf("iPhone") != -1
			, isPad = platform.toLowerCase().indexOf('iphone') != -1 || navigator.userAgent.indexOf("iPad") != -1
			, isArm = platform.toLowerCase().indexOf('arm') != -1 || navigator.userAgent.indexOf("Android") != -1
			, isMobile = isIphone || isPad || isArm
		;
		return {
			brow: brow,
			platform: platform,
			screenW: screenW,
			screenH: screenH,
			isIphone: isIphone,
			isPad: isPad,
			isArm: isArm,
			isMobile: isMobile,
			vers: vers,
			toString : function(){
				return "Browser: " + brow + ', Version: ' + vers + ', Platform: ' + platform + ', Screen: ' + screenW + ' X ' + screenH + fullData;
			}
		};
	}

	window.f = f;
	return f;
})
})(
	typeof define == 'undefined' ? function(depends, callback) {
		module.exports = callback();
	} : define,
	typeof window == 'undefined' ? {} : window
);
