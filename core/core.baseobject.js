/**
*基类
*@module core
*@class DCI.BaseObject
*@constructor initialize
*/
define("core/baseobject", [
    "leaflet",
    "core/dcins"
], function (L) {
    L.DCI.BaseObject = L.Class.extend({
        
        /**
        *对象id
        *
        *@property id
        *@type {String}
        */
        id: null,

        /**
        *加入事件机制
        *
        *@property includes
        *@type {Object}
        */
        includes: L.Mixin.Events,  
        
        initialize:function() {
            
        },

        /**
        *获取当前对象类型
        *
        *@method getType
        *@return {String} 当前对象类型
        */
        getType: function () {
            return typeof this;
        }
    });

    return L.DCI.BaseObject;
});