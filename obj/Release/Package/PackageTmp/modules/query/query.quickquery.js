/**
*快速查询类
*@module modules.query
*@class DCI.QuickQuery
*@constructor initialize
*/
define("query/quickquery", [
    "leaflet",
    "core/dcins",
    "plugins/scrollbar",
    "plugins/pagination",
    "data/ajax"
], function (L) {

    L.DCI.QuickQuery = L.Class.extend({
        /**
        *地图对象
        *@property _map
        *@type {Object}
        *@private
        */
        _map: null,
        /**
        *查询结果集
        *@property _results
        *@type {Arrat}
        *@private
        */
        _results: [],
        /**
       *当前地图图层数量
       *@property _count
       *@type {Number}
       *@private
       */
        _count: 2,
        /**
       *查询关键字
       *@property _key
       *@type {String}
       *@private
       */
        _key: null,

        /**
        *已完成的项目查询种类(编制、实施、批后)
        *@property _haveDone
        *@type {String}
        *@private
        */
        _haveDone: '',
        /**
        *总页码
        *@property currentPage
        *@type {Number}
        *@private
        */
        pageNum: 0,
        /**
        *初始页码
        *@property currentPage
        *@type {Number}
        *@private
        */
        currentPage: 1,
        /**
        *每页最多显示内容个数
        *@property maxShowNum
        *@type {Number}
        *@private
        */
        maxShowNum: 10,
        /**
        *显示结果数组
        *@property _projectData
        *@type {Array}
        *@private
        */
        _projectData: ['', '', ''],

        /**
        *快速搜索数组
        *@property _qqData
        *@type {Array}
        *@private
        */
        _qqData: ['', '', ''],

        /**
        *编制结果数组
        *@property _bzData
        *@type {Array}
        *@private
        */
        _bzData: ['', '', ''],

        /**
        *实施结果数组
        *@property _ssData
        *@type {Array}
        *@private
        */
        _ssData: ['', '', ''],

        /**
        *批后结果数组
        *@property _phData
        *@type {Array}
        *@private
        */
        _phData: ['', '', ''],

        _bzTotal: 0,
        
        _ssTotal: 0,

        _phTotal: 0,



        /**
        *编制详情html模板容器
        *@property _bzGroup
        *@type {String}
        *@private
        */
        _bzGroup: '<div class="prosearch-detail"  style="display:none">'
                + '<div class="prosearch-detail-title">'
                    + '<span class="turnback icon-return"></span>'
                    + '<div class="titlecontent"></div>'
                + '</div>'
                + '<div class="prosearch-detail-content"></div>'
             + '</div>',

        /**
        *编制html详情模板
        *@property _bzdetailTemp
        *@type {String}
        *@private
        */
        _bzdetailTemp: '<div class="baseInfo">'
                    + '<p class="baseInfo-title">基本信息</p><p class="baseInfo-button" data-projectId=""></p>'
                    + '<table>'
                        + '<tbody>'
                            + '<tr class="planName"><td class="key">项目名称</td><td class="value"></td></tr>'
                            + '<tr class="planUnit"><td class="key">编制单位</td><td class="value"></td></tr>'
                        + '</tbody>'
                    + '</table>'
                  + '</div>'
                  + '<div class="regulatoryplan-detail-experience">'
                  + '</div>',


        /**
        *批后详情html模板容器
        *@property _ssGroup
        *@type {String}
        *@private
        */
        _ssGroup: '<div class="prosearch-detail">'
                + '<div class="prosearch-detail-title">'
                    + '<span class="turnback icon-return"></span>'
                    + '<div class="titlecontent"></div>'
                    + '<span class="projectBtn" data-info="">项目视图</span>'
                + '</div>'
                + '<div class="prosearch-detail-content">'
                    + '<p>项目信息</p>'
                    + '<div class="prosearch-detail-content-projectInfo">'
                        + '<table class="table table-bordered">'
                            + '<tbody class="prosearch-detail-content-tbody"></tbody>'
                        + '</table>'
                    + '</div>'
                    + '<div class="prosearch-detail-content-phase"></div>'
                    + '<span class="viewWholeLifeCycle">地块全生命周期</span>'
                + '</div>'
             + '</div>',
        /**
        *批后详情html模板容器
        *@property _phGroup
        *@type {String}
        *@private
        */
        _phGroup: '<div class="prosearch-detail"  style="display:none">'
                    + '<div class="prosearch-detail-title">'
                        + '<span class="turnback icon-return"></span>'
                        + '<div class="titlecontent"></div>'
                        + '<span class="projectBtn" data-info="">项目详情</span>'
                    + '</div>'
                    + '<div class="prosearch-detail-content">'
                        + '<table class="table table-bordered">'
                            + '<thead><tr><th>批后进度</th><th>是否存在违规</th><th>是否已处理</th></tr></thead>'
                        + '<tbody class="prosearch-detail-content-tbody"></tbody>'
                        + '</table>'
                    + '</div>'
                + '</div>',

        /**
        *详情html模板
        *@property detailTemp
        *@type {String}
        *@private
        */
        detailTemp: '<div id="" class="prosearch-detail-content-temple">'
                        + '<div>'
                            + '<span class="title"></span>'
                            + '<span class="operate" data-info="">查看附件</span>'
                        + '</div>'
                        + '<table class="table table-bordered">'
                            + '<tbody class="prosearch-detail-content-tbody"></tbody>'
                        + '</table>'
                  + '</div>',



        /**
        *初始化
        *@method initialize
        */
        initialize: function (map) {
            this._map = map;
        },

        /**
        *读取全局搜索配置
        *@method _getGlobalsearchConfig
        *@param callback {function} 读取成功后的回调函数
        */
        _getGlobalsearchConfig: function (callback) {
            var dciajax = new L.DCI.Ajax();
            //读取全局搜索配置
            var baseurl = Project_ParamConfig.defaultCoreServiceUrl;
            var getGlobalSearchURL = baseurl + "/cpzx/manage/golbalsearch/getLayers";
            dciajax.get(getGlobalSearchURL, null, true, this,callback, function () { });
        },

        globalSearch: function (data) {
            Project_ParamConfig.globalSearch.layers = data;
            //全局搜索
            var key = this._key;
            _count = Project_ParamConfig.globalSearch.layers.length;
            $.each(Project_ParamConfig.globalSearch.layers, L.bind(function (i, item) {
                var url = item.url;
                var find = new L.esri.Tasks.find(url);
                find.layers(item.layers)
                    .text(key)
                    .fields(item.fields);
                find.params.sr = "";
                find.run(function (error, featureCollection, res) {
                    _count--;
                    if (error) {
                        //服务请求出错
                        console.info(error.code + ":" + error.message);
                    } else {
                        this._results = this._results.concat(res.results);
                        if (_count == 0)
                            this.showResult();
                    }
                }, this);
            }, this));
        },


        /**
        *查询处理
        *@method find
        *@param key {String} 查询关键字
        */
        find: function (key) {
            if (key == null || key == "") {
                L.dci.app.util.dialog.alert("提示", "请输入查询关键字");
                return;
            }
            this._key = key;
            L.dci.app.services.queryService.queryByKey({
                key: key,
                context: this,
                success: function (res) {
                    var test = res;
                },
                error: function (e) {
                    L.dci.app.util.dialog.error("属性查询错误提示", e.statusText);
                }
            });
        },
        /**
        *切换Tab
        *@method chooseLeft
        *@param e {Object} 查询关键字
        */
        chooseLeft: function (e) {
            $(".prosearch-detail").css("display", "none");
            this.deleteLayer();
            $(".queryresult-content").css("display", "block");
            $(".top").css("display", "none");
            $(".resultselect").addClass("selected")
            $(".queryresult-data-container").css("display", "none");
            $(".projectselect-choice").css("display", "none");
            $(".projectselect").removeClass("selected")
        },
        /**
        *切换Tab
        *@method chooseRight
        *@param e {Object} 查询关键字
        */
        chooseRight: function (e) {
            $(".prosearch-detail").css("display", "none");
            $(".queryresult-content").css("display", "none");
            $(".top").css("display", "inline-table");
            $(".resultselect").removeClass("selected")
            $(".queryresult-data-container").css("display", "block");
            $(".projectselect").addClass("selected")
        },


        /**
        *查询
        *@method query
        *@param key {String} 查询关键字
        */
        query: function (key) {

            $(".rightpanel-details").remove();

            this.currentPage = 1;
            if (key == null || key == "") {
                L.dci.app.util.dialog.alert("提示", "请输入查询关键字");
                return;
            }
            try
            {
                this.pageNum = 0;
                //弹出面板
                if (this._queryResult == null)
                    this._queryResult = new L.DCI.QueryResult();
                this._queryResult.showTo('快速搜索');
                
                $('.control-queryresult .resultselect').addClass('qrtop-left');
                var proSearchHtml = $(".control-queryresult");
                var projectselect = '<div class="projectselect qrtop-right qrtab" data-info=""><div class = "proContent">项目搜索</div></div>'
                                        + '<div class="projectselect-choice">'
                                        + '<ul>'
                                            + '<li data-info="1" class = "allcount" >项目搜索</li>'
                                            + '<li data-info="0" class = "bzcount" >编制</li>'
                                            + '<li data-info="0" class = "sscount" >实施</li>'
                                            + '<li data-info="0" class = "phcount" >批后</li>'
                                        +'</ul>'
                                        +'</div>'                                        
                                        +'</ul>'
                                    + '</div>';
                var psTest = $('.projectselect');
                if(psTest.length == 0){
                    proSearchHtml.append(projectselect);
                    $(".projectselect").on("click", { context: this }, function (e) {
                        e.stopPropagation();
                        e.data.context.switchTab(e);
                    });
                    //列表选项
                    $(".projectselect-choice>ul").on('click', 'li', { context: this }, function (e) {
                        e.data.context.changeSelect(e);
                    });
                };               
                
                //$(".regulatoryplan .top").on('click', 'span:not(:last)', { context: this }, function (e) { e.data.context._switchTab(e); });

                
                //tab页切换事件
                $(".resultselect").unbind();
                $(".qrtop-left").on('click', { context: this }, function (e) { e.data.context.chooseLeft(e); });
                $(".qrtop-right").on('click', { context: this }, function (e) { e.data.context.chooseRight(e); });
                this.chooseRight();
                
                //显示加载动画
                //var obj = $('.result-list-group-loadflash');
                //L.dci.app.util.showLoadFlash(obj);
                this._projectData.length = 0;
                //项目搜索
                this._haveDone = "项目搜索";
                this._ProjectSearch(key, 1);

                this.clear();
                this._key = key;
                //this._count = this._map.getLayers().length;
                var map = this._map.getMap();
                if (this._key == null && this._key == "") return;


                this._getGlobalsearchConfig(this.globalSearch);

                ////var urls = Project_ParamConfig.ydphfxConfig;
                //this.dlcx = new Array();
                //this.layerArr = new Array();
                ////现状道路地图服务
                //this.dlcx[0] = Project_ParamConfig.dlsearchLayers[0].url;
                //this.layerArr[0] = Project_ParamConfig.dlsearchLayers[0].layerIndex;
                ////规划道路地图服务
                //this.dlcx[1] = Project_ParamConfig.dlsearchLayers[1].url;
                //this.layerArr[1] = Project_ParamConfig.dlsearchLayers[1].layerIndex;

                //this._count = 2;
                //this._dlFind(this.dlcx[0], this._key, this.layerArr[0]);
                //this._dlFind(this.dlcx[1], this._key, this.layerArr[1]);
                
                                
            } catch (e) {
                L.dci.app.util.dialog.error("错误提示", e.statusText);
            }
        },

        _showQQlist: function (className,count) {

            var liHtml = $(className)[0];
            switch (className) {
                case '.allcount':
                    liHtml.textContent = "项目搜索(" + count + ")";
                    break;
                case ".bzcount":
                    liHtml.textContent = "编制(" + count + ")";
                    break;
                case ".sscount":
                    liHtml.textContent = "实施(" + count + ")";
                    break;
                case ".phcount":
                    liHtml.textContent = "批后(" + count + ")";
                    break;
                default:
                    break;
            }
        },

        /**
        *选择切换时触发
        *@method switchTab
        *@private
        */
        switchTab: function (e) {
            var eleActive = 'active';
            var tab = $(".projectselect-choice");
            tab.slideToggle("fast");
        },

        /**
        *选择改变时触发
        *@method changeSelect
        *@private
        */
        changeSelect: function (e) {
            //this.option = option;
            var tab = $(".projectselect-choice");
            var targetObj = $(e.target);
            //选中后更改父标题
            $(".projectselect")[0].textContent = e.target.textContent;

            var eleActive = 'active';

            tab.animate({ height: 'toggle' }, 100);
            //$("#projectselect-span").removeClass().addClass("icon-arrows-down");
            tab.removeClass(eleActive);

            var targetObj = $(e.target);

            var text = targetObj[0].className;
            var key = this._key;
            this.currentPage = 1;

            switch (text) {
                case 'allcount':
                    this._qqGetData(1, this.maxShowNum, key);
                    break;
                case "bzcount":
                    this._bzGetData(1, this.maxShowNum, "0", key);
                    break;
                case 'sscount':
                    this._xmGetData(1, this.maxShowNum, 0, key);
                    break;
                case 'phcount':
                    this._phGetData(1, this.maxShowNum, '0', '0', key);
                    break;
                default:
                    break;
            }

        },

        _dlFind: function (url, key, layers) {
            var find = new L.esri.Tasks.Find(url);
            find.text(this._key);
            find.layers(layers);
            find.params.sr = '';

            _this = this;
            find.run(function (error, featureCollection, res) {
                if (error != null) {

                }
                _this._count--;
                if (res != null) {
                    _this._results = _this._results.concat(res.results);
                }
                if (_this._count == 0)
                    _this.showResult();
            }, this);

        },



        /**
        *项目查找
        *@methon _ProjectSearch
        *@param key{String} 查询条件        
        *@param page{Number} 查询页码
        */
        _ProjectSearch: function (key,page) {
            //项目查询代码 lir
            var text = this._haveDone;
            
            switch (text) {
                case "项目搜索":
                    this._qqGetData(page, this.maxShowNum, key);
                    break;
                case "编制":
                    this._bzGetData(page, this.maxShowNum, "0", key);
                    break;
                case '实施':
                    this._xmGetData(page, this.maxShowNum, 0, key);
                    break;
                case '批后':
                    this._phGetData(page, this.maxShowNum, '0', '0', key);
                    break;
            }

            //项目END
        },

        /**
        *快速搜索项目信息
        *@method _qqGetData
        *@param currentPage {Number}       当前请求的页码
        *@param maxShowNum {Number}        每页最多显示内容个数
        *@param condition {String}         筛选条件
        */
        _qqGetData: function (currentPage, maxShowNum, condition) {
            var year = Project_ParamConfig.bzOneMapConfig.year;            //时间
            L.dci.app.services.businessService.queryQuery({
                pageIndex: currentPage,
                recordNum: maxShowNum,
                condition: condition,
                context: this,
                success: function (res) {
                    this._haveDone = "项目搜索";
                    this._qqTotal = res.Count;
                    $(".projectselect")[0].textContent = "项目搜索(" + res.Count + ")";

                    this._showQQlist(".allcount", res.Count);
                    if (this._qqTotal == null) { this._qqTotal = 0; };
                    var data = new Array()
                    var arr = new Array();
                    var data = res.Objects;       //保存具体内容数据
                    if (data == null) {
                        var data = new Array();
                    }

                    for (var i = 0; i < data.length; i++) {

                        if (data[i].PlanName != null) {
                            //编制
                            var fieldName = 'Ajbm';                            
                            arr[i] = { 'projectName': data[i].PlanName, 'org': data[i].PlanUnit, 'proType': 'bianzhi', 'fieldName': fieldName, 'currentAjbm': data[i].Ajbm, 'projectId': data[i].Xmbm };
                        } else if (data[i].JSDW != null) {
                            //实施
                            arr[i] = { 'projectName': data[i].XMMC, 'org': data[i].JSDW, 'proType': 'shishi', 'projectId': data[i].PROJECTID, 'projectPhase': data[i].PROJECTSTA, 'projectType': data[i].XMLX };
                        } else if (data[i].Xmmc != null) {
                            //批后
                            arr[i] = { 'projectName': data[i].Xmmc, 'org': data[i].Dwmc, 'proType': 'pihou', 'projectId': data[i].ItemID };
                        }
                        
                    }

                    this._projectData.length = 0;
                    this._qqData = arr;
                    this._projectData = this._qqData;
                    //}
                    this.pageNum = res.PageCount;
                    //if (this.pageNum <= res.PageCount) {
                    //    this.pageNum = res.PageCount;
                    //};
                    this._insertContent();           //加载项目列表内容

                },
                error: function (e) {
                    L.dci.app.util.dialog.error("错误提示", e.statusText);
                }
            });
            //编制
            var year = Project_ParamConfig.bzOneMapConfig.year;            //时间
            L.dci.app.services.businessService.getCompileMapPageData({
                year: year,
                page: 1,
                maxShowNum: maxShowNum,
                status: 0,
                condition: condition,
                context: this,
                success: function (res) {
                    this._showQQlist(".bzcount", res.Count);
                },
                error: function (e) {
                    L.dci.app.util.dialog.error("错误提示", e.statusText);
                }
            });

            //
            L.dci.app.services.businessService.getProjectmapManageCells({
                page: currentPage,
                maxShowNum: maxShowNum,
                phase: "0",
                condition: condition,
                context: this,
                success: function (res) {
                    this._showQQlist(".sscount", res.Count);

                },
                error: function (e) {
                    L.dci.app.util.dialog.error("错误提示", e.statusText);
                }
            });

            //
            var year = Project_ParamConfig.phOneMapConfig.year;           //时间

            L.dci.app.services.businessService.getApprovedTrackingData({
                year: year,
                page: currentPage,
                maxShowNum: maxShowNum,
                region: "0",
                stage: "0",
                condition: condition,
                context: this,
                success: function (res) {
                    this._showQQlist(".phcount", res.Count);
                },
                error: function (e) {
                    L.dci.app.util.dialog.error("错误提示", e.statusText);
                }
            });
            //


        },

        /**
        *获取编制项目信息
        *@method _bzGetData
        *@param currentPage {Number}       当前请求的页码
        *@param maxShowNum {Number}        每页最多显示内容个数
        *@param status {String}            查询阶段
        *@param condition {String}         筛选条件
        */
        _bzGetData: function (currentPage, maxShowNum, status, condition) {
            var year = Project_ParamConfig.bzOneMapConfig.year;            //时间
            L.dci.app.services.businessService.getCompileMapPageData({
                year: year,
                page: currentPage,
                maxShowNum: maxShowNum,
                status: status,
                condition: condition,
                context: this,
                success: function (res) {
                    this._haveDone = "编制";
                    this._bzTotal = res.Count;
                    if (this._bzTotal == null) { this._bzTotal = 0; }
                    var data = new Array()
                    var arr = new Array();
                    var data = res.Objects;       //保存具体内容数据
                    if (data == null) {
                        var data = new Array();
                    }
                    for (var i = 0; i < data.length; i++) {
                        var fieldName = 'Ajbm';
                        //var currentAjbm = data[i]["Ajbm"];     //默认查询详情用案件编码字段，当项目处于修编状态时，使用项目编码作为查询字段
                        //var projectId = data[i]["Xmbm"];        //这里通过key获取对应的值，作为详情按钮的属性保存
                        arr[i] = { 'projectName': data[i].PlanName, 'org': data[i].PlanUnit, 'proType': 'bianzhi', 'fieldName': fieldName, 'currentAjbm': data[i].Ajbm, 'projectId': data[i].Xmbm };
                    }
                    this._projectData.length = 0;
                    this._bzData = arr;
                    this._projectData = this._bzData;
                    //}
                    this.pageNum = res.PageCount;
                    //if (this.pageNum <= res.PageCount) {
                    //    this.pageNum = res.PageCount;
                    //};
                    this._insertContent();           //加载项目列表内容
                    
                },
                error: function (e) {
                    L.dci.app.util.dialog.error("错误提示", e.statusText);
                }
            });
        },

        /**
        *获取实施项目信息
        *@method _xmGetData
        *@param currentPage {Number}       当前请求的页码
        *@param maxShowNum {Number}        每页最多显示内容个数
        *@param phase {Number}             项目阶段
        *@param condition {String}         查询条件
        */
        _xmGetData: function (currentPage, maxShowNum, phase, condition) {
            L.dci.app.services.businessService.getProjectmapManageCells({
                page: currentPage,
                maxShowNum: maxShowNum,
                phase: phase,
                condition: condition,
                context: this,
                success: function (res) {
                    this._haveDone = "实施";
                    this._ssTotal = res.Count;
                    if(this._ssTotal == null){this._ssTotal = 0;}
                    var arr = new Array();
                    var data = res.Objects;       //保存具体内容数据
                    if (data == null) {
                        var data = new Array();
                    }
                        for (var i = 0; i < data.length; i++) {
                            arr[i] = { 'projectName': data[i].ITEMNAME, 'org': data[i].UNITNAME, 'proType': 'shishi', 'projectId': data[i].ITEMID, 'projectPhase': data[i].PROJECTSTA, 'projectType': data[i].XMLX };
                        }
                        this._projectData.length = 0;
                        this._ssData = arr;
                        this._projectData = this._ssData;
                        this.pageNum = res.PageCount;
                    //if (this.pageNum <= res.PageCount) {
                    //    this.pageNum = res.PageCount;
                    //};
                    this._insertContent();           //加载项目列表内容

                },
                error: function (e) {
                    L.dci.app.util.dialog.error("错误提示", e.statusText);
                }
            });
        },
                
        /**
        *获取批后项目
        *@method _phGetData
        *@param currentPage {Number}       当前请求的页码
        *@param maxShowNum {Number}        每页最多显示内容个数
        *@param region {String}            查询区域
        *@param stage {String}             查询阶段
        *@param condition {String}         筛选条件
        */
        _phGetData: function (currentPage, maxShowNum, region, stage, condition) {

            var year = Project_ParamConfig.phOneMapConfig.year;           //时间

            L.dci.app.services.businessService.getApprovedTrackingData({
                year: year,
                page: currentPage,
                maxShowNum: maxShowNum,
                region: region,
                stage: stage,
                condition: condition,
                context: this,
                success: function (res) {
                    this._haveDone = "批后";
                    this._phTotal = res.Count;
                    if (this._phTotal == null) { this._phTotal = 0; }
                    var arr = new Array();
                    var data = res.Objects;       //保存具体内容数据
                    if (data == null) {
                        var data = new Array();
                    }
                    for (var i = 0; i < data.length; i++) {
                        arr[i] = { 'projectName': data[i].Xmmc, 'org': data[i].Dwmc, 'proType': 'pihou', 'projectId': data[i].ItemID };
                    }
                    this._projectData.length = 0;
                    this._phData = arr;
                    this._projectData = this._phData;
                    this.pageNum = res.PageCount;
                    //if (this.pageNum <= res.PageCount) {
                    //    this.pageNum = res.PageCount;
                    //};
                    this._insertContent();           //加载项目列表内容
                },
                error: function (e) {
                    L.dci.app.util.dialog.error("错误提示", e.statusText);
                }
            });
        },
        /**
        *插入控制性详细规划内容
        *@method insertContent
        */
        _insertContent: function () {
            //清空内容区域和页码区域
            var data = new Array();
            //containerObj.html("");


            $("div").remove(".queryresult-data-container .content");
            $(".queryresult-data-container").append('<div class="content"></div>');
            $('.queryresult-data-container .bottom').html("");
            var containerObj = $(".queryresult-data-container .content");

            var data = this._projectData;       //保存具体内容数据

            //判断是否有匹配数据
            if (data.length== 0 ) {
                var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                map.getHighLightLayer().clearLayers();
                var html = '<p class="emptyResult">没有匹配的数据</p>';
                containerObj.html(html);
                $(".qrtop-right")[0].innerText = "项目搜索(0)";
            }
            else {
                var html = '';

                //for (var i = 0; i < data.length; i++) {                    
                    var proinfo = new Array()
                    var proinfo = data;
                    for (var j = 0; j < proinfo.length; j++)
                    {

                        var trHtml = '';

                        var projectName = proinfo[j].projectName;
                        var org = proinfo[j].org;
                        var proType = proinfo[j].proType;

                        trHtml += '<tr><td>项目名称:</td><td>' + projectName + '</td></tr>';
                        trHtml += '<tr><td>单位名称:</td><td>' + org + '</td></tr>';

                        if (proType == 'bianzhi') {
                            var fieldName = proinfo[j].fieldName;
                            var currentAjbm = proinfo[j].currentAjbm;
                            var projectId = proinfo[j].projectId;
                        }else if(proType == 'pihou'){
                            var projectId = proinfo[j].projectId;      //这里通过key获取对应的值，作为详情按钮的属性保存
                        }else {
                            var projectId = proinfo[j].projectId;          //这里通过key获取对应的值，作为详情按钮的属性保存
                            var projectPhase = proinfo[j].projectPhase;   //这里通过key获取对应的值，作为详情按钮的属性保存
                            var projectType = proinfo[j].projectType;         //这里通过key获取对应的值，作为详情按钮的属性保存
                        }

                        html += '<div class="percontent">'
                                + '<div class= ' + proType + '></div>'
                                + '<div class="percontent-content">'
                                + '<table>'
                                + '<tbody>'
                                + trHtml
                                + '</tbody>'
                                + '</table>'
                                + '</div>'
                                + '<div class="operation">'
                                + '<span class="viewDetail" type = "' + proType + '"  data-fieldName="' + fieldName + '" data-ajbm="' + currentAjbm + '"  data-projectid="' + projectId + '" data-projectname="' + projectName + '" data-planunit="' + org + '">详情</span>'
                                + '</div>'
                                + '</div>';
                    }

                //}
                containerObj.html(html);


                //绑定查看项目触发事件
                $(".percontent").on('click', { context: this }, function (e) {e.data.context._zoomTo(e);});


                //插入详情容器
                //L.DCI.App.pool.get("rightPanel").details();
                //插入页码
                //if (this.pageNum >= 1) {
                    //调用分页函数
                    var _this = this;
                    var page = new L.DCI.Pagination({
                        pageCount: this.pageNum,
                        currentPage: this.currentPage,
                        showPageNum: 5,
                        containerObj: $('.queryresult-data-container .bottom'),
                        pageChange: function (page) {
                            _this.changePage(page);
                        }
                    });

                numTotal = '<div class = "NumTotal" style=" position: absolute;top: 0px;">' + this._bzTotal + '/' + this._ssTotal + '/' + this._phTotal + '</div>'
                $('.queryresult-data-container .bottom').append(numTotal);
                
                $('.queryresult-data-container .content').mCustomScrollbar({ theme: 'minimal-dark' });    //滚动条
                                
                    //隐藏加载动画
                    //var obj = $('.result-list-group-loadflash');
                    //L.dci.app.util.hideLoadFlash(obj);
                //编制 绑定查看项目触发事件
                $(".percontent").on('click', 'span.viewDetail', { context: this }, function (e) { e.data.context.viewDetail(e); });
                
            }
        },

        /**
        *改变页码
        *@method changePage
        *@param page {Object}       当前请求的页码
        */
        changePage: function (page) {
            //显示加载动画
            //var obj = $('.result-list-group-loadflash');
            //L.dci.app.util.showLoadFlash(obj);
            this.currentPage = page;
            this._projectData.length = 0;
            this._ProjectSearch(this._key, page)
            //this.getPageData(page, this.maxShowContentNum, this.status, this.condition);
        },
        /**
        *详情点击事件
        *@method viewDetail
        *param e {Object}
        */
        viewDetail: function (e) {
            var type = $(e.target).attr("type");
            
            if (type == "bianzhi") {

                //编制详情页
                //插入详情模板容器
                $('.prosearch-detail').remove();
                $('.control-queryresult').append(this._bzGroup)
                $('.prosearch-detail-content').mCustomScrollbar({ theme: 'minimal-dark' });    //滚动条
                
                //返回按钮
                $(".prosearch-detail").on('click', '.turnback', { context: this }, function (e) { e.data.context.turnBack(e); });
                this.currentAjbm = '';
                var container = $(".prosearch-detail-content .mCSB_container");
                container.html("");
                var planName = $(e.target).attr("data-projectname");
                $(".prosearch-detail .titlecontent").html(planName);
                var fieldName = $(e.target).attr("data-fieldName");
                var projectId = $(e.target).attr("data-projectid");
                var currentAjbm = $(e.target).attr("data-ajbm");
                this.detailDataIndex = $(e.target).attr("number");  //保存当前的项目索引

                $(".prosearch-detail .projectBtn").attr("data-info", projectId);

                var planUnit = $(e.target).attr("data-planunit");
                var fieldName = $(e.target).attr("data-fieldName");
                var projectId = $(e.target).attr("data-projectid");
                this.detailDataIndex = parseInt($(e.target).attr("number"));  //保存当前的项目索引
                container.append(this._bzdetailTemp);
                $(".prosearch-detail .baseInfo-button").attr("data-projectId", projectId);
                $(".prosearch-detail-content .planName").find("td:last-child").html(planName);
                $(".prosearch-detail-content .planUnit").find("td:last-child").html(planUnit);

                //this._bzgetDetailData(fieldName, projectId, currentAjbm); //获取详情信息( 查询字段名、项目编码、案件编码)
                this._bzgetDetailData(planName); //获取详情信息( 查询字段名、项目编码、案件编码)
            } else if (type == "shishi") {
                //实施详情页
                $('.prosearch-detail').remove();          
                $('.control-queryresult').append(this._ssGroup)
                $('.prosearch-detail-content').mCustomScrollbar({ theme: 'minimal-dark' });    //滚动条


                //返回按钮
                $(".prosearch-detail").on('click', '.turnback', { context: this }, function (e) { e.data.context.turnBack(e); });

                var container = $(".prosearch-detail-content-tbody");
                container.html("");
                var prjectId = $.trim($(e.target).attr("data-projectid"));
                var title = $(e.target).attr("data-projectname");
                $(".prosearch-detail .titlecontent").html(title);
                $(".prosearch-detail .projectBtn").attr("data-info", prjectId);
                this._ssgetDetailsData(prjectId); //获取详情信息
            } else if (type == "pihou")
            {
                //批后详情页
                //1124
                //插入详情模板容器   
                $('.prosearch-detail').remove();
                $('.control-queryresult').append(this._phGroup)
                $('.prosearch-detail-content').mCustomScrollbar({ theme: 'minimal-dark' });    //滚动条     
                //返回按钮
                $(".prosearch-detail").on('click', '.turnback', { context: this }, function (e) { e.data.context.turnBack(e); });
                //批后详情信息里的项目详情按钮
                $(".prosearch-detail").on('click', '.projectBtn', { context: this }, function (e) { e.data.context.viewPHProject(e); });
                var container = $(".prosearch-detail-content-tbody");
                container.html("");
                var id = $(e.target).attr("data-projectid");
                var title = $(e.target).attr("data-projectname");
                this.detailDataIndex = $(e.target).attr("number");  //保存当前的项目索引
                $(".prosearch-detail .titlecontent").html(title);
                $(".prosearch-detail .projectBtn").attr("data-info", id);
                this._phgetDetailData(id); //获取详情信息
            }


        },

        /**
        *批后详情信息--项目详情按钮
        *@method turnBack
        */
        viewPHProject:function(e){
            var id = $(".prosearch-detail .projectBtn").attr("data-info");
            L.dci.app.util.tool.autoLogin(id);
        },

        /**
        *编制详情  返回
        *@method turnBack
        */
        turnBack: function () {
            //$(".prosearch-detail").removeClass("active").siblings().addClass("active");
            ////恢复默认值
            //this.detailDataIndex = '0';
            ////取消地图气泡选中状态
            //$(".leaflet-marker-pane  div").removeClass('actived');
            //var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            //map.zoomToFullExtent();
            $(".prosearch-detail").css("display", "none");
            $(".queryresult-data-container").css("display", "block");

            this.deleteLayer();
            

        },
        /**
        *获取项目详情数据
        *@method _getDetailsData
        *@param itemId {String}         项目编号
        */
        _ssgetDetailsData: function (itemId) {
            L.dci.app.services.businessService.getProjectmapDetailsInfo({
                itemId: itemId,
                context: this,
                success: function (res) {
                    $(".queryresult-data-container").css("display", "none");
                    this._insertProjectDetailsContent(res);           //加载项目详情内容
                },
                error: function (e) {
                    L.dci.app.util.dialog.error("错误提示", e.statusText);
                }
            });
        },
        /**
        *插入项目详情内容
        *@method _insertProjectDetailsContent
        *@param data {Object}       数据对象
        */
        _insertProjectDetailsContent: function (data) {

            if (data != null) {
                var projectId, projectPhase, projectType;
                var projectHtml = "";
                for (var att in data) {
                    if (att == "项目编号")
                        projectId = data[att];
                    if (att == "项目阶段")
                        projectPhase = data[att];
                    if (att == "项目类型1")
                        projectType = data[att];
                    if (data[att] != "") {
                        projectHtml += "<tr><td>" + att + "</td><td>" + data[att] + "</td></tr>";
                    }
                }


                var tbodyObj = $(".prosearch-detail table>.prosearch-detail-content-tbody");
                tbodyObj.html(projectHtml);
                $(".prosearch-detail").css('display', 'block');
                //地块全生命周期（图文跳转）
                $(".prosearch-detail-content").on('click', '.viewWholeLifeCycle', { context: this }, function (e) { e.data.context._viewWholeLifeCycle(e); });
                //项目视图（图文跳转）
                $(".prosearch-detail-title").on('click', '.projectBtn', { context: this }, function (e) { e.data.context._viewProject(e); });
                //业务表单（图文跳转）
                $(".prosearch-detail-content").on('click', '.projectPhase-goto-oa', { context: this }, function (e) { e.data.context._viewPhaseProject(e); });
            }

            this.queryProjectLatlng(projectId, projectPhase, projectType);

        },
        /**
        *业务表单点击事件
        *@method viewPhaseProject
        */
        _viewPhaseProject: function (e) {
            //var id = $(".prosearch-detail .projectPhase-goto-oa").attr("data-info");
            var id = $(e.target).attr("data-info");
            if (id == "" || id == undefined)
                L.dci.app.util.dialog.alert("提示", '未能找到该项目');
            else
                L.dci.app.util.tool.autoLogin(id);
        },


        /**
        *项目视图点击事件
        *@method _viewProject
        */
        _viewProject: function () {
            var id = $(".prosearch-detail .projectBtn").attr("data-info");
            L.dci.app.util.tool.autoLogin(id);
        },

        /**
        *地块全生命周期点击事件
        *@method _viewWholeLifeCycle
        */
        _viewWholeLifeCycle: function () {
            this.deleteLayer();
            //项目编号
            var latlng = this.projectLatlng;
            var url = Project_ParamConfig.quickquery[1].url;
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var wholelifecycle = null;
            if (L.dci.app.pool.has("wholelifecycle") == false) {
                wholelifecycle = new L.DCI.Business.WholeLifeCycle();
                L.dci.app.pool.add(wholelifecycle);
            } else {
                wholelifecycle = L.dci.app.pool.get("wholelifecycle");
            }
            wholelifecycle.zgqueryfromProject({ "map": map, "latlng": latlng });
        },

        /**
        *获取项目的空间数据信息
        *@method queryProjectLatlng
        *@param projectId{String} 项目的projectId
        *@param projectPhase{String} 项目阶段
        *@param projectType{String} 项目类型
        */
        queryProjectLatlng: function (projectId, projectPhase, projectType) {
            this.projectLatlng = null;
            var id = $.trim(projectId);
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();

            //项目一张图图层
            this.layer = Project_ParamConfig.quickquery[1].url;
            this.layerIndex = Project_ParamConfig.quickquery[1].layerIndex;

            var query = new L.esri.Tasks.Find(this.layer);
            query.layers(this.layerIndex).text(id).fields("PROJECTID");
            query.params.sr = "";
            query.run(function (error, featureCollection, response) {
                if (error) {
                    L.dci.app.util.dialog.alert("代码:" + error.code, "详情:" + error.message);
                }
                else {
                    var feature = featureCollection.features[0];
                    var geoType = feature.geometry.type;
                    var geo = L.dci.app.util.unproject(map, feature, geoType);
                    this.projectLatlng = geo.getBounds().getCenter();
                    this.features = featureCollection.features[0];

                    //定位
                    map.getHighLightLayer().clearLayers();
                    map.getHighLightLayer().addLayer(geo);
                    L.dci.app.util.zoomTo(map, geo, false);
                    //调用项目阶段类，初始化一个项目阶段类对象，获取对应的html以及事件(参数：项目编号、项目空间数据、项目阶段、项目类型、容器id、功能名称)
                    this.phaseClass = null;
                    this.phaseClass = new L.DCI.Common.PojectPhase(id, feature, projectPhase, projectType, ".prosearch-detail-content-phase", "项目一张图");
                }
            }, this);

        },

        _zoomTo: function (e) {
            $(e.currentTarget)

            var type = e.currentTarget.childNodes[0].className;
            if (type == "bianzhi") {
                var layer = Project_ParamConfig.quickquery[0].url;
                var layerIndex = Project_ParamConfig.quickquery[0].layerIndex;
                var field = "AJBM";
                var id = $.trim($(e.currentTarget).children(".operation").children("span:last-child").attr("data-projectid"));

                this._doQuery(field, id, layer, layerIndex);
                
            } else if (type == "shishi") {
                var layer = Project_ParamConfig.quickquery[1].url;
                var layerIndex = Project_ParamConfig.quickquery[1].layerIndex;
                var field = "PROJECTID";
                var id = $.trim($(e.currentTarget).children(".operation").children("span:last-child").attr("data-projectid"));

                this._doQuery(field, id, layer, layerIndex);
            } else if (type == "pihou") {
                var layer = Project_ParamConfig.quickquery[2].url;
                var layerIndex = Project_ParamConfig.quickquery[2].layerIndex;
                var field = "JYGISDATA.PH_ManageCell.ITEMID";
                var id = $.trim($(e.currentTarget).children(".operation").children("span:last-child").attr("data-projectid"));

                this._doQuery(field, id, layer, layerIndex);
            }
        },

        /**
        *定位项目
        *@method _doQuery
        *@param field{String} 查询字段
        *@param id{String} 查询关键词
        *@param layer{String} 地图服务地址
        *@param layerindex{String} 图层序号
        */
        _doQuery: function (field, id, layer, layerIndex) {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            //清除高亮图层
            map.getHighLightLayer().clearLayers();

            var url = layer + "/" + layerIndex;
            var query = L.esri.Tasks.query(url);
            //构建Where 查询语句 arr
            var arr = field + " LIKE '" + id+"'";

            query.where(arr);
            query.fields(field);
            query.params.outSr = "";

            query.run(function (error, featureCollection, response) {
                if (error) {
                    L.dci.app.util.dialog.alert("代码:" + error.code, "详情:" + error.message);
                } else {
                    if (featureCollection.features.length == 0) {
                        map.getHighLightLayer().clearLayers();
                    } else {
                        var feature = featureCollection.features[0];
                        var geoType = feature.geometry.type;
                        var geo = L.dci.app.util.unproject(map, feature, geoType);
                        //定位
                        map.getHighLightLayer().clearLayers();
                        map.getHighLightLayer().addLayer(geo);
                        L.dci.app.util.zoomTo(map, geo, false);
                    }
                };
            });

        },



        /**
        *删除项目阶段中默认加载图
        *@method deleteLayer
        */
        deleteLayer: function () {
            if (this.phaseClass != null) {
                this.phaseClass.deleteLayer();
            }
        },
        /**
        *批后获取详情数据
        *@method getDetailData
        *@param id {String}  ItemID
        */
        _phgetDetailData: function (id) {
            L.dci.app.services.businessService.getApprovedTrackingDetailData({
                id: id,
                context: this,
                success: function (res) {
                    $(".queryresult-data-container").css("display", "none");

                    $(".prosearch-detail").html = '';
                    $(".prosearch-detail-content").html = '';

                    var data = res;
                    var itemId = res[0].ItemID;//获取详情的ItemId
                    var container = $(".prosearch-detail-content-tbody");
                    var trHtml = '';
                    if (data.length == 0) {
                        trHtml += '<tr><td colspan="3">没有匹配的数据!</td></tr>';
                    } else {
                        for (var i = 0; i < data.length; i++) {
                            var value1 = '否';
                            var value2 = '否';
                            if (data[i].IsViolation == 1)   //是否存在违规
                                value1 = "是";
                            if (data[i].IsDispose == 1)     //是否已处理
                                value2 = "是";
                            trHtml += '<tr><td>' + data[i].StatusName + '</td><td>' + value1 + '</td><td>' + value2 + '</td></tr>';
                        }
                    }
                    container.append(trHtml);
                    $(".prosearch-detail").css('display', 'block');
                },
                error: function (e) {
                    L.dci.app.util.dialog.error("错误提示", e.statusText);
                }
            });
        },
        /**
        *编制获取详情数据
        *@method getDetailData
        *@param planName {String}       名称
        //*@param fieldName {String}       查询字段名称
        //*@param projectId {String}       项目编码Xmbm
        //*@param currentAjbm {String}     案件编码Ajbm
        */
        _bzgetDetailData: function (planName) {
            L.dci.app.services.businessService.getCompileMapDetailInfo({
                //fieldName: fieldName,
                //projectId: projectId,
                id: planName,
                context: this,
                success: function (res) {
                    $(".queryresult-data-container").css("display", "none");
                    
                    //var container = $(".prosearch-detail-content .mCSB_container");
                    //container.html("");
                    //container.append(this._bzdetailTemp);

                    //this.data = null;
                    //this.data = res;

                    //var objs = res.Values;              //这里的数据统一按照入库时间的升序
                    //if (objs.length >= 2) {
                    //    var html = '<span class="resultsContrast">成果对比</span>';
                    //    $(".regulatoryplan-detail-experience").after(html);
                    //}


                    $(".prosearch-detail").css('display', 'block');
                    
                },
                error: function (e) {
                    L.dci.app.util.dialog.error("错误提示", e.statusText);
                }
            });
        },

        //项目搜索 end

        /**
        *清除结果
        *@method clear
        */
        clear: function () {
            this._count = 0;
            this._results = [];
            //this._queryResult = null;
        },
        /**
        *显示结果
        *@method showResult
        */
        showResult: function () {
            this._queryResult.load(this._results);

            var result = this.splitFeatures(this._results);      //总数据拆分
            this.showList(result);
        },
        /**
        *总数据拆分
        *@method splitFeatures
        *@param features {Array} 要素结果集
        */
        splitFeatures: function (features) {
            var layerNameArray = new Array();   //layername名称集
            var resultArray = new Array();      //拆分数据集（里面包含各个layername名称的数据集）

            if (features.length > 0) {
                //获取layername的数组
                for (var i = 0; i < features.length; i++) {
                    var name = features[i].layerName;
                    if (layerNameArray.length == 0)
                        layerNameArray.push(name);
                    else {
                        var num = 1;
                        for (var j = 0; j < layerNameArray.length; j++) {
                            if (name == layerNameArray[j]) {
                                num = 0;
                                break;
                            }
                        }
                        if (num == 1) {
                            layerNameArray.push(name);
                        }
                    }
                }

                //获取每个layername名称的数据集
                for (var i = 0; i < layerNameArray.length; i++) {
                    var array = new Array();
                    for (var j = 0; j < features.length; j++) {
                        if (layerNameArray[i] == features[j].layerName) {
                            var obj = features[j];
                            array.push(obj);
                        }
                    }
                    var resultObj = array;
                    resultArray.push(resultObj);
                }

                //保存所有的数据集
                var featureObj = features;
                resultArray.push(featureObj);
            }

            return resultArray;
        },
        /**
        *显示列表对象（option数组最后一个是总的数据集）
        *@method showList
        */
        showList: function (option) {
            var length = option.length;
            var resultsum = "";
            var obj = $(".resultselect-choice>ul");
            var liHtml = '';
            if (length > 0) {
                resultsum = "全局搜索(" + option[length - 1].length + ") ";
                $(".textContent").text(resultsum);
                $(".resultselect").attr("data-info", length - 1);
                //var span = '<span id="resultselect-span" class="icon-arrows-down"></span>';
                //$(".resultselect").append(span);
                liHtml = liHtml + '<li data-info="' + (length - 1) + '">全局搜索(' + option[length - 1].length + ')</li>';
                for (var i = 0; i < length - 1; i++) {
                    liHtml += '<li data-info="' + i + '">' + option[i][0].layerName + '(' + option[i].length + ')' + '</li>';
                }
                obj.html(liHtml);

            } else {
                resultsum = "全局搜索（0)";
                $(".textContent").text(resultsum);
                $(".resultselect").attr("data-info", -1);
            }
        },
    });

    return L.DCI.QuickQuery;
});