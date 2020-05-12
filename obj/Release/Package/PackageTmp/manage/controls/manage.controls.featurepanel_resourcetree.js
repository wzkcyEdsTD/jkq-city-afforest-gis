/**
*资源管理下专题配置的服务资源树类
*@module controls
*@class DCI.FeaturePanelResourceTree
*/
define("manage/controls/featurepanelResourceTree", [
    "leaflet",
    "ztree",
    "ztree/exhide",
    "manage/controls/tree",
    "data/manage/handledata"
], function (L) {
    L.DCI.FeaturePanelResourceTree = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        */
        id: 'featurePanelResourceTree',

        /**
        *资源管理下专题配置类对象
        *@property featurepanel
        *@type {Object}
        */
        featurepanel: null,

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
            this.featurepanel = L.app.pool.get("featurePanel");
            this.handleData = new L.DCI.Manage.HandleData();
            this.tree = new L.DCI.Tree();
            this.getResourceTree();

            //服务资源树--点击搜索
            $(".featureConfig_Middle").on('click', '.search', { context: this }, function (e) { e.data.context.search(e); });
            //服务资源树--搜索(回车键触发)
            $(".featureConfig_Middle_Search").on('keydown', 'input', { context: this }, function (e) {
                var e = e || window.event;
                if (e.keyCode == 13)
                {
                    e.data.context.search(e);
                    return false;
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
        getResourceTree:function(){
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
                                    var containerObj = $("#resourceTree");
                                    this.tree.show({ "elementObj": containerObj, "setting": this.resourceTreeSetting(), "nodes": dataNodes });
                                    var treeObj = this.tree.getTreeObj("resourceTree");
                                    this.tree.refresh(treeObj);
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
        },


        /**
        *专题搜索
        *@method search
        */
        search: function (e) {
            var text = $.trim($(".featureConfig_Middle_Search>input").val());
            var treeObj = this.tree.getTreeObj("resourceTree");
            var Nodes1 = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "type", "value": "resourceType" });    //获取所有资源类型节点
            var Nodes2 = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "type", "value": "dynamicLayer" });    //获取所有矢量服务节点
            var Nodes3 = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "type", "value": "tiledLayer" });      //获取所有切片服务节点
            var nodes = Nodes1.concat(Nodes2);
            var Nodes = nodes.concat(Nodes3);  //所有节点，根节点除外

            if (text == "")
            {
                treeObj.showNodes(Nodes);
                //收起所有服务类型节点，除矢量图层
                for (var i = 0; i < Nodes1.length; i++)
                {
                    if (Nodes1[i].name == "矢量图层")
                    {
                        treeObj.expandNode(Nodes1[i], true, false, false);
                    }
                    else
                    {
                        treeObj.expandNode(Nodes1[i], false, false, false);
                    }
                }
            }
            else
            {
                var resNodes = [], resNodes1 = [], resNodes2 = [], resNodes3 = [];
                var searchNodes = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "name", "value": text });
                //获取搜索到的专题节点
                for (var i = 0; i < searchNodes.length; i++)
                {
                    if (searchNodes[i].type == "dynamicLayer")
                    {
                        resNodes1.push(searchNodes[i]);
                    }
                    if (searchNodes[i].type == "tiledLayer")
                    {
                        resNodes2.push(searchNodes[i]);
                    }
                }

                //获取含有矢量服务的矢量类型节点
                for (var i = 0; i < resNodes1.length; i++)
                {
                    var parentNode = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": resNodes1[i].pId });
                    var count = 0;
                    for (var j = 0; j < resNodes3.length; j++)
                    {
                        if (parentNode.id == resNodes3[j].id && parentNode.type != "root")
                        {
                            count++;
                            break;
                        }
                    }
                    if (count == 0)
                    {
                        resNodes3.push(parentNode);
                    }
                }

                //获取含有切片服务的矢量类型节点
                for (var i = 0; i < resNodes2.length; i++)
                {
                    var parentNode = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": resNodes2[i].pId });
                    var count = 0;
                    for (var j = 0; j < resNodes3.length; j++)
                    {
                        if (parentNode.id == resNodes3[j].id && parentNode.type != "root")
                        {
                            count++;
                            break;
                        }
                    }
                    if (count == 0)
                    {
                        resNodes3.push(parentNode);
                    }
                }

                resNodes = resNodes1.concat(resNodes2);
                resNodes = resNodes.concat(resNodes3);

                //隐藏所有节点（除根节点）
                treeObj.hideNodes(Nodes);
                //显示模糊搜索的结果
                treeObj.showNodes(resNodes);
                //展示所有服务类型节点
                for (var i = 0; i < Nodes1.length; i++)
                {
                    treeObj.expandNode(Nodes1[i], true, false, false);
                }
            }
        },



    });
    return L.DCI.FeaturePanelResourceTree;
});