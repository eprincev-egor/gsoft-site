define({
    _included: {},
    load: function(name, req, onload, config) {

        var root = "/";
        if ( config.baseUrl ) {
            root = config.baseUrl;
        }

        var path = name.indexOf('/') == 0 ? name : root + name;
		if( this._included[path] ) {
            onload(this._included[path]);
            return;
        }
		
		require([
			"text!"+path
		], function(template) {
			if ( !document.getElementById("templates") ) {
				var div = document.createElement("div");
				div.id = "templates";
				document.body.appendChild(div);
			}
			
			document.getElementById("templates").innerHTML += template;
			this._included[path] = template;
			onload(template);
		}.bind(this));
		
    }
});
