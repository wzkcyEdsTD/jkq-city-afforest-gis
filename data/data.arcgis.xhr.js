/**
*arcgis服务 接口调用类
*@module data
*@class DCI.Arcgis.Xhr
*@constructor initialize
*@author eds
*/
define("data/arcgis/xhr", [
    "data/ajax",
    "plugins/base64"
], function (L) {
    L.DCI.Arcgis.Xhr = L.Class.extend({
        /**
        *Ajax对象
        *@property ajax
        *@type {Object}
        *@private
        */
        ajax: null,
        /**
        *服务地址
        *@property baseUrl
        *@type {Object}
        *@private
        */
        baseUrl: null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function (url) {
            this.baseUrl = url;
            this.ajax = new L.DCI.Ajax();
        },
        getArcgisByXhr: () => {
            //  const url = 
            return this.ajax.get()
        }
    });

    return L.DCI.BaseServices;
});