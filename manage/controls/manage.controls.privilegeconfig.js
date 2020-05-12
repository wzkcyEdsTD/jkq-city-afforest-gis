/**
*权限配置类
*@module controls
*@class DCI.PrivilegeConfig
*/
define("manage/controls/privilegeconfig", [
    "leaflet",
    "ztree",
    "ztree/exhide",
    "manage/controls/tree",
    "plugins/scrollbar",
    "manage/layout/privilegeconfig"
], function (L) {

    L.DCI.PrivilegeConfig = L.Class.extend({
        /**
        *类id
        *@property id
        *@type {String}
        */
        id: 'privilegeConfig',
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
        *当前选中角色的专题权限
        *@property _roleFeature
        *@type {Object}
        *@private
        */
        _currentRole: null,
        _roleFeature: null,
        _roleFeatureAdd: [],
        _roleFeatureDelete: [],

        /**
        *当前选中角色的功能权限
        *@property _roleFunction
        *@type {Object}
        *@private
        */
        _roleFunction: null,
        _roleFunctionAdd: [],
        _roleFunctionDelete: [],

        _resourceTreeObj: null,
        _functionTreeObj: null,
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
        loading: function () {
            $(".sitemappanel_title").text("权限配置");
            this._body = $(".privilege_config");
            this._layout = new L.DCI.PrivilegeConfigLayout();
            this._body.html(this._layout.getBodyHtml());
            this.handleData = new L.DCI.Manage.HandleData();
            this.tree = new L.DCI.Tree();
            this.getRoleTree();
            this.getFeatureTree();
            this.getFunctionTree();
            //滚动条
            $(".privilegeConfig_Left_Container>div").mCustomScrollbar({ theme: "minimal-dark" });
            $(".privilegeConfig_Middle_Container>div").mCustomScrollbar({ theme: "minimal-dark" });
            $(".privilegeConfig_Right_Container>div").mCustomScrollbar({ theme: "minimal-dark" });
            $("#privilegeConfigFeatureTree_save").on("click", { context: this }, this._saveRoleFeature);
            $("#privilegeConfigFunctionTree_save").on("click", { context: this }, this._saveRoleFunction);

            //角色树--点击搜索
            $(".privilegeConfig_Left_Search").on('click', '.search', { context: this }, function (e) { e.data.context.searchRole(e); });
            //角色树--搜索(回车键触发)
            $(".privilegeConfig_Left_Search").on('keydown', 'input', { context: this }, function (e) {
                var e = e || window.event;
                if (e.keyCode == 13)
                {
                    e.data.context.searchRole(e);
                    return false;
                }
            });

            //专题树--点击搜索
            $(".privilegeConfig_Middle_Search").on('click', '.search', { context: this }, function (e) { e.data.context.searchFeature(e); });
            //专题树--搜索(回车键触发)
            $(".privilegeConfig_Middle_Search").on('keydown', 'input', { context: this }, function (e) {
                var e = e || window.event;
                if (e.keyCode == 13)
                {
                    e.data.context.searchFeature(e);
                    return false;
                }
            });

            //功能树--点击搜索
            $(".privilegeConfig_Right_Search").on('click', '.search', { context: this }, function (e) { e.data.context.searchFunction(e); });
            //功能树--搜索(回车键触发)
            $(".privilegeConfig_Right_Search").on('keydown', 'input', { context: this }, function (e) {
                var e = e || window.event;
                if (e.keyCode == 13)
                {
                    e.data.context.searchFunction(e);
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
                    selectedMulti: false
                },
                check: {
                    enable: true,
                    chkStyle: "radio",
                    chkboxType: { "Y": "ps", "N": "ps" },
                    radioType: "1",
                    nocheckInherit: false
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
                        //_this.roleTreeOnClick(event, treeId, treeNode);
                        var ele = $(event.target).parent().siblings('.chk');
                        $(ele).click();
                    }
                },
            };
            return setting;
        },

        /**
        *数据资源树配置
        *@method featureTreeSetting
        *@return {Object}   返回配置Json对象
        */
        featureTreeSetting: function () {
            var _this = this;
            var setting = {
                check: {
                    enable: true,
                    chkStyle: "checkbox",
                    chkboxType: { "Y": "ps", "N": "s" },
                    radioType: "all",
                    nocheckInherit: false
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
                        _this.featureTreeOnClick(event, treeId, treeNode);
                    },
                    onClick: function (event, treeId, treeNode) {
                        var ele = $(event.target).parent().siblings('.chk');
                        $(ele).click();
                    }
                },
            };
            return setting;
        },

        /**
        *功能资源树配置
        *@method featureTreeSetting
        *@return {Object}   返回配置Json对象
        */
        functionTreeSetting: function () {
            var _this = this;
            var setting = {
                check: {
                    enable: true,
                    chkStyle: "checkbox",
                    radioType: "all",
                    nocheckInherit: false
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
                        _this.functionTreeOnClick(event, treeId, treeNode);
                    },
                    onClick: function (event, treeId, treeNode) {
                        var ele = $(event.target).parent().siblings('.chk');
                        $(ele).click();
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
            L.baseservice.getRole({
                async: true,
                context: this,
                success: function (roles) {
                    var obj = roles;
                    var length = obj.length;
                    var dataNodes = new Array();
                    if (length != 0)
                    {
                        dataNodes.push(this.handleData.roleTreeRoot2());
                    }
                    for (var j = 0; j < length; j++) {
                        dataNodes.push(this.handleData.roleTreeRole2(obj[j].ROLEID, obj[j].ROLENAME, obj[j].DESCRIPTION, obj[j].SINDEX));
                    }
                    //生成树
                    var containerObj = $("#privilegeConfigRoleTree");
                    this.tree.show({ "elementObj": containerObj, "setting": this.roleTreeSetting(), "nodes": dataNodes });
                    var treeObj = this.tree.getTreeObj("privilegeConfigRoleTree");
                    this.tree.refresh(treeObj);

                },
                error: function () {
                    L.dci.app.util.dialog.alert("温馨提示", "获取所有角色失败");
                    //L.dialog.errorDialogModel("获取所有角色失败");
                }
            });
        },

        /**
        *获取数据资源树
        *@method getFunctionTree
        */
        getFeatureTree: function () {
            L.baseservice.getAllFeature({
                async: true,
                context: this,
                success: function (features) {
                    var obj = features;
                    var length = obj.length;
                    var dataNodes = new Array();
                    //插入根节点
                    if (length > 0)
                        dataNodes.push(this.handleData.featureTreeRoot2());
                    //遍历各层数据
                    for (var i = 0; i < length; i++) {
                        if (obj[i].FEATURETYPE == "mapset_sub") {
                            dataNodes.push(this.handleData.featureTreeFeatureType2(obj[i].FEATUREID, obj[i].FEATUREPARENTID, obj[i].FEATURENAME, obj[i].FEATURETYPE, obj[i].SINDEX, obj[i].FEATUREEXTENT, obj[i].IMAGENAME, true));
                        } else if (obj[i].FEATURETYPE == "mapset_class") {
                            dataNodes.push(this.handleData.featureTreeFeatureType2(obj[i].FEATUREID, obj[i].FEATUREPARENTID, obj[i].FEATURENAME, obj[i].FEATURETYPE, obj[i].SINDEX, obj[i].FEATUREEXTENT, obj[i].IMAGENAME, false));
                        } else if (obj[i].FEATURETYPE == "mapset_layer") {
                            dataNodes.push(this.handleData.featureTreeFeature2(obj[i].FEATUREID, obj[i].FEATUREPARENTID, obj[i].FEATURENAME, obj[i].FEATURETYPE, obj[i].SINDEX, obj[i].FEATUREEXTENT, obj[i].IMAGENAME));
                        } else if (obj[i].FEATURETYPE == "mapset_collection") {
                            dataNodes.push(this.handleData.featureTreeFeatureType(obj[i].FEATUREID, obj[i].FEATUREPARENTID, obj[i].FEATURENAME, obj[i].FEATURETYPE, obj[i].SINDEX, obj[i].FEATUREEXTENT, obj[i].IMAGENAME, true));
                        } else if (obj[i].FEATURETYPE == "mapset_catalog") {
                            dataNodes.push(this.handleData.featureTreeFeatureType(obj[i].FEATUREID, obj[i].FEATUREPARENTID, obj[i].FEATURENAME, obj[i].FEATURETYPE, obj[i].SINDEX, obj[i].FEATUREEXTENT, obj[i].IMAGENAME, true));

                        }
                        else {
                        }
                    }
                    //生成树
                    var containerObj = $("#privilegeConfigFeatureTree");
                    this.tree.show({ "elementObj": containerObj, "setting": this.featureTreeSetting(), "nodes": dataNodes });
                    var treeObj = this.tree.getTreeObj("privilegeConfigFeatureTree");
                    this.tree.refresh(treeObj);
                    this._resourceTreeObj = treeObj;
                },
                error: function () {
                    L.dci.app.util.dialog.alert("温馨提示", "获取专题树失败");
                    //L.dialog.errorDialogModel("获取专题树失败");
                }
            });
        },

        /**
        *获取功能资源树
        *@method getFunctionTree
        */
        getFunctionTree: function () {
            L.baseservice.getFunction({
                async: true,
                context: this,
                success: function (functions) {
                    var dataObj = functions;
                    var length = dataObj.length;
                    var dataNodes = new Array();
                    if (length != 0)
                    {
                        dataNodes.push(this.handleData.functionTreeRoot2());
                    }
                    for (var i = 0; i < length; i++) {
                        var obj = dataObj[i].Obj;
                        var values = dataObj[i].Values;
                        dataNodes.push(
                            this.handleData.functionTreeFunctionType2(
                            obj.FUNCTIONTYPEID,
                            obj.FUNCTIONTYPENAME,
                            obj.SINDEX));

                        if (values.length > 0) {
                            for (var j = 0; j < values.length; j++) {
                                if (values[j]["FUNCTIONNAME"].toLowerCase() == "splitline") continue;
                                dataNodes.push(
                                    this.handleData.functionTreeFunction2(
                                    values[j].FUNCTIONID,
                                    values[j].FUNCTIONTYPEID,
                                    values[j].DISPLAYNAME, values[j].SINDEX));
                            }
                        }
                    }
                    //生成树
                    var containerObj = $("#privilegeConfigFunctionTree");
                    this.tree.show({ "elementObj": containerObj, "setting": this.functionTreeSetting(), "nodes": dataNodes });
                    var treeObj = this.tree.getTreeObj("privilegeConfigFunctionTree");
                    this.tree.refresh(treeObj);
                    this._functionTreeObj = treeObj;
                },
                error: function () {
                    L.dci.app.util.dialog.alert("温馨提示", "获取功能资源树失败");
                    //L.dialog.errorDialogModel("获取功能资源树失败");
                }
            });
        },

        /**
        *获取当前选中角色的权限
        *@method _getCurrentRoleAuthority
        *@param treeNode {Object}   节点对象
        *@private
        */
        _getCurrentRoleAuthority: function (treeNode) {
            this._clearSelectForRole();
            this._roleFunction = [];
            this._roleFeature = [];
            L.baseservice.getRoleFeature({
                async: false,
                context: this,
                id: treeNode.id.split('-')[1],
                success: function (res) {
                    if (res.length == 0) return;
                    for (var i = 0; i < res.length; i++) {
                        var node = this.tree.getNode({ "treeObj": this._resourceTreeObj, "key": "id", "value": res[i]["FEATUREID"] });
                        if (node != null)
                            node.checked = true;
                        //this.tree.updateNode({ "treeObj": this._resourceTreeObj, "treeNode": node });
                    }
                    this._resourceTreeObj.refresh();
                    this._roleFeature = res;
                }
            });
            L.baseservice.getRoleFunction({
                async: false,
                context: this,
                id: treeNode.id.split('-')[1],
                success: function (res) {
                    if (res.length == 0) return;
                    for (var i = 0; i < res.length; i++) {
                        var id = "function-" + res[i]["FUNCTIONID"];
                        var node = this.tree.getNode({ "treeObj": this._functionTreeObj, "key": "id", "value": id });
                        node.checked = true;
                        //this.tree.updateNode({ "treeObj": this._functionTreeObj, "treeNode": node });
                    }
                    this._functionTreeObj.refresh();
                    this._roleFunction = res;
                }
            });
        },

        /**
        *清除专题功能选中节点
        *@method _clearSelectForRole
        *@private
        */
        _clearSelectForRole: function () {
            this.tree.changeCheckedAllState({ "treeObj": this._resourceTreeObj, "checked": false });
            this.tree.changeCheckedAllState({ "treeObj": this._functionTreeObj, "checked": false });
        },

        /**
        *判断数组中是否存在指定项
        *@method _hasInArray
        *@param id {string} 专题ID
        *@private
        */
        _hasInArray: function (data, att, id) {
            for (var i = 0; i < data.length; i++) {
                if (data[i][att] == id)
                    return true;
            }
            return false;
        },
        /**
        *获取专题配置Json对象
        *@method _getUpdateRoleFeatureObj
        *@private
        */
        _getUpdateRoleFeatureObj: function () {
            if (this._currentRole == null) return;
            var data = this._resourceTreeObj.getCheckedNodes(true);
            //过滤掉跟节点
            for (var i = 0; i < data.length; i++)
            {
                if (data[i].type == "root")
                    data.splice(i, 1);
                break;
            }
            if (data.length == 0)
            {
                for (var i = 0; i < this._roleFeature.length; i++)
                    this._roleFeatureDelete.push(this._roleFeature[i]["FEATUREID"]);
            }
            else
            {
                for (var i = 0; i < data.length; i++)
                {
                    //if (data[i].type != "mapset_layer") continue;
                    if (!this._hasInArray(this._roleFeature, "FEATUREID", data[i].id))
                        this._roleFeatureAdd.push(data[i].id);
                }
                for (var i = 0; i < this._roleFeature.length; i++)
                {
                    if (!this._hasInArray(data, "id", this._roleFeature[i]["FEATUREID"]))
                        this._roleFeatureDelete.push(this._roleFeature[i]["FEATUREID"]);
                }
            }

            if (this._roleFeatureAdd.length > 0)
            {
                var ROLEID = 0;  //this._roleFeature[0].ROLEID
                if (this._roleFeature.length == 0)
                {
                    var treeObj = this.tree.getTreeObj("privilegeConfigRoleTree");
                    var nodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
                    if (nodes.length > 0)
                    {
                        ROLEID = nodes[0].id.split('-')[1];
                    }
                }
                else
                {
                    ROLEID = this._roleFeature[0].ROLEID;
                }

                for (var i = 0; i < this._roleFeatureAdd.length; i++)
                {
                    var FEATUREID = this._roleFeatureAdd[i];
                    this._roleFeature.push({ "FEATUREID": FEATUREID, "ROLEID": ROLEID });
                }
            }

            if (this._roleFeatureDelete.length > 0)
            {
                for (var i = 0; i < this._roleFeatureDelete.length; i++)
                {
                    var id = this._roleFeatureDelete[i];
                    for (var j = 0; j < this._roleFeature.length; j++)
                    {
                        if (this._roleFeature[j].FEATUREID == id)
                        {
                            this._roleFeature.splice(j, 1);
                            break;
                        }
                    }
                }
            }


            ///////////////////////////////////////////////
            if (this._roleFeatureAdd.length == 0 && this._roleFeatureDelete.length == 0)
                return 0;
            return "{'RoleId':'" + this._currentRole.id.split('-')[1] + "'" +
                ",FeatureAddIds:[" + this._roleFeatureAdd.join(',') + "]" +
                ",FeatureDeleteIds:[" + this._roleFeatureDelete.join(',') + "]}";
        },
        /**
        *获取功能配置Json对象
        *@method _getUpdateRoleFunctionObj
        *@private
        */
        _getUpdateRoleFunctionObj: function () {
            if (this._currentRole == null) return;
            var data = this._functionTreeObj.getCheckedNodes(true);
            if (data.length == 0)
            {
                for (var i = 0; i < this._roleFunction.length; i++)
                    this._roleFunctionDelete.push(this._roleFunction[i]["FUNCTIONID"]);
            }
            else
            {
                for (var i = 0; i < data.length; i++)
                {
                    if (data[i].type != "function") continue;
                    if (!this._hasInArray(this._roleFunction, "FUNCTIONID", data[i].id.split('-')[1]))
                        this._roleFunctionAdd.push(data[i].id.split('-')[1]);
                }
                for (var i = 0; i < this._roleFunction.length; i++)
                {
                    if (!this._hasInArray(data, "id", "function-" + this._roleFunction[i]["FUNCTIONID"]))
                        this._roleFunctionDelete.push(this._roleFunction[i]["FUNCTIONID"]);
                }
            }

            if (this._roleFunctionAdd.length > 0)
            {
                var ROLEID = 0;  //this._roleFunction[0].ROLEID;
                if (this._roleFunction.length == 0)
                {
                    var treeObj = this.tree.getTreeObj("privilegeConfigRoleTree");
                    var nodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
                    if (nodes.length > 0)
                    {
                        ROLEID = nodes[0].id.split('-')[1];
                    }
                }
                else
                {
                    ROLEID = this._roleFunction[0].ROLEID;
                }

                for (var i = 0; i < this._roleFunctionAdd.length; i++)
                {
                    var FUNCTIONID = this._roleFunctionAdd[i];
                    this._roleFunction.push({ "FUNCTIONID": FUNCTIONID, "ROLEID": ROLEID });
                }
            }

            if (this._roleFunctionDelete.length > 0)
            {
                for (var i = 0; i < this._roleFunctionDelete.length; i++)
                {
                    var id = this._roleFunctionDelete[i];
                    for (var j = 0; j < this._roleFunction.length; j++)
                    {
                        if (this._roleFunction[j].FUNCTIONID == id)
                        {
                            this._roleFunction.splice(j, 1);
                            break;
                        }
                    }
                }
            }
            ////////////////////////////////////////////
            if (this._roleFunctionAdd.length == 0 && this._roleFunctionDelete.length == 0)
                return 0;
            return "{'RoleId':'" + this._currentRole.id.split('-')[1] + "'" +
                ",FunctionAddIds:[" + this._roleFunctionAdd.join(',') + "]" +
                ",FunctionDeleteIds:[" + this._roleFunctionDelete.join(',') + "]}";
        },
        /**
        *保存配置
        *@method _saveRoleFeature
        *@param e {Object}  回调函数
        *@private
        */
        _saveRoleFeature: function (e) {
            var _this = e.data.context;
            if (_this._currentRole == null)
            {
                L.dci.app.util.dialog.alert("温馨提示", "请勾选角色");
               // L.dialog.errorDialogModel("请勾选角色");
                return;
            }
            
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);
            //处理数据 
            var data = _this._getUpdateRoleFeatureObj();
            if (data == 0)
            {
                //显示保存成功提示信息
                L.mtip.usetip(2, "数据没更改", 1234);
                return;
            }
            L.baseservice.updateRoleFeature({
                async: true,
                context: _this,
                data: data,
                success: function (res) {
                    _this._roleFeatureAdd.length = 0;
                    _this._roleFeatureDelete.length = 0;
                    if (res.Message)
                        L.mtip.usetip(2, "保存失败", 1234);
                    else
                    {
                        //显示保存成功提示信息
                        L.mtip.usetip(2, "保存成功", 1234);
                        //console.log(res);
                    }
                    
                }
            });
        },


        /**
       *保存配置
       *@method _saveRoleFunction
       *@param e {Object}  回调函数
       *@private
       */
        _saveRoleFunction: function (e) {
            var _this = e.data.context;
            if (_this._currentRole == null)
            {
                L.dci.app.util.dialog.alert("温馨提示", "请勾选角色");
               // L.dialog.errorDialogModel("请勾选角色");
                return;
            }
            
            var data = _this._getUpdateRoleFunctionObj();
            if (data == 0)
            {
                //显示保存成功提示信息
                L.mtip.usetip(2, "数据没更改", 1234);
                return;
            }
            L.baseservice.updateRoleFunction({
                async: true,
                context: _this,
                data: data,
                success: function (res) {
                    _this._roleFunctionDelete.length = 0;
                    _this._roleFunctionAdd.length = 0;
                    if (res.Message)
                        L.mtip.usetip(2, "保存失败", 1234);
                    else
                    {
                        //显示保存成功提示信息
                        L.mtip.usetip(2, "保存成功", 1234);
                        //console.log(res);
                     }
                    
                }
            });
        },
        /**
        *单击事件(角色树)
        *@method roleTreeOnClick
        *@param event {Object}      事件对象
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        roleTreeOnClick: function (event, treeId, treeNode) {
            //var ele = $(event.target).parent().siblings('.chk');
            //$(ele).click();
            this._roleFeatureAdd.length = 0;
            this._roleFeatureDelete.length = 0;
            this._roleFeature = null;
            this._roleFunction = null;
            if (treeNode.type == "role" && treeNode.checked == true)
            {
                this._currentRole = treeNode;
                this._getCurrentRoleAuthority(treeNode);
            }
            else
            {
                this._currentRole = null;
                //清除服务资源树状态
                var featureTreeObj = this.tree.getTreeObj("privilegeConfigFeatureTree");
                var functionTreeObj = this.tree.getTreeObj("privilegeConfigFunctionTree");
                this.tree.changeCheckedAllState({ "treeObj": featureTreeObj, "checked": false });
                this.tree.changeCheckedAllState({ "treeObj": functionTreeObj, "checked": false });
            }
        },

        /**
        *单击事件(数据资源树)
        *@method featureTreeOnClick
        *@param event {Object}      事件对象
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        featureTreeOnClick: function (event, treeId, treeNode) {

        },

        /**
        *单击事件(功能资源树)
        *@method functionTreeOnClick
        *@param event {Object}      事件对象
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        functionTreeOnClick: function (event, treeId, treeNode) {

        },


        /**
        *角色树搜索
        *@method searchFeature
        */
        searchRole:function(e){
            var text = $.trim($(".privilegeConfig_Left_Search>input").val());
            var treeObj = this.tree.getTreeObj("privilegeConfigRoleTree");
            var Nodes = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "type", "value": "role" });  //获取所有角色节点

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


        /**
        *专题树搜索
        *@method searchFeature
        */
        searchFeature: function (e) {
            var text = $.trim($(".privilegeConfig_Middle_Search>input").val());
            var treeObj = this.tree.getTreeObj("privilegeConfigFeatureTree");
            var Nodes1 = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "type", "value": "mapset_sub" });    //获取所有一级专题集节点
            var Nodes2 = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "type", "value": "mapset_class" });  //获取所有二级专题集节点
            var Nodes3 = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "type", "value": "mapset_layer" });  //获取所有专题节点
            var nodes = Nodes1.concat(Nodes2);
            var Nodes = nodes.concat(Nodes3);  //所有节点，根节点除外

            if (text == "")
            {
                treeObj.showNodes(Nodes);
                //收起所有的二级专题集
                for (var i = 0; i < Nodes2.length; i++)
                {
                    treeObj.expandNode(Nodes2[i], false, false, false);
                }

            }
            else
            {
                var featureNodes = [], featureNodes1 = [], featureNodes2 = [], featureNodes3 = [];
                var searchNodes = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "name", "value": text });
                //获取搜索到的专题节点
                for (var i = 0; i < searchNodes.length; i++)
                {
                    if (searchNodes[i].type == "mapset_layer")
                    {
                        featureNodes1.push(searchNodes[i]);
                    }
                }

                //获取含有专题的二级专题集节点
                for (var i = 0; i < featureNodes1.length; i++)
                {
                    var parentNode = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": featureNodes1[i].pId });
                    var count = 0;
                    for (var j = 0; j < featureNodes2.length; j++)
                    {
                        if (parentNode.id == featureNodes2[j].id && parentNode.type != "root")
                        {
                            count++;
                            break;
                        }
                    }
                    if (count == 0)
                    {
                        featureNodes2.push(parentNode);
                    }
                }

                //获取含有二级专题集的一级专题集节点
                for (var i = 0; i < featureNodes2.length; i++)
                {
                    var parentNode = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": featureNodes2[i].pId });
                    var count = 0;
                    for (var j = 0; j < featureNodes3.length; j++)
                    {
                        if (parentNode.id == featureNodes3[j].id && parentNode.type != "root")
                        {
                            count++;
                            break;
                        }
                    }
                    if (count == 0)
                    {
                        featureNodes3.push(parentNode);
                    }
                }

                featureNodes = featureNodes1.concat(featureNodes2);
                featureNodes = featureNodes.concat(featureNodes3);

                //隐藏所有节点（除根节点）
                treeObj.hideNodes(Nodes);
                //显示模糊搜索的结果
                treeObj.showNodes(featureNodes);
                treeObj.expandAll(true);
            }
        },


        /**
        *功能树搜索
        *@method searchFunction
        */
        searchFunction: function (e) {
            var text = $.trim($(".privilegeConfig_Right_Search>input").val());
            var treeObj = this.tree.getTreeObj("privilegeConfigFunctionTree");
            var Nodes1 = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "type", "value": "functionType" });    //获取所有功能类型节点
            var Nodes2 = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "type", "value": "function" });        //获取所有功能节点
            var Nodes = Nodes1.concat(Nodes2);   //所有节点，根节点除外

            if (text == "")
            {
                treeObj.showNodes(Nodes);
            }
            else
            {
                var funcNodes = [], funcNodes1 = [], funcNodes2 = [];
                var searchNodes = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "name", "value": text });
                //获取搜索到的专题节点
                for (var i = 0; i < searchNodes.length; i++)
                {
                    if (searchNodes[i].type == "function")
                    {
                        funcNodes1.push(searchNodes[i]);
                    }
                }

                //获取含有功能的功能类型节点
                for (var i = 0; i < funcNodes1.length; i++)
                {
                    var parentNode = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": funcNodes1[i].pId });
                    var count = 0;
                    for (var j = 0; j < funcNodes2.length; j++)
                    {
                        if (parentNode.id == funcNodes2[j].id && parentNode.type != "root")
                        {
                            count++;
                            break;
                        }
                    }
                    if (count == 0)
                    {
                        funcNodes2.push(parentNode);
                    }
                }


                funcNodes = funcNodes1.concat(funcNodes2);

                //隐藏所有节点（除根节点）
                treeObj.hideNodes(Nodes);
                //显示模糊搜索的结果
                treeObj.showNodes(funcNodes);
            }
        },


    });
    return L.DCI.PrivilegeConfig;
});