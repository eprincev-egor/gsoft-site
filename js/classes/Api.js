define([
    'funcs',
    'jquery',
    'eva'
], function(f, $, Events) {
    'use strict';

    var Api = f.CreateClass("Api", {
        _root: "/api",
        _entity: "default"
    }, Events);

    Api.prototype.init = function(params) {
        params = params || {};

    };

    Api.prototype._request = function(params, _callback) {
        var url = this._root + "/" + (params.entity || this._entity) + "/" + params.method;

        if ( !f.isFunction(_callback) ) {
            _callback = function(){}
        }

        var callback = function(response) {
            if ( f.isString(response) ) {
                try{
                    response = JSON.parse(response);
                }catch(e){
                    console.error(e);
                }
            }

            _callback(response.result, response)
        }

        if ( 'target' in params ) {
            url += "/";
            url += params.target;
        }

        var postData = {
            json: JSON.stringify(params.data)
        };

        if ( 'config' in params ) {
            postData.jsonConfig = JSON.stringify(params.config);
        }

        if ( 'eventIgnore' in params ) {
            postData.eventIgnore = params.eventIgnore;
        }

        if ( 'files' in params ) {
            postData.files = params.files
            f.ajaxSend('POST', url, postData, callback);
        } else {
            $.post(url, postData, callback);
        }
    };

    Api.request = function(params, callback) {
        var api = new Api();
        api._request(params, callback);
    }

    return Api;
})
