/**
*编制一张图（控制性详细规划）类
*@module modules.business
*@class DCI.Business.RegulatoryPlan
*@constructor initialize
*/
define("business/regulatoryplan", [
    "leaflet",
    "core/dcins",
    "plugins/scrollbar",
    "plugins/pagination",
    "ztree",
    "util/attachment",
    "common/businessTemplate"
], function (L) {

    L.DCI.Business.RegulatoryPlan = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: 'business-compilemap-regulatoryplan',

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
        *保存过滤条件数据
        *@property queryData
        *@type {Object}
        *@private
        */
        queryData: null,

        /**
        *保存查看的详情的项目当前页索引号(默认值为-1)
        *@property detailDataIndex
        *@type {Number}
        *@private
        */
        detailDataIndex: -1,


        /**
        *查询编制状态   (0为查询全部状态)
        *@property status
        *@type {String}
        *@private
        */
        status: '0',

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
        *判断是项目列表或项目详情内容（false为项目列表，反之为项目详情）
        *@property isDetail
        *@type {Boolean}
        *@private
        */
        isDetail: false,


        _currentSelectedObj:null,

        /**
        *项目阶段类
        *@property businessTemplate
        *@type {Object}
        *@private
        */
        businessTemplate: null,


        /**
        *html模板
        *@property temp
        *@type {String}
        *@private
        */
        temp: '<div class="regulatoryplan active">'
                + '<div class="top"></div>'
                + '<div class="searchBar"><input type="text"/><span>搜索</span></div>'
                + '<div class="content"></div>'
                + '<div class="bottom"></div>'
             + '</div>'
             + '<div class="regulatoryplan-detail">'
                + '<div class="regulatoryplan-detail-title">'
                    + '<span class="turnback icon-return"></span>'
                    + '<div class="titlecontent"></div>'
                + '</div>'
                + '<div class="regulatoryplan-detail-content"></div>'
             + '</div>',

        /**
        *html详情模板
        *@property detailTemp
        *@type {String}
        *@private
        */
        detailTemp: '<div class="baseInfo">'
                    + '<p class="baseInfo-title">基本信息</p><p class="baseInfo-button" data-projectId=""><span>查看附件</span><span>查看表单</span></p>'
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
        *初始化
        *@method initialize
        */
        initialize: function () {
            this._clsName = Project_ParamConfig.bzOneMapConfig.name;
            this._map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            this.config = Project_ParamConfig.bzOneMapConfig.detailConfig;
            this._currentLayerUrl = this.config[0].url;
            this._currentLayerIndex = 0;
            this._historyLayerUrl = this.config[1].url;;
            this._historyLayerIndex = 0;
            this._addLayer();
        },

        /**
        *获取内容模版
        *@method getBody
        *@return {String} 内容模版
        */
        getBody: function () {
            return this.temp;
        },

        /**
        *加载入口--控制性详细规划内容
        *@method load
        */
        load: function (isAddData) {
            $('.regulatoryplan .content').mCustomScrollbar({ theme: 'minimal-dark' });          //滚动条
            $('.regulatoryplan-detail-content').mCustomScrollbar({ theme: 'minimal-dark' });    //滚动条

            //插入过滤条件信息
            this.getQueryData();
            this.currentPage = 1;
            if (isAddData == undefined || isAddData == true)
                this.getPageData(this.currentPage, this.maxShowContentNum, this.status, this.condition);//获取控制性详细规划数据

            //点击状态
            $(".regulatoryplan .top").on('click', 'span:not(:last)', { context: this }, function (e) { e.data.context._switchTab(e); });
            //显示或隐藏搜索栏
            $(".regulatoryplan .top").on('click', 'span:last', { context: this }, function (e) { e.data.context._showSearch(e); });
            //点击搜索
            $(".regulatoryplan .searchBar").on('click', 'span', { context: this }, function (e) { e.data.context._clickSearch(e); });
            //搜索(回车键触发)
            $(".regulatoryplan .searchBar").on('keydown', 'input', { context: this }, function (e) {
                var e = e || window.event;
                if (e.keyCode == 13) {
                    e.data.context._clickSearch(e);
                    return false;
                }
            });

            //绑定查看项目触发事件
            $(".regulatoryplan").on('click', 'span.viewDetail', { context: this }, function (e) {
                e.data.context.viewDetail(e);
            });

            $(".regulatoryplan").on('click', 'div.percontent', { context: this }, function (e) {
                var _this = e.data.context;
                $(".regulatoryplan .percontent").removeClass("selected");
                $(e.currentTarget).addClass("selected");
                var id = $(e.currentTarget).children(".operation").children("span:last-child").attr("data-ajbm");
                _this.detailDataIndex = $(e.currentTarget).children(".operation").children("span:last-child").attr("number");
                _this._zoomTo(id);
            });

            //返回按钮
            $(".regulatoryplan-detail").on('click', '.turnback', { context: this }, function (e) { e.data.context.turnBack(e); });
            //成果对比
            $(".regulatoryplan-detail").on('click', '.resultsContrast', { context: this }, function (e) { e.data.context.resultsContrast(e); });
        },

        /**
        *获取过滤条件
        *@method getQueryData
        */
        getQueryData: function () {
            L.dci.app.services.businessService.getCompileMapConditionData({
                context: this,
                success: function (res) {
                    this.queryData = res;
                    this.insertAllStatus();         //插入状态信息
                },
                error: function () {
                    L.dci.app.util.dialog.alert("提示", "未找到对应的服务地址");
                }
            });
        },

        /**
        *获取分页数据（控制性详细规划）
        *@method getPageData
        *@param currentPage {Number}       当前请求的页码
        *@param maxShowNum {Number}        每页最多显示内容个数
        *@param status {String}            查询阶段
        *@param condition {String}         筛选条件
        */
        getPageData: function (currentPage, maxShowNum, status, condition) {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            map.getHighLightLayer().clearLayers();

            var year = Project_ParamConfig.bzOneMapConfig.year;//时间
            L.dci.app.services.businessService.getCompileMapPageData({
                year: year,
                page: currentPage,
                maxShowNum: maxShowNum,
                status: status,
                condition: condition,
                context: this,
                success: function (res) {
                    //恢复默认值
                    this.detailDataIndex = -1;

                    this.data = null;
                    this.pageNum = 0;
                    this.data = res;
                    this.pageNum = this.data.PageCount;         //一共多少页
                    this.insertContent();                       //加载批后跟踪内容
                },
                error: function () {
                    L.dci.app.util.dialog.alert("提示", "未找到对应的服务地址");
                }
            });
        },

        /**
        *根据ID查询项目
        *@method queryProjectByIds
        *@param items{Array} 结果数组
        */
        queryProjectByIds: function (items) {
            this.businessTemplate = null
            $(".compilemap_tab>span:last-child").addClass("active").siblings().removeClass("active");
            $(".compilemap_tabContent2").addClass("active").siblings().removeClass("active");
            $(".regulatoryplan").addClass("active").siblings().removeClass("active");
            $(".regulatoryplan .top>span").removeClass("active");
            $(".regulatoryplan .top>span:first-child").addClass("active");

            var ids = [];
            for (var i = 0; i < items.length; i++) {
                ids.push(items[i].attributes[Project_ParamConfig.bzOneMapConfig.queryAttribute]);
            }
            if (ids.length == 0)
            {
                //状态信息
                this.detailDataIndex = -1;
                this.isDetail = false;

                $(".regulatoryplan").addClass("active").siblings().removeClass("active");
                this.data = [];
                this._currentSelectedObj = null;
                this.insertContent();
                return;
            }
            this._currentSelectedObj = items[0];
            L.dci.app.services.businessService.queryBzByIds({
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
                        $(".viewDetail").click();
                    } else
                    {
                        //状态信息
                        this.detailDataIndex = -1;
                        this.isDetail = false;

                        this.insertContent();
                    }
                    //高亮列表栏项
                    var selecteds = $(".regulatoryplan .percontent");
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
        *插入全部状态内容
        *@method insertAllStatus
        */
        insertAllStatus: function () {
            var containerObj = $(".regulatoryplan>.top");
            var data = this.queryData[0].Values;       //获取所有编制状态
            var trHtml = '';

            for (var att in data) {
                if (data[att] == "全部")
                    trHtml += '<span class="active">全部</span>';
                else
                    trHtml += '<span>' + data[att] + '</span>';
            }
            trHtml += '<span class="search icon-search-icon"></span>';
            containerObj.html(trHtml);
        },

        /**
        *插入控制性详细规划内容
        *@method insertContent
        */
        insertContent: function () {
            //清空内容区域和页码区域
            var containerObj = $(".regulatoryplan .content .mCSB_container");
            containerObj.html("");
            $('.regulatoryplan .bottom').html("");
            var data = this.data.Objects;       //保存具体内容数据
            var columnName = this.data.Columns; //保存列名称
            //判断是否有匹配数据
            if (data == null || data.length == 0) {
                var html = '<p class="emptyResult">没有匹配的数据</p>';
                containerObj.html(html);
            }
            else {
                var html = '';
                for (var i = 0; i < data.length; i++) {
                    var trHtml = '';
                    var obj = data[i];
                    var fieldName = 'Ajbm';
                    var currentAjbm = data[i]["Ajbm"];     //默认查询详情用案件编码字段，当项目处于修编状态时，使用项目编码作为查询字段
                    var projectId = data[i]["Xmbm"];        //这里通过key获取对应的值，作为详情按钮的属性保存
                    var projectName = data[i]["PlanName"];  //这里通过key获取对应的值，作为详情按钮的属性保存
                    var planUnit = data[i]["PlanUnit"];     //这里通过key获取对应的值，作为详情按钮的属性保存
                    for (var att in obj) {//遍历要插入的字段信息
                        var key = att;
                        for (var kk in columnName) {//将英文字段名改为对应的中文名
                            if (att == kk) {
                                key = columnName[kk];
                                break;
                            }
                        }
                        //过滤不显示的字段
                        if (!L.dci.app.util.tool.isShowAttribute(Project_ParamConfig.bzOneMapConfig.attributes,att)) {
                            continue;
                        }
                        else if (att.indexOf("Time") > -1) {//开始时间处理   2014-09-10T00:00:00  去掉后面的时间，只保留日期
                            var str = obj[att];
                            var value = str.substring(0, str.indexOf(' '));
                            trHtml += '<tr><td>' + key + ':</td><td>' + value + '</td></tr>';
                        }
                        else {
                            if (obj[att] == null)
                                trHtml += '<tr><td>' + key + ':</td><td></td></tr>';
                            else {
                                //排除“更新时间”
                                if (kk != "UPLOADDATE") 
                                    trHtml += '<tr><td>' + key + ':</td><td>' + obj[att] + '</td></tr>';
                            }
                                
                        }
                    }
                    var number = i;
                    if (parseInt(data[i]["IsPlan"]) > 1) {
                        fieldName = 'Xmbm';
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
                            + '<span class="iconMark"></span>' //当项目处于修编状态时，添加类.iconMark显示修编图标
                            + '<span class="viewDetail" number = ' + number + ' data-fieldName="' + fieldName + '" data-ajbm="' + currentAjbm + '"  data-projectid="' + projectId + '" data-projectname="' + projectName + '" data-planunit="'+ planUnit +'">详情</span>'
                            + '</div>'
                            + '</div>';
                    } else {
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
                            + '<span class=""></span>' //当项目不处于修编状态时，去掉类.iconMark不显示修编图标
                            + '<span class="viewDetail" number = ' + number + ' data-fieldName="' + fieldName + '" data-ajbm="' + currentAjbm + '" data-projectid="' + projectId + '" data-projectname="' + projectName + '" data-planunit="' + planUnit + '">详情</span>'
                            + '</div>'
                            + '</div>';
                    }
                }
                containerObj.html(html);

                //调用分页函数
                var _this = this;
                var page = new L.DCI.Pagination({
                    pageCount: this.pageNum,
                    currentPage: this.currentPage,
                    showPageNum: 5,
                    containerObj: $('.regulatoryplan .bottom'),
                    pageChange: function (page) {
                        _this.changePage(page);
                    }
                });
            }
        },

        /**
        *切换编制状态
        *@method _switchTab
        */
        _switchTab: function (e) {
            var eleActive = 'active';
            var targetObj = $(e.target);
            targetObj.siblings().removeClass(eleActive);
            targetObj.addClass(eleActive);
            var text = targetObj.text();
            //隐藏搜索栏
            this._hideSearch();
            if (text == "全部") {
                this.status = "0";
            } else {
                var obj = this.queryData[0].Values;
                for (var att in obj) {
                    if (obj[att] == text) {
                        this.status = att;
                        break;
                    }
                }
            }
            //恢复当前页为第一页
            this.currentPage = 1;
            this.getPageData(this.currentPage, this.maxShowContentNum, this.status, 0);
        },

        /**
        *显示搜索栏
        *@method _showSearch
        */
        _showSearch: function (e) {
            if (!$(".regulatoryplan .searchBar").hasClass("active")) {
                $(".regulatoryplan .searchBar").addClass("active");
                $(".regulatoryplan .mCSB_container").addClass("searchBarActive");
                $(".regulatoryplan .searchBar input").focus();
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
            $(".regulatoryplan>.searchBar>input").val("");
            $(".regulatoryplan .searchBar").removeClass("active");
            $(".regulatoryplan .mCSB_container").removeClass("searchBarActive");
            this.condition = 0;
        },

        /**
        *点击搜索
        *@method _clickSearch
        */
        _clickSearch: function (e) {
            var condition = $.trim($(".regulatoryplan>.searchBar>input").val());
            if (condition == "") {
                this.condition = "0";
            } else
            {
                condition = condition.replace(/\s/g, "");
                var patt1 = /[^a-zA-Z0-9\u4E00-\u9FA5]/g;    //匹配所有字母数字和中文
                var result = patt1.test(condition);
                if (result == true)
                {
                    L.dci.app.util.dialog.alert("提示", "搜索内容不能包含特殊字符");
                    return;
                }
                else    
                    this.condition = condition;
            }
            //恢复当前页为第一页
            this.currentPage = 1;
            this.getPageData(this.currentPage, this.maxShowContentNum, this.status, this.condition);
        },

        /**
        *详情点击事件
        *@method viewDetail
        */
        viewDetail: function (e) {
            //状态为详情内容
            this.isDetail = true;
            this._currentSelectedObj = null;
            this.currentAjbm = '';
            $(".regulatoryplan-detail").siblings().removeClass("active").end().addClass("active");
            var container = $(".regulatoryplan-detail-content .mCSB_container");
            container.html("");
            var planName = $(e.target).attr("data-projectname");
            $(".regulatoryplan-detail .titlecontent").html(planName);
            var planUnit = $(e.target).attr("data-planunit");
            var fieldName = $(e.target).attr("data-fieldName");
            var projectId = $(e.target).attr("data-projectid");
            this.detailDataIndex =parseInt($(e.target).attr("number"));  //保存当前的项目索引
            container.append(this.detailTemp);
            $(".regulatoryplan-detail .baseInfo-button").attr("data-projectId", projectId);
            $(".regulatoryplan-detail-content .planName").find("td:last-child").html(planName);
            $(".regulatoryplan-detail-content .planUnit").find("td:last-child").html(planUnit);

            //项目信息栏的查看附件
            $(".baseInfo-button>span:first").on('click', { context: this }, function (e) { e.data.context._viewProjectAccessory(e); });
            
            
            this.businessTemplate = null;
            this.getDetailInfo(planName);
        },


        /**
        *项目信息栏的查看附件
        *@method _viewProjectAccessory
        */
        _viewProjectAccessory: function (e) {

            var caseid = e.target.parentElement.getAttribute('data-projectid');

            var atta = new L.DCI.Attachment();
            this.attObject = $(".compilemap_tabContent2")[0];
            //{type} pro:项目附件；case:业务附件
            type = "pro";
            atta.getDirectory(this.attObject, caseid, null, type);

        },

        /**
        *在详情添加图层
        *@method deleteLayer
        */
        _addLayer: function () {
            if (this._currentLayer == null)
                this._currentLayer = this._map.addLayer(this._currentLayerUrl, { layers: [this._currentLayerIndex], id: '编制一张图的现势图层',opacity:0});
            if (this._historyLayer == null)
                this._historyLayer = this._map.addLayer(this._historyLayerUrl, { layers: [this._historyLayerIndex], id: '编制一张图的历史图层', opacity: 0});
        },

        hideLayer:function(){
            this._currentLayer.setOpacity(0);
            this._historyLayer.setOpacity(0);
        },

        /**
        *删除项目阶段中默认加载图
        *@method deleteLayer
        */
        deleteLayer: function () {
            if (this._currentLayer != null)
            {
                this._map.removeLayer(this._currentLayer.options.id);
                this._currentLayer = null;
            }
            if (this._historyLayer != null)
            {
                this._map.removeLayer(this._historyLayer.options.id);
                this._historyLayer = null;
            }
        },

        /**
        *根据caseId编制经历的数据集
        *@method getDetailInfo
        *@param planName{String} 案件编码
        */
        getDetailInfo: function (planName) {
            L.dci.app.services.businessService.getCompileMapDetailInfo({
                id: planName,
                context: this,
                success: function (data) {
                    this.data = null;
                    this.data = data;

                    var objs = data.Values;              //这里的数据统一按照入库时间的升序
                    if (objs.length >= 2)
                    {
                        var html = '<span class="resultsContrast">成果对比</span>';
                        $(".regulatoryplan-detail-experience").after(html);
                    }
                    
                    //获取阶段数组序号
                    var currentIndex =  objs.length-1;
                    this.addRegulatoryContent(this.data,currentIndex);
                },
                error: function () {
                    L.dci.app.util.dialog.alert("提示", "未找到对应的服务地址");
                }
            });
        },

        /**
        *将一个案件的对象转换为显示模块所需的json对象
        *@method createJsonData
        *@param data{Object} 案件对象
        */
        createJsonData: function (data) {
            var dataArray = [];
            //定义要显示的字段和顺序
            var fields = ["CASE_ID", "PLANNAME", "PLANUNIT", "STARTTIME", "ENDTIME", "PASSDATE"];
            var obj = data;
            var json = {};
            for (var j = 0; j < fields.length; j++)
            {
                for (var att in obj)
                {
                    if (att == fields[j])
                    {
                        var stringText = fields[j];
                        switch (stringText)
                        {
                            case 'CASE_ID':
                                var value = obj["CASE_ID"] == null ? "" : obj["CASE_ID"];
                                json["CASE_ID"] = value;
                                break;
                            case 'PLANNAME':
                                var value = obj["PLANNAME"] == null ? "" : obj["PLANNAME"];
                                json["项目名称"] = value;
                                break;
                            case 'PLANUNIT':
                                var value = obj["PLANUNIT"] == null ? "" : obj["PLANUNIT"];
                                json["编制单位"] = value;
                                break;
                            case 'STARTTIME':
                                var value = obj["STARTTIME"] == null ? "" : obj["STARTTIME"];
                                json["编制开始时间"] = value;
                                break;
                            case 'ENDTIME':
                                var value = obj["ENDTIME"] == null ? "" : obj["ENDTIME"];
                                json["编制完成时间"] = value;
                                break;
                            case 'PASSDATE':
                                var value = obj["PASSDATE"] == null ? "" : obj["PASSDATE"];
                                json["上报批复时间"] = value;
                                break;
                            default:
                                break;
                        }
                        break;
                    };
                }
            }
            dataArray.push(json);
            return dataArray;
        },

        /**
        *填充编制经历内容
        *@method addRegulatoryContent
        *@param data{Object} 数据集
        *@param currentIndex{Number} 当前案件在数据集中的索引
        */
        addRegulatoryContent: function (data, currentIndex) {
            
            //信息编制经历
            var numIndex = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十"];
            //获取阶段显示名称（这里为鼠标移到数字上显示）
            this.phaseNames = [];
            var dataArray = [];
            var objs = data.Values;
            for (var i = 0; i < objs.length; i++)
            {
                var titleName = '';
                if (i == 0)
                    titleName = '第一次编制';
                else
                {
                    var num = numIndex[i - 1];
                    titleName = '第' + num + '次调整';
                }

                this.phaseNames.push(titleName);
            }

            //构建数据
            if (objs != null)
            {
                dataArray = this.createJsonData(objs[currentIndex]);
            }

            var _this = this;
            if (this.businessTemplate == null || this.businessTemplate == undefined)
            {
                this.businessTemplate = new L.DCI.Common.BusinessTemplate({
                    container: '.regulatoryplan-detail-experience',
                    title: '编制经历',
                    names: this.phaseNames,
                    data: dataArray,
                    index: currentIndex + 1,
                    theme: 'current',
                    titleWidth: 120,
                    isAnimate: "true",
                    stepClick: function (e) { _this.stepClickEvent(e); },
                    viewAccessory: function (caseId, e) { _this.viewAccessoryEvent(caseId, e); },
                    viewForm: function (caseId, e) { _this.viewFormEvent(caseId, e); }
                });
            }
            else
            {
                this.businessTemplate.reFillData(dataArray, currentIndex + 1);
            }
            //筛选显示地图要素
            this.DefLayer(objs[currentIndex]);
        },


        /**
        *主要阶段的阶段点击事件
        *@method stepClickEvent
        */
        stepClickEvent: function (e) {
            var num = parseInt($(e.currentTarget).attr("num"));
            this.addRegulatoryContent(this.data, num - 1);  
        },

        /**
        *主要阶段的查看附件事件
        *@method viewAccessoryEvent
        */
        viewAccessoryEvent: function (caseId, e) {
            var caseid = caseId;

            var atta = new L.DCI.Attachment();
            this.attObject = $(".compilemap_tabContent2")[0];
            //{type} pro:项目附件；case:业务附件
            type = "case";
            atta.getDirectory(this.attObject, caseid, null, type);
        },

        /**
        *主要阶段的查看表单事件
        *@method viewFormEvent
        */
        viewFormEvent: function (caseId, e) {
            if (caseId == "" || caseId == undefined || caseId == null)
                //L.dci.app.util.dialog.alert("提示", '未能找到该项目');
                return;
            else
                L.dci.app.util.tool.autoLogin(caseId);
        },




        /**
        *筛选显示地图要素(编制业务)
        *@method DefLayer
        *@private
        */
        DefLayer: function (objData) {
            var data = this.config;
            var _map = this._map.getMap();

            //通过后台服务获取到的编制项目数据，可配变量如以下：
            var AREA = objData.AREA;
            var CASE_ID = objData.CASE_ID;
            var COMMENTS = objData.COMMENTS;
            var ENDTIME = objData.ENDTIME;
            var OBJECTID = objData.OBJECTID;
            var PASSDATE = objData.PASSDATE;
            var PLANDATE = objData.PLANDATE;
            var PLANNAME = objData.PLANNAME;
            var PLANSEQ = objData.PLANSEQ;
            var PLANTYPE = objData.PLANTYPE;
            var PLANUNIT = objData.PLANUNIT;
            var REMARK = objData.REMARK;
            var STARTTIME = objData.STARTTIME;

            for (var i = 0; i < data.length; i++)
            {
                var url = data[i].url;
                var defLayer = data[i].defLayer;
                _map.eachLayer(function (layer) {
                    if (layer.options && layer.options.id != undefined && layer.options.id != "baseLayer")
                    {
                        var num = layer.options.id.indexOf("编制一张图的");
                        var urlResult = layer.url.indexOf(url);
                        if (num >= 0 && urlResult >= 0)
                        {
                            var deflayer = JSON.stringify(defLayer);
                            deflayer = deflayer.replace(/th_AREA/g, AREA);
                            deflayer = deflayer.replace(/th_CASE_ID/g, CASE_ID);
                            deflayer = deflayer.replace(/th_ENDTIME/g, ENDTIME);
                            deflayer = deflayer.replace(/th_OBJECTID/g, OBJECTID);
                            deflayer = deflayer.replace(/th_PASSDATE/g, PASSDATE);
                            deflayer = deflayer.replace(/th_PLANDATE/g, PLANDATE);
                            deflayer = deflayer.replace(/th_PLANNAME/g, PLANNAME);
                            deflayer = deflayer.replace(/th_PLANSEQ/g, PLANSEQ);
                            deflayer = deflayer.replace(/th_PLANTYPE/g, PLANTYPE);
                            deflayer = deflayer.replace(/th_PLANUNIT/g, PLANUNIT);
                            deflayer = deflayer.replace(/th_REMARK/g, REMARK);
                            deflayer = deflayer.replace(/th_STARTTIME/g, STARTTIME);
                            deflayer = JSON.parse(deflayer);
                            var layerDefs = deflayer;
                            layer.setLayerDefs(layerDefs);
                            layer.setOpacity(1);
                        }
                    }
                }, this);
            }
                
        },



        /**
        *改变页码
        *@method changePage
        *@param page {Object}       当前请求的页码
        */
        changePage: function (page) {
            this.currentPage = page;
            this.getPageData(page, this.maxShowContentNum, this.status, this.condition);
        },

        /**
        *返回
        *@method turnBack
        */
        turnBack: function () {
            //项目信息栏的查看附件
            $(".baseInfo-button>span:first").unbind('click');

            $(".regulatoryplan-detail").removeClass("active").siblings().addClass("active");
            //状态为项目列表
            this.isDetail = false;
            
            //取消原来保留项目选中状态
            var ele = $(".regulatoryplan").find("div.percontent")[this.detailDataIndex];
            $(ele).removeClass("selected");
            this.detailDataIndex = -1;
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            _map.getHighLightLayer().clearLayers();

            this.hideLayer();
        },

        /**
        *成果对比
        *@method resultsContrast
        */
        resultsContrast: function (e) {
            var config = Project_ParamConfig.bzOneMapConfig;
            var filedname = "caseId";
            var id = "BM00001419";
            var title = "成果对比"; 
            var locateurl = config.queryLayer;
            var currenturl = config.detailConfig[0].url;
            var historyurl = config.detailConfig[1].url;
            var names = this.phaseNames;
            var data = this.data.Values;
            var splitnum = 2;  

            var jsonData = {
                title: title,           //菜单标题
                menus: names,           //菜单名,这里的菜单个数要和下面datas的多为数组个数一致，每个数组要保存当前菜单要添加的服务图层信息，可以是多个图层信息。
                //datas: [[{ name: "选址附图", url: "http://192.168.200.119:6080/arcgis/rest/services/JY/GHSPSJ/MapServer", layerIndex: "1" }, { name: "用地红线", url: "http://192.168.200.119:6080/arcgis/rest/services/JY/GHSPSJ/MapServer", layerIndex: "2" }], [], []],
                datas: [],    //datas可以是空数组，或者是多维数组。每个数组里的格式:如datas[0] = [{name:"",url:"",layerIndex:""},{name:"",url:"",layerIndex:""}]
                splitNum: splitnum,         //默认分屏
                defaultAddLayer: [          //除了底图默认添加的图层，可以为空数组
                    {
                        name:"编制一张图",       //图层名称
                        url:locateurl,           //图层服务地址
                        layerIndex: 0,           //图层索引
                        opacity:1,               //透明度
                    },
                    {
                        name: "编制一张图的现势控规图层",
                        url:currenturl,
                        layerIndex: 0,
                        opacity:0,
                    },
                    {
                        name: "编制一张图的历史控规图层",
                        url:historyurl,
                        layerIndex: 0,
                        opacity:0,
                    }
                ]
            };

            var defLayerData = {
                datas: data,
                selectedObj: this._currentSelectedObj
            };

            var datastr = JSON.stringify(jsonData);
            localStorage.splitScreenInitData = datastr;
            var deflayer = JSON.stringify(defLayerData);
            localStorage.splitScreenDefLayerData = deflayer;
            window.open("splitscreen.aspx?t="+ title);
        },


        /**
        *根据当前ID定位项目
        *@method _zoomTo
        *@param value{Array}ID数组
        */
        _zoomTo: function (value) {
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();
            var _this = this;
            _map.eachLayer(function (layer) {
                if (layer.options
                    && layer.options.id != "baseLayer"
                    && layer.options.id != null
                    && layer.options.name == this._clsName) {
                    layer.metadata(function (error, metadata) {
                        if (metadata == null) return;
                        var layers = [];
                        for (var i = 0 ; i < metadata.layers.length; i++) {
                            layers.push(metadata.layers[i].id.toString());
                        }
                        L.dci.app.util.locate.doFind(layer.url, layers, Project_ParamConfig.bzOneMapConfig.zoomItemName, value, function (featureCollection, response,error) {
                            var num = response.results.length;
                            if (num > 0)
                                _this._currentSelectedObj = response.results[0];
                        });
                    }, this);
                }
            }, this);
        },
        /**
        *高亮当前高亮对象
        *@method showMarks
        */
        showMarks: function () {
            if (this._currentSelectedObj != null) {
                var _map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                _map.getHighLightLayer().clearLayers();
                L.dci.app.util.highLight(_map, this._currentSelectedObj, true, false, this._currentSelectedObj.geometry.type);
            }
        }

    });
    return L.DCI.Business.RegulatoryPlan;
});