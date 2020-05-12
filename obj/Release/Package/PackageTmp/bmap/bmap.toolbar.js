/**
*工具条类
*@module bmap
*@class DCI.BMap
*@constructor initialize
*/
define("bmap/toolbar", [
    "leaflet",
    "core/dcins",
    "bmap/resultpanel",
    "plugins/print"
], function (L) {
    L.DCI.BMap.Toolbar = L.Control.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: 'Toolbar',

        /**
        *查询结果
        *@property _queryResult
        *@type {Object}
        *@private
        */
        _queryResult: null,

        /**
        *属性查询状态
        *@property queryStatus
        *@type {Enum}
        *@private
        */
        queryStatus: false,

        /**
        *查询结果集
        *@property _results
        *@type {Array}
        *@private
        */
        _results: [],           

        /**
        *参数配置
        *@property options
        *@type {Object}
        *@private
        */
        options: {
            position: 'topleft',
            autoZIndex: true,
            title: '地图放大缩小',
            order: 'normal',
            mapContainer: null
        },

        /**
        *初始化
        *@method initialize
        *@param options{Object} 
        */
        initialize: function (options) {
            L.setOptions(this, options);
            this._tolerance = 5;
        },

        /**
        *@method onAdd
        */
        onAdd: function (map) {
            this._map = map;
            return this._createUi();
        },

        /**
        *@method getBody
        */
        getBody: function (map) {
            this._map = map;
            return this._createUi();
        },

        /**
        *@method onRemove
        */
        onRemove: function (map) {

        },

        /**
        *创建视图
        *@method _createUi
        */
        _createUi: function () {
            var ctrlName = 'bmap toolbar';
            var container = this._container = L.DomUtil.create('div', ctrlName, null);
            var zoomInButton = L.DomUtil.create('span', 'bmap button icon-zoom-in', container);
            zoomInButton.title = "放大";
            var zoomOutButton = L.DomUtil.create('span', 'bmap button icon-zoom-out', container);
            zoomOutButton.title = "缩小";
            var preminumButton = L.DomUtil.create('span', 'bmap button icon-exportform', container);
            preminumButton.title = "打开旗舰版";
            var currentScanButton = L.DomUtil.create('span', 'bmap button icon-load-all', container);
            currentScanButton.title = "现势浏览";
            currentScanButton.style.display = "none";
            var projectButton = L.DomUtil.create('span', 'bmap button icon-project-inquire', container);
            projectButton.title = "项目查看";
            projectButton.style.display = "none";
            var reloadButton = L.DomUtil.create('span', 'bmap button icon-Refresh', container);
            reloadButton.title = "恢复当前业务";
            reloadButton.style.display = "none";
            var inquireButton = L.DomUtil.create('span', 'bmap button icon-attribute-inquire', container);
            inquireButton.title = "属性查询";
            var printButton = L.DomUtil.create('span', 'bmap button icon-print', container);
            printButton.title = "打印";
            L.DomEvent.on(zoomInButton, 'click', this._zoomInClick, this);
            L.DomEvent.on(zoomOutButton, 'click', this._zoomOutClick, this);
            L.DomEvent.on(inquireButton, 'click', this._inquireClick, this);
            L.DomEvent.on(projectButton, 'click', this._projectClick, this);
            L.DomEvent.on(printButton, 'click', this._printClick, this);
            L.DomEvent.on(currentScanButton, 'click', this._currentScanClick, this);
            L.DomEvent.on(reloadButton, 'click', this._reloadClick, this);
            L.DomEvent.on(preminumButton, 'click', this._preminumButtonClick, this);
            return container;
        },

        /**
        *清除按钮高亮样式以及个别功能的绑定事件
        *@method removeButtonActiveClass
        */
        removeButtonActiveClass: function () {
            //清除所有按键的高亮样式
            var ele = $(".bmap.toolbar").find("span.bmap");
            for (var i = 0; i < ele.length; i++) {
                $(ele[i]).removeClass("active");
            }
            //取消功能绑定的事件
            this._map.getContainer().style.cursor = "pointer";
            this._map.off("click", this._callback, this);     //取消属性查询点击地图事件
            this._map.off("click", this._businessCallBack, this);   //取消项目查询点击地图事件
        },

        /**
        *取消事件冒泡
        *@method stopPropagation
        */
        stopPropagation: function (e) {
            e.stopPropagation();
        },

        /**
        *放大
        *@method _zoomInClick
        */
        _zoomInClick: function (e) {
            this._map.zoomIn(1);
            this.stopPropagation(e);
        },

        /**
        *缩小
        *@method _zoomOutClick
        */
        _zoomOutClick: function (e) {
            this._map.zoomOut(1);
            this.stopPropagation(e);
        },
        /**
        *打印
        *@method _printClick
        */
        _printClick: function (e) {
            //this.removeButtonActiveClass();
            this._print();
            this.stopPropagation(e);
        },

        /**
        *属性查询
        *@method _inquireClick
        */
        _inquireClick: function (e) {
            this.removeButtonActiveClass();
            $(e.target).addClass("active");
            this._map.getContainer().style.cursor = "default";
            this._map.on("click", this._callback, this);
            this.stopPropagation(e);
        },

        /**
        *属性查询的执行方法
        *@method _callback
        */
        _callback: function (evt) {
            var map = L.dci.app.pool.get('bmap');
            map.getHighLightLayer().clearLayers();

            if (this._queryResult == null) {
                this._queryResult = new L.DCI.BMap.QueryResult();
                L.dci.app.pool.add(this._queryResult);
            }
            this._queryResult.showOnBmap(1);
            //加载动画
            var rightpanel = L.dci.app.pool.get('bmapRightPanel');
            rightpanel.showLoading('result-list-group');

            var map = this._map;
            var lyArr = [];
            this._map.eachLayer(function (layer) {
                lyArr.push(layer);
            });
            this._results = [];
            this._count = lyArr.length;
            
            map.eachLayer(function (layer) {
                if (layer.options && layer.options.id != "baseLayer" && layer.options.id) {
                    layer.identify()
                        .on(map)
                        .at(evt.latlng)
                        .layers('visible')
                        .tolerance(this._tolerance)
                        .run(function(error, featureCollection, response) {
                            this._count--;
                            if (response && response.results)
                                this._results = this._results.concat(response.results);
                            if (this._count == 0) {
                                this._queryResult.load(this._results);
                            }
                        }, this);
                } else {
                    this._count--;
                    if (this._count == 0) {
                        this._queryResult.load(this._results);
                    }
                }
            }, this);
        },

        /**
        *项目查看
        *@method _projectClick
        */
        _projectClick: function (e) {
            this.removeButtonActiveClass();   //这个方法里包含下面绑定地图点击事件的取消
            $(e.target).addClass("active");
            this._map.getContainer().style.cursor = "default";

            //这里businessType是全局变量，在core.bmap.init.js中声明。  
            switch (businessType) {
                case 'GHBZ':
                    this._map.on("click", this._businessCallBack, this);   //这里的绑定事件，在removeButtonActiveClass方法中含有其取消绑定事件方法
                    break;
                default:
                    break;
            }

            this.stopPropagation(e);
        },

        /**
        *项目查看编制业务时的执行方法
        *@method _businessCallBack
        */
        _businessCallBack: function (evt) {
            var map = L.dci.app.pool.get('bmap');
            map.getHighLightLayer().clearLayers();
            if ($(".rightpanel-details").length > 0)
                $(".rightpanel-details").remove();
            $(".result-list-group").css("display", "none");
            $($(".result-list-group")[0]).html('').css("display","");

            var config = Project_ParamConfig.bmapConfig;
            var queryUrl = config.projectView.url;
            var layerIndex = config.projectView.layerIndex;
            var identify = L.esri.Tasks.identifyFeatures(queryUrl);
            identify.on(this._map);
            identify.layers(layerIndex);
            identify.at(evt.latlng);
            identify.tolerance(0);
            identify.run(function (error, featureCollection, response) {
                if (error) {
                    console.log(error.message);
                    return;
                }
                else {
                    var length = response.results.length;
                    if (length > 0)
                    {
                        var bmap = L.dci.app.pool.get('bmap');
                        var planName = response.results[0].attributes.规划成果名称;
                        //用项目名称到编制一张图中查找项目编号projectId,再用projectId来定位
                        bmap.queryField("PLANNAME", planName);
                        bmap.getAllBzBusinessInfo(planName, "0");
                    }
                    else {//清空容器内容,显示无数据
                        $($(".result-list-group")[0]).html('<div style="display:table;width:100%;height:100%;"><p style="display:table-cell;text-align:center;vertical-align:middle;">无数据</p></div>');
                        var btnObj = $($(".result-list-group-button .button")[0]);
                        if (!btnObj.hasClass("selected")) {
                            btnObj.addClass("selected").siblings().removeClass("selected");
                        }
                    }
                }
            }, this);
        },

        /**
        *恢复当前业务
        *@method _reloadClick
        */
        _reloadClick: function (e) {
            $($(".bmap.toolbar").find("span[title='现势浏览']")).removeClass("selected");
            //隐藏项目查看按钮
            var Eles = $(".bmap.toolbar").find("span[title='项目查看']");
            $(Eles).hide("slow");

            var map = L.dci.app.pool.get('bmap');
            map.getHighLightLayer().clearLayers();

            if (businessType == "GHBZ") {
                this.removeButtonActiveClass();
                var data = refreshData;
                L.dci.app.pool.get("QueryBusinessResult").load(data, true);
                //显示历史图层
                var config = Project_ParamConfig.bmapConfig;
                var data = config.bzBusinessDefLayer.data;
                var url = '';
                for (var i = 0; i < data.length; i++) {
                    if (data[i].name == "控规历史图层") {
                        url = data[i].url;
                        break;
                    }
                }
                this._map.eachLayer(function (layer) {
                    if (layer.options && layer.options.id != undefined && layer.options.id != "baseLayer") {
                        var num = layer.options.id.indexOf("浏览版");
                        var urlResult = layer.url.indexOf(url);
                        if (num >= 0 && urlResult >= 0) {
                            layer.setOpacity(1);
                        }
                    }
                }, this);
            }
            this.stopPropagation(e);
        },

        /**
        *现势浏览
        *@method _currentScanClick
        */
        _currentScanClick: function (e) {
            $(e.target).addClass("selected");
            L.dci.app.pool.get('bmap').clearMark();
            //显示项目查看按钮
            var Eles = $(".bmap.toolbar").find("span[title='项目查看']");
            $(Eles).show("slow");

            var map = L.dci.app.pool.get('bmap');
            map.getHighLightLayer().clearLayers();   //清除高亮
            $($(".result-list-group")[0]).html('');
            var rightPanel = L.dci.app.pool.get('bmapRightPanel');
            rightPanel.hide();

            this.removeButtonActiveClass();   //这个方法里包含下面绑定地图点击事件的取消
            this._map.getContainer().style.cursor = "default";
            //清空过滤条件
            this._map.eachLayer(function (layer) {
                if (layer.options && layer.options.id != undefined && layer.options.id != "baseLayer") {
                    var num = layer.options.id.indexOf("浏览版");
                    if (num >= 0) {
                        var layerDefs = "";
                        layer.setLayerDefs(layerDefs);
                    }
                }
            }, this);

            //隐藏历史图层
            var config = Project_ParamConfig.bmapConfig;
            var data = config.bzBusinessDefLayer.data;
            var url = '';
            for (var i = 0; i < data.length; i++) {
                if (data[i].name == "控规历史图层") {
                    url = data[i].url;
                    break;
                }
            }

            this._map.eachLayer(function (layer) {
                if (layer.options && layer.options.id != undefined && layer.options.id != "baseLayer") {
                    var num = layer.options.id.indexOf("浏览版");
                    var urlResult = layer.url.indexOf(url);
                    if (num >= 0 && urlResult >= 0) {
                        layer.setOpacity(0);
                    }
                }
            }, this);
        },

        /**
        *打印地图内容
        *@method _print
        */
        _print: function () {
            var ele = $(".bmapbody");
            $(ele).print();
        },

        _preminumButtonClick:function() {
            var center = this._map.getCenter();
            var zoom = this._map.getZoom();
            var url = Project_ParamConfig.defaultUserImages;
            var token = "Z2h8MTEy";
            this._autoOpenWindow(url + "/default.aspx", "token=" + token +
                "&zoom=" + zoom +
                "&center=" + center.lat + "," + center.lng +
                "&btmid=" + init_params["btmid"]+
                "&caseId=" + init_params["caseId"] +
                "&fea_type=ss"
            );
        },

        _autoOpenWindow: function (url, data) {
            var tempForm = document.createElement("form");
            tempForm.id = "tempForm1";
            tempForm.method = "post";
            tempForm.target = "_blank";
            tempForm.action = url;
            var hideInput = document.createElement("input");
            hideInput.type = "hidden";
            hideInput.name = "data";
            hideInput.value = data;
            tempForm.appendChild(hideInput);
            $(tempForm).on("onsubmit", function() {
                window.open(url);
            });
            document.body.appendChild(tempForm);
            tempForm.submit();
            document.body.removeChild(tempForm);
        }
    });
    return L.DCI.BMap.Toolbar;
})