/**
*日志类
*@module util
*@class DCI.Log
*@constructor initialize
*/
define("util/log", [
    "leaflet",
    "core/dcins"
], function (L) {

    L.DCI.Log = L.Class.extend({
        /**
        *_config
        *@property user
        *@type {Object}
        */
        _config:false,
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {

        },

        doLog:function() {
            
        },

        /*显示错误日志*/
        showLog: function (ex) {
            if (this._config == false)
                console.log(ex);
        },
    });

    return L.DCI.Log;
});