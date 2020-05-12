/**
*导出类
*@module modules.output
*@class DCI.Export
*@constructor initialize
*/
define("output/export", [
    "leaflet",
    "core/dcins"
], function (L) {

    L.DCI.Export = L.Class.extend({
        /**
        *初始化
        *@method initialize
        */
        initialize: function (url) {

        },
        /**
        *导出excel
        *@method exportExcel
        *@param name {String} 名称
        *@param data {Array} 数据
        */
        exportExcel: function (name, data) {
            var json = L.dci.app.util.tableToJson(data);
            var ss = JSON.stringify(json);
                L.dci.app.services.baseService.exportTo({
                    name: '测试',
                    data: encodeURI(ss)
                }); 
        },

        /*导出pdf*/
        exportPdf: function (name, data) {
        },

        /*导出word*/
        exportWord: function (name, data) {
        }
    });
    L.dci.export = function () {
        return new L.DCI.Export();
    }
})
