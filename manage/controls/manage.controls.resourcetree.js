/**
*资源管理下专题配置的服务资源树类
*@module controls
*@class DCI.ResourceTree
*/
define("manage/controls/resourcetree", [
    "leaflet",
    "ztree",
    "ztree/exhide",
    "manage/controls/tree",
    "data/manage/handledata"
], function (L) {
    L.DCI.ResourceTree = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        */
        id: 'resourceTree',

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
                    for (var i = 0; i < length; i++) {
                        if (obj[i].RESOURCETYPEID == 1) {
                            dataNodes.push(this.handleData.resourceType(obj[i].RESOURCETYPEID, obj[i].RESOURCETYPENAME, true));
                        }
                        else {
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
                            for (var j = 0; j < length; j++) {
                                var resourceTypeId = obj2[j].RESOURCETYPEID;
                                switch (resourceTypeId) {
                                    case 1:
                                    case 3:
                                        //插入矢量类型的图层节点(包括矢量图层类型和WMS图层类型)
                                        dataNodes.push(this.resourceDynamicMapLayer(obj2[j].RESOURCEID, obj2[j].RESOURCETYPEID, obj2[j].RESOURCENAME, false));
                                        break;
                                    case 2:
                                    case 4:
                                        //插入切片类型的图层节点(包括切片图层类型和WMTS图层类型)
                                        dataNodes.push(this.resourceTiledMapLayer(obj2[j].RESOURCEID, obj2[j].RESOURCETYPEID, obj2[j].RESOURCENAME));
                                        break;
                                    default:
                                        break;
                                }
                            }

                            //生成树
                            var containerObj = $("#resourceTree");
                            this.tree.show({ "elementObj": containerObj, "setting": this.resourceTreeSetting(), "nodes": dataNodes });
                            var treeObj = this.tree.getTreeObj("resourceTree");
                            this.tree.refresh(treeObj);
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

        resourceDynamicMapLayer: function (id, pId, name, status) {
            var node = new Object();
            node.id = 'dynamicLayer-' + id;
            node.pId = 'resourceType-' + pId;
            node.name = name;
            node.type = "dynamicLayer";
            node.open = status;
            node.isParent = false;
            node.children = [];
            node.iconOpen = "themes/default/images/controls/folder-open.png";       //自定义图标（打开）
            node.iconClose = "themes/default/images/controls/folder-close.png";     //自定义图标（关闭）

            return { "recordid": id, "id": node.id, "pId": node.pId, "name": node.name, "type": node.type, "open": node.open, "isParent": node.isParent, "children": node.children, "iconOpen": node.iconOpen, "iconClose": node.iconClose };
        },
        //资源树(#resourceTree)-切片图层下的节点(包括切片图层类型和WMTS图层类型)
        resourceTiledMapLayer: function (id, pId, name) {
            var node = new Object();
            node.id = 'tiledLayer-' + id;
            node.pId = 'resourceType-' + pId;
            node.layerId = "";
            node.resourceId = id;
            node.name = name;
            node.type = "tiledLayer";

            return { "recordid": id, "id": node.id, "pId": node.pId, "layerId": node.layerId, "resourceId": node.resourceId, "name": node.name, "type": node.type };
        },
    });
    return L.DCI.ResourceTree;
});