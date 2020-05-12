/**
*用户管理类(整体布局及组织机构树)
*@module controls
*@class DCI.UserPanel
*/
define("manage/controls/userpanel", [
    "leaflet",
    "ztree",
    "manage/controls/tree",
    "manage/layout/userpanel",
    "data/manage/handledata",
    "plugins/scrollbar",
    "manage/controls/userpanelUserTree",
    "manage/controls/userpanelRoleTree"
], function (L) {
    L.DCI.UserPanel = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        */
        id: 'userPanel',
        /**
        *该模块的布局类对象
        *@property _layout
        *@type {Object}
        */
        _layout: null,
        /**
        *容器对象
        *@property _body
        *@type {Object}
        */
        _body: null,
        /**
        *树操作类对象
        *@property tree
        *@type {Object}
        */
        tree: null,
        /**
        *数据处理类对象
        *@property handleData
        *@type {Object}
        */
        handleData: null,

        /**
        *用户管理的用户树类对象
        *@property userTree
        *@type {Object}
        */
        userTree: null,
        /**
        *用户管理的角色树类对象
        *@property roleTree
        *@type {Object}
        */
        roleTree: null,

        /**
        *上下文对象
        *@property _this
        *@type {Object}
        */
        _this: null,   

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            
        },

        /**
        *默认加载
        *@method loading
        */
        loading:function(){
            $(".sitemappanel_title").text("用户管理");
            this._body = $(".use_manage");
            this._layout = new L.DCI.UserPanelLayout();
            this._body.html(this._layout.getBodyHtml());
            this.handleData = new L.DCI.Manage.HandleData();
            this.tree = new L.DCI.Tree();
            if (Manage_ParamConfig.isUseOAUserInfo == true)
            {
                $(".useManage .oaHideButton").addClass("hideButton");
                $(".useManage .GetOAUser").addClass("active");
                this.getOAOrgTree();

                //同步数据事件
                $(".useManage").on('click', '.GetOAUser', { context: this }, function (e) { e.data.context.getOAUserEvent(e); });
            }
            else
            {
                this.getOrganizationTree();
                //组织机构树绑定事件
                $(".useManage_Middle").on('click', '.deleteDepartment.titleIconActive', { context: this }, function (e) { e.data.context.deleteMoreDeptEvent(e); });
                //默认添加组织机构（只有当没有组织机构的时候）
                $("#addOrgDiv").on('click', 'div', { context: this }, function (e) { e.data.context.defaultAddOrg(e); });
            }

            
            
            this.userTree = new L.DCI.UserPanelUserTree();
            this.roleTree = new L.DCI.UserPanelRoleTree();
            //滚动条
            $(".useManage_Left_Container>div").mCustomScrollbar({ theme: "minimal-dark" });
            $(".useManage_Middle_Container>div").mCustomScrollbar({ theme: "minimal-dark" });
            $(".useManage_Right_Container>div").mCustomScrollbar({ theme: "minimal-dark" });       
            //单选或多选点击事件
            $(".useManage_Middle").on('click','.treeCheckType:not(".active")',{ context: this }, function (e) { e.data.context.changeTreeCheckType(e); });
            //添加用户角色
            $(".addUserRole").on('click', { context: this }, function (e) { e.data.context.addUserRole(e); });

            //点击搜索
            $(".useManage_Middle").on('click', '.search', { context: this }, function (e) { e.data.context.search(e); });
            //搜索(回车键触发)
            $(".useManage_Middle").on('keydown', 'input', { context: this }, function (e) {
                var e = e || window.event;
                if (e.keyCode == 13)
                {
                    e.data.context.search(e);
                    return false;
                }
            });
        },


        /**
        *组织机构树配置
        *@method organizationTreeSetting
        *@return {Object}   返回配置Json对象
        */
        organizationTreeSetting: function () {
            var _this = this;
            var setting = {
                view: {
                    selectedMulti: false,
                    addHoverDom: function (treeId, treeNode) { _this.addHoverDom(treeId, treeNode); },
                    removeHoverDom: function (treeId, treeNode) { _this.removeHoverDom(treeId, treeNode); }
                },
                check: {
                    enable: true,
                    chkStyle: "radio",
                    //chkboxType: { "Y": "ps", "N": "ps" },
                    chkboxType: { "Y": "s", "N": "ps" },
                    radioType: "all",
                    nocheckInherit: false
                },
                callback: {
                    onCheck: function (event, treeId, treeNode) {
                        _this.organizationTreeOnClick(event, treeId, treeNode);
                    },
                    onClick: function (event, treeId, treeNode) {
                        _this.organizationTreeOnClick(event, treeId, treeNode);
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
                },
            };
            return setting;
        },
        /**
        *获取组织结构树
        *@method getOrganizationTree
        */
        getOrganizationTree: function () {
            //获取信息
            L.baseservice.getOrganizationTree({
                async: true,
                context: this,
                success: function (organizations) {
                    var obj = organizations;
                    var length = obj.length;
                    var dataNodes = new Array();
                    if (length == 0)
                    {
                        //当没有组织数据时，显示默认添加框
                        this.openDefaultStatus();
                        //生成树
                        var containerObj = $("#organizationTree");
                        this.tree.show({ "elementObj": containerObj, "setting": this.organizationTreeSetting(), "nodes": [] });
                        var treeObj = this.tree.getTreeObj("organizationTree");
                        this.tree.refresh(treeObj);
                    }
                    else
                    {
                        dataNodes.push(this.handleData.organizationRoot());
                        for (var j = 0; j < length; j++)
                        {
                            var departmentId = obj[j].DEPARTMENTPARENTID;
                            if (departmentId == '0')
                            {
                                dataNodes.push(this.handleData.organizationDepartment(obj[j].DEPARTMENTID, obj[j].DEPARTMENTPARENTID, obj[j].DEPARTMENTNAME, obj[j].DESCRIPTION, 'department1', obj[j].SINDEX, true));
                            }
                            else
                            {
                                dataNodes.push(this.handleData.organizationDepartment(obj[j].DEPARTMENTID, obj[j].DEPARTMENTPARENTID, obj[j].DEPARTMENTNAME, obj[j].DESCRIPTION, 'department2', obj[j].SINDEX, true));
                            }
                        }
                        //请求获取所有部门的用户
                        L.baseservice.getDeptUser({
                            async: true,
                            context: this,
                            success: function (users) {
                                var obj = users;
                                var length = obj.length;
                                if (length > 0)
                                {
                                    for (var j = 0; j < length; j++)
                                    {
                                        dataNodes.push(this.handleData.organizationUser(obj[j].USERID, obj[j].DEPARTMENTID, obj[j].USERNAME));
                                    }
                                }
                                //生成树
                                var containerObj = $("#organizationTree");
                                this.tree.show({ "elementObj": containerObj, "setting": this.organizationTreeSetting(), "nodes": dataNodes });
                                var treeObj = this.tree.getTreeObj("organizationTree");
                                this.tree.refresh(treeObj);
                            },
                            error: function (XMLHttpRequest, textStatus, errorThrown) {
                                L.dialog.errorDialogModel("获取所有角色用户失败");
                            }
                        });
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.dialog.errorDialogModel("获取组织机构树失败");
                }
            });
        },


        /**
        *OA组织机构树配置
        *@method oAOrgTreeSetting
        *@return {Object}   返回配置Json对象
        */
        oAOrgTreeSetting: function () {
            var _this = this;
            var setting = {
                view: {
                    selectedMulti: false
                },
                check: {
                    enable: true,
                    chkStyle: "radio",
                    chkboxType: { "Y": "s", "N": "ps" },
                    radioType: "all",
                    nocheckInherit: false
                },
                callback: {
                    onCheck: function (event, treeId, treeNode) {
                        _this.organizationTreeOnClick(event, treeId, treeNode);
                    },
                    onClick: function (event, treeId, treeNode) {
                        _this.organizationTreeOnClick(event, treeId, treeNode);
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
                },
            };
            return setting;
        },

        /**
        *获取OA组织结构树
        *@method getOAOrgTree
        */
        getOAOrgTree: function () {
            //获取信息
            L.baseservice.getOrganizationTree({
                async: true,
                context: this,
                success: function (organizations) {
                    var obj = organizations;
                    var length = obj.length;
                    var dataNodes = new Array();
                    if (length == 0)
                    {
                        //生成树
                        var containerObj = $("#organizationTree");
                        this.tree.show({ "elementObj": containerObj, "setting": this.oAOrgTreeSetting(), "nodes": [] });
                        var treeObj = this.tree.getTreeObj("organizationTree");
                        this.tree.refresh(treeObj);
                    }
                    else
                    {
                        dataNodes.push(this.handleData.organizationRoot());
                        for (var j = 0; j < length; j++)
                        {
                            var departmentId = obj[j].EXTRAPID;
                            if (departmentId == '' || departmentId == null)
                            {
                                dataNodes.push(this.handleData.organizationDepartment(obj[j].EXTRAID, 0, obj[j].DEPARTMENTNAME, obj[j].DESCRIPTION, 'department1', obj[j].SINDEX, false));
                            }
                            else
                            {
                                dataNodes.push(this.handleData.organizationDepartment(obj[j].EXTRAID, obj[j].EXTRAPID, obj[j].DEPARTMENTNAME, obj[j].DESCRIPTION, 'department2', obj[j].SINDEX, false));
                            }
                        }
                        //请求获取所有部门的用户（用户部门表0A信息）
                        L.baseservice.getOaDeptUser({
                            async: true,
                            context: this,
                            success: function (users) {
                                var obj = users;
                                var length = obj.length;
                                if (length > 0)
                                {
                                    for (var j = 0; j < length; j++)
                                    {
                                        dataNodes.push(this.handleData.organizationUser(obj[j].USERID, obj[j].EXTRADEPARTMENTID, obj[j].USERNAME));
                                    }
                                }
                                //生成树
                                var containerObj = $("#organizationTree");
                                this.tree.show({ "elementObj": containerObj, "setting": this.oAOrgTreeSetting(), "nodes": dataNodes });
                                var treeObj = this.tree.getTreeObj("organizationTree");
                                this.tree.refresh(treeObj);
                            },
                            error: function (XMLHttpRequest, textStatus, errorThrown) {
                                L.dialog.errorDialogModel("获取所有角色用户失败");
                            }
                        });
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.dialog.errorDialogModel("获取组织机构树失败");
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
            if ($("#orgTreeMenu_" + treeNode.tId).length > 0) return;
            var type = treeNode.type;
            var str = '';
            if (type == "department1")
            {
                str = '<span class="treeMenu" id="orgTreeMenu_' + treeNode.tId + '">'
                        + '<span class="icon-zoom-in add"></span>'
                        + '<span class="icon-revamped edit"></span>'
                        + '<span class="icon-clear delete"></span>'
                     + '</span>';

                sObj.after(str);
                var btn = $("#orgTreeMenu_" + treeNode.tId);
                btn.on('click', '.add', { context: this }, function (e) { e.data.context.addOneDepartment(treeNode); });
                btn.on('click', '.edit', { context: this }, function (e) { e.data.context.editOneDepartment(treeNode); });
                btn.on('click', '.delete', { context: this }, function (e) { e.data.context.deleteOneDepartment(treeNode); });
            }
            if (type == "department2")
            {
                str = '<span class="treeMenu" id="orgTreeMenu_' + treeNode.tId + '">'
                        + '<span class="icon-revamped edit"></span>'
                        + '<span class="icon-clear delete"></span>'
                     + '</span>';

                sObj.after(str);
                var btn = $("#orgTreeMenu_" + treeNode.tId);
                btn.on('click', '.edit', { context: this }, function (e) { e.data.context.editOneDepartment(treeNode); });
                btn.on('click', '.delete', { context: this }, function (e) { e.data.context.deleteOneDepartment(treeNode); });
            }
            else if (type == "root")
            {
                str = '<span class="treeMenu" id="orgTreeMenu_' + treeNode.tId + '">'
                        + '<span class="icon-zoom-in add"></span>'
                     + '</span>';

                sObj.after(str);
                var btn = $("#orgTreeMenu_" + treeNode.tId);
                btn.on('click', '.add', { context: this }, function (e) { e.data.context.addOneDepartment(treeNode); });
            }
            else if (type == "user")
            {
                str = '<span class="treeMenu" id="orgTreeMenu_' + treeNode.tId + '">'
                        + '<span class="icon-clear delete"></span>'
                     + '</span>';

                sObj.after(str);
                var btn = $("#orgTreeMenu_" + treeNode.tId);
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
            if ($("#orgTreeMenu_" + treeNode.tId).length > 0)
                $("#orgTreeMenu_" + treeNode.tId).off().remove();
        },

        /**
        *单击事件
        *@method organizationTreeOnClick
        *@param event {Object}      事件对象
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        organizationTreeOnClick: function (event, treeId, treeNode) {
            //获取树对象
            var ele = $(event.target).parent().siblings('.chk');
            $(ele).click();
            //取消默认的选择状态
            var treeObj = this.tree.getTreeObj("organizationTree");
            treeObj.cancelSelectedNode(treeNode);
            //判断勾选节点个数来激活批量删除按钮
            this.openOrCloseDeleteBtn(treeObj);
        },

        /**
        *打开或关闭批量删除按钮状态
        *@method openOrCloseDeleteBtn
        *@param treeObj {Object}   树对象
        */
        openOrCloseDeleteBtn: function (treeObj) {
            //判断勾选节点个数来激活批量删除按钮
            var nodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
            if (nodes.length > 0)
            {
                for (var i = 0; i < nodes.length; i++)
                {
                    if (nodes[i].type == "root")
                    {
                        nodes.splice(i, 1);
                    }
                }
            }
            if (nodes.length > 1)
            {
                $(".useManage_Middle .deleteDepartment").removeClass("titleIcon").addClass("titleIconActive");
            }
            else
            {
                $(".useManage_Middle .deleteDepartment").removeClass("titleIconActive").addClass("titleIcon");
            }
        },
        

        /**
        *默认添加组织机构事件(只有没有组织机构数据的时候才调用)
        *@method defaultAddOrg
        *@param e {Object}   事件对象
        */
        defaultAddOrg:function(){
            //显示对话框
            var html = this._layout.addDepartmentHtml();
            L.dialog.dialogModel('addDepartmentModel', 150, 300, html, '添加部门');

            $(".saveAddDepartment").on('click', { context: this }, function (e) { e.data.context.saveDefaultAdd(e); });
            $(".cancelAddDepartment").on('click', { context: this }, function (e) { e.data.context.cancelAddDepartment(e); });
        },
        /**
        *保存默认添加组织机构事件
        *@method saveDefaultAdd
        *@param e {Object}   事件对象
        */
        saveDefaultAdd:function(e){
            var name = $.trim($(".addDepartment .txtName").val());
            var description = $.trim($(".addDepartment .txtDecription").val());
            var obj = this.verifyDepartmentName(name);
            if (obj.verifyName == false)
            {
                $(".errorText").text(obj.errorText);
                return;
            }
            //删除对话框
            this.cancelAddDepartment();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);
            //提交保存信息
            var data = '{"DEPARTMENTID":"1", "DEPARTMENTNAME":"' + name + '", "DESCRIPTION":"' + description + '","DEPARTMENTPARENTID":"0", "SINDEX":1,"EXTRAID":"","EXTRAPID":""}';
            L.baseservice.addDepartment({
                async: true,
                data: data,
                context: this,
                success: function (id) {                  
                    this.closeDefaultStatus();

                    var newNodeId = JSON.parse(JSON.parse(id));
                    var dataNodes = new Array();
                    dataNodes.push(this.handleData.organizationRoot());
                    dataNodes.push(this.handleData.organizationDepartment(newNodeId, 0, name, description, 'department1', 1, false));
                    //生成树
                    var containerObj = $("#organizationTree");
                    this.tree.show({ "elementObj": containerObj, "setting": this.organizationTreeSetting(), "nodes": dataNodes });

                    //显示保存成功提示信息
                    L.mtip.usetip(2, "添加成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "添加机构失败", 1234);
                }
            });
        },




        /**
        *添加部门事件
        *@method addOneDepartment
        *@param treeNode {Object}   节点对象
        */
        addOneDepartment: function (treeNode) {
            //显示对话框
            var html = this._layout.addDepartmentHtml();
            L.dialog.dialogModel('addDepartmentModel', 150, 300, html, '添加部门');
            $(".addDepartment .txtUserName").focus();
            $(".saveAddDepartment").on('click', { context: this }, function (e) { e.data.context.saveAddDepartment(treeNode); });
            $(".cancelAddDepartment").on('click', { context: this }, function (e) { e.data.context.cancelAddDepartment(e); });
        },
        /**
        *保存按钮--添加部门对话框
        *@method saveAddDepartment
        *@param treeNode {Object} 节点对象
        */
        saveAddDepartment: function (treeNode) {
            var type = treeNode.type;
            var pId = treeNode.departmentId;
            var length = treeNode.children.length;
            var sIndex = 0;
            if (length > 0)
            {
                for (var i = 0; i < length; i++)
                {
                    if (treeNode.children[i].type == "user")
                        continue;
                    if (sIndex < treeNode.children[i].sIndex)
                        sIndex = treeNode.children[i].sIndex;
                }
            }
            sIndex += 1;
            var name = $.trim($(".addDepartment .txtName").val());
            var description = $.trim($(".addDepartment .txtDecription").val());
            var obj = this.verifyDepartmentName(name);
            if (obj.verifyName == false)
            {
                $(".errorText").text(obj.errorText);
                return;
            }
            //删除对话框
            this.cancelAddDepartment();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);
            //提交保存信息
            this.addDepartment(name, description, pId, sIndex,type);
        },
        /**
        *取消按钮--添加部门对话框
        *@method cancelAddDepartment
        *@param e {Object} 事件对象
        */
        cancelAddDepartment: function (e) {
            $("#addDepartmentModel").remove();
        },
        /**
        *添加部门
        *@method addDepartment
        *@param name {String}       部门名称
        *@param description {String}描述
        *@param pId {String}        父节点id
        *@param sIndex {String}     同级索引
        *@param type {String}       父节点类型
        */
        addDepartment: function (name, description, pId, sIndex, type) {
            var data = '{"DEPARTMENTID":1, "DEPARTMENTNAME":"' + name + '", "DESCRIPTION":"' + description + '","DEPARTMENTPARENTID": "' + pId + '", "SINDEX":' + sIndex + ', "EXTRAID":"","EXTRAPID":""}';
            L.baseservice.addDepartment({
                async: true,
                data: data,
                context: this,
                success: function (id) {
                    var newId = JSON.parse(JSON.parse(id));
                    var nodeId = 'department-' + newId;
                    var nodePId = 'department-' + pId;
                    var departmentId = newId;
                    var organizationTreeObj = this.tree.getTreeObj("organizationTree");
                    var node = this.tree.getNode({ "treeObj": organizationTreeObj, "key": "id", "value": nodePId });
                    if (type == 'root')
                    {
                        node.children.push(this.handleData.organizationDepartment(newId, pId, name, description, 'department1', sIndex, false));
                    }
                    else
                    {
                        node.children.push(this.handleData.organizationDepartment(newId, pId, name, description, 'department2', sIndex, false));
                    }
                    node.open = true;
                    this.tree.refresh(organizationTreeObj);

                    //显示保存成功提示信息
                    L.mtip.usetip(2, "添加成功", 1234);
                    
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "添加机构失败", 1234);
                }
            });
        },




        /**
        *编辑部门事件
        *@method editOneDepartment
        *@param treeNode {Object}   节点对象
        */
        editOneDepartment: function (treeNode) {
            //显示对话框
            var html = this._layout.editDepartmentHtml();
            L.dialog.dialogModel('editDepartmentModel', 150, 300, html, '编辑部门');
            var name = treeNode.name;
            var description = treeNode.description;
            var departmentId = treeNode.departmentId;
            var departmentPId = treeNode.departmentPId;
            var sIndex = treeNode.sIndex;
            $(".editDepartment .txtName").val(name);
            $(".editDepartment .txtDecription").val(description);
            $(".saveEditDepartment").on('click', { context: this }, function (e) { e.data.context.saveEditDepartment(name, description, departmentId, departmentPId,sIndex); });
            $(".cancelEditDepartment").on('click', { context: this }, function (e) { e.data.context.cancelEditDepartment(e); });
        },
        /**
        *保存按钮--编辑部门对话框
        *@method saveEditDepartment
        *@param name {String} 部门名称
        *@param description {String} 部门描述
        *@param departmentId {String} 部门id
        *@param departmentPId {String} 部门父id
        *@param sIndex {String} 同级索引
        */
        saveEditDepartment: function (oldName, oldDescription, departmentId, departmentPId, sIndex) {
            var name = $.trim($(".editDepartment .txtName").val());
            var description = $.trim($(".editDepartment .txtDecription").val());
            if (oldName == name && oldDescription == description)
            {
                this.cancelEditDepartment();     //删除对话框
            }
            else
            {
                if (name != oldName)
                {
                    var obj = this.verifyDepartmentName(name);
                    if (obj.verifyName == false)
                    {
                        $(".errorText").text(obj.errorText);
                        return;
                    }
                }
                //删除对话框
                this.cancelEditDepartment();
                //显示保存中提示信息
                L.mtip.usetip(1, "保存中...", 1234);
                this.editDepartment(name, description, departmentId, departmentPId, sIndex);
            }
        },
        /**
        *取消按钮--编辑部门对话框
        *@method cancelEditDepartment
        *@param e {Object} 事件对象
        */
        cancelEditDepartment: function (e) {
            $("#editDepartmentModel").remove();
        },
        /**
        *编辑部门
        *@method editDepartment
        *@param name {String}           部门名称
        *@param decription {String}     描述
        *@param departmentId {String}   部门id
        *@param departmentPId {Number}  部门父节点id
        *@param sIndex {Number}         同级索引
        */
        editDepartment: function (name, description, departmentId, departmentPId, sIndex) {

            var data = '{"DEPARTMENTID":"' + departmentId + '", "DEPARTMENTNAME":"' + name + '", "DESCRIPTION":"' + description + '","DEPARTMENTPARENTID": "' + departmentPId + '", "SINDEX":' + sIndex + '}';
            L.baseservice.updateDepartment({
                async: true,
                data: data,
                context: this,
                success: function (text) {
                    var nodeId = 'department-' + departmentId;
                    var organizationTreeObj = this.tree.getTreeObj("organizationTree");
                    var node = this.tree.getNode({ "treeObj": organizationTreeObj, "key": "id", "value": nodeId });
                    node.name = name;
                    node.description = description;
                    this.tree.updateNode({ "treeObj": organizationTreeObj, "treeNode": node });
                    this.tree.refresh(organizationTreeObj);

                    //显示保存成功提示信息
                    L.mtip.usetip(2, "编辑成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "编辑机构失败", 1234);
                }
            });
        },
        


        /**
        *删除一个部门
        *@method deleteOneDepartment
        *@param treeNode {Object}   节点对象
        */
        deleteOneDepartment: function (treeNode) {
            //显示对话框
            var type = treeNode.type;
            var name = treeNode.name;
            var length = treeNode.children.length;
            var text = '';
            if (length == 0)
            {
                text = '是否删除部门：' + name + '?';
            }
            else
            {
                text = '是否删除部门以及其下所有内容：' + name + ' ?';
            }
            var html = this._layout.deleteDepartmentHtml();
            L.dialog.dialogModel('deleteDepartmentModel', 150, 300, html, '删除部门');
            
            $(".deleteDepartment p").html(text);
            $(".submitDeleteDepartment").on('click', { context: this }, function (e) { e.data.context.submitDeleteDepartment(treeNode); });
            $(".cancelDeleteDepartment").on('click', { context: this }, function (e) { e.data.context.cancelDeleteDepartment(e); });
        },
        /**
        *确定按钮--删除部门对话框
        *@method submitDeleteDepartment
        *@param treeNode {Object} 节点对象
        */
        submitDeleteDepartment: function (treeNode) {
            this.cancelDeleteDepartment();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);

            var type = treeNode.type;
            var data = '[{"DEPARTMENTID":'+ treeNode.departmentId +'}';
            if (type == "department1")
            {
                var length = treeNode.children.length;
                for (var i = 0; i < length; i++)
                {
                    data += ',{"DEPARTMENTID":' + treeNode.children[i].departmentId + '}';
                }
            }
            data += ']';
            L.baseservice.deleteDepartment({
                async: true,
                data: data,
                context: this,
                success: function (text) {
                    var treeObj = this.tree.getTreeObj("organizationTree");
                    var nodeId = 'department-'+ treeNode.departmentId;
                    var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": nodeId });
                    this.tree.removeNode({ "treeObj": treeObj, "treeNode": node });
                    this.tree.refresh(treeObj);
                    
                    //如果没有部门
                    var nodes = this.tree.getNodes({ "treeObj": treeObj, "key": "type", "value": "department1" });
                    if (nodes.length == 0)
                    {
                        var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": 'department-0' });
                        this.tree.removeNode({ "treeObj": treeObj, "treeNode": node });
                        this.tree.refresh(treeObj);
                        this.openDefaultStatus();
                    }
                    //判断勾选节点个数来激活批量删除按钮
                    this.openOrCloseDeleteBtn(treeObj);
                    //显示保存成功提示信息
                    L.mtip.usetip(2, "删除成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "删除机构失败", 1234);
                }
            });
        },
        /**
        *取消按钮--删除部门对话框
        *@method cancelDeleteDepartment
        *@param e {Object} 事件对象
        */
        cancelDeleteDepartment: function (e) {
            $("#deleteDepartmentModel").remove();
        },



        /**
        *删除一个用户的部门权限
        *@method deleteOneUser
        *@param treeNode {Object}   节点对象
        */
        deleteOneUser: function (treeNode) {
            var html = this._layout.deleteDepartmentHtml();
            L.dialog.dialogModel('deleteDepartmentModel', 150, 300, html, '删除用户的部门权限');
            var name = treeNode.name;
            var text = '是否删除用户：' + name + '?';
            $(".deleteDepartment p").html(text);
            $(".submitDeleteDepartment").on('click', { context: this }, function (e) { e.data.context.submitDeleteOneUser(treeNode); });
            $(".cancelDeleteDepartment").on('click', { context: this }, function (e) { e.data.context.cancelDeleteDepartment(e); });
        },
        /**
        *确定按钮--删除用户的部门权限对话框
        *@method submitDeleteOneUser
        *@param treeNode {Object} 节点对象
        */
        submitDeleteOneUser: function (treeNode) {
            this.cancelDeleteDepartment();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);

            var departmentId = treeNode.departmentId;
            var userId = treeNode.userId;
            var userName = treeNode.name;
            var nodeId = treeNode.id;
            var data = '[{"DEPARTMENTID":"' + departmentId + '","USERID":"' + userId + '","USERNAME":"' + userName + '"}]';
            L.baseservice.deleteUserDept({
                async: true,
                data: data,
                context: this,
                success: function (text) {
                    var treeObj = this.tree.getTreeObj("organizationTree");
                    treeObj.removeNode(treeNode);
                    treeObj.refresh();
                    //判断勾选节点个数来激活批量删除按钮
                    this.openOrCloseDeleteBtn(treeObj);
                    //显示保存成功提示信息
                    L.mtip.usetip(2, "删除成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "删除用户的部门权限失败", 1234);
                }
            });
        },







        /**
        *验证部门名称
        *@method verifyDepartmentName
        *@param name {String} 部门名称
        *@return {Object} 部门名称验证结果以及提示内容
        */
        verifyDepartmentName: function (name) {
            if (name == "")
                return { "verifyName": false, "errorText": "部门名称不能为空" };
            if (name.indexOf(" ") > -1)
                return { "verifyName": false, "errorText": "部门名称不能包含空格" };
            if (name.length > 10)
            {
                return { "verifyName": false, "errorText": "部门名称长度大于10" };
            }
            var result = null;
            L.baseservice.getOrganizationTree({
                async: false,
                context: this,
                success: function (departments) {
                    if (departments == null)
                    {
                        result = { "verifyName": true, "errorText": "" };
                    }
                    else
                    {
                        var data = departments;
                        var count = 0;
                        for (var i = 0; i < data.length; i++)
                        {
                            if (data[i].DEPARTMENTNAME == name)
                            {
                                result = { "verifyName": false, "errorText": "部门名称已使用，请重新重新输入" };
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
                    result = { "verifyName": false, "errorText": "获取所有部门信息失败" };
                }
            });
            return result;
        },
        /**
        *显示默认添加组织机构菜单
        *@method openDefaultStatus
        */
        openDefaultStatus: function (e) {
            //显示默认添加用户框
            $(".useManage_Middle_Search").removeClass("active");
            $("#addOrgDiv").addClass("active");
        },
        /**
        *隐藏默认添加组织机构菜单
        *@method openDefaultStatus
        */
        closeDefaultStatus: function (e) {
            //隐藏默认添加用户框
            $(".useManage_Middle_Search").addClass("active");
            $("#addOrgDiv").removeClass("active");
        },

        /**
        *点击单选或多选
        *@method changeTreeCheckType
        */
        changeTreeCheckType:function(e)
        {
            var text = $(e.target).text();
            $(e.target).siblings(".treeCheckType").removeClass("active").end().addClass("active");
            var treeObj = this.tree.getTreeObj("organizationTree");
            this.tree.changeCheckedAllState({ "treeObj": treeObj, "checked": false });
            treeObj.refresh();
            if (text == "单选")
            {
                treeObj.setting.check.chkStyle = 'radio';
            }
            else if (text == "多选")
            {
                treeObj.setting.check.chkStyle = 'checkbox';
            }
            else
            { }
            this.tree.changeCheckedAllState({ "treeObj": treeObj, "checked": false });
            treeObj.refresh();

            //关闭批量删除按钮
            $(".useManage_Middle .deleteDepartment").removeClass("titleIconActive").addClass("titleIcon");
        },

        /**
        *批量删除事件
        *@method deleteMoreDeptEvent
        *@param e {Object}   节点对象
        */
        deleteMoreDeptEvent:function(e){
            var html = this._layout.deleteDepartmentHtml();
            L.dialog.dialogModel('deleteDepartmentModel', 150, 300, html, '批量删除');
            var text = '是否删除勾选的节点?';
            $(".deleteDepartment p").html(text);
            $(".submitDeleteDepartment").on('click', { context: this }, function (e) { e.data.context.submitDeleteMoreDept(e); });
            $(".cancelDeleteDepartment").on('click', { context: this }, function (e) { e.data.context.cancelDeleteDepartment(e); });
        },

        /**
        *删除事件（批量删除）
        *@method submitDeleteMoreDept
        *@param e {Object}   事件对象
        */
        submitDeleteMoreDept: function (e) {
            this.cancelDeleteDepartment();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);

            var treeObj = this.tree.getTreeObj("organizationTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
            if (nodes.length == 0)
            {
                L.dialog.errorDialogModel("没有选中内容");
                return;
            }
            var userNodes = [];
            var departmentNodes1 = [];
            var departmentNodes2 = [];
            for (var i = 0; i < nodes.length; i++)
            {
                if (nodes[i].type == "user")
                {
                    userNodes.push(nodes[i]);
                }
                if (nodes[i].type == "department1")
                {
                    departmentNodes1.push(nodes[i]);
                }
                if (nodes[i].type == "department2")
                {
                    departmentNodes2.push(nodes[i]);
                }
            }
            //仅删除部门下的用户信息
            if (userNodes.length > 0 && departmentNodes1.length == 0 && departmentNodes2.length == 0)
            {
                this.deleteOnlyUser(userNodes);
            }
            //仅删除部门信息
            if (userNodes.length == 0 && (departmentNodes1.length > 0 || departmentNodes2.length > 0))
            {
                this.deleteOnlyDepartment(departmentNodes1, departmentNodes2);
            }
            //仅删除部门信息以及部门下的用户信息
            if (userNodes.length > 0 && (departmentNodes1.length > 0 || departmentNodes2.length > 0))
            {
                this.deleteDepartmentAndUser(userNodes, departmentNodes1, departmentNodes2);
            }

        },

        //仅删除部门下的用户节点
        deleteOnlyUser: function (userNodes) {
            var data = '[{"DEPARTMENTID":"' + userNodes[0].departmentId + '","USERID":"' + userNodes[0].userId + '","USERNAME":"' + userNodes[0].name + '"}';
            for (var j = 1; j < userNodes.length; j++)
            {
                data += ',{"DEPARTMENTID":"' + userNodes[j].departmentId + '","USERID":"' + userNodes[j].userId + '","USERNAME":"' + userNodes[j].name + '"}';
            }
            data += ']';
            //删除
            L.baseservice.deleteUserDept({
                async: true,
                data: data,
                context: this,
                success: function (text) {
                    var treeObj = this.tree.getTreeObj("organizationTree");
                    for (var i = 0; i < userNodes.length; i++)
                    {
                        var nodeId = 'department-' + userNodes[i].departmentId;
                        var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": nodeId });
                        for (var j = 0; j < node.children.length; j++)
                        {
                            if (userNodes[i].userId == node.children[j].userId)
                            {
                                var node = node.children[j];
                                this.tree.removeNode({ "treeObj": treeObj, "treeNode": node });
                                treeObj.refresh();
                                break;
                            }
                        }
                        //判断勾选节点个数来激活批量删除按钮
                        this.openOrCloseDeleteBtn(treeObj);
                        //显示保存成功提示信息
                        L.mtip.usetip(2, "删除成功", 1234);
                    }
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "删除用户的部门权限失败", 1234);
                    return;
                }
            });
        },

        //仅删除部门节点
        deleteOnlyDepartment: function (departmentNodes1, departmentNodes2) {
            for (var i = 0; i < departmentNodes1.length; i++)
            {
                if (departmentNodes1[i].children.length > 0)
                    departmentNodes1.splice(i, 1);
            }
            for (var i = 0; i < departmentNodes2.length; i++)
            {
                if (departmentNodes2[i].children.length > 0)
                    departmentNodes2.splice(i, 1);
            }
            //构造数据
            var data = '[';
            if (departmentNodes1.length > 0)
            {
                data += '{"DEPARTMENTID":' + departmentNodes1[0].departmentId + '}';
                for (var i = 1; i < departmentNodes1.length; i++)
                {
                    data += ',{"DEPARTMENTID":' + departmentNodes1[i].departmentId + '}';
                }
                if (departmentNodes2.length > 0)
                {
                    for (var i = 0; i < departmentNodes2.length; i++)
                    {
                        data += ',{"DEPARTMENTID":' + departmentNodes2[i].departmentId + '}';
                    }
                }
            }
            else
            {
                if (departmentNodes2.length > 0)
                {
                    data += '{"DEPARTMENTID":' + departmentNodes2[0].departmentId + '}';
                    for (var i = 1; i < departmentNodes2.length; i++)
                    {
                        data += ',{"DEPARTMENTID":' + departmentNodes2[i].departmentId + '}';
                    }
                }
            }
            data += ']';

            L.baseservice.deleteDepartment({
                async: true,
                data: data,
                context: this,
                success: function (text) {
                    var treeObj = this.tree.getTreeObj("organizationTree");
                    for (var i = 0; i < departmentNodes2.length; i++)
                    {
                        var nodeId = departmentNodes2[i].id;
                        var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": nodeId });
                        this.tree.removeNode({ "treeObj": treeObj, "treeNode": node });
                    }
                    for (var i = 0; i < departmentNodes1.length; i++)
                    {
                        var nodeId = departmentNodes1[i].id;
                        var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": nodeId });
                        this.tree.removeNode({ "treeObj": treeObj, "treeNode": node });
                    }
                    this.tree.changeCheckedAllState({ "treeObj": treeObj, "checked": false });
                    this.tree.refresh(treeObj);
                    //如果没有部门
                    var nodes = this.tree.getNodes({ "treeObj": treeObj, "key": "type", "value": "department1" });
                    if (nodes.length == 0)
                    {
                        var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": 'department-0' });
                        this.tree.removeNode({ "treeObj": treeObj, "treeNode": node });
                        this.tree.refresh(treeObj);
                        this.openDefaultStatus();
                    }
                    //判断勾选节点个数来激活批量删除按钮
                    this.openOrCloseDeleteBtn(treeObj);
                    //显示保存成功提示信息
                    L.mtip.usetip(2, "删除成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "删除机构失败", 1234);
                }
            });
            
        },

        //删除部门以及部门下的用户
        deleteDepartmentAndUser:function(userNodes,departmentNodes1, departmentNodes2){
            //先删除部门下的用户
            var data = '[{"DEPARTMENTID":"' + userNodes[0].departmentId + '","USERID":"' + userNodes[0].userId + '","USERNAME":"' + userNodes[0].name + '"}';
            for (var j = 1; j < userNodes.length; j++)
            {
                data += ',{"DEPARTMENTID":"' + userNodes[j].departmentId + '","USERID":"' + userNodes[j].userId + '","USERNAME":"' + userNodes[j].name + '"}';
            }
            data += ']';
            
            L.baseservice.deleteUserDept({
                async: true,
                data: data,
                context: this,
                success: function (text) {
                    var treeObj = this.tree.getTreeObj("organizationTree");
                    for (var i = 0; i < userNodes.length; i++)
                    {
                        var nodeId = 'department-' + userNodes[i].departmentId;
                        var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": nodeId });
                        for (var j = 0; j < node.children.length; j++)
                        {
                            if (userNodes[i].userId == node.children[j].userId)
                            {
                                var node = node.children[j];
                                this.tree.removeNode({ "treeObj": treeObj, "treeNode": node });
                                treeObj.refresh();
                                break;
                            }
                        }
                    }
                    //删除部门信息
                    for (var i = 0; i < departmentNodes1.length; i++)
                    {
                        if (departmentNodes1[i].children.length > 0)
                            departmentNodes1.splice(i, 1);
                    }
                    for (var i = 0; i < departmentNodes2.length; i++)
                    {
                        if (departmentNodes2[i].children.length > 0)
                            departmentNodes2.splice(i, 1);
                    }
                    //构造数据
                    var data = '[';
                    if (departmentNodes1.length > 0)
                    {
                        data += '{"DEPARTMENTID":' + departmentNodes1[0].departmentId + '}';
                        for (var i = 1; i < departmentNodes1.length; i++)
                        {
                            data += ',{"DEPARTMENTID":' + departmentNodes1[i].departmentId + '}';
                        }
                        if (departmentNodes2.length > 0)
                        {
                            for (var i = 0; i < departmentNodes2.length; i++)
                            {
                                data += ',{"DEPARTMENTID":' + departmentNodes2[i].departmentId + '}';
                            }
                        }
                    }
                    else
                    {
                        if (departmentNodes2.length > 0)
                        {
                            data += '{"DEPARTMENTID":' + departmentNodes2[0].departmentId + '}';
                            for (var i = 1; i < departmentNodes2.length; i++)
                            {
                                data += ',{"DEPARTMENTID":' + departmentNodes2[i].departmentId + '}';
                            }
                        }
                    }
                    data += ']';

                    L.baseservice.deleteDepartment({
                        async: true,
                        data: data,
                        context: this,
                        success: function (text) {
                            var treeObj = this.tree.getTreeObj("organizationTree");
                            for (var i = 0; i < departmentNodes2.length; i++)
                            {
                                var nodeId = departmentNodes2[i].id;
                                var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": nodeId });
                                this.tree.removeNode({ "treeObj": treeObj, "treeNode": node });
                            }
                            for (var i = 0; i < departmentNodes1.length; i++)
                            {
                                var nodeId = departmentNodes1[i].id;
                                var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": nodeId });
                                this.tree.removeNode({ "treeObj": treeObj, "treeNode": node });
                            }
                            this.tree.changeCheckedAllState({ "treeObj": treeObj, "checked": false });
                            this.tree.refresh(treeObj);
                            //如果没有部门
                            var nodes = this.tree.getNodes({ "treeObj": treeObj, "key": "type", "value": "department1" });
                            if (nodes.length == 0)
                            {
                                var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": 'department-0' });
                                this.tree.removeNode({ "treeObj": treeObj, "treeNode": node });
                                this.tree.refresh(treeObj);
                                this.openDefaultStatus();
                            }
                            //判断勾选节点个数来激活批量删除按钮
                            this.openOrCloseDeleteBtn(treeObj);
                            //显示保存成功提示信息
                            L.mtip.usetip(2, "删除成功", 1234);
                        },
                        error: function (XMLHttpRequest, errorThrown) {
                            L.mtip.usetip(3, "删除机构失败", 1234);
                        }
                    });
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "删除用户的部门权限失败", 1234);
                    return;
                }
            });
        },




















        /**
        *添加用户角色
        *@method addUserRole
        *@param e {Object}   事件对象
        */
        addUserRole: function (e) {
            var roleTreeObj = this.tree.getTreeObj("roleTree");
            var organizationTreeObj = this.tree.getTreeObj("organizationTree");
            //判断是否勾选
            var hasNodes = this.tree.getCheckedNodes({ "treeObj": organizationTreeObj, "checked": true });
            if (hasNodes.length == 0)
            {
                L.dialog.errorDialogModel("组织机构树没有勾选项");
                return;
            }
            //判断组织机构树是单选还是多选
            var checkedType = organizationTreeObj.setting.check.chkStyle;
            if (checkedType == "radio")
            {
                //获取组织树勾选的节点
                var nodes = this.tree.getCheckedNodes({ "treeObj": organizationTreeObj, "checked": true });
                var Node = nodes[0];
                if (Node.type == "user")
                {
                    //对一个用户添加角色
                    this.addUserRoleFromUser(Node);
                }
                else
                {
                    //当勾选的是部门时，对其下的用户添加角色
                    this.addUserRoleFromDept(Node);
                }
            }
            else
            {
                //组织机构树为多选（获取勾选的所有用户）
                var nodes = this.tree.getCheckedNodes({ "treeObj": organizationTreeObj, "checked": true });
                var checkedUserNodes = [];
                for (var i = 0; i < nodes.length; i++)
                {
                    if (nodes[i].type == "user")
                        checkedUserNodes.push(nodes[i]);
                }
                //排除存在相同的用户
                var userNodes = [];
                for (var i = 0; i < checkedUserNodes.length; i++)
                {
                    var count = 0;
                    for (var j = 0; j < userNodes.length; j++)
                    {
                        if (checkedUserNodes[i].userId == userNodes[j].userId)
                        {
                            count++;
                            break;
                        }
                    }
                    if (count == 0)
                    {
                        userNodes.push(checkedUserNodes[i]);
                    }
                }
                if (userNodes.length == 0)
                {
                    L.dialog.errorDialogModel("没有勾选用户");
                    return;
                }
                //获取勾选的角色
                var Nodes = this.tree.getCheckedNodes({ "treeObj": roleTreeObj, "checked": true });
                if (Nodes.length == 0)
                {
                    L.dialog.errorDialogModel("没有勾选角色");
                    return;
                }
                //排除掉根节点
                for (var i = 0; i < Nodes.length; i++)
                {
                    if (Nodes[i].type == "root")
                    {
                        Nodes.splice(i, 1);
                        break;
                    }
                }
                if (Nodes.length > 1)
                {
                    L.dialog.errorDialogModel("只能勾选一个角色");
                    return;
                }
                //判断角色下是否已存在该用户
                var userNodes2 = [];
                for (var i = 0; i < userNodes.length; i++)
                {
                    var count = 0;
                    var length = Nodes[0].children.length;
                    for (var j = 0; j < length; j++)
                    {
                        if (parseInt(userNodes[i].userId) == Nodes[0].children[j].userId)
                        {
                            count++;
                            break;
                        }
                    }
                    if (count == 0)
                    {
                        userNodes2.push(userNodes[i]);
                    }
                }

                if (userNodes2.length == 0)
                {
                    L.dialog.errorDialogModel("用户已存在");
                    return;
                }
                else
                {
                    var data = '[{"USERID":' + userNodes2[0].userId + ',"ROLEID":' + Nodes[0].roleId + '}';
                    for (var i = 1; i < userNodes2.length; i++)
                    {
                        data += ',{"USERID":' + userNodes2[i].userId + ',"ROLEID":' + Nodes[0].roleId + '}'
                    }
                    data += ']';
                    L.baseservice.addUserRoles({
                        async: true,
                        data: data,
                        context: this,
                        success: function (text) {
                            var treeObj = this.tree.getTreeObj("roleTree");
                            var nodeId = 'role-' + Nodes[0].roleId;
                            var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": nodeId });
                            for (var i = 0; i < userNodes2.length; i++)
                            {
                                //node.children.push({ "id": userNodes2[i].userId, "pId": nodeId, "userId": userNodes2[i].id, "roleId": Nodes[0].roleId, "name": userNodes2[i].name, "type": "user", "nocheck": true });
                                node.children.push(this.handleData.roleTreeUser(userNodes2[i].userId, Nodes[0].roleId, userNodes2[i].name));
                            }
                            this.tree.changeCheckedAllState({ "treeObj": treeObj, "checked": false });
                            node.open = true;
                            this.tree.refresh(treeObj);

                            //显示保存成功提示信息
                            L.mtip.usetip(2, "添加成功", 1234);
                        },
                        error: function (XMLHttpRequest, errorThrown) {
                            //L.dialog.errorDialogModel("添加用户角色信息失败");
                            L.mtip.usetip(3, "添加用户角色失败", 1234);
                        }
                    });
                }
            }
        },
        /**
        *单独给一个用户添加用户角色（组织机构树单选状态下）
        *@method addUserRoleFromUser
        *@param Node {Object}   勾选的节点对象
        */
        addUserRoleFromUser: function (Node) {
            var roleTreeObj = this.tree.getTreeObj("roleTree");
            var organizationTreeObj = this.tree.getTreeObj("organizationTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": roleTreeObj, "checked": true });
            var userNodes = [];
            userNodes.push(Node);
            if (nodes.length == 0)
            {
                L.dialog.errorDialogModel("没有勾选角色");
                return;
            }
            for (var i = 0; i < nodes.length; i++)
            {
                if (nodes[i].type == "root")
                    nodes.splice(i, 1);
            }
            if (nodes.length > 1)
            {
                L.dialog.errorDialogModel("只能勾选一个角色");
                return;
            }
            
            //判断角色下是否已存在该用户
            var roleNode = nodes[0];
            var length = roleNode.children.length;
            if (length > 0)
            {
                for (var i = 0; i < length; i++)
                {
                    if (parseInt(userNodes[0].userId) == roleNode.children[i].userId)
                    {
                        userNodes.splice(0, 1);
                        break;
                    }
                }
                
            }
            if (userNodes.length == 0)
            {
                L.dialog.errorDialogModel("用户已存在");
                return;
            }
            else
            {
                //这里可能存在对多个角色分配同一个用户权限
                var data = '[{"USERID":' + Node.userId + ',"ROLEID":' + nodes[0].roleId + '}';
                for (var i = 1; i < nodes.length; i++)
                {
                    data += ',{"USERID":' + Node.userId + ',"ROLEID":' + nodes[i].roleId + '}'
                }
                data += ']';
                L.baseservice.addUserRoles({
                    async: true,
                    data: data,
                    context: this,
                    success: function (text) {
                        var treeObj = this.tree.getTreeObj("roleTree");
                        for (var i = 0; i < nodes.length; i++)
                        {
                            var nodeId = 'role-' + nodes[i].roleId;
                            var id = 'user-' + Node.userId;
                            var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": nodeId });
                            node.children.push(this.handleData.roleTreeUser(Node.userId, nodes[i].roleId, Node.name));
                            //node.children.push({ "id": id, "pId": nodeId, "userId": Node.userId, "roleId": nodes[i].roleId, "name": Node.name, "type": "user", "nocheck": true });
                            node.open = true;
                            this.tree.refresh(treeObj);
                        }
                        this.tree.changeCheckedAllState({ "treeObj": treeObj, "checked": false });
                        this.tree.refresh(treeObj);

                        //显示保存成功提示信息
                        L.mtip.usetip(2, "添加成功", 1234);
                    },
                    error: function (XMLHttpRequest, errorThrown) {
                        //L.dialog.errorDialogModel("添加用户角色信息失败");
                        L.mtip.usetip(3, "添加用户角色失败", 1234);
                    }
                });
            }
            
            

        },
        /**
        *给一个部门下的用户添加用户角色（组织机构树单选状态下）
        *@method addUserRoleFromDept
        *@param Node {Object}   勾选的节点对象
        */
        addUserRoleFromDept: function (Node) {
            var roleTreeObj = this.tree.getTreeObj("roleTree");
            var organizationTreeObj = this.tree.getTreeObj("organizationTree");
            //获取用户节点
            var type = Node.type;
            var checkedNodes = [];
            if (type == "root")
            {
                checkedNodes = this.tree.getNodes({ "treeObj": organizationTreeObj, "key": "type", "value": "user" });
            }
            else if (type == "department1")
            {
                //一级部门节点（下可以含有二级部门节点）
                if (Node.children.length > 0)
                {
                    for (var i = 0; i < Node.children.length; i++)
                    {
                        if (Node.children[i].type == "user")
                        {
                            checkedNodes.push(Node.children[i]);
                        }
                        else
                        {
                            //这个是二级部门节点
                            var node = Node.children[i];
                            if (node.children.length > 0)
                            {
                                for (var j = 0; j < node.children.length; j++)
                                {
                                    checkedNodes.push(node.children[j]);
                                }
                            }
                        }
                    }
                }
            }
            else if (type == "department2")
            {
                //二级部门节点
                if (Node.children.length > 0)
                {
                    for (var i = 0; i < Node.children.length; i++)
                    {
                        checkedNodes.push(Node.children[i]);
                    }
                }
            }
            else
            { }
            //排除存在相同的用户
            var userNodes = [];
            for (var i = 0; i < checkedNodes.length; i++)
            {
                var count = 0;
                for (var j = 0; j < userNodes.length; j++)
                {
                    if (checkedNodes[i].userId == userNodes[j].userId)
                    {
                        count++;
                        break;
                    }   
                }
                if (count == 0)
                {
                    userNodes.push(checkedNodes[i]);
                }
            }


            //获取角色节点
            var nodes = this.tree.getCheckedNodes({ "treeObj": roleTreeObj, "checked": true });
            if (nodes.length == 0)
            {
                L.dialog.errorDialogModel("没有勾选角色");
                return;
            }
            //排除掉根节点
            for (var i = 0; i < nodes.length; i++)
            {
                if (nodes[i].type == "root")
                {
                    nodes.splice(i, 1);
                    break;
                }
            }
            if (nodes.length > 1)
            {
                L.dialog.errorDialogModel("只能勾选一个角色");
                return;
            }

            var node = nodes[0];
            var userNode2 = [];
            //判断角色下是否已存在该用户
            for (var i = 0; i < userNodes.length; i++)
            {
                var count = 0;
                for (var j = 0; j < node.children.length; j++)
                {
                    if (parseInt(userNodes[i].userId) == node.children[j].userId)
                    {
                        count++;
                        break;
                    }
                }
                if (count == 0)
                {
                    userNode2.push(userNodes[i]);
                }
            }

            if (userNode2.length == 0)
            {
                L.dialog.errorDialogModel("用户已存在");
                return;
            }
            else
            {
                //这里可能存在对多个角色分配同一个用户权限
                var data = '[{"USERID":' + userNode2[0].userId + ',"ROLEID":' + node.roleId + '}';
                for (var i = 1; i < userNode2.length; i++)
                {
                    data += ',{"USERID":' + userNode2[i].userId + ',"ROLEID":' + node.roleId + '}'
                }
                data += ']';
                L.baseservice.addUserRoles({
                    async: true,
                    data: data,
                    context: this,
                    success: function (text) {
                        var treeObj = this.tree.getTreeObj("roleTree");
                        var nodeId = 'role-' + node.roleId;
                        var roleNode2 = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": nodeId });
                        for (var i = 0; i < userNode2.length; i++)
                        {
                            var id = 'user-' + userNode2[i].userId;
                            //roleNode2.children.push({ "id": id, "pId": nodeId, "userId": userNode2[i].userId, "roleId": node.roleId, "name": userNode2[i].name, "type": "user", "nocheck": true });
                            roleNode2.children.push(this.handleData.roleTreeUser(userNode2[i].userId, node.roleId, userNode2[i].name));
                        }
                        roleNode2.open = true;
                        this.tree.changeCheckedAllState({ "treeObj": treeObj, "checked": false });
                        this.tree.refresh(treeObj);

                        //显示保存成功提示信息
                        L.mtip.usetip(2, "添加成功", 1234);
                    },
                    error: function (XMLHttpRequest, errorThrown) {
                        //L.dialog.errorDialogModel("添加用户角色信息失败");
                        L.mtip.usetip(3, "添加用户角色失败", 1234);
                    }
                });
            }














            



        },



        /**
        *同步抽取OA的用户、组织机构、用户组织关系数据
        *@method getOAUserEvent
        */
        getOAUserEvent: function (e) {
            //显示对话框
            var html = this._layout.oaTipHtml();
            L.dialog.dialogModel('oaTipModel', 150, 300, html, '同步OA组织用户');
            $(".oaDialog input[type='checkbox']").attr("checked", 'true');
            $(".submitOAInfo").on('click', { context: this }, function (e) { e.data.context.submitOAInfo(e); });
            $(".cancelOAInfo").on('click', { context: this }, function (e) { e.data.context.cancelOAInfo(e); });
        },

        submitOAInfo: function (e) {
            //status为0则为覆盖，否则不覆盖
            var status = 0;
            if (!$(".oaDialog input[type='checkbox']").is(':checked'))
                status = 1;
            this.cancelOAInfo();
            //显示保存中提示信息
            L.mtip.usetip(1, "数据抽取中...", 1234);
            L.baseservice.synchronizedOAInfo({
                async: true,
                status: status,
                context: this,
                success: function (text) {
                    this.getOAOrgTree();
                    this.userTree.getOaUserTree();

                    //显示保存成功提示信息
                    L.mtip.usetip(2, "抽取OA信息成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "抽取OA信息失败", 1234);
                }
            });
        },

        cancelOAInfo: function (e) {
            $("#oaTipModel").remove();
        },


        /**
        *组织树搜索
        *@method search
        */
        search: function (e) {
            var text = $.trim($(".useManage_Middle_Search>input").val());
            var treeObj = this.tree.getTreeObj("organizationTree");
            var Nodes1 = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "type", "value": "department1" });  //获取所有一级组织节点
            var Nodes2 = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "type", "value": "department2" });  //获取所有二级组织节点
            var Nodes = Nodes1.concat(Nodes2);  //所有组织节点

            if (text == "")
            {
                treeObj.showNodes(Nodes);
            }
            else
            {
                var orgNodes = [],orgNodes1 = [],orgNodes2 =[];
                var searchNodes = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "name", "value": text });
                //获取角色和用户的节点
                for (var i = 0; i < searchNodes.length; i++)
                {
                    if (searchNodes[i].type == "department1")
                    {
                        orgNodes1.push(searchNodes[i]);
                    }
                    if (searchNodes[i].type == "department2")
                    {
                        orgNodes2.push(searchNodes[i]);
                    }
                }
                //获取含有二级组织的一级组织节点
                for (var i = 0; i < orgNodes2.length; i++)
                {
                    var parentNode = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": orgNodes2[i].pId });
                    var count = 0;
                    for (var j = 0; j < orgNodes1.length; j++)
                    {
                        if (parentNode.id == orgNodes1[j].id)
                        {
                            count++;
                            break;
                        }
                    }
                    if (count == 0)
                    {
                        orgNodes1.push(parentNode);
                    }
                }
                orgNodes = orgNodes1.concat(orgNodes2);


                //隐藏所有节点（除根节点）
                treeObj.hideNodes(Nodes);
                //显示模糊搜索的结果
                treeObj.showNodes(orgNodes);
            }
        },


    });
    return L.DCI.UserPanel;
});