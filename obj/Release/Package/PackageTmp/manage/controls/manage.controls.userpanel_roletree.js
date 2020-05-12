/**
*用户管理的角色树类
*@module controls
*@class DCI.UserPanelRoleTree
*/
define("manage/controls/userpanelRoleTree", [
    "leaflet",
    "ztree",
    "manage/controls/tree",
    "data/manage/handledata"
], function (L) {
    L.DCI.UserPanelRoleTree = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        */
        id: 'userPanelRoleTree',

        /**
        *用户管理类对象
        *@property userpanel
        *@type {Object}
        */
        userpanel: null,
        /**
        *树处理类对象
        *@property tree
        *@type {Object}
        */
        tree: null,

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this.userpanel = L.app.pool.get("userPanel");
            this.handleData = new L.DCI.Manage.HandleData();
            this.tree = new L.DCI.Tree();
            this.getRoleTree();
            //用户树绑定事件
            $(".useManage_Right").on('click', '.deleteRole.titleIconActive', { context: this }, function (e) { e.data.context.deleteMoreRoleEvent(e); });
            //默认添加角色（只有当没有角色的时候）
            $("#addRoleDiv").on('click', 'div', { context: this }, function (e) { e.data.context.defaultAddRole(e); });

            //点击搜索
            $(".useManage_Right").on('click', '.search', { context: this }, function (e) { e.data.context.search(e); });
            //搜索(回车键触发)
            $(".useManage_Right").on('keydown', 'input', { context: this }, function (e) {
                var e = e || window.event;
                if (e.keyCode == 13)
                {
                    e.data.context.search(e);
                    return false;
                }
            });
        },

        /**
        *角色树配置
        *@method roleTreeSetting
        *@return {Object}   返回配置Json对象
        */
        roleTreeSetting: function () {
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
                    radioType: "all"
                },
                data: {
                    keep: {
                        parent: true,
                        leaf: true
                    },
                    simpleData: {
                        enable: true
                    }
                },
                callback: {
                    onCheck: function (event, treeId, treeNode) {
                        _this.roleTreeOnClick(event, treeId, treeNode);
                    },
                    onClick: function (event, treeId, treeNode) {
                        _this.roleTreeOnClick(event, treeId, treeNode);
                    }
                },
            };
            return setting;
        },
        /**
        *获取角色树
        *@method getRoleTree
        */
        getRoleTree: function () {
            //请求获取所有角色
            L.baseservice.getRole({
                async: true,
                context: this,
                success: function (roles) {
                    var obj = roles;
                    var length = obj.length;
                    var dataNodes = new Array();
                    if (length == 0)
                    {
                        //显示默认添加框
                        this.openDefaultStatus();
                        //生成树
                        var containerObj = $("#roleTree");
                        this.tree.show({ "elementObj": containerObj, "setting": this.roleTreeSetting(), "nodes": [] });
                        var treeObj = this.tree.getTreeObj("roleTree");
                        this.tree.refresh(treeObj);
                    }
                    else
                    {
                        dataNodes.push(this.handleData.roleTreeRoot());
                        for (var j = 0; j < length; j++)
                        {
                            dataNodes.push(this.handleData.roleTreeRole(obj[j].ROLEID, obj[j].ROLENAME, obj[j].DESCRIPTION, obj[j].SINDEX,true));
                        }
                        //请求获取所有角色的用户
                        L.baseservice.getUserRole({
                            async: true,
                            context: this,
                            success: function (users) {
                                var obj = users;
                                var length = obj.length;
                                if (length > 0)
                                {
                                    for (var j = 0; j < length; j++)
                                    {
                                        dataNodes.push(this.handleData.roleTreeUser(obj[j].USERID, obj[j].ROLEID, obj[j].USERNAME));
                                    }
                                }
                                //生成树
                                var containerObj = $("#roleTree");
                                this.tree.show({ "elementObj": containerObj, "setting": this.roleTreeSetting(), "nodes": dataNodes });
                                var treeObj = this.tree.getTreeObj("roleTree");
                                this.tree.refresh(treeObj);
                            },
                            error: function (XMLHttpRequest, textStatus, errorThrown) {
                                L.dialog.errorDialogModel("获取所有角色用户失败");
                            }
                        });
                    }
                    
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.dialog.errorDialogModel("获取所有角色失败");
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
            if ($("#roleTreeMenu_" + treeNode.tId).length > 0) return;
            var type = treeNode.type;
            var str = '';
            if (type == "root")
            {
                str = '<span class="treeMenu" id="roleTreeMenu_' + treeNode.tId + '">'
                        + '<span class="icon-zoom-in add"></span>'
                     + '</span>';

                sObj.after(str);
                var btn = $("#roleTreeMenu_" + treeNode.tId);
                btn.on('click', '.add', { context: this }, function (e) { e.data.context.addOneRole(treeNode); });
            }
            else if (type == "role")
            {
                str = '<span class="treeMenu" id="roleTreeMenu_' + treeNode.tId + '">'
                        + '<span class="icon-revamped edit"></span>'
                        + '<span class="icon-clear delete"></span>'
                     + '</span>';

                sObj.after(str);
                var btn = $("#roleTreeMenu_" + treeNode.tId);
                btn.on('click', '.edit', { context: this }, function (e) { e.data.context.editOneRole(treeNode); });
                btn.on('click', '.delete', { context: this }, function (e) { e.data.context.deleteOneRole(treeNode); });
            }
            else if (type == "user")
            {
                str = '<span class="treeMenu" id="roleTreeMenu_' + treeNode.tId + '">'
                        + '<span class="icon-clear delete"></span>'
                     + '</span>';

                sObj.after(str);
                var btn = $("#roleTreeMenu_" + treeNode.tId);
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
            if ($("#roleTreeMenu_" + treeNode.tId).length > 0)
                $("#roleTreeMenu_" + treeNode.tId).off().remove();
        },


        /**
        *单击事件
        *@method roleTreeOnClick
        *@param event {Object}      事件对象
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        roleTreeOnClick: function (event, treeId, treeNode) {
            var ele = $(event.target).parent().siblings('.chk');
            $(ele).click();
            //取消默认的选择状态
            var treeObj = this.tree.getTreeObj("roleTree");
            treeObj.cancelSelectedNode(treeNode);
            //但勾选用户大于1时，激活批量删除按钮
            var nodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
            if (nodes.length > 0)
            {
                var roleNodes = [];
                for (var i = 0; i < nodes.length; i++)
                {
                    if (nodes[i].type == "role")
                    {
                        roleNodes.push(nodes[i]);
                    }
                }
                if (roleNodes.length > 1)
                {
                    $(".useManage_Right .deleteRole").removeClass("titleIcon").addClass("titleIconActive");
                }
                else
                {
                    $(".useManage_Right .deleteRole").removeClass("titleIconActive").addClass("titleIcon");
                }
            }
            else
            {
                $(".useManage_Right .deleteRole").removeClass("titleIconActive").addClass("titleIcon");
            }
        },
        /**
        *验证角色名称
        *@method verifyRoleName
        *@param name {String} 角色名称
        *@return {Object} 角色名称验证结果以及提示内容
        */
        verifyRoleName: function (name) {
            if (name == "")
                return { "verifyName": false, "errorText": "角色名称不能为空" };
            if (name.indexOf(" ") > -1)
                return { "verifyName": false, "errorText": "角色名称不能包含空格" };
            if (name.length > 10)
            {
                return { "verifyName": false, "errorText": "角色名称长度大于10" };
            }
            var result = null;
            L.baseservice.getRole({
                async: false,
                context: this,
                success: function (roles) {
                    if (roles == null)
                    {
                        result = { "verifyName": true, "errorText": "" };
                    }
                    else
                    {
                        var data = roles;
                        var count = 0;
                        for (var i = 0; i < data.length; i++)
                        {
                            if (data[i].ROLENAME == name)
                            {
                                result = { "verifyName": false, "errorText": "角色名称已使用，请重新重新输入" };
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
                    result = { "verifyName": false, "errorText": "获取所有角色信息失败" };
                }
            });
            return result;
        },
        /**
        *默认添加角色(只有没有角色数据的时候才调用)
        *@method defaultAddRole
        *@pa
        */
        defaultAddRole:function(){
            //显示对话框
            var html = this.userpanel._layout.addRoleHtml();
            L.dialog.dialogModel('addRoleModel', 150, 300, html, '添加角色');

            $(".saveAddRole").on('click', { context: this }, function (e) { e.data.context.saveDefaultAdd(e); });
            $(".cancelAddRole").on('click', { context: this }, function (e) { e.data.context.cancelAddRole(e); });
        },
        /**
        *保存默认添加角色
        *@method saveDefaultAdd
        *@param e {Object}   事件对象
        */
        saveDefaultAdd: function (e) {
            var name = $.trim($(".addRole .txtName").val());
            var description = $.trim($(".addRole .txtDecription").val());
            var obj = this.verifyRoleName(name);
            if (obj.verifyName == false)
            {
                $(".errorText").text(obj.errorText);
                return;
            }
            //删除对话框
            this.cancelAddRole();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);
            //提交信息
            var data = '{"ROLEID":1, "ROLEPARENTID":1, "ROLENAME":"' + name + '","DISPLAYNAME": "", "DESCRIPTION":"' + description + '", "SINDEX":1, "ROLETYPEID":1}';
            L.baseservice.addRole({
                async: true,
                data: data,
                context: this,
                success: function (id) {
                    //隐藏默认添加框
                    this.closeDefaultStatus();

                    var newNodeId = JSON.parse(JSON.parse(id));
                    var dataNodes = new Array();
                    //先添加根节点
                    dataNodes.push(this.handleData.roleTreeRoot());
                    dataNodes.push(this.handleData.roleTreeRole(newNodeId, name, description, 1));

                    //生成树
                    var containerObj = $("#roleTree");
                    this.tree.show({ "elementObj": containerObj, "setting": this.roleTreeSetting(), "nodes": dataNodes });

                    //显示保存成功提示信息
                    L.mtip.usetip(2, "添加成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    //L.dialog.errorDialogModel("添加角色失败");
                    L.mtip.usetip(3, "添加角色失败", 1234);
                }
            });
        },


        /**
        *添加角色事件
        *@method addOneRole
        *@param treeNode {Object}   节点对象
        */
        addOneRole: function (treeNode) {
            //显示对话框
            var html = this.userpanel._layout.addRoleHtml();
            L.dialog.dialogModel('addRoleModel', 150, 300, html, '添加角色');

            $(".saveAddRole").on('click', { context: this }, function (e) { e.data.context.saveAddRole(treeNode); });
            $(".cancelAddRole").on('click', { context: this }, function (e) { e.data.context.cancelAddRole(e); });
        },
        /**
        *保存按钮--添加角色对话框
        *@method saveAddRole
        *@param treeNode {Object} 事件对象
        */
        saveAddRole: function (treeNode) {
            var name = $.trim($(".addRole .txtName").val());
            var description = $.trim($(".addRole .txtDecription").val());
            var obj = this.verifyRoleName(name);
            if (obj.verifyName == false)
            {
                $(".errorText").text(obj.errorText);
                return;
            }
            //通过根节点获取新增节点的索引
            var length = treeNode.children.length;
            var sIndex = 1;
            if (length > 0)
            {
                sIndex = treeNode.children[length - 1].sIndex + 1;
            }
            //删除对话框
            this.cancelAddRole();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);
            this.addRole(name, description, sIndex);
        },
        /**
        *取消按钮--添加角色对话框
        *@method cancelAddRole
        *@param e {Object} 事件对象
        */
        cancelAddRole: function (e) {
            $("#addRoleModel").remove();
        },
        /**
        *添加角色
        *@method addRole
        *@param name {String} 角色名称
        *@param description {String} 描述
        *@param sIndex {Number} 索引
        */
        addRole: function (name, description, sIndex) {
            var data = '{"ROLEID":1, "ROLEPARENTID":1, "ROLENAME":"' + name + '","DISPLAYNAME": "", "DESCRIPTION":"' + description + '", "SINDEX":' + sIndex + ', "ROLETYPEID":1}';
            L.baseservice.addRole({
                async: true,
                data: data,
                context: this,
                success: function (id) {
                    var roleId = JSON.parse(JSON.parse(id));
                    var nodeId = 'role-' + roleId;
                    var treeObj = this.tree.getTreeObj("roleTree");
                    var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": 0 });
                    node.children.push(this.handleData.roleTreeRole(roleId, name, description, sIndex, false));
                    //node.children.push({ "id": nodeId, "pId": 0, "roleId": roleId, "name": name, "description": description, "sIndex": sIndex, "type": "role", "open": false, "isParent": true, "children": [] });
                    this.tree.refresh(treeObj);
                    //显示保存成功提示信息
                    L.mtip.usetip(2, "添加成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    //L.dialog.errorDialogModel("添加角色失败");
                    L.mtip.usetip(3, "添加角色失败", 1234);
                }
            });
        },




        /**
        *编辑角色
        *@method editOneRole
        *@param treeNode {Object}   节点对象
        */
        editOneRole: function (treeNode) {
            //显示编辑对话框
            var html = this.userpanel._layout.editRoleHtml();
            L.dialog.dialogModel('editRoleModel', 150, 300, html, '编辑角色');
            var name = treeNode.name;
            var description = treeNode.description == null ? "" : treeNode.description;
            var sIndex = treeNode.sIndex;
            var roleId = treeNode.roleId;
            $(".editRole .txtName").val(name);
            $(".editRole .txtDecription").val(description);
            $(".saveEditRole").on('click', { context: this }, function (e) { e.data.context.saveEditRole(roleId, name, description, sIndex); });
            $(".cancelEditRole").on('click', { context: this }, function (e) { e.data.context.cancelEditRole(e); });
        },
        /**
        *保存按钮--编辑角色对话框
        *@method saveEditRole
        *@param roleId {String} 角色id
        *@param oldName {String} 角色名称
        *@param oldDescription {String} 描述
        *@param sIndex {String} 同级排序索引
        */
        saveEditRole: function (roleId, oldName, oldDescription, sIndex) {
            var name = $.trim($(".editRole .txtName").val());
            var description = $.trim($(".editRole .txtDecription").val());
            if (oldName == name && oldDescription == description)
            {
                this.cancelEditRole();  //关闭对话框
            }
            else
            {
                if (name != oldName)
                {
                    var obj = this.verifyRoleName(name);
                    if (obj.verifyName == false)
                    {
                        $(".errorText").text(obj.errorText);
                        return;
                    }
                }
                var treeObj = this.tree.getTreeObj("roleTree");
                //删除对话框
                this.cancelEditRole();
                //显示保存中提示信息
                L.mtip.usetip(1, "保存中...", 1234);
                this.editRole(roleId, name, description, sIndex);
            }
        },
        /**
        *取消按钮--编辑角色对话框
        *@method cancelEditRole
        *@param e {Object} 事件对象
        */
        cancelEditRole: function (e) {
            $("#editRoleModel").remove();
        },
        /**
        *编辑角色
        *@method editRole
        *@param roleId {Number} 角色id
        *@param name {String} 角色名称
        *@param description {String} 描述
        *@param sIndex {Number} 索引
        */
        editRole: function (roleId, name, description, sIndex) {
            var data = '{"ROLEID":' + roleId + ', "ROLEPARENTID":1, "ROLENAME":"' + name + '","DISPLAYNAME": "", "DESCRIPTION":"' + description + '", "SINDEX":' + sIndex + ', "ROLETYPEID":1}';
            L.baseservice.updateRole({
                async: true,
                data: data,
                context: this,
                success: function (text) {
                    var nodeId = 'role-' + roleId;
                    var treeObj = this.tree.getTreeObj("roleTree");
                    var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": nodeId });
                    node.name = name;
                    node.description = description;
                    this.tree.updateNode({ "treeObj": treeObj, "treeNode": node });
                    this.tree.refresh(treeObj);
                    //显示保存成功提示信息
                    L.mtip.usetip(2, "编辑成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    //L.dialog.errorDialogModel("编辑角色失败");
                    L.mtip.usetip(3, "编辑角色失败", 1234);
                }
            });
        },



        /**
        *删除一个角色
        *@method deleteOneRole
        *@param treeNode {Object}   节点对象
        */
        deleteOneRole: function (treeNode) {
            var html = this.userpanel._layout.deleteRoleHtml();
            L.dialog.dialogModel('deleteRoleModel', 150, 300, html, '删除角色');
            var name = treeNode.name;
            var text = '是否删除角色：' + name + '?';
            $(".deleteRole p").html(text);
            $(".submitDeleteRole").on('click', { context: this }, function (e) { e.data.context.submitDeleteOneRole(treeNode); });
            $(".cancelDeleteRole").on('click', { context: this }, function (e) { e.data.context.cancelDeleteOneRole(e); });
        },
        /**
        *确定按钮--删除角色对话框
        *@method submitDeleteRole
        *@param treeNode {Object} 节点对象
        */
        submitDeleteOneRole: function (treeNode) {
            this.cancelDeleteOneRole();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);

            var roleId = treeNode.roleId;
            var nodeId = treeNode.id;
            L.baseservice.deleteRole({
                async: true,
                id: roleId,
                context: this,
                success: function (text) {
                    var treeObj = this.tree.getTreeObj("roleTree");
                    var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": nodeId });
                    this.tree.removeNode({ "treeObj": treeObj, "treeNode": node });
                    this.tree.refresh(treeObj);
                    //如果没有角色
                    var nodes = this.tree.getNodes({ "treeObj": treeObj, "key": "type", "value": "role" });
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
                    //L.dialog.errorDialogModel("删除角色失败");
                    L.mtip.usetip(3, "删除角色失败", 1234);
                }
            });
        },
        /**
        *取消按钮--删除角色对话框
        *@method cancelDeleteOneRole
        *@param e {Object} 事件对象
        */
        cancelDeleteOneRole: function (e) {
            $("#deleteRoleModel").remove();
        },


        /**
        *删除一个用户的角色权限
        *@method deleteOneUser
        *@param treeNode {Object}   节点对象
        */
        deleteOneUser: function (treeNode) {
            var html = this.userpanel._layout.deleteRoleHtml();
            L.dialog.dialogModel('deleteRoleModel', 150, 300, html, '删除用户的角色权限');
            var name = treeNode.name;
            var text = '是否删除用户：' + name + '?';
            $(".deleteRole p").html(text);
            $(".submitDeleteRole").on('click', { context: this }, function (e) { e.data.context.submitDeleteOneUser(treeNode); });
            $(".cancelDeleteRole").on('click', { context: this }, function (e) { e.data.context.cancelDeleteOneRole(e); });
        },
        /**
        *确定按钮--删除用户的角色权限对话框
        *@method submitDeleteOneUser
        *@param treeNode {Object} 节点对象
        */
        submitDeleteOneUser: function (treeNode) {
            this.cancelDeleteOneRole();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);

            var roleId = treeNode.roleId;
            var userId = treeNode.userId;
            var nodeId = treeNode.id;
            var data = '{"USERID":'+ userId+',"ROLEID":'+ roleId+'}';
            L.baseservice.deleteUserRole({
                async: true,
                data: data,
                context: this,
                success: function (text) {
                    var treeObj = this.tree.getTreeObj("roleTree");
                    treeObj.removeNode(treeNode);
                    this.tree.refresh(treeObj);

                    //显示保存成功提示信息
                    L.mtip.usetip(2, "删除成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "删除用户的角色权限失败", 1234);
                }
            });
        },




        /**
        *显示默认添加用户菜单
        *@method openDefaultStatus
        */
        openDefaultStatus: function (e) {
            //显示默认添加用户框
            $(".useManage_Right_Search").removeClass("active");
            $("#addRoleDiv").addClass("active");
        },
        /**
        *隐藏默认添加用户菜单
        *@method openDefaultStatus
        */
        closeDefaultStatus: function (e) {
            //隐藏默认添加用户框
            $(".useManage_Right_Search").addClass("active");
            $("#addRoleDiv").removeClass("active");
        },


        /**
        *批量删除事件
        *@method deleteMoreRoleEvent
        *@param e {Object}   节点对象
        */
        deleteMoreRoleEvent: function (e) {
            var html = this.userpanel._layout.deleteRoleHtml();
            L.dialog.dialogModel('deleteRoleModel', 150, 300, html, '批量删除');
            var text = '是否删除勾选的角色?';
            $(".deleteRole p").html(text);
            $(".submitDeleteRole").on('click', { context: this }, function (e) { e.data.context.submitDeleteMoreRole(e); });
            $(".cancelDeleteRole").on('click', { context: this }, function (e) { e.data.context.cancelDeleteOneRole(e); });
        },
        /**
        *删除事件（批量删除）
        *@method submitDeleteMoreRole
        *@param e {Object}   事件对象
        */
        submitDeleteMoreRole: function (e) {
            this.cancelDeleteOneRole();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);

            var treeObj = this.tree.getTreeObj("roleTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
            var roleNodes = [];
            for (var i = 0; i < nodes.length; i++)
            {
                if (nodes[i].type == "role")
                {
                    roleNodes.push(nodes[i]);
                }
            }
            if (roleNodes.length == 0)
            {
                L.dialog.errorDialogModel("没有选中角色");
                return;
            }
            var data = '[{"ROLEID":' + roleNodes[0].roleId + '}';
            for (var j = 1; j < roleNodes.length; j++)
            {
                data += ',{"ROLEID":' + roleNodes[j].roleId + '}';
            }
            data += ']';

            L.baseservice.deleteRoles({
                async: true,
                data: data,
                context: this,
                success: function (text) {
                    var treeObj = this.tree.getTreeObj("roleTree");
                    for (var i = 0; i < roleNodes.length; i++)
                    {
                        treeObj.removeNode(roleNodes[i]);
                    }
                    //关闭批量删除状态
                    var checkedNodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
                    if (checkedNodes.length > 0)
                    {
                        var checkedRoleNodes = [];
                        for (var i = 0; i < checkedNodes.length; i++)
                        {
                            if (checkedNodes[i].type == "user")
                            {
                                checkedRoleNodes.push(checkedNodes[i]);
                            }
                        }
                        if (checkedRoleNodes.length > 1)
                        {
                            $(".useManage_Right .deleteRole").removeClass("titleIcon").addClass("titleIconActive");
                        }
                        else
                        {
                            $(".useManage_Right .deleteRole").removeClass("titleIconActive").addClass("titleIcon");
                        }
                    }
                    //如果没有角色
                    var nodes = this.tree.getNodes({ "treeObj": treeObj, "key": "type", "value": "role" });
                    if (nodes.length == 0)
                    {
                        var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": 0 });
                        this.tree.removeNode({ "treeObj": treeObj, "treeNode": node });
                        treeObj.setting.check.chkStyle = 'radio';
                        this.tree.refresh(treeObj);
                        this.openDefaultStatus();
                    }
                    //显示保存成功提示信息
                    L.mtip.usetip(2, "删除成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    //L.dialog.errorDialogModel("批量删除角色失败");
                    L.mtip.usetip(3, "批量删除角色失败", 1234);
                }
            });
        },



        /**
        *角色树搜索
        *@method search
        */
        search: function (e) {
            var text = $.trim($(".useManage_Right_Search>input").val());
            var treeObj = this.tree.getTreeObj("roleTree"); 
            var Nodes = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "type", "value": "role" });  //获取所有角色节点

            if (text == "")
            {
                treeObj.showNodes(Nodes);
            }
            else
            {
                var roleNodes =[];
                var searchNodes = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "name", "value": text });
                //获取角色和用户的节点
                for (var i = 0; i < searchNodes.length; i++)
                {
                    if (searchNodes[i].type == "role")
                    {
                        roleNodes.push(searchNodes[i]); 
                    }
                }

                //隐藏所有节点（除根节点）
                treeObj.hideNodes(Nodes);
                //显示模糊搜索的结果
                treeObj.showNodes(roleNodes);
            }
        },




    });
    return L.DCI.UserPanelRoleTree;
});