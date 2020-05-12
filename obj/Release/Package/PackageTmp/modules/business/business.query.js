define("business/query", [
    "leaflet",
    "data/ajax",
    "plugins/scrollbar"
], function (L) {

    L.DCI.businessquery = L.Class.extend({
        id: 'businessquery',
        _results: [],    //结果集
        _results_name: [],  //结果对应的地块名
        _rightpanel: null,
        _details_num: 0,

        _details_lenght: 0,
        _this_: null,
        _data:[],
        _detailsHtmlTemplet: '<div class="business-project-details-container">'

                          + '</div>',
        _detailshtml: '<div class="business-project-details-content">'
            + '<div id="business-project-details-content-container">'
                                   + '<p style="margin-left:20px;font-weight:bold;font-size: 14px;">项目信息</p>'
                                   + '<a class="check-more-details">查看业务信息</a>'
                                   + '<table class="table-s" style="margin-top:10px">'
                                   + '</table>'
                               + '</div>'
                               + '<div id="business-project-details-quota-container">'
                                   + '<p style="margin-left:20px;font-weight:bold;font-size: 14px;">主要指标</p>'
                                   + '<p style="margin-left:-4px;margin-top:10px">'
                                       //+ '<span class="proj-rarrow" >选址</span>'
                                       //+ '<span class="proj-rarrow selected">用地</span>'
                                       //+ '<span class="proj-rarrow" >工程</span>'
                                       //+ '<span class="proj-rarrow">验收</span>'
                                    + '</p>'
                                   + '<table class="table-s" style="margin-top:10px">'
                                       + '<thead>'
                                           + '<tr><td class="key">指标项</td><td class="key-value">指标值</td></tr>'
                                       + '</thead>'
                                       + '<tbody></tbody>'
                                   + '</table>'
                               + '</div>'
	                           + '</div>',

        projPeriods: {
            0: { 'name': '全部阶段', 'acronym': '全部' },
            1: { 'name': '规划选址阶段', 'acronym': '选址' },
            2: { 'name': '土地出让阶段', 'acronym': '出让' },
            3: { 'name': '建设用地阶段', 'acronym': '用地' },
            4: { 'name': '建设工程阶段', 'acronym': '工程' },
            5: { 'name': '批后跟踪阶段', 'acronym': '跟踪' },
            6: { 'name': '规划核实阶段', 'acronym': '核实' },
        },

        /*下拉选择项数据*/
        filterDropSet: {
            1: { 'name': 'ITEMNAME', 'alias': '项目名称' },
            2: { 'name': 'ITEMID', 'alias': '项目编号' },
            3: { 'name': 'UNITNAME', 'alias': '单位名称' },
            4: { 'name': 'ITEMADD', 'alias': '单位地址' }
        },

        /*项目地块查询初始化*/
        initialize: function () {
            //this.id = 'businessquery';        
        },

        _kgfind: function () {
            var _map = L.DCI.App.pool.get("map");
            var map = _map.getMap();
            this._dciAjax = new L.DCI.Ajax();
            //this._rightpanel = new L.DCI.Layout.RightPanel();
            _map.getHighLightLayer().clearLayers();
            var thtml = '<div class="result-business-contain">'
		                + '<table>'
                            + '<tr>'
                                + '<td id="ghcg" class="result-business-contain-td-selected">规划成果</td><td id="ghss">规划实施</td>'
                            + '</tr>'
                        + '</table>'
                        + '<div class="result-business-contain-content">'
                            +'<div class="result-contain-query"></div>'
                        + '</div>'
                      + '</div>';
            // $(".result-list-group").append(thtml);
            L.DCI.App.pool.get("rightPanel").clear(0);
            L.DCI.App.pool.get("rightPanel").load(thtml,'地块分析',0);
            var lhtml = '<div class="result-zg">'
                    + '<div class="title-contain"><p class="titlename">总体规划：</p></div>'
                    + '<div><span class="title-cgmc">成果名称：</span><span class="result-cgmc result-cgmc-zg "></span></div>'
                    + '<div><span class="title-spsj">审批时间：</span><span class="result-spsj result-spsj-zg"></span></div>'
                 + '</div>'
                      + '<div class="result-fg" style="margin-top:22px">'
                    + '<div class="title-contain"><p class="titlename">分区规划：</p></div>'
                    + '<div><span class="title-cgmc">成果名称：</span><span class="result-cgmc result-cgmc-fg "></span></div>'
                    + '<div><span class="title-spsj">审批时间：</span><span class="result-spsj result-spsj-fg"></span></div>'
                 + '</div>'
                 + '<div class="result-kg" style="margin-top:22px">'
                 + '<div class="title-contain"><p class="titlename">控制性详细规划：</p></div>'
                    + '<div><span class="title-cgmc">成果名称：</span><span class="result-cgmc result-cgmc-kg "></span></div>'
                    + '<div><span class="title-spsj">审批时间：</span><span class="result-spsj result-spsj-kg"></span></div>'
                 + '</div>'
            $(".result-contain-query").append(lhtml);
            //$(".result-list-group").append(this._detailsHtmlTemplet);
            $(".result-business-contain-content").append(this._detailsHtmlTemplet);
            $(".business-project-details-container").append(this._detailshtml);
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
            _map.activate(L.DCI.Map.StatusType.SELECT, this._bcallback, this.precall, this);

        },

        _bcallback: function (evt) {

            var _map = L.DCI.App.pool.get("map");
            var map = _map.getMap();
            var layers = _map._getBusinessQueryLayer();
            var url = layers[0].url;
            var num_zg = 0;
            var num_fg = 0;
            var _this = this;
            _map.activate(L.DCI.Map.StatusType.SELECT, null, this.precall, this);      //丢失焦点
            L.esri.Tasks.identifyFeatures(url)
            .on(map)
            .at(evt.latlng)
            .tolerance(0)
            .layers(Project_ParamConfig.layernum.zg)
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
                        var htmll = '<div class="dikuai-zg dikuai-konggui" style="top:' + a + 'px"><a id=dikuai-' + j + ' class="dikuai-name" >地块' + i + '</a><span id=location-' + j + ' class="icon-location dikuai-icon"></span></div>';
                        a = a + 40;

                        _this._results_name.push("总体规划——地块" + i);

                        $(".result-zg").append(htmll);
                        var str = "dikuai-" + j;
                        var str1 = "location-" + j;
                        var num = j;
                        $("#" + str).bind('click', function () {
                            var id = this.id.split('-')[1];
                            _this._queryxq(result, id, _this);
                        });
                        $("#" + str1).bind('click', function () {
                            _this._choosecolor(this, _this);
                            _map.getHighLightLayer().clearLayers();
                            L.dci.app.util.highLight(_map, result, true, true);
                        });
                    }
                    _this._queryfg(url, evt, map, num_zg, _this);

                }
                else {
                    _map.activate(L.DCI.Map.StatusType.SELECT, _this._bcallback, _this.precall, _this);
                    $(".dikuai-zg").remove();
                }
            });
        },

        /*查询项目编号*/
        _queryprojectID: function (url, evt, map, _this) {
            $(".business-project-details-container").empty();
            var _map = L.DCI.App.pool.get("map");
            L.esri.Tasks.identifyFeatures(url)
             .on(map)
             .at(evt.latlng)
             .tolerance(0)
             .layers(Project_ParamConfig.layernum.xm)
             .run(function (error, featureCollection, response) {
                 //var a = [];                        //测试数据
                 //a.push('084478', '084478', '084478');
                 var bq = L.DCI.App.pool.get("businessquery");
                 bq._details_num = 0;
                 bq._this_ = _this;
                 bq._details_lenght = response.results.length;
                 if (response.results.length > 0) {
                     _this._data = [];
                     $(".business-project-details-container").append(_this._detailshtml);
                     for (var i = 0; i < response.results.length; i++) {
                         _this._requestProjectDetails(response.results[i].attributes.案件编号, _this);
                         _map.getHighLightLayer().clearLayers();
                         L.dci.app.util.highLight(_map, response.results[0], true, false);
                     }
                 }
                 else {
                     $(".business-project-details-container").html('<p  style="font-size: 14px;margin-top: 200px;margin-left: 160px;">暂时没有数据</p>');
                     _map.activate(L.DCI.Map.StatusType.SELECT, _this._bcallback, _this.precall, _this);
                     // $(".business-project-details-container").empty();
                 }
             });
        },

        /*查询地块详情*/
        _queryxq: function (result, num, _this) {
            var _this = _this;
            $(".result-contain-query").css('display', 'none');
            $(".result-contain-query-xq").remove();
            var ihtml = '<div class="result-contain-query-xq"></div>';
            //$("[.result-list-group][index ='0'] ").append(ihtml);
            $("#right-panel-body ").append(ihtml);
            var html1 = '<div class="xq_lie_q">'
                + '<div class="back-contain"><span class="icon-return result-back"></span>'
            var html4 = '<p id=title-xq-' + num + ' class="result-title-zg"></p></div>'
           + '<table class="table-s">';
            var html2 = '</table></div>';
            var html3 = "";
            var result_l = L.dci.app.util.queryFilter(_this._results[num - 1].attributes);
            for (var att in result_l) {
                html3 += '<tr><td class="key">' + result_l[att].name + '</td><td class="key-value">' + L.dci.app.util.isNull(result_l[att].value) + '</td></tr>'
            }
            var ilhtml = html1 + html4 + html3 + html2;
            $(".result-contain-query-xq").append(ilhtml);
            for (var i = 0; i < _this._results.length; i++) {
                if (i != num - 1) {
                    var j = i + 1;
                    var html1_s = '<div class="xq_lie">'
                + '<div class="back-contain"><span class="icon-return result-back"></span>'
                    var html4_s = '<p id=title-xq-' + j + ' class="result-title-zg"></p></div>' + '<table class="table-s">';
                    var html3_s = "";
                    var result_l_s = L.dci.app.util.queryFilter(_this._results[i].attributes);
                    for (var att in result_l_s) {
                        html3_s += '<tr><td class="key">' + result_l_s[att].name + '</td><td class="key-value">' + L.dci.app.util.isNull(result_l_s[att].value) + '</td></tr>'
                    }
                    var ilhtml_s = html1_s + html4_s + html3_s + html2;

                    $(".result-contain-query-xq").append(ilhtml_s);
                    // $(".result-title-zg").html(_this._results_name[i]);
                }
            }
            for (var i = 1; i < _this._results.length + 1; i++) {
                $("#title-xq-" + i).html(_this._results_name[i - 1]);
            }

            //滚动条
            $(".result-contain-query-xq").mCustomScrollbar({
                theme: "minimal-dark"
            });

            $(".result-back").bind('click', function () {
                $(".result-contain-query-xq").css('display', 'none');
                $(".result-contain-query").css('display', 'block');
            })
        },

        showtable: function (atr) {

        },

        /*查询控制详情规划*/
        _querykg: function (url, evt, map, num_fg, num_zg, _this) {
            var _this = _this;
            // _this._results = [];
            var _map = L.DCI.App.pool.get("map");

            L.esri.Tasks.identifyFeatures(url)
             .on(map)
             .at(evt.latlng)
             .tolerance(0)
             .layers(Project_ParamConfig.layernum.kg)
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
                         var htmll = '<div class="dikuai-kg dikuai-konggui" style="top:' + a + 'px"><a id=dikuai-' + j + ' class="dikuai-name">' + response.results[i - 1].attributes.用地性质 + '</a><span id=location-' + j + ' class="icon-location dikuai-icon"></span></div>';
                         a = a + 40;
                         $(".result-kg").append(htmll);
                         var str = "dikuai-" + j;
                         var str1 = "location-" + j;
                         var num = j;
                         $("#" + str).bind('click', function () {
                             var id = this.id.split('-')[1];
                             _this._queryxq(result, id, _this);
                         });
                         $("#" + str1).bind('click', function () {
                             _this._choosecolor(this, _this);
                             _map.getHighLightLayer().clearLayers();
                             L.dci.app.util.highLight(_map, result, true, true);
                         });
                     }
                     var feature = response.results[0];
                     //var map_s = L.DCI.App.pool.get('MultiMap').getActiveMap();
                     //_map.getHighLightLayer().clearLayers();
                     //L.dci.app.util.highLight(_map, feature, true, true);
                     _this._queryprojectID(url, evt, map, _this);
                     L.DCI.App.pool.get("rightPanel").show();
                 }
                 else {
                     _map.activate(L.DCI.Map.StatusType.SELECT, _this._bcallback, _this.precall, _this);
                     $(".dikuai-kg").remove();
                 }
             });
        },

        /*查询分区规划*/
        _queryfg: function (url, evt, map, num_zg, _this) {
            var _this = _this;
            //_this._results = [];
            var _map = L.DCI.App.pool.get("map");
            L.esri.Tasks.identifyFeatures(url)
             .on(map)
             .at(evt.latlng)
             .tolerance(0)
             .layers(Project_ParamConfig.layernum.fg)
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
                         var htmll = '<div class="dikuai-fg dikuai-konggui" style="top:' + a + 'px"><a id=dikuai-' + j + ' class="dikuai-name">地块' + i + '</a><span id=location-' + j + ' class="icon-location dikuai-icon"></span></div>';
                         a = a + 40;
                         $(".result-fg").append(htmll);
                         var str = "dikuai-" + j;
                         var str1 = "location-" + j;
                         var num = j;
                         $("#" + str).bind('click', function () {
                             var id = this.id.split('-')[1];
                             _this._queryxq(result, id, _this);
                         });

                         $("#" + str1).bind('click', function () {
                             _this._choosecolor(this, _this);
                             _map.getHighLightLayer().clearLayers();
                             L.dci.app.util.highLight(_map, result, true, true);
                         });
                     }
                     _this._querykg(url, evt, map, num_fg, num_zg, _this);
                 }
                 else {
                     _map.activate(L.DCI.Map.StatusType.SELECT, _this._bcallback, _this.precall, _this);
                     $(".dikuai-fg").remove();
                 }
             });
        },

        /*从判断定位图标颜色*/
        _choosecolor: function (this_, _this) {
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
            //key = "056389";
            //_this.details_num = _num;
            var url = Project_ParamConfig.defaultCoreServiceUrl + "/searchservices/project/" + key;
            _this._dciAjax.get(url, null, true, _this, _this._fillProjectDetails, function () {
                L.dci.app.util.dialog.alert("获取项目详情发生错误");
                var _map = L.DCI.App.pool.get("map");
                _map.activate(L.DCI.Map.StatusType.SELECT, _this._bcallback, _this.precall, _this);
            });
        },

        /*填充项目信息表*/
        _fillProjectDetails: function (data) {
            try{
                var bq = L.DCI.App.pool.get("businessquery");
                bq._data.push(data);
                var contentTable = $('.business-project-details-container').find("#business-project-details-content-container table")[0];
                //指标表
                var contentP = $('.business-project-details-container').find("#business-project-details-content-container p")[0];
                var quotaTable = $('.business-project-details-container').find("#business-project-details-quota-container tbody")[0];
                bq._details_num = bq._details_num + 1;
                $(contentP).text("项目" + "：" + data.project.data.ITEMNAME);
                var projectFieldSet = data.project.comment;
                var projectData = data.project.data;
                var projPeriods = data.phase;
                //var _projPeriods = bq._data.phase;
                var indicartorFieldSet = data.indicator.comment;
                var indicartorData = data.indicator.data;
                var projectHtml = "";
                var indicartorHtml = "";
                if (projectData != null) {
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

                // $(bq._detailsPanel).find('.proj-rarrow.selected').removeClass('selected');
                if (bq._details_num == bq._details_lenght) {
                    var periodsHTML = '';
                    for (var k in bq.projPeriods) {
                        if ((k == 0) ||
                            (k == 1 && projPeriods == bq.projPeriods[2].name) ||
                            (k == 2 && projPeriods != bq.projPeriods[2].name))
                            continue;

                        var period = bq.projPeriods[k];
                        var label = period.acronym;
                        var title = period.name;
                        periodsHTML = periodsHTML + '<span class="proj-rarrow" value="' + k + '" title="' + title + '">' + label + '</span>';
                    }

                    var pPeriods = $('.business-project-details-container').find("#business-project-details-quota-container p")[1];
                    $(pPeriods).html(periodsHTML);
                    for (var i = 0; i < bq._details_lenght; i++) {
                        var selector = '.proj-rarrow[value=' + bq._data[i].phase + ']';
                        $(selector).addClass('dq-selected shubiao-selected');
                        $(selector).bind('click', function () {                        
                            if (bq._data != null) {                          
                                for (var i = 0; i < bq._details_lenght; i++) {
                                    if (bq._data[i].phase == $(this).attr('value')) {
                                        var _selector = '.proj-rarrow[value=' + bq._data[i].phase + ']';
                                        // $(_selector).css('background-color', '#ffe68c');
                                        $(_selector).removeClass('dq-selected');
                                        $(_selector).addClass('selected');
                                        indicartorHtml = '';
                                        for (var j = 0; j < bq._data[i].indicator.comment.length; j++) {
                                            var field = bq._data[i].indicator.comment[j].COLUMN_NAME;
                                            var alias = bq._data[i].indicator.comment[j].COMMENTS;
                                            var value = bq._data[i].indicator.data[field];
                                            if (value != null && value.length > 0) {
                                                indicartorHtml = indicartorHtml + '<tr><td class="key">'
                                                indicartorHtml = indicartorHtml + alias + '</td><td class="key-value">';
                                                indicartorHtml = indicartorHtml + value + '</td><tr>';
                                            }
                                        }
                                    }
                                    else {
                                    
                                        var _selector = '.proj-rarrow[value=' + bq._data[i].phase + ']';
                                        //$(_selector).css('background-color', '#ffb400');
                                        $(_selector).removeClass('selected');
                                        $(_selector).addClass('dq-selected');
                                    }
                                }
                                $(quotaTable).html(indicartorHtml);
                            }
                        });

                    }
                    var selector = '.proj-rarrow[value=' + bq._data[0].phase + ']';
                    $(selector).trigger("click");                            
                }
                //滚动条
                //$(".business-project-details-container").mCustomScrollbar({
                //    theme: "minimal-dark"
                //});
                if (bq._details_num == bq._details_lenght) {                                   //处理完所有数据再获取焦点
                    var _map = L.DCI.App.pool.get("map");
                    _map.activate(L.DCI.Map.StatusType.SELECT, bq._this_._bcallback, bq._this_.precall, bq._this_);
                }
            }
            catch (e) {
                var bq = L.DCI.App.pool.get("businessquery");
                $(".business-project-details-container").html('<p  style="font-size: 14px;margin-top: 200px;margin-left: 160px;">暂时没有数据</p>');
                var _map = L.DCI.App.pool.get("map");
                _map.activate(L.DCI.Map.StatusType.SELECT, bq._this_._bcallback, bq._this_.precall, bq._this_);
            }
        },



        /*查询总体规划--项目一张图模块中调用*/
        zgqueryfromProject: function (options) {
            var _map = options.map;
            var map = _map.getMap();
            var layers = _map._getBusinessQueryLayer();
            var url = layers[0].url;
            var latlng = options.latlng;
            var num_zg = 0;
            var num_fg = 0;
            var _this = this;

            L.esri.Tasks.identifyFeatures(url)
            .on(map)
            .at(latlng)
            .tolerance(0)
            .layers(Project_ParamConfig.layernum.zg)
            .run(function (error, featureCollection, response) {
                if (response.results.length > 0)
                {
                    var geoArr = [];
                    $(".result-cgmc-zg").html(response.results[0].attributes.规划成果名称);
                    $(".result-spsj-zg").html(response.results[0].attributes.审批时间);
                    var a = 80;
                    $(".dikuai-zg").remove();
                    num_zg = response.results.length;
                    _this._results.length = 0;
                    _this._results_name.length = 0;

                    for (var i = 1; i < response.results.length + 1; i++)
                    {
                        var result = response.results[i - 1];
                        _this._results.push(result);
                        var j = _this._results.length;
                        var htmll = '<div class="dikuai-zg dikuai-konggui" style="top:' + a + 'px"><a id=dikuai-' + j + ' class="dikuai-name" >地块' + i + '</a><span id=location-' + j + ' class="icon-location dikuai-icon"></span></div>';
                        a = a + 40;

                        _this._results_name.push("总体规划——地块" + i);

                        $(".result-zg").append(htmll);
                        var str = "dikuai-" + j;
                        var str1 = "location-" + j;
                        var num = j;
                        $("#" + str).bind('click', function () {
                            var id = this.id.split('-')[1];
                            _this._queryxq(result, id, _this);
                        });
                        $("#" + str1).bind('click', function () {
                            _this._choosecolor(this, _this);
                            _map.getHighLightLayer().clearLayers();
                            L.dci.app.util.highLight(_map, result, true, true);
                        });
                    }
                    _this.fgqueryfromProject(url, latlng, map, num_zg, _this);
                }
                else
                {
                    $(".dikuai-zg").remove();
                }
            });
        },

        /*查询分区规划--zgqueryfromProject方法调用*/
        fgqueryfromProject: function (url, latlng, map, num_zg, _this) {

            L.esri.Tasks.identifyFeatures(url)
             .on(map)
             .at(latlng)
             .tolerance(0)
             .layers(Project_ParamConfig.layernum.fg)
             .run(function (error, featureCollection, response) {
                 if (response.results.length > 0)
                 {
                     var geoArr = [];
                     $(".result-cgmc-fg").html(response.results[0].attributes.规划成果名称);
                     $(".result-spsj-fg").html(response.results[0].attributes.审批时间);
                     var a = 80;
                     $(".dikuai-fg").remove();
                     num_fg = response.results.length;
                     var fg_top = num_zg * 40 + 80;
                     $(".result-fg").css('top', fg_top + "px");
                     for (var i = 1; i < response.results.length + 1; i++)
                     {
                         var result = response.results[i - 1];
                         _this._results.push(result);
                         var j = _this._results.length;
                         _this._results_name.push("分区规划——地块" + i);
                         var htmll = '<div class="dikuai-fg dikuai-konggui" style="top:' + a + 'px"><a id=dikuai-' + j + ' class="dikuai-name">地块' + i + '</a><span id=location-' + j + ' class="icon-location dikuai-icon"></span></div>';
                         a = a + 40;
                         $(".result-fg").append(htmll);
                         var str = "dikuai-" + j;
                         var str1 = "location-" + j;
                         var num = j;
                         $("#" + str).bind('click', function () {
                             var id = this.id.split('-')[1];
                             _this._queryxq(result, id, _this);
                         });

                         $("#" + str1).bind('click', function () {
                             _this._choosecolor(this, _this);
                             _map.getHighLightLayer().clearLayers();
                             L.dci.app.util.highLight(_map, result, true, true);
                         });
                     }
                     _this.kgqueryfromProject(url, latlng, map, num_fg, num_zg, _this);
                 }
                 else
                 {
                     $(".dikuai-fg").remove();
                 }
             });
        },

        /*查询控制性详细规划--fgqueryfromProject方法调用*/
        kgqueryfromProject: function (url, latlng, map, num_fg, num_zg, _this) {
            L.esri.Tasks.identifyFeatures(url)
             .on(map)
             .at(latlng)
             .tolerance(0)
             .layers(Project_ParamConfig.layernum.kg)
             .run(function (error, featureCollection, response) {
                 if (response.results.length > 0)
                 {
                     var geoArr = [];
                     $(".result-cgmc-kg").html(response.results[0].attributes.规划成果名称);
                     $(".result-spsj-kg").html(response.results[0].attributes.审批时间);
                     var a = 80;
                     $(".dikuai-kg").remove();
                     var kg_top = num_fg * 40 + 160 + num_zg * 40;
                     $(".result-kg").css('top', kg_top + "px");
                     for (var i = 1; i < response.results.length + 1; i++)
                     {
                         var result = response.results[i - 1];
                         _this._results.push(result);
                         var j = _this._results.length;
                         _this._results_name.push("控制性详细规划——" + response.results[i - 1].attributes.用地性质);
                         var htmll = '<div class="dikuai-kg dikuai-konggui" style="top:' + a + 'px"><a id=dikuai-' + j + ' class="dikuai-name">' + response.results[i - 1].attributes.用地性质 + '</a><span id=location-' + j + ' class="icon-location dikuai-icon"></span></div>';
                         a = a + 40;
                         $(".result-kg").append(htmll);
                         var str = "dikuai-" + j;
                         var str1 = "location-" + j;
                         var num = j;
                         $("#" + str).bind('click', function () {
                             var id = this.id.split('-')[1];
                             _this._queryxq(result, id, _this);
                         });
                         $("#" + str1).bind('click', function () {
                             _this._choosecolor(this, _this);
                             _map.getHighLightLayer().clearLayers();
                             L.dci.app.util.highLight(_map, result, true, true);
                         });
                     }
                     _this.queryProject(url, latlng, map, _this);
                 }
                 else
                 {
                     $(".dikuai-kg").remove();
                 }
             });
        },

        /*查询项目信息*/
        queryProject: function (url, latlng, map, _this) {
            $(".business-project-details-container").empty();
            var _map = L.DCI.App.pool.get("map");
            L.esri.Tasks.identifyFeatures(url)
             .on(map)
             .at(latlng)
             .tolerance(0)
             .layers(Project_ParamConfig.layernum.xm)
             .run(function (error, featureCollection, response) {
                 var bq = L.DCI.App.pool.get("businessquery");
                 bq._details_num = 0;
                 bq._this_ = _this;
                 bq._details_lenght = response.results.length;
                 if (response.results.length > 0)
                 {
                     _this._data = [];
                     $(".business-project-details-container").append(_this._detailshtml);
                     for (var i = 0; i < response.results.length; i++)
                     {
                         _this._requestProjectDetails(response.results[i].attributes.案件编号, _this);
                         _map.getHighLightLayer().clearLayers();
                         L.dci.app.util.highLight(_map, response.results[0], true, false);
                     }
                 }
                 else
                 {
                     $(".business-project-details-container").html('<p  style="font-size: 14px;margin-top: 200px;margin-left: 160px;">暂时没有数据</p>');
                 }
             });
        },

    });
    return L.DCI.BusinessQuery;
});