/*
类名：图层对照类
*/
define("manage/layout/layerContrast", ["leaflet"], function (L) {
    if (L.DCI == null) L.DCI = {};
    L.DCI.LayerContrastLayout = L.Class.extend({

        initialize: function () {
        },

        //布局
        getBodyHtml: function () {
            var html = '<div class="layerContrast">'
                         + '<div class="layerContrast_Left">'
                             + '<div>'
                                 + '<span class="layerContrast_Left_Title">案件列表</span>'
                                 //+ '<span class="icon-clear titleIcon deleteFunction" id="resfunction_delete"></span>'
                                 //+ '<span class="icon-add titleIcon addFunction" id="resfunction_add"></span>'
                             + '</div>'
                             + '<div>'
                                + '<div id="addFunctionTypeDiv"><div><span class="icon-add"></span>添加案件编号</div></div>'
                                + '<div class="layerContrast_Left_Search active">'
                                    + '<input type="text" class="form-control" placeholder="请输入案件名称">'
                                    + '<span class="icon-search-icon search"></span>'
                                + '</div>'
                                + '<div class="layerContrast_Left_Container">'
                                    + '<div>'
                                        + '<ul id="businessTree" class="ztree"></ul>'
                                    + '</div>'
                                + '</div>'
                             + '</div>'
                         + '</div>'
                         + '<div class="layerContrast_LeftMiddle"></div>'
                         + '<div class="layerContrast_Right">'
                         + '</div>'
                      + '</div>';
            return html;
        },


        /**
        *内容html
        *@method getContentHtml
        *@return {String} 返回html元素
        */
        getContentHtml: function () {
            var html = '<div class="title">数据配置</div>'
                     + '<div class="layerContrast_Right_Body">'
                        + '<div class="layerContrast_Right_BodyContent">'
                            + '<p class="layerContrast_titleName"></p>'
                            + '<div class="contentChoose container">'
                                + '<div class="resultConfig">'
                                    + '<span>成果配置</span>'
                                    + '<div>'
                                        + '<div class="contentChooseDiv row">'
                                            + '<span class="col-md-4 col-lg-3">检索定位图层</span>'
                                            + '<p class="col-md-8 col-lg-9 chooseOne"><input type="text" readonly/><span class="itemChoose">...</span></p>'
                                        + '</div>'
                                        + '<div class="contentChooseDiv row">'
                                            + '<span class="col-md-4 col-lg-3">默认加载图集</span>'
                                            + '<p class="col-md-8 col-lg-9 chooseTwo"><input type="text"readonly/><span class="itemChoose">...</span></p>'
                                        + '</div>'
                                    + '</div>'
                                + '</div>'
                                + '<div class="tempConfig">'
                                    + '<span>临时配置</span>'
                                    + '<div>'
                                        + '<div class="contentChooseDiv row">'
                                            + '<span class="col-md-4 col-lg-3">检索定位图层</span>'
                                            + '<p class="col-md-8 col-lg-9 chooseThree"><input type="text" readonly/><span class="itemChoose">...</span></p>'
                                        + '</div>'
                                        + '<div class="contentChooseDiv row">'
                                            + '<span class="col-md-4 col-lg-3">默认加载图集</span>'
                                            + '<p class="col-md-8 col-lg-9 chooseFour"><input type="text" readonly/><span class="itemChoose">...</span></p>'
                                        + '</div>'
                                    + '</div>'
                                + '</div>'
                                + '<span class="saveLayerContrast">保存</span>'
                            + '</div>'
                            + '<div class="contentTree">'
                            + '</div>'
                        + '</div>'
                     + '</div>';

            return html;
        },


        /**
        *内容树html
        *@method getContentTreeHtml
        *@return {String} 返回html元素
        */
        getContentTreeHtm: function () {
            var html = '<p><span></span><span class="closeLayerContrastTree">X</span></p>'
                     + '<div><ul id="layerContrastTree" class="ztree"></ul></div>';

            return html;
        },


    });

    return L.DCI.LayerContrastLayout;
});