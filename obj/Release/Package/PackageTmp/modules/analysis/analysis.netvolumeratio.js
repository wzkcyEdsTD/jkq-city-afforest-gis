/**
*净容积率分析类
@说明：
建筑面积 = A地块用地面积 * 容积率 + B地块用地面积 * 容积率 + C地块用地面积 * 容积率 ……  (根据用户特定选择的相关地块)
地块总面积 = A地块图形面积 + B地块图形面积 + C地块图形面积 ……  （根据用户特定选择的相关地块总和）
净容积率值 = 建筑面积 / 地块总面积；
@过程:绘制范围,勾选用地类型,分析
@问题:需要注意空值的处理
*@module modules.analysis
*@class DCI.Netvolumeratio
*@constructor initialize
*@extends Class
*/
define("analysis/netvolumeratio", [
    "leaflet",
    "core/dcins",
    "query/contain"
], function (L) {
    L.DCI.Netvolumeratio = L.Class.extend({
        _this: null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            _this = this;

            //var mpgroup = L.DCI.App.pool.get("SplitScreen");
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            //var map = mpgroup.getActiveMap();
            _this._map = map;

        },
        /**
        *显示界面内部方法
        *@method _addmodal
        *@private
        */
        _addmodal: function () {
            var html =
                   '<div id="nlr_main" class="ui-widget-content">'
                 + '    <div id="nlr_title" class="nlr_title"><p>净容积率分析</p></div>'
                 + '    <span id="nlr_close" class="icon-close2"></span>'
                 + '    <div id="nlr_main_panel">'
                 + '        <span class="fxfw_title">请绘制分析范围：</span><a id="nlr_fwxz" href="#">范围选择</a>'
                 + '        <div id="nlr_parcellist">'
                 + '        </div>'
                 + '        <div class="nlr_list_control">'
                 + '            <div class="nlr_left"><input type="button" id="control_selall" value="全选" tag="085325"></div>'
                 + '            <div class="nlr_left"><input type="button" id="control_selnull" value="取消" tag="085325"></div>'
                 + '        </div>'
                 + '        <p class="nlr_zhuji">*请绘制分析范围再点确定</p>'
                 + '        <input id="nlr_queding" type="button" value="开始分析"/>'
                 + '    </div>'
                 + '    <div id="nlr_result_panel">'
                 + '        <span class="fxfw_title">分析结果：</span>'
                 + '        <div id="nlr_result">'
                 + '            <span class="fxfw_title" style="width:100px">*总建筑面积：</span><a id="nlr_r_zj" href="#">/</a><br/><br/>'
                 + '            <span class="fxfw_title" style="width:100px">*总地块面积：</span><a id="nlr_r_zd" href="#">/</a><br/><br/>'
                 + '            <span class="fxfw_title" style="width:100px">*净容积率：</span><a id="nlr_r_nlr" href="#">/</a><br/><br/>'
                 + '            <span class="fxfw_title" style="width:100px">*已忽略：</span><a id="nlr_r_ig" href="#">/</a><br/><br/>'
                 + '        </div>'
                 + '        <input id="nlr_back" type="button" value="返  回"/>'
                 + '    </div>'
                 + '</div>';

            if ($("#nlr_main").length == 0) {
                $(".out-container").append(html);
                $("#nlr_close").bind('click', function () {
                    _this._close();
                });

                $("#nlr_queding").bind('click', function () {
                    _this._doAnalysis();
                });

                $("#nlr_back").bind('click', function () {
                    _this._panelChange(0);
                });

                $("#control_selall").bind('click', function () {
                    _this._selectHandler(true);
                });
                $("#control_selnull").bind('click', function () {
                    _this._selectHandler(false);
                });

                $("#nlr_fwxz").bind('click', function () {
                    _this._drawHandler();
                });
            }
            L.dci.app.util._drag("nlr_main", "nlr_title");
            //L.dci.util._drag("nlr_main", "nlr_title");
        },

        showtips: function () {

        },
        /**
        *显示功能界面
        *@method show
        *@private
        */
        show: function () {
            this._addmodal();
            $("#nlr_main").css("height", "360px");
            _this._panelChange(0);
            _layer = _this._map.addLayer(Project_ParamConfig.netvolumeratioConfig.url, { layers: [Project_ParamConfig.netvolumeratioConfig.layerIndex] });
        },
        /**
        *切换面板内容
        * 0显示主面板 1或其它显示结果
        *@method _panelChange
        *@param tag{Number}
        *@private
        */
        _panelChange: function (tag) {
            $('#nlr_main_panel').css('display', tag == 0 ? 'block' : "none");
            $('#nlr_result_panel').css('display', tag == 0 ? 'none' : "block");
        },
        /**
        *关闭功能界面
        *@method _close
        *@private
        */
        _close: function () {
            if (_this._map && _layer) {
                _this._map.map.removeLayer(_layer);
                _this._map.clear();
            }
            var obj = document.getElementById("nlr_main");  //解决浏览器兼容问题
            obj.parentNode.removeChild(obj);
        },
        /**
        *开始分析
        *@method _doAnalysis
        *@private
        */
        _doAnalysis: function () {

            //清空
            $("nlr_r_zj").html("/");
            $("nlr_r_zd").html("/");
            $("nlr_r_nlr").html("/");
            $("nlr_r_ig").html("/");

            //获取选择的记录,开始分析
            if (_this.fw_data && _this._data.length > 0) {
                $('.nlr_zhuji').css('display', 'none');

                //得到选择的用地性质分类
                var typeList = [];
                $('#nlr_parcellist').find('input').each(function () {
                    var a = $(this).attr("data");
                    if ($(this).is(':checked')) {
                        typeList.push($(this).attr("data"));
                    }
                });

                var char_replace = Project_ParamConfig.netvolumeratioConfig.charHandler_R;
                var char_split = Project_ParamConfig.netvolumeratioConfig.charHandler_S;

                var dataList_ignore = [];//数据有错误的忽略记录列表
                var count_jzmj = 0;
                var count_shapearea = 0;
                var count_ig_dkmj = 0;
                var tmp_dkmj = 0, tmp_rjl = 0, tmparea = 0;
                for (var i = 0; i < _this._data.length; i++) {
                    if ($.inArray(_this._data[i]["YDXZ"], typeList) >= 0) {
                        try {
                            tmp_dkmj = parseFloat(_this._data[i]["DKMJ"]);

                            //处理字段
                            tmp_rjl = (_this._data[i]["RJL"]);
                            if (char_replace) {
                                tmp_rjl = tmp_rjl.replace(eval(char_replace), "");
                            }
                            if (char_split) {
                                tmp_rjl = tmp_rjl.split(eval(char_split))[0];
                            }
                            tmp_rjl = parseFloat(tmp_rjl);
                            if (isNaN(tmp_rjl)) {
                                throw "NaN";
                            }
                            tmparea = parseFloat(_this._data[i]["AREA"]);
                        }
                        catch (e) {
                            if (!isNaN(parseFloat(_this._data[i]["DKMJ"])))
                                count_ig_dkmj += parseFloat(_this._data[i]["DKMJ"]);
                            dataList_ignore.push(_this._data[i]);
                            continue;
                        }
                        count_jzmj += (tmp_dkmj * tmp_rjl);
                        count_shapearea += tmparea;
                    }
                }
                _this._panelChange(1);

                $("#nlr_r_zj").html(count_jzmj.toFixed(2) + " " + "㎡");
                $("#nlr_r_zd").html(count_shapearea.toFixed(2) + " " + "㎡");
                $("#nlr_r_nlr").html((count_jzmj / count_shapearea).toFixed(2));
                $("#nlr_r_ig").html("地块个数：" + dataList_ignore.length + "，地块总面积：" + count_ig_dkmj.toFixed(2) + " " + "㎡");
            }
            else {
                $('.nlr_zhuji').css('display', 'block');
            }
        },
        /**
        *绘制分析范围
        *@method _drawHandler
        *@private
        */
        _drawHandler: function () {
            //范围选择
            var containquery = new L.DCI.Contain(L.bind(_this._draw_callback, this));
            $(".query-choose-contain").css("display", "block");
            if (L.dci.app.pool.has("querycontain") == false) {
                L.dci.app.pool.add(containquery);
            }
            else {
                L.dci.app.pool.remove("querycontain");
                L.dci.app.pool.add(containquery);
            }
            $("#nlr_main").css("display", "none");
        },
        /**
        *绘制完成回调函数
        *@method _draw_callback
        *@param data{Object}
        *@private
        */
        _draw_callback: function (data) {
            _this.fw_data = data;

            var fea = _this.fw_data.query_geo.toGeoJSON();

            if (fea.geometry.type != "Polygon") {
                L.dci.util.dialog.alert("* 图形类型错误,只支持面类型查询");
                return;
            }

            //坐标转换,默认拾取的是4326
            var rings = [];
            var region = null;
            $.each(fea.geometry.coordinates[0], L.bind(function (i, item) {
                var point = _this._map.map.options.crs.projection.project(L.latLng(item[1], item[0]));
                rings.push('[' + point.x + ',' + point.y + ']');
            }, this));
            var region = '{rings:[[' + rings.join(',') + ']]}';

            $("#nlr_main").css("display", "block");
            //进行查询
            _this._doQuery(region);
        },
        /**
        *绘制完成开始按范围查询
        *@method _doQuery
        *@param region{Object}
        *@private
        */
        _doQuery: function (region) {
            var params = {
                geometry: region,
                inSR: "",
                outSR: "",
                spatialRel: "esriSpatialRelIntersects",
                outFields: "*",
                orderByFields: "",
                returnGeometry: "true",
                geometryType: "esriGeometryPolygon",
                f: "json"
            };
            var kgurl = Project_ParamConfig.netvolumeratioConfig.url + "/" + Project_ParamConfig.netvolumeratioConfig.layerIndex + "/query";
            $.ajax({//跨域调用
                async: false,
                url: kgurl,
                data: params,
                type: "GET",
                dataType: 'jsonp',
                timeout: 5000,
                success: function (json) {
                    _this._data = [];
                    for (var i = 0; i < json.features.length; i++) {
                        var tmp = {};
                        for (var p in Project_ParamConfig.netvolumeratioConfig.fieldConfig) {
                            tmp[p] = json.features[i].attributes[Project_ParamConfig.netvolumeratioConfig.fieldConfig[p]];
                        }
                        _this._data.push(tmp);
                    }
                    _this._initData(_this._data);
                },
                error: function (er) {
                    L.dci.util.dialog.error("错误提示", "调用服务错误");
                }
            });
        },
        /**
        *地块类型列表选择控制
        *@method _selectHandler
        *@param flag{Boolean}
        *@private
        */
        _selectHandler: function (flag) {
            //选择控制
            $('#nlr_parcellist').find('input').each(function () {
                $(this).attr("checked", flag);
            });

            $("div#nlr_parcellist .icheckbox_flat-red").each(function () {
                if (flag) {
                    $(this).addClass("checked");
                }
                else {
                    $(this).removeClass("checked");
                }
            });
        },
        /**
        *查询结果填充数据到列表
        *@method _initData
        *@param data{Array}
        *@private
        */
        _initData: function (data) {

            var result = {};
            for (var i = 0; i < data.length; i++) {
                if (!result[data[i]["YDXZ"]]) {
                    result[data[i]["YDXZ"]] = 1;
                } else {
                    result[data[i]["YDXZ"]] += 1;
                }
            }

            if (data && data.length > 0) {
                var _html = '';

                for (var p in result) {
                    _html = _html + '<div class="nlr_progressobj"><div class="nlr_list_1 choose-attribute-checkbox"><input type="checkbox" data="' + p + '"></div><span title="' +
                        p + '" class="nlt_list_title">' +
                        p + '</span><div class="nlr_statebarSmallDiv"><div class="nlr_statebar" style="width: 100%;">&nbsp;</div></div><span class="fcount">' +
                        result[p] + ' 个地块</span></div>';
                }

                $('#nlr_parcellist').append(_html);
                $("#nlr_parcellist").mCustomScrollbar({
                    theme: "minimal-dark"
                });
                $('#nlr_parcellist').find('input').each(function () {
                    $(this).iCheck({
                        checkboxClass: 'icheckbox_flat-red',
                    });
                });
            }
        }
    });
    return L.DCI.Netvolumeratio;
});