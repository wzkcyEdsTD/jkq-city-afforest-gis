/**
*冲突分析结果
*@module modules.analysis
*@class DCI.AnalysisConflict
*@constructor initialize
*@extends Class
*/
define("analysis/conflict", [
    "leaflet",
    "core/dcins"
], function (L) {
    L.DCI.AnalysisConflict = L.Class.extend({
        /**
        *类ID
        *@property id
        *@type {String}
        */
        id: null,
        /**
        *结果面板
        *@property body
        *@type {Object}
        */
        body: null,
        /**
        *Title
        *@property header
        *@type {Object}
        */
        header: null,
        /**
        *内容面板
        *@property resultHtml
        *@type {Object}
        */
        resultHtml: null,
        /**
        *底部html
        *@property footer
        *@type {Object}
        */
        footer: null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this.id = 'AnalysisConflict';
            this._creatBody();
            $("#analysisConflict").addClass("analysisConflict-position");
        },
        /**
        *构造结果面板
        *@method _creatBody
        *@private
        */
        _creatBody: function () {
            this.body = $('<div id = "analysisConflict" class = "analysisConflict"></div>');
            this.header = $('<header class = "title" data-info = "draggable" data-style ="move" data-parent="#analysisConflict"></header>');
            this.close = $('<span class ="icon-close1"></span>');
            var ul = $('<ul><li>总规</li><li>控规</li><li>土规</li><li>环保规划</li><li>林业规划</li><li>多规融合</li></ul>');
            this.resultHtml = $('<div></div>');
            this.footer = $('<footer><button type="button">生成报告</button></footer>');
            this.header.append(this.close);
            this.body.append([this.header, ul, this.resultHtml, this.footer]);
            this._addEvend();
            $('#centerpanel').append(this.body);
        },
        /**
        *传递数据
        *@method setData
        *@param data {Object}
        */
        setData: function (data) {
            if (!this.body || !data) return;
            this.projectType = 0;
            this._projecGeo(data);
        },
        /**
        *投影转换
        *@method _projecGeo
        *@param geoJson {Object}
        *@private
        */
        _projecGeo: function (geoJson) {

            var activeMap = L.DCI.App.pool.get("MultiMap").getActiveMap();
            var data = geoJson;
            var rings = "";

            rings += "{\"rings\":[[";
            var map = activeMap.getMap();
            for (var i = 0; i < data.features[0].geometry.coordinates[0].length; i++) {
                rings += "[";
                var pnt = map.options.crs.projection.project(L.latLng(data.features[0].geometry.coordinates[0][i][1], data.features[0].geometry.coordinates[0][i][0]));
                rings += pnt.x + "," + pnt.y;
                rings += "],";
            }
            rings = rings.substring(0, rings.length - 1);
            rings += "]]}";

            this._serveices(rings);
        },
        /**
        *请求冲突分析服务
        *@method _serveices
        *@param rings {Array}
        *@private
        */
        _serveices: function (rings) {
            L.dci.app.services.analysisService.conflictAnalysis({
                layerName: escape('边界管控分区'),
                fieldname: 'NAME',
                polygon: rings,
                projectType: this.projectType,
                context: this,

                success: function (res) {
                    if (res.succeed == true) {
                        this._setData(res);
                    }
                    if (res.error != undefined) {
                        console.log(res.error);
                    }
                },
                error: function (ex) {
                    console.log(ex);
                }
            });
        },
        /**
        *初步数据处理
        *@method _serveices
        *@param data {Object}
        *@private
        */
        _setData: function (data) {
            this.data = null;
            this.data = data;
            this._setResultContent(this.data);
            this._setGeo(this.data);
        },
        /**
        *设置结果内容
        *@method _setResultContent
        *@private
        */
        _setResultContent: function (data) {
            this.clear();
            this.table = $('<table class = "table table-bordered table-hover"></table>');
            this.resultHtml.append(this.table);
            this._setResultTable();
            this._showBody();
        },
        /**
        *结果表格
        *@method _setResultTable
        *@private
        */
        _setResultTable: function (layer) {
            var strArray = [];
            if (this.table) this.table.html('');

            var data = this.data;
            var pRelationship = [
                                    ["全部落在一类区", "部分落在一类区", "未落入一类区", "全部落在二类区", "部分落在二类区","未落入二类区", "侵占限建区", "没有侵占限建区"],
                                    ["侵占一类区", "没有侵占一类区", "侵占二类区", "没有侵占二类区", "全落在限建区", "部分落在限建区", "未落入限建区"],
                                    ["侵占禁建区", "没有侵占禁建区"]
            ]

            var suggestions = ["符合", "不符合"];
            var projectType = this.projectType;

            var tableNun = [];
            if (projectType) { tableNun = ['2', '3', '1', '4'] } else { tableNun = ['1', '2', '3', '4'] }

            var area = { one: 0, tow: 0, limit: 0, ban: 0 };
            for (var i = 0; i < data.proportions.length; i++) {
                switch (data.proportions[i].fieldValue) {
                    case '一类建设控制区':
                        area.one = data.proportions[i].area.toFixed(2);
                        break;
                    case '二类建设控制区':
                        area.tow = data.proportions[i].area.toFixed(2);
                        break;
                    case '限制建设区':
                        area.limit = data.proportions[i].area.toFixed(2);
                        break;
                    case '禁止建设区':
                        area.ban = data.proportions[i].area.toFixed(2);
                        break;

                }
            }
            var Area = area.tow + area.limit + area.ban;
            this._area = Area;

            //根据面积判断
            var conflict = {};
            if (!projectType) {
                conflict.a = area.one == Area ? 0 : area.one !== 0 ? 1 : 2;
                conflict.b = area.tow == Area ? 3 : area.tow !== 0 ? 4 : 5;
                conflict.l = area.limit == 0 ? 7 : 6;
                conflict.ban = area.ban == 0 ? 1 : 0;
            } else {
                conflict.a = area.one == 0 ? 1 : 0;
                conflict.b = area.tow == 0 ? 3 : 2;
                conflict.l = area.limit == Area ? 4 : area.limit !== 0 ? 5 : 6;
                conflict.ban = area.ban == 0 ? 1 : 0;
            }

            strArray.push('<thead>');
            strArray.push('<tr><th>序号</th><th>控制线名称</th><th>位置关系</th><th>面积</th><th>检测结果及建议</th></tr>');
            strArray.push('</thead>');
            strArray.push('<tbody>');

            strArray.push('<tr class ="">');
            strArray.push('<td>' + tableNun[0] + '</td>');
            strArray.push('<td>一类建设控制区</td>');
            strArray.push('<td>' + (projectType ? (pRelationship[1][conflict.a]) : (pRelationship[0][conflict.a])) + '</td>');
            strArray.push('<td>' + area.one + '</td>');
            strArray.push('<td>' + (projectType ? (suggestions[area.one == 0 ? "0" : "1"]) : (suggestions[area.one == Area ? "0" : "1"])) + '</td>');
            strArray.push('</tr>');

            strArray.push('<tr>');
            strArray.push('<td>' + tableNun[1] + '</td>');
            strArray.push('<td>二类建设控制区</td>');
            strArray.push('<td>' + (projectType ? (pRelationship[1][conflict.b]) : (pRelationship[0][conflict.b])) + '</td>');
            strArray.push('<td>' + area.tow + '</td>');
            strArray.push('<td>' + (projectType ? (suggestions[area.tow == 0 ? "0" : "1"]) : (suggestions[area.tow == Area ? "0" : "1"])) + '</td>');
            strArray.push('</tr>');

            strArray.push('<tr class ="linitzone">');
            strArray.push('<td>' + tableNun[2] + '</td>');
            strArray.push('<td>限制建设区</td>');
            strArray.push('<td>' + (projectType ? (pRelationship[1][conflict.l]) : (pRelationship[0][conflict.l])) + '</td>');
            strArray.push('<td>' + area.limit + '</td>');
            strArray.push('<td>' + (projectType ? (suggestions[area.limit == Area ? "0" : "1"]) : (suggestions[area.limit == 0 ? "0" : "1"])) + '</td>');
            strArray.push('</tr>');

            strArray.push('<tr>');
            strArray.push('<td>' + tableNun[3] + '</td>');
            strArray.push('<td>禁止建设区</td>');
            strArray.push('<td>' + pRelationship[2][conflict.ban] + '</td>');
            strArray.push('<td>' + area.ban + '</td>');
            strArray.push('<td>' + suggestions[area.ban == 0 ? "0" : "1"] + '</td>');
            strArray.push('</tr>');

            strArray.push('</tbody>');

            this.table.html(strArray.join(' '));
            if (projectType) { this.table.prepend($('.linitzone')) }
        },
        /**
        *添加图层
        *@method _setGeo
        *@param data {Object}
        *@private
        */
        _setGeo: function (data) {
            var features = data.features;
            var rings = [];
            var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
            for (var q = 0; q < mapGroup.length; q++) {
                mapGroup[q].getFeatureLayerGroup().clearLayers();
                mapGroup[q].getGeoJsonLayerGroup().clearLayers();
            }

            var map = L.DCI.App.pool.get("map");

            //判断项目类型
            //this.projectType = typeof (data.conclusion.breakAZone) == "undefined" ? 0 : 1;

            var colors = { 一类建设控制区: '#e69800', 二类建设控制区: '#a900e6', 限制建设区: '#005ce6', 禁止建设区: '#ff0000' }

            for (var i = 0; i < features.length; i++) {
                rings = [];

                //for (var p = 0, m = features[i].geometry.rings.length; p < m; p++) {

                //    for (var j = 0; j < features[i].geometry.rings[p].length; j++) {
                //        var pnt = map.options.crs.projection.unproject(L.point(features[i].geometry.rings[p][j]));
                //        rings.push(pnt);
                //    }
                //}

                for (var j = 0; j < features[i].geometry.rings[0].length; j++) {
                    var pnt = map.options.crs.projection.unproject(L.point(features[i].geometry.rings[0][j]));
                    rings.push(pnt);
                }

                var color = colors[features[i].attributes.NAME];

                for (var k = 0; k < mapGroup.length; k++) {
                    var geo = null;
                    geo = L.polygon(rings, {
                        name: features[i].attributes.NAME,
                        color: color,
                        fillColor: color,
                        fillOpacity: 1,
                        weight: 2
                    });
                    mapGroup[k].getFeatureLayerGroup().addLayer(geo);
                }
            }
        },
        /**
        *清除结果内容
        *@method clear
        */
        clear: function () {
            if (this.resultHtml) this.resultHtml.html('');
        },
        /**
        *移除面板
        *@method _remove
        *@private
        */
        _remove: function () {
            this.body.remove();
            this.body = null;
        },
        /**
        *隐藏面板
        *@method _hiddenBody
        *@private
        */
        _hiddenBody: function () {
            //easing 方法被插件重写，刚好少了默认的方法: swing{ easing: 'swing' }
            this.body.fadeOut({ easing: 'linear' });
        },
        /**
        *显示面板
        *@method _showBody
        *@private
        */
        _showBody: function () {
            if (this.body.css('display') !== 'none') return;
            this.body.fadeIn({ easing: 'linear' });
        },
        /**
        *添加或隐藏图层
        *@method _addLayer
        *@param id {String} 
        *@param dom {Object}
        *@param _elem {Object}
        *@private
        */
        _addLayer: function (id, dom, _elem) {

            var leftPanel = L.DCI.App.pool.get("leftPanel");
            var layer = leftPanel.hasLayer(id);
            if (dom.length !== 0) {
                dom[0].click();
                if (!layer) { $(_elem).addClass('active'); } else { $(_elem).removeClass('active'); }
                return;
            }

            if (layer) {
                leftPanel.layerRemove(id);
                $(_elem).removeClass('active');
            } else {
                leftPanel.layerAdd(id);
                $(_elem).addClass('active');
            }
        },
        /**
        *闪烁处理
        *@method _flicker
        *@param layerName {String} 
        *@private
        */
        _flicker: function (layerName) {
            var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
            var layers = null;

            for (var i = 0; i < mapGroup.length; i++) {
                var layer = mapGroup[0]._featureLayerGroup.getLayers();
                layers = mapGroup[i].getLayerByName(layerName);
                if (layerName == "二类建设控制区") {
                    var _layer = mapGroup[i].getLayerByName("一类建设控制区");
                    var layers = layers.concat(_layer);
                    _layer = null;
                }
                mapGroup[i].flicker(layers, 1);
            }
        },
        /**
        *显示弹框
        *@method _showDialog 
        *@private
        */
        _showDialog: function () {
            var liAc = this.table.find('.success');
            liAc.removeClass('success');

            var strArray = [];
            strArray.push('<ul class="list-group">');
            strArray.push('<li class="list-group-item">一、项目信息</li>');

            strArray.push('<li class="list-group-item">');
            strArray.push('<table class="table table-bordered" style="text-align:center">');
            strArray.push('<tbody >');
            strArray.push('<tr>');
            strArray.push('<td>检测编号</td>');
            strArray.push('<td>GA（20131208）28号</td>');
            strArray.push('</tr>');
            strArray.push('<tr>');
            strArray.push('<td>项目名称</td>');
            strArray.push('<td>贵安马场项目</td>');
            strArray.push('</tr>');
            strArray.push('<tr>');
            strArray.push('<td>项目性质</td>');
            strArray.push('<td>城镇建设项目</td>');
            strArray.push('</tr>');
            strArray.push('<tr>');
            strArray.push('<td>项目范围（平方米）</td>');
            strArray.push('<td>' + this._area+ 'M<sup>2</sup></td>');
            strArray.push('</tr>');
            strArray.push('</tbody>');
            strArray.push('</table>');
            strArray.push('</li>');

            strArray.push('<li class="list-group-item">二、检查详情及附图</li>');

            strArray.push('<li class="list-group-item">');
            strArray.push('<table class="table table-bordered" style="text-align:center">')
            strArray.push(this.table.html());
            strArray.push('</table>');
            strArray.push('</li>');
            strArray.push('<li class="list-group-item">三、检查结论</li>');
            strArray.push('<li class="list-group-item">该项目范围突破一类建设控制区、二类建设控制区管控要求，侵占限制控制区，不符合管控要求，请另行选址或向有关部门提出控制区调整申请。</li>');
            strArray.push('</ul>');

            var title = '贵安马场项目城乡空间管控结果',
                content = strArray.join(' '),
                footer = '<button class ="btn">保存</button>'
            var dialog = this._dialog(title, content, footer);

            dialog.modal({
                show: true,
                backdrop: 'static'
            });
        },

        /**
        *弹框
        *@method _dialog
        *@param title {String} 
        *@param content {Object}
        *@param footer {Object}
        *@private
        */
        _dialog: function (title, content, footer) {
            var dialog = $('<div class="modal fade dialog" id="myModal" tabindex="-1" aria-hidden="true" style="z-index:2100;"></div>');

            var strArray = [];
            strArray.push('<div class="modal-dialog" style="width:800px">');
            strArray.push('<div class="modal-content" style="border-radius: 0 0;">');

            //标题
            strArray.push('<div class="modal-header">');
            strArray.push('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>');
            strArray.push('<h4 class="modal-title">' + title + '</h4>');
            strArray.push('</div>');

            //文本内容
            strArray.push('<div class="modal-body">');
            strArray.push(content);
            strArray.push('</div>');

            //脚部
            if (footer) {
                strArray.push('<div class="modal-footer">');
                strArray.push(footer)
                strArray.push('</div>');
            }

            strArray.push('</div>');
            strArray.push('</div>')

            var str = strArray.join(' ');
            dialog.html(str);

            $('body').append(dialog);
            dialog.one('hidden.bs.modal', function () {
                $(this).remove();
            });
            return dialog;
        },

        /**
        *添加事件
        *@method _addEvend
        *@private
        */
        _addEvend: function () {
            var _this = this;

            this.footer.on('click', 'button', function () {
                //myWindow = window.open();
                _this._showDialog();
            });

            //添加图层
            this.body.on('click', 'li', function () {
                //if ($(this).hasClass('active')) return;
                //_this.body.find('.active').removeClass('active');
                //$(this).addClass('active');

                var text = $(this).text();
                var dom = null;
                var id = null;
                switch (text) {
                    case '总规':
                        dom = $('#layer-dom-126');
                        id = 126;
                        break;
                    case '控规':
                        dom = $('#layer-dom-130');
                        id = 130;
                        break;
                    case '土规':
                        dom = $('#layer-dom-136');
                        id = 136;
                        break;
                    case '环保规划':
                        dom = $('#layer-dom-138');
                        id = 138;
                        break;
                    case '林业规划':
                        dom = $('#layer-dom-140');
                        id = 140;
                        break;
                    case '多规融合':
                        dom = $('layer-dom-262');
                        id = 262;
                        break;
                }
                _this._addLayer(id, dom, this);
            });

            this.resultHtml.on('click', 'tbody tr', function () {
                _this.resultHtml.find('.success').removeClass('success');
                $(this).addClass('success');
                var layerName = $(this).find('td:nth-child(2)').text();
                _this._flicker(layerName);
            });


            //拖拽结束后执行
            this.body.on('fy.draggable.end', function () {
                var offset = _this.body.offset();
                var body = $('body');
                var height = parseInt(body.outerHeight());
                //var _height = parseInt(_this.body.outerHeight())
                var width = parseInt(body.outerWidth());
                var _width = parseInt(_this.body.outerWidth());

                if (offset.top < 55) _this.body.css('top', 55);
                if (offset.top > (height - 55)) _this.body.css('top', (height - 55));
                if (offset.left < 180) _this.body.css('left', 180);
                if (offset.left > (width - _width)) _this.body.css('left', width - _width);
                
                });

            this.close.on('click', function () {
                //_this._hiddenBody();
                _this._remove();
            });
        }
    });

    return L.DCI.AnalysisConflict;
});