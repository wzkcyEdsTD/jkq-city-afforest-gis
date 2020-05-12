/*
*基础服务调用
*/
define("data/common/sview", [
    "leaflet",
    "core/dcins",
    "data/ajax"
], function (L) {
    L.DCI.Common.SviewService = L.Class.extend({

        id: 'SviewService',

        ajax: null,

        baseUrl: null,

        initialize: function () {
            this.baseUrl = Project_ParamConfig.defaultCoreServiceUrl;
            this.ajax = new L.DCI.Ajax();
        },        
        //添加场景
        addScene: function (options) {
            var url = this.baseUrl + "/cpzx/common/sview/addsce";
            this.ajax.put(url, options.data, options.async, options.context, options.success, options.error);
        },        
        //获取场景
        getScene: function (options) {            
            var sid = options.sid;
            var url = this.baseUrl + "/cpzx/common/sview/getsce/" + sid;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        //获取场景列表
        getSceneList: function (options) {
            var userid = options.userid;
            var url = this.baseUrl + "/cpzx/common/sview/getscelist/" + userid;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        //删除场景
        deleteScene: function (options) {
            var sid = options.sid;
            var url = this.baseUrl + "/cpzx/common/sview/deletesce/" + sid;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        //修改场景命名
        renameScene: function (options) {
            var sid = options.sid;
            var sname = options.sname;
            var url = this.baseUrl + "/cpzx/common/sview/renamesce/" + sid + "/" + sname;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
    });

    return L.DCI.Common.SviewService;
});