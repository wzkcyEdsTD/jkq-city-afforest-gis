/**
*文件上传类
*@module modules.common
*@class DCI.loadfilesText
*@constructor initialize
*/
define("fileload/text", [
    "leaflet",
    "core/dcins",
    "data/services", ,
    "Shapefile"
], function (L) {

    L.DCI.loadfilesText = L.Class.extend({

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            /*拖放加载文件*/
            this._addEvent();

            /*按钮加载文件*/
            this._getFiles();
        },

        /**
        *监听拖拽打开文件
        *@method _addEvent
        */
        _addEvent: function () {
            if (window.FileReader) {
                var _this = this;
                var mappanel = document.getElementById('centerpanel');
                this._addEventHandler(mappanel, 'dragover', this._cancel);
                this._addEventHandler(mappanel, 'dragenter', this._cancel);
                this._addEventHandler(mappanel, 'drop', function (e) {
                    e = e || window.event;
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    _this._hasDrad(e);
                    return false;
                });
            } else {
                console.log('浏览器不支持 HTML5 FileReader.');
            }
        },

        /**
        *监听控件打开文件
        *@method _getFiles
        */
        _getFiles: function () {
            var _this = this;
            $(".fileload").on('change', function (e) {
                
                var filebut = $(this).get(0);
                var files = filebut.files;
                var text = $(this).data("info");
                _this.performType = text;
                _this._readFiel(files);
                filebut.value = null;
            });
        },

        /**
        *禁止浏览器默认行为
        *@method _cancel
        */
        _cancel: function (e) {
            e = e || window.event;
            if (e.preventDefault) {
                e.preventDefault();
            }
            return false;
        },

        /**
        *拖放结束后执行
        *@method _hasDrad
        */
        _hasDrad: function (e) {
            var dt = e.dataTransfer;
            var files = dt.files;

            this._readFiel(files);
        },

        /**
        *文件的操作
        *@method _readFiel
        *@param files{Object} 文件对象
        */
        _readFiel: function (files) {
            if (!window.FileReader) {
                L.dci.app.util.dialog.alert("温馨提示", "浏览器不支持此功能");
                return;
            }
            var _this = this;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (file.size > 512000 || file.size == 0 || file.name.slice(-3) !== 'zip') {
                    L.dci.app.util.dialog.alert("温馨提示", "不支持此类型文件或文件过大");
                    continue;
                }
                var reader = new FileReader();
                reader.onload = function (e) { file.content = this.result; _this._fileOnload(file); }
                reader.readAsArrayBuffer(file);
            }
        },

        /**
        *文件加载完毕后执行调用map的方法
        *@method _fileOnload
        *@param file{Object} 文件对象
        */
        _fileOnload: function (file) {
            var _this = this;
            var shpfile = new L.Shapefile(file.content, {});

            shpfile.once('data:loaded', function (o) {
                //data geoJOSN
                _this._geoJsonLayer(o.data);
            });

            //var map = L.DCI.App.pool.get("MultiMap").getActiveMap().getMap();
            //shpfile.addTo(map);  
        },

        /**
        *将geo转换成图层加到地图上
        *@method _geoJsonLayer
        *@param data{Object} 数据集
        */
        _geoJsonLayer: function (data) {
            var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
            var activeMap = L.DCI.App.pool.get("MultiMap").getActiveMap();
            var bound = new L.geoJson(data, {}).getBounds();

            var bounds = bound.pad(1);
            activeMap.getMap().fitBounds(bounds);

            setTimeout(function () {
                for (var i = 0; i < mapGroup.length; i++) {
                    mapGroup[i].clear();
                    mapGroup[i].getGeoJsonLayerGroup().addData(data);
                    mapGroup[i].getGeoJsonLayerGroup().setStyle({
                        color: 'red',
                        fillColor: 'red',
                        fillOpacity: 0.3
                    });
                }
            }, 500);

            if (this.performType == '边界管控') {
                this._boundaryControl(data);
            }
            
        },

        /**
        *边界管控
        *@method _boundaryControl
        *@param data{Object} 数据集
        */
        _boundaryControl: function (data) {
            var AnalysisConflict = L.dci.app.pool.get('AnalysisConflict');
            if (!AnalysisConflict) {
                AnalysisConflict = new L.DCI.AnalysisConflict();
                L.dci.app.pool.add(AnalysisConflict);
            }
            AnalysisConflict.setData(data);
        },

        /**
        *兼容事件监听
        *@method _addEventHandler
        *@param obj{Object} 对象
        *@param evt{Object} 事件
        *@param handler{Object} 事件处理函数
        */
        _addEventHandler: function (obj, evt, handler) {
            if (obj.addEventListener) {
                // W3C method
                obj.addEventListener(evt, handler, false);
            } else if (obj.attachEvent) {
                // IE method.
                obj.attachEvent('on' + evt, handler);
            } else {
                // Old school method.
                obj['on' + evt] = handler;
            }
        }
    });

    return L.DCI.loadfilesText;
});