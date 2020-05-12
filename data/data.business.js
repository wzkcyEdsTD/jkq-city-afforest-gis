/**
*业务服务调用类
*@module data
*@class DCI.BusinessServices
*@constructor initialize
*/
define("data/business", [
    "leaflet",
    "core/dcins",
    "data/ajax"
], function (L) {

    L.DCI.BusinessServices = L.Class.extend({
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
        *项目一张图：获取整体情况统计数据
        *@method getProjectmapStatistics
        *@param options {Object} 参数集
        */
        getProjectmapStatistics: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/xm/statistics";
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

        /**
        *项目一张图：分页获取管理单元信息
        *@method getProjectmapStatistics
        *@param options {Object} 参数集
        */
        getProjectmapManageCells: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/xm/" + options.page + "/" + options.maxShowNum + "/" + options.phase + "/" + options.condition;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

        /**
        *项目一张图：通过项目编码itemId获取一个项目信息
        *@method getProjectmapDetailsInfo
        *@param options {Object} 参数集
        */
        getProjectmapDetailsInfo: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/xm/" + options.itemId;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

        /**
       *项目一张图：通过项目编码Id获取一个项目信息
       *@method queryXmByIds
       *@param options {Object} 参数集
       */
        queryXmByIds: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/xm/query?ids=" + options.ids;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },
                /**
        *时限一张图：获取项目数据
        *@method getProjects
        *@param options {Object} 参数集
        */
        getProjects: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/sx/project/" + options.page + "/" + options.size + "/" + options.where;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

        /**
        *时限一张图：根据ID获取项目
        *@method getProjects
        *@param options {Object} 参数集
        */
        querySxProjectByIds: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/sx/query?ids="+options.ids;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

        /**
        *批后一张图：获取整体情况的所有数据
        *@method getApprovedMapData
        *@param options {Object} 参数集
        */
        getApprovedMapData: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/ph/static/"+ options.year;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },
        /**
        *批后一张图：获取过滤条件数据
        *@method getApprovedMapConditionData
        *@param options {Object} 参数集
        */
        getApprovedMapConditionData: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/ph/queryvalue";
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },
        /**
        *批后一张图：获取批后跟踪情况的分页数据
        *@method getApprovedTrackingData
        *@param options {Object} 参数集
        */
        getApprovedTrackingData: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/ph/managecells/"+ options.year +"/" + options.region + "/" + options.stage + "/" + options.condition + "/" + options.page + "/" + options.maxShowNum;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

        /**
        *通过ID查询项目
        *@method queryPhByIds
        *@param options {Object} 参数集
        */
        queryPhByIds: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/ph/query?ids=" + options.caseIds;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

        /**
        *从项目阶段获取Case_Id来查询对应的批后项目
        *@method queryPhByCaseIds
        *@param options {Object} 参数集
        */
        queryPhByCaseIds: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/ph/queryByCaseId?caseIds=" + options.caseIds;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

        /**
        *批后一张图：获取违规项目情况的分页数据
        *@method getViolateProjectData
        *@param options {Object} 参数集
        */
        getViolateProjectData: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/ph/trace/"+ options.year +"/" + options.region + "/" + options.stage + "/" + options.condition + "/" + options.page + "/" + options.maxShowNum;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },
        /**
        *批后一张图：获取批后跟踪情况的详情数据
        *@method getApprovedTrackingDetailData
        *@param options {Object} 参数集
        */
        getApprovedTrackingDetailData: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/ph/status/" + options.id;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },
        /**
        *编制一张图：获取整体情况的所有数据
        *@method getCompileMapData
        *@param options {Object} 参数集
        */
        getCompileMapData: function (options) {
            var year = options.year;
            var url = this.baseUrl + "/cpzx/business/onemap/bz/static/"+year;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },
        /**
        *编制一张图：获取过滤条件数据
        *@method getCompileMapConditionData
        *@param options {Object} 参数集
        */
        getCompileMapConditionData: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/bz/queryvalue";
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },
        /**
        *编制一张图：获取批后跟踪情况的分页数据
        *@method getCompileMapPageData
        *@param options {Object} 参数集
        */
        getCompileMapPageData: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/bz/managecells/" + options.year + "/" + options.status + "/" + options.condition + "/" + options.page + "/" + options.maxShowNum;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

        /**
        *通过ID查询项目
        *@method queryBzByIds
        *@param options {Object} 参数集
        */
        queryBzByIds: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/bz/query?ids=" + options.caseIds;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

        /**
        *编制一张图：获取详情数据
        *@method getCompileMapDetailInfo
        *@param options {Object} 参数集
        */
        getCompileMapDetailInfo: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/bz/projectdetail/" + options.id;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

        /**
        *地块全生命周期：获取项目详情数据
        *@method getProjectDetails
        *@param options {Object} 参数集
        */
        getProjectDetails: function (options) {
            var caseid = options.caseid;
            var url = this.baseUrl + "/cpzx/business/onemap/xm/project/" + caseid;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },
        /**
        *地块全生命周期--规划审批:  通过CASEID从项目一张图中获取一个项目信息
        *@method getProjectInfoFromId
        *@param options {Object} 参数集
        */
        getProjectInfoFromId:function(options) {
            var url = this.baseUrl + "/cpzx/business/onemap/xm/oneproject/" + options.id;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },
        /**
        *地块全生命周期--批后监察:  通过Itemid从批后一张图中获取一个项目信息
        *@method getApprovalInfoFromId
        *@param options {Object} 参数集
        */
        getApprovalInfoFromId: function (options) {
            var url = this.baseUrl + "/cpzx/business/onemap/ph/oneproject/" + options.id;
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },

        /**
        *快速搜索项目
        *@method queryPhByCaseIds
        *@param options {Object} 参数集
        */
        queryQuery: function (options) {
            var url = this.baseUrl + "/cpzx/query/quickquery/searchall/" + options.pageIndex + "/" + options.recordNum + "/" + options.condition;            
            this.ajax.get(url, null, true, options.context, options.success, options.error);
        },


    });

    return L.DCI.BusinessServices;
});