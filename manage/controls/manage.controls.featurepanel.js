/**
*资源管理下专题配置类
*@module controls
*@class DCI.FeaturePanel
*/
define("manage/controls/featurepanel", [
    "leaflet",
    "ztree",
    "ztree/exhide",
    "manage/controls/tree",
    "manage/controls/featurepanelResourceTree",
    "manage/layout/featurepanel",
    "data/manage/handledata"
], function (L) {
    L.DCI.FeaturePanel = L.Class.extend({
        /**
        *类id
        *@property id
        *@type {String}
        */
        id: 'featurePanel',
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
        *资源管理下专题配置的服务资源树类对象
        *@property resourceTree
        *@type {Object}
        */
        resourceTree: null,
        /**
        *上下文对象
        *@property _this
        *@type {Object}
        */
        _this: null,
        /**
        *保存专题图片名称集
        *@property pictureName
        *@type {Array}
        */
        pictureName: [],       
        


        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            //获取专题图片
            this.getFeaturePicName();
        },
        /**
        *默认加载
        *@method loading
        */
        loading:function(){
            $(".sitemappanel_title").text("资源管理 > 专题配置");
            this._body = $(".resource_manage");
            this._layout = new L.DCI.FeaturePanelLayout();
            this._body.html(this._layout.getBodyHtml());
            this.handleData = new L.DCI.Manage.HandleData();
            this.tree = new L.DCI.Tree();
            this.getFeatureTree();
            this.resourceTree = new L.DCI.FeaturePanelResourceTree();
            this.resourceTree.loading();

            //滚动条
            $(".featureConfig_Left_Container>div").mCustomScrollbar({ theme: "minimal-dark" });
            $(".featureConfig_Middle_Container>div").mCustomScrollbar({ theme: "minimal-dark" });
            $(".featureConfig_Right_Container>div").mCustomScrollbar({ theme: "minimal-dark" });
            //数据专题树的增删改事件
            $(".featureConfig_Left").on('click', '.addFeature.titleIconActive', { context: this }, function (e) { e.data.context.addFeatureTree(e); });
            $(".featureConfig_Left").on('click', '.editFeature.titleIconActive', { context: this }, function (e) { e.data.context.editFeatureTree(e); });
            $(".featureConfig_Left").on('click', '.deleteFeature.titleIconActive', { context: this }, function (e) { e.data.context.deleteFeatureTree(e); });

            //默认添加专题（只有当没有专题的时候）
            $("#addFeatureDiv").on('click', 'div', { context: this }, function (e) { e.data.context.defaultAddFeature(e); });
            //添加图层到专题配置结果
            $("#moveNodeToRight").on('click', { context: this }, function (e) { e.data.context.moveNodeToRight(e); });
            //删除--专题配置结果树
            $(".featureConfig_Right").on('click', '.deleteFeatureLayer.titleIconActive', { context: this }, function (e) { e.data.context.deleteFeatureLayer(e); });

            //服务资源树--点击搜索
            $(".featureConfig_Left").on('click', '.search', { context: this }, function (e) { e.data.context.search(e); });
            //服务资源树--搜索(回车键触发)
            $(".featureConfig_Left_Search").on('keydown', 'input', { context: this }, function (e) {
                var e = e || window.event;
                if (e.keyCode == 13)
                {
                    e.data.context.search(e);
                    return false;
                }
            });

            //专题配置结果--点击搜索
            $(".featureConfig_Right").on('click', '.search', { context: this }, function (e) { e.data.context.searchConfigResult(e); });
            //专题配置结果--搜索(回车键触发)
            $(".featureConfig_Right_Search").on('keydown', 'input', { context: this }, function (e) {
                var e = e || window.event;
                if (e.keyCode == 13)
                {
                    e.data.context.searchConfigResult(e);
                    return false;
                }
            });
        },

        /**
        *数据专题树配置
        *@method featureTreeSetting
        *@return {Object}   返回配置Json对象
        */
        featureTreeSetting: function () {
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
                edit: {
                    enable: true,
                    drag: {
                        autoExpandTrigger: true,
                        isCopy: false,
                        isMove: true,
                        autoOpenTime: 0,
                        prev: levelDrop,
                        next: levelDrop,
                        inner: false
                    },
                    showRemoveBtn: false,
                    showRenameBtn: false
                },


                callback: {
                    onCheck: function (event, treeId, treeNode) {
                        _this.featureTreeOnClick(event, treeId, treeNode);
                    },
                    onClick: function (event, treeId, treeNode) {
                        _this.featureTreeOnClick(event, treeId, treeNode);
                    },
                    onDrop: onDrop,
                    beforeDrop: levelDrop
                },
            };

            function onDrop(event, treeId, treeNodes, targetNode, moveType, isCopy) {
                if (moveType != null) {
                    var updateOption = [treeNodes, targetNode, moveType];
                    _this._updateSindex(updateOption);
                } 
            }
            //禁止越级拖动
            function levelDrop(treeId, treeNodes, targetNode, moveType, isCopy) { 
                if (treeNodes[0].pId == targetNode.pId) {
                    return true;
                };
                return false;
            };



            return setting;
        },
        /**
        *更新某一专题顺序
        *@method _updateSindex
        *@param updateOption {Object} 节点信息
        */
        _updateSindex: function (updateOption) {
            L.mtip.usetip(1,"保存中...",1234);

            transIndex = 1;
            if (updateOption[0][0].sIndex < updateOption[1].sIndex) {
                if (updateOption[2] == "next") {
                    transIndex = updateOption[1].sIndex;
                } else if (updateOption[2] == "prev") {
                    transIndex = updateOption[1].sIndex - 1;
                }
            } else {
                if (updateOption[2] == "next") {
                    transIndex = updateOption[1].sIndex + 1;
                } else if (updateOption[2] == "prev") {
                    transIndex = updateOption[1].sIndex;
                }
            };

            L.baseservice.updateSindex({
                id: updateOption[0][0].id,
                pId: updateOption[0][0].pId,
                sIndex: updateOption[0][0].sIndex,
                targetIndex: transIndex,

                async: true,
                context: this,
                success: function (num) {

                    if (num > 0) {
                        this.getFeatureTree();
                        L.mtip.usetip(2, "已保存。", 2234);
                    } else {
                        L.mtip.usetip(3, "未保存。", 1234);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.mtip.usetip(3, "无法更新专题顺序", 2234);
                }
            });
        },


        /**
        *专题配置结果树的配置
        *@method featureConfigResultSetting
        *@return {Object}   返回配置Json对象
        */
        featureConfigResultSetting: function () {
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
                        _this.configResultTreeOnClick(event, treeId, treeNode);
                    },
                    onClick: function (event, treeId, treeNode) {
                        _this.configResultTreeOnClick(event, treeId, treeNode);
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
        *获取数据专题树
        *@method getFeatureTree
        */
        getFeatureTree: function () {

            L.baseservice.getAllFeature({
                async: true,
                context: this,
                success: function (features) {
                    var obj = features;
                    var length = obj.length;
                    var dataNodes = new Array();
                    if (length == 0)
                    {
                        //当没有专题数据时，显示默认添加框
                        this.openDefaultStatus();
                        //生成树
                        var containerObj = $("#featureTree");
                        this.tree.show({ "elementObj": containerObj, "setting": this.featureTreeSetting(), "nodes": dataNodes });
                        var treeObj = this.tree.getTreeObj("featureTree");
                        this.tree.refresh(treeObj);
                        return;
                    }
                    dataNodes.push(this.handleData.featureTreeRoot());
                    //遍历各层数据
                    for (var i = 0; i < length; i++)
                    {
                        if (obj[i].FEATURETYPE == "mapset_sub")
                        {
                            dataNodes.push(this.handleData.featureTreeFeatureType(obj[i].FEATUREID, obj[i].FEATUREPARENTID, obj[i].FEATURENAME, obj[i].FEATURETYPE, obj[i].SINDEX, obj[i].FEATUREEXTENT, obj[i].IMAGENAME, false));
                        }
                        else if (obj[i].FEATURETYPE == "mapset_class")
                        {
                            dataNodes.push(this.handleData.featureTreeFeatureType(obj[i].FEATUREID, obj[i].FEATUREPARENTID, obj[i].FEATURENAME, obj[i].FEATURETYPE, obj[i].SINDEX, obj[i].FEATUREEXTENT, obj[i].IMAGENAME, false));
                        }
                        else if (obj[i].FEATURETYPE == "mapset_layer")
                        {
                            dataNodes.push(this.handleData.featureTreeFeature(obj[i].FEATUREID, obj[i].FEATUREPARENTID, obj[i].FEATURENAME, obj[i].FEATURETYPE, obj[i].SINDEX, obj[i].FEATUREEXTENT, obj[i].IMAGENAME));
                        } else if (obj[i].FEATURETYPE == "mapset_collection") {
                            dataNodes.push(this.handleData.featureTreeFeatureType(obj[i].FEATUREID, obj[i].FEATUREPARENTID, obj[i].FEATURENAME, obj[i].FEATURETYPE, obj[i].SINDEX, obj[i].FEATUREEXTENT, obj[i].IMAGENAME, true));
                        } else if (obj[i].FEATURETYPE == "mapset_catalog") {
                            dataNodes.push(this.handleData.featureTreeFeatureType(obj[i].FEATUREID, obj[i].FEATUREPARENTID, obj[i].FEATURENAME, obj[i].FEATURETYPE, obj[i].SINDEX, obj[i].FEATUREEXTENT, obj[i].IMAGENAME, true));

                        }

                        else
                        { }
                    }

                    //生成树
                    var containerObj = $("#featureTree");
                    this.tree.show({ "elementObj": containerObj, "setting": this.featureTreeSetting(), "nodes": dataNodes });
                    var treeObj = this.tree.getTreeObj("featureTree");
                    this.tree.refresh(treeObj);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    //L.dialog.errorDialogModel("获取专题树失败");
                    L.dci.app.util.dialog.alert("温馨提示", "获取专题树失败");
                }
            });
        },
        /**
        *获取专题配置结果树
        *@method getFeatureConfigResultTree
        *@param id {String} 专题id
        */
        getFeatureConfigResultTree: function (id) {

            L.baseservice.getLayersFromFeatureId({
                async: true,
                id:id,
                context: this,
                success: function (layers) {
                    var obj = layers;
                    var length = obj.length;

                    var dataNodes = new Array();
                    dataNodes.push(this.handleData.featureConfigResultRoot());
                    //遍历各层数据
                    for (var i = 0; i < length; i++)
                    {
                        if (obj[i].LayerId == null)
                            var name = obj[i].LayerName;
                        else
                            var name = obj[i].LayerName + '(' + obj[i].SIndex + ')';
                        dataNodes.push(this.handleData.featureConfigResult(obj[i].LayerId, obj[i].NodeId, obj[i].ResourceId,name,obj[i].SIndex));
                    }
                    //生成树
                    var containerObj = $("#featureResourceTree");
                    this.tree.show({ "elementObj": containerObj, "setting": this.featureConfigResultSetting(), "nodes": dataNodes });
                    var treeObj = this.tree.getTreeObj("featureResourceTree");
                    this.tree.refresh(treeObj);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    //L.dialog.errorDialogModel("获取专题配置结果树失败");
                    L.dci.app.util.dialog.alert("温馨提示", "获取专题配置结果树失败");
                }
            });
        },

        /**
        *显示默认添加专题菜单
        *@method openDefaultStatus
        */
        openDefaultStatus: function (e) {
            ////显示默认添加专题框
            //$(".featureConfig_Left_Search").removeClass("active");
            //$("#addFeatureDiv").addClass("active");

            ////关闭专题添加、删除、修改按钮
            //$(".featureConfig_Left .addFeature").removeClass("titleIconActive").addClass("titleIcon");
            //$(".featureConfig_Left .editFeature").removeClass("titleIconActive").addClass("titleIcon");
            //$(".featureConfig_Left .deleteFeature").removeClass("titleIconActive").addClass("titleIcon");
            

            //一下为隐藏搜索功能代码
            //显示默认添加用户框
            $("#addFeatureDiv").addClass("active");
            //关闭专题添加、删除、修改按钮
            $(".featureConfig_Left .addFeature").removeClass("titleIconActive").addClass("titleIcon");
            $(".featureConfig_Left .editFeature").removeClass("titleIconActive").addClass("titleIcon");
            $(".featureConfig_Left .deleteFeature").removeClass("titleIconActive").addClass("titleIcon");
            $(".featureConfig_Left_Container").html("");
            $(".featureConfig_Left_Container").css({ "margin-top": "-50px", "padding-top": "0px" });
        },
        /**
        *隐藏默认添加专题菜单
        *@method openDefaultStatus
        */
        closeDefaultStatus: function (e) {
            ////隐藏默认添加专题框
            //$(".featureConfig_Left_Search").addClass("active");
            //$("#addFeatureDiv").removeClass("active");


            //一下为隐藏搜索功能代码
            //隐藏默认添加用户框
            $("#addFeatureDiv").removeClass("active");
            //打开添加用户
            $(".featureConfig_Left_Container").css({ "margin-top": "0px", "padding-top": "0px" });
            var html = '<div><ul id="featureTree" class="ztree"></ul></div>';
            $(".featureConfig_Left_Container").html(html);
            $(".featureConfig_Left_Container>div").mCustomScrollbar({ theme: "minimal-dark" });
        },

        /**
        *默认添加专题事件(只有没有专题数据的时候才调用)
        *@method defaultAddFeature
        *@param e {Object}   事件对象
        */
        defaultAddFeature: function () {
            //显示对话框
            var html = this._layout.addFeatureHtml();
            //L.dialog.dialogModel('addFeatureModel', 150, 300, html, '添加一级专题菜单');
            L.dci.dialog.dialogModel('addFeatureModel', 150, 300, html, '添加一级专题菜单');

            $(".saveAddFeature").on('click', { context: this }, function (e) { e.data.context.saveDefaultAdd(e); });
            $(".cancelAddFeature").on('click', { context: this }, function (e) { e.data.context.cancelAddFeature(e); });
        },
        /**
        *保存默认添加专题事件
        *@method saveDefaultAdd
        *@param e {Object}   事件对象
        */
        saveDefaultAdd: function (e) {
            var name = $.trim($(".addFeature .txtName").val());
            //删除对话框
            this.cancelAddFeature();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);
            //提交保存信息
            var data = '{"FEATUREID":1, "FEATUREPARENTID":0, "FEATURENAME":"' + name + '","FEATURETYPE": "mapset_sub", "SINDEX":1, "FEATUREEXTENT":"", "IMAGENAME":""}';
            L.baseservice.addFeature({
                async: true,
                data: data,
                context: this,
                success: function (id) {
                    this.closeDefaultStatus();

                    var newNodeId = JSON.parse(JSON.parse(id));
                    var dataNodes = new Array();
                    dataNodes.push(this.handleData.featureTreeRoot());
                    dataNodes.push(this.handleData.featureTreeFeatureType(newNodeId, 0, name, "mapset_sub", 1, "", "", true));
                    //生成树
                    var containerObj = $("#featureTree");
                    this.tree.show({ "elementObj": containerObj, "setting": this.featureTreeSetting(), "nodes": dataNodes });

                    //显示保存成功提示信息
                    L.mtip.usetip(2, "添加成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "添加失败", 1234);
                }
            });
        },




        /**
        *单击事件（数据专题树）
        *@method featureTreeOnClick
        *@param event {Object}      事件对象
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        featureTreeOnClick: function (event, treeNodeId, treeNode) {
            //点击节点
            var ele = $(event.target).parent().siblings('.chk');
            $(ele).click();

            //添加按钮的激活或关闭
            if (treeNode.checked == true && treeNode.type != "mapset_layer")
                $(".featureConfig_Left .addFeature").removeClass("titleIcon").addClass("titleIconActive");
            else
                $(".featureConfig_Left .addFeature").removeClass("titleIconActive").addClass("titleIcon");
            //编辑按钮的激活或关闭
            if (treeNode.checked == true && treeNode.type != "root")
                $(".featureConfig_Left .editFeature").removeClass("titleIcon").addClass("titleIconActive");
            else
                $(".featureConfig_Left .editFeature").removeClass("titleIconActive").addClass("titleIcon");
            //删除按钮的激活或关闭
            if ((treeNode.children == undefined || treeNode.children.length == 0) && treeNode.checked == true)
                $(".featureConfig_Left .deleteFeature").removeClass("titleIcon").addClass("titleIconActive");
            else
                $(".featureConfig_Left .deleteFeature").removeClass("titleIconActive").addClass("titleIcon");


            if (treeNode.type == "mapset_layer" && treeNode.checked == true)
            {
                var featureId = treeNode.id;
                this.getFeatureConfigResultTree(featureId);
            }
            else
            {
                //清除服务资源树状态
                var resourceTreeObj = this.tree.getTreeObj("resourceTree");
                this.tree.changeCheckedAllState({ "treeObj": resourceTreeObj, "checked": false });
                //清空专题配置结果树
                var dataNodes = [];
                //dataNodes.push(this.handleData.featureConfigResultRoot());
                var containerObj = $("#featureResourceTree");
                this.tree.show({ "elementObj": containerObj, "setting": this.featureConfigResultSetting(), "nodes": dataNodes });
                var treeObj = this.tree.getTreeObj("featureResourceTree");
                this.tree.refresh(treeObj);
            }            
        },

        
        /**
        *添加事件（数据专题树）
        *@method addFeatureTree
        *@param e {Object}   事件对象
        */
        addFeatureTree:function(e){
            var featureTreeObj = this.tree.getTreeObj("featureTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": featureTreeObj, "checked": true });
            if (nodes.length == 0)                              //判断是否选择专题
            {
                L.dci.app.util.dialog.alert("温馨提示", "请勾选节点");
                //L.dialog.errorDialogModel("请勾选节点");
            }
            else
            {
                //var level = nodes[0].level;
                //switch (level)
                //{
                //    case 0:
                //        this.addFeatureDialog("添加一级专题菜单");
                //        break;
                //    case 1:
                //        this.addFeatureWithImgDialog("添加二级专题菜单");
                //        break;
                //    case 2:
                //        this.addFeatureDialog("添加三级专题菜单");
                //        break;
                //    case 3:
                //        L.dialog.errorDialogModel("该节点不可添加子节点");
                //        break;
                //    default:
                //        break;
                //}

                var nodeType = nodes[0].type;
                var nodeName = nodes[0].name;
                switch (nodeType) {
                    case "mapset_collection":
                        if (nodeName == "地图集") {
                            this.addFeatureDialog("添加地图集目录");
                        } else if (nodeName == "浏览版编制业务") {
                            this.addFeatureWithImgDialog("添加二级专题菜单");
                        } else if (nodeName == "主题集") {
                            this.addFeatureDialog("添加主题集");
                        };
                        break;
                    case "mapset_catalog":
                        this.addFeatureDialog("添加一级专题菜单");
                        break;
                    case "mapset_sub":
                        this.addFeatureWithImgDialog("添加二级专题菜单");
                        break;
                    case "mapset_class":
                        this.addFeatureDialog("添加三级专题菜单");
                        break;
                    case "mapset_layer":
                        L.dci.app.util.dialog.alert("温馨提示", "该节点不可添加子节点");
                        //L.dialog.errorDialogModel("该节点不可添加子节点");
                        break;
                    default:
                        break;

                };


            }
        },
        /**
        *编辑事件（数据专题树）
        *@method editFeatureTree
        *@param e {Object}   事件对象
        */
        editFeatureTree:function(e){
            var featureTreeObj = this.tree.getTreeObj("featureTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": featureTreeObj, "checked": true });
            if (nodes.length == 0) //判断是否选择专题
            {
                L.dci.app.util.dialog.alert("温馨提示", "请勾选节点");
                //L.dialog.errorDialogModel("请勾选节点");
            }
            else
            {
                //var level = nodes[0].level;
                //switch (level)
                //{
                //    case 1:
                //    case 3:
                //        this.editFeatureDialog();
                //        break;
                //    case 2:
                //        this.editFeatureWithImgDialog();
                //        break;
                //    default:
                //        break;
                //}

                var nodeType = nodes[0].type;
                var nodeName = nodes[0].name;
                switch (nodeType) {
                    case "mapset_collection":
                        if (nodeName = "地图集") {
                            this.editFeatureDialog();
                        };
                        break;
                    case "mapset_catalog":
                        this.editFeatureDialog();
                        break;
                    case "mapset_sub":
                        this.editFeatureDialog();
                        break;
                    case "mapset_class":
                        this.editFeatureDialog();
                        break;
                    case "mapset_layer":
                        this.editFeatureWithImgDialog();
                        break;
                    default:
                        break;

                };


            }
        },
        /**
        *删除事件（数据专题树）
        *@method deleteFeatureTree
        *@param e {Object}   事件对象
        */
        deleteFeatureTree:function(e){
            var featureTreeObj = this.tree.getTreeObj("featureTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": featureTreeObj, "checked": true });
            if (nodes.length == 0)                              //判断是否选择专题
            {
                L.dci.app.util.dialog.alert("温馨提示", "请勾选节点");
                //L.dialog.errorDialogModel("请勾选节点");
            }
            else
            {
                if (nodes[0].isParent == false)
                {
                    this.deleteFeatureDialog();
                }
                else
                {
                    var length = nodes[0].children.length;
                    if (length > 0)
                    {
                        L.dci.app.util.dialog.alert("温馨提示", "节点下存在子节点信息，不可以删除");
                        //L.dialog.errorDialogModel("节点下存在子节点信息，不可以删除");
                    }
                    else
                    {
                        this.deleteFeatureDialog();
                    }
                }
            }
        },



        /**
        *添加专题对话框
        *@method addFeatureDialog
        *@param titleName {String}   标题名称
        */
        addFeatureDialog: function (titleName) {
            //显示对话框
            var html = this._layout.addFeatureHtml();
            //L.dialog.dialogModel('addFeatureModel', 150, 300, html, titleName);
            L.dci.dialog.dialogModel('addFeatureModel', 150, 300, html, titleName);

            $(".saveAddFeature").on('click', { context: this }, function (e) { e.data.context.saveAddFeature(e); });
            $(".cancelAddFeature").on('click', { context: this }, function (e) { e.data.context.cancelAddFeature(e); });
        },
        /**
        *添加专题对话框(带图片)
        *@method addFeatureWithImgDialog
        *@param titleName {String}   标题名称
        */
        addFeatureWithImgDialog: function (titleName) {
            //显示对话框
            var html = this._layout.addFeatureWithDropMenu();
            //L.dialog.dialogModel('addFeatureWithDropMenuModel', 150, 464, html, titleName);
            L.dci.dialog.dialogModel('addFeatureWithDropMenuModel', 150, 464, html, titleName);
            //滚动条
            $(".imageContainer>div").mCustomScrollbar({ theme: "minimal-dark" });

            var nameArray = this.pictureName;
            var picHtml = '';
            for (var i = 0; i < nameArray.length; i++)
            {
                var text = nameArray[i];
                var name = text.substr(0, text.indexOf("."));
                picHtml += this._layout.getPictureHtml({ "text": text, "name": name, "id": i });
            }
            $(".imageContainer .mCSB_container").html(picHtml);
            $(".picBox").first().addClass("picBoxHighlight");
            image = $(".picBoxHighlight").attr("data-info");

            $(".picBox").on('click', { context: this }, function (e) {
                image = $(this).attr("data-info");
                $(this).addClass("picBoxHighlight").siblings().removeClass("picBoxHighlight");
            });
            //$(".addFeatureWithDropMenu select").on('change', { context: this }, function (e) { e.data.context.changeSelectType(e); });
            $(".saveAddFeatureWithDropMenu").on('click', { context: this }, function (e) { e.data.context.saveAddFeatureWithDropMenu(e); });
            $(".cancelAddFeatureWithDropMenu").on('click', { context: this }, function (e) { e.data.context.cancelAddFeatureWithDropMenu(e); });
        },
        /**
        *编辑专题对话框
        *@method editFeatureDialog
        */
        editFeatureDialog: function () {
            //显示对话框(这里用添加专题的对话框)
            var html = this._layout.addFeatureHtml();
            //L.dialog.dialogModel('addFeatureModel', 150, 300, html, '编辑专题');
            L.dci.dialog.dialogModel('addFeatureModel', 150, 300, html, '编辑专题');

            //获取勾选中的节点
            var featureTreeObj = this.tree.getTreeObj("featureTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": featureTreeObj, "checked": true });
            var name = nodes[0].name;
            $(".addFeature .txtName").val(name);

            $(".saveAddFeature").on('click', { context: this }, function (e) { e.data.context.saveEditFeature(name); });
            $(".cancelAddFeature").on('click', { context: this }, function (e) { e.data.context.cancelAddFeature(e); });
        },
        /**
        *编辑专题对话框(带图片)
        *@method editFeatureWithImgDialog
        */
        editFeatureWithImgDialog:function(){
            //显示对话框(这里用添加专题的对话框带图片的)
            var html = this._layout.addFeatureWithImgHtml();
            //L.dialog.dialogModel('addFeatureWithImgModel', 150, 464, html, '编辑专题');
            L.dci.dialog.dialogModel('addFeatureWithImgModel', 150, 464, html, '编辑专题');
            //滚动条
            $(".imageContainer>div").mCustomScrollbar({ theme: "minimal-dark" });
            var nameArray = this.pictureName;
            var picHtml = '';
            for (var i = 0; i < nameArray.length; i++)
            {
                var text = nameArray[i];
                var name = text.substr(0, text.indexOf("."));
                picHtml += this._layout.getPictureHtml({ "text": text, "name": name, "id": i });
            }
            $(".imageContainer .mCSB_container").html(picHtml);
            //显示信息
            var featureTreeObj = this.tree.getTreeObj("featureTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": featureTreeObj, "checked": true });
            var name = nodes[0].name;
            var image = nodes[0].image;
            $(".addFeatureWithImg .txtName").val(name);
            $(".picBox[data-info='" + image + "']").addClass("picBoxHighlight");

            $(".picBox").on('click', { context: this }, function (e) {
                $(this).addClass("picBoxHighlight").siblings().removeClass("picBoxHighlight");
            });
            $(".saveAddFeatureWithImg").on('click', { context: this }, function (e) { e.data.context.saveEditFeatureWithImg(name, image); });
            $(".cancelAddFeatureWithImg").on('click', { context: this }, function (e) { e.data.context.cancelAddFeatureWithImg(e); });
        },
        /**
        *删除专题对话框
        *@method editFeatureWithImgDialog
        */
        deleteFeatureDialog:function(){
            //显示对话框
            var html = this._layout.deleteFeatureHtml();
            L.dci.dialog.dialogModel('deleteFeatureModel', 150, 300, html, '删除专题');
            //显示信息
            var treeObj = this.tree.getTreeObj("featureTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
            var name = nodes[0].name;
            var text = '是否删除专题节点：' + name + '?';
            $(".deleteFeature p").html(text);

            $(".submitDeleteFeature").on('click', { context: this }, function (e) { e.data.context.submitDeleteFeature(e); });
            $(".cancelDeleteFeature").on('click', { context: this }, function (e) { e.data.context.cancelDeleteFeature(e); });
        },


        /**
        *改变选择专题类型
        *@method changeSelectType
        */
        changeSelectType: function (e) {
            var value = $(".addFeatureWithDropMenu select").val();
            if (value == "专题集")
            {
                $(".addFeatureWithDropMenu .imageContainer").css("display","block");
            }
            else if (value == "专题")
            {
                $(".addFeatureWithDropMenu .imageContainer").css("display", "none");
            }
        },

        /**
        *保存按钮--添加专题对话框
        *@method saveAddFeature
        *@param e {Object} 事件对象
        */
        saveAddFeature: function (e) {
            //获取勾选中的节点
            var featureTreeObj = this.tree.getTreeObj("featureTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": featureTreeObj, "checked": true });
            var pId = nodes[0].id;
            var type = '';
            var image = '';
            var sIndex = 1;
            var extent = '';

            if (nodes[0].type == "root")
                type = "mapset_sub";
            if (nodes[0].type == "mapset_collection") {
                var nodeName = nodes[0].name;
                if (nodeName == "主题集") {
                    type = "mapset_layer";
                } else {
                    type = "mapset_catalog";
                }
            };
            if (nodes[0].type == "mapset_catalog")
                type = "mapset_sub";
            if (nodes[0].type == "mapset_sub")
                type = "mapset_class";
            if (nodes[0].type == "mapset_class")
                type = "mapset_layer";
            var length = nodes[0].children.length;
            if (length > 0)
                sIndex = nodes[0].children[length - 1].sIndex + 1;
            var name = $.trim($(".addFeature .txtName").val());
            var obj = this.verifyFeatureName(name);
            if (obj.verifyName == false)
            {
                $(".errorText").text(obj.errorText);
                return;
            }
            //删除对话框
            this.cancelAddFeature();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);
            //提交保存信息
            this.AddFeature(pId, name, type, sIndex, extent,image);
        },
        /**
        *保存按钮--添加专题对话框(带下拉菜单)
        *@method saveAddFeatureWithDropMenu
        *@param e {Object} 事件对象
        */
        saveAddFeatureWithDropMenu: function (e) {
            //获取勾选中的节点
            var featureTreeObj = this.tree.getTreeObj("featureTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": featureTreeObj, "checked": true });
            var pId = nodes[0].id;
            var type = '';
            var image = '';
            var sIndex = 1;
            var extent = '';
            var length = nodes[0].children.length;
            if (length > 0)
                sIndex = nodes[0].children[length - 1].sIndex + 1;
            var name = $.trim($(".addFeatureWithDropMenu .txtName").val());
            var obj = this.verifyFeatureName(name,10);
            if (obj.verifyName == false)
            {
                $(".errorText").text(obj.errorText);
                return;
            }
            var typeName = $(".addFeatureWithDropMenu select").val();
            image = $(".picBoxHighlight").attr("data-info");
            if (typeName == "专题集")
            {
                type = 'mapset_class';
            }
            else
            {
                type = 'mapset_layer';
            }

            //删除对话框
            this.cancelAddFeatureWithDropMenu();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);
            //提交保存信息
            this.AddFeature(pId, name, type, sIndex, extent, image);
        },
        /**
        *保存按钮--编辑专题对话框
        *@method saveEditFeature
        *@param name {String} 专题名称
        */
        saveEditFeature: function (oldName) {
            var name = $.trim($(".addFeature .txtName").val());
            if (oldName == name)
            {
                this.cancelAddFeature();     //删除对话框
            }
            else
            {
                if (name != oldName)
                {
                    var obj = this.verifyFeatureName(name,20);
                    if (obj.verifyName == false)
                    {
                        $(".errorText").text(obj.errorText);
                        return;
                    }
                }
                //获取勾选中的节点
                var featureTreeObj = this.tree.getTreeObj("featureTree");
                var nodes = this.tree.getCheckedNodes({ "treeObj": featureTreeObj, "checked": true });
                var id = nodes[0].id;
                var pId = nodes[0].pId;
                var type = nodes[0].type;
                var sIndex = nodes[0].sIndex;
                var extent = nodes[0].extent == null ? "" : nodes[0].extent;
                var image = nodes[0].image == null ? "" : nodes[0].image;
                //删除对话框
                this.cancelAddFeature();
                //显示保存中提示信息
                L.mtip.usetip(1, "保存中...", 1234);
                //提交保存信息
                this.editFeature(id, pId, name, type, sIndex, extent, image);
            }
        },
        /**
        *保存按钮--编辑专题对话框(带图片)
        *@method saveEditFeatureWithImg
        *@param name {String} 专题名称
        */
        saveEditFeatureWithImg: function (oldName, oldImage) {
            var name = $.trim($(".addFeatureWithImg .txtName").val());
            var image = $(".picBoxHighlight").attr("data-info");
            if (oldName == name && image == oldImage)
            {
                this.cancelAddFeatureWithImg();     //删除对话框
            }
            else
            {
                if (name != oldName)
                {
                    var obj = this.verifyFeatureName(name,10);
                    if (obj.verifyName == false)
                    {
                        $(".errorText").text(obj.errorText);
                        return;
                    }
                }
                //获取勾选中的节点
                var featureTreeObj = this.tree.getTreeObj("featureTree");
                var nodes = this.tree.getCheckedNodes({ "treeObj": featureTreeObj, "checked": true });
                var id = nodes[0].id;
                var pId = nodes[0].pId;
                var type = nodes[0].type;
                var sIndex = nodes[0].sIndex;
                var extent = nodes[0].extent == null ? "" : nodes[0].extent;
                //删除对话框
                this.cancelAddFeatureWithImg();
                //显示保存中提示信息
                L.mtip.usetip(1, "保存中...", 1234);
                //提交保存信息
                this.editFeature(id, pId, name, type, sIndex, extent, image);
            }
        },

        /**
        *确定按钮--删除专题对话框
        *@method submitDeleteFeature
        *@param name {String} 专题名称
        */
        submitDeleteFeature: function (e) {
            //获取勾选中的节点
            var featureTreeObj = this.tree.getTreeObj("featureTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": featureTreeObj, "checked": true });
            var id = nodes[0].id;
            var treeNode = nodes[0];
            //删除对话框
            this.cancelDeleteFeature();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);
            //提交保存信息
            this.deleteFeature(id, treeNode);
        },


        /**
        *取消按钮--添加专题对话框
        *@method cancelAddFeature
        *@param e {Object} 事件对象
        */
        cancelAddFeature: function (e) {
            $("#addFeatureModel").remove();
        },
        /**
        *取消按钮--添加专题对话框(带图片)
        *@method cancelAddFeatureWithImg
        *@param e {Object} 事件对象
        */
        cancelAddFeatureWithImg: function (e) {
            $("#addFeatureWithImgModel").remove();
        },

        /**
        *取消按钮--添加专题对话框(带下来菜单)
        *@method cancelAddFeatureWithDropMenu
        *@param e {Object} 事件对象
        */
        cancelAddFeatureWithDropMenu: function (e) {
            $("#addFeatureWithDropMenuModel").remove();
        },
        /**
        *取消按钮--删除专题对话框
        *@method cancelDeleteFeature
        *@param e {Object} 事件对象
        */
        cancelDeleteFeature: function (e) {
            $("#deleteFeatureModel").remove();
        },



        /**
        *验证专题名称
        *@method verifyFeatureName
        *@param name {String} 专题名称
        *@param length {String} 长度限制
        *@return {Object} 专题名称验证结果以及提示内容
        */
        verifyFeatureName: function (name,length) {
            if (name == "")
                return { "verifyName": false, "errorText": "专题名称不能为空" };
            if (name.indexOf(" ") > -1)
                return { "verifyName": false, "errorText": "专题名称不能包含空格" };
            //字符长度限制
            if (length == null || length == undefined) length = 50;
            if (name.length > length)
            {
                return { "verifyName": false, "errorText": "专题名称长度不能大于" + length };
            }
            var result = null;
            L.baseservice.getAllFeature({
                async: false,
                context: this,
                success: function (featues) {
                    if (featues == null)
                    {
                        result = { "verifyName": true, "errorText": "" };
                    }
                    else
                    {
                        var data = featues;
                        var count = 0;
                        for (var i = 0; i < data.length; i++)
                        {
                            if (data[i].FEATURENAME == name)
                            {
                                result = { "verifyName": false, "errorText": "专题名称已使用" };
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
                    result = { "verifyName": false, "errorText": "获取所有专题信息失败" };
                }
            });
            return result;
        },
        /**
        *获取专题图片名称集
        *@method getFeaturePicName
        */
        getFeaturePicName: function () {

            L.baseservice.getImageName({
                async: false,
                context: this,
                data: null,
                success: function (data) {
                    this.pictureName.length = 0;
                    //var obj = JSON.parse(data);
                    var obj = data;
                    for (var i = 0; i < obj.length; i++)
                    {
                        this.pictureName.push(obj[i]);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.dci.app.util.dialog.alert("温馨提示", "获取专题图片失败");
                    //L.dialog.errorDialogModel("获取专题图片失败");
                }
            });
        },


        /**
        *添加专题
        *@method AddFeature
        *@param pId {String}            专题父节点id
        *@param name {String}           专题名称
        *@param type {String}           专题类型
        *@param sIndex {Number}         新增节点在同级里的排序号
        *@param featureExtent {String}  专题范围 
        *@param image {String}          专题图片
        */
        AddFeature: function (pId, name, type, sIndex, extent, image) {

            var data = '{"FEATUREID":1, "FEATUREPARENTID":' + pId + ', "FEATURENAME":"' + name + '","FEATURETYPE": "' + type + '", "SINDEX":' + sIndex + ', "FEATUREEXTENT":"' + extent + '", "IMAGENAME":"' + image + '"}';
            L.baseservice.addFeature({
                async: true,
                data: data,
                context: this,
                success: function (id) {
                    var newNodeId = JSON.parse(JSON.parse(id));
                    var treeObj = this.tree.getTreeObj("featureTree");
                    var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": pId });
                    if (type == 'mapset_layer')
                    {
                        node.children.push(this.handleData.featureTreeFeature(newNodeId, pId, name, type, sIndex, extent, image));
                    }
                    else 
                    {
                        node.children.push(this.handleData.featureTreeFeatureType(newNodeId, pId, name, type, sIndex, extent, image, false));
                    }
                    this.tree.refresh(treeObj);
                    //显示保存成功提示信息
                    L.mtip.usetip(2, "添加成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "添加失败", 1234);
                }
            });
        },
        /**
        *编辑专题
        *@method editFeature
        *@param id {String}             专题id
        *@param pId {String}            专题父节点id
        *@param name {String}           专题名称
        *@param type {String}           专题类型
        *@param sIndex {Number}         新增节点在同级里的排序号
        *@param featureExtent {String}  专题范围 
        *@param image {String}          专题图片
        */
        editFeature: function (id, pId, name, type, sIndex, extent, image) {
            var data = '{"FEATUREID":' + id + ', "FEATUREPARENTID":' + pId + ', "FEATURENAME":"' + name + '","FEATURETYPE": "' + type + '", "SINDEX":' + sIndex + ', "FEATUREEXTENT":"' + extent + '", "IMAGENAME":"' + image + '"}';
            L.baseservice.editFeature({
                async: true,
                data: data,
                context: this,
                success: function (text) {
                    var treeObj = this.tree.getTreeObj("featureTree");
                    var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": id });
                    node.name = name;
                    node.image = image;
                    treeObj.updateNode(node);
                    this.tree.refresh(treeObj);
                    //显示保存成功提示信息
                    L.mtip.usetip(2, "编辑成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "编辑失败", 1234);
                }
            });
        },
        /**
        *删除专题
        *@method deleteFeature
        *@param id {String}             专题id
        *@param treeNode {String}       节点
        */
        deleteFeature: function (id, treeNode) {
            L.baseservice.deleteFeature({
                id: id,
                async: true,
                context:this,
                success: function (text) {
                    var treeObj = this.tree.getTreeObj("featureTree");
                    treeObj.removeNode(treeNode);
                    this.tree.refresh(treeObj);

                    //如果没有专题数据
                    var nodes = this.tree.getNodes({ "treeObj": treeObj, "key": "type", "value": "mapset_sub" });
                    if (nodes.length == 0)
                    {
                        var node = this.tree.getNodes({ "treeObj": treeObj, "key": "type", "value": "root" });
                        treeObj.removeNode(node[0]);
                        this.openDefaultStatus();
                    }
                    //显示保存成功提示信息
                    L.mtip.usetip(2, "删除成功", 1234);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.mtip.usetip(3, "删除失败", 1234);
                }
            });
        },



        /**
        *单击事件（专题配置结果树）
        *@method configResultTreeOnClick
        *@param event {Object}      事件对象
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        configResultTreeOnClick: function (event, treeId, treeNode) {
            var ele = $(event.target).parent().siblings('.chk');
            $(ele).click();

            var treeObj = this.tree.getTreeObj("featureResourceTree");
            //判断勾选节点个数来激活批量删除按钮
            var nodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
            for (var i = 0; i < nodes.length; i++)
            {
                if (nodes[i].type == "root")
                    nodes.splice(i, 1);
                break;
            }
            if (nodes.length > 0)
            {
                $(".featureConfig_Right .deleteFeatureLayer").removeClass("titleIcon").addClass("titleIconActive");
            }
            else
            {
                $(".featureConfig_Right .deleteFeatureLayer").removeClass("titleIconActive").addClass("titleIcon");
            }
        },


        /**
        *添加图层到专题配置结果
        *@method moveNodeToRight
        *@param event {Object}      事件对象
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        moveNodeToRight: function (e) {
            var featureTreeObj = this.tree.getTreeObj("featureTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": featureTreeObj, "checked": true });
            //判断数据专题树是否已勾选
            if (nodes.length == 0)
            {
                L.dci.app.util.dialog.alert("温馨提示", "数据专题没勾选");
                //L.dialog.errorDialogModel("数据专题没勾选");
            }
            else if (nodes[0].type != "mapset_layer")
            {
                L.dci.app.util.dialog.alert("温馨提示", "数据专题没勾选");
                //L.dialog.errorDialogModel("数据专题没勾选");
            }
            else
            {
                this.handleLogic();
            }
        },

        /**
        *处理添加图层到专题配置结果的逻辑
        *@method handleLogic
        */
        handleLogic: function () {
            //判断服务资源树是否已勾选
            var checkedNodes = [];
            var count = 0;              //判断包含的图层类型种类个数
            var status1 = false;
            var status2 = false;
            var resourceTreeObj = this.tree.getTreeObj("resourceTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": resourceTreeObj, "checked": true });
            if (nodes.length == 0)
            {
                L.dci.app.util.dialog.alert("温馨提示", "服务资源树没有勾选上图层");
                //L.dialog.errorDialogModel("服务资源树没有勾选上图层");
            }
            for (var i = 0; i < nodes.length; i++)
            {
                if (nodes[i].type == "layer")           //矢量类型（矢量图层和WMS图层）下服务图层下图层节点
                {
                    if (status1 == false)
                    {
                        count += 1;
                        status1 = true;
                    }
                    checkedNodes.push(nodes[i]);
                }

                if (nodes[i].type == "tiledLayer")       //切片类型（切片图层和WMTS图层）下的图层节点
                {
                    if (status2 == false)
                    {
                        count += 1;
                        status2 = true;
                    }
                    checkedNodes.push(nodes[i]);
                }

                if (count > 1)
                {
                    L.dci.app.util.dialog.alert("温馨提示", "仅支持单一的切片类型或矢量类型");
                    //L.dialog.errorDialogModel("仅支持单一的切片类型或矢量类型");
                    return;
                }
            }
            //获取专题配置结果树的信息
            var featureTreeObj = this.tree.getTreeObj("featureTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": featureTreeObj, "checked": true });
            var featureId = nodes[0].id;

            var featureResourceTreeObj = this.tree.getTreeObj("featureResourceTree");
            var resultNodes = this.tree.getNodes({ "treeObj": featureResourceTreeObj, "key": "type", "value": "layer" });
            if (resultNodes.length == 0)
            {
                //添加
                if (checkedNodes.length > 0)
                    this.addLayersToFeature(checkedNodes, featureId);
            }
            else
            {
                //通过节点的类型来获取非根节点的图层类型名称
                var type = resultNodes[0].nodeId.split("-")[0];
                var addNodes = []; //要添加的图层
                for (var j = 0; j < checkedNodes.length; j++)
                {
                    var num = 0;
                    for (var k = 0; k < resultNodes.length; k++)
                    {
                        //判断要添加的图层类型是否和专题配置结果树上已有的图层类型不一样
                        if (checkedNodes[j].type != type)
                        {
                            L.dci.app.util.dialog.alert("温馨提示", "仅支持单一的切片类型或矢量类型");
                            //L.dialog.errorDialogModel("仅支持单一的切片类型或矢量类型");
                            return;
                        }
                        if (checkedNodes[j].name == resultNodes[k].name && checkedNodes[j].resourceId == parseInt(resultNodes[k].resourceId))
                        {
                            num++;
                            break;
                        }
                    }
                    if (num == 0)
                    {
                        addNodes.push(checkedNodes[j]);
                    }
                }
                //添加
                if (addNodes.length > 0)
                {
                    this.addLayersToFeature(addNodes, featureId);
                }
                else
                {
                    L.dci.app.util.dialog.alert("温馨提示", "图层已存在");
                    //L.dialog.errorDialogModel("图层已存在");
                }
            }

        },

        /**
        *添加图层到专题
        *@method addLayersToFeature
        *@param addNodes {Array}   数据集
        *@param featureId   {Number}   专题id
        */
        addLayersToFeature: function (addNodes, featureId) {
            var layerId = addNodes[0].layerId == "" ? -1 : addNodes[0].layerId;
            var data = '[';
            data += '{"FEATUREID":' + featureId + ',"LAYERID":' + layerId + ',"ID":1,"NODEID":"' + addNodes[0].id + '","RESOURCEID":' + addNodes[0].resourceId + '}';
            for (var i = 1; i < addNodes.length; i++)
            {
                var layerId2 = addNodes[0].layerId == "" ? -1 : addNodes[i].layerId;
                data += ',{"FEATUREID":' + featureId + ',"LAYERID":' + layerId2 + ',"ID":1,"NODEID":"' + addNodes[i].id + '","RESOURCEID":' + addNodes[i].resourceId + '}';
            }
            data += ']';
            //添加图层到专题
            L.baseservice.addFeatureLayers({
                async: true,
                data: data,
                context: this,
                success: function (id) {
                    var treeObj = this.tree.getTreeObj("featureResourceTree");
                    var node = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": 0 });
                    //var newNodes = [];
                    for (var i = 0; i < addNodes.length; i++)
                    {
                        var type = (addNodes[0].id).split("-")[0];
                        var sIndex = 1;
                        var name = addNodes[i].name;
                        if (type == 'layer')
                        {
                            sIndex = addNodes[i].sIndex;
                        }
                        node.children.push(this.handleData.featureConfigResult(addNodes[i].layerId, addNodes[i].id, addNodes[i].resourceId, name, sIndex));

                    }
                    this.tree.refresh(treeObj);

                    //显示保存成功提示信息
                    L.mtip.usetip(2, "添加成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "添加专题图层失败", 1234);
                }
            });
        },


        /**
        *删除专题图层结果中选中的图层
        *@method deleteFeatureLayer
        */
        deleteFeatureLayer: function (e) {
            var text = '是否删除选中的专题配置图层?';
            var html = this._layout.deleteFeatureResultHtml();
            L.dci.dialog.dialogModel('deleteFeatureResultModel', 150, 300, html, '删除专题配置');

            $(".deleteFeatureResult p").html(text);
            $(".submitDeleteFeatureResult").on('click', { context: this }, function (e) { e.data.context.submitDeleteFeatureResult(e); });
            $(".cancelDeleteFeatureResult").on('click', { context: this }, function (e) { e.data.context.cancelDeleteFeatureResult(e); });
        },

        /**
        *确定按钮--删除专题配置对话框
        *@method submitDeleteFeatureResult
        */
        submitDeleteFeatureResult: function (e) {
            this.cancelDeleteFeatureResult();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);

            var featureTreeObj = this.tree.getTreeObj("featureTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": featureTreeObj, "checked": true });
            var featureId = nodes[0].id;

            var treeObj = this.tree.getTreeObj("featureResourceTree");
            var checkedNodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
            //删除根节点
            for (var i = 0; i < checkedNodes.length; i++)
            {
                if (checkedNodes[i].type == "root")
                {
                    checkedNodes.splice(i, 1);
                }
            }
            if (checkedNodes.length == 0)
            {
                L.dci.app.util.dialog.alert("温馨提示", "没有勾选图层节点");
                //L.dialog.errorDialogModel("没有勾选图层节点");
            }
            else
            {
                var data = '[';
                data += '{"FEATUREID":' + featureId + ',"NODEID":"' + checkedNodes[0].nodeId + '"}';
                for (var i = 1; i < checkedNodes.length; i++)
                {
                    data += ',{"FEATUREID":' + featureId + ',"NODEID":"' + checkedNodes[i].nodeId + '"}';
                }
                data += ']';

                L.baseservice.deleteFeatureLayers({
                    async: true,
                    data: data,
                    context: this,
                    success: function (id) {
                        var featureResourceTreeObj = this.tree.getTreeObj("featureResourceTree");
                        var nodes = this.tree.getNodes({ "treeObj": featureResourceTreeObj, "key": "type", "value": "layer" });
                        for (var i = 0; i < nodes.length; i++)
                        {
                            for (var j = 0; j < checkedNodes.length; j++)
                            {
                                if (checkedNodes[j].nodeId == nodes[i].nodeId)
                                    treeObj.removeNode(nodes[i]);
                            }
                        }
                        featureResourceTreeObj.refresh();
                        this.tree.changeCheckedAllState({ "treeObj": featureResourceTreeObj, "checked": false });
                        //关闭删除按钮状态
                        $(".featureConfig_Right .deleteFeatureLayer").removeClass("titleIconActive").addClass("titleIcon");
                        //显示保存成功提示信息
                        L.mtip.usetip(2, "删除成功", 1234);
                    },
                    error: function (XMLHttpRequest, errorThrown) {
                        L.mtip.usetip(3, "删除专题图层失败", 1234);
                    }
                });
            }
        },


        /**
        *取消按钮--删除专题配置对话框
        *@method cancelDeleteFeatureResult
        *@param e {Object} 事件对象
        */
        cancelDeleteFeatureResult: function (e) {
            $("#deleteFeatureResultModel").remove();
        },

        /**
        *专题搜索
        *@method search
        */
        search: function (e) {
            var text = $.trim($(".featureConfig_Left_Search>input").val());
            var treeObj = this.tree.getTreeObj("featureTree");
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
                var featureNodes = [],featureNodes1 = [],featureNodes2=[],featureNodes3=[];
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
                        if (parentNode.id == featureNodes2[j].id && parentNode.type !="root")
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
        *专题配置结果搜索
        *@method search
        */
        searchConfigResult: function (e) {
            var text = $.trim($(".featureConfig_Right_Search>input").val());
            var treeObj = this.tree.getTreeObj("featureResourceTree");
            var Nodes = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "type", "value": "layer" });

            if (text == "")
            {
                treeObj.showNodes(Nodes);
            }
            else
            {
                var configNodes = [];
                var searchNodes = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "name", "value": text });
                //获取搜索到的专题节点
                for (var i = 0; i < searchNodes.length; i++)
                {
                    if (searchNodes[i].type == "layer")
                    {
                        configNodes.push(searchNodes[i]);
                    }
                }

                //隐藏所有节点（除根节点）
                treeObj.hideNodes(Nodes);
                //显示模糊搜索的结果
                treeObj.showNodes(configNodes);
            }
        },
    });
    return L.DCI.FeaturePanel;
});