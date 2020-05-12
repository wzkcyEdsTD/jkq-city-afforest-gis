/**
*资源管理下图层对照类
*@module core
*@class DCI.Application
*/
define("manage/controls/layerContrast", [
    "leaflet",
    "manage/layout/layerContrast"
], function (L) {
    L.DCI.LayerContrast = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        */
        id: 'layerContrast',

        /**
        *树操作类对象
        *@property tree
        *@type {Object}
        */
        tree: null, 

        /**
        *保存一个业务的旧信息
        *@property _oldData
        *@type {Object}
        */
        _oldData:null,
        //_oldData: {
        //    BTMID: '',              //业务模型编号
        //    ATMID: '',              //业务类型编号
        //    LAYERGIS: '',           //对应GIS图
        //    LAYERLISTKEY: '',       //对应专题集
        //    TEMPLAYERGIS: '',       //临时对应GIS图  
        //    TEMPLAYERLISTKEY: ''    //临时对应专题集
        //    SYSKEY: ''              //业务类型
        //},

        /**
        *保存一个业务的新信息
        *@property _newData
        *@type {Object}
        */
        _newData:null,

        /**
        *操作状态
        *@property _status
        *@type {Object}
        */
        _status:0,

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            $(".sitemappanel_title").text("资源管理 > 图层对照");
            this._body = $(".resource_manage");
            this._layout = new L.DCI.LayerContrastLayout();
            this._body.html(this._layout.getBodyHtml());
            this.handleData = new L.DCI.Manage.HandleData();
            this.tree = new L.DCI.Tree();
            this.getBusinessTree();


            //初始化数据变量
            this._oldData = { BTMID: '', ATMID: '', LAYERGIS: '', LAYERLISTKEY: '', TEMPLAYERGIS: '', TEMPLAYERLISTKEY: '',SYSKEY:'' };
            this._newData = { BTMID: '', ATMID: '', LAYERGIS: '', LAYERLISTKEY: '', TEMPLAYERGIS: '', TEMPLAYERLISTKEY: '', SYSKEY: '' };


            //滚动条
            $(".layerContrast_Left_Container>div").mCustomScrollbar({ theme: "minimal-dark" });

            $("#businessTree").on('click', 'span.switch', { context: this }, function (e) {
                var kkk = "sdfs";
                //e.data.context.resultConfigLocationLayer(e);
            });

            $(".layerContrast_Right").on('click', 'p.chooseOne', { context: this }, function (e) { e.data.context.resultConfigLocationLayer(e); });
            $(".layerContrast_Right").on('click', 'p.chooseTwo', { context: this }, function (e) { e.data.context.resultConfigDefaultLayer(e); });
            $(".layerContrast_Right").on('click', 'p.chooseThree', { context: this }, function (e) { e.data.context.tempConfigLocationLayer(e); });
            $(".layerContrast_Right").on('click', 'p.chooseFour', { context: this }, function (e) { e.data.context.tempConfigDefaultLayer(e); });

            $(".layerContrast_Right").on('click', 'span.closeLayerContrastTree', { context: this }, function (e) { e.data.context.closeLayerContrastTree(e); });
            $(".layerContrast_Right").on('click', 'span.saveLayerContrast', { context: this }, function (e) { e.data.context.saveLayerContrast(e); });
        },

        /**
        *添加右边内容
        *@method addRightContent
        */
        addRightContent:function(){
            $(".layerContrast_Right").html(this._layout.getContentHtml());
        },

        /**
        *删除右边内容
        *@method deleteRightContent
        */
        deleteRightContent: function () {
            $(".layerContrast_Right").html("");
        },

        /**
        *添加右边内容树
        *@method addRgihtContentTree
        */
        addRgihtContentTree:function(){
            $(".layerContrast_Right .contentTree").html(this._layout.getContentTreeHtm());
        },

        /**
        *删除右边内容树
        *@method deleteRightContentTree
        */
        deleteRightContentTree: function () {
            $(".layerContrast_Right .contentTreet").html("");
        },

        /**
        *业务列表树配置
        *@method layerContrastBusinessSetting
        *@return {Object}   返回配置Json对象
        */
        layerContrastBusinessSetting: function () {
            var _this = this;
            var setting = {
                check: {
                    enable: true,
                    chkStyle: "radio",
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
                        _this.businessTreeOnClick(event, treeId, treeNode);
                    },
                    onClick: function (event, treeId, treeNode) {
                        var ele = $(event.target).parent().siblings('.chk');
                        $(ele).click();
                    },
                    onExpand: function (event, treeId, treeNode) {
                        _this.businessTreeOnExpand(event, treeId, treeNode);
                    }
                },
            };
            return setting;
        },

        /**
        *获取业务列表树
        *@method getBusinessTree
        */
        getBusinessTree: function () {

            var data = '{"token":"' + this.getToken() + '"}';
            
            //获取OA子系统树列表
            L.baseservice.getBusinessSystemList({
                async: true,
                data:data,
                context: this,
                success: function (sys) {
                    //var data = JSON.parse(JSON.parse(sys));
                    var data = sys;
                    var dataNodes = new Array();
                    dataNodes.push(this.handleData.layerContrastBusinessRoot());
                    data.sort(function (a, b) { return a.SINDEX > b.SINDEX ? 1 : -1 });
                    for (var i = 0; i < data.length; i++)
                    {
                        var obj = data[i];
                        var num = i + 1;
                        dataNodes.push(this.handleData.layerContrastBusinessSystem(num, obj.SYSNAME, obj.SINDEX, obj.SYSKEY, false));
                    }

                    var containerObj = $("#businessTree");
                    this.tree.show({ "elementObj": containerObj, "setting": this.layerContrastBusinessSetting(), "nodes": dataNodes });
                    var treeObj = this.tree.getTreeObj("businessTree");
                    this.tree.refresh(treeObj);
                },
                error: function () {
                    L.dialog.errorDialogModel("获取OA子系统列表失败");
                }
            });
        },

        /**
        *获取token
        *@method getToken
        */
        getToken:function(){
            var data = '';
            if (Manage_ParamConfig.isUseOAUserInfo == false)
                data = Manage_ParamConfig.OADefaultToken;
            else
            {
                var token = L.app.user.getToken();
                data = token;
            }
            return data;
        },

        /**
        *单击事件(业务列表树)
        *@method businessTreeOnClick
        *@param event {Object}      事件对象
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        businessTreeOnClick: function (event, treeId, treeNode) {
            _this = this;
            var treeObj = this.tree.getTreeObj("businessTree");
            if (treeNode.checked == true && treeNode.type == "业务节点")
            {
                var titleName = treeNode.nodeName;
                var atmId = treeNode.id;
                var btmId = treeNode.btmId;
                var syskey = treeNode.syskey;
                this._oldData.ATMID = atmId;
                this._oldData.BTMID = btmId;
                this._oldData.SYSKEY = syskey;
                this._newData.ATMID = atmId;
                this._newData.BTMID = btmId;
                this._newData.SYSKEY = syskey;
                this.addRightContent();
                $(".layerContrast_titleName").html(titleName);
                this.getBusinessInfo(atmId);
            }
            else
            {
                this.deleteRightContent();
            }
        },

        /**
        *展开节点(业务列表树)
        *@method businessTreeOnExpand
        *@param event {Object}      事件对象
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        businessTreeOnExpand: function (event, treeId, treeNode) {
            if (treeNode.children != undefined && treeNode.children.length == 0 && treeNode.type == "子系统")
            {
                var nodeId = treeNode.id;
                var syskey = treeNode.syskey;
                var data = '{"syskey":"' + syskey + '","token":"' + this.getToken() + '"}';

                //获取OA子系统树列表
                L.baseservice.getBusinessSystemTree({
                    async: true,
                    data: data,
                    context: this,
                    success: function (business) {
                        //var data = JSON.parse(JSON.parse(business));
                        var data = business;
                        var dataNodes = new Array();
                        for (var i = 0; i < data.length; i++)
                        {
                            var obj = data[i];
                            if (obj.BTTPID == "" || obj.BTTPID == null)
                            {
                                dataNodes.push(this.handleData.layerContrastBusinessType(obj.BTTID, nodeId, obj.NODENAME, obj.BTMID, "一级根节点节点", obj.SORTINDEX, obj.SYSKEY, true));
                            }
                            else
                            {
                                if (obj.BTMID == "" || obj.BTMID == null)
                                    dataNodes.push(this.handleData.layerContrastBusinessType(obj.BTTID, obj.BTTPID, obj.NODENAME, obj.BTMID, "二级类型节点", obj.SORTINDEX, obj.SYSKEY, false));
                                else
                                {
                                    var name = obj.NODENAME + '[' + obj.BTMID + ']';
                                    dataNodes.push(this.handleData.layerContrastBusiness(obj.BTTID, obj.BTTPID, name, obj.NODENAME, obj.BTMID, "业务节点", obj.SORTINDEX, obj.SYSKEY));
                                }

                            }
                        }
                        var treeObj = this.tree.getTreeObj("businessTree");
                        var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": nodeId });
                        treeObj.addNodes(node, dataNodes, true);
                        this.tree.refresh(treeObj);
                    },
                    error: function () {
                        L.dialog.errorDialogModel("获取OA子系统业务树失败");
                    }
                });
            }
        },


        /**
        *获取业务信息(业务列表树)
        *@method getBusinessInfo
        *@param id {Object}      id
        */
        getBusinessInfo:function(id){
            L.baseservice.getOneBusiness({
                async: true,
                id: id,
                context: this,
                success: function (business) {
                    var obj = business;
                    if (obj == "")
                    {
                        //清空输入框
                        $($(".contentChooseDiv .chooseOne")[0]).find("input").val("");
                        $($(".contentChooseDiv .chooseTwo")[0]).find("input").val("");
                        $($(".contentChooseDiv .chooseThree")[0]).find("input").val("");
                        $($(".contentChooseDiv .chooseFour")[0]).find("input").val("");
                        //清空变量的四个参数值
                        this._oldData.LAYERGIS = '';
                        this._oldData.LAYERLISTKEY = '';
                        this._oldData.TEMPLAYERGIS = '';
                        this._oldData.TEMPLAYERLISTKEY = '';
                        this._newData.LAYERGIS = '';
                        this._newData.LAYERLISTKEY = '';
                        this._newData.TEMPLAYERGIS = '';
                        this._newData.TEMPLAYERLISTKEY = '';
                    }
                    else
                    {
                        //给变量赋值
                        this._oldData.BTMID = obj.BTMID;
                        this._oldData.ATMID = obj.ATMID;
                        this._oldData.LAYERGIS = obj.LAYERGIS;
                        this._oldData.LAYERLISTKEY = obj.LAYERLISTKEY;
                        this._oldData.TEMPLAYERGIS = obj.TEMPLAYERGIS;
                        this._oldData.TEMPLAYERLISTKEY = obj.TEMPLAYERLISTKEY;
                        this._oldData.SYSKEY = obj.SYSKEY;
                        this._newData.BTMID = obj.BTMID;
                        this._newData.ATMID = obj.ATMID;
                        this._newData.LAYERGIS = obj.LAYERGIS;
                        this._newData.LAYERLISTKEY = obj.LAYERLISTKEY;
                        this._newData.TEMPLAYERGIS = obj.TEMPLAYERGIS;
                        this._newData.TEMPLAYERLISTKEY = obj.TEMPLAYERLISTKEY;
                        this._newData.SYSKEY = obj.SYSKEY;

                        var layergis = this._oldData.LAYERGIS == "" ? "" : this._oldData.LAYERGIS.split("、")[2];
                        var templayergis = this._oldData.TEMPLAYERGIS == "" ? "" : this._oldData.TEMPLAYERGIS.split("、")[2];
                        var layerlistkey = this._oldData.LAYERLISTKEY == "" ? "" : this._oldData.LAYERLISTKEY.replace(/\[\w*]/g, "");
                        var templayerlistkey = this._oldData.TEMPLAYERLISTKEY == "" ? "" : this._oldData.TEMPLAYERLISTKEY.replace(/\[\w*]/g, "");

                        //输入框显示业务信息
                        $($(".contentChooseDiv .chooseOne")[0]).find("input").val(layergis);
                        $($(".contentChooseDiv .chooseTwo")[0]).find("input").val(layerlistkey);
                        $($(".contentChooseDiv .chooseThree")[0]).find("input").val(templayergis);
                        $($(".contentChooseDiv .chooseFour")[0]).find("input").val(templayerlistkey);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    $($(".contentChooseDiv .chooseOne")[0]).find("input").val("");
                    $($(".contentChooseDiv .chooseTwo")[0]).find("input").val("");
                    $($(".contentChooseDiv .chooseThree")[0]).find("input").val("");
                    $($(".contentChooseDiv .chooseFour")[0]).find("input").val("");

                    this._oldData.LAYERGIS = '';
                    this._oldData.LAYERLISTKEY = '';
                    this._oldData.TEMPLAYERGIS = '';
                    this._oldData.TEMPLAYERLISTKEY = '';
                    this._newData.LAYERGIS = '';
                    this._newData.LAYERLISTKEY = '';
                    this._newData.TEMPLAYERGIS = '';
                    this._newData.TEMPLAYERLISTKEY = '';
                    L.dialog.errorDialogModel("获取业务数据失败");
                }
            });
        },

        /**
        *资源树配置
        *@method resourceTreeSetting
        *@return {Object}   返回配置Json对象
        */
        resourceTreeSetting: function () {
            var _this = this;
            var setting = {
                view: {
                    selectedMulti: false
                },
                check: {
                    enable: true,
                    chkStyle: "radio",
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
                        _this.resourceTreeOnClick(event, treeId, treeNode);
                    },
                    onClick: function (event, treeId, treeNode) {
                        _this.resourceTreeOnClick(event, treeId, treeNode);
                    }
                },
            };
            return setting;
        },

        /**
        *获取资源树
        *@method getResourceTree
        */
        getResourceTree: function () {
            //请求获取所有资源类型
            L.baseservice.getResourceType({
                async: true,
                context: this,
                success: function (resourceType) {
                    var obj = resourceType;
                    var length = obj.length;
                    var dataNodes = new Array();
                    dataNodes.push(this.handleData.resourceRoot());
                    for (var i = 0; i < length; i++)
                    {
                        if (obj[i].RESOURCETYPEID == 1)
                        {
                            dataNodes.push(this.handleData.resourceType(obj[i].RESOURCETYPEID, obj[i].RESOURCETYPENAME, true));
                        }
                        else
                        {
                            dataNodes.push(this.handleData.resourceType(obj[i].RESOURCETYPEID, obj[i].RESOURCETYPENAME, false));
                        }
                    }
                    //请求获取所有资源
                    L.baseservice.getResource({
                        async: true,
                        context: this,
                        success: function (resources) {
                            var obj2 = resources;
                            var length = obj2.length;
                            for (var j = 0; j < length; j++)
                            {
                                var resourceTypeId = obj2[j].RESOURCETYPEID;
                                switch (resourceTypeId)
                                {
                                    case 1:
                                    case 3:
                                    case 5:
                                        //插入矢量类型的图层节点(包括矢量图层类型和WMS图层类型)
                                        dataNodes.push(this.handleData.resourceDynamicMapLayer(obj2[j].RESOURCEID, obj2[j].RESOURCETYPEID, obj2[j].RESOURCENAME, false));
                                        break;
                                    case 2:
                                    case 4:
                                        //插入切片类型的图层节点(包括切片图层类型和WMTS图层类型)
                                        dataNodes.push(this.handleData.resourceTiledMapLayer(obj2[j].RESOURCEID, obj2[j].RESOURCETYPEID, obj2[j].RESOURCENAME));
                                        break;
                                    default:
                                        break;
                                }
                            }

                            //请求获取所有图层
                            L.baseservice.getLayer({
                                async: true,
                                context: this,
                                success: function (layers) {
                                    var obj = layers;
                                    var length = obj.length;
                                    //遍历各层数据
                                    for (var i = 0; i < length; i++)
                                    {
                                        var name = obj[i].LAYERNAME + '(' + obj[i].SINDEX + ')';
                                        dataNodes.push(this.handleData.resourceLayer(obj[i].LAYERID, obj[i].RESOURCEID, obj[i].RESOURCEID, name, obj[i].SINDEX));
                                    }
                                    //生成树
                                    var containerObj = $("#layerContrastTree");
                                    this.tree.show({ "elementObj": containerObj, "setting": this.resourceTreeSetting(), "nodes": dataNodes });
                                    var treeObj = this.tree.getTreeObj("layerContrastTree");
                                    this.tree.refresh(treeObj);

                                    //显示已勾选的节点
                                    if (this._status == 1 || this._status == 3)
                                    {
                                        this.showCheckNodesOnResourceTree();
                                    }
                                },
                                error: function (XMLHttpRequest, textStatus, errorThrown) {
                                    L.dialog.errorDialogModel("获取所有图层失败");
                                }
                            });


                            
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            L.dialog.errorDialogModel("获取所有资源失败");
                        }
                    });
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.dialog.errorDialogModel("获取所有资源类型失败");
                }
            });
        },

        /**
        *单击事件
        *@method resourceTreeOnClick
        *@param event {Object}      事件对象
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        resourceTreeOnClick: function (event, treeId, treeNode) {
            var ele = $(event.target).parent().siblings('.chk');
            $(ele).click();
            if (treeNode.checked == true && (treeNode.type == "dynamicLayer" || treeNode.type == "layer" || treeNode.type == "tiledLayer"))
            {
                var name = treeNode.name;
                var nodeId = treeNode.id;
                var resourceId = '';
                if (treeNode.type == "dynamicLayer")
                {
                    resourceId = nodeId.split("-")[1];
                }
                else
                {
                    resourceId = treeNode.resourceId;
                }

                var value = nodeId + '、' + resourceId + '、' + name;

                if (this._status == 1)
                {
                    $($(".contentChooseDiv .chooseOne")[0]).find("input").val(name);
                    this._newData.LAYERGIS = value;
                }
                else if (this._status == 3)
                {
                    $($(".contentChooseDiv .chooseThree")[0]).find("input").val(name);
                    this._newData.TEMPLAYERGIS = value;
                }
                else
                { }
                
            }
            else
            {//清空对应文本框内容以及变量值
                if (this._status == 1)
                {
                    $($(".contentChooseDiv .chooseOne")[0]).find("input").val("");
                    this._newData.LAYERGIS = "";
                }
                else if (this._status == 3)
                {
                    $($(".contentChooseDiv .chooseThree")[0]).find("input").val("");
                    this._newData.TEMPLAYERGIS = "";
                }
                else
                { }
            }
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
                    for (var i = 0; i < length; i++)
                    {
                        if (obj[i].FEATURETYPE == "mapset_sub")
                        {
                            dataNodes.push(this.handleData.featureTreeFeatureType2(obj[i].FEATUREID, obj[i].FEATUREPARENTID, obj[i].FEATURENAME, obj[i].FEATURETYPE, obj[i].SINDEX, obj[i].FEATUREEXTENT, obj[i].IMAGENAME, true));
                        } else if (obj[i].FEATURETYPE == "mapset_class")
                        {
                            dataNodes.push(this.handleData.featureTreeFeatureType2(obj[i].FEATUREID, obj[i].FEATUREPARENTID, obj[i].FEATURENAME, obj[i].FEATURETYPE, obj[i].SINDEX, obj[i].FEATUREEXTENT, obj[i].IMAGENAME, false));
                        } else if (obj[i].FEATURETYPE == "mapset_layer")
                        {
                            dataNodes.push(this.handleData.featureTreeFeature2(obj[i].FEATUREID, obj[i].FEATUREPARENTID, obj[i].FEATURENAME, obj[i].FEATURETYPE, obj[i].SINDEX, obj[i].FEATUREEXTENT, obj[i].IMAGENAME));
                        } else
                        {
                        }
                    }
                    //生成树
                    var containerObj = $("#layerContrastTree");
                    this.tree.show({ "elementObj": containerObj, "setting": this.featureTreeSetting(), "nodes": dataNodes });
                    var treeObj = this.tree.getTreeObj("layerContrastTree");
                    this.tree.refresh(treeObj);
                    this._resourceTreeObj = treeObj;

                    //显示已勾选的节点
                    if (this._status == 2 || this._status == 4)
                    {
                        this.showCheckNodesOnFeatureTree();
                    }
                },
                error: function () {
                    L.dialog.errorDialogModel("获取专题树失败");
                }
            });
        },


        /**
        *单击事件(数据资源树)
        *@method featureTreeOnClick
        *@param event {Object}      事件对象
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        featureTreeOnClick: function (event, treeId, treeNode) {
            //获取勾选专题的个数
            var treeObj = this.tree.getTreeObj("layerContrastTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
            var Nodes = [];
            for (var i = 0; i < nodes.length; i++)
            {
                if (nodes[i].type == "mapset_layer")
                    Nodes.push(nodes[i]);
            }

            if (Nodes.length>0)
            {
                var value = '';
                var name = '';
                var count = 0;
                for (var i = 0; i < Nodes.length; i++)
                {
                    name += Nodes[i].name;
                    value += Nodes[i].name + '[' + Nodes[i].id + ']';
                    count++;
                    if (count > 0 && count < Nodes.length)
                    {
                        name += '、';
                        value += '、';
                    }
                }

                if (this._status == 2)
                {
                    $($(".contentChooseDiv .chooseTwo")[0]).find("input").val(name);
                    this._newData.LAYERLISTKEY = value;
                }
                else if (this._status == 4)
                {
                    $($(".contentChooseDiv .chooseFour")[0]).find("input").val(name);
                    this._newData.TEMPLAYERLISTKEY = value;
                }
                else
                { }

            }
            else
            {//清空对应文本框内容以及变量值
                if (this._status == 2)
                {
                    $($(".contentChooseDiv .chooseTwo")[0]).find("input").val("");
                    this._newData.LAYERLISTKEY = "";
                }
                else if (this._status == 4)
                {
                    $($(".contentChooseDiv .chooseFour")[0]).find("input").val("");
                    this._newData.TEMPLAYERLISTKEY = "";
                }
                else
                { }
            }

        },



        /**
        *成果配置的定位图层
        *@method resultConfigLocationLayer
        */
        resultConfigLocationLayer: function (e) {
            this._status = 1;
            this.removeActiveClass();
            $(".contentChooseDiv .chooseOne").addClass("active");
            this.addRgihtContentTree();
            $(".contentTree>p>span:first-child").html("检索定位图层");
            this.getResourceTree();
            //滚动条
            $(".contentTree>div").mCustomScrollbar({ theme: "minimal-dark" }); 
        },

        /**
        *成果配置的默认加载图层
        *@method resultConfigDefaultLayer
        */
        resultConfigDefaultLayer: function (e) {
            this._status = 2;
            this.removeActiveClass();
            $(".contentChooseDiv .chooseTwo").addClass("active");
            this.addRgihtContentTree();
            $(".contentTree>p>span:first-child").html("默认加载图层");
            this.getFeatureTree();
            //滚动条
            $(".contentTree>div").mCustomScrollbar({ theme: "minimal-dark" });
        },

        /**
        *临时配置的定位图层
        *@method tempConfigLocationLayer
        */
        tempConfigLocationLayer: function (e) {
            this._status = 3;
            this.removeActiveClass();
            $(".contentChooseDiv .chooseThree").addClass("active");
            this.addRgihtContentTree();
            $(".contentTree>p>span:first-child").html("检索定位图层");
            this.getResourceTree();
            //滚动条
            $(".contentTree>div").mCustomScrollbar({ theme: "minimal-dark" });
        },

        /**
        *临时配置的默认加载图层
        *@method tempConfigDefaultLayer
        */
        tempConfigDefaultLayer: function (e) {
            this._status = 4;
            this.removeActiveClass();
            $(".contentChooseDiv .chooseFour").addClass("active");
            this.addRgihtContentTree();
            $(".contentTree>p>span:first-child").html("默认加载图层");
            this.getFeatureTree();
            //滚动条
            $(".contentTree>div").mCustomScrollbar({ theme: "minimal-dark" });
        },

        /**
        *关闭
        *@method closeLayerContrastTree
        */
        closeLayerContrastTree: function (e) {
            $(".layerContrast_Right .contentTree").html("");
            this.removeActiveClass();
        },

        /**
        *移除模块的active样式类
        *@method removeActiveClass
        */
        removeActiveClass: function () {
            var eleObj = $(".contentChooseDiv p");
            for (var i = 0; i < eleObj.length; i++)
            {
                var obj = eleObj[i];
                $(obj).removeClass("active");
            }
        },


        /**
        *在资源树上显示已勾选的节点
        *@method showCheckNodesOnResourceTree
        */
        showCheckNodesOnResourceTree: function () {
            var treeObj = this.tree.getTreeObj("layerContrastTree");
            if (this._status == 1)
            {
                var id = this._newData.LAYERGIS.split("、")[0];
                var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": id });
                node.checked = true;
                this.tree.updateNode({ "treeObj": treeObj, "treeNode": node});
            }

            if (this._status == 3)
            {
                var id = this._newData.TEMPLAYERGIS.split("、")[0];
                var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": id });
                node.checked = true;
                this.tree.updateNode({ "treeObj": treeObj, "treeNode": node });
            }
        },
        /**
        *在专题树上显示已勾选的节点
        *@method showCheckNodesOnFeatureTree
        */
        showCheckNodesOnFeatureTree:function(){
            var treeObj = this.tree.getTreeObj("layerContrastTree");
            if (this._status == 2)
            {
                var strArray = this._newData.LAYERLISTKEY.split("、");
                for (var i = 0; i < strArray.length; i++)
                {
                    var id = strArray[i].substring(strArray[i].indexOf('[') + 1, strArray[i].indexOf(']'));
                    var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": id });
                    node.checked = true;
                    this.tree.updateNode({ "treeObj": treeObj, "treeNode": node });
                } 
            }

            if (this._status == 4)
            {
                var strArray = this._newData.TEMPLAYERLISTKEY.split("、");
                for (var i = 0; i < strArray.length; i++)
                {
                    var id = strArray[i].substring(strArray[i].indexOf('[') + 1, strArray[i].indexOf(']') - 1);
                    var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": id });
                    node.checked = true;
                    this.tree.updateNode({ "treeObj": treeObj, "treeNode": node });
                }
            }

        },


        /**
        *保存点击事件
        *@method saveLayerContrast
        */
        saveLayerContrast: function (e) {
            if (this._oldData.LAYERGIS == '' && this._oldData.LAYERLISTKEY == '' && this._oldData.TEMPLAYERGIS == '' && this._oldData.TEMPLAYERLISTKEY == '')
            {
                if (this._newData.LAYERGIS != '' || this._newData.LAYERLISTKEY != '' || this._newData.TEMPLAYERGIS != '' || this._newData.TEMPLAYERLISTKEY != '')
                    this.addLayerContrast();
            }
            else
            {
                if (this._newData.LAYERGIS == '' && this._newData.LAYERLISTKEY == '' && this._newData.TEMPLAYERGIS == '' && this._newData.TEMPLAYERLISTKEY == '')
                {
                    this.deleteLayerContrast();
                }   
                else
                {
                    if (this._oldData.LAYERGIS != this._newData.LAYERGIS || this._oldData.LAYERLISTKEY != this._newData.LAYERLISTKEY || this._oldData.TEMPLAYERGIS != this._newData.TEMPLAYERGIS || this._oldData.TEMPLAYERLISTKEY != this._newData.TEMPLAYERLISTKEY)
                        this.updateLayerContrast();
                }
            }
        },

        /**
        *添加
        *@method addLayerContrast
        */
        addLayerContrast: function () {
            L.mtip.usetip(1, "保存中...", 1234);

            var data = '{"BTMID":"' + this._newData.BTMID + '", "ATMID":"' + this._newData.ATMID + '", "LAYERGIS":"' + this._newData.LAYERGIS + '","LAYERLISTKEY": "' + this._newData.LAYERLISTKEY + '", "TEMPLAYERGIS":"' + this._newData.TEMPLAYERGIS + '", "TEMPLAYERLISTKEY":"' + this._newData.TEMPLAYERLISTKEY + '", "SYSKEY":"' + this._newData.SYSKEY + '"}';


            L.baseservice.addOneBusiness({
                async: true,
                data: data,
                context: this,
                success: function (business) {
                    var obj = business;
                    this._oldData.LAYERGIS = this._newData.LAYERGIS;
                    this._oldData.LAYERLISTKEY = this._newData.LAYERLISTKEY;
                    this._oldData.TEMPLAYERGIS = this._newData.TEMPLAYERGIS;
                    this._oldData.TEMPLAYERLISTKEY = this._newData.TEMPLAYERLISTKEY;

                    //显示保存成功提示信息
                    L.mtip.usetip(2, "保存成功", 1234);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.mtip.usetip(3, "保存失败", 1234);
                }
            });
        },

        /**
        *更改
        *@method updateLayerContrast
        */
        updateLayerContrast: function () {
            L.mtip.usetip(1, "保存中...", 1234);

            var data = '{"BTMID":"' + this._newData.BTMID + '", "ATMID":"' + this._newData.ATMID + '", "LAYERGIS":"' + this._newData.LAYERGIS + '","LAYERLISTKEY": "' + this._newData.LAYERLISTKEY + '", "TEMPLAYERGIS":"' + this._newData.TEMPLAYERGIS + '", "TEMPLAYERLISTKEY":"' + this._newData.TEMPLAYERLISTKEY + '", "SYSKEY":"' + this._newData.SYSKEY + '"}';


            L.baseservice.updateOneBusiness({
                async: true,
                data: data,
                context: this,
                success: function (business) {
                    var obj = business;
                    this._oldData.LAYERGIS = this._newData.LAYERGIS;
                    this._oldData.LAYERLISTKEY = this._newData.LAYERLISTKEY;
                    this._oldData.TEMPLAYERGIS = this._newData.TEMPLAYERGIS;
                    this._oldData.TEMPLAYERLISTKEY = this._newData.TEMPLAYERLISTKEY;

                    //显示保存成功提示信息
                    L.mtip.usetip(2, "保存成功", 1234);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.mtip.usetip(3, "保存失败", 1234);
                }
            });
        },

        /**
        *删除
        *@method deleteLayerContrast
        */
        deleteLayerContrast: function () {
            L.mtip.usetip(1, "保存中...", 1234);

            var id = this._oldData.ATMID;
            L.baseservice.deleteOneBusiness({
                async: true,
                id: id,
                context: this,
                success: function (business) {
                    var obj = business;
                    this._oldData.LAYERGIS = "";
                    this._oldData.LAYERLISTKEY = "";
                    this._oldData.TEMPLAYERGIS = "";
                    this._oldData.TEMPLAYERLISTKEY = "";

                    this._newData.LAYERGIS = "";
                    this._newData.LAYERLISTKEY = "";
                    this._newData.TEMPLAYERGIS = "";
                    this._newData.TEMPLAYERLISTKEY = "";

                    $($(".contentChooseDiv .chooseOne")[0]).find("input").val("");
                    $($(".contentChooseDiv .chooseTwo")[0]).find("input").val("");
                    $($(".contentChooseDiv .chooseThree")[0]).find("input").val("");
                    $($(".contentChooseDiv .chooseFour")[0]).find("input").val("");

                    //显示保存成功提示信息
                    L.mtip.usetip(2, "保存成功", 1234);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.mtip.usetip(3, "保存失败", 1234);
                }
            });
        },

    });
    return L.DCI.LayerContrast;
});