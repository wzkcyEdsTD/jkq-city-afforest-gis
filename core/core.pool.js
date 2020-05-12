/**
*对象缓存池
*@module core
*@class DCI.Pool
*@constructor initialize
*@extends DCI.BaseObject
*/
define("core/pool", [
    "leaflet",
    "core/dcins",
    "core/baseobject"
], function (L) {
    L.DCI.Pool = L.DCI.BaseObject.extend({
        /**
        *缓存数组
        *@property pool
        *@type {Array}
        */
        pool: [],

        initialize: function () { },

        /**
        *添加到缓存池
        *@method add
        *@param obj {Object} 缓存对象
        *@param id {String}  缓存ID
        */
        add: function (obj, id) {
            if (id==undefined) {
                id = obj.id;
            }
            if (id == null) {
                return null;
            }
            if (this.has(id)) {
                return null;
            };
            this.pool.push({ "obj": obj, "key": id });
        },
        /**
        *从缓存池中删除
        *@method remove
        *@param key {String}  缓存ID
        */
        remove: function (key) {
            for (var i = 0; i < this.pool.length; i++) {
                if (this.pool[i].key == key) {
                    this.pool.splice(i, 1);
                    break;
                }
            }
        },
        /**
        *获取缓存对象
        *@method get
        *@param key {String}  缓存ID
        *@return {Object} 缓存对象
        */
        get: function (key) {
            for (var i = 0; i < this.pool.length; i++) {
                if (this.pool[i].key == key) {
                    return this.pool[i].obj;
                }
            }
            return null;
        },
        /**
        *判断是否缓存池是否存在指定缓存ID
        *@method has
        *@param key {String}  缓存ID
        *@return {bool}
        */
        has: function (key) {
            for (i = 0; i < this.pool.length; i++) {
                if (this.pool[i].key == key) return true;
            }
            return false;
        }
    });

    return L.DCI.Pool;
});