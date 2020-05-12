/**
*菜单配置项类
*@module layout
*@class DCI.Menu
*@constructor initialize
*@extends DCI.BaseObject
*/
define("layout/menu", [
    "leaflet",
    "core/dcins",
    "core/baseobject",
    "layout/tool"
], function (L) {

    L.DCI.Menu = L.DCI.BaseObject.extend({
        /**
        *菜单数据
        *@property _data
        *@type {Array}
        *@private
        */
        _data: [],
        /**
        *观察者 从数据库获取菜单配置后回调
        *@property _subscriber
        *@type {Array}
        *@private
        */
        _subscriber:[],

        /**
        *初始化
        *@method initialize
        */
        initialize: function (util, services) {
            this._getAllFunction(util, services);
        },

        /**
        *获取所有功能菜单
        *@method _getAllFunction
        *@param services {Object} 服务对象
        *@private
        */
        _getAllFunction: function (util,services) {
           var deferred=services.baseService.getAllFunction({
                context: this,
                userId:util.user.getCurUser().id,
                success: this._functionHandler,
                error:this._errorHandler
           });
        },

        /**
        *获取功能菜单回调函数
        *@method _functionHandler
        *@param res {Object} 功能结果对象
        *@private
        */
        _functionHandler: function (res) {
            try {
                this._data = [];
                var data = this._formatData(res);
                this._data = data;
                this._distribute(data);
            } catch (e) {
                //console.log(e.message);
                L.dci.log.showLog(e.message);
            }
        },

        /**
        *异常回调函数
        *@method _errorHandler
        *@param e {Object} 异常对象
        *@private
        */
        _errorHandler: function (e) {
            //console.log(e.message);
            L.dci.log.showLog(e.message);
            L.dci.app.util.dialog.error("温馨提示", "未能获取功能菜单项");
        },
        /**
        *获取菜单处理函数
        *@method _formatData
        *@param res {Object} 结果对象
        *@private
        *@return {Object} 新的结果对象
        */
        _formatData: function (res) {
            var data = [];
            try {
                for (var i = 0; i < res.length; i++) {
                    var item = {
                        name: res[i]["Obj"]["FUNCTIONTYPENAME"],
                        clsName: res[i]["Obj"]["CLSNAME"],
                        menu: []
                    };
                    for (var j = 0; j < res[i]["Values"].length; j++) {
                        item.menu.push({
                            id: res[i]["Values"][j]["FUNCTIONNAME"],
                            name: res[i]["Values"][j]["DISPLAYNAME"],
                            clsName: res[i]["Values"][j]["CLSNAME"],
                            handler: res[i]["Values"][j]["EXECUTE"]
                        });
                    }
                    data.push(item);
                }
            } catch (e) {
                //console.log(e.message);
                L.dci.log.showLog(e.message);
            }
            return data;
        },
        /**
        *订阅对象
        *@method register
        *@param context {Object} 上下文对象
        *@param callback {Function} 回调函数
        */
        register: function (context, callback) {
            if (this._data.length != 0) {
                callback.call(context, this._data);
            }else
                this._subscriber.push({ context: context, callback: callback });
        },
        /**
        *分发事件
        *@method _distribute
        *@param data {Object} 菜单数据
        *@private
        */
        _distribute: function (data) {
            for (var i = 0; i < this._subscriber.length; i++) {
                this._subscriber[i].callback.call(this._subscriber[i].context, data);
            }
        },
        /**
        *获取菜单数据
        *@method getData
        *@return {Object} 当前菜单数据
        */
        getData: function () {
            return this._data;
        },
        /**
        *获取一类菜单
        *@method getDataByType
        *@param type {String} 菜单类型
        *@return {Object} 菜单数据
        */
        getDataByType: function(type) {
            if (this._data == null) return null;
            for (var i = 0; i < this._data.length; i++) {
                if (this._data[i]["Obj"]["FUNCTIONTYPENAME"] == type)
                    return this._data[i];
            }
            return null;
        },

        /**
        *执行菜单
        *@method excuteTool
        *@param id {String} 菜单项ID
        */
        excuteTool: function(id) {
            for (var i = 0; i < this._data.length; i++) {
                for (var j = 0; j < this._data[i].menu.length; j++) {
                    if (this._data[i].menu[j].id && this._data[i].menu[j].id == id) {
                        var handler = this._data[i].menu[j].handler;
                        L.dci.app.tool[handler]();
                    }
                }
            }
        },

        /**
        *获取右键菜单数据
        *@method getContextMenu
        *@param map {Object} Map对象
        *@return {Object} 右键菜单对象
        */
        getContextMenu: function (map) {
            this._context = [{
                text: '平移',
                context: map,
                callback: function (e) { this.activate(L.DCI.Map.StatusType.PAN); }
            }, {
                text: '放大',
                context: map,
                callback: function (e) { this.activate(L.DCI.Map.StatusType.ZOOM_IN); }
            }, {
                text: '缩小',
                context: map,
                callback: function (e) { this.activate(L.DCI.Map.StatusType.ZOOM_OUT); }
            }, '-', {
                text: '标点',
                context: map,
                callback: function (e) { this.activate(L.DCI.Map.StatusType.POINT); }
            }, {
                text: '标线',
                context: map,
                callback: function (e) { this.activate(L.DCI.Map.StatusType.POLYLINE); }
            }, {
                text: '标圆',
                context: map,
                callback: function (e) { this.activate(L.DCI.Map.StatusType.CIRCLE); }
            }, {
                text: '矩形',
                context: map,
                callback: function (e) { this.activate(L.DCI.Map.StatusType.RECTANGLE); }
            }, {
                text: '多边形',
                context: map,
                callback: function (e) { this.activate(L.DCI.Map.StatusType.POLYGON); }
            }, '-', {
                text: '清空',
                callback: function (e) {
                    var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
                    for (var q = 0; q < mapGroup.length; q++) {
                        mapGroup[q].clear();
                    }
                }
            }];
            return this._context;
        }
    });
    return L.DCI.Menu;
});