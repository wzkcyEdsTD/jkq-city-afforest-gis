/**
*查询服务调用类
*@module data
*@class DCI.QueryServices
*@constructor initialize
*/
define("data/query", [
    "leaflet",
    "core/dcins",
    "data/ajax"
], function (L) {

    L.DCI.QueryServices = L.Class.extend({
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
        *获取参数字符串
        *@method getParamString
        *@param options {Object} 参数集
        */
        getParamString: function (options) {
            var param = "";
            for (var att in options) {
                if (att == "context" || att == "success" || att == "error") continue;
                param += att + "=" + options[att] + "&";
            }
            if (param != "") param = param.substring(0, param.length - 1);
            return param;
        },

        /**
        *图斑协调查询
        *@method selectConflictPlate
        *@param options {Object} 参数集
        */
        selectConflictPlate: function (options) {
            var param = this.getParamString(options);
            var url = this.baseUrl + "/queryservices/selectconflictplate?" + param;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },
        /**
        *图斑协调分析结果的更改
        *@method changeConflictResult
        *@param options {Object} 参数集
        */
        changeConflictResult: function (options) {
            var id = options.id;
            var dataStr = options.dataStr;
            var url = this.baseUrl + "/setconflictplateatt?" + id + "&att=" +  dataStr;
            this.ajax.post(url, null, true, options.context, options.success, options.error);
        },
        /**
        *图斑协调分析结果的更改
        *@method queryByKey
        *@param options {Object} 参数集
        */
        /*模糊查询*/
        queryByKey:function(options){
            var url = this.baseUrl + "/searchservices/fuzzy/gis/" + options.key;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        }
    });

    return L.DCI.QueryServices;
});