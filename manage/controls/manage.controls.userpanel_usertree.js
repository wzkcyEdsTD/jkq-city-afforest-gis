/**
*用户管理的用户树类
*@module controls
*@class DCI.UserPanel
*/
define("manage/controls/userpanelUserTree", [
    "leaflet",
    "ztree",
    "plugins/md5",
    "ztree/exhide",
    "manage/controls/tree",
    "data/manage/handledata"
], function (L) {
    L.DCI.UserPanelUserTree = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        */
        id: 'userPanelUserTree',

        /**
        *用户管理类对象
        *@property userpanel
        *@type {Object}
        */
        userpanel: null,

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this.userpanel = L.app.pool.get("userPanel");
            this.handleData = new L.DCI.Manage.HandleData();
            this.tree = new L.DCI.Tree();
              
            if (Base_ParamConfig.isUseOAUserInfo == true)
            {
                $(".useManage .addUserDepartment").css({ "color": "#d2d2d2", "cursor": "default" });
                this.getOaUserTree();
            }
            else
            {
                this.getUserTree();
                //用户树绑定事件
                $(".useManage_Left").on('click', '.addUser.titleIconActive', { context: this }, function (e) { e.data.context.addUserTree(e); });
                $(".useManage_Left").on('click', '.deleteUser.titleIconActive', { context: this }, function (e) { e.data.context.deleteMoreUserEvent(e); });
                //默认添加用户（只有当没有用户的时候）
                $("#addUserDiv").on('click', 'div', { context: this }, function (e) { e.data.context.defaultAddUser(e); });
                //添加部门用户
                $(".addUserDepartment").on('click', { context: this }, function (e) { e.data.context.addUserDepartment(e); });

                //点击搜索
                $(".useManage_Left").on('click', '.search', { context: this }, function (e) {e.data.context.search(e);});
                //搜索(回车键触发)
                $(".useManage_Left").on('keydown', 'input', { context: this }, function (e) {
                    var e = e || window.event;
                    if (e.keyCode == 13)
                    {
                        e.data.context.search(e);
                        return false;
                    }
                });
            }
        },

        /**
        *用户树配置
        *@method userTreeSetting
        *@return {Object}   返回配置Json对象
        */
        userTreeSetting: function () {
            var _this = this;
            var setting = {
                view: {
                    selectedMulti: false,
                    addHoverDom: function (treeId, treeNode) { _this.addHoverDom(treeId, treeNode); },
                    removeHoverDom: function (treeId, treeNode) { _this.removeHoverDom(treeId, treeNode); }
                },
                check: {
                    enable: true,
                    chkStyle: "checkbox",
                    chkboxType: { "Y": "ps", "N": "ps" },
                    radioType: "all",
                    nocheckInherit: false
                },
                callback: {
                    onCheck: function (event, treeId, treeNode) {
                        _this.userTreeOnClick(event, treeId, treeNode);
                    },
                    onClick: function (event, treeId, treeNode) {
                        _this.userTreeOnClick(event, treeId, treeNode);
                    }                    
                },
                data: {
                    keep: {
                        parent: true,
                        leaf: true
                    },
                    simpleData: {
                        enable: true
                    }
                }
            };
            return setting;
        },

        /**
        *用户树配置(oa信息)
        *@method oaUserTreeSetting
        *@return {Object}   返回配置Json对象
        */
        oaUserTreeSetting: function () {
            var _this = this;
            var setting = {
                view: {
                    selectedMulti: false
                },
                check: {
                    enable: true,
                    chkStyle: "checkbox",
                    chkboxType: { "Y": "ps", "N": "ps" },
                    radioType: "all",
                    nocheckInherit: false
                },
                callback: {
                    onCheck: function (event, treeId, treeNode) {
                        _this.userTreeOnClick(event, treeId, treeNode);
                    },
                    onClick: function (event, treeId, treeNode) {
                        _this.userTreeOnClick(event, treeId, treeNode);
                    }
                },
                data: {
                    keep: {
                        parent: true,
                        leaf: true
                    },
                    simpleData: {
                        enable: true
                    }
                }
            };
            return setting;
        },

        /**
        *获取用户树
        *@method getUserTree
        */
        getUserTree: function () {
            //获取信息
            L.baseservice.getUserTree({
                async: true,
                context: this,
                success: function (users) {
                    var obj = users;
                    var length = obj.length;
                    var dataNodes = new Array();
                    if (length == 0)
                    {
                        //当没有用户数据时，显示默认添加框
                        this.openDefaultStatus();
                    }
                    else
                    {
                        dataNodes.push(this.handleData.userTreeRoot());
                        for (var i = 0; i < length; i++)
                        {
                            dataNodes.push(this.handleData.userTreeUser(obj[i].USERID, obj[i].USERNAME, obj[i].DISPLAYNAME, obj[i].PASSWORD));
                        }
                    }
                    //生成树
                    var containerObj = $("#userTree");
                    this.tree.show({ "elementObj": containerObj, "setting": this.userTreeSetting(), "nodes": dataNodes });
                    var treeObj = this.tree.getTreeObj("userTree");
                    this.tree.refresh(treeObj);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.dci.app.util.dialog.alert("温馨提示", "获取用户树失败");
                    //L.dialog.errorDialogModel("获取用户树失败");
                }
            });
        },


        /**
        *获取用户树(oa信息)
        *@method getOaUserTree
        */
        getOaUserTree: function () {
            //获取信息
            L.baseservice.getUserTree({
                async: true,
                context: this,
                success: function (users) {
                    var obj = users;
                    var length = obj.length;
                    var dataNodes = new Array();
                    if (length != 0)
                    {
                        dataNodes.push(this.handleData.userTreeRoot());
                        for (var i = 0; i < length; i++)
                        {
                            dataNodes.push(this.handleData.userTreeUser(obj[i].USERID, obj[i].USERNAME, obj[i].DISPLAYNAME, obj[i].PASSWORD));
                        }
                    }
                    //生成树
                    var containerObj = $("#userTree");
                    this.tree.show({ "elementObj": containerObj, "setting": this.oaUserTreeSetting(), "nodes": dataNodes });
                    var treeObj = this.tree.getTreeObj("userTree");
                    this.tree.refresh(treeObj);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.dci.app.util.dialog.alert("温馨提示", "获取用户树失败");
                    //L.dialog.errorDialogModel("获取用户树失败");
                }
            });
        },


        /**
        *鼠标移到节点上时添加Dom
        *@method addHoverDom
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        addHoverDom: function (treeId, treeNode) {
            var sObj = $("#" + treeNode.tId + "_span");
            if ($("#userTreeMenu_" + treeNode.tId).length > 0) return;
            var type = treeNode.type;
            if (type == "user")
            {
                var str = '<span class="treeMenu" id="userTreeMenu_' + treeNode.tId + '">'
                        + '<span class="icon-revamped edit"></span>'
                        + '<span class="icon-clear delete"></span>'
                     + '</span>';

                sObj.after(str);
                var btn = $("#userTreeMenu_" + treeNode.tId);
                btn.on('click', '.edit', { context: this }, function (e) { e.data.context.editOneUser(treeNode); });
                btn.on('click', '.delete', { context: this }, function (e) { e.data.context.deleteOneUser(treeNode); });
            }
            sObj.parent().addClass("treeMenuActive");
        },
        /**
        *鼠标移开节点上时删除Dom
        *@method removeHoverDom
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        removeHoverDom: function (treeId, treeNode) {
            var sObj = $("#" + treeNode.tId + "_span");
            sObj.parent().removeClass("treeMenuActive");
            if ($("#userTreeMenu_" + treeNode.tId).length > 0)
                $("#userTreeMenu_" + treeNode.tId).off().remove();
        },
        /**
        *单击事件
        *@method userTreeOnClick
        *@param event {Object}      事件对象
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        userTreeOnClick: function (event, treeId, treeNode) {
            var ele = $(event.target).parent().siblings('.chk');
            $(ele).click();
            //取消默认的选择状态
            var treeObj = this.tree.getTreeObj("userTree");
            treeObj.cancelSelectedNode(treeNode);
            //但勾选用户大于1时，激活批量删除按钮
            var nodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
            if (nodes.length > 0)
            {
                var userNodes = [];
                for (var i = 0; i < nodes.length; i++)
                {
                    if (nodes[i].type == "user")
                    {
                        userNodes.push(nodes[i]);
                    }
                }
                if (userNodes.length > 1)
                {
                    $(".useManage_Left .deleteUser").removeClass("titleIcon").addClass("titleIconActive");
                }
                else
                {
                    $(".useManage_Left .deleteUser").removeClass("titleIconActive").addClass("titleIcon");
                }
            }
            else
            {
                $(".useManage_Left .deleteUser").removeClass("titleIconActive").addClass("titleIcon");
            }
        },




        /**
        *默认添加用户事件(只有没有用户数据的时候才调用)
        *@method defaultAddUser
        *@param e {Object}   事件对象
        */
        defaultAddUser:function(e){
            //显示对话框
            var html = this.userpanel._layout.addUserHtml();
            L.dci.dialog.dialogModel('addUserModel', 150, 350, html, '添加用户');
            $(".saveAddUser").on('click', { context: this }, function (e) { e.data.context.saveDefaultAdd(e); });
            $(".cancelAddUser").on('click', { context: this }, function (e) { e.data.context.cancelAddUser(e); });
        },
        /**
        *保存默认添加用户
        *@method saveDefaultAdd
        *@param e {Object}   事件对象
        */
        saveDefaultAdd: function (e) {
            var userName = $.trim($(".addUser .txtUserName").val());
            var password = $.trim($(".addUser .txtPassword").val());
            var displayName = $.trim($(".addUser .txtName").val());
            var image = '/themes/default/images/headimage/gh.jpg';
            //验证用户名
            var userNameObj = this.verifyUserName(userName);
            if (userNameObj.verifyName == false)
            {
                $(".errorText").text(userNameObj.errorText);
                return;
            }
            //验证别名
            var displayNameObj = this.verifyDisplayName(displayName);
            if (displayNameObj.verifyName == false)
            {
                $(".errorText").text(displayNameObj.errorText);
                return;
            }
            //验证密码
            var passwordObj = this.verifyPassword(password);
            if (passwordObj.verifyName == false)
            {
                $(".errorText").text(passwordObj.errorText);
                return;
            }
            
            //删除对话框
            this.cancelAddUser();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);
            //提交保存内容
            var data = '{"USERID":1, "USERNAME":"' + userName + '", "PASSWORD":"' + password + '","DISPLAYNAME": "' + displayName + '", "SHORTNAME":"","USERTYPEID":1,"CREATETIME":"","DESCRIPTION":"","ISLOCKEDOUT":1,"EMAIL":"","NICKNAME":"","UPDATETIME":"","WEIGHT":1,"USERIMAGES":"' + image + '","SINDEX":1,"EXTRAID":""}';

            L.baseservice.addUser({
                async: true,
                data: data,
                context: this,
                success: function (id) {
                    //隐藏默认添加用户框
                    this.closeDefaultStatus();

                    var newNodeId = JSON.parse(JSON.parse(id));
                    var dataNodes = new Array();
                    dataNodes.push(this.handleData.userTreeRoot());
                    dataNodes.push(this.handleData.userTreeUser(newNodeId, userName, displayName, password));
                    //生成树
                    var containerObj = $("#userTree");
                    this.tree.show({ "elementObj": containerObj, "setting": this.userTreeSetting(), "nodes": dataNodes });

                    //显示保存成功提示信息
                    L.mtip.usetip(2, "添加成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    //L.dialog.errorDialogModel("添加用户失败");
                    L.mtip.usetip(3, "添加用户失败", 1234);
                }
            });
        },




        /**
        *添加事件
        *@method addUserTree
        *@param e {Object}   事件对象
        */
        addUserTree: function (e) {
            //显示对话框
            var html = this.userpanel._layout.addUserHtml();
            L.dci.dialog.dialogModel('addUserModel', 150, 350, html, '添加用户');
            $(".saveAddUser").on('click', { context: this }, function (e) { e.data.context.saveAddUser(e); });
            $(".cancelAddUser").on('click', { context: this }, function (e) { e.data.context.cancelAddUser(e); });
        },
        /**
        *保存按钮--添加用户对话框
        *@method saveAddUser
        *@param e {Object} 事件对象
        */
        saveAddUser: function (e) {
            var userName = $.trim($(".addUser .txtUserName").val());
            var password = $.trim($(".addUser .txtPassword").val());
            var displayName = $.trim($(".addUser .txtName").val());
            var image = '/themes/default/images/headimage/gh.jpg';
            //验证用户名
            var userNameObj = this.verifyUserName(userName);
            if (userNameObj.verifyName == false)
            {
                $(".errorText").text(userNameObj.errorText);
                return;
            }
            //验证别名
            var displayNameObj = this.verifyDisplayName(displayName);
            if (displayNameObj.verifyName == false)
            {
                $(".errorText").text(displayNameObj.errorText);
                return;
            }
            //验证密码
            var passwordObj = this.verifyPassword(password,"密码");
            if (passwordObj.verifyName == false)
            {
                $(".errorText").text(passwordObj.errorText);
                return;
            }
            
            //删除对话框
            this.cancelAddUser();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);
            //提交保存信息
            this.addUser(userName, password, displayName, image);
        },
        /**
        *取消按钮--添加用户对话框
        *@method cancelAddUser
        *@param e {Object} 事件对象
        */
        cancelAddUser: function (e) {
            $("#addUserModel").remove();
        },
        /**
        *添加用户
        *@method addUser
        *@param userName {String}       用户名
        *@param password {String}       密码
        *@param displayName {String}    别名
        *@param image {String}          头像
        */
        addUser: function (userName, password, displayName, image) {

            var data = '{"USERID":1, "USERNAME":"' + userName + '", "PASSWORD":"' + password + '","DISPLAYNAME": "' + displayName + '", "SHORTNAME":"","USERTYPEID":1,"CREATETIME":"","DESCRIPTION":"","ISLOCKEDOUT":1,"EMAIL":"","NICKNAME":"","UPDATETIME":"","WEIGHT":1,"USERIMAGES":"' + image + '","SINDEX":1,"EXTRAID":""}';
            L.baseservice.addUser({
                async: true,
                data: data,
                context: this,
                success: function (id) {
                    var newNodeId = JSON.parse(JSON.parse(id));
                    var treeObj = this.tree.getTreeObj("userTree");
                    var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": 0 });
                    node.children.push(this.handleData.userTreeUser(newNodeId, userName, displayName, password));
                    this.tree.refresh(treeObj);

                    //显示保存成功提示信息
                    L.mtip.usetip(2, "添加成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "添加用户失败", 1234);
                }
            });
        },







        /**
        *编辑用户
        *@method editOneUser
        *@param e {Object}   事件对象
        */
        editOneUser: function (treeNode) {
            //显示编辑对话框
            var html = this.userpanel._layout.editUserHtml();
            L.dci.dialog.dialogModel('editUserModel', 150, 350, html, '编辑用户');
            var userName = treeNode.name;
            var password = treeNode.password;
            var name = treeNode.displayName;
            var userId = treeNode.id;
            $(".editUser .txtUserName").val(userName);
            $(".editUser .txtName").val(name);
            $(".saveEditUser").on('click', { context: this }, function (e) { e.data.context.saveEditUser(userName, password, name,userId); });
            $(".cancelEditUser").on('click', { context: this }, function (e) { e.data.context.cancelEditUser(e); });
        },
        /**
        *保存按钮--编辑用户对话框
        *@method saveEditUser
        *@param userName {String} 用户名
        *@param password {String} 密码
        *@param name {String} 姓名
        *@param userId {String} 用户id
        */
        saveEditUser: function (oldUserName, oldPassword, oldName, userId) {
            var userName = $.trim($(".editUser .txtUserName").val());
            var name = $.trim($(".editUser .txtName").val());

            var password = $.trim($(".editUser .txtOldPassword").val());
            var newPassword1 = $.trim($(".editUser .txtNewPassword1").val());
            var newPassword2 = $.trim($(".editUser .txtNewPassword2").val());
            //不更改
            if (oldUserName == userName && oldName == name && password == "" && newPassword1 == "" && newPassword2 == "")
            {
                this.cancelEditUser();  //关闭对话框
                return;
            }
            //只更改用户名和昵称
            if (password == "" && newPassword1 == "" && newPassword2 == "")
            {
                if (userName != oldUserName)
                {
                    //验证用户名
                    var userNameObj = this.verifyUserName(userName);
                    if (userNameObj.verifyName == false)
                    {
                        $(".errorText").text(userNameObj.errorText);
                        return;
                    }
                }
                if (name != oldName)
                {
                    //验证别名
                    var displayNameObj = this.verifyDisplayName(name);
                    if (displayNameObj.verifyName == false)
                    {
                        $(".errorText").text(displayNameObj.errorText);
                        return;
                    }
                }
                //删除对话框
                this.cancelEditUser();         
                //显示保存中提示信息
                L.mtip.usetip(1, "保存中...", 1234);
                //提交保存信息
                this.editUser(userName, password, name, userId);
            }
            //包含密码的更改
            if (password != ""|| newPassword1 != "" || newPassword2 != "")
            {
                //用户名判断
                if (userName != oldUserName)
                {
                    //验证用户名
                    var userNameObj = this.verifyUserName(userName);
                    if (userNameObj.verifyName == false)
                    {
                        $(".errorText").text(userNameObj.errorText);
                        return;
                    }
                }
                //昵称判断
                if (name != oldName)
                {
                    //验证别名
                    var displayNameObj = this.verifyDisplayName(name);
                    if (displayNameObj.verifyName == false)
                    {
                        $(".errorText").text(displayNameObj.errorText);
                        return;
                    }
                }
                //验证旧密码
                var passwordObj = this.verifyPassword(password, "旧密码");
                if (passwordObj.verifyName == false)
                {
                    $(".errorText").text(passwordObj.errorText);
                    return;
                }
                else
                {
                    //验证旧密码是否正确
                    L.baseservice.verifyUserPassword({
                        userId: userId,
                        password: password,
                        async: false,
                        context: this,
                        success: function (obj) {
                            if (obj.result == "False")
                            {
                                $(".errorText").text("旧密码不正确");
                                return;
                            }
                            else
                            {
                                //新密码判断
                                if (newPassword1 != "" && newPassword2 != "")
                                {
                                    if (newPassword1 == newPassword2)
                                    {
                                        //删除对话框
                                        this.cancelEditUser();
                                        //显示保存中提示信息
                                        L.mtip.usetip(1, "保存中...", 1234);
                                        //提交保存信息
                                        this.editUser(userName, newPassword1, name, userId);
                                    }
                                    else
                                    {
                                        $(".errorText").text("确定密码错误");
                                        return;
                                    }
                                }
                                else
                                {
                                    //验证新密码或确认密码
                                    var passwordObj1 = this.verifyPassword(newPassword1, "新密码");
                                    var passwordObj2 = this.verifyPassword(newPassword2, "确认密码");
                                    if (passwordObj1.verifyName == false)
                                    {
                                        $(".errorText").text(passwordObj1.errorText);
                                        return;
                                    }
                                    else if (passwordObj2.verifyName == false)
                                    {
                                        $(".errorText").text(passwordObj2.errorText);
                                        return;
                                    }
                                }
                            }
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            $(".errorText").text("验证用户密码失败");
                            return;
                        }
                    });
                }
                
            }

        },
        /**
        *取消按钮--编辑用户对话框
        *@method cancelEditUser
        *@param e {Object} 事件对象
        */
        cancelEditUser: function (e) {
            $("#editUserModel").remove();
        },
        /**
        *编辑用户
        *@method addUser
        *@param userName {String}       用户名
        *@param password {String}       密码
        *@param name {String}           昵称
        *@param userId {String}         用户id
        */
        editUser: function (userName, password, name, userId) {

            var data = '{"USERID":'+ userId +', "USERNAME":"' + userName + '", "PASSWORD":"' + password + '","DISPLAYNAME": "' + name + '"}';
            L.baseservice.editUser({
                async: true,
                data: data,
                context: this,
                success: function (text) {
                    var treeObj = this.tree.getTreeObj("userTree");
                    var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": userId });
                    node.name = userName;
                    node.displayName = name;
                    if (password != "")
                    {
                        node.password = password;
                    }
                    treeObj.updateNode(node);
                    this.tree.refresh(treeObj);
                    //重新获取组织机构树和角色树
                    this.userpanel.getOrganizationTree();
                    this.userpanel.roleTree.getRoleTree();

                    //显示保存成功提示信息
                    L.mtip.usetip(2, "编辑成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    //L.dialog.errorDialogModel("修改用户失败");
                    L.mtip.usetip(2, "编辑用户失败", 1234);
                }
            });
        },




        /**
        *删除一个用户
        *@method deleteOneUser
        *@param treeNode {Object}   节点对象
        */
        deleteOneUser: function (treeNode) {
            var html = this.userpanel._layout.deleteUserHtml();
            L.dci.dialog.dialogModel('deleteUserModel', 150, 300, html, '删除用户');
            var name = treeNode.name;
            var text = '是否删除用户：' + name + '?';
            $(".deleteUser p").html(text);
            $(".submitDeleteUser").on('click', { context: this }, function (e) { e.data.context.submitDeleteOneUser(treeNode); });
            $(".cancelDeleteUser").on('click', { context: this }, function (e) { e.data.context.cancelDeleteOneUser(e); });
        },
        /**
        *确定按钮--删除用户对话框
        *@method submitDeleteOneUser
        *@param treeNode {Object} 节点对象
        */
        submitDeleteOneUser: function (treeNode) {
            this.cancelDeleteOneUser();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);
            
            var userId = treeNode.id;
            L.baseservice.deleteUser({
                async: true,
                id: userId,
                context: this,
                success: function (text) {
                    var treeObj = this.tree.getTreeObj("userTree");
                    var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": userId });
                    this.tree.removeNode({ "treeObj": treeObj, "treeNode": node });
                    this.tree.refresh(treeObj);
                    //重新获取组织机构树和角色树
                    this.userpanel.getOrganizationTree();
                    this.userpanel.roleTree.getRoleTree();
                    //如果没有用户
                    var nodes = this.tree.getNodes({ "treeObj": treeObj, "key": "type", "value": "user" });
                    if (nodes.length == 0)
                    {
                        var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": 0 });
                        this.tree.removeNode({ "treeObj": treeObj, "treeNode": node });
                        this.tree.refresh(treeObj);
                        this.openDefaultStatus();
                    }

                    //显示保存成功提示信息
                    L.mtip.usetip(2, "删除成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "删除用户失败", 1234);
                }
            });
        },
        /**
        *取消按钮--删除用户对话框
        *@method cancelDeleteOneUser
        *@param e {Object} 事件对象
        */
        cancelDeleteOneUser: function (e) {
            $("#deleteUserModel").remove();
        },



        /**
        *批量删除事件
        *@method deleteMoreUserEvent
        *@param treeNode {Object}   节点对象
        */
        deleteMoreUserEvent: function (e) {
            var html = this.userpanel._layout.deleteUserHtml();
            L.dci.dialog.dialogModel('deleteUserModel', 150, 300, html, '批量删除');
            var text = '是否删除勾选的用户?';
            $(".deleteUser p").html(text);
            $(".submitDeleteUser").on('click', { context: this }, function (e) { e.data.context.submitDeleteMoreUser(e); });
            $(".cancelDeleteUser").on('click', { context: this }, function (e) { e.data.context.cancelDeleteOneUser(e); });
        },
        /**
        *删除事件（批量删除）
        *@method submitDeleteMoreUser
        *@param e {Object}   事件对象
        */
        submitDeleteMoreUser: function (e) {
            this.cancelDeleteOneUser();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);

            var treeObj = this.tree.getTreeObj("userTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
            var userNodes = [];
            for (var i = 0; i < nodes.length; i++)
            {
                if (nodes[i].type == "user")
                    userNodes.push(nodes[i]);
            }
            var data = '[{"USERID":'+ userNodes[0].id +'}';
            for (var i = 1; i < userNodes.length; i++)
            {
                data += ',{"USERID":'+ userNodes[i].id +'}'
            }
            data += ']';
            L.baseservice.deleteUsers({
                async: true,
                data: data,
                context: this,
                success: function (text) {
                    var treeObj = this.tree.getTreeObj("userTree");
                    for (var i = 0; i < userNodes.length; i++)
                    {
                        var userId = userNodes[i].id;
                        var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": userId });
                        this.tree.removeNode({ "treeObj": treeObj, "treeNode": node });
                    }
                    this.tree.refresh(treeObj);
                    //重新获取组织机构树和角色树
                    this.userpanel.getOrganizationTree();
                    this.userpanel.roleTree.getRoleTree();

                    //关闭批量删除状态
                    var checkedNodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
                    if (checkedNodes.length > 0)
                    {
                        var checkedUserNodes = [];
                        for (var i = 0; i < checkedNodes.length; i++)
                        {
                            if (checkedNodes[i].type == "user")
                            {
                                checkedUserNodes.push(checkedNodes[i]);
                            }
                        }
                        if (checkedUserNodes.length > 1)
                        {
                            $(".useManage_Left .deleteUser").removeClass("titleIcon").addClass("titleIconActive");
                        }
                        else
                        {
                            $(".useManage_Left .deleteUser").removeClass("titleIconActive").addClass("titleIcon");
                        }
                    }
                    //如果没有用户
                    var nodes = this.tree.getNodes({ "treeObj": treeObj, "key": "type", "value": "user" });
                    if (nodes.length == 0)
                    {
                        var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": 0 });
                        this.tree.removeNode({ "treeObj": treeObj, "treeNode": node });
                        this.tree.refresh(treeObj);
                        this.openDefaultStatus();
                    }

                    //显示保存成功提示信息
                    L.mtip.usetip(2, "删除成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "删除用户失败", 1234);
                }
            });
        },

        /**
        *添加用户部门
        *@method addUserDepartment
        *@param e {Object}   事件对象
        */
        addUserDepartment: function (e) {
            var userTreeObj = this.tree.getTreeObj("userTree");
            var organizationTreeObj = this.tree.getTreeObj("organizationTree");
            //判断组织机构树的状态是单选还是多选，若为多选提示切换为单选操作
            var checkedType = organizationTreeObj.setting.check.chkStyle;
            if (checkedType == "checkbox")
            {
                L.dci.app.util.dialog.alert("温馨提示", "请将组织机构树切换为单选操作");
                //L.dialog.errorDialogModel("请将组织机构树切换为单选操作");
                return;
            }
            //获取勾选的用户
            var nodes = this.tree.getCheckedNodes({ "treeObj": userTreeObj, "checked": true });
            var userNodes = [];
            for (var i = 0; i < nodes.length; i++)
            {
                if (nodes[i].type == "user")
                    userNodes.push(nodes[i]);
            }
            if (userNodes.length == 0)
            {
                L.dci.app.util.dialog.alert("温馨提示", "没有勾选用户");
               // L.dialog.errorDialogModel("没有勾选用户");
                return;
            }
            //获取勾选的机构
            var Nodes = this.tree.getCheckedNodes({ "treeObj": organizationTreeObj, "checked": true });
            if (Nodes.length == 0)
            {
                L.dci.app.util.dialog.alert("温馨提示", "没有勾选组织机构");
                //L.dialog.errorDialogModel("没有勾选组织机构");
                return;
            }
            else
            {
                //获取机构下的用户
                var Node = Nodes[0];    //这里只有一个节点
                //若勾选的是用户节点
                if (Node.type == "user")
                {
                    L.dci.app.util.dialog.alert("温馨提示", "没有勾选组织机构");
                    //L.dialog.errorDialogModel("没有勾选组织机构");
                    return;
                }
                if (Node.children.length > 0)
                {
                    for (var i = 0; i < Node.children.length; i++)
                    {
                        if (Node.children[i].type == "user")
                        {
                            //排除添加组织机构下已存在的用户
                            for(var j=0;j<userNodes.length;j++)
                            {
                                if (Node.children[i].userId == userNodes[j].id)
                                    userNodes.splice(j,1);
                            }
                        }
                    }
                }
                if (userNodes.length == 0)
                {
                    L.dci.app.util.dialog.alert("温馨提示", "用户已存在");
                    //L.dialog.errorDialogModel("用户已存在");
                    return;
                }
                //给单个组织机构批量添加用户
                var data = '[{"USERID":' + userNodes[0].id + ',"DEPARTMENTID":'+ Nodes[0].departmentId +'}';
                for (var i = 1; i < userNodes.length; i++)
                {
                    data += ',{"USERID":' + userNodes[i].id + ',"DEPARTMENTID":' + Nodes[0].departmentId + '}'
                }
                data += ']';
                L.baseservice.addUserDept({
                    async: true,
                    data: data,
                    context: this,
                    success: function (text) {
                        var treeObj = this.tree.getTreeObj("organizationTree");
                        var nodeId = 'department-' + Nodes[0].departmentId;
                        var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": nodeId });
                        for (var i = 0; i < userNodes.length; i++)
                        {
                            node.children.push(this.handleData.organizationUser(userNodes[i].id, Nodes[0].departmentId, userNodes[i].name));
                            //node.children.push({ "id": userNodes[i].id, "pId": nodeId, "departmentId": Nodes[0].departmentId, "userId": userNodes[i].id, "name": userNodes[i].name, "type": "user" });
                        }
                        this.tree.changeCheckedAllState({ "treeObj": treeObj, "checked": false });
                        node.open = true;
                        this.tree.refresh(treeObj);

                        //显示保存成功提示信息
                        L.mtip.usetip(2, "添加成功", 1234);
                    },
                    error: function (XMLHttpRequest, errorThrown) {
                        //L.dialog.errorDialogModel("添加用户部门信息失败");
                        L.mtip.usetip(3, "添加失败", 1234);
                    }
                });
            }
        },


        /**
        *验证用户名是否唯一
        *@method verifyName
        *@param name {String} 用户名
        *@return {Object} 用户名验证结果以及提示内容
        */
        verifyUserName: function (name) {
            if (name == "")
                return { "verifyName": false, "errorText": "用户名不能为空" };
            if (name.indexOf(" ") > -1)
                return { "verifyName": false, "errorText": "用户名不能包含空格" };
            if (name.length > 7)
            {
                return { "verifyName": false, "errorText": "用户名长度大于7" };
            }
            var result = null;
            L.baseservice.getUserTree({
                async: false,
                context: this,
                success: function (users) {
                    if (users == null)
                    {
                        result = { "verifyName": true, "errorText": "" };
                    }
                    else
                    {
                        var data = users;
                        var count = 0;
                        for (var i = 0; i < data.length; i++)
                        {
                            if (data[i].USERNAME == name)
                            {
                                result = { "verifyName": false, "errorText": "用户名已使用" };
                                count = 1;
                                break;
                            }
                        }
                        if (count == 0)
                        {
                            result = { "verifyName": true, "errorText": "" };
                        }
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    result = { "verifyName": false, "errorText": "获取用户信息失败" };
                }
            });
            return result;
        },

        /**
        *验证密码
        *@method verifyPassword
        *@param password {String} 密码
        *@param name {String} 提示名称
        *@return {Object} 密码验证结果以及提示内容
        */
        verifyPassword: function (password, name) {
            var regex = new RegExp("[A-Z]");
            if (password == "")
                return { "verifyName": false, "errorText": ""+ name +"不能为空" };
            if (password.indexOf(" ") > -1)
                return { "verifyName": false, "errorText": "" + name + "不能包含空格" };
            //if (!regex.test(password))
            //    return { "verifyName": false, "errorText": "" + name + "没有包含一个大写字母" };
            //if (password.length < 6)
            //{
            //    return { "verifyName": false, "errorText": "" + name + "长度不能小于6" };
            //}
            return { "verifyName": true, "errorText": "" };
        },

        /**
        *验证别名
        *@method verifyDisplayName
        *@param displayName {String} 别名
        *@return {Object} 别名验证结果以及提示内容
        */
        verifyDisplayName: function (displayName) {
            if (displayName == "")
                return { "verifyName": false, "errorText": "别名不能为空" };
            if (displayName.indexOf(" ") > -1)
                return { "verifyName": false, "errorText": "别名不能包含空格" };
            if (displayName.length > 7)
            {
                return { "verifyName": false, "errorText": "别名长度不能大于7" };
            }
            return { "verifyName": true, "errorText": "" };
        },

        /**
        *显示默认添加用户菜单
        *@method openDefaultStatus
        */
        openDefaultStatus: function (e) {
            //显示默认添加用户框
            $(".useManage_Left_Search").removeClass("active");
            $("#addUserDiv").addClass("active");
            //关闭添加用户
            $(".useManage_Left .addUser").removeClass("titleIconActive").addClass("titleIcon");
        },
        /**
        *隐藏默认添加用户菜单
        *@method openDefaultStatus
        */
        closeDefaultStatus: function (e) {
            //隐藏默认添加用户框
            $(".useManage_Left_Search").addClass("active");
            $("#addUserDiv").removeClass("active");
            //打开添加用户
            $(".useManage_Left .addUser").removeClass("titleIcon").addClass("titleIconActive");
        },

        /**
        *用户树搜索
        *@method search
        */
        search: function (e) {
            var text = $.trim($(".useManage_Left_Search>input").val());
            var treeObj = this.tree.getTreeObj("userTree");
            var Nodes = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "type", "value": "user" });  //获取所有用户节点

            if (text == "")
            {
                treeObj.showNodes(Nodes);
            }
            else
            {
                var searchNodes = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "name", "value": text });
                //去掉根节点
                for (var i = 0; i < searchNodes.length; i++)
                {
                    if (searchNodes[i].type == "root")
                    {
                        searchNodes.splice(i, 1); break;
                    }
                }
                //隐藏所有节点（除根节点）
                treeObj.hideNodes(Nodes);
                //显示模糊搜索的结果
                treeObj.showNodes(searchNodes);
            }
        },


    });
    return L.DCI.UserPanelUserTree;
});