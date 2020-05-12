/**
*模板分析模块类
*@module modules.analysis
*@class DCI.AuxiliaryLoc
*@constructor initialize
*@extends Class
*/
define("analysis/sample", [
    "leaflet",
    "core/dcins",
    "plugins/scrollbar",
    "analysis/gpHandler",    
], function (L) {
    L.DCI.Sample = L.Class.extend({

        /**
        *类ID
        *@property id
        *@type {String}
        */
        id: 'Sample',

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            L.DCI.App.pool.get('LeftContentPanel').show(this,this.buildPanel);
        },

        /**
        *构建面板
        *@method buildPanel
        **/
        buildPanel: function () {
            alert("调用成功");
        }

    });
    return L.DCI.Sample;
});