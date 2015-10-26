define([
	'funcs'
], function(f) {
	'use strict';

	var Events = f.CreateClass("Events", {});

	// Events
	Events.extend = function( Child ) {
			// НЕ наследование, а клонирование методов!
			var EventApi = Events.prototype;

			for (var methodName in EventApi) {
				Child.prototype[ methodName ] = EventApi[ methodName ];
			}

			return Child;
	};

	Events.extendObj = function( obj ) {
			Events.prototype.eventInit.call(obj);

			var EventApi = Events.prototype;

			for (var methodName in EventApi) {
				obj[ methodName ] = EventApi[ methodName ];
			}

			return obj;
	};

	Events.CreateClass = function(className, proto) {
		return f.CreateClass(className, proto, Events);
	};

	var proto = {
			// список методов, которые будут доступны объекту
			eventInit: function(events) {
				var value;

				this._events = {};

				if ( typeof events == 'object' && events != null ) {
					for (var key in events) {
						value = events[key];

						if ( typeof value != 'function' && typeof this[ value ] == 'function' ) {
							value = this[ value ];
						}

						this.on(key, value);
					}
				}

				return this;
			},
			on : function(events, handler, once) {
				if ( !this._events ) {this._events={}}

				if (!(events+='') || typeof handler !== 'function')
					return this;

				var name = '', event;
				events = events.split(/\s+/);
				for (var i=0, n= events.length; i<n; i++) {
					name = events[i]
					if (!(name+=''))
						continue;

					event = this._events[name] || [];

					event.push({
						once : !!once,
						callback : handler
					});
					this._events[name] = event;
				}

				return this;
			},
			once : function(events, handler) {
				return this.on(events, handler, true);
			},
			off : function(events, handler) {
				if ( !this._events ) {this._events={}}

				if (!(events+=''))
					return this;

				var name = '',
					event,
					isFunc = typeof handler === 'function',
					toSave;

				events = events.split(/\s+/);

				for (var i=0, n= events.length; i<n; i++) {
					name = events[i]
					if (!name)
						continue;

					event = this._events[name] || [];
					if ( !isFunc ) {
						toSave = [];
					} else {
						toSave = [];
						for (var j=0, m=event.length; j<m; j++) {
							if (event[j].callback === handler)
								continue;

							toSave.push(event[j]);
						}
						event = toSave
					}
					if ( toSave.length ) {
						this._events[name] = toSave;
					} else {
						delete this._events[name];
					}
				}

				return this;
			},
			trigger : function(events) {
				if ( !this._events ) {this._events={}}

				if (typeof events != 'string')
					return this;

				var name = '',
					event,
					saves = [],
					result,
					args = [].slice.call(arguments, 1);

				events = events.split(/\s+/);

				for (var i=0, n = events.length; i<n; i++) {
					name = events[i]
					if ( name == '' ) {
						continue;
					}

					if ( name != '*' ) {
						callStack(this, '*', [name].concat(args));
					}
					callStack(this, name, args);
				}

				return this;
			}
			, triggerAll : function() {
				for (var name in this._events) {
					if ( name == '*' ) {
						continue;
					}
					callStack(this, name, arguments);
				}
				return this;
			}
			, clearEvents : function() {
				this._events = {};
				return this;
			}
			, eventAction : function(_names) {
				var   that = this
					, names = typeof _names == 'string' ? _names.split(/\s+/) : false
					, action
					, args = [].slice.call(arguments, 1)
				;

				if ( !names ) {
					return that;
				}

				for (var i=0, n=names.length; i<n; i++) {
					action = that['action_' + names[i]];
					if ( typeof action == 'function' ) {
						action.apply(that, args);
					}

					that.trigger.apply(that, [names[i]].concat(args));
				}

				return that;
			},

			listenTo: function(listenObj, events, handler) {
				if ( !this._events ) {this._events={}}
				if ( events == 'all' ) {
					events = '*';
				}

				var context = this;

				if ( typeof handler != 'function' ) {
					handler = function(){}
				}

				listenObj.on(events, function() {
					handler.apply(context, arguments);
				});
			}
		}

		for (var key in proto) {
			Events.prototype[key] = proto[key];
		}

	function callStack(context, name, args) {
		var newStack = [],
			data,
			stack = context._events[name],
			result;

		if ( !stack ) {
			return;
		}

		for (var i=0, n=stack.length; i<n; i++) {
			data = stack[i];

			if ( typeof data.callback != 'function' ) {
				continue;
			}

			if ( !data.once ) {
				newStack.push(data);
			}

			result = data.callback.apply(context, args);
			if ( result === false ) {
				break;
			}
		}

		if ( newStack.length ) {
			context._events[name] = newStack;
		} else {
			delete context._events[name];
		}
	}

	return Events;
});
