/**
*资源访问日志模块布局类
*@module layout
*@class DCI.VisitedLoggingLayout
*/
define("manage/layout/visitedlogging", ["leaflet"], function (L) {
    if (L.DCI == null) L.DCI = {};
    L.DCI.VisitedLoggingLayout = L.Class.extend({
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
        },

        /**
         *整体布局
         *@method getBodyHtml
         *@return {String} 返回整体布局html元素
         */
        getBodyHtml: function () {
            var html = '<div class="visitedloggingpanel">'
                        + '<div class="top">'
                            + '<div class="visitedloggingPanell_Search active">'
                                 + '<input type="text" class="form-control" placeholder="请输入服务名称/部门名称/用户名称">'
                                 + '<span class="icon-search-icon search"></span>'
                            + '</div>'
                        + '</div>'
                        + '<div class="content .container-fluid">'
                            + '<div class="visitedlogginglist col-xs-12">'
                                + '<div class="mainContent">'
                                    + '<div class="visitedLoggingContentTitle">'
                                        + '<table class="table table-hover">'
                                        + '<thead>'
                                            + '<tr class="visitedLoggingTableTitle">'
                                                + '<th>服务名称</th>'
                                                + '<th>部门名称</th>'
                                                + '<th>用户名称</th>'
                                                + '<th>访问时间</th>'
                                                + '<th>操作状态</th>'
                                                + '<th>异常信息</th>'
                                            + '</tr>'
                                        + '</thead>'
                                    + '</table>'
                                    + '</div>'
                                    + '<div class="visitedLoggingContentBody">'
                                        + '<table class="table table-hover">'
                                        + '<tbody class="visitedLoggingTableBody">'
                                        + '</tbody>'
                                    + '</table>'
                                    + '</div>'
                                + '</div>'
                                + '<div class="mainContent-flash"><span></span></div>'
                            + '</div>'
                        + '</div>'
                        + '<div class="pagination"></div>'
                     + '</div>';
            return html;
        },

        /**
        *table头部
        *@method addFeatureHtml
        *@return {String} 返回html元素
        */
        loggingHtml: function (options) {
            var html = '<tr>'
                        + '<td>' + options.resource + '</td>'
                        + '<td>' + options.department + '</td>'
                        + '<td>' + options.user + '</td>'
                        + '<td>' + options.time + '</td>'
                        + '<td>' + options.status + '</td>'
                        + '<td>' + options.exception + '</td>'
                     + '</tr>';
            return html;
        },

    });

    return L.DCI.VisitedLoggingLayout;
});