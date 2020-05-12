/**
*工具栏控件
*@module controls
*@class DCI.Controls.Toolbar
*@extends L.Control
*/
define("controls/toolbar", [
    "leaflet",
    "core/dcins"
], function (L) {
    L.DCI.Controls.Toolbar = L.Control.extend({
        tempHtml: '<div class="row leaflet-control-toolbar">'
                    + '<div class="toggle"><img class="toggle-image" src="./themes/default/images/controls/toggle-toolbar.png"/></div>'
                    + '<div class="toolbar"><ul class="toolbar-content"></ul></div>'
                  + '</div>',

        header: null,
        body: null,
        footer: null,
        _time: null,

        initialize: function (option) {
            $(".out-container").append(this.tempHtml);
            this.elemEvent();
        },

        options: {
            position: 'topright'
        },

        onAdd: function (map) {
        },

        //添加控件
        _addTool: function (html) {
            var tool = $('<li class="tool">' + html + '</li>');
            this.body = $(".toolbar-content");
            this.body.append(tool);
        },

        onRemove: function () {
        },

        //显示面板
        _show: function () {
            this._panel.fadeIn({ easing: 'linear' });
        },

        _hide: function () {
            this._panel.fadeOut({ easing: 'linear' });
        },

        //构造面板 options header body footer _class
        _createPanel: function (options) {
            if (this._panel) this._panel.remove();
            this._panel = $('<div class = "toolpanel ' + (options._class = options._class !== undefined ? options._class : "") + '" ></div>');
            if (options.header) {
                var header = ('<div class = "header" data-info = "draggable" data-style ="move" data-parent=".toolpanel">' + options.header + '</div>');
                this._panel.append(header);
            }
            if (options.body) {
                var body = ('<div class = "content">' + options.body + '</div>');
                this._panel.append(body);
            }
            if (options.footer) {
                var footer = ('<div class = "footer">' + options.footer + '</div>');
                this._panel.append(footer);
            }
            $('body').append(this._panel);
            this._show();
        },

        //工具栏事件
        elemEvent: function () {
            var _this = this;
            this._addTool('<span class="iconfont toolA" name="图斑协调">&#xe61d;</span>');
            this._addTool('<span class="iconfont toolB" name="范围加载">&#xe616;</span></br><input data-info="范围加载" type="file" id = "fileload" class = "fileload" accept=".zip" value = "打开坐标文件" style="display:none">'); //<span class="name">范围加载</span>
            this._addTool('<span class="iconfont toolC" name="边界管控">&#xe616;</span></br><input data-info="边界管控" type="file" id = "fileload" class = "fileload" accept=".zip" value = "打开坐标文件" style="display:none">');  //<span class="name">边界管控</span>
            this._addTool('<span class="iconfont toolD" name="项目信息">&#xe61d;</span>');


            this.body.on('click', 'span', function () {
                $(this).css("opacity", "0.70").siblings().css("opacity", "0.35");
                //var text = $(this).children(".name").text();
                var text = $(this).attr("name");
                //alert(text);
                switch (text) {
                    case '图斑协调':
                        //_this._addFeatureLayer();
                        _this._differenceAnalysis()
                        break;
                    case '范围加载':
                        $(this).parent().find('input').get(0).click();
                        var files = new L.DCI.loadfilesText();
                        break;
                    case '边界管控':
                        $(this).parent().find('input').get(0).click();
                        var files = new L.DCI.loadfilesText();
                        break;
                    case '项目信息':
                        _this._projectInfo();
                        break;
                }
            });

            //显示提示
            $(".toolA").qtip({
                content: '图斑协调',
                position: {
                    my: 'center right',
                    at: 'center left',
                    target: $(".toolA")
                },
                style: {
                    width: 100,
                    height: 30,
                }
            });
            $(".toolB").qtip({
                content: '范围加载',
                position: {
                    my: 'center right',
                    at: 'center left',
                    target: $(".toolB")
                },
                style: {
                    width: 100,
                    height: 30,
                }
            });

            $(".toolC").qtip({
                content: '边界管控',
                position: {
                    my: 'center right',
                    at: 'center left',
                    target: $(".toolC")
                },
                style: {
                    width: 100,
                    height: 30,
                }
            });

            $(".toolD").qtip({
                content: '项目信息',
                position: {
                    my: 'center right',
                    at: 'center left',
                    target: $(".toolD")
                },
                style: {
                    width: 100,
                    height: 30,
                }
            });

            //高亮
            $(".toolbar > ul > li").on({
                mouseover: function () {
                    $(this).css("color", "#428bca");
                    $(this).siblings().css("color", "white");
                },
                mouseleave: function () {
                    $(".toolbar > ul > li").css("color", "white");
                }
            });

            //展开方式-点击按钮
            $(".toggle").on('click', function () {
                $(this).parent().css("right", "15px");
                $(this).children().css("display", "none");
            });

            //展开或隐藏
            $(".toolbar").on({
                mouseover: function () {
                    clearTimeout(_this._time);
                    $(this).parent().css("right", "15px");
                    $(this).siblings().children().css("display", "none");
                },
                mouseleave: function () {
                    _this._time = setTimeout(function () {
                        $(".toolbar > ul > li").css("opacity", "0.35");
                        $(".leaflet-control-toolbar").css("right", "-60px");
                        $(".leaflet-control-toolbar .toggle>img").css("display", "block");
                    }, 5000);
                }
            });


        },

        //默认添加专题图层
        //_addFeatureLayer: function(){
        //},

        //项目信息
        _projectInfo: function () {
            var map = L.DCI.App.pool.get("map");
            map.projectIdentify();
        },


        //图斑协调分析
        _differenceAnalysis: function () {
            var header = '<span class="iconfont">&#xe60a;</span>';
            var body = '<div><span class="titleName">图斑协调</span></div>'
                       + '<div>'
                       + '<span class="title">图斑面积：</span>'
                       + '<span class="dropdown">'
                       + '<input type="text" class="dropdown-toggle" data-toggle="dropdown" id="polygonArea" value="大于" style="width:80px;padding-left:20px;"/>'
                       + '<span class="caret"></span>'
                       + '<ul class="dropdown-menu polygonArea" aria-labelledby="polygonArea">'
                       + '<li><a href="#">大于</a></li>'
                       + '<li><a href="#">小于</a></li>'
                       + '<li><a href="#">介于</a></li>'
                       + '</ul>'
                       + '</span>'
                       + '<input class="txtPolygonArea" type="text" style="margin-left:10px; width:150px;"/>'
                       + '</div>'

                       + '<div>'
                       + '<span class="title">用地性质：</span>'
                       + '<span class="dropdown"><input type="text" readonly="readonly" class="dropdown-toggle" data-toggle="dropdown" id="landProperty"/><span class="caret"></span>'
                       + '<ul class="dropdown-menu landProperty" aria-labelledby="landProperty">'
                       + '<li><a href="#">建设用地</a></li>'
                       + '<li><a href="#">非建设用地</a></li>'
                       + '</ul>'
                       + '</span></div>'

                       + '<div>'
                       + '<span class="title">差异类型：</span>'
                       + '<span class="dropdown"><input type="text" readonly="readonly" class="dropdown-toggle" data-toggle="dropdown" id="differenceType"/><span class="caret"></span>'
                       + '<ul class="dropdown-menu differenceType" aria-labelledby="differenceType">'
                       + '<li><a href="#">城规建设，土规非建设</a></li>'
                       + '<li><a href="#">土规建设，城规非建设</a></li>'
                       + '</ul>'
                       + '</span></div>'

                       + '<div>'
                       + '<span class="title">经发意见：</span>'
                       + '<span class="dropdown"><input type="text" readonly="readonly" class="dropdown-toggle" data-toggle="dropdown" id="firstOpinion"/><span class="caret"></span>'
                       + '<ul class="dropdown-menu firstOpinion" aria-labelledby="firstOpinion">'
                       + '<li><a href="#">同意</a></li>'
                       + '<li><a href="#">不同意</a></li>'
                       + '</ul>'
                       + '</span></div>'

                       + '<div>'
                       + '<span class="title">规建意见：</span>'
                       + '<span class="dropdown"><input type="text" readonly="readonly" class="dropdown-toggle" data-toggle="dropdown" id="secondOpinion"/><span class="caret"></span>'
                       + '<ul class="dropdown-menu secondOpinion" aria-labelledby="secondOpinion">'
                       + '<li><a href="#">同意</a></li>'
                       + '<li><a href="#">不同意</a></li>'
                       + '</ul>'
                       + '</span></div>'

                       + '<div>'
                       + '<span class="title">国土意见：</span>'
                       + '<span class="dropdown"><input type="text" readonly="readonly" class="dropdown-toggle" data-toggle="dropdown" id="thirdOpinion"/><span class="caret"></span>'
                       + '<ul class="dropdown-menu thirdOpinion" aria-labelledby="thirdOpinion">'
                       + '<li><a href="#">同意</a></li>'
                       + '<li><a href="#">不同意</a></li>'
                       + '</ul>'
                       + '</span>'
                       + '</div>'

                       + '<div><button id ="differenceAnalysis">分析</button></div>';

            var _this = this;
            this._createPanel({ header: header, body: body, _class: 'toolAnalysis' });
            //获取下拉列表值
            $('.dropdown-menu li').on('click', { obj: this }, this.getDropdownValue);
            //关闭按钮
            $('.toolAnalysis .iconfont').on('click', { obj: this }, this.closeAnalysis);
            //分析按钮
            $('#differenceAnalysis').on('click', function () {
                $(this).css("background-color", "#008aac");
                $(".toolbar-content .tool:first-child").css("opacity", "0.35");
                var contition = $("#polygonArea").attr("value");
                var value = $(".txtPolygonArea").val();
                var options = {
                    contition: contition,
                    value: value
                }
                _this._find(options);
            });
        },

        getDropdownValue: function () {
            var text = $(this).children().text();
            $(this).parent().prev().prev().attr("value", text);
        },

        //关闭-图斑协调
        closeAnalysis: function () {
            $(this).parent().parent().remove();
            $(".toolbar-content .tool:first-child").css("opacity", "0.35");
        },

        //分析查询
        _find: function (options) {

            this._hide();

            L.dci.app.services.queryService.selectConflictPlate({
                att: '面积',
                contition: options.contition,
                value: options.value,
                context: this,
                success: function (data) {
                    var _this = this;
                    this._differenceAnalysisResult(data, _this);
                },
                error: function (ex) {
                    //console.log(ex);
                    L.dci.log.showLog(ex);
                }
            });
        },

        //差异分析结果
        _differenceAnalysisResult: function (data, _this) {
            //alert(JSON.stringify(data));
            var header = '<span style="padding-left:10px">分析结果</span><span class="close">&times;</span>';
            var strArray = [];
            strArray.push('<div>');
            strArray.push('<table class = "table table-bordered titleTable">');
            strArray.push('<thead>');
            strArray.push('<tr>');
            strArray.push('<th class="one"></th>');
            strArray.push('<th class="two">所属镇街</th>');
            strArray.push('<th class="three">城规用地性质</th>');
            strArray.push('<th class="four">土规用地性质</th>');
            strArray.push('<th class="five">差异类型</th>');
            strArray.push('<th class="six">地块面积(㎡)</th>');
            strArray.push('<th class="seven">处理原因</th>');
            strArray.push('<th class="eight">处理措施</th>');
            strArray.push('<th class="nine">经发意见</th>');
            strArray.push('<th class="ten">规建意见</th>');
            strArray.push('<th class="eleven">国土意见</th>');
            strArray.push('<th class="twelve">备注</th>');
            strArray.push('</tr>');
            strArray.push('</thead>');
            strArray.push('</table>');
            strArray.push('</div>');

            strArray.push('<div><div>');
            strArray.push('<table class = "table table-bordered table-hover dataTable">');
            strArray.push('<tbody>');
            for (var i = 0; i < data.length ; i++)          //遍历
            {
                strArray.push('<tr class="resultTr">');
                strArray.push('<td class="one"><input type="checkbox" name="checkbox" value="' + data[i].id + '"/></td>');
                strArray.push('<td class="two" title="' + data[i].street + '">' + data[i].street + '</td>');
                strArray.push('<td class="three">' + data[i].clandcode + '</td>');
                strArray.push('<td class="four">' + data[i].tlandcode + '</td>');
                strArray.push('<td class="five">' + data[i].difftype + '</td>');
                strArray.push('<td class="six">' + data[i].barea + '</td>');
                strArray.push('<td class="seven"><input type="text" style="width:100%;" readonly="readonly" value="' + data[i].dealcause + '"/></td>');
                strArray.push('<td class="eight"><input type="text" style="width:100%;" readonly="readonly" value="' + data[i].dealfun + '"/></td>');
                strArray.push('<td class="nine"><input type="text" style="width:100%;" readonly="readonly" value="' + data[i].jfadvise + '"/></td>');
                strArray.push('<td class="ten"><input type="text" style="width:100%;" readonly="readonly" value="' + data[i].gjadvise + '"/></td>');
                strArray.push('<td class="eleven"><input type="text" style="width:100%;" readonly="readonly" value="' + data[i].gtadvise + '"/></td>');
                strArray.push('<td class="twelve"><input type="text" style="width:100%;" readonly="readonly" value="' + data[i].bz + '"/></td>');
                //strArray.push('<td class="seven"><textarea readonly="readonly">' + data[i].dealcause + '</textarea></td>');
                //strArray.push('<td class="eight"><textarea readonly="readonly">' + data[i].dealfun + '</textarea></td>');
                //strArray.push('<td class="nine"><textarea readonly="readonly">' + data[i].jfadvise + '</textarea></td>');
                //strArray.push('<td class="ten"><textarea readonly="readonly">' + data[i].gjadvise + '</textarea></td>');
                //strArray.push('<td class="eleven"><textarea readonly="readonly">' + data[i].gtadvise + '</textarea></td>');
                //strArray.push('<td class="twelve"><textarea readonly="readonly">' + data[i].bz + '</textarea></td>');
                strArray.push('</tr>');
            }
            strArray.push('</tbody>');
            strArray.push('</table>');
            strArray.push('</div></div>');

            //strArray.push('</div>');
            var footer = '<button id ="saveResult">保存</button>';
            //构造面板
            this._createPanel({ header: header, body: strArray.join(' '), footer: footer, _class: 'toolAnalysisResult' });

            //更改分析结果
            this._changeAnalysisResult();
            //$("[data-toggle='tooltip']").tooltip();
            //保存
            $("#saveResult").on('click', function () {

            });

            //行高亮
            $('.resultTr').on('click', function () {
                $(this).addClass("success").siblings().removeClass("success");
                var id = $(this).children(".one").children().attr("value");
                _this._location(id);
            });

            //关闭
            $('.close').on('click', function () {
                $(this).parent().parent().remove();
            });


        },

        // 更改差异分析结果
        _changeAnalysisResult: function (options) {

            var oldDealCause = '';
            var oldDealFun = '';
            var oldJFOpinion = '';
            var oldGJOpinion = '';
            var oldGTOpinion = '';
            var oldBZ = '';

            var newDealCause = '';
            var newDealFun = '';
            var newJFOpinion = '';
            var newGJOpinion = '';
            var newGTOpinion = '';
            var newBZ = '';

            //改变选框状态
            $("input[type='checkbox']").on('click', function () {
                var result = $(this).attr("checked");
                if (result == 'checked') {
                    newDealCause = $.trim($(this).parent().siblings(".seven").children().val());
                    newDealFun = $.trim($(this).parent().siblings(".eight").children().val());
                    newJFOpinion = $.trim($(this).parent().siblings(".nine").children().val());
                    newGJOpinion = $.trim($(this).parent().siblings(".ten").children().val());
                    newGTOpinion = $.trim($(this).parent().siblings(".eleven").children().val());
                    newBZ = $.trim($(this).parent().siblings(".twelve").children().val());

                    $(this).attr("checked", "false");
                    $(this).parent().siblings().children(":textarea").removeAttr("readonly");
                }
                else {
                    $(this).attr("checked", "checked");
                    $(this).parent().parent().siblings().children('.one').children().removeAttr("checked");

                    oldDealCause = $.trim($(this).parent().siblings(".seven").children().val());
                    oldDealFun = $.trim($(this).parent().siblings(".eight").children().val());
                    oldJFOpinion = $.trim($(this).parent().siblings(".nine").children().val());
                    oldGJOpinion = $.trim($(this).parent().siblings(".ten").children().val());
                    oldGTOpinion = $.trim($(this).parent().siblings(".eleven").children().val());
                    oldBZ = $.trim($(this).parent().siblings(".twelve").children().val());

                    $(this).parent().siblings(".seven").children().removeAttr("readonly");
                    $(this).parent().siblings(".eight").children().removeAttr("readonly");
                    $(this).parent().siblings(".nine").children().removeAttr("readonly");
                    $(this).parent().siblings(".ten").children().removeAttr("readonly");
                    $(this).parent().siblings(".eleven").children().removeAttr("readonly");
                    $(this).parent().siblings(".twelve").children().removeAttr("readonly");
                }
            });
        },

        //更改差异分析
        _change: function (options) {
            L.dci.app.services.queryService.changeConflictResult({
                id: options.id,
                dataStr: options.dataStr,
                context: this,
                success: function (data) {
                    //alert(JSON.stringify(data));                  
                },
                error: function (ex) {
                    //console.log(ex);
                    L.dci.log.showLog(ex);
                }
            });
        },

        //定位
        _location: function (id) {
            //var map = L.DCI.App.pool.get("map");
            //map.getHighLightLayer().clearLayers();
            //var _map = L.DCI.App.pool.get("map").getMap();

            var map = L.DCI.App.pool.get('SplitScreen').getActiveMap();
            var _map = L.DCI.App.pool.get('SplitScreen').getActiveMap().getMap();
            map.getHighLightLayer().clearLayers();

            //var mapGroup = L.DCI.App.pool.get("SplitScreen").getMapGroup();
            //for (var q = 0; q < mapGroup.length; q++)
            //{
            //    mapGroup[q].getFeatureLayerGroup().clearLayers();
            //    mapGroup[q].getGeoJsonLayerGroup().clearLayers();
            //}

            _map.eachLayer(function(layer) {
                if (layer.options && layer.options.id != "baseLayer" && layer.options.id != null) {
                    var query = new L.esri.Tasks.Find(layer.url);
                    query.layers('0').text(id).fields("OBJECTID");
                    query.run(function(error, featureCollection, response) {
                        //这里有两种情况：一个多边形和多个多边形
                        var obj = featureCollection.features[0];
                        var layerName = response.results[0].layerName;
                        var type = obj.geometry.type;
                        var geo = '';

                        if (type == "Polygon") {
                            var rings = [];
                            for (var i = 0; i < obj.geometry.coordinates.length; i++) {
                                for (var j = 0; j < obj.geometry.coordinates[i].length; j++) {
                                    var pnt = new L.LatLng(obj.geometry.coordinates[i][j][1], obj.geometry.coordinates[i][j][0]);
                                    rings.push(pnt);
                                }
                            }

                            geo = L.polygon(rings, {
                                color: 'blue',
                                fillColor: 'Red',
                                fillOpacity: 1,
                                weight: 2
                            });
                        } else if (type == "MultiPolygon") {
                            var rings = [];

                            for (var i = 0; i < obj.geometry.coordinates.length; i++) {
                                rings[i] = [];
                                for (var j = 0; j < obj.geometry.coordinates[i][0].length; j++) {
                                    var pnt = new L.LatLng(obj.geometry.coordinates[i][0][j][1], obj.geometry.coordinates[i][0][j][0]);
                                    rings[i].push(pnt);
                                }
                            }

                            geo = L.multiPolygon(rings, {
                                color: 'blue',
                                fillColor: 'Red',
                                fillOpacity: 0.3,
                                weight: 2
                            });
                        } else {
                        }


                        map.getHighLightLayer().addLayer(geo);
                        var latlng = geo.getBounds().getCenter();
                        _map.fitBounds(geo.getBounds());
                        _map.panTo(latlng);
                        //_map.setZoom(5);
                        //闪烁处理
                        var kk = [];
                        kk.push(geo);
                        map.flicker(kk, 1);
                    });
                }
            });

        }

    });
    return L.dci.toolbar = function (options) {
        return new L.DCI.Controls.Toolbar(options);
    }
});