/**
*地块全生命周期(整体布局以及规划编制内容)类
*@module modules.business
*@class DCI.Business.WholeLifeCycle
*@constructor initialize
*/
define("business/wholelifecycle", [
    "leaflet",
    "core/dcins",
    "leaflet/esri",
    "plugins/scrollbar",
    "business/wholelifecycleexamine",
    "business/wholelifecycleapproval"
], function(L) {

    L.DCI.Business.WholeLifeCycle = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: 'wholelifecycle',

        /**
        *模块名称
        *@property _clsName
        *@type {String}
        *@private
        */
        _clsName: '全生命周期',

        /**
        *规划审批类对象
        *@property examine
        *@type {Object}
        *@private
        */
        examine: null,

        /**
        *批后监管类对象
        *@property approval
        *@type {Object}
        *@private
        */
        approval: null,

        /**
        *默认添加的图层(总规)
        *@property _zgLayer
        *@type {Object}
        *@private
        */
        _zgLayer: null,
        /**
        *默认添加的图层(分规)
        *@property _fgLayer
        *@type {Object}
        *@private
        */
        _fgLayer: null,
        /**
        *默认添加的图层(控规)
        *@property _kgLayer
        *@type {Object}
        *@private
        */
        _kgLayer: null,

        /**
        *地图对象
        *@property _map
        *@type {Object}
        *@private
        */
        _map:null,          

        /**
        *判断规划编制是处于内容页还是地块详情页(true为内容页，false为地块详情页)
        *@property isContentOrDetail
        *@type {Boolean}
        *@private
        */
        isContentOrDetail: true,

        /**
        *保存用于编制审批和批后监管中查询用的数据
        *@property geometry
        *@type {Object}
        *@private
        */
        geometry: null,

        /**
        *保存规划编制中获取到一个控规地块的高亮图层
        *@property geo
        *@type {Object}
        *@private
        */
        geo: null,

        /**
        *保存规划编制中点击的某个地块的高亮图层
        *@property dkGeo
        *@type {Object}
        *@private
        */
        dkGeo: null,

        /**
        *判断规划审批或批后监察是否可以点击，只有当规划编制中获取到了控规地块的geo数据，才可以进行点击操作
        *@property tabstates
        *@type {Boolean}
        *@private
        */
        tabstates: false,  

        /**
        *总归地址
        *@property zgUrl
        *@type {String}
        *@private
        */
        zgUrl: '',
        /**
        *分规地址
        *@property fgUrl
        *@type {String}
        *@private
        */
        fgUrl: '',
        /**
        *控规地址（其中包含分规、总归、控规以及项目一张图图层）
        *@property kgUrl
        *@type {String}
        *@private
        */
        kgUrl: '',

        /**
         *总归图层索引
         *@property zgLayerIndex
         *@type {String}
         *@private
         */
        zgLayerIndex: '',

        /**
         *分规图层索引
         *@property fgLayerIndex
         *@type {String}
         *@private
         */
        fgLayerIndex: '',

        /**
         *控规图层索引
         *@property kgLayerIndex
         *@type {String}
         *@private
         */
        kgLayerIndex: '',   

        /**
         *规划编制--结果集
         *@property _results
         *@type {Array}
         *@private
         */
        _results: [],

        /**
         *规划编制--结果对应的地块名
         *@property _results_name
         *@type {Array}
         *@private
         */
        _results_name: [],

        /**
         *规划编制--高亮图层信息
         *@property _resultsGeoData
         *@type {Array}
         *@private
         */
        _resultsGeoData: [],

        /**
         *tab页索引（0为规划编制，1为规划审批，2为批后监管）
         *@property tabIndex
         *@type {Number}
         *@private
         */
         tabIndex: 0,

        /**
        *保存查看的地块当前页索引号(默认值为-1)
        *@property detailDataIndex
        *@type {Number}
        *@private
        */
         detailDataIndex: -1,

        /**
        *判断是地块列表或地块详情内容（false为地块列表，反之为地块详情）
        *@property isDetail
        *@type {Boolean}
        *@private
        */
         isDetail: false,



        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this.examine = new L.DCI.Business.WholeLifeCycleExamine();
            this.approval = new L.DCI.Business.WholeLifeCycleApproval();
            //获取服务地址
            this.config = Project_ParamConfig.wholelifecycleConfig;
            this.zgUrl = this.config[0].url;
            this.zgLayerIndex = this.config[0].layerIndex;
            this.fgUrl = this.config[1].url;
            this.fgLayerIndex = this.config[1].layerIndex;
            this.kgUrl = this.config[2].url;
            this.kgLayerIndex = this.config[2].layerIndex;
            this._map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            //默认加图
            this._kgLayer = this._map.addLayer(this.kgUrl, { layers: [this.kgLayerIndex], id: '地块全生命周期的控规' });
        },

        /**
        *默认加图
        *@method deleteLayer
        */
        _addLayer: function () {
            if(this._kgLayer==null)
                this._kgLayer = this._map.addLayer(this.kgUrl, { layers: [this.kgLayerIndex], id: '地块全生命周期的控规' });
            else {
                this._map.map.addLayer(this._kgLayer);
            }
        },
        /**
        *退出删除默认加载图
        *@method deleteLayer
        */
        deleteLayer:function() {
            this._map.removeLayer(this._kgLayer.options.id);
            //清除项目阶段加载的图层
            if (this.examine.businessTemplate != null)
            {
                this.examine.deleteLayer();
            }
        },

        /**
        *显示内容到容器中
        *@method showTo
        */
        showTo: function () {
            var param = {
                context: this,
                title: this._clsName,
                selected: true,
                index: 0
            }
            L.dci.app.pool.get("rightPanel").loadByOption(param);
        },

        /**
        *重新触发地图点击事件
        *@method reActive
        */
        reActive:function(){
            var _map = L.DCI.App.pool.get("map");
            _map.activate(L.DCI.Map.StatusType.SELECT, this.callbackZG, this.precall, this);
            _map.setCursorImg(this._clsName + ".cur");
        },

        /**
        *取消触发地图点击事件
        *@method closeAcitve
        */
        closeAcitve:function(){
            var _map = L.DCI.App.pool.get("map");
            _map.activate(L.DCI.Map.StatusType.SELECT, null, this.precall, this);
        },


        /**
        *整体布局
        *@method layout
        */
        layout: function () {
            //整体布局元素
            var html = ' <div>'
                            + '<ul>'
                                + '<li class="liftBtn active">规划编制</li>'
                                + '<li class="liftBtn">规划审批</li>'
                                + '<li class="liftBtn">批后监管</li>'
                            + '</ul>'
                        + '</div>'
                        + '<div>'
                            + '<div class="liftContent liftContent-Compile active"></div>'
                            + '<div class="liftContent liftContent-Examine"></div>'
                            + '<div class="liftContent liftContent-Approval"></div>'
                        + '</div>';

            this._container = L.DomUtil.create("div", 'wholelifecycle', null);
            $(this._container).html(html); 
            this.showTo();

            $(".wholelifecycle").on('click', 'li.liftBtn', { context: this }, function (e) { e.data.context.switchTab(e); });
            //插入规划编制内容布局
            this.insertHtml();
        },

        /**
        *获取内容模版
        *@method getBody
        *@return {String} 内容模版
        */
        getBody: function () {
            return this._container;
        },


        /**
        *插入规划编制内容布局
        *@method insertHtml
        */
        insertHtml: function () {
            $(".liftContent-Compile").html("");
            var html = '<div class="liftContent-Compile-Body active">'
                        + '<div class="liftContent-Compile-Result liftContent-Compile-ZG">'
                            + '<div class="title-contain">总体规划</div>'
                        + '</div>'
                        + '<div class="liftContent-Compile-Result liftContent-Compile-FG">'
                            + '<div class="title-contain">分区规划</div>'
                        + '</div>'
                        + '<div class="liftContent-Compile-Result liftContent-Compile-KG">'
                            + '<div class="title-contain">控制性详细规划</div>'
                        + '</div>'
                    + '</div>'
                    + '<div class="liftContent-Compile-Details"></div>'
                    + '<div class="liftContent-Compile-Loading">'
                        + '<div class="loadingFlash"><span class="icon-loading"></span></div>'
                        + '<div class="loadingText">数据加载中，请耐心等待...</div>'
                    + '</div>';

            $(".liftContent-Compile").html(html);
        },

        /**
        *触发地图点击事件
        *@method active
        */
        active: function () {
            this._addLayer();
            $("#wholeliftcycle-Tip").remove();
            var _map = L.DCI.App.pool.get("map");
            _map.activate(L.DCI.Map.StatusType.SELECT, this.callbackZG, this.precall, this);
            _map.setCursorImg(this._clsName + ".cur");
        },

        /**
        *插入布局以及查询总体规划
        *@method callbackZG
        *@param evt{Object} 点击地图返回事件对象
        */
        callbackZG: function (evt) {
            
            this.tabstates = false;
            this._results.length = 0;
            this._results_name.length = 0;
            this._resultsGeoData.length = 0;
            this.geo = null;
            this.showCompile();
            this.layout();              //插入整体布局元素
            this.showCompileLoading();  //显示加载

            var _map = L.DCI.App.pool.get("map");
            var map = _map.getMap();
            _map.getHighLightLayer().clearLayers();

            _map.activate(L.DCI.Map.StatusType.SELECT, null, this.precall, this);      //丢失焦点
            var latlng = evt.latlng;
            var identify = L.esri.Tasks.identifyFeatures(this.zgUrl)
            identify.on(map)
            identify.at(latlng)
            identify.tolerance(0)
            identify.layers('all:'+ this.zgLayerIndex)
            identify.run(function (error, featureCollection, response) {
                
                this._results.length = 0;
                this._results_name.length = 0;
                if (response == null || response.results.length == 0) {
                    var thtml = '<div class="emptyTip">该地块无总体规划数据</div>';
                    $(".liftContent-Compile-ZG").append(thtml);
                }
                else
                {
                    var thtml = '<div class="name"><span>成果名称：</span><span class="liftContent-Compile-ZG-Name"></span></div>'
                              + '<div class="time"><span>审批时间：</span><span class="liftContent-Compile-ZG-Time"></span></div>';
                    $(".liftContent-Compile-ZG").append(thtml);
                    $(".liftContent-Compile-ZG-Name").html(response.results[0].attributes.规划成果名称);
                    $(".liftContent-Compile-ZG-Time").html(response.results[0].attributes.审批时间);

                    for (var i = 1; i < response.results.length + 1; i++)
                    {
                        var result = response.results[i - 1];
                        this._results.push(result);
                        var j = this._results.length;
                        var htmll = '<div class="dikuai-zg"><span id=dikuai-' + j + ' class="dikuaiAlink">地块' + i + '<span></div>';
                        this._results_name.push("总体规划——地块" + i);
                        $(".liftContent-Compile-ZG").append(htmll);
                        var str = "dikuai-" + j;
                        //保存该地块的图层几何信息
                        var feature = featureCollection.features[i - 1];
                        var geoType = feature.geometry.type;
                        var geo = L.dci.app.util.unproject(_map, feature, geoType);
                        this._resultsGeoData.length = 0;
                        this._resultsGeoData.push(geo);
                        //地块点击事件
                        $("#" + str).bind('click', { context: this }, function (e) {
                            var id = this.id.split('-')[1];
                            //保存地块的索引
                            e.data.context.detailDataIndex = id-1;
                            e.data.context.isDetail = true;
                            e.data.context._queryxq(this._results, id);     //查询地块详情
                            //高亮该地块
                            var kk = ($(e.target).attr("id")).split("-")[1];
                            var map = L.DCI.App.pool.get("map");
                            var geo = e.data.context._resultsGeoData[kk - 1];
                            e.data.context.dkGeo = null;
                            e.data.context.dkGeo = geo;
                            map.getHighLightLayer().addLayer(geo);
                            var latlag = geo.getBounds().getCenter();
                            map.getMap().setView(latlag);
                        });
                    }
                }
                //查询分区规划
                this.callbackFG(latlng, map);
            }, this);
        },


        /**
        *查询分区规划
        *@method callbackFG
        *@param latlng{Object}  查询点
        *@param map{Object}     地图对象
        */
        callbackFG: function (latlng, map) {
            var _map = L.DCI.App.pool.get("map");
            var identify = L.esri.Tasks.identifyFeatures(this.fgUrl)
            identify.on(map)
            identify.at(latlng)
            identify.tolerance(0)
            identify.layers('all:' + this.fgLayerIndex)
            identify.run(function (error, featureCollection, response) {
                
                 if (response == null || response.results.length == 0)
                 {
                     var thtml = '<div class="emptyTip">该地块无分区规划数据</div>';
                     $(".liftContent-Compile-FG").append(thtml);
                 }
                 else
                 {
                     var thtml = '<div class="name"><span>成果名称：</span><span class="liftContent-Compile-FG-Name"></span></div>'
                              + '<div class="time"><span>审批时间：</span><span class="liftContent-Compile-FG-Time"></span></div>';
                     $(".liftContent-Compile-FG").append(thtml);
                     $(".liftContent-Compile-FG-Name").html(response.results[0].attributes.规划成果名称);
                     $(".liftContent-Compile-FG-Time").html(response.results[0].attributes.审批时间);
                     for (var i = 1; i < response.results.length + 1; i++)
                     {
                         var result = response.results[i - 1];
                         this._results.push(result);
                         var j = this._results.length;
                         this._results_name.push("分区规划——地块" + i);
                         var htmll = '<div class="dikuai-fg"><span id=dikuai-' + j + ' class="dikuaiAlink">地块' + i + '</span></div>';
                         $(".liftContent-Compile-FG").append(htmll);
                         var str = "dikuai-" + j;
                         //保存该地块的图层几何信息
                         var feature = featureCollection.features[i - 1];
                         var geoType = feature.geometry.type;
                         var geo = L.dci.app.util.unproject(_map, feature, geoType);
                         this._resultsGeoData.push(geo);
                         //地块点击事件
                         $("#" + str).bind('click', { context: this }, function (e) {
                             e.data.context.isContentOrDetail = false;      //标志为详情页
                             var id = this.id.split('-')[1];
                             //保存地块的索引
                             e.data.context.detailDataIndex = id-1;
                             e.data.context.isDetail = true;
                             e.data.context._queryxq(this._results, id);        //查询地块详情
                             //高亮该地块
                             var kk = ($(e.target).attr("id")).split("-")[1];
                             var map = L.DCI.App.pool.get("map");
                             var geo = e.data.context._resultsGeoData[kk - 1];
                             e.data.context.dkGeo = null;
                             e.data.context.dkGeo = geo;
                             map.getHighLightLayer().addLayer(geo);
                             var latlag = geo.getBounds().getCenter();
                             map.getMap().setView(latlag);
                         });

                         
                     }
                 }
                 //查询控制性详细规划
                 this.callbackKG(latlng, map);
             },this);
        },

        /**
        *查询控制性详细规划
        *@method callbackKG
        *@param latlng{Object}  查询点
        *@param map{Object}     地图对象
        */
        callbackKG: function (latlng, map) {
            var _map = L.DCI.App.pool.get("map");

            var identify = L.esri.Tasks.identifyFeatures(this.kgUrl);
            identify.on(map)
            identify.at(latlng)
            identify.tolerance(0)
            //identify.layers("visible:71")
            identify.layers('all:' + this.kgLayerIndex)
            //identify.params.sr = "";
            identify.run(function (error, featureCollection, response) {
                 if (response == null || response.results.length == 0)
                 {
                     var thtml = '<div class="emptyTip">该地块无控制性详细规划数据</div>';
                     $(".liftContent-Compile-KG").append(thtml);
                     this.geo = null;   //先清空再保存
                     this.geometry = null;
                 }
                 else
                 {
                     var thtml = '<div class="name"><span>成果名称：</span><span class="liftContent-Compile-KG-Name"></span></div>'
                              + '<div class="time"><span>审批时间：</span><span class="liftContent-Compile-KG-Time"></span></div>';
                     $(".liftContent-Compile-KG").append(thtml);
                     $(".liftContent-Compile-KG-Name").html(response.results[0].attributes.规划成果名称);
                     $(".liftContent-Compile-KG-Time").html(response.results[0].attributes.审批时间);
                     for (var i = 1; i < response.results.length + 1; i++)
                     {
                         var result = response.results[i - 1];
                         this._results.push(result);
                         var j = this._results.length;
                         this._results_name.push("控制性详细规划——" + response.results[i - 1].attributes.用地性质);
                         var htmll = '<div class="dikuai-kg"><span id=dikuai-' + j + ' class="dikuai-name dikuaiAlink">' + response.results[i - 1].attributes.用地性质 + '</span></div>';
                         $(".liftContent-Compile-KG").append(htmll);
                         var str = "dikuai-" + j;
                         //保存该地块的图层几何信息
                         var feature = featureCollection.features[i - 1];
                         var geoType = feature.geometry.type;
                         var geo = L.dci.app.util.unproject(_map, feature, geoType);
                         this._resultsGeoData.push(geo);
                         //地块点击事件
                         $("#" + str).bind('click', { context: this }, function (e) {
                             e.data.context.isContentOrDetail = false;          //标志为详情页
                             var id = this.id.split('-')[1];
                             //保存地块的索引
                             e.data.context.detailDataIndex = id-1;
                             e.data.context.isDetail = true;
                             e.data.context._queryxq(this._results, id);         //查询地块详情
                             //高亮该地块
                             var kk = ($(e.target).attr("id")).split("-")[1];
                             var map = L.DCI.App.pool.get("map");
                             var geo = e.data.context._resultsGeoData[kk - 1];
                             e.data.context.dkGeo = null;
                             e.data.context.dkGeo = geo;
                             map.getHighLightLayer().addLayer(geo);
                             var latlag = geo.getBounds().getCenter();
                             map.getMap().setView(latlag);
                         });
                     }
                     //高亮第一个地块
                     var map = L.DCI.App.pool.get("map");
                     var feature = featureCollection.features[0];
                     var geoType = feature.geometry.type;
                     var geo = L.dci.app.util.unproject(map, feature, geoType);
                     geo.setStyle(L.dci.app.symbol.highlightPolygonSymbol);
                     map.getHighLightLayer().addLayer(geo);
                     var latlag = geo.getBounds().getCenter();
                     //map.getMap().setZoom(3);
                     map.getMap().setView(latlag);
                     
                     this.geo = null;
                     this.geometry = null;
                     this.geometry = feature;
                     this.geo = geo;

                 }
                this.tabstates = true;
                this.hideCompileLoading();
                 //重置鼠标状态
                this.reActive();
            },this);
        },


        /**
        *查询总体规划--项目一张图模块中调用
        *@method zgqueryfromProject
        *@param options{Object} 参数对象
        */
        zgqueryfromProject: function (options) {

            this.tabstates = false;
            this.showCompile();
            this.layout();              //插入整体布局元素
            this.showCompileLoading();  //显示加载

            var _map = options.map;
            var latlng = options.latlng;
            var map = _map.getMap();
            _map.getHighLightLayer().clearLayers();

            var identify = L.esri.Tasks.identifyFeatures(this.zgUrl)
            identify.on(map)
            identify.at(latlng)
            identify.tolerance(0)
            identify.layers('all:' + this.zgLayerIndex)
            identify.run(function (error, featureCollection, response) {
                this._results.length = 0;
                this._results_name.length = 0;
                if (response == null || response.results.length == 0)
                {
                    var thtml = '<div class="emptyTip">该地块无总体规划数据</div>';
                    $(".liftContent-Compile-ZG").append(thtml);
                }
                else
                {
                    var thtml = '<div class="name"><span>成果名称：</span><span class="liftContent-Compile-ZG-Name"></span></div>'
                              + '<div class="time"><span>审批时间：</span><span class="liftContent-Compile-ZG-Time"></span></div>';
                    $(".liftContent-Compile-ZG").append(thtml);
                    $(".liftContent-Compile-ZG-Name").html(response.results[0].attributes.规划成果名称);
                    $(".liftContent-Compile-ZG-Time").html(response.results[0].attributes.审批时间);

                    for (var i = 1; i < response.results.length + 1; i++)
                    {
                        var result = response.results[i - 1];
                        this._results.push(result);
                        var j = this._results.length;
                        var htmll = '<div class="dikuai-zg"><span id=dikuai-' + j + ' class="dikuaiAlink">地块' + i + '<span></div>';
                        this._results_name.push("总体规划——地块" + i);
                        $(".liftContent-Compile-ZG").append(htmll);
                        var str = "dikuai-" + j;
                        //保存该地块的图层几何信息
                        var feature = featureCollection.features[i - 1];
                        var geoType = feature.geometry.type;
                        var geo = L.dci.app.util.unproject(_map, feature, geoType);
                        this._resultsGeoData.length = 0;
                        this._resultsGeoData.push(geo);
                        //地块点击事件
                        $("#" + str).bind('click', { context: this }, function (e) {
                            e.data.context.isContentOrDetail = false;       //标志为详情页
                            var id = this.id.split('-')[1];
                            //保存地块的索引
                            e.data.context.detailDataIndex = id - 1;
                            e.data.context.isDetail = true;
                            e.data.context._queryxq(this._results, id);     //查询地块详情
                            //高亮该地块
                            var kk = ($(e.target).attr("id")).split("-")[1];
                            var map = L.DCI.App.pool.get("map");
                            var geo = e.data.context._resultsGeoData[kk - 1];
                            e.data.context.dkGeo = null;
                            e.data.context.dkGeo = geo;
                            map.getHighLightLayer().addLayer(geo);
                            var latlag = geo.getBounds().getCenter();
                            map.getMap().setView(latlag);
                        });


                    }
                }
                //查询分区规划
                this.callbackFG(latlng, map);
            }, this);
        },



        /**
        *查询地块详情
        *@method _queryxq
        *@param result{Object}  地块数据集
        *@param num{Object}     对应地块的序号
        */
        _queryxq: function (result, num) {
            this.showCompileLoading();
            $(".liftContent-Compile-Details").siblings().removeClass("active").end().addClass("active");
            //$(".liftContent-Compile-Details").css("z-index", "1");
            $(".liftContent-Compile-Details-Body").remove();

            var html = '<div class="liftContent-Compile-Details-Body"></div>';
            $(".liftContent-Compile-Details").html(html);
            
            var result_l = L.dci.app.util.queryFilter(this._results[num - 1].attributes);
            var htmlTr = '';
            for (var att in result_l)
            {
                htmlTr += '<tr><td class="key">' + result_l[att].name + '</td><td class="key-value">' + L.dci.app.util.isNull(result_l[att].value) + '</td></tr>';
            }

            var html1 = '<div class="currentResult">'
                            + '<div class="detailsResult-Return">'
                                +'<span class="icon-return"></span>'
                                + '<p id=title-xq-' + num + '></p>'
                            + '</div>'
                            + '<table class="detailsResult-Table">'
                            + htmlTr
                            + '</table></div>';
            $(".liftContent-Compile-Details-Body").append(html1);

            for (var i = 0; i < this._results.length; i++)
            {
                if (i != num - 1)
                {
                    var j = i + 1;
                    var result_l_s = L.dci.app.util.queryFilter(this._results[i].attributes);
                    var htmlTr_s = '';
                    for (var att in result_l_s)
                    {
                        htmlTr_s += '<tr><td class="key">' + result_l_s[att].name + '</td><td class="key-value">' + L.dci.app.util.isNull(result_l_s[att].value) + '</td></tr>'
                    }

                    var html1_s = '<div class="otherResult">'
                                    + '<div class="detailsResult-Return">'
                                        + '<span class="icon-return"></span>'
                                        + '<p id=title-xq-' + j + '></p>'
                                    + '</div>'
                                    + '<table class="detailsResult-Table">'
                                    +  htmlTr_s
                                    + '</table>'
                                + '</div>';

                    $(".liftContent-Compile-Details-Body").append(html1_s);
                    // $(".result-title-zg").html(_this._results_name[i]);
                }
            }
            for (var i = 1; i < this._results.length + 1; i++)
            {
                $("#title-xq-" + i).html(this._results_name[i - 1]);
            }

            this.hideCompileLoading();
            $(".liftContent-Compile-Details-Body .icon-return").bind('click', { context: this }, function (e) {
                e.data.context.detailDataIndex = -1;
                e.data.context.isDetail = false;
                $(".liftContent-Compile-Body").siblings().removeClass("active").end().addClass("active");
                //清空高亮，并重新加载第一个控规图层
                e.data.context.clearHighlight();
                e.data.context.showHighlight(e.data.context.geo);
            });

            //滚动条
            $(".liftContent-Compile-Details-Body").mCustomScrollbar({
                theme: "minimal-dark"
            });
        },

        /**
        *点击前事件
        *@method precall
        */
        precall: function () {
        },

        /**
        *切换tab
        *@method switchTab
        */
        switchTab: function (e) {
            var text = $(e.target).text();
            if ($(e.target).hasClass("active") == false)
            {
                switch (text)
                {
                    case '规划编制':
                        this.hideMarks();
                        this.tabIndex = 0;
                        this.showCompile();
                        this.showMarks();
                        break;
                    case '规划审批':
                    case '批后监管':
                        this.hideMarks();
                        if (text == "规划审批")
                            this.tabIndex = 1;
                        else
                            this.tabIndex = 2;
                        if (this.tabstates == true) 
                        {
                            //显示规划审批
                            if (text == "规划审批")
                            {
                                $(".liftBtn:eq(1)").addClass("active").siblings().removeClass("active");      //显示规划审批tab按钮
                                $(".liftContent:eq(1)").addClass("active").siblings().removeClass("active");  //显示规划审批tab内容
                            }
                            
                            //显示批后监管
                            if (text == "批后监管")
                            {
                                $(".liftBtn:last").addClass("active").siblings().removeClass("active");      //显示批后监管tab按钮
                                $(".liftContent:last").addClass("active").siblings().removeClass("active");  //显示批后监管tab内容
                            }
                            
                            //加载规划审批内容
                            if ($(".liftContent-Examine-Container").length == 0)
                            {
                                this.examine.load(this.geometry);
                            }

                            //加载批后监察内容
                            if ($(".liftContent-Approval-Container").length == 0)
                            {
                                this.approval.load(this.geometry);
                            }
                            this.showMarks();

                        } else 
                        {
                            L.dci.app.util.dialog.alert("提示", "规划编制数据还没获取成功，请稍等...");
                        } 
                        break;
                    default:
                        break;
                };
            }
        },
       

        /**
        *显示规划编制模块
        *@method showCompile
        */
        showCompile: function () {
            $(".liftBtn:first").addClass("active").siblings().removeClass("active");      //显示规划编制tab按钮
            $(".liftContent:first").addClass("active").siblings().removeClass("active");    //显示规划编制tab内容
        },

        /**
        *显示加载动画--规划编制
        *@method showCompileLoading
        */
        showCompileLoading: function () {
            $(".liftContent-Compile-Loading").css("z-index", "5");
        },

        /**
        *隐藏加载动画--规划编制
        *@method hideCompileLoading
        */
        hideCompileLoading: function () {
            $(".liftContent-Compile-Loading").css("z-index", "-1");
        },


        /**
        *高亮显示第一个控规图层
        *@method showHighlight
        */
        showHighlight: function (geo) {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            map.getHighLightLayer().addLayer(geo);
            var latlag = geo.getBounds().getCenter();
            //map.getMap().setZoom(3);
            map.getMap().setView(latlag);
        },

        /**
        *清除高亮
        *@method showHighlight
        */
        clearHighlight: function (geo) {
        var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
        map.getHighLightLayer().clearLayers();
        },



        /**
        *隐藏当前高亮对象
        *@method showMarks
        */
        hideMarks: function () {
            //取消鼠标捕捉地图事件
            this.closeAcitve();
            //取消默认加图
            this.deleteLayer();
            if (this.tabIndex == 0)
            {
                if (this.isDetail == true)
                {
                    var detailDataIndex = parseInt(this.detailDataIndex);
                    //模拟返回点击事件
                    $(".liftContent-Compile-Details").find(".currentResult .icon-return").click();
                    //恢复状态信息
                    this.detailDataIndex = detailDataIndex;
                    this.isDetail = true;
                }
                else
                {
                    //恢复状态信息
                    var ele = $(".liftContent-Compile-KG").find(".dikuai-kg")[0];
                    this.detailDataIndex = parseInt($(ele).children().attr("id").split("-")[1]);
                }
            }

            if (this.tabIndex == 1 && this.examine != null)
            {
                if (this.examine.isDetail == true)
                {
                    var detailDataIndex = parseInt(this.examine.detailDataIndex);
                    //模拟返回点击事件
                    $(".liftContent-Examine-Details").find(".turnback").click();
                    //恢复状态信息
                    this.examine.detailDataIndex = detailDataIndex;
                    this.examine.isDetail = true;
                }
                else
                {
                    if (this.examine.detailDataIndex == -1) return;
                    var detailDataIndex = parseInt(this.examine.detailDataIndex);
                    //恢复状态信息
                    this.examine.detailDataIndex = detailDataIndex;
                    //取消原来保留项目选中状态
                    var ele = $(".liftContent-Examine").find("div.examineProject")[this.examine.detailDataIndex];
                    $(ele).removeClass("selected");
                }
            }

            if (this.tabIndex == 2 && this.approval != null)
            {
                if (this.approval.isDetail == true)
                {
                    var detailDataIndex = parseInt(this.approval.detailDataIndex);
                    //模拟返回点击事件
                    $(".liftContent-Approval-Details").find(".turnback").click();
                    //恢复状态信息
                    this.approval.detailDataIndex = detailDataIndex;
                    this.approval.isDetail = true;
                }
                else
                {
                    if (this.approval.detailDataIndex == -1) return;
                    var detailDataIndex = parseInt(this.approval.detailDataIndex);
                    //恢复状态信息
                    this.approval.detailDataIndex = detailDataIndex;
                    //取消原来保留项目选中状态
                    var ele = $(".liftContent-Approval").find("div.percontent")[this.detailDataIndex];
                    $(ele).removeClass("selected");
                }
            }
        },

        /**
        *高亮当前高亮对象
        *@method showMarks
        */
        showMarks: function () {
            //激活地图点击事件
            this.reActive();
            //添加默认添加图层
            this._addLayer();
            if (this.tabIndex == 0)
            {
                if (this.isDetail == true)
                {
                    if (this.detailDataIndex == -1) return;
                    var ele = $(".liftContent-Compile").find("span.dikuaiAlink")[this.detailDataIndex];
                    $(ele).click();
                }
                else
                {
                    this.showHighlight(this.geo);
                }
            }

            if (this.tabIndex == 1 && this.examine != null)
            {
                this.showHighlight(this.geo);
                if (this.examine.isDetail == true)
                {
                    if (this.examine.detailDataIndex == -1) return;
                    var ele = $(".liftContent-Examine-Body").find("div.examineProject")[this.examine.detailDataIndex];
                    $(ele).find(".viewDetail").click();
                }
                else
                {
                    if (this.examine.detailDataIndex == -1) return;
                    var ele = $(".liftContent-Examine-Body").find("div.examineProject")[this.examine.detailDataIndex];
                    $(ele).children(".percontent").click();
                }
            }

            if (this.tabIndex == 2 && this.approval != null)
            {
                this.showHighlight(this.geo);
                if (this.approval.isDetail == true)
                {
                    if (this.approval.detailDataIndex == -1) return;
                    var ele = $(".liftContent-Approval-Body").find("div.percontent")[this.approval.detailDataIndex];
                    $(ele).find(".viewDetail").click();
                }
                else
                {
                    if (this.approval.detailDataIndex == -1) return;
                    var ele = $(".liftContent-Approval-Body").find("div.percontent")[this.approval.detailDataIndex];
                    $(ele).click();
                }
            }
        }



    });
    return L.DCI.Business.WholeLifeCycle;
});