/**
*样式类 获取要素渲染的样式
*@module core
*@class DCI.Symbol
*@constructor initialize
*@extends DCI.BaseObject
*/
define("core/symbol", [
    "leaflet",
    "core/dcins",
    "core/baseobject"
], function (L) {
    L.DCI.Symbol = L.DCI.BaseObject.extend({
        /**
        *点样式
        *@property pointSymbol
        *@type {Object}
        */
        pointSymbol:null,
        /**
        *线样式
        *@property polylineSymbol
        *@type {Object}
        */
        polylineSymbol:null,
        /**
        *面样式
        *@property polygonSymbol
        *@type {Object}
        */
        polygonSymbol: null,
        /**
        *点高亮样式
        *@property highlightPointSymbol
        *@type {Object}
        */
        highlightPointSymbol: null,
        /**
        *线高亮样式
        *@property highlightPolylineSymbol
        *@type {Object}
        */
        highlightPolylineSymbol: null,
        /**
        *面高亮样式
        *@property highlightPolygonSymbol
        *@type {Object}
        */
        highlightPolygonSymbol:null,
        /**
        *初始化
        *@method initialize
        */
        initialize:function(){
            this.pointSymbol={
                iconUrl: 'themes/default/images/point/point0.png',
                iconSize: [37, 33],
                opacity: 1
            };

            this.pointSymbol_2 = {
                iconUrl: 'themes/default/images/point/point7.png',
                iconSize: [37, 33],
                opacity: 1
            };

            this.polylineSymbol = {
                color: '#ff5f00',
                weight: 4,
                opacity: 1
            };
            this.polygonSymbol = {
                color: '#ff5f00',
                weight: 4,
                opacity: 1,
                fill: true,
                fillColor: '#ffdc00',
                fillOpacity: 0.6
            };

            this.highlightPointSymbol = {
                icon: L.icon({
                    iconUrl: 'themes/default/images/controls/draw/dot-plotting.png',
                    iconSize: [24, 28],
                    iconAnchor: [12, 25]
                }),
                opacity: 1
            };

            this.highlightPolylineSymbol = {
                color: '#ff5f00',
                weight: 3,
                opacity: 1
            };

            this.highlightPolygonSymbol = {
                color: '#ff5f00',
                weight: 3,
                opacity: 1,
                fill: true,
                fillColor: '#ffdc00',
                fillOpacity: 0.2,
                CANVAS: true
            };
        }
    });
    return L.DCI.Symbol;
});

