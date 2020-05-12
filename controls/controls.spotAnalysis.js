/*
* 图斑协调类
*/
define("controls/spotanalysis", ["leaflet"], function (L) {
    L.DCI.SpotAnalysis = L.Class.extend({
        id: "spotanalysis",
        header: null,
        body: null,
        footer: null,

        tempHtml: '<div class="toolpanel toolAnalysis" style="display: block; top: 133px; left: 878px;">'
                    + '<div class = "header" data-info = "draggable" data-style ="move" data-parent=".toolpanel"><span class="iconfont">&#xe615;</span></div>'
                    + '<div class="content">'
                        + '<div><span class="titleName">图斑协调</span></div>'
                    + '</div>'
                + '</div>',

        initialize: function () {
            
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
            this._panel = $('<div class = "toolpanel ' + (options._class = options._class !== undefined ? options._class : "") + '"></div>');
            if (options.header)
            {
                var header = ('<div class = "header" data-info = "draggable" data-style ="move" data-parent=".toolpanel">' + options.header + '</div>');
                this._panel.append(header);
            }
            if (options.body)
            {
                var body = ('<div class = "content">' + options.body + '</div>');
                this._panel.append(body);
            }
            if (options.footer)
            {
                var footer = ('<div class = "footer">' + options.footer + '</div>');
                this._panel.append(footer);
            }
            $('body').append(this._panel);
            this._show();
        },


        //图斑协调分析
        _differenceAnalysis: function () {
            var header = '<span class="icon-close1"></span>';
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
            $('.toolAnalysis .icon-close1').on('click', { obj: this }, this.closeAnalysis);
            //分析按钮
            $('#differenceAnalysis').on('click', function () {
                $(this).css("background-color", "#008aac");
                var contition = $("#polygonArea").attr("value");
                var value = $(".txtPolygonArea").val();
                var options = {
                    contition: contition,
                    value: value
                }
                _this._find(options);
            });
        },


        //获取下拉菜单值
        getDropdownValue: function () {
            var text = $(this).children().text();
            $(this).parent().prev().prev().attr("value", text);
        },

        //关闭-图斑协调
        closeAnalysis: function () {
            $(this).parent().parent().remove();
        },

        //分析查询
        _find: function (options) {

            this._hide();

            L.DCI.Services.queryService.selectConflictPlate({
                att: '面积',
                contition: options.contition,
                value: options.value,
                context: this,
                success: function (data) {
                    var _this = this;
                    this._differenceAnalysisResult(data, _this);
                },
                error: function (ex) {
                    console.log(ex);
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
                strArray.push('</tr>');
            }
            strArray.push('</tbody>');
            strArray.push('</table>');
            strArray.push('</div></div>');
            var footer = '<button id ="saveResult">保存</button>';
            //构造面板
            this._createPanel({ header: header, body: strArray.join(' '), footer: footer, _class: 'toolAnalysisResult' });

            //更改分析结果
            this._changeAnalysisResult();
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
                if (result == 'checked')
                {
                    newDealCause = $.trim($(this).parent().siblings(".seven").children().val());
                    newDealFun = $.trim($(this).parent().siblings(".eight").children().val());
                    newJFOpinion = $.trim($(this).parent().siblings(".nine").children().val());
                    newGJOpinion = $.trim($(this).parent().siblings(".ten").children().val());
                    newGTOpinion = $.trim($(this).parent().siblings(".eleven").children().val());
                    newBZ = $.trim($(this).parent().siblings(".twelve").children().val());

                    $(this).attr("checked", "false");
                    $(this).parent().siblings().children(":textarea").removeAttr("readonly");
                }
                else
                {
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
            L.DCI.Services.queryService.changeConflictResult({
                id: options.id,
                dataStr: options.dataStr,
                context: this,
                success: function (data) {
                    //alert(JSON.stringify(data));                  
                },
                error: function (ex) {
                    console.log(ex);
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

            _map.eachLayer(function (layer) {
                if (layer.options && layer.options.id != "baseLayer" && layer.options.id != null)
                {
                    var query = new L.esri.Tasks.Find(layer.url);
                    query.layers('0').text(id).fields("OBJECTID");
                    query.run(function (error, featureCollection, response) {
                        //这里有两种情况：一个多边形和多个多边形
                        var obj = featureCollection.features[0];
                        var layerName = response.results[0].layerName;
                        var type = obj.geometry.type;
                        var geo = '';

                        if (type == "Polygon")
                        {
                            var rings = [];
                            for (var i = 0; i < obj.geometry.coordinates.length; i++)
                            {
                                for (var j = 0; j < obj.geometry.coordinates[i].length; j++)
                                {
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
                        }
                        else if (type == "MultiPolygon")
                        {
                            var rings = [];

                            for (var i = 0; i < obj.geometry.coordinates.length; i++)
                            {
                                rings[i] = [];
                                for (var j = 0; j < obj.geometry.coordinates[i][0].length; j++)
                                {
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
                        }
                        else
                        {
                        }


                        //var obj = response.results[0];
                        //var length = obj.geometry.rings[0].length;
                        //var rings = [];
                        //for (var i = 0; i < obj.geometry.rings[0].length; i++)
                        //{
                        //    var pnt = new L.LatLng(obj.geometry.rings[0][i][1], obj.geometry.rings[0][i][0]);
                        //    rings.push(pnt);
                        //}
                        //var geo = L.polygon(rings, {
                        //    color: 'yellow',
                        //    opacity: 0.3,
                        //    fillColor: 'Red',
                        //    fillOpacity: 1,
                        //    weight: 2
                        //});



                        //var obj = response.features[0];                      
                        //var len = obj.geometry.rings.length;                        
                        //var length = response.features[0].geometry.rings[0].length;                       
                        //for (var i = 0; i < length; i++)
                        //{                            
                        //    rings.push(obj.geometry.rings[0][i]);
                        //}
                        //for (var i = 0; i < obj.geometry.rings[0].length; i++)
                        //{
                        //    var pnt = L.latLng(obj.geometry.rings[0][i][0], obj.geometry.rings[0][i][1]);
                        //    rings.push(pnt);
                        //}                       
                        //for (var i = 0; i < obj.geometry.rings[0].length; i++)
                        //{
                        //    var pnt = map.options.crs.projection.project(L.latLng(obj.geometry.rings[0][i]));
                        //    rings.push(pnt);
                        //}                       
                        //_map.addLayer(geo);
                        //_map.fitBounds(geo.getBounds());
                        //map.getHighLightLayer().addLayer(geo);
                        //var latlng = geo.getBounds().getCenter();
                        //_map.fitBounds(geo.getBounds());
                        //_map.setView(latlng);

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
            })
        },


    });

    return L.DCI.SpotAnalysis;
});