/**
*批后一张图（批后跟踪情况/违规项目情况）类
*@module modules.business
*@class DCI.Business.ApprovedTracking
*@constructor initialize
*@extends DCI.Layout
*/
define("business/approvedtracking", [
    "leaflet",
    "core/dcins",
    "plugins/scrollbar",
    "plugins/pagination"
], function (L) {
    L.DCI.Business.ApprovedTracking = L.DCI.Layout.extend({
        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: 'business-approvedtracking',

        /**
        *保存当前的分页数据
        *@property data
        *@type {Object}
        *@private
        */
        data: null,

        /**
        *模块名称
        *@property _name
        *@type {String}
        *@private
        */
        _clsName: null,
        /**
        *过滤条件数据
        *@property queryData
        *@type {Object}
        *@private
        */
        queryData: null,
        /**
        *查询区域   (0为查询全部区域)
        *@property region
        *@type {String}
        *@private
        */
        region: '0',

        /**
        *查询阶段   (0为查询全部阶段)
        *@property stage
        *@type {String}
        *@private
        */
        stage: '0',

        /**
        *筛选条件   (0为查询全部)
        *@property condition
        *@type {String}
        *@private
        */
        condition: '0',

        /**
        *总共有多少页数据
        *@property pageNum
        *@type {Number}
        *@private
        */
        pageNum: 0,

        /**
        *当前显示页码
        *@property currentPage
        *@type {Number}
        *@private
        */
        currentPage: 1,

        /**
        *每页最多显示内容个数
        *@property maxShowContentNum
        *@type {Number}
        *@private
        */
        maxShowContentNum: 10,

        /**
        *保存查看的详情的项目当前页索引号(默认值为-1)
        *@property detailDataIndex
        *@type {Number}
        *@private
        */
        detailDataIndex: -1,

        /**
        *判断是项目列表或项目详情内容（false为项目列表，反之为项目详情）
        *@property isDetail
        *@type {Boolean}
        *@private
        */
        isDetail: false,

        /**
        *html模板
        *@property temp
        *@type {String}
        *@private
        */
        temp: '<div class="approvedtracking active">'
                + '<div class="top">'
                    + '<div class="filtrate-top-content" data-info="0"><span>区域：</span><span class="region"></span><span id="trackingArea"  class="icon-arrows-down"></span></div>'
                    + '<div class="filtrate-top-content" data-info="1"><span>阶段：</span><span class="stage"></span><span id="trackingState"  class="icon-arrows-down"></span></div>'
                    + '<div class="search icon-search-icon"></div>'
                + '</div>'
                + '<div class="searchBar"><input type="text" placeholder="请输入项目关键字"/><span>搜索</span></div>'
                + '<div class="filtrate-top filtrate-top-left"><ul></ul></div>'
                + '<div class="filtrate-top filtrate-top-right"><ul></ul></div>'
                + '<div class="content"></div>'
                + '<div class="bottom"></div>'
             + '</div>'
             + '<div class="approvedtracking-detail">'
                + '<div class="approvedtracking-detail-title">'
                    + '<span class="turnback icon-return"></span>'
                    + '<div class="titlecontent"></div>'
                    + '<span class="projectBtn" data-info="">项目详情</span>'
                + '</div>'
                + '<div class="approvedtracking-detail-content">'
                    + '<table class="table table-bordered">'
                        + '<thead><tr><th>批后进度</th><th>是否存在违规</th><th>是否已处理</th></tr></thead>'
                        + '<tbody class="approvedtracking-detail-content-tbody"></tbody>'
                    + '</table>'
                + '</div>'
             + '</div>',
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this._clsName = Project_ParamConfig.phOneMapConfig.name;
        },

        /**
        *获取批后跟踪内容模版
        *@method getBody
        *@return {String} 内容模版
        */
        getBody: function () {
            return this.temp;
        },

        /**
        *获取当前页数据
        *@method getCurrentData
        *@return {Array} 当前页数据
        */
        getCurrentData: function () {
            return this.currentData;
        },

        /**
        *加载入口--批后跟踪情况内容
        *@method load
        */
        load: function (isAddData) {
            $('.approvedtracking .content').mCustomScrollbar({ theme: 'minimal-dark' });   //滚动条
            $('.approvedtracking-detail-content').mCustomScrollbar({ theme: 'minimal-dark' });   //滚动条

            //插入筛选头部显示内容
            $(".approvedtracking .filtrate-top-content .region").text("全部区域");
            $(".approvedtracking .filtrate-top-content .stage").text("全部阶段");

            //插入过滤条件信息
            this.getQueryData();
            //初始化变量，并获取内容
            this.currentPage = 1;
            this.maxShowContentNum = 10;
            this.region = '0';
            this.stage = '0';
            this.condition = '0';
            if (isAddData == undefined || isAddData == true)
                this.getPageData(this.currentPage, this.maxShowContentNum, this.region, this.stage, this.condition);

            //展开或隐藏--tab
            $(".approvedtracking").on('click', 'div.filtrate-top-content', { context: this }, function (e) { e.data.context.switchTab(e); });
            //改变区域
            $(".approvedtracking .filtrate-top-left").on('click', 'li', { context: this }, function (e) { e.data.context.changeRegion(e); });
            //改变阶段
            $(".approvedtracking .filtrate-top-right").on('click', 'li', { context: this }, function (e) { e.data.context.changeStage(e); });
            //显示或隐藏搜索栏
            $(".approvedtracking .top").on('click', 'div.search', { context: this }, function (e) { e.data.context._showSearch(e); });
            //点击搜索
            $(".approvedtracking .searchBar").on('click', 'span', { context: this }, function (e) { e.data.context._clickSearch(e); });
            //搜索(回车键触发)
            $(".approvedtracking .searchBar").on('keydown', 'input', { context: this }, function (e) {
                var e = e || window.event;
                if (e.keyCode == 13) {
                    e.data.context._clickSearch(e);
                    return false;
                }
            });

            //查看详情
            $(".approvedtracking").on('click', 'span.viewDetail', { context: this }, function (e) {
                e.data.context.viewDetail(e);
            });

            $(".approvedtracking").on('click', 'div.percontent', { context: this }, function (e) {
                var _this = e.data.context;
                $(".approvedtracking .percontent").removeClass("selected");
                $(e.currentTarget).addClass("selected");
                _this.detailDataIndex = $(e.currentTarget).children(".operation").children("span:last-child").attr("number");
                var id = $(e.currentTarget).children(".operation").children("span:last-child").attr("data-projectid");
                var ids = [id];
                _this._zoomTo(ids);
            });

            //返回按钮
            $(".approvedtracking-detail").on('click', '.turnback', { context: this }, function (e) { e.data.context.turnBack(e); });
            //查看项目（图文跳转）
            $(".approvedtracking-detail").on('click', 'span.projectBtn', { context: this }, function (e) { e.data.context.viewProject(e); });
        },

        /**
        *获取过滤条件
        *@method getQueryData
        */
        getQueryData: function () {
            L.dci.app.services.businessService.getApprovedMapConditionData({
                context: this,
                success: function (res) {
                    this.queryData = res;
                    this.insertAllRegions();        //插入区域信息
                    this.insertAllStages();         //插入阶段信息
                },
                error: function () {
                    L.dci.app.util.dialog.alert("温馨提示", "未找到对应的服务地址");
                }
            });
        },

        /**
        *获取分页数据（批后跟踪情况）
        *@method getPageData
        *@param currentPage {Number}       当前请求的页码
        *@param maxShowNum {Number}        每页最多显示内容个数
        *@param region {String}            查询区域
        *@param stage {String}             查询阶段
        *@param condition {String}         筛选条件
        */
        getPageData: function (currentPage, maxShowNum, region, stage, condition) {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            map.getHighLightLayer().clearLayers();

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
                    //恢复默认值
                    this.detailDataIndex = -1;

                    this.data = null;
                    this.data = res;
                    this.pageNum = this.data.PageCount;         //一共多少页
                    this.insertContent();                       //加载批后跟踪内容
                },
                error: function () {
                    L.dci.app.util.dialog.alert("温馨提示", "未找到对应的服务地址");
                }
            });
        },


        /**
        *根据ID查询项目
        *@method queryByIds
        *@param items{Array} 结果数组
        */
        queryByIds: function (items) {
            $(".approvedmap_tab>span:eq(1)").addClass("active").siblings().removeClass("active");
            $(".approvedmap_tabContent2").addClass("active").siblings().removeClass("active");
            $(".approvedmap").addClass("active").siblings().removeClass("active");
            $(".approvedtracking-detail").removeClass("active");
            $(".approvedtracking .filtrate-top>ul>li").removeClass("active");
            $(".approvedtracking .filtrate-top>ul>li:first-child").addClass("active");
            $(".approvedtracking .filtrate-top-content .region").text("全部区域");
            $(".approvedtracking .filtrate-top-content .stage").text("全部阶段");
            //状态信息
            L.DCI.App.pool.get('business-approvedmap').tabIndex = 1;

            var ids = [];
            for (var i = 0; i < items.length; i++) {
                ids.push(items[i].attributes[Project_ParamConfig.phOneMapConfig.queryAttribute]);
            }
            if (ids.length == 0)
            {
                //状态信息
                this.detailDataIndex = -1;
                this.isDetail = false;

                this.data = [];
                $(".approvedmap").addClass("active").siblings().removeClass("active");
                $(".approvedtracking-detail").removeClass("active");
                $(".approvedtracking").addClass("active");
                this._currentSelectedObj = null;
                this.insertContent();
                return;
            }
            this._currentSelectedObj = items[0];
            L.dci.app.services.businessService.queryPhByIds({
                caseIds: ids.join(','),
                context: this,
                success: function (res) {
                    this.data = null;
                    this.pageNum = 0;
                    this.data = res;
                    this.pageNum = this.data.PageCount;
                    if (res.Count == 1)
                    {
                        //状态信息
                        this.detailDataIndex = 0;
                        this.isDetail = true;

                        this.insertContent();
                        $(".approvedtracking-detail").addClass("active").siblings().removeClass("active");
                        var container = $(".approvedtracking-detail-content-tbody");
                        container.html("");

                        var obj = res.Objects[0];
                        var id = obj.ItemID;
                        var title = obj.Xmmc;
                        $(".approvedtracking-detail .titlecontent").html(title);
                        $(".approvedtracking-detail .projectBtn").attr("data-info", id);
                        this.getDetailData(id); //获取详情信息
                    } else
                    {
                        //状态信息
                        this.detailDataIndex = -1;
                        this.isDetail = false;

                        $(".approvedtracking").addClass("active");
                        this.insertContent();
                    }

                    //高亮列表栏项
                    var selecteds = $(".approvedtracking .percontent");
                    var projectId;
                    for (var i = 0; i < selecteds.length; i++) {
                        projectId = $.trim($(selecteds[i]).children(".operation").children(".viewDetail").attr("data-projectid"));
                        if (projectId == ids[0])
                        {
                            this.detailDataIndex = i;
                            $(selecteds[i]).addClass("selected");
                            break;
                        }
                    }
                }
            });
        },

        /**
        *插入全部区域内容
        *@method insertAllRegions
        */
        insertAllRegions: function () {
            var data = this.queryData[0].Values;        //区域的信息
            var queryName = this.queryData[0].Key;      //数据库查询字段名
            var obj = $(".filtrate-top-left>ul");
            var liHtml = '';
            liHtml += '<li class="active" data-info="' + queryName + '">全部区域</li>';
            for (var att in data) {
                liHtml += '<li data-info="' + queryName + '">' + data[att] + '</li>';
            }
            obj.html(liHtml);
        },

        /**
        *插入全部阶段内容
        *@method insertAllStages
        */
        insertAllStages: function () {
            var data = this.queryData[1].Values;   //阶段的信息
            var queryName = this.queryData[1].Key; //数据库查询字段名
            var obj = $(".filtrate-top-right>ul");
            var liHtml = '';
            liHtml += '<li class="active" data-info="' + queryName + '">全部阶段</li>';
            for (var att in data) {
                liHtml += '<li data-info="' + queryName + '">' + data[att] + '</li>';
            }
            obj.html(liHtml);
        },

        /**
        *插入批后跟踪情况内容
        *@method insertContent
        */
        insertContent: function () {
            //清空内容区域和页码区域
            var containerObj = $(".approvedtracking .content .mCSB_container");
            containerObj.html("");
            $('.approvedtracking .bottom').html("");

            var data = this.data.Objects;       //保存具体内容数据
            var columnName = this.data.Columns; //保存列名称
            //判断是否有匹配数据
            if (data == null || data.length == 0) {
                var html = '<p class="emptyResult">无匹配数据</p>';
                containerObj.html(html);
            }
            else {
                var html = '';
                for (var i = 0; i < data.length; i++) {
                    var trHtml = '';
                    var obj = data[i];
                    var IsDispose = '';
                    for (var att in obj) {//遍历要插入的字段信息
                        var key = att;
                        for (var kk in columnName) {//将英文字段名改为对应的中文名
                            if (att == kk) {
                                key = columnName[kk];
                                break;
                            }
                        }

                        //保存是否已处理字段值做标识判断
                        if (obj[IsDispose] != null) {
                            IsDispose = obj[IsDispose];
                        }

                        //过滤不显示的字段
                        if (!L.dci.app.util.tool.isShowAttribute(Project_ParamConfig.phOneMapConfig.attributes, att))
                            continue;
                        else {
                            trHtml += '<tr><td>' + key + ':</td><td>' + obj[att] + '</td></tr>';
                        }
                    }

                    var projectId = data[i]["ItemID"];      //这里通过key获取对应的值，作为详情按钮的属性保存
                    var projectName = data[i]["Xmmc"];      //这里通过key获取对应的值，作为详情按钮的属性保存
                    var number = i;
                    html += '<div class="percontent">'
                                + '<div class="pic1">'
                                + '</div>'
                                + '<div class="percontent-content">'
                                    + '<table>'
                                        + '<tbody>'
                                            + trHtml
                                        + '</tbody>'
                                    + '</table>'
                                + '</div>'
                                + '<div class="operation">'
                                    + '<span class=""></span>'     //这个类看情况添加iconMark
                                    + '<span class="viewDetail" number = ' + number + '  data-projectid="' + projectId + '" data-projectname="' + projectName + '">详情</span>'
                                + '</div>'
                             + '</div>';
                }
                containerObj.html(html);
                //调用分页函数
                var _this = this;
                var page = new L.DCI.Pagination({
                    pageCount: this.pageNum,
                    currentPage: this.currentPage,
                    showPageNum: 5,
                    containerObj: $('.approvedtracking .bottom'),
                    pageChange: function (page) {
                        _this.changePage(page);
                    }
                });

            }
        },

        /**
        *展开或隐藏tab页
        *@method switchTab
        *@param e {Object}event对象
        */
        switchTab: function (e) {
            var ele = $('.approvedtracking .filtrate-top-content');
            var targetObj = $(e.target).is(ele) ? $(e.target) : $(e.target).parent();
            var num = targetObj.attr("data-info");
            var eleActive = 'active';
            var tab1 = $(".approvedtracking .filtrate-top-left");
            var tab2 = $(".approvedtracking .filtrate-top-right");
            this._hideSearch();
            if (num == 0) {
                //区域tab
                if (targetObj.hasClass(eleActive) == false) {//展开tab1对应内容
                    if (targetObj.siblings().hasClass(eleActive) == false) {//没有其它tab内容展开的情况，直接展开当前的tab内容
                        targetObj.addClass(eleActive);                                  //高亮tab
                        $("#trackingArea").removeClass().addClass("icon-arrows-up");    //改变展开图标
                        tab1.slideDown("fast");                                       //展开tab1内容
                    } else {//有其它tab内容展开的情况，首先隐藏已展开的内容，再展开当前的tab内容
                        targetObj.siblings().removeClass(eleActive);                    //取消高亮tab
                        $("#trackingState").removeClass().addClass("icon-arrows-down"); //改变展开图标
                        tab2.slideUp("fast");                                       //隐藏tab2内容
                        targetObj.addClass(eleActive);                                  //高亮tab
                        $("#trackingArea").removeClass().addClass("icon-arrows-up");    //改变展开图标
                        tab1.slideDown("fast");                                       //展开tab1内容
                    }
                }
                else {//隐藏tab1对应内容
                    targetObj.removeClass(eleActive);
                    $("#trackingArea").removeClass().addClass("icon-arrows-down");
                    tab1.slideUp("fast");
                }

            } else {//阶段tab
                if (targetObj.hasClass(eleActive) == false) {//展开tab2对应内容
                    if (targetObj.siblings().hasClass(eleActive) == false) {//没有其它tab内容展开的情况，直接展开当前的tab内容
                        targetObj.addClass(eleActive);
                        $("#trackingState").removeClass().addClass("icon-arrows-up");
                        tab2.slideDown("fast");                                       //展开tab2内容
                    } else {//有其它tab内容展开的情况，首先隐藏已展开的内容，再展开当前的tab内容
                        targetObj.siblings().removeClass(eleActive);
                        tab1.removeClass(eleActive);
                        $("#trackingArea").removeClass().addClass("icon-arrows-down");
                        tab1.slideUp("fast");                                       //隐藏tab1内容              
                        targetObj.addClass(eleActive);
                        $("#trackingState").removeClass().addClass("icon-arrows-up");
                        tab2.slideDown("fast");                                       //展开tab2内容
                    }
                }
                else {//隐藏tab2对应内容
                    targetObj.removeClass(eleActive);
                    $("#trackingState").removeClass().addClass("icon-arrows-down");
                    tab2.slideUp("fast");
                }
            }

        },

        /**
        *改变区域
        *@method changeRegion
        *@param e {Object}event对象
        */
        changeRegion: function (e) {
            var targetObj = $(e.target);
            var eleActive = 'active';
            targetObj.siblings().removeClass(eleActive);
            targetObj.addClass(eleActive);
            var text = targetObj.text();
            if (text == "全部区域")
                this.region = '0';
            else {
                var obj = this.queryData[0].Values;
                for (var att in obj) {
                    if (obj[att] == text) {
                        this.region = att;
                        break;
                    }
                }
            }
            $(".approvedtracking .filtrate-top-content .region").text(text);
            //请求数据
            this.condition = '0';   //条件项默认为全部
            this.currentPage = 1;   //恢复默认第一页
            this.getPageData(this.currentPage, this.maxShowContentNum, this.region, this.stage, this.condition);
            //隐藏tab内容
            $(".approvedtracking .filtrate-top-content.active").click();
        },

        /**
        *改变阶段
        *@method changeStage
        *@param e {Object}event对象
        */
        changeStage: function (e) {
            var targetObj = $(e.target);
            var eleActive = 'active';
            if (targetObj.hasClass(eleActive) == false) {
                targetObj.siblings().removeClass(eleActive);
                targetObj.addClass(eleActive);
                var text = targetObj.text();
                if (text == "全部阶段") {
                    this.stage = '0';
                } else {
                    var obj = this.queryData[1].Values;
                    for (var att in obj) {
                        if (obj[att] == text) {
                            this.stage = att;
                            break;
                        }
                    }
                }
                $(".approvedtracking .filtrate-top-content .stage").text(text);
                //请求数据
                this.condition = '0';   //条件项默认为全部
                this.currentPage = 1;   //恢复默认第一页
                this.getPageData(this.currentPage, this.maxShowContentNum, this.region, this.stage, this.condition);
            }
            //隐藏tab内容
            $(".approvedtracking .filtrate-top-content.active").click();
        },

        /**
        *搜索
        *@method _clickSearch
        *@param e {Object}event对象
        */
        _clickSearch: function (e) {
            var condition = $.trim($(".approvedtracking>.searchBar>input").val());
            if (condition == "") {
                L.dci.app.util.dialog.alert("温馨提示", "请输入查询关键字");
                this.condition = "0";
            } else {
                condition = condition.replace(/\s/g, "");
                var patt1 = /[^a-zA-Z0-9\u4E00-\u9FA5]/g;    //匹配所有字母数字和中文
                var result = patt1.test(condition);
                if (result == true)
                {
                    L.dci.app.util.dialog.alert("温馨提示", "搜索内容不能包含特殊字符");
                    return;
                }
                else
                    this.condition = condition;
            }
            //恢复默认第一页
            this.currentPage = 1;
            this.getPageData(this.currentPage, this.maxShowContentNum, this.region, this.stage, this.condition);
        },

        /**
        *显示搜索栏
        *@method _showSearch
        */
        _showSearch: function (e) {
            if (!$(".approvedtracking .searchBar").hasClass("active")) {
                $(".approvedtracking .searchBar").addClass("active");
                $(".approvedtracking .mCSB_container").addClass("searchBarActive");
                $(".approvedtracking .searchBar input").focus();
            }
            else {
                this._hideSearch();
            }
        },

        /**
        *隐藏搜索栏
        *@method _hideSearch
        */
        _hideSearch: function (e) {
            $(".approvedtracking>.searchBar>input").val("");
            $(".approvedtracking .searchBar").removeClass("active");
            $(".approvedtracking .mCSB_container").removeClass("searchBarActive");
            this.condition = 0;
        },

        /**
        *详情点击事件
        *@method viewDetail
        *@param e {Object}event对象
        */
        viewDetail: function (e) {
            //状态为详情内容
            this.isDetail = true;
            $(".approvedtracking-detail").siblings().removeClass("active").end().addClass("active");
            var container = $(".approvedtracking-detail-content-tbody");
            container.html("");
            var id = $(e.target).attr("data-projectid");
            var title = $(e.target).attr("data-projectname");
            this.detailDataIndex = parseInt($(e.target).attr("number"));  //保存当前的项目索引
            $(".approvedtracking-detail .titlecontent").html(title);
            $(".approvedtracking-detail .projectBtn").attr("data-info", id);
            this.getDetailData(id); //获取详情信息
        },

        /**
        *改变页码
        *@method changePage
        *@param page {Object}       当前请求的页码
        */
        changePage: function (page) {
            this.currentPage = page;
            this.getPageData(page, this.maxShowContentNum, this.region, this.stage, this.condition);
        },

        /**
        *返回
        *@method turnBack
        */
        turnBack: function () {
            //状态为项目列表
            this.isDetail = false;
            $(".approvedtracking-detail").removeClass("active").siblings().addClass("active");
            //取消原来保留项目选中状态
            var ele = $(".approvedtracking").find("div.percontent")[this.detailDataIndex];
            $(ele).removeClass("selected");
            this.detailDataIndex = -1;
            //取消地图气泡选中状态
            $(".leaflet-marker-pane  div").removeClass('actived');
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            _map.getHighLightLayer().clearLayers();
        },

        /**
        *项目详情点击事件
        *@method viewProject
        */
        viewProject: function () {
            var id = $(".approvedtracking-detail .projectBtn").attr("data-info");
            L.dci.app.util.tool.autoLogin(id);
        },

        /**
        *获取详情数据
        *@method getDetailData
        *@param id {String}ItemID
        */
        getDetailData: function (id) {
            L.dci.app.services.businessService.getApprovedTrackingDetailData({
                id: id,
                context: this,
                success: function (res) {
                    var data = res;
                    var container = $(".approvedtracking-detail-content-tbody");
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
                },
                error: function () {
                    L.dci.app.util.dialog.alert("温馨提示", "未找到对应的服务地址");
                }
            });
        },

        /**
        *根据当前ID定位项目
        *@method _zoomTo
        *@param value{Array}ID数组
        */
        _zoomTo: function (value) {
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();
            _map.eachLayer(function (layer) {
                if (layer.options
                    && layer.options.id != "baseLayer"
                    && layer.options.id != null
                    && layer.options.name == this._clsName) {
                    var queryUrl = layer.url;
                    layer.metadata(function (error, metadata) {
                        if (metadata == null) return;
                        for (var i = 0 ; i < metadata.layers.length; i++) {
                            if (metadata.layers[i].name == this._clsName) {
                                queryUrl += metadata.layers[i].id.toString();
                            };
                        }
                        L.dci.app.util.locate.doQuery(queryUrl, Project_ParamConfig.phOneMapConfig.zoomItemName, value, function (featureCollection, response) {
                            this._currentSelectedObj = featureCollection;
                        });
                    }, this);
                }
            }, this);
        },


    });
    return L.DCI.Business.ApprovedTracking;
});

