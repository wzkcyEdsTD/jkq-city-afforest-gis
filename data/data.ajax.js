/**
*Ajax类
*@module data
*@class DCI.Ajax
*@constructor initialize
*/
define("data/ajax", [
    "leaflet",
    "core/dcins"
], function (L) {
    L.DCI.Ajax = L.Class.extend({

        /**
        *超时时间
        *@property _timeout
        *@type {Number}
        *@private
        */
        _timeout: 60000,

        /**
        *Ajax对象列表
        *@property _defs
        *@type {Array}
        *@private
        */
        _defs: [],

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            jQuery.support.cors = true;
            this._timeout = 60000;
            this._defs = [];
        },

        /**
        *返回全部Ajax调用对象
        *@method getDefs
        *@return {Array} Ajax调用对象数组
        */
        getDefs: function () {
            return this._defs;
        },

        /**
        *删除Ajax调用对象
        *@method _removeDef
        *@param def {object} 需要删掉的调用对象
        *@private
        */
        _removeDef: function (def) {
            for (var i = 0; i < this._defs.length; i++) {
                if (this._defs[i] === def)
                    this._defs.splice(i, 1);
            }
        },

        /**
        *中止调用Ajax
        *@method abort
        */
        abort: function () {
            for (var i = 0; i < this._defs.length; i++) {
                this._defs[i].abort();
            }
            this._defs = [];
        },

        /**
        *判断端口是否一致
        *@method _isSamePort
        *@param url {string} 地址
        *@private
        *@return {bool}
        */
        _isSamePort: function (url) {
            var curHost = window.location.port;
            var hostStr = url.split('/')[2];
            var hostArr = hostStr.split(':');
            var host = "80";
            if (curHost == "")
                curHost = "80";
            if (hostArr.length != 1)
                host = hostArr[1];
            if (host == curHost)
                return true;
            else
                return false;
        },

        /**
        *判断是否跨域
        *@method _isCrossDomain
        *@param url {string} 地址
        *@private
        *@return {bool}
        */
        _isCrossDomain: function (url) {
            if (url.indexOf("http") == -1) return false;
            if (this._isSamePort(url) == false)
                return true;
            var host = document.domain;
            var hosts = url.split('/')[2];
            var curHost = hosts.split(':')[0];
            if (host.toLowerCase() == curHost.toLowerCase())
                return false;
            else
                return true;
        },

        /**
        *get数据（支持跨域）
        *@method get
        *@param url {string}  调用地址
        *@param data {object} 传递参数
        *@param async {boolean} 是否异步
        *@param success {function} 成功回调函数
        *@param error {function} 失败回调函数
        *@return {object} Ajax对象
        */
        get: function (url, data, async, context, success, error) {
            if (this._isCrossDomain(url) == false) {
                return this._request({
                    url: url,
                    data: data,
                    async: async,
                    dataType: 'json',
                    type: 'GET',
                    context: context,
                    success: success,
                    error: error
                });
            } else {
                return this.request(url, data, async, context, success, error);
            }
        },

        /**
        *put数据
        *@method get
        *@param url {string}  调用地址
        *@param data {object} 传递参数
        *@param async {boolean} 是否异步
        *@param success {function} 成功回调函数
        *@param error {function} 失败回调函数
        *@return {object} Ajax对象
        */
        put: function (url, data, async, context, success, error) {
            if (error == null) error = this.error;

            $.ajax({
                async: async,
                url: url,
                data: data,
                context: context,
                dataType: "text",
                type: "PUT",
                timeout: this._timeOut,
                cache: false,
                success: success,
                error: error
            });
        },
        /**
        *post数据（支持跨域）
        *@method post
        *@param url {string}  调用地址
        *@param data {object} 传递参数
        *@param async {boolean} 是否异步
        *@param success {function} 成功回调函数
        *@param error {function} 失败回调函数
        *@return {object} Ajax对象
        */
        post: function (url, data, async, context, success, error) {
            if (error == null) error = this.error;
            if (this._isCrossDomain(url) == true)
                url = Project_ParamConfig.defaultAjaxProxy + '?' + url;
            return this._request({
                url: url,
                data: data,
                async: async,
                dataType: 'json',
                type: 'POST',
                context: context,
                success: success,
                error: error
            });
        },

        Delete: function (url, data, async, context, success, error) {
            if (error == null) error = this.error;

            $.ajax({
                async: async,
                url: url,
                data: data,
                dataType: "text",
                type: "DELETE",
                context: context,
                cache: false,
                timeout: this._timeOut,
                success: success,
                error: error
            });
        },

        /*
        *跨域get数据
        *@method request
        *@param url {string}  调用地址
        *@param data {object} 传递参数
        *@param async {boolean} 是否异步
        *@param success {function} 成功回调函数
        *@param error {function} 失败回调函数
        *@return {object} Ajax对象
        */
        request: function (url, data, async, context, success, error) {
            var param = this.getParamString(data);
            if (param != null && param != "")
                url = url + "?" + param;
            return this._request({
                url: url,
                //data: data,
                async: async,
                dataType: 'jsonp',
                type: 'GET',
                context: context,
                success: success,
                timeout: this.timeout,
                error: error
            });
        },

        /*
        *跨域getXML数据
        *@method requestXML
        *@param url {string}  调用地址
        *@param data {object} 传递参数
        *@param async {boolean} 是否异步
        *@param success {function} 成功回调函数
        *@param error {function} 失败回调函数
        *@return {object} Ajax对象
        */
        requestXML: function (url, data, context, success, error) {
            return this._request({
                url: url,
                data: data,
                async: async,
                dataType: 'xml',
                type: 'GET',
                context: context,
                success: success,
                error: error
            });
        },



        /*
        *requestText数据
        *@method requestText
        *@param url {string}  调用地址
        *@param data {object} 传递参数
        *@param async {boolean} 是否异步
        *@param success {function} 成功回调函数
        *@param error {function} 失败回调函数
        *@return {object} Ajax对象
        */
        requestText: function (url, data, async, context, success, error) {
            return this._request({
                url: url,
                data: data,
                async: async,
                dataType: 'text',
                type: 'GET',
                context: context,
                success: success,
                error: error
            });
        },

        /*
        *Ajax调用函数
        *@method _request
        *@param options {object}  配置对象
        *@private
        *@return {object} Ajax对象
        */
        _request: function (options) {
            var deferred;
            try {
                var _this = this;
                if (options.error == null)
                    options.error = _this.error;
                deferred = $.ajax({
                    dataType: options.dataType,
                    type: options.type,
                    contentType: "application/x-www-form-urlencoded",
                    async: options.async,
                    url: options.url,
                    cache: false,
                    context: options.context,
                    data: options.data,
                    timeout: _this._timeout
                });

                deferred.then(function (res) {
                    _this._removeDef(deferred);
                    try {
                        if (options.type != "text" && typeof res === 'string' && res !== "")
                            res = $.parseJSON(res);
                        options.success.call(options.context, res);
                    } catch (e) {
                        //console.log(e.message);
                        L.dci.log.showLog(e.message);
                    }
                }, function (e) {
                    _this._removeDef(deferred);
                    options.error.call(options.context, e);
                });
                this._defs.push(deferred);
            } catch (e) {
                //console.log(e.message);
                L.dci.log.showLog(e.message);
            }
            return deferred;
        },

        /*
        *服务调用错误回调函数
        *@method error
        *@param e {object} 异常对象
        */
        error: function (e) {
            //console.log(e.message);
            L.dci.log.showLog(e.message);
            L.dci.app.util.dialog.alert("温馨提示", "调用服务失败");
            //L.dci.app.util.dialog.error("错误提示", e.statusText);
        },

        /*
        *获取参数字符串
        *@method getParamString
        *@param options {object} 配置参数
        *@return {string} 参数字符串
        */
        getParamString: function (options) {
            var param = "";
            for (var att in options) {
                if (att == "context" || att == "success" || att == "error") continue;
                param += att + "=" + options[att] + "&";
            }
            if (param != "") param = param.substring(0, param.length - 1);
            return param;
        }
    });

    return L.DCI.Ajax;
});