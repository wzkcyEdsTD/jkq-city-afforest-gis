/**
*登录日志模块布局类
*@module layout
*@class DCI.LoggingPanelLayout
*/
define("manage/layout/loggingpanel", ["leaflet"], function (L) {
    if (L.DCI == null) L.DCI = {};
    L.DCI.LoggingPanelLayout = L.Class.extend({
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
            var html = '<div class="loggingpanel">'
                        + '<div class="top">'
                            + '<div class="loggingPanel_Search active">'
                                 + '<input type="text" class="form-control" placeholder="请输入部门名称/用户名称/状态/异常">'
                                 + '<span class="icon-search-icon search"></span>'
                            + '</div>'
                        + '</div>'
                        + '<div class="content .container-fluid">'
                            + '<div class="logginglist col-xs-12">'
                                + '<div class="mainContent">'
                                    + '<div class="loggingContentTitle">'
                                        + '<table class="table table-hover">'
                                        + '<thead>'
                                            + '<tr class="loggingTableTitle">'
                                                + '<th class="">部门名称</th><th>用户名称</th><th>访问时间</th><th>操作状态</th><th>异常信息</th>'
                                            + '</tr>'
                                        + '</thead>'
                                    + '</table>'
                                    + '</div>'
                                    + '<div class="loggingContentBody">'
                                        + '<table class="table table-hover">'
                                        + '<tbody class="loggingTableBody">'
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
                        + '<td>' + options.department + '</td>'
                        + '<td>' + options.user + '</td>'
                        + '<td>' + options.time + '</td>'
                        + '<td>' + options.status + '</td>'
                        + '<td>' + options.exception + '</td>'
                     + '</tr>';
            return html;
        },

    });

    return L.DCI.LoggingPanelLayout;
});