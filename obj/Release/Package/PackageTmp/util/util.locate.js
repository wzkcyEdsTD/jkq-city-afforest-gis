/**
*查询定位类
*@module util
*@class DCI.locate
*@constructor initialize
*/

define("util/locate", [
    "leaflet",
    "core/dcins"
], function (L) {
    L.DCI.Locate = L.Class.extend({
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
        },
        /**
        *执行Query操作
        *@method doQuery
        *param url {String} 查询的图层地址
        *param field {String} 查询的字段名
        *param data {Object} 查询条件值
        *param callback {Object} 回调函数
        */
        doQuery: function (url, field, data, callback) {
            //清除高亮图层
            var map=L.dci.app.util.clearSelected();
            var query = L.esri.Tasks.query(url);
            //构建Where 查询语句 arr
            var arr = field + " IN (";
            var str = "OBJECTID";
            if (field.indexOf(str) > 0) {
                for (var i = 0; i < data.length; i++) {
                    arr += data[i] + ",";
                    //构建字段值与相应序号的对用关系数组 index
                    this.index[data[i]] = i + 1;
                };
            } else {
                for (var i = 0; i < data.length; i++) {
                    arr += "'" + data[i] + "'" + ",";
                };
            };
            arr = arr.substring(0, arr.length - 1);
            arr += ")";
            query.where(arr);
            query.fields(field);

            query.run(function (error, featureCollection, response) {
                if (error) {
                    console.log(error);
                    L.dci.app.util.dialog.alert("错误提示", error.message);
                } else {
                    var feaResult = featureCollection.features;
                    if (feaResult.length > 0) {
                        for (var i = 0; i < feaResult.length; i++) {
                            L.dci.app.util.highLight(map, feaResult[i], true, true, feaResult[i].geometry.type);
                        }
                    }
                    if(callback!=null)
                        callback.call(featureCollection, response);
                };
            });
        },

        /**
        *执行Find操作
        *@method doFind
        *param url {String} 查询的图层地址
        *param layers {Array} 图层索引
        *param field {String} 查询的字段名
        *param data {Object} 查询条件值
        *param callback {Object} 回调函数
        */
        doFind: function (url, layers, field, data,callback) {
            var map=L.dci.app.util.clearSelected();
            var find = L.esri.Tasks.find(url);
            find.layers(layers.join(','));
            find.text(data);
            find.contains(true);
            find.fields(field);
            find.spatialReference(map.options.crs.code.split(':')[1]);

            find.run(function (error, featureCollection, response) {
                if (error) {
                    console.log(error);
                    L.dci.app.util.dialog.alert("错误提示", error.message);
                } else
                {
                    if (callback != null)
                        callback.call(error, featureCollection, response);

                    var feaResult = featureCollection.features;
                    if (feaResult.length > 0) {
                        for (var i = 0; i < feaResult.length; i++) {
                            L.dci.app.util.highLight(map, feaResult[i], true, true, feaResult[i].geometry.type);
                        };
                    };
                    
                };
            });
        }
    });
    return L.DCI.Locate;
});