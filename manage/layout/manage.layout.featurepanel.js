/**
*资源管理下专题配置布局类
*@module layout
*@class DCI.UserPanelLayout
*/
define("manage/layout/featurepanel", ["leaflet"], function (L) {
    if (L.DCI == null) L.DCI = {};
    L.DCI.FeaturePanelLayout = L.Class.extend({

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
                          + '<div class="featureConfig_Left">'
                              + '<div>'
                                  + '<span class="featureConfig_Left_Title">数据专题</span>'
                                  + '<span class="icon-clear deleteFeature titleIcon"></span>'
                                  + '<span class="icon-revamped editFeature titleIcon"></span>'
                                  + '<span class="icon-zoom-in addFeature titleIcon"></span>'
                              + '</div>'
                              + '<div>'
                                 + '<div id="addFeatureDiv"><div><span class="icon-add"></span>添加一级专题菜单</div></div>'
                                 + '<div class="featureConfig_Left_Search active">'
                                     + '<input type="text" class="form-control" placeholder="请输入专题名称">'
                                     + '<span class="icon-search-icon search"></span>'
                                 + '</div>'
                                 + '<div class="featureConfig_Left_Container">'
                                     + '<div>'
                                         + '<ul id="featureTree" class="ztree"></ul>'
                                     + '</div>'
                                 + '</div>'
                              + '</div>'
                          + '</div>'
                          + '<div class="featureConfig_LeftMiddle"><span class="icon-arrows-right"></span></div>'
                          + '<div class="featureConfig_Middle">'
                             + '<div>'
                                  + '<span class="featureConfig_Middle_Title">服务资源</span>'
                              + '</div>'
                              + '<div>'
                                 + '<div class="featureConfig_Middle_Search">'
                                     + '<input type="text" class="form-control" placeholder="请输入服务名称">'
                                     + '<span class="icon-search-icon search"></span>'
                                 + '</div>'
                                 + '<div class="featureConfig_Middle_Container">'
                                     + '<div>'
                                         + '<ul id="resourceTree" class="ztree"></ul>'
                                     + '</div>'
                                 + '</div>'
                              + '</div>'
                          + '</div>'
                          + '<div class="featureConfig_MiddleRight"><span id="moveNodeToRight" class="icon-arrows-right"></span></div>'
                          + '<div class="featureConfig_Right">'
                             + '<div>'
                                  + '<span class="featureConfig_Right_Title">专题配置结果</span>'
                                  + '<span class="icon-clear-batch deleteFeatureLayer titleIcon"></span>'
                              + '</div>'
                              + '<div>'
                                 + '<div class="featureConfig_Right_Search">'
                                     + '<input type="text" class="form-control" placeholder="请输入图层名称">'
                                     + '<span class="icon-search-icon search"></span>'
                                 + '</div>'
                                 + '<div class="featureConfig_Right_Container">'
                                     + '<div>'
                                         + '<ul id="featureResourceTree" class="ztree"></ul>'
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
                                + '<input class="txtName" type="text" placeholder="名称长度小于20">'
                            + '</div>'
                           + '</form>'
                           + '<div class="tip"><span class="errorText"></span></div>'
                           + '<div><button type="button" class="btn cancelAddFeature">取消</button><button type="button" class="btn saveAddFeature">保存</button></div>'
                     + '</div>';
            return html;
        },

        /**
        *添加专题对话框html(带图片)
        *@method addFeatureWithImgHtml
        *@return {String} 返回html元素
        */
        addFeatureWithImgHtml: function () {
            var html = '<div class="addFeatureWithImg">'
                            + '<form class="form-horizontal">'
                            + '<div>'
                                + '<span class="starRed">*</span>'
                                + '<label class="control-label">名称:</label>'
                                + '<input class="txtName" type="text" placeholder="名称长度小于10">'
                                + '<span class="errorText"></span>'
                            + '</div>'
                            + '<div class="imageContainer"><div></div></div>'
                           + '</form>'
                           + '<div><button type="button" class="btn cancelAddFeatureWithImg">取消</button><button type="button" class="btn saveAddFeatureWithImg">保存</button></div>'
                     + '</div>';
            return html;
        },


        /**
        *添加专题对话框html(带下拉菜单)
        *@method addFeatureWithImgHtml
        *@return {String} 返回html元素
        */
        addFeatureWithDropMenu: function () {
            var html = '<div class="addFeatureWithDropMenu">'
                            + '<form class="form-horizontal">'
                            + '<div class="menuType">'
                                + '<span class="starWhite">*</span>'
                                + '<label class="control-label">类型:</label>'
                                + '<select type="text" >'
                                    + '<option selected value="专题集">专题集</option>'
                                    + '<option value="专题">专题</option>'
                                + '</select>'
                            + '</div>'
                            + '<div class="content">'
                                + '<span class="starRed">*</span>'
                                + '<label class="control-label">名称:</label>'
                                + '<input class="txtName" type="text" placeholder="名称长度小于10">'
                                + '<span class="errorText"></span>'
                            + '</div>'
                            + '<div class="imageContainer"><div></div></div>'
                           + '</form>'
                           + '<div><button type="button" class="btn cancelAddFeatureWithDropMenu">取消</button><button type="button" class="btn saveAddFeatureWithDropMenu">保存</button></div>'
                     + '</div>';
            return html;
        },

        /**
        *专题图片html
        *@method getPictureHtml
        *@return {String} 返回html元素
        */
        getPictureHtml: function (options) {
            var html = '<div class="picBox" data-info="' + options.text + '">'
                            + '<img src="themes/default/images/feature/' + options.text + '">'
                            + '<span>' + options.name + '</span>'
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
        *删除专题图层配置对话框html
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

    return L.DCI.FeaturePanelLayout;
});