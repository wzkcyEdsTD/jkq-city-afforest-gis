define("organization/query", [
    "leaflet",
    "data/ajax",
    "plugins/scrollbar"
], function (L) {
    L.DCI.organization = L.Class.extend({
        id: 'organizationquery',
        _results: [],    //结果集
        _results_name: [],  //结果对应的地块名
        _rightpanel: null,
        details_num: 0,
        details_lenght: 0,
        _this_: null,
        detailsHtmlTemplet: '<div class="business-project-details-container">'

                          + '</div>',
        detailshtml: '<div class="business-project-details-content">'
            + '<div id="business-project-details-content-container">'
                                   + '<p style="margin-left:20px;font-weight:bold;font-size: 14px;">项目信息</p>'
                                   + '<a class="check-more-details">查看业务信息</a>'
                                   + '<table class="table-s" style="margin-top:10px">'
                                   + '</table>'
                               + '</div>'
                               + '<div id="business-project-details-quota-container">'
                                   + '<p style="margin-left:20px;font-weight:bold;font-size: 14px;">主要指标</p>'
                                   + '<p style="margin-left:20px;margin-top:10px">'
                                       + '<span class="proj-rarrow" >选址</span>'
                                       + '<span class="proj-rarrow selected">用地</span>'
                                       + '<span class="proj-rarrow" >工程</span>'
                                       + '<span class="proj-rarrow">验收</span>'
                                    + '</p>'
                                   + '<table class="table-s" style="margin-top:10px">'
                                       + '<thead>'
                                           + '<tr><td class="key">指标项</td><td class="key-value">指标值</td></tr>'
                                       + '</thead>'
                                       + '<tbody></tbody>'
                                   + '</table>'
                               + '</div>'
	                           + '</div>',

        /*项目地块查询初始化*/
        initialize: function () {
            //this.id = 'businessquery';
        },


        kgfind: function () {
            var _map = L.DCI.App.pool.get("map");
            var map = _map.getMap();
            this._dciAjax = new L.DCI.Ajax();
            this._rightpanel = new L.DCI.Layout.RightPanel();
            var thtml = '<div class="result-business-contain">'
		    + '<table>'
            + '<tr>'
            + '<td id="ghcg" class="result-business-contain-td-selected">规划成果</td>'
            + '<td id="ghss">规划实施</td>'
            + '</tr>'
            + '</table>'
            + '<div class="result-contain-query">'
             + '</div>'
                + '</div>'
            $(".result-list-group").append(thtml);
            var lhtml = '<div class="result-zg">'
				   + '<div class="title-contain"><p class="titlename">总体规划：</p></div>'
				   + '<p class="title-cgmc">成果名称：</p><div class="result-cgmc result-cgmc-zg "></div>'
				   + '<p class="title-spsj">审批时间：</p><div class="result-spsj result-spsj-zg"></div>'
				+ '</div>'
					 + '<div class="result-fg">'
				   + '<div class="title-contain"><p class="titlename">分区规划：</p></div>'
				   + '<p class="title-cgmc">成果名称：</p><div class="result-cgmc result-cgmc-fg"></div>'
				   + '<p class="title-spsj">审批时间：</p><div class="result-spsj result-spsj-fg"></div>'
				+ '</div>'
				+ '<div class="result-kg">'
		        + '<div class="title-contain"><p class="titlename">控制性详细规划：</p></div>'
				   + '<p class="title-cgmc">成果名称：</p><div class="result-cgmc result-cgmc-kg"></div>'
				   + '<p class="title-spsj">审批时间：</p><div class="result-spsj result-spsj-kg"></div>'
                + '</div>'
            $(".result-contain-query").append(lhtml);
            $(".result-list-group").append(this.detailsHtmlTemplet);
            $(".business-project-details-container").append(this.detailshtml);
            $(".business-project-details-container").css('display', 'none');
            $("#ghss").bind('click', function () {
                $("#ghcg").removeClass('result-business-contain-td-selected');
                $("#ghss").addClass('result-business-contain-td-selected');
                $(".result-contain-query-xq").css('display', 'none');
                $(".result-contain-query").css('display', 'none');
                $(".business-project-details-container").css('display', 'block');
            })
            $("#ghcg").bind('click', function () {
                $("#ghss").removeClass('result-business-contain-td-selected');
                $("#ghcg").addClass('result-business-contain-td-selected');
                $(".result-contain-query-xq").css('display', 'none');
                $(".result-contain-query").css('display', 'block');
                $(".business-project-details-container").css('display', 'none');
            })
            _map.activate(L.DCI.Map.StatusType.SELECT, this._callback, this.precall, this);

        },

        _callback: function (evt) {

            var _map = L.DCI.App.pool.get("map");
            var map = _map.getMap();
            var url = Project_ParamConfig.themLayers[4].url;
            var num_zg = 0;
            var num_fg = 0;
            var _this = this;
            _this._rightpanel.show();
            _map.activate(L.DCI.Map.StatusType.SELECT, null, this.precall, this);      //丢失焦点
            L.esri.Tasks.identifyFeatures(url)
            .on(map)
            .at(evt.latlng)
            .tolerance(0)
            .layers('visible:14')
            .run(function (error, featureCollection, response) {
                if (response.results.length > 0) {
                    //_this._results = _this._results.concat(response.results);
                    var geoArr = [];
                    $(".result-cgmc-zg").html(response.results[0].attributes.规划成果名称);
                    $(".result-spsj-zg").html(response.results[0].attributes.审批时间);
                    var a = 80;
                    $(".dikuai-zg").remove();
                    num_zg = response.results.length;
                    _this._results.length = 0;
                    _this._results_name.length = 0;

                    for (var i = 1; i < response.results.length + 1; i++) {
                        var result = response.results[i - 1];
                        _this._results.push(result);
                        var j = _this._results.length;
                        var htmll = '<div class="dikuai-zg dikuai-konggui" style="top:' + a + 'px"><a id=dikuai-' + j + ' class="dikuai-name" style="position: absolute;">地块' + i + '</a><span id=location-' + j + ' class="icon-location dikuai-icon"></span></div>';
                        a = a + 40;

                        _this._results_name.push("总体规划——地块" + i);

                        $(".result-zg").append(htmll);
                        var str = "dikuai-" + j;
                        var str1 = "location-" + j;
                        var num = j;
                        $("#" + str).bind('click', function () {
                            var id = this.id.split('-')[1];
                            _this.queryxq(result, id, _this);
                        });
                        $("#" + str1).bind('click', function () {
                            _this.choosecolor(this, _this);
                            _map.getHighLightLayer().clearLayers();
                            L.dci.util.highLight(_map, result, true, true);
                        });
                    }
                    _this.queryfg(url, evt, map, num_zg, _this);

                }
                else {
                    $(".dikuai-zg").remove();
                }
            });
        },

        /*查询项目编号*/
        queryprojectID: function (url, evt, map, _this) {
            $(".business-project-details-container").empty();
            L.esri.Tasks.identifyFeatures(url)
             .on(map)
             .at(evt.latlng)
             .tolerance(0)
             .layers('visible:2')
             .run(function (error, featureCollection, response) {
                 var bq = L.DCI.App.pool.get("organizationquery");
                 bq.details_num = 0;
                 bq._this_ = _this;
                 bq.details_lenght = response.results.length;
                 if (response.results.length > 0) {
                     for (var i = 0; i < response.results.length; i++) {
                         $(".business-project-details-container").append(_this.detailshtml);
                         _this._requestProjectDetails(response.results[i].attributes["项目编号"], _this);
                     }
                 }
                 else {

                     // $(".business-project-details-container").empty();
                 }
             });
        },

        /*查询地块详情*/
        queryxq: function (result, num, _this) {
            var _this = _this;
            $(".result-contain-query").css('display', 'none');
            $(".result-contain-query-xq").remove();
            var ihtml = '<div class="result-contain-query-xq"></div>'
            $(".result-list-group").append(ihtml);
            var html1 = '<div class="xq_lie_q">'
                + '<div class="back-contain"><span class="iconfont result-back">&#xe617;</span>'
            var html4 = '<p id=title-xq-' + num + ' class="result-title-zg"></p></div>'
           + '<table class="table-s">';
            var html2 = '</table></div>';
            var html3 = "";
            var result_l = L.dci.util.queryFilter(_this._results[num - 1].attributes);
            for (var att in result_l) {
                html3 += '<tr><td class="key">' + result_l[att].name + '</td><td class="key-value">' + L.dci.util.isNull(result_l[att].value) + '</td></tr>'
            }
            var ilhtml = html1 + html4 + html3 + html2;
            $(".result-contain-query-xq").append(ilhtml);
            if (_this._results[num - 1].layerId == 10) {
                $(".xq_lie_q").css("height", "690px");
            }
            for (var i = 0; i < _this._results.length; i++) {
                if (i != num - 1) {
                    var j = i + 1;
                    var html1_s = '<div class="xq_lie">'
                + '<div class="back-contain"><span class="iconfont result-back">&#xe617;</span>'
                    var html4_s = '<p id=title-xq-' + j + ' class="result-title-zg"></p></div>' + '<table class="table-s">';
                    var html3_s = "";
                    var result_l_s = L.dci.util.queryFilter(_this._results[i].attributes);
                    for (var att in result_l_s) {
                        html3_s += '<tr><td class="key">' + result_l_s[att].name + '</td><td class="key-value">' + L.dci.util.isNull(result_l_s[att].value) + '</td></tr>'
                    }
                    var ilhtml_s = html1_s + html4_s + html3_s + html2;

                    $(".result-contain-query-xq").append(ilhtml_s);
                    // $(".result-title-zg").html(_this._results_name[i]);
                }
            }
            for (var i = 1; i < _this._results.length + 1; i++) {
                $("#title-xq-" + i).html(_this._results_name[i - 1]);
            }

            $(".result-back").bind('click', function () {
                $(".result-contain-query-xq").css('display', 'none');
                $(".result-contain-query").css('display', 'block');
            })
        },

        showtable: function (atr) {

        },

        /*查询控制详情规划*/
        querykg: function (url, evt, map, num_fg, num_zg, _this) {
            var _this = _this;
            // _this._results = [];
            var _map = L.DCI.App.pool.get("map");

            L.esri.Tasks.identifyFeatures(url)
             .on(map)
             .at(evt.latlng)
             .tolerance(0)
             .layers('visible:10')
             .run(function (error, featureCollection, response) {
                 if (response.results.length > 0) {
                     //  _this._results = _this._results.concat(response.results);

                     var geoArr = [];
                     $(".result-cgmc-kg").html(response.results[0].attributes.规划成果名称);
                     $(".result-spsj-kg").html(response.results[0].attributes.审批时间);
                     var a = 80;
                     $(".dikuai-kg").remove();
                     var kg_top = num_fg * 40 + 160 + num_zg * 40;
                     $(".result-kg").css('top', kg_top + "px");
                     for (var i = 1; i < response.results.length + 1; i++) {
                         var result = response.results[i - 1];
                         _this._results.push(result);
                         var j = _this._results.length;
                         _this._results_name.push("控制性详细规划——" + response.results[i - 1].attributes.用地性质);
                         var htmll = '<div class="dikuai-kg dikuai-konggui" style="top:' + a + 'px"><a id=dikuai-' + j + ' class="dikuai-name" style="position: absolute;">' + response.results[i - 1].attributes.用地性质 + '</a><span id=location-' + j + ' class="icon-location dikuai-icon"></span></div>';
                         a = a + 40;
                         $(".result-kg").append(htmll);
                         var str = "dikuai-" + j;
                         var str1 = "location-" + j;
                         var num = j;
                         $("#" + str).bind('click', function () {
                             var id = this.id.split('-')[1];
                             _this.queryxq(result, id, _this);
                         });
                         $("#" + str1).bind('click', function () {
                             _this.choosecolor(this, _this);
                             _map.getHighLightLayer().clearLayers();
                             L.dci.util.highLight(_map, result, true, true);
                         });
                     }
                     var feature = response.results[0];
                     //var map_s = L.DCI.App.pool.get('SplitScreen').getActiveMap();
                     _map.getHighLightLayer().clearLayers();
                     L.dci.util.highLight(_map, feature, true, true);
                     _this.queryprojectID(url, evt, map, _this);
                 }
                 else {
                     $(".dikuai-kg").remove();
                 }
             });
        },

        /*查询分区规划*/
        queryfg: function (url, evt, map, num_zg, _this) {
            var _this = _this;
            //_this._results = [];
            var _map = L.DCI.App.pool.get("map");
            L.esri.Tasks.identifyFeatures(url)
             .on(map)
             .at(evt.latlng)
             .tolerance(0)
             .layers('visible:12')
             .run(function (error, featureCollection, response) {
                 if (response.results.length > 0) {
                     // _this._results = _this._results.concat(response.results);
                     var geoArr = [];
                     $(".result-cgmc-fg").html(response.results[0].attributes.规划成果名称);
                     $(".result-spsj-fg").html(response.results[0].attributes.审批时间);
                     var a = 80;
                     $(".dikuai-fg").remove();
                     num_fg = response.results.length;
                     var fg_top = num_zg * 40 + 80;
                     $(".result-fg").css('top', fg_top + "px");
                     for (var i = 1; i < response.results.length + 1; i++) {
                         var result = response.results[i - 1];
                         _this._results.push(result);
                         var j = _this._results.length;
                         _this._results_name.push("分区规划——地块" + i);
                         var htmll = '<div class="dikuai-fg dikuai-konggui" style="top:' + a + 'px"><a id=dikuai-' + j + ' class="dikuai-name" style="position: absolute;">地块' + i + '</a><span id=location-' + j + ' class="icon-location dikuai-icon"></span></div>';
                         a = a + 40;
                         $(".result-fg").append(htmll);
                         var str = "dikuai-" + j;
                         var str1 = "location-" + j;
                         var num = j;
                         $("#" + str).bind('click', function () {
                             var id = this.id.split('-')[1];
                             _this.queryxq(result, id, _this);
                         });

                         $("#" + str1).bind('click', function () {
                             _this.choosecolor(this, _this);
                             _map.getHighLightLayer().clearLayers();
                             L.dci.util.highLight(_map, result, true, true);
                         });
                     }
                     _this.querykg(url, evt, map, num_fg, num_zg, _this);
                 }
                 else {
                     $(".dikuai-fg").remove();
                 }
             });
        },

        /*从判断定位图标颜色*/
        choosecolor: function (this_, _this) {
            var _this = _this;
            var this_ = this_;
            for (var i = 1; i < _this._results.length + 1; i++) {
                $("#location-" + i).css('color', "#d2d2d2");
            }
            this_.style.color = "#ff3c00";
        },

        precall: function () {

        },
        /*从服务器获取项目详情*/
        _requestProjectDetails: function (key, _this) {
            key = "056389";
            //_this.details_num = _num;
            var url = Base_ParamConfig.defaultCoreServiceUrl + "/searchservices/project/" + key;
            _this._dciAjax.get(url, null, true, _this, _this._fillProjectDetails, function () {
                alert("获取项目详情发生错误");
            });
        },


        /*填充项目信息表*/
        _fillProjectDetails: function (data) {
            var bq = L.DCI.App.pool.get("organizationquery");

            var contentTable = $('.business-project-details-container').find("#business-project-details-content-container table")[bq.details_num];
            //指标表
            var contentP = $('.business-project-details-container').find("#business-project-details-content-container p")[bq.details_num];
            var quotaTable = $('.business-project-details-container').find("#business-project-details-quota-container tbody")[bq.details_num];
            bq.details_num = bq.details_num + 1;
            $(contentP).text("项目" + bq.details_num + "：" + data.title);
            var projectFieldSet = data.project.comment;
            var projectData = data.project.data;
            var indicartorFieldSet = data.indicator.comment;
            var indicartorData = data.indicator.data;
            var projectHtml = "";
            var indicartorHtml = "";
            if (projectData != null) {
                //var _projectHtml
                for (var i = 0; i < projectFieldSet.length; i++) {
                    var field = projectFieldSet[i].COLUMN_NAME;
                    var alias = projectFieldSet[i].COMMENTS;
                    var value = projectData[field];
                    if (value != null && value.length > 0) {
                        projectHtml = projectHtml + '<tr><td class="key">'
                        projectHtml = projectHtml + alias + '</td><td class="key-value">';
                        projectHtml = projectHtml + value + '</td></tr>';
                    }
                }
                $(contentTable).html(projectHtml);
            }

            if (indicartorData != null) {
                for (var i = 0; i < indicartorFieldSet.length; i++) {
                    var field = indicartorFieldSet[i].COLUMN_NAME;
                    var alias = indicartorFieldSet[i].COMMENTS;
                    var value = indicartorData[field];
                    if (value != null && value.length > 0) {
                        indicartorHtml = indicartorHtml + '<tr><td class="key">'
                        indicartorHtml = indicartorHtml + alias + '</td><td class="key-value">';
                        indicartorHtml = indicartorHtml + value + '</td><tr>';
                    }
                }
                $(quotaTable).html(indicartorHtml);
            }

            if (bq.details_num == bq.details_lenght) {                                   //处理完所有数据再获取焦点
                var _map = L.DCI.App.pool.get("map");
                _map.activate(L.DCI.Map.StatusType.SELECT, bq._this_._callback, bq._this_.precall, bq._this_);
            }
        },

    });
    return L.DCI.AddCad;

});