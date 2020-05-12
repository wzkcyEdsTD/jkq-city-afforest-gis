/**
*util服务调用类
*@module data
*@class DCI.UtilServices
*@constructor initialize
*/
define("data/util", [
    "leaflet",
    "core/dcins",
    "data/ajax"
], function (L) {

    L.DCI.UtilServices = L.Class.extend({
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

        /**
        *获取附件目录树
        *@method getBusinessSystemTree
        *@param options {Object} 参数集
        */
        getoaAttachment: function (options) {
            var type = options.type;
            var url = this.baseUrl + "/cpzx/util/attachment/oa/directory/" + type;
            this.ajax.post(url, options.data, options.async, options.context, options.success, options.error);

        },

        /**
        *下载目录
        *@method getBusinessSystemTree
        *@param options {Object} 参数集
        */
        dlFolder: function (options) {
            var url = this.baseUrl + "/cpzx/util/attachment/oa/folder";
            this.ajax.post(url, options.data, options.async, options.context, options.success, options.error);
        },

        /**
        *下载目录
        *@method getBusinessSystemTree
        *@param options {Object} 参数集
        */
        dlFile: function (options) {
            var url = this.baseUrl + "/cpzx/util/attachment/oa/dlfile";
            this.ajax.post(url, options.data, options.async, options.context, options.success, options.error);
        },
    });

    return L.DCI.UtilServices;
});