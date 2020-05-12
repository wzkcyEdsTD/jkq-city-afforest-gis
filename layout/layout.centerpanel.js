/**
*center布局类
*@module layout
*@class DCI.Layout.CenterPanel
*@constructor initialize
*@extends DCI.Layout
*/
define("layout/centerpanel", [
    "leaflet",
    "core/dcins",
    "layout/base"
], function (L) {
    
    L.DCI.Layout.CenterPanel = L.DCI.Layout.extend({
        /**
        *界面标签
        *@property body
        *@type {String}
        */
        tempHtml:'<div id="map-main" class="col-sm-6 mapone"></div>'
            +'<div id="map-tow" class="col-sm-6 maptow"></div>'
            +'<div id="map-three" class="col-sm-6 mapthree"></div>'
            +'<div id="map-four" class="col-sm-6 mapfour"></div>',
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            L.DCI.Layout.prototype.initialize.call(this);
            this.id = "centerPanel";
            this.body = $("#centerpanel");
            this.body.html(this.tempHtml);
        }
    });
    return L.DCI.CenterPanel;
});