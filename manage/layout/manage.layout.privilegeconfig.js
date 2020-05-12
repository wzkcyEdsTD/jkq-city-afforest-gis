/*
类名：权限配置类
*/
define("manage/layout/privilegeconfig", ["leaflet"], function (L) {
    if (L.DCI == null) L.DCI = {};
    L.DCI.PrivilegeConfigLayout = L.Class.extend({

        initialize: function () {
        },

        //布局
        getBodyHtml: function () {
            var html = '<div class="privilegeConfig">'
                         + '<div class="privilegeConfig_Left">'
                             + '<div>'
                                 + '<span class="privilegeConfig_Left_Title">角色</span>'
                             + '</div>'
                             + '<div>'
                             + '<div class="privilegeConfig_Left_Search active">'
                                    + '<input type="text" class="form-control" placeholder="请输入角色名称">'
                                    + '<span class="icon-search-icon search"></span>'
                                + '</div>'
                                + '<div class="privilegeConfig_Left_Container">'
                                    + '<div>'
                                        + '<ul id="privilegeConfigRoleTree" class="ztree"></ul>'
                                    + '</div>'
                                + '</div>'
                             + '</div>'
                         + '</div>'
                         + '<div class="privilegeConfig_LeftMiddle"></div>'
                         + '<div class="privilegeConfig_Middle">'
                            + '<div>'
                                 + '<span class="privilegeConfig_Middle_Title">数据资源</span><span class="privilegeConfig_Save" id="privilegeConfigFeatureTree_save">保存</span>'
                             + '</div>'
                             + '<div>'
                                + '<div class="privilegeConfig_Middle_Search active">'
                                    + '<input type="text" class="form-control" placeholder="请输入专题名称">'
                                    + '<span class="icon-search-icon search"></span>'
                                + '</div>'
                                + '<div class="privilegeConfig_Middle_Container">'
                                    + '<div>'
                                        + '<ul id="privilegeConfigFeatureTree" class="ztree"></ul>'
                                    + '</div>'
                                + '</div>'
                             + '</div>'
                         + '</div>'
                         + '<div class="privilegeConfig_MiddleRight"></div>'
                         + '<div class="privilegeConfig_Right">'
                            + '<div>'
                                 + '<span class="privilegeConfig_Right_Title">功能资源</span><span class="privilegeConfig_Save" id="privilegeConfigFunctionTree_save">保存</span>'
                             + '</div>'
                             + '<div>'
                                + '<div class="privilegeConfig_Right_Search active">'
                                    + '<input type="text" class="form-control" placeholder="请输入功能名称">'
                                    + '<span class="icon-search-icon search"></span>'
                                + '</div>'
                                + '<div class="privilegeConfig_Right_Container">'
                                    + '<div>'
                                        + '<ul id="privilegeConfigFunctionTree" class="ztree"></ul>'
                                    + '</div>'
                                + '</div>'
                             + '</div>'
                         + '</div>'
                      + '</div>';
            return html;
        },
    });

    return L.DCI.PrivilegeConfigLayout;
});