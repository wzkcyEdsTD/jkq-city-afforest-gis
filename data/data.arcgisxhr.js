/**
*arcgis服务 接口调用类
*@module data
*@class DCI.Arcgis.Xhr
*@constructor initialize
*@author eds
*/
define("data/arcgisxhr", [
    "leaflet",
    "core/dcins",
    "data/ajax",
], function (L) {
    L.DCI.ArcgisXhr = L.Class.extend({
        /**
        *Ajax对象
        *@property ajax
        *@type {Object}
        *@private
        */
        ajax: null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this.ajax = new L.DCI.Ajax();
        },
        getArcgisByXhr: function (url, fn, where = "1=1", returnGeometry = false) {
            this.ajax.get(url, {
                f: "json",
                outFields : "*",
                where,
                returnGeometry,
                spatialRel: "esriSpatialRelIntersects",
                relationParameter: (+new Date()).toString()
            }, true, this, function (data) {
                    fn && fn(data);
            });
        }
    });

    return L.DCI.ArcgisXhr;
});