/**
*layout布局基类
*@module layout
*@class DCI.Layout
*@constructor initialize
*@extends DCI.BaseObject
*/
define("layout/base", [
    "leaflet",
    "core/dcins",
    "core/baseobject"
], function (L) {

    L.DCI.Layout = L.DCI.BaseObject.extend({
        /**
        *类标识
        *@property id
        *@type {String}
        */
        id: null,
        /**
        *宽度
        *@property width
        *@type {Number}
        */
        width: 0,
        /**
        *高度
        *@property height
        *@type {Number}
        */
        height: 0,
        /**
        *是否可见
        *@property visible
        *@type {Bool
        *@default true
        */
        visible: true,
        /**
        *界面主体
        *@property body
        *@type {Object}
        */
        body: null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function() {
            L.DCI.BaseObject.prototype.initialize.call(this);
        },
        /**
        *设置可见性
        *@method setVisible
        *@param visible {bool} 可见性
        */
        setVisible:function(visible) {
            this.visible = visible;
            if (visible)
                this.body.css("display", "none");
            else
                this.body.css("display", "");
        }
        
    });

    return L.DCI.Layout;
});