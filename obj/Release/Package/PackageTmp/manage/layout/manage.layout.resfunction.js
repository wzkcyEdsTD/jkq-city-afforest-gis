/*
类名：权限配置类
*/
define("manage/layout/resfunction", ["leaflet"], function (L) {
    if (L.DCI == null) L.DCI = {};
    L.DCI.ResFunctionLayout = L.Class.extend({

        initialize: function () {
        },

        //布局
        getBodyHtml: function () {
            var html = '<div class="resFunction">'
                         + '<div class="resFunction_Left">'
                             + '<div>'
                                 + '<span class="resFunction_Left_Title">功能资源</span>'
                                 + '<span class="icon-clear titleIcon deleteFunction" id="resfunction_delete"></span>'
                                 + '<span class="icon-zoom-in titleIcon addFunction" id="resfunction_add"></span>'
                             + '</div>'
                             + '<div>'
                                + '<div id="addFunctionTypeDiv"><div><span class="icon-add"></span>添加功能类型</div></div>'
                                + '<div class="resFunction_Left_Search active">'
                                    + '<input type="text" class="form-control" placeholder="请输入功能名称">'
                                    + '<span class="icon-search-icon search"></span>'
                                + '</div>'
                                + '<div class="resFunction_Left_Container">'
                                    + '<div>'
                                        + '<ul id="resFunctionFunctionTree" class="ztree"></ul>'
                                    + '</div>'
                                + '</div>'
                             + '</div>'
                         + '</div>'
                         + '<div class="resFunction_LeftMiddle"></div>'
                         + '<div class="resFunction_Right">'
                            + '<div class="title"></div>'
                            + '<div class="resFunction_Right_Body"></div>'
                         + '</div>'
                      + '</div>';
            return html;
        },

        /**
        *删除功能对话框html
        *@method deleteFunctionHtml
        *@return {String} 返回html元素
        */
        deleteFunctionHtml: function (options) {
            var html = '<div class="deleteFunction">'
                       + '<div><p></p></div>'
                       + '<div><button type="button" class="btn cancelDelete">取消</button><button type="button" class="btn submitDelete">确定</button>'
                   + '</div>';
            return html;
        },
    });

    return L.DCI.ResFunctionLayout;
});