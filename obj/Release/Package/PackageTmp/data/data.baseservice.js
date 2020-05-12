/**
*基础服务调用类
*@module data
*@class DCI.BaseServices
*@constructor initialize
*/
define("data/baseservice", [
    "leaflet",
    "core/dcins",
    "data/ajax",
    "plugins/base64"
], function (L) {
    L.DCI.BaseServices = L.Class.extend({
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
       *获取专题目录
       *@method getFeatures
       *@param options {Object} 参数集
       */
        getFeatures: function (options) {
            var url = this.baseUrl + "/cpzx/manage/feature/base/user/"+options.userId;
            return this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

        /**
        *获取专题的服务地址
        *@method getFeatureLayerById
        *@param options {Object} 参数集
        */
        getFeatureLayerById: function (options) {
            var url = this.baseUrl + "/cpzx/manage/feature/base/resource/url/" + options.id;
            return this.ajax.get(url, null, true, options.context, options.success, options.error);
        },
        /**
        *获取Wmts服务的信息
        *@method getWmtsInfo
        *@param options {Object} 参数集
        */
        getWmtsInfo: function (options) {
            var url = this.baseUrl + "/cpzx/manage/resource/base/wmts/info?url=" + options.url;
            return this.ajax.get(url, null, false, options.context, options.success, options.error);
        },
        /**
        *获取功能菜单
        *@method getAllFunction
        *@param options {Object} 参数集
        */
        getAllFunction: function(options) {
            var url = this.baseUrl + "/cpzx/manage/function/base/user/" + options.userId;
            return this.ajax.get(url, null, true, options.context, options.success, options.error);
        },
        /**
        *用地开发强度工具，获取行政区划信息
        *@method getXingzheng
        *@param options {Object} 参数集
        */
        getXingzheng: function (options) {
            var url = this.baseUrl+'/cpzx/business/region/all';
            return this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

        /**
        *判断是否需要执行预处理
        *@method whetherPre
        *@param options {Object} 参数集
        */
        whetherPre: function (options) {
            var url = this.baseUrl + '/cpzx/analysis/landbpre/whether';
            return this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

        /**
        *保存GP预处理结果
        *@method saveLandPre
        *@param options {Object} 参数集
        */
        saveLandPre: function (options) {
            var url = this.baseUrl + '/cpzx/analysis/landbpre/savelandpre';
            this.ajax.put(url, options.data, options.async, options.context, options.success, options.error);
        },

        /**
        *判断是否需要执行(可用地存量&公服设施)预处理
        *@method whetherPre
        *@param options {Object} 参数集
        */
        whetherSecPre: function (options) {
            var url = this.baseUrl + '/cpzx/analysis/landbpre/whether/sec';
            return this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

        /**
        *保存(可用地存量&公服设施)GP预处理结果
        *@method saveLandPre
        *@param options {Object} 参数集
        */
        saveSecLandPre: function (options) {
            var url = this.baseUrl + '/cpzx/analysis/landbpre/savelandpre/sec';
            this.ajax.put(url, options.data, options.async, options.context, options.success, options.error);
        },

       /**
       *用地开发强度工具，获取行政区划信息
       *@method getXingzheng
       *@param options {Object} 参数集
       */
        getFacility: function (options) {
            var url = this.baseUrl + '/cpzx/static/mapmonitor/facility';
            return this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

        /**
        *添加缓存
        *@method addCache
        *@param options {Object} 参数集
        */
        addCache: function (options) {
            if (Project_ParamConfig.isCache == false)return false;
            var url = this.baseUrl + '/cpzx/core/cache/set';
            var param = "{'key':'" + options.key + "','value':'" + options.value + "'}";
            return this.ajax.post(url, param, true, options.context, options.success, options.error);
        },

        /**
        *读取缓存
        *@method getCache
        *@param options {Object} 参数集
        */
        getCache: function (options) {
            if (Project_ParamConfig.isCache == false) return null;
            var url = this.baseUrl + '/cpzx/core/cache/get/'+options.key;
            return this.ajax.get(url, null, true, options.context, options.success, options.error);
        }
    });

    return L.DCI.BaseServices;
});