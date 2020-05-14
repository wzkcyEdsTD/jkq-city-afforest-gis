/**
*菜单功能处理类（为今后更新版本的方便，项目中勿直接在该文件中修改，可继承该类后修改）
*@module layout
*@class DCI.Tool
*@constructor initialize
*@extends DCI.BaseObject
*/
define("layout/tool", [
    "leaflet",
    "core/dcins",
    "core/baseobject",
    "layout/leftcontentpanel",
    "query/quickquery",
    "query/projectidentify",
    "business/query",
    "login/settings",
    "plugins/draggable",
    "analysis/landbalance",
    "analysis/landstrength",
    "analysis/addcad",
    "business/organization",
    "business/approvalcharts",
    "business/projectmap",
    "business/sxonemap",
    "business/approvedmap",
    "business/compilemap",
    "business/indexcontrast",
    "business/wholelifecycle",
    "analysis/netvolumeratio",
    "analysis/landstock",
    "analysis/publicservice",
    "business/mapmonitor",
    "analysis/certificate",
    "analysis/auxiliaryloc",
    "analysis/conflictanalysis",
    "analysis/facilitiesStatistics",
    "query/projectquery",
    "query/propertyquery",
    "analysis/greenSpaceAnalysis",
    "tables/extraQuery"
], function (L) {

    L.DCI.Tool = L.DCI.BaseObject.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: "Tool",

        /**
        *获取地图对象
        *@method _getMap
        */
        _getMap: function () {
            var mpgroup = L.DCI.App.pool.get("MultiMap");
            var map = mpgroup.getActiveMap();
            if (map == null) {
                L.dci.app.util.dialog.error("温馨提示", "未找到map对象");
                return null;
            };
            return map;
        },
        /**
        *平移
        *@method translation
        */
        translation: function () {
            var map = this._getMap();
            if (map) map.activate(L.DCI.Map.StatusType.PAN);

        },
        /**
        *前一视图
        *@method goBack
        */
        goBack: function () {
            var mapGroup = L.DCI.App.pool.get("MultiMap");
            var map = mapGroup.getActiveMap();
            map.goBack();
        },

        /**
        *后一视图
        *@method goForward
        */
        goForward: function () {
            var mapGroup = L.DCI.App.pool.get("MultiMap");
            var map = mapGroup.getActiveMap();
            map.goForward();
        },

        /**
        *测距
        *@method measureDistance
        */
        measureDistance: function () {
            var mapGroup = L.DCI.App.pool.get("MultiMap");
            var map = mapGroup.getActiveMap();
            map.activate(L.DCI.Map.StatusType.MEASURELEN);
        },

        /**
        *测面积
        *@method measureArea
        */
        measureArea: function () {
            var mapGroup = L.DCI.App.pool.get("MultiMap");
            var map = mapGroup.getActiveMap();
            map.activate(L.DCI.Map.StatusType.MEASUREAREA);
        },

        /**
        *属性查询
        *@method identify
        */
        identify: function () {
            var mapGroup = L.DCI.App.pool.get("MultiMap");
            var map = mapGroup.getActiveMap();
            map.identify();
            //添加一个提示文字
            if ($("#wholeliftcycle-Tip").length == 0) {
                var html = '<div id="wholeliftcycle-Tip">请选择一个地图要素</div>';
                $(".out-container").append(html);
            } else {
                $("#wholeliftcycle-Tip").text("请选择一个地图要素");
            }
            $("#wholeliftcycle-Tip").fadeIn(2000);
            var myVar = setInterval(function () {
                $("#wholeliftcycle-Tip").fadeOut(2000);
                window.clearInterval(myVar);
            }, 3000);
        },

        /**
       *项目信息查询
       *@method identify
       */
        projectIdentify: function () {
            var projectIdentify;
            if (L.dci.app.pool.has("projectIdentify") == false) {
                var mapGroup = L.DCI.App.pool.get("MultiMap");
                var map = mapGroup.getActiveMap();
                projectIdentify = new L.DCI.ProjectIdentify(map);
                L.dci.app.pool.add(projectIdentify);
            } else {
                projectIdentify = L.dci.app.pool.get("projectIdentify");
            }
            projectIdentify.active();
            //添加一个提示文字
            if ($("#wholeliftcycle-Tip").length == 0) {
                var html = '<div id="wholeliftcycle-Tip">请选择一个项目</div>';
                $(".out-container").append(html);
            } else {
                $("#wholeliftcycle-Tip").text("请选择一个项目");
            }
            $("#wholeliftcycle-Tip").fadeIn(2000);
            var myVar = setInterval(function () {
                $("#wholeliftcycle-Tip").fadeOut(2000);
                window.clearInterval(myVar);
            }, 3000);
        },
        /**
        **项目查询
        **/
        projectQuery: function () {
            var projectQuery;
            if (L.dci.app.pool.has("projectQuery") == false) {
                var mapGroup = L.DCI.App.pool.get("MultiMap");
                var map = mapGroup.getActiveMap();
                projectQuery = new L.DCI.ProjectQuery(map);
                L.dci.app.pool.add(projectQuery);
            } else {
                projectQuery = L.dci.app.pool.get("projectQuery");
            }
            projectQuery.startQuery();
        },
        /**
        **属性查询
        **/
        propertyQuery: function () {
            var propertyQuery;
            if (L.dci.app.pool.has("propertyQuery") == false) {
                var mapGroup = L.DCI.App.pool.get("MultiMap");
                var map = mapGroup.getActiveMap();
                propertyQuery = new L.DCI.PropertyQuery(map);
                L.dci.app.pool.add(propertyQuery);
            } else {
                propertyQuery = L.dci.app.pool.get("propertyQuery");
            }
            propertyQuery.startQuery();
        },
        
        /**
        *全图
        *@method fullExtent
        */
        fullExtent: function () {
            var mapGroup = L.DCI.App.pool.get("MultiMap");
            var dciMap = mapGroup.getActiveMap();
            dciMap.zoomToFullExtent();
        },

        /**
        *全屏
        *@method fullScreen
        */
        fullScreen: function () {
            var toppanel = L.DCI.App.pool.get("topPanel");
            toppanel._toolbar.togglefullscreen();
        },

        /**
        *打印
        *@method print
        */
        print: function () {
            var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
            mapGroup[0].getControls().print.show();
        },

        /**
        *叠加shapfile
        *@method addShp
        */
        //addShp: function () {
        //    if (this._addcads == null)
        //        this._addcads = new L.DCI.AddCad();
        //    this._addcads.addshp();
        //},

        /**
        *叠加cad或shapfile数据
        *@method addCad
        */
        addCad: function () {
            if (this._addcads == null)
                this._addcads = new L.DCI.AddCad();
            this._addcads.adddata();
        },

        /**
        *标点
        *@method plotDot
        */
        plotDot: function () {
            var map = this._getMap();
            if (map) map.activate(L.DCI.Map.StatusType.POINT);
        },

        /**
        *文字标注
        *@method plotDotText
        */
        plotDotText: function () {
            var map = this._getMap();
            if (map) map.activate(L.DCI.Map.StatusType.POINTTEXT);
        },

        /**
        *标线
        *@method plotLine
        */
        plotLine: function () {
            var map = this._getMap();
            if (map) map.activate(L.DCI.Map.StatusType.POLYLINE);
        },

        /**
        *圆形
        *@method plotCircle
        */
        plotCircle: function () {
            var map = this._getMap();
            if (map) map.activate(L.DCI.Map.StatusType.CIRCLE);
        },

        /**
        *矩形
        *@method plotRect
        */
        plotRect: function () {
            var map = this._getMap();
            if (map) map.activate(L.DCI.Map.StatusType.RECTANGLE);
        },

        /**
        *多边形
        *@method plotPolygon
        */
        plotPolygon: function () {
            var map = this._getMap();
            if (map) map.activate(L.DCI.Map.StatusType.POLYGON);
        },

        /**
        *单屏
        *@method oneScreen
        */
        oneScreen: function () {
            var mapGroup = L.dci.app.pool.get("MultiMap");
            mapGroup.splitMap("splitOne");
        },

        /**
        *二屏
        *@method twoScreen
        */
        twoScreen: function () {
            var mapGroup = L.DCI.App.pool.get("MultiMap");
            mapGroup.splitMap("splitTow");
        },

        /**
        *三屏
        *@method threeScreen
        */
        threeScreen: function () {
            var mapGroup = L.DCI.App.pool.get("MultiMap");
            mapGroup.splitMap("splitThree");
        },

        /**
        *四屏
        *@method fourScreen
        */
        fourScreen: function () {
            var mapGroup = L.DCI.App.pool.get("MultiMap");
            mapGroup.splitMap("splitFour");
        },

        /**
        *地块分析
        *@method queryBusiness
        */
        queryBusiness: function () {
            var querybusiness = new L.DCI.businessquery;
            if (L.dci.app.pool.has("businessquery") == false) {
                L.dci.app.pool.add(querybusiness);
            }
            querybusiness._kgfind();
        },

        /**
        *编制分析
        *@method queryOrganization
        */
        queryOrganization: function () {
            var organizationquery = new L.DCI.organization;
            if (L.dci.app.pool.has("organizationquery") == false) {
                L.dci.app.pool.add(organizationquery);
            }
            organizationquery._kgfind();
        },

        /**
        *用地审批
        *@method landAnalysis
        */
        landAnalysis: function () {
            if (L.dci.app.pool.has("LeftContentPanel") == false) {
                var leftcontentpanel = new L.DCI.Layout.LeftContentPanel();
                L.dci.app.pool.add(leftcontentpanel);
            }
            if (this.approvalCharts == null)
                this.approvalCharts = new L.DCI.Business.ApprovalCharts();
            this.approvalCharts.show();
        },

        /**
        *一书两证统计
        *@method certStatistics
        */
        certStatistics: function () {
            if (L.dci.app.pool.has("LeftContentPanel") == false) {
                var leftcontentpanel = new L.DCI.Layout.LeftContentPanel();
                L.dci.app.pool.add(leftcontentpanel);
            }
            if (L.dci.app.pool.has("Certificate") == true) {//如果一书两证统计存在，则清除一书两证统计的缓存
                L.dci.app.pool.remove('Certificate');
            }
            var certificate = new L.DCI.Certificate();
            L.dci.app.pool.add(certificate);
        },

        /**
        *冲突分析
        *@method conflictAnalysis
        */
        conflictAnalysis: function () {
            if (L.dci.app.pool.has("LeftContentPanel") == false) {
                var leftcontentpanel = new L.DCI.Layout.LeftContentPanel();
                L.dci.app.pool.add(leftcontentpanel);
            }
            if (L.dci.app.pool.has("ConflictAnalysis") == true) {//如果冲突分析存在，则清除冲突分析的缓存
                L.dci.app.pool.remove('ConflictAnalysis');
            }
            var conflictAnalysis = new L.DCI.ConflictAnalysis();
            L.dci.app.pool.add(conflictAnalysis);
        },

        /**
        *用地平衡
        *@method landBalance
        */
        landBalance: function () {
            if (L.dci.app.pool.has("LeftContentPanel") == false) {
                var leftcontentpanel = new L.DCI.Layout.LeftContentPanel();
                L.dci.app.pool.add(leftcontentpanel);
            }
            if (L.dci.app.pool.has("LandBalance") == true) {//如果用地平衡存在，则清除用地强度开发的缓存
                L.dci.app.pool.remove('LandBalance');
            }
            var landbalance = new L.DCI.LandBalance();
            L.dci.app.pool.add(landbalance);
        },

        /**
        *用地强度分析
        *@method landStrength
        */
        landStrength: function () {
            if (L.dci.app.pool.has("LeftContentPanel") == false) {
                var leftcontentpanel = new L.DCI.Layout.LeftContentPanel();
                L.dci.app.pool.add(leftcontentpanel);
            }
            if (L.dci.app.pool.has("LandBalance") == true) {//如果用地平衡存在，则清除用地平衡的缓存
                L.dci.app.pool.remove('LandBalance');
            }
            var landstrength = new L.DCI.LandStrength();
            L.dci.app.pool.add(landstrength);
        },

        /**
        *全生命周期
        *@method WholeLifeCycle
        */
        WholeLifeCycle: function () {
            var wholelifecycle = null;
            if (L.dci.app.pool.has("wholelifecycle") == false) {
                wholelifecycle = new L.DCI.Business.WholeLifeCycle;
                L.dci.app.pool.add(wholelifecycle);
            } else {
                wholelifecycle = L.dci.app.pool.get("wholelifecycle");
            }
            wholelifecycle.active();
            //添加一个提示文字
            if ($("#wholeliftcycle-Tip").length == 0) {
                var html = '<div id="wholeliftcycle-Tip">请选择一个地块</div>';
                $(".out-container").append(html);
            }
            $("#wholeliftcycle-Tip").fadeIn(2000);
            var myVar = setInterval(function () {
                $("#wholeliftcycle-Tip").fadeOut(2000);
                window.clearInterval(myVar);
            }, 3000);

        },

        /**
        *净容积率统计
        *@method NetVolumeRateStatistics
        */
        NetVolumeRateStatistics: function () {
            if (this._nlradio == null)
                this._nlradio = new L.DCI.Netvolumeratio();
            this._nlradio.show();
        },

        /**
        *可用地存量
        *@method LandStock
        */
        LandStock: function () {
            if (L.dci.app.pool.has("LeftContentPanel") == false) {
                var leftcontentpanel = new L.DCI.Layout.LeftContentPanel();
                L.dci.app.pool.add(leftcontentpanel);
            }
            if (L.dci.app.pool.has("Landstock") == true) {//如果可用地存量存在，则清除用地强度开发的缓存
                L.dci.app.pool.remove('Landstock');
            }
            var landstock = new L.DCI.LandStock();
            L.dci.app.pool.add(landstock);
        },

        /**
        *公共服务设施分析
        *@method LandStock
        */
        PublicService: function () {
            if (L.dci.app.pool.has("LeftContentPanel") == false) {
                var leftcontentpanel = new L.DCI.Layout.LeftContentPanel();
                L.dci.app.pool.add(leftcontentpanel);
            }
            if (L.dci.app.pool.has("PublicService") == true) {//如果公共服务设施分析存在，则清除用地强度开发的缓存
                L.dci.app.pool.remove('PublicService');
            }
            var publicservice = new L.DCI.PublicService();
            L.dci.app.pool.add(publicservice);
        },

        /**
        *指标分析
        *@method IndexContrastAnalysis
        */
        IndexContrastAnalysis: function () {
            var indexcontrast = new L.DCI.Business.IndexContrast(Project_ParamConfig.indexcontrastConfig);
            indexcontrast.show();
        },


        /**
        *范围加载
        *@method rangeLoad
        */
        rangeLoad: function () { },

        /**
        *清空
        *@method clear
        */
        clear: function () {
            var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
            for (var i = 0; i < mapGroup.length; i++) {
                var biao = new L.DCI.plotting();
                biao._clear(mapGroup[i].getMap());
                mapGroup[i].clear();
                //mapGroup[i].deactivate();
            }
            var mapGroup = L.DCI.App.pool.get("MultiMap");
            var _map = mapGroup.getActiveMap();
            mapGroup._readdclickEvent(_map);
			if (L.dci.app.pool.has("greenSpaceAnalysis") == true) {//变化分析图层
                    var greenSpaceAnalysis = L.dci.app.pool.get("greenSpaceAnalysis");
                    greenSpaceAnalysis.clear();
                }
            //L.dci.app.pool.get("rightPanel").clear();

            ////删除地块全生命周期默认加载图层
            //if (L.dci.app.pool.has("wholelifecycle") == true) {
            //    L.dci.app.pool.get("wholelifecycle").deleteLayer();
            //    L.dci.app.pool.remove("wholelifecycle");
            //}
        },

        /**
        *用户设置
        *@method loginSetting
        */
        loginSetting: function () {
            if (this._loginSetting == null)
                this._loginSettings = new L.DCI.LoginSettings();
        },

        /**
        *图斑协调
        *@method spotAnalysis
        */
        spotAnalysis: function () {
            var spotanalysis = new L.DCI.SpotAnalysis();
            L.dci.app.pool.add(spotanalysis);
            spotanalysis._differenceAnalysis();
        },

        /**
        *触发一张图功能
        *@method addOneMap
        *@param featurename{String} 专题名称
        */
        addOneMap: function (featurename) {
            var map = L.dci.app.pool.get('MultiMap').getActiveMap();
            if (map.id != "map")return;
            var funName = featurename;
            //var options = { layers: layers };
            switch (funName) {
                case "项目一张图":
                    if (this._projectMap == null)
                        delete this._projectMap;
                    //this._projectMap = new L.DCI.Business.PojectMap(options.layers);
                    this._projectMap = new L.DCI.Business.PojectMap();
                    L.dci.app.pool.add(this._projectMap);
                    break;
                case "时限一张图":
                    if (this._sxOneMap != null)
                        delete this._sxOneMap;
                    this._sxOneMap = new L.DCI.Business.SXOneMap();
                    L.dci.app.pool.add(this._sxOneMap);
                    break;
                case "批后一张图":
                    if (this._phOneMap != null)
                        delete this._phOneMap;
                    this._phOneMap = new L.DCI.Business.ApprovedMap(o);
                    L.dci.app.pool.add(this._phOneMap);
                    break;
                case "编制一张图":
                    if (this._bzOneMap != null)
                        delete this._bzOneMap;
                    this._bzOneMap = new L.DCI.Business.CompileMap();
                    L.dci.app.pool.add(this._bzOneMap);
                    break;
            };

        },

        /**
        *删除一张图功能
        *@method removeOneMap
        *@param funName{String} 专题名称
        */
        removeOneMap: function (funName) {
            if (funName == undefined) return;
            switch (funName) {
                case "项目一张图":
                    L.dci.app.pool.remove("business-projectmap");      //移除缓存  项目一张图
                    break;
                case "时限一张图":
                    L.dci.app.pool.remove("business-sxonemap");      //移除缓存  时限一张图
                    break;
                case "批后一张图":
                    L.dci.app.pool.remove("business-approvedmap");      //移除缓存  批后一张图
                    break;
                case "编制一张图":
                    L.dci.app.pool.remove("business-compilemap");      //移除缓存  编制一张图
                    break;
            }
            L.dci.app.pool.get("rightPanel").clear(funName);   //删除索引为1的模版
        },

        /**
        *查看用户手册
        *@method viewHelp
        */
        viewHelp: function () {
            window.open("document/help.html");
        },

        showhome: function () {
            window.open("./home.aspx");
        },

        /**
        *以图管控
        *@method controlByMap
        */
        controlByMap: function (){
            if (L.dci.app.pool.has("LeftContentPanel") == false) {
                left = new L.DCI.Layout.LeftContentPanel();
                L.dci.app.pool.add(left);
            }
            var mapMonitor = null;
            if (L.dci.app.pool.has("MapMonitor") == false) {
                mapMonitor = new L.DCI.MapMonitor();
            } else {
                mapMonitor = L.dci.app.pool.get("MapMonitor");
            }
            mapMonitor.active();
            //添加一个提示文字
            if ($("#wholeliftcycle-Tip").length == 0) {
                var html = '<div id="wholeliftcycle-Tip">请选择一个规划管理单元</div>';
                $(".out-container").append(html);
            }else
                $("#wholeliftcycle-Tip").text("请选择一个规划管理单元");

            $("#wholeliftcycle-Tip").fadeIn(2000);
            var myVar = setInterval(function () {
                $("#wholeliftcycle-Tip").fadeOut(2000);
                window.clearInterval(myVar);
            }, 3000);
        },

        /**
        *辅助选址分析
        *@method auxiliaryLoc
        */
        auxiliaryLoc: function () {
            if (L.dci.app.pool.has("LeftContentPanel") == false) {
                var leftcontentpanel = new L.DCI.Layout.LeftContentPanel();
                L.dci.app.pool.add(leftcontentpanel);
            }
            if (L.dci.app.pool.has("AuxiliaryLoc") == true) {//如果可用地存量存在，则清除用地强度开发的缓存
                L.dci.app.pool.remove('AuxiliaryLoc');
            }
            var auxiliaryloc = new L.DCI.AuxiliaryLoc();
            L.dci.app.pool.add(auxiliaryloc);
        },
        /**
        *空间查询（点选）
        *@method spatialQueryDot
        */
        spatialQueryDot: function () {
            var mapGroup = L.DCI.App.pool.get("MultiMap");
            var map = mapGroup.getActiveMap();
            map.spatialIdentify(L.DCI.Map.StatusType.POINT);
            //添加一个提示文字
            if ($("#wholeliftcycle-Tip").length == 0) {
                var html = '<div id="wholeliftcycle-Tip">请选择一个地图要素</div>';
                $(".out-container").append(html);
            } else {
                $("#wholeliftcycle-Tip").text("请选择一个地图要素");
            }
            $("#wholeliftcycle-Tip").fadeIn(2000);
            var myVar = setInterval(function () {
                $("#wholeliftcycle-Tip").fadeOut(2000);
                window.clearInterval(myVar);
            }, 3000);
        },
        /**
        *空间查询（框选）
        *@method spatialQueryRect
        */
        spatialQueryRect: function () {
            var mapGroup = L.DCI.App.pool.get("MultiMap");
            var map = mapGroup.getActiveMap();
            map.spatialIdentify(L.DCI.Map.StatusType.RECTANGLE);
            //添加一个提示文字
            if ($("#wholeliftcycle-Tip").length == 0) {
                var html = '<div id="wholeliftcycle-Tip">请选择一个地图要素</div>';
                $(".out-container").append(html);
            } else {
                $("#wholeliftcycle-Tip").text("请选择一个地图要素");
            }
            $("#wholeliftcycle-Tip").fadeIn(2000);
            var myVar = setInterval(function () {
                $("#wholeliftcycle-Tip").fadeOut(2000);
                window.clearInterval(myVar);
            }, 3000);
        },
        ///**
        //*空间查询（圈选）
        //*@method spatialQueryRect
        //*/
        //spatialQueryCircle: function () {
        //    var mapGroup = L.DCI.App.pool.get("MultiMap");
        //    var map = mapGroup.getActiveMap();
        //    map.spatialIdentify(L.DCI.Map.StatusType.CIRCLE);
        //    //添加一个提示文字
        //    if ($("#wholeliftcycle-Tip").length == 0) {
        //        var html = '<div id="wholeliftcycle-Tip">请选择一个地图要素</div>';
        //        $(".out-container").append(html);
        //    } else {
        //        $("#wholeliftcycle-Tip").text("请选择一个地图要素");
        //    }
        //    $("#wholeliftcycle-Tip").fadeIn(2000);
        //    var myVar = setInterval(function () {
        //        $("#wholeliftcycle-Tip").fadeOut(2000);
        //        window.clearInterval(myVar);
        //    }, 3000);
        //},
        /**
        *空间查询（线选）
        *@method spatialQueryPolyline
        */
        spatialQueryPolyline: function () {
            var mapGroup = L.DCI.App.pool.get("MultiMap");
            var map = mapGroup.getActiveMap();
            map.spatialIdentify(L.DCI.Map.StatusType.POLYLINE);
            //添加一个提示文字
            if ($("#wholeliftcycle-Tip").length == 0) {
                var html = '<div id="wholeliftcycle-Tip">请选择一个地图要素</div>';
                $(".out-container").append(html);
            } else {
                $("#wholeliftcycle-Tip").text("请选择一个地图要素");
            }
            $("#wholeliftcycle-Tip").fadeIn(2000);
            var myVar = setInterval(function () {
                $("#wholeliftcycle-Tip").fadeOut(2000);
                window.clearInterval(myVar);
            }, 3000);
        },
        /**
        **绿地变化分析
       **/
        greenSpaceAnalysis: function () {
            var greenSpaceAnalysis;
            if (L.dci.app.pool.has("greenSpaceAnalysis") == false) {
                var mapGroup = L.DCI.App.pool.get("MultiMap");
                var map = mapGroup.getActiveMap();
                greenSpaceAnalysis = new L.DCI.GreenSpaceAnalysis(map);
                L.dci.app.pool.add(greenSpaceAnalysis);
            } else {
                greenSpaceAnalysis = L.dci.app.pool.get("greenSpaceAnalysis");
            }
            greenSpaceAnalysis.startAnalyze();
        },
        /**
         * 数据搜索
         * */
        DataQuery: function () {
            const extraQuery = new L.DCI.ExtraQuery();
            console.log(extraQuery)
        },
        /**
         * 统计分析
         * */
        facilitiesStatistics: function () {
            if (L.dci.app.pool.has("LeftContentPanel") == false) {
                var leftcontentpanel = new L.DCI.Layout.LeftContentPanel();
                L.dci.app.pool.add(leftcontentpanel);
            }
            if (L.dci.app.pool.has("FacilitiesStatistics") == true) {//如果可用地存量存在，则清除用地强度开发的缓存
                L.dci.app.pool.remove('FacilitiesStatistics');
            }
            var facilitiesStatistics = new L.DCI.FacilitiesStatistics();
            L.dci.app.pool.add(facilitiesStatistics);
        },
        /**
         * 病虫害
         * */
        WithDiseased: function () {
            L.dci.app.util.dialog.alert("提示", "该服务正在开发中");
        },
        /**
         * 日常巡检
         * */
        DailyInspection: function () {
            L.dci.app.util.dialog.alert("提示", "该服务正在开发中");
        },
        /**
         * 公众服务
         * */
        PublicServiceNew: function () {
            L.dci.app.util.dialog.alert("提示", "该服务正在开发中");
        },
        /**
         * 全景点
         * */
        ScenicSpot: function () {
            L.dci.app.util.dialog.alert("提示", "该服务正在开发中");
        }
    });

    return L.DCI.Tool;
});