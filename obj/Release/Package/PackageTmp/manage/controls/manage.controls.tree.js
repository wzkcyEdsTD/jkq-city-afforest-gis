/**
*树控制类
*@module core
*@class DCI.Tree
*/
define("manage/controls/tree", [
    "leaflet",
    "ztree"
], function (L) {
    if (L.DCI == null) L.DCI = {};
    L.DCI.Tree = L.Class.extend({

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
        },

        /**
        *刷新树
        *@method refresh
        *param treeObj {Object} 树对象
        */
        refresh: function (treeObj) {
            treeObj.refresh();
        },

        /**
        *生成树
        *@method show
        *param options {Object} 参数(elementObj:填充容器对象，setting：配置，nodes:节点数据集)
        */
        show: function (options) {
            $.fn.zTree.init(options.elementObj, options.setting, options.nodes);
        },

        /**
        *通过容器id获取树对象
        *@method getTreeObj
        *param id {String} 填充树的容器id
        *@return {Object}  返回树对象
        */
        getTreeObj: function (id) {
            var treeObj = $.fn.zTree.getZTreeObj(id);
            return treeObj;
        },

        /**
        *改变单选框状态
        *@method changeRadioState
        *param options {Object} 参数(treeObj:树对象，treeNode：节点)
        */
        changeRadioState: function (options) {
            if (options.treeNode.checked == false)
            {
                options.treeNode.checked = true;
            }
            else
            {
                options.treeNode.checked = false;
            }
            this.updateNode(options);
        },

        /**
        *改变复选框的状态(全选\全取消)
        *@method changeCheckedAllState
        *param options {Object} 参数(treeObj:树对象，checked：状态)
        */
        changeCheckedAllState: function (options) {
            options.treeObj.checkAllNodes(options.checked)
        },

        /**
        *获取精确匹配的所有节点信息
        *@method getNodes
        *param options {Object} 参数(treeObj:树对象，key：属性名，value:属性值)
        */
        getNodes: function (options) {
            var nodes = options.treeObj.getNodesByParam(options.key, options.value, null);
            return nodes;
        },

        /**
        *获取模糊匹配的所有节点信息
        *@method getNodesByParamFuzzy
        *param options {Object} 参数(treeObj:树对象，key：属性名，value:属性值)
        */
        getNodesByParamFuzzy: function (options) {
            var nodes = options.treeObj.getNodesByParamFuzzy(options.key, options.value, null);
            return nodes;
        },

        /**
        *获取精确匹配的某个节点信息
        *@method getNode
        *param options {Object} 参数(treeObj:树对象，key：属性名，value:属性值)
        */
        getNode: function (options) {
            var node = options.treeObj.getNodeByParam(options.key, options.value, null);
            return node;
        },

        /**
        *获取勾选中的节点集
        *@method getCheckedNodes
        *param options {Object} 参数(treeObj:树对象，checked：状态)
        */
        getCheckedNodes: function (options) {
            var nodes = options.treeObj.getCheckedNodes(options.checked);
            return nodes;
        },

        /**
        *删除节点
        *@method removeNode
        *param options {Object} 参数(treeObj:树对象，treeNode：节点)
        */
        removeNode: function (options) {
            options.treeObj.removeNode(options.treeNode);
            this.refresh(options.treeObj);
        },

        /**
        *更新节点
        *@method updateNode
        *param options {Object} 参数(treeObj:树对象，treeNode：节点)
        */
        updateNode: function (options) {
            options.treeObj.updateNode(options.treeNode);
            this.refresh(options.treeObj);
        },
    });

    return L.DCI.Tree;
});