/**
*bottom布局类
*@module layout
*@class DCI.Layout.BottomPanel
*@constructor initialize
*@extends DCI.Layout
*/
define("layout/bottompanel", [
    "leaflet",
    "core/dcins",
    "layout/base"
], function (L) {
    L.DCI.Layout.BottomPanel = L.DCI.Layout.extend({
        /**
         *初始化
         *@method initialize
         */
        initialize: function () {
            L.DCI.Layout.prototype.initialize.call(this);
            this.id = "bottomPanel";
            this.body = $("#bottompanel");
        }
    });
    return L.DCI.BottomPanel;
});