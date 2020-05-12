/**
*用户管理布局类
*@module layout
*@class DCI.UserPanelLayout
*/
define("manage/layout/userpanel", ["leaflet"], function (L) {
    if (L.DCI == null) L.DCI = {};
    L.DCI.UserPanelLayout = L.Class.extend({

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
            var html = '<div class="useManage">'
                         + '<div class="useManage_Left">'
                             + '<div>'
                                 + '<span class="useManage_Left_Title">用户</span>'
                                 + '<span class="icon-clear-batch deleteUser titleIcon oaHideButton"></span>'
                                 + '<span class="icon-add-user addUser titleIconActive oaHideButton"></span>'
                                 + '<span class="GetOAUser">同步OA组织用户</span>'
                             + '</div>'
                             + '<div>'
                                + '<div id="addUserDiv"><div><span class="icon-add"></span>添加用户</div></div>'
                                + '<div class="useManage_Left_Search active">'
                                    + '<input type="text" class="form-control" placeholder="请输入用户名称">'
                                    + '<span class="icon-search-icon search"></span>'
                                + '</div>'
                                + '<div class="useManage_Left_Container">'
                                    + '<div>'
                                        + '<ul id="userTree" class="ztree"></ul>'
                                    + '</div>'
                                + '</div>'
                             + '</div>'
                         + '</div>'
                         + '<div class="useManage_LeftMiddle"><span class="icon-arrows-right addUserDepartment"></span></div>'
                         + '<div class="useManage_Middle">'
                            + '<div>'
                                 + '<span class="useManage_Middle_Title">组织机构</span>'
                                 + '<span class="icon-clear-batch deleteDepartment titleIcon oaHideButton"></span>'
                                 + '<span class="treeCheckType checkboxType">多选</span>'
                                 + '<span class="treeCheckType radioType active">单选</span>'
                             + '</div>'
                             + '<div>'
                                + '<div id="addOrgDiv"><div><span class="icon-add"></span>添加组织机构</div></div>'
                                + '<div class="useManage_Middle_Search active">'
                                    + '<input type="text" class="form-control" placeholder="请输入组织机构名称">'
                                    + '<span class="icon-search-icon search"></span>'
                                + '</div>'
                                + '<div class="useManage_Middle_Container">'
                                    + '<div>'
                                        + '<ul id="organizationTree" class="ztree"></ul>'
                                    + '</div>'
                                + '</div>'
                             + '</div>'
                         + '</div>'
                         + '<div class="useManage_MiddleRight"><span class="icon-arrows-right addUserRole"></span></div>'
                         + '<div class="useManage_Right">'
                            + '<div>'
                                 + '<span class="useManage_Right_Title">角色</span>'
                                 + '<span class="icon-clear-batch deleteRole titleIcon"></span>'
                             + '</div>'
                             + '<div>'
                                + '<div id="addRoleDiv"><div><span class="icon-add"></span>添加角色</div></div>'
                                + '<div class="useManage_Right_Search active">'
                                    + '<input type="text" class="form-control" placeholder="请输入角色名称">'
                                    + '<span class="icon-search-icon search"></span>'
                                + '</div>'
                                + '<div class="useManage_Right_Container">'
                                    + '<div>'
                                        + '<ul id="roleTree" class="ztree"></ul>'
                                    + '</div>'
                                + '</div>'
                             + '</div>'
                         + '</div>'
                      + '</div>';
            return html;
        },



        /**
        *添加用户对话框html
        *@method addUserHtml
        *@return {String} 返回html元素
        */
        addUserHtml: function () {
            var html = '<div class="addUser">'
                            + '<form class="form-horizontal">'
                            + '<div>'
                                + '<span class="starRed">*</span>'
                                + '<label class="control-label">用户名:</label>'
                                + '<input class="txtUserName" type="text" placeholder="用户名长度小于8">'
                            + '</div>'
                            + '<div class="addUserPadding">'
                                + '<span class="starRed">*</span>'
                                + '<label class="control-label">别名:</label>'
                                + '<input class="txtName" type="text" placeholder="别名长度小于8">'
                           + '</div>'
                           + '<div class="addUserPadding">'
                                + '<span class="starRed">*</span>'
                                + '<label class="control-label">密码:</label>'
                                + '<input class="txtPassword" type="password" placeholder="">'
                            + '</div>'
                           + '</form>'
                           + '<div class="tip"><span class="errorText"></span></div>'
                           + '<div><button type="button" class="btn cancelAddUser">取消</button><button type="button" class="btn saveAddUser">保存</button></div>'
                     + '</div>';
            return html;
        },
        /**
        *修改用户对话框html
        *@method editUserHtml
        *@return {String} 返回html元素
        */
        editUserHtml: function () {
            var html = '<div class="editUser">'
                            + '<form class="form-horizontal">'
                            + '<div>'
                                + '<span class="starRed">*</span>'
                                + '<label class="control-label">用户名:</label>'
                                + '<input class="txtUserName" type="text" placeholder="用户名长度小于8">'
                            + '</div>'
                            + '<div class="addUserPadding">'
                                + '<span class="starRed">*</span>'
                                + '<label class="control-label">别名:</label>'
                                + '<input class="txtName" type="text" placeholder="别名长度小于8">'
                           + '</div>'
                            + '<div>'
                                + '<span class="starWhite"></span>'
                                + '<label class="control-label">旧密码:</label>'
                                + '<input class="txtOldPassword" type="password">'
                            + '</div>'
                            + '<div>'
                                + '<span class="starWhite"></span>'
                                + '<label class="control-label">新密码:</label>'
                                + '<input class="txtNewPassword1" type="password" placeholder="">'
                            + '</div>'
                            + '<div>'
                                + '<span class="starWhite"></span>'
                                + '<label class="control-label">确认密码:</label>'
                                + '<input class="txtNewPassword2" type="password" placeholder="">'
                            + '</div>'
                           + '</form>'
                           + '<div class="tip"><span class="errorText"></span></div>'
                           + '<div><button type="button" class="btn cancelEditUser">取消</button><button type="button" class="btn saveEditUser">保存</button></div>'
                     + '</div>';
            return html;
        },
        /**
        *删除用户对话框html
        *@method deleteUserHtml
        *@return {String} 返回html元素
        */
        deleteUserHtml: function (options) {
            var html = '<div class="deleteUser">'
                           + '<div><p></p></div>'
                           + '<div><button type="button" class="btn cancelDeleteUser">取消</button><button type="button" class="btn submitDeleteUser">确定</button>'
                       + '</div>';
            return html;
        },





        /**
        *添加部门对话框html
        *@method addDepartmentHtml
        *@return {String} 返回html元素
        */
        addDepartmentHtml: function () {
            var html = '<div class="addDepartment">'
                            + '<form class="form-horizontal">'
                            + '<div>'
                                + '<span class="starRed">*</span>'
                                + '<label class="control-label">名称:</label>'
                                + '<input class="txtName" type="text" placeholder="名称长度小于等于10">'
                            + '</div>'
                            + '<div>'
                                + '<span class="starWhite"></span>'
                                + '<label class="control-label">描述:</label>'
                                + '<input class="txtDecription" type="text">'
                            + '</div>'
                           + '</form>'
                           + '<div class="tip"><span class="errorText"></span></div>'
                           + '<div><button type="button" class="btn cancelAddDepartment">取消</button><button type="button" class="btn saveAddDepartment">保存</button></div>'
                     + '</div>';
            return html;
        },
        /**
        *修改部门对话框html
        *@method editDepartmentHtml
        *@return {String} 返回html元素
        */
        editDepartmentHtml: function () {
            var html = '<div class="editDepartment">'
                            + '<form class="form-horizontal">'
                            + '<div>'
                                + '<span class="starRed">*</span>'
                                + '<label class="control-label">名称:</label>'
                                + '<input class="txtName" type="text" placeholder="名称长度小于等于10">'
                            + '</div>'
                            + '<div>'
                                + '<span class="starWhite"></span>'
                                + '<label class="control-label">描述:</label>'
                                + '<input class="txtDecription" type="text">'
                            + '</div>'
                           + '</form>'
                           + '<div class="tip"><span class="errorText"></span></div>'
                           + '<div><button type="button" class="btn cancelEditDepartment">取消</button><button type="button" class="btn saveEditDepartment">保存</button></div>'
                     + '</div>';
            return html;
        },
        /**
        *删除部门对话框html
        *@method deleteDepartmentHtml
        *@return {String} 返回html元素
        */
        deleteDepartmentHtml: function () {
            var html = '<div class="deleteDepartment">'
                           + '<div><p></p></div>'
                           + '<div><button type="button" class="btn cancelDeleteDepartment">取消</button><button type="button" class="btn submitDeleteDepartment">确定</button></div>'
                     + '</div>';
            return html;
        },



        /**
        *添加角色对话框html
        *@method addRoleHtml
        *@return {String} 返回html元素
        */
        addRoleHtml: function () {
            var html = '<div class="addRole">'
                            + '<form class="form-horizontal">'
                            + '<div>'
                                + '<span class="starRed">*</span>'
                                + '<label class="control-label">名称:</label>'
                                + '<input class="txtName" type="text" placeholder="名称长度小于等于10">'
                            + '</div>'
                            + '<div>'
                                + '<span class="starWhite"></span>'
                                + '<label class="control-label">描述:</label>'
                                + '<input class="txtDecription" type="text">'
                            + '</div>'
                           + '</form>'
                           + '<div class="tip"><span class="errorText"></span></div>'
                           + '<div><button type="button" class="btn cancelAddRole">取消</button><button type="button" class="btn saveAddRole">保存</button></div>'
                     + '</div>';
            return html;
        },
        /**
        *修改角色对话框html
        *@method editRoleHtml
        *@return {String} 返回html元素
        */
        editRoleHtml: function () {
            var html = '<div class="editRole">'
                            + '<form class="form-horizontal">'
                            + '<div>'
                                + '<span class="starRed">*</span>'
                                + '<label class="control-label">名称:</label>'
                                + '<input class="txtName" type="text" placeholder="名称长度小于等于10">'
                            + '</div>'
                            + '<div>'
                                + '<span class="starWhite"></span>'
                                + '<label class="control-label">描述:</label>'
                                + '<input class="txtDecription" type="text">'
                            + '</div>'
                           + '</form>'
                           + '<div class="tip"><span class="errorText"></span></div>'
                           + '<div><button type="button" class="btn cancelEditRole">取消</button><button type="button" class="btn saveEditRole">保存</button></div>'
                     + '</div>';
            return html;
        },
        /**
        *删除角色对话框html
        *@method deleteRoleHtml
        *@return {String} 返回html元素
        */
        deleteRoleHtml: function () {
            var html = '<div class="deleteRole">'
                           + '<div><p></p></div>'
                           + '<div><button type="button" class="btn cancelDeleteRole">取消</button><button type="button" class="btn submitDeleteRole">确定</button></div>'
                     + '</div>';
            return html;
        },


        /**
        *同步OA信息提醒对话框html
        *@method oaHtml
        *@return {String} 返回html元素
        */
        oaTipHtml: function () {
            var html = '<div class="oaDialog">'
                           + '<span>抽取OA组织和用户信息</span>'
                           + '<p><input type="checkbox" name="vehicle" value="OA"><span>是否覆盖原数据</span></p>'
                           + '<div><button type="button" class="btn cancelOAInfo">取消</button><button type="button" class="btn submitOAInfo">确定</button></div>'
                     + '</div>';
            return html;
        },

    });

    return L.DCI.UserPanelLayout;
});