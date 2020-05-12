/**
*数据调用基类
*@module data
*@class DCI.Services
*@constructor initialize
*/
define("data/services", [
    "leaflet",
    "core/dcins",
    "data/baseservice",
    "data/analysis",
    "data/query",
    "data/business",
    "data/util",
    "data/statistics",
    "data/common/sview",
], function (L) {

    L.DCI.Services = L.Class.extend({

        /**
        *基础服务
        *@property baseService
        *@type {Object}
        */
        baseService: null,
        /**
        *分析服务
        *@property analysisService
        *@type {Object}
        */
        analysisService: null,
        /**
        *查询服务
        *@property queryService
        *@type {Object}
        */
        queryService: null,
        /**
        *业务服务
        *@property businessService
        *@type {Object}
        */
        businessService: null,
        /**
        *统计服务
        *@property statisticsService
        *@type {Object}
        */
        statisticsService:null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function (config) {
            this.baseService = new L.DCI.BaseServices(config.defaultCoreServiceUrl);
            this.analysisService = new L.DCI.AnalysisServices(config.defaultCoreServiceUrl);
            this.businessService = new L.DCI.BusinessServices(config.defaultCoreServiceUrl);
            this.statisticsService = new L.DCI.StatisticsServices(config.defaultCoreServiceUrl);
            this.queryService = new L.DCI.QueryServices(config.defaultCoreServiceUrl);
            this.utilService = new L.DCI.UtilServices(config.defaultCoreServiceUrl);
            this.SviewService = new L.DCI.Common.SviewService(config.defaultCoreServiceUrl);
        }
    });

    return L.DCI.Services;
});