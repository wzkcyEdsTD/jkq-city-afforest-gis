/**
*资源管理下全局搜索配置布局类——20151208,临汾需求
*@module layout
*@class DCI.UserPanelLayout
*/
define("manage/layout/globalsearchpanel", ["leaflet"], function (L) {
    if (L.DCI == null) L.DCI = {};
    L.DCI.GlobalSearchPanelLayout = L.Class.extend({

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
            var html = '<div class="featureConfig">'
                          + '<div class="featureConfig_Left" style="width:49%">'
                             + '<div>'
                                  + '<span class="featureConfig_Left_Title">服务资源</span>'
                              + '</div>'
                              + '<div>'
                                 + '<div class="featureConfig_Left_Container">'
                                     + '<div>'
                                         + '<ul id="resourceTree" class="ztree"></ul>'
                                     + '</div>'
                                 + '</div>'
                              + '</div>'
                          + '</div>'
                          + '<div class="featureConfig_MiddleRight"><span id="moveNodeToRight" class="icon-arrows-right"></span></div>'
                          + '<div class="featureConfig_Right"  style="width:49%">'
                             + '<div>'
                                  + '<span class="featureConfig_Right_Title">全局查询配置结果</span>'
                                  + '<span class="icon-clear deleteFeature titleIcon"></span>'
                                 + '<span class="icon-revamped editFeature titleIcon"></span>'
                              + '</div>'
                              + '<div>'
                                 + '<div class="featureConfig_Right_Container">'
                                     + '<div>'
                                         + '<ul id="GlobalSearchResultTree" class="ztree"></ul>'
                                     + '</div>'
                                 + '</div>'
                              + '</div>'
                          + '</div>'
                       + '</div>';
            return html;
        },

        /**
        *添加专题对话框html
        *@method addFeatureHtml
        *@return {String} 返回html元素
        */
        addFeatureHtml: function () {
            var html = '<div class="addFeature">'
                            + '<form class="form-horizontal">'
                            + '<div>'
                                + '<span class="starRed">*</span>'
                                + '<label class="control-label">名称:</label>'
                                + '<input class="txtName" type="text" placeholder="名称长度小于10">'
                            + '</div>'
                           + '</form>'
                           + '<div class="tip"><span class="errorText"></span></div>'
                           + '<div><button type="button" class="btn cancelAddFeature">取消</button><button type="button" class="btn saveAddFeature">保存</button></div>'
                     + '</div>';
            return html;
        },

        /**
        *编辑全局查询图层对话框html
        *@method editLayerObject
        *@return {String} 返回html元素
        */
        editLayerObject: function () {
            var html = '<div class="editlayer_panel">'
                            + '<form class="form-horizontal">'
                             + '<div class="edit-name-style">'
                                + '<span class="starRed">*</span>'
                                + '<label class="control-label">服务名称:</label>'
                                + '<input id="txtName" class="txtName" type="text" style="margin-left:10px;width:55%" placeholder="名称长度小于25">'
                                + '<span class="errorText"></span>'
                            + '</div>'
                            + '<div class="edit-field-style">'
                            + '<span class="starRed">*</span>'
                                + '<label class="control-label">查询字段:</label>'
                                + '<input class="txtName" type="text" style="margin-left:10px;width:55%" placeholder="多个用英文“,”隔开">'
                                + '<span class="errorText"></span>'
                            + '</div>'
                            + '<span style="float:left" class="starRed">*</span>'
                                + '<label style="float:left" class="control-label">查询图层:</label>'
                            + '<div class="edit-layerindex-style">'
                              + ' <div class="layerIndex_container"></div>'
                              + '<span class="errorText"></span>'
                           + '</div>'
                           + '</form>'
                           + '<div><button type="button" class="btn cancelAddFeatureWithImg">取消</button><button type="button" class="btn saveAddFeatureWithImg">添加</button><button type="button"  class="btn editAddFeatureWithImg">修改</button></div>'
                     + '</div>';
            return html;
        },

        /**
        *删除专题对话框html
        *@method deleteFeatureHtml
        *@return {String} 返回html元素
        */
        deleteFeatureHtml: function (options) {
            var html = '<div class="deleteFeature">'
                           + '<div><p></p></div>'
                           + '<div><button type="button" class="btn cancelDeleteFeature">取消</button><button type="button" class="btn submitDeleteFeature">确定</button></div>'
            return html;
        },

        /**
        *删除全局查询图层配置对话框html
        *@method deleteFeatureResultHtml
        *@return {String} 返回html元素
        */
        deleteFeatureResultHtml: function (options) {
            var html = '<div class="deleteFeatureResult">'
                           + '<div><p></p></div>'
                           + '<div><button type="button" class="btn cancelDeleteFeatureResult">取消</button><button type="button" class="btn submitDeleteFeatureResult">确定</button></div>'
            return html;
        },



    });

    return L.DCI.GlobalSearchPanelLayout;
});