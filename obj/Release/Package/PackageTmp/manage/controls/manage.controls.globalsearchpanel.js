/**
*资源管理下全局搜索配置类
*@module controls
*@class DCI.FeaturePanel
*/
define("manage/controls/globalsearchpanel", [
    "leaflet",
    "ztree",
    "ztree/exhide",
    "manage/controls/tree",
    "manage/layout/globalsearchpanel",
    "data/manage/handledata",
    "manage/controls/resourcetree",
    "plugins/icheck"
], function (L) {
    L.DCI.GlobalSearchPanel = L.Class.extend({
        /**
        *类id
        *@property id
        *@type {String}
        */
        id: 'globalsearchpanel',
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
        *资源管理下全局搜索配置的服务资源树类对象
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
        *传输参数
        **/
        data: {
            edit_id: null,//参数ID
            edit_name: null,     //服务名称
            edit_resourceId: null,//服务资源ID
            edit_field: [],//查询字段
            edit_layerindex: [],    //图层
        },
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
        },
        /**
        *默认加载
        *@method loading
        */
        loading: function () {
            $(".sitemappanel_title").text("资源管理 > 全局搜索配置");
            this._body = $(".resource_manage");
            this._layout = new L.DCI.GlobalSearchPanelLayout();
            this._body.html(this._layout.getBodyHtml());
            this.handleData = new L.DCI.Manage.HandleData();
            this.tree = new L.DCI.Tree();
            this.resourceTree = new L.DCI.ResourceTree();
            this.resourceTree.loading();
            this.addResultTree();
            //滚动条
            $(".featureConfig_Left_Container>div").mCustomScrollbar({ theme: "minimal-dark" });
            $(".featureConfig_Right_Container>div").mCustomScrollbar({ theme: "minimal-dark" });

            //添加图层到配置结果
            $("#moveNodeToRight").on('click', { context: this }, function (e) { e.data.context.moveNodeToRight(e); });
            //修改图层到配置结果
            $(".featureConfig_Right").on('click', '.editFeature.titleIconActive', { context: this }, function (e) { e.data.context.editFeatureLayer(e); });
            //删除--配置结果树
            $(".featureConfig_Right").on('click', '.deleteFeature.titleIconActive', { context: this }, function (e) { e.data.context.deleteFeatureLayer(e); });
        },
        /**
        *更新某一专题顺序
        *@method _updateSindex
        *@param updateOption {Object} 节点信息
        */
        _updateSindex: function (updateOption) {
            L.mtip.usetip(1, "保存中...", 1234);

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
        *全局查询结果树的配置
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
                    chkStyle: "radio",
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
        *单击事件（专题全局查询配置结果树）
        *@method configResultTreeOnClick
        *@param event {Object}      事件对象
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        configResultTreeOnClick: function (event, treeId, treeNode) {
            var ele = $(event.target).parent().siblings('.chk');
            $(ele).click();

            var treeObj = this.tree.getTreeObj("GlobalSearchResultTree");
            //判断勾选节点个数来激活批量删除按钮
            var nodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].type == "root")
                    nodes.splice(i, 1);
                break;
            }
            if (nodes.length > 0) {
                $(".featureConfig_Right .deleteFeature").removeClass("titleIcon").addClass("titleIconActive");
                $(".featureConfig_Right .editFeature").removeClass("titleIcon").addClass("titleIconActive");
            }
            else {
                $(".featureConfig_Right .editFeature").removeClass("titleIconActive").addClass("titleIcon");
                $(".featureConfig_Right .deleteFeature").removeClass("titleIconActive").addClass("titleIcon");
            }
        },
        /**
        *添加——全局查询配置
        *@method moveNodeToRight
        *@param event {Object}      事件对象
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        moveNodeToRight: function (e) {
            var featureTreeObj = this.tree.getTreeObj("resourceTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": featureTreeObj, "checked": true });

            //判断数据专题树是否勾选
            if (nodes.length == 0) {
                L.dialog.errorDialogModel("数据专题没勾选");
            }
            else if (nodes[0].type != "dynamicLayer") {
                L.dialog.errorDialogModel("数据专题没勾选");
            }
            else {
                //显示对话框
                var html = this._layout.editLayerObject();
                L.dialog.dialogModel('editLayerObjectModel', 150, 400, html, "服务属性配置");
                $(".editlayer_panel .saveAddFeatureWithImg").css({ "display": "block" });
                $(".editlayer_panel .editAddFeatureWithImg").css({ "display": "none" });
                $(".cancelAddFeatureWithImg").on('click', { context: this }, function (e) { e.data.context.cancelEditLayerObject(e); });

                $('#txtName')[0].value = nodes[0].name;
                this.data.edit_resourceId = nodes[0].recordid;
                this.data.edit_id = 0;
                //请求获取所有图层
                L.baseservice.getLayer({
                    async: true,
                    context: this,
                    success: function (layers) {
                        var obj = layers;
                        var length = obj.length;
                        var dataNodes = new Array();
                        //遍历各层数据
                        for (var i = 0; i < length; i++) {
                            var name = obj[i].LAYERNAME + '(' + obj[i].SINDEX + ')';
                            if (obj[i].RESOURCEID == nodes[0].recordid) {
                                dataNodes.push(this.handleData.resourceLayer(obj[i].LAYERID, obj[i].RESOURCEID, obj[i].RESOURCEID, name, obj[i].SINDEX));
                            }
                        }
                        //生成图层选择checkbox
                        var layerHtml = '';
                        for (var j = 0; j < dataNodes.length; j++) {
                            layerHtml += '<div class="choose-layer-checkbox"><input type="checkbox" data="' + dataNodes[j].sIndex + '"><span>' + dataNodes[j].name + '</span></div>';
                        }
                        $('.layerIndex_container').html(layerHtml);
                        $(".layerIndex_container").mCustomScrollbar({
                            theme: "minimal-dark"
                        });
                        $('.choose-layer-checkbox').find('input').each(function () {
                            $(this).iCheck({
                                checkboxClass: 'icheckbox_flat-red',
                            });
                        });
                        $('.saveAddFeatureWithImg').on('click', { obj: this }, this.editAddresult);
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        L.dialog.errorDialogModel("获取所有图层失败");
                    }
                });
            }

        },
        /**
        *加载结果树——全局查询结果
        @method addResultTree
        **/
        addResultTree: function () {
            var ajax = new L.DCI.Ajax();
            var baseurl = Project_ParamConfig.defaultCoreServiceUrl;
            var ResquestUrl = baseurl + "/cpzx/manage/golbalsearch/getLayers"
            ajax.get(ResquestUrl, null, true, this, function (result) {
                var dataNodes = new Array();
                for (var i = 0; i < result.length; i++) {
                    dataNodes.push(this.handleData.globalsearchConfigResult(result[i].id, result[i].resourceid, result[i].layers, result[i].fields, result[i].name));
                }
                //生成树
                var containerObj = $("#GlobalSearchResultTree");
                this.tree.show({ "elementObj": containerObj, "setting": this.featureConfigResultSetting(), "nodes": dataNodes });
                var treeObj = this.tree.getTreeObj("GlobalSearchResultTree");
                this.tree.refresh(treeObj);
            }, function (XMLHttpRequest, textStatus, errorThrown) {
                L.dialog.errorDialogModel("获取已配置的快捷图层失败");
            });
        },
        /**
        *新增、修改——结果保存编辑
        *@method editAddresult
        @param {objec} 事件对象
        */
        editAddresult: function (o) {
            var _this = o.data.obj;
            _this.data.edit_layerindex = [];
            $('.choose-layer-checkbox').find('input').each(function () {
                if ($(this).is(':checked')) {
                    _this.data.edit_layerindex.push($(this)[0].getAttribute('data'));
                }
            });
            var layerIndex = _this.data.edit_layerindex.join(",");
            var name = $.trim($(".edit-name-style .txtName").val());
            var field = $.trim($(".edit-field-style .txtName").val());
            if (name.length == 0) {
                $('.edit-name-style .errorText').text("名称为空!");
                return;
            }
            if (field.length == 0) {
                $('.edit-field-style .errorText').text("字段为空!");
                return;
            }
            if (layerIndex.length == 0) {
                $('.edit-layerindex-style .errorText').text("未选择图层!");
                return;
            }
            var saveParam = {
                ID: _this.data.edit_id,
                ResourceID: _this.data.edit_resourceId,
                Layers: layerIndex,
                Field: field,
                Name: name,
            };
            _this.handleLogic(saveParam);
        },
        /**
        *处理编辑后的图层到全局查询配置结果的逻辑
        *@method handleLogic
        *@param {oject} 配置图层对象
        */
        handleLogic: function (obj) {
            var ajax = new L.DCI.Ajax();
            var baseurl = Project_ParamConfig.defaultCoreServiceUrl;
            var getThemLayersURL = baseurl + "/cpzx/manage/golbalsearch/saveLayer/" + obj.ID + "/" + obj.ResourceID + "/" + obj.Layers + "/" + obj.Field + "/" + obj.Name + "";
            ajax.get(getThemLayersURL, null, true, this, function (result) {
                if (result.result = "true") {
                    this.addResultTree();
                    $("#editLayerObjectModel").remove();
                } else {
                    L.dialog.errorDialogModel("添加失败");
                }
                L.mtip.usetip(2, "完成", 100);
            }, function (XMLHttpRequest, textStatus, errorThrown) {
                L.dialog.errorDialogModel("操作请求无响应");
                L.mtip.usetip(3, "失败", 100);
            });

        },
        /**
        *删除结果中选中的图层
        *@method deleteFeatureLayer
        */
        deleteFeatureLayer: function (e) {
            var text = '是否删除选中的全局查询配置图层?';
            var html = this._layout.deleteFeatureResultHtml();
            L.dialog.dialogModel('deleteGlobalSearchResultModel', 150, 300, html, '删除配置');

            $(".deleteFeatureResult p").html(text);
            $(".submitDeleteFeatureResult").on('click', { context: this }, function (e) { e.data.context.submitDeleteFeatureResult(e); });
            $(".cancelDeleteFeatureResult").on('click', { context: this }, function (e) { e.data.context.cancelDeleteFeatureResult(e); });
        },
        /**
        *修改配置属性
        *@method editFeatureLayer
        */
        editFeatureLayer: function (e) {
            var treeObj = this.tree.getTreeObj("GlobalSearchResultTree");
            var node = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
            //显示对话框
            var html = this._layout.editLayerObject();
            L.dialog.dialogModel('editLayerObjectModel', 150, 400, html, "服务属性修改");
            $(".editlayer_panel .saveAddFeatureWithImg").css({ "display": "none" });
            $(".editlayer_panel .editAddFeatureWithImg").css({ "display": "block" });
            $(".cancelAddFeatureWithImg").on('click', { context: this }, function (e) { e.data.context.cancelEditLayerObject(e); });
            $('#txtName')[0].value = node[0].name;
            $('.edit-field-style .txtName')[0].value = node[0].fields;
            this.data.edit_id = node[0].id;
            this.data.edit_resourceId = node[0].recordid;
            var layers = node[0].layerChecked;
            var checkLayers = layers.split(',');
            //alert(node[0].layerChecked)
            //请求获取所有图层
            L.baseservice.getLayer({
                async: true,
                context: this,
                success: function (layers) {
                    var obj = layers;
                    var length = obj.length;
                    var dataNodes = new Array();
                    //遍历各层数据
                    for (var i = 0; i < length; i++) {
                        var name = obj[i].LAYERNAME + '(' + obj[i].SINDEX + ')';
                        if (obj[i].RESOURCEID == node[0].recordid) {
                            dataNodes.push(this.handleData.resourceLayer(obj[i].LAYERID, obj[i].RESOURCEID, obj[i].RESOURCEID, name, obj[i].SINDEX));
                        }
                    }
                    //生成图层选择checkbox
                    var layerHtml = '';
                    for (var j = 0; j < dataNodes.length; j++) {
                        layerHtml += '<div class="choose-layer-checkbox"><input type="checkbox"  data="' + dataNodes[j].sIndex + '"><span>' + dataNodes[j].name + '</span></div>';
                    }
                    $('.layerIndex_container').html(layerHtml);
                    $(".layerIndex_container").mCustomScrollbar({
                        theme: "minimal-dark"
                    });
                    $('.choose-layer-checkbox').find('input').each(function () {
                        var layerNum = $(this)[0].getAttribute('data');
                        var isContain = false;
                        for (var k in checkLayers) {
                            if (checkLayers[k] == layerNum) {
                                isContain = true;
                                break;
                            }
                        }
                        $(this).iCheck({
                            checkboxClass: 'icheckbox_flat-red',
                        });
                        //自动勾选
                        if (isContain) {
                            $(this).iCheck('check');
                        }
                    });
                    $('.editAddFeatureWithImg').on('click', { obj: this }, this.editAddresult);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.dialog.errorDialogModel("获取所有图层失败");
                }
            });


        },
        /**
        *确定按钮--删除专题配置对话框
        *@method submitDeleteFeatureResult
        */
        submitDeleteFeatureResult: function (e) {
            this.cancelDeleteFeatureResult();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);

            var treeObj = this.tree.getTreeObj("GlobalSearchResultTree");
            var checkedNodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
            //删除根节点
            for (var i = 0; i < checkedNodes.length; i++) {
                if (checkedNodes[i].type == "root") {
                    checkedNodes.splice(i, 1);
                }
            }
            if (checkedNodes.length == 0) {
                L.dialog.errorDialogModel("没有勾选图层节点");
            }
            else {
                var id = checkedNodes[0].recordid;
                var ajax = new L.DCI.Ajax();
                var baseurl = Project_ParamConfig.defaultCoreServiceUrl;
                var getThemLayersURL = baseurl + "/cpzx/manage/golbalsearch/removeLayer/" + id;
                ajax.get(getThemLayersURL, null, true, this, function (result) {
                    if (result.result = "true") {
                        this.addResultTree();
                        //关闭删除和编辑按钮状态
                        $(".featureConfig_Right .deleteFeature").removeClass("titleIconActive").addClass("titleIcon");
                        $(".featureConfig_Right .editFeature").removeClass("titleIconActive").addClass("titleIcon");
                        L.mtip.usetip(2, "完成", 100);
                    } else {
                        L.dialog.errorDialogModel("删除失败");
                    }
                }, function (XMLHttpRequest, textStatus, errorThrown) {
                    L.dialog.errorDialogModel("操作请求无响应");
                    L.mtip.usetip(3, "失败", 100);
                });
            }

        },
        /**
        *取消按钮--删除专题配置对话框
        *@method cancelDeleteFeatureResult
        *@param e {Object} 事件对象
        */
        cancelDeleteFeatureResult: function (e) {
            $("#deleteGlobalSearchResultModel").remove();
        },
        /*
        *取消编辑按钮——配置图层属性
        *@method cancelEditLayerObject
        *@param e {Object} 事件对象
        */
        cancelEditLayerObject: function (e) {
            $("#editLayerObjectModel").remove();
        }
    });
    return L.DCI.GlobalSearchPanel;
});