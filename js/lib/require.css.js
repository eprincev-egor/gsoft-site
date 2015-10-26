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

        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        if ( !/.css$/.test(path) ) {
            path += ".css";
        }

        link.href = path;
        document.body.appendChild(link);
        this._included[path] = link;
        onload(link);
    }
});
