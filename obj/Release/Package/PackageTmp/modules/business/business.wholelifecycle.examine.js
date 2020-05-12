/**
*地块全生命周期(的规划审批内容)类
*@module modules.business
*@class DCI.Business.WholeLifeCycleExamine
*@constructor initialize
*/
define("business/wholelifecycleexamine", [
    "leaflet",
    "core/dcins",
    "leaflet/esri",
    "plugins/scrollbar",
    //"common/projectPhase",
    "plugins/pagination",
    "util/attachment",
    "common/businessTemplate"
], function (L) {

    L.DCI.Business.WholeLifeCycleExamine = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: 'WholeLifeCycleExamine',

        /**
        *项目一张图服务地址
        *@property url
        *@type {String}
        *@private
        */
        url: '',

        /**
        *项目一张图的图层索引
        *@property layerIndex
        *@type {String}
        *@private
        */
        layerIndex: '',

        /**
        *项目对应的图文关联号数组   项目对应的证书号数组
        *@property caseIds
        *@type {Array}
        *@private
        */
        caseIds: [],

        /**
        *项目对应的证书号数组
        *@property ZSHs
        *@type {Array}
        *@private
        */
        ZSHs: [],

        /**
        *当前页数据的项目的Itemid,用来获取对应的项目信息
        *@property currentProjectId
        *@type {Array}
        *@private
        */
        currentProjectId: [],

        /**
        *保存项目阶段类对象
        *@property phaseClass
        *@type {Object}
        *@private
        */
        businessTemplate: null,

        /**
        *保存当前的分页数据
        *@property data
        *@type {Object}
        *@private
        */
        data: null,

        /**
        *保存当前项目的批后项目数据
        *@property approvalData
        *@type {Object}
        *@private
        */
        approvalData: null,

              
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
        *保存查看的项目当前页索引号(默认值为-1)
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
        *项目阶段的图层索引
        *@property phaseLayerIndex
        *@type {Number}
        *@private
        */
        phaseLayerIndex: -1,
        

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            //获取业务红线以及对应的图层索引号
            this.config = Project_ParamConfig.wholelifecycleConfig;
            this.url = this.config[3].url;
            this.layerIndex = this.config[3].layerIndex;
        },

        /**
        *加载
        *@method load
        *@param geometry{Object} 查询条件
        */
        load: function (geometry) {
            var html = '<div class="liftContent-Examine-Body active">'
                        + '<div class="liftContent-Examine-Container"></div>'
                        + '<div class="liftContent-Examine-Bottom"></div>'
                    + '</div>'
                    + '<div class="liftContent-Examine-Details">'
                        + '<div class="top">'
                            + '<span class="turnback icon-return"></span>'
                            + '<div class="titlecontent"></div>'
                        + '</div>'
                        + '<div class="content">'
                            + '<p class="liftContent-Examine-Details-Content-Title">项目信息</p><p class="liftContent-Examine-Details-Content-Button" data-Id=""><span>查看附件</span><span>项目视图</span></p>'
                            + '<div class="content-projectInfo">'
                                + '<table class="table table-bordered">'
                                    + '<tbody class="content-tbody"></tbody>'
                                + '</table>'
                        + '</div>'
                        + '<div class="liftContent-detail-content-phase"></div>'
                    + '</div>'
                    + '</div>'
                    + '<div class="liftContent-Examine-Loading">'
                        + '<div class="loadingFlash"><span class="icon-loading"></span></div>'
                        + '<div class="loadingText">数据加载中，请耐心等待...</div>'
                    + '</div>';

            $(".liftContent-Examine").html(html);

            if (geometry == null)
            {
                var html = '<div class="emptyResult">该地块无规划审批数据</div>';
                $(".liftContent-Examine-Container .mCSB_container").html(html);

            } else {
                this.getProjectInfo(geometry);
            }

            $('.liftContent-Examine-Container').mCustomScrollbar({ theme: 'minimal-dark' });   //滚动条
            $('.liftContent-Examine-Details .content').mCustomScrollbar({ theme: 'minimal-dark' });   //滚动条
            //点击详情
            $(".liftContent-Examine-Body").on('click', 'span.viewDetail', { context: this }, function (e) {
                //状态为详情内容
                e.data.context.isDetail = true;
                var id = $.trim($(e.target).attr("data-projectid"));
                e.data.context.detailDataIndex = parseInt($(e.target).attr("number"));  //保存当前的项目索引
                e.data.context._viewDetail(e);
                e.stopPropagation();
                //同时定位
                $(e.target).parents(".examineProject").siblings().removeClass("selected").end().addClass("selected");        
                e.data.context._zoomTo(id);
            });
            //点击批后
            //$(".liftContent-Examine-Body").on('click', 'span.viewApprovalProject', { context: this }, function (e) { e.data.context._viewApprovalProject(e); e.stopPropagation(); });

            //规划审批的定位
            $(".liftContent-Examine-Body").on('click', 'div.percontent', { context: this }, function (e) {
                if ($(e.currentTarget).parent().hasClass("selected"))
                {
                    e.data.context.detailDataIndex = -1;
                    $(e.currentTarget).parent().removeClass("selected");
                    e.data.context.removeHighlight();
                    //清空项目包含的批后项目
                    $(".liftContent-Examine-Container .approvalProject").remove();
                }
                else
                {
                    $(e.currentTarget).parent().addClass("selected").siblings().removeClass("selected");
                    var id = $.trim($(e.currentTarget).children(".operation").children("span:last-child").attr("data-projectid"));
                    var num = $.trim($(e.currentTarget).children(".operation").children("span:last-child").attr("number"));
                    e.data.context.detailDataIndex = parseInt(num);
                    e.data.context._zoomTo(id);
                    // 查询是否含有批后数据，有则展开
                    e.data.context._viewApprovalProject(e);
                }
            });


            //规划审批中的批后项目的定位
            $(".liftContent-Examine-Body").on('click', 'div.percontent2', { context: this }, function (e) {
                var id = $.trim($(e.currentTarget).children(".operation").children("span:last-child").attr("data-projectid"));
                e.data.context._zoomTo2(id);
            });
            //点击批后项目的详情
            $(".liftContent-Examine-Body").on('click', 'span.viewApproval', { context: this }, function (e) { e.data.context._viewApproval(e); e.stopPropagation(); });


            //返回按钮
            $(".liftContent-Examine-Details").on('click', '.turnback', { context: this }, function (e) { e.data.context._turnBack(e); });
            //项目信息栏的查看附件
            $(".liftContent-Examine-Details").on('click', '.liftContent-Examine-Details-Content-Button>span:first', { context: this }, function (e) { e.data.context._viewProjectAccessory(e); });
            //项目信息栏的项目视图
            $(".liftContent-Examine-Details").on('click', '.liftContent-Examine-Details-Content-Button>span:last', { context: this }, function (e) { e.data.context._viewProject(e); });

        },

        /**
        *显示加载动画--规划审批
        *@method showExamineLoading
        */
        showExamineLoading: function () {
            $(".liftContent-Examine-Loading").css("z-index", "5");
        },

        /**
        *隐藏加载动画--规划审批
        *@method hideExamineLoading
        */
        hideExamineLoading: function () {
            $(".liftContent-Examine-Loading").css("z-index", "-1");
        },

        /**
        *获取当前地块的项目
        *@method getProjectInfo
        *@param geometry{Object} 查询条件
        */
        getProjectInfo: function (geometry) {
            var geoObj = geometry;
            //var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            //var _map = map.getMap();
            //map.getHighLightLayer().clearLayers();
            //显示加载动画
            this.showExamineLoading();


            this.currentProjectId.length = 0;

            var url = this.url + '/' + this.layerIndex;
            var query = L.esri.Tasks.query(url, { proxy: Project_ParamConfig.defaultAjaxProxy });
            query.params.outSr = "";
            query.intersects(geoObj);
            query.params.inSr = "";
            query.run(function (error, featureCollection, response) {
                if (response != null && response.features.length > 0)
                {
                    for (var i = 0; i < response.features.length; i++)
                    {
                        var obj = response.features[i].attributes;
                        var id = obj.PROJECTID;
                        this.currentProjectId.push(id);
                    }
                    //获取项目信息
                    this.getProjectInfoFromIds();
                }
                else
                {
                    var thtml = '<div class="emptyResult">该地块无规划审批数据</div>';
                    $(".liftContent-Examine-Container .mCSB_container").html(thtml);
                    //隐藏加载动画
                    this.hideExamineLoading();
                }
            }, this);
        },

        /**
        *通过ids获取项目信息
        *@method getProjectInfoFromIds
        */
        getProjectInfoFromIds: function () {
            L.dci.app.services.businessService.queryXmByIds({
                ids: this.currentProjectId.join(','),
                context: this,
                success: function (res) {
                    this.data = null;
                    this.pageNum = 0;
                    this.data = res;
                    var projectNums = this.data.Objects.length;
                    this.pageNum = Math.ceil(projectNums / 10);
                    this.insertProjectInfo(this.data,1); 
                }
            });

        },

        /**
        *插入项目信息
        *@method insertProjectInfo
        */
        insertProjectInfo: function (pageData,showPage) {
            //清空内容区域和页码区域
            var containerObj = $(".liftContent-Examine-Container .mCSB_container");
            containerObj.html("");
            //隐藏加载动画
            this.hideExamineLoading();
            var columnName = pageData.Columns; //保存列名称
            var projectNum = pageData.Objects.length;  //项目总数
            if (projectNum == 0)
            {
                var html = '<div class="emptyResult">该地块无规划审批数据</div>';
                containerObj.html(html);
            }
            else
            {
                var data = [];
                var startIndex = 0;
                var endIndex = 0;
                if (showPage < this.pageNum)
                {
                    startIndex = (showPage - 1) * 10;
                    endIndex = showPage * 10 - 1;
                }
                else if (showPage == this.pageNum)
                {
                    if (projectNum % 10 == 0)
                    {
                        startIndex = (showPage - 1) * 10;
                        endIndex = showPage * 10 - 1;
                    }
                    else
                    {
                        startIndex = (showPage - 1) * 10;
                        endIndex = (showPage - 1) * 10 + (projectNum % 10) -1;
                    }
                }
                for (var i = startIndex; i <= endIndex; i++)
                {
                    data.push(pageData.Objects[i]);
                }


                var html = '';
                for (var i = 0; i < data.length; i++)
                {
                    var trHtml = '';
                    var obj = data[i];
                    var IsDispose = '';
                    for (var att in obj)
                    {//遍历要插入的字段信息
                        var key = att;
                        for (var kk in columnName)
                        {//将英文字段名改为对应的中文名
                            if (att == kk)
                            {
                                key = columnName[kk];
                                break;
                            }
                        }


                        //过滤不显示的字段
                        if (!L.dci.app.util.tool.isShowAttribute(Project_ParamConfig.xmOneMapConfig.attributes,att)) {
                            continue;
                        }
                        else
                        {
                            var value = obj[att] == null ? "" : obj[att];
                            trHtml += '<tr><td>' + key + ':</td><td>' + value + '</td></tr>';
                        }
                    }

                    var projectId = data[i]["ITEMID"];          //这里通过key获取对应的值，作为详情按钮的属性保存
                    var projectName = data[i]["ITEMNAME"];          //这里通过key获取对应的值，作为详情按钮的属性保存
                    var projectPhase = data[i]["PROJECTSTA"];   //这里通过key获取对应的值，作为详情按钮的属性保存
                    var projectType = data[i]["XMLX"];         //这里通过key获取对应的值，作为详情按钮的属性保存
                    var number = i;

                    html += '<div class="examineProject"><div class="percontent">'
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
                                    //+ '<span class="viewApprovalProject" data-projectid="' + projectId + '" data-projectPhase="' + projectPhase + '">批后</span>'     //这个类看情况添加iconMark
                                    + '<span class="viewDetail" number = ' + number + '  data-projectid="' + projectId + '" data-projectname="' + projectName + '" data-projectPhase="' + projectPhase + '">详情</span>'
                                + '</div>'
                             + '</div></div>';
                }
                containerObj.html(html);

                //调用分页函数
                var _this = this;
                var page = new L.DCI.Pagination({
                    pageCount: this.pageNum,
                    currentPage: this.currentPage,
                    showPageNum: 5,
                    containerObj: $('.liftContent-Examine-Bottom'),
                    pageChange: function (page) {
                        _this.changePage(page);
                    }
                });
            }
        },

        /**
        *改变页码
        *@method changePage
        *@param page {Object}       当前请求的页码
        */
        changePage: function (page) {
            this.currentPage = page;
            this.insertProjectInfo(this.data, this.currentPage);
        },


        /**
        *详情点击事件
        *@method _viewDetail
        *@param e {Object}       event对象
        */
        _viewDetail: function (e) {
            $(".liftContent-Examine-Details").siblings().removeClass("active").end().addClass("active");
            var container = $(".liftContent-Examine-Details .content-tbody");
            container.html("");
            var prjectId = $.trim($(e.target).attr("data-projectid"));
            var title = $(e.target).attr("data-projectname");
            $(".liftContent-Examine-Details .titlecontent").html(title);
            $(".liftContent-Examine-Details .liftContent-Examine-Details-Content-Button").attr("data-Id", prjectId);
            this._getDetailsData(prjectId); //获取详情信息
        },


        /**
        *返回
        *@method _turnBack
        */
        _turnBack: function () {
            //状态为项目列表
            this.isDetail = false;
            this.phaseLayerIndex = -1;        
            $(".liftContent-Examine-Body").siblings().removeClass("active").end().addClass("active");
            //取消原来保留项目选中状态
            var ele = $(".liftContent-Examine").find("div.examineProject")[this.detailDataIndex];
            $(ele).removeClass("selected");
            this.detailDataIndex = -1;
            this.deleteLayer();
        },


        /**
        *获取项目详情数据
        *@method _getDetailsData
        *@param itemId {String}         项目编号
        */
        _getDetailsData: function (itemId) {
            L.dci.app.services.businessService.getProjectmapDetailsInfo({
                itemId: itemId,
                context: this,
                success: function (res) {
                    this._insertProjectDetailsContent(res);           //加载项目详情内容
                },
                error: function () {
                    L.dci.app.util.dialog.alert("提示", "未找到对应的服务地址");
                }
            });
        },

        /**
        *插入项目详情内容
        *@method _insertProjectDetailsContent
        *@param data {Object}       数据对象
        */
        _insertProjectDetailsContent: function (data) {
            this.businessTemplate = null;
            this._detailProjectId = "";
            if (data != null)
            {
                var projectId, projectPhase, projectType;
                var projectHtml = "";
                for (var att in data)
                {
                    if (att == "项目编号")
                        projectId = $.trim(data[att]);
                    if (att == "项目阶段")
                        projectPhase = data[att];
                    if (att == "项目类型")
                        projectType = data[att];
                    if (att == "项目类型") continue;   //不显示项目类型字段，不过不可以删除，项目阶段类的初始化要使用
                    if (data[att] != "")
                    {
                        projectHtml += "<tr><td>" + att + "</td><td>" + data[att] + "</td></tr>";
                    }
                }


                var tbodyObj = $(".liftContent-Examine-Details table>.content-tbody");
                tbodyObj.html(projectHtml);
            }

            this.queryProjectLatlng(projectId, projectPhase, projectType);
            this._detailProjectId = projectId;

        },

        /**
        *获取项目的空间数据信息
        *@method queryProjectLatlng
        *@param projectId{String} 项目的projectId
        */
        queryProjectLatlng: function (projectId, projectPhase, projectType) {
            this.projectLatlng = null;
            var id = $.trim(projectId);
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var query = new L.esri.Tasks.Find(this.url);
            query.layers('all:' + this.layerIndex).text(id).fields("PROJECTID");
            query.params.sr = "";
            query.run(function (error, featureCollection, response) {
                if (error)
                {
                    L.dci.app.util.dialog.alert("代码:" + error.code, "详情:" + error.message);
                }
                else
                {
                    var feature = featureCollection.features[0];
                    var geoType = feature.geometry.type;
                    var geo = L.dci.app.util.unproject(map, feature, geoType);
                    this.projectLatlng = geo.getBounds().getCenter();
                    this.features = null;
                    this.features = featureCollection.features[0];
                    //调用项目阶段类，初始化一个项目阶段类对象，获取对应的html以及事件(参数：项目编号、项目空间数据、项目阶段、项目类型、容器id、功能名称)
                    //this.phaseClass = null;
                    //this.phaseClass = new L.DCI.Common.PojectPhase(id, feature, projectPhase, projectType, ".liftContent-detail-content-phase", "地块全生命周期");
                    this.addPhaseContent(id, projectPhase);
                }
            }, this);

        },


        /**
        *项目信息栏的项目视图
        *@method _viewProject
        */
        _viewProject: function (e) {
            var ele = $(e.currentTarget);
            var id = $(ele).parent(".liftContent-Examine-Details-Content-Button").attr("data-Id");
            if (id == "" || id == undefined || id == null)
                L.dci.app.util.dialog.alert("提示", '未能找到该项目');
            else
                L.dci.app.util.tool.autoLogin(id);
        },

        /**
        *项目信息栏的查看附件
        *@method _viewProjectAccessory
        */
        _viewProjectAccessory: function (e) {
            var caseid = e.target.parentElement.getAttribute('data-id');

            var atta = new L.DCI.Attachment();
            this.attObject = $(".liftContent-Examine")[0];
            //{type} pro:项目附件；case:业务附件
            type = "pro";
            atta.getDirectory(this.attObject, caseid, null, type);
        },


        /**
        *添加项目阶段内容
        *@method addPhaseContent
        *@param functionName {String}
        */
        addPhaseContent: function (projectId, projectPhase) {
            this.phaseConfig = null;
            this.phaseConfig = Project_ParamConfig.projectPhaseConfig;
            //获取当前阶段的阶段id，以及所在数组的索引
            for (var i = 0; i < this.phaseConfig.length; i++)
            {
                if (projectPhase == this.phaseConfig[i].name)
                {
                    this.currentIndex = i;
                    break;
                }
            }
            //插入阶段的服务
            this.addLayer(this.currentIndex);
            //获取阶段信息
            this.getPhaseData(projectId, this.currentIndex);

        },

        /**
        *添加阶段图层服务
        *@method addLayer
        *@param functionName {String}
        */
        addLayer: function (currentIndex) {
            var url = this.phaseConfig[currentIndex].url;
            var layerIndex = this.phaseConfig[currentIndex].layerIndex;
            this.phaseLayerIndex = currentIndex;
            var idStr = "全生命周期阶段-" + this.phaseConfig[currentIndex].name;
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            var _count = _map.getLayers().length;
            var isHas = false;
            _map.map.eachLayer(function (layer) {
                _count--;
                if (layer.options && layer.options.id == idStr)
                {
                    isHas = true;
                    return;
                }
                if (_count == 0 && isHas == false)
                {
                    this.deleteLayer();
                    if (url != "")
                    {
                        _map.addLayer(url, { layers: [layerIndex], id: idStr });
                    }
                }

            }, this);
        },

        /**
        *删除阶段图层服务
        *@method deleteLayer
        */
        deleteLayer: function () {
            if (this.phaseConfig == undefined || this.phaseConfig == null) return;
            var _map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            for (var i = 0; i < this.phaseConfig.length; i++)
            {
                var idStr = "全生命周期阶段-" + this.phaseConfig[i].name;
                _map.removeLayer(idStr);
            }
        },

        /**
        *获取项目阶段信息
        *@method getPhaseData
        *@param projectId {String}              项目PROJECTID
        *@param currentIndex {String}           当前阶段的数组索引
        *@param containerId {String}            填充容器的id,如 <div id="projectDetail">内容填充区域</div>，    containerId: #projectDetail
        */
        getPhaseData: function (projectId, currentIndex) {
            if (currentIndex == 0)
            {
                //查询控规阶段数据,通过项目坐标查询属性信息
                var url = this.phaseConfig[currentIndex].url + '/' + this.phaseConfig[currentIndex].layerIndex;
                var query = L.esri.Tasks.query(url, { proxy: Project_ParamConfig.defaultAjaxProxy });
                query.params.outSr = "";
                query.intersects(this.features);
                query.params.inSr = "";
                query.fields(this.phaseConfig[currentIndex].queryFields);
                query.run(function (error, featureCollection, response) {
                    if (typeof error == "undefined")
                    {
                        var data = featureCollection.features;
                        if (data.length == 0)
                        {
                            this.fillPhaseInfo(null, currentIndex);
                        }
                        else
                        {
                            this.fillPhaseInfo(data, currentIndex);
                        }
                    }
                    else if (typeof error == "object")
                    {
                        this.fillPhaseInfo(null, currentIndex);
                    }
                }, this);
            }
            else
            {
                //查询其它阶段，通过项目编号projectId查询属性信息
                var url = this.phaseConfig[currentIndex].url + '/' + this.phaseConfig[currentIndex].layerIndex;
                var text = "PROJECTID='" + projectId + "'";
                var query = L.esri.Tasks.query(url);
                query.fields(this.phaseConfig[currentIndex].queryFields);
                query.params.outSr = "";
                query.where(text);
                query.run(function (error, featureCollection, response) {
                    if (typeof error == "undefined")
                    {
                        var data = featureCollection.features;
                        if (data.length == 0)
                        {
                            this.fillPhaseInfo(null, currentIndex);
                        }
                        else
                        {
                            this.fillPhaseInfo(data, currentIndex);
                        }
                    }
                    else if (typeof error == "object")
                    {
                        this.fillPhaseInfo(null, currentIndex);
                    }
                }, this);
            }
        },

        /**
        *填充项目阶段信息
        *@method fillPhaseInfo
        *@param data {Object}                   项目阶段信息
        *@param containerId {String}            填充容器的id,如 <div id="projectDetail">内容填充区域</div>，    containerId: #projectDetail
        */
        fillPhaseInfo: function (data, currentIndex) {
            var queryFields = this.phaseConfig[currentIndex].queryFields;
            var displayFieldsName = this.phaseConfig[currentIndex].displayFieldsName;
            //获取阶段显示名称（这里为鼠标移到数字上显示）
            var phaseNames = [];
            var dataArray = [];
            for (var i = 0; i < this.phaseConfig.length; i++)
            {
                phaseNames.push(this.phaseConfig[i].name);
            }
            //构建数据
            if (data != null)
            {
                for (var i = 0; i < data.length; i++)
                {
                    var obj = data[i].properties;
                    var json = {};
                    for (var j = 0; j < queryFields.length; j++)
                    {
                        var displayName = displayFieldsName[j];
                        if (queryFields[j] == "CASE_ID")
                        {
                            var value = obj["CASE_ID"] == null ? "" : obj["CASE_ID"];
                            json["CASE_ID"] = value;
                        }
                        else
                        {
                            var value = obj[queryFields[j]] == null ? "" : obj[queryFields[j]];
                            json[displayName] = value;
                        }
                    }
                    dataArray.push(json);
                }
            }

            var _this = this;
            if (this.businessTemplate == null || this.businessTemplate == undefined)
            {
                this.businessTemplate = new L.DCI.Common.BusinessTemplate({
                    container: '.liftContent-detail-content-phase',
                    title: '主要指标',
                    names: phaseNames,
                    data: dataArray,
                    index: currentIndex + 1,
                    theme: 'timeline',
                    titleWidth: 70,
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

        },

        /**
        *阶段点击事件
        *@method stepClickEvent
        */
        stepClickEvent: function (e) {
            var num = parseInt($(e.currentTarget).attr("num"));
            this.deleteLayer();
            //插入阶段的服务
            this.addLayer(num - 1);
            this.getPhaseData(this._detailProjectId, num - 1);
        },

        /**
        *查看附件事件
        *@method viewAccessoryEvent
        */
        viewAccessoryEvent: function (caseId, e) {
            var caseid = caseId;

            var atta = new L.DCI.Attachment();
            this.attObject = $(".liftContent-Examine")[0];
            //{type} pro:项目附件；case:业务附件
            type = "case";
            atta.getDirectory(this.attObject, caseid, null, type);
        },

        /**
        *查看表单事件
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
        *批后点击事件
        *@method _viewApprovalProject
        *@param e {Object}       event对象
        */
        _viewApprovalProject: function (e) {
            //清空
            $(".liftContent-Examine-Container .approvalProject").remove();


            this.ZSHs.length = 0;;
            var id = $.trim($(e.currentTarget).children(".operation").children("span:last-child").attr("data-projectid"));
            var projectId = $.trim($(e.currentTarget).children(".operation").children("span:last-child").attr("data-projectid"));
            var phase = $.trim($(e.currentTarget).children(".operation").children("span:last-child").attr("data-projectPhase"));
            var eleObj = $(e.currentTarget).parents(".examineProject");

            //查看项目是否含有其批后项目的依据：判断当前项目的当前项目阶段是否到了工程阶段，是则通过项目编号在工程阶段图层上匹配到的工程，获取其证书编号，通过证书编号获取批后项目；否则不显示
            var projectPhaseConfig = Project_ParamConfig.projectPhaseConfig;
            var url = '';
            var PhaseIndex = 0;
            var projectPhaseIndex = 0;
            for (var i = 0; i < projectPhaseConfig.length; i++)
            {
                if (phase == projectPhaseConfig[i].name)
                {
                    PhaseIndex = projectPhaseConfig[i].id;
                }

                if (projectPhaseConfig[i].name == "工程")
                    projectPhaseIndex = projectPhaseConfig[i].id;
            }
            if (PhaseIndex < projectPhaseConfig) return;
            else
            {
                url = projectPhaseConfig[projectPhaseIndex-1].url + '/' + projectPhaseConfig[projectPhaseIndex-1].layerIndex;
            }

            var text = "PROJECTID='" + projectId + "'";
            var query = L.esri.Tasks.query(url);
            query.fields('ZSH');     //获取证书号
            query.where(text);
            query.params.outSr = "";
            query.run(function (error, featureCollection, response) {
                if (typeof error == "undefined")
                {
                    var data = featureCollection.features;
                    if (data.length == 0)
                    {
                        //L.dci.app.util.dialog.alert("提示", "没有批后数据");
                    }
                    else
                    {
                        for (var i = 0; i < data.length; i++)
                        {
                            this.ZSHs.push(data[i].properties.ZSH);
                        }
                        this.getApprovalProjectInfoFromZSH(eleObj);
                    }
                }
                else if (typeof error == "object")
                {
                    //L.dci.app.util.dialog.alert("提示", "获取数据失败");
                    //console.log(error.message);
                }
            }, this);
        },

        /**
        *通过证书号(ZSH)获取批后的项目信息
        *@method getApprovalProjectInfoFromZSH
        */
        getApprovalProjectInfoFromZSH: function (eleObj) {
            var data = this.ZSHs.join(',');
            L.dci.app.services.businessService.queryPhByZSH({
                data: data,
                context: this,
                success: function (res) {
                    this.approvalData = null;
                    this.pageNum = 0;
                    this.approvalData = res;
                    this.pageNum = this.approvalData.PageCount;
                    this._insertApprovalProjectInfo(eleObj);
                },
                error: function (error) {
                    L.dci.app.util.dialog.alert("提示", error.message);
                },
            });

        },

        /**
        *插入审批项目的批后项目信息
        *@method _insertApprovalProjectInfo
        */
        _insertApprovalProjectInfo: function (eleObj) {

            //清空内容区域和页码区域
            //var containerObj = $(".approvedtracking .content .mCSB_container");

            var data = this.approvalData.Objects;       //保存具体内容数据
            var columnName = this.approvalData.Columns; //保存列名称

            if (data.length > 0)
            {
                var html = '';
                for (var i = 0; i < data.length; i++)
                {
                    var trHtml = '';
                    var obj = data[i];
                    var IsDispose = '';
                    for (var att in obj)
                    {//遍历要插入的字段信息
                        var key = att;
                        for (var kk in columnName)
                        {//将英文字段名改为对应的中文名
                            if (att == kk)
                            {
                                key = columnName[kk];
                                break;
                            }
                        }

                        //保存是否已处理字段值做标识判断
                        if (obj[IsDispose] != null)
                        {
                            IsDispose = obj[IsDispose];
                        }

                        //过滤不显示的字段
                        if (att == "ObjectId" || att == "Code" || att == "DDTH" || att == "OldItemID" || att == "Fguid" || att == "Ydxz" || att == "Xzqydm" || att == "IsDispose" || att == "UpdateDate" || att == "IsViolation")
                        {
                            continue;
                        }
                        else
                        {
                            trHtml += '<tr><td>' + key + ':</td><td>' + obj[att] + '</td></tr>';
                        }
                    }


                    var projectId = data[i]["ItemID"];      //这里通过key获取对应的值，作为详情按钮的属性保存
                    var projectName = data[i]["Xmmc"];      //这里通过key获取对应的值，作为详情按钮的属性保存
                    var number = i;
                    html += '<div class="percontent2">'
                                + '<div class="pic1">>'
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
                                    + '<span class="viewApproval" number = ' + number + '  data-projectid="' + projectId + '" data-projectname="' + projectName + '">详情</span>'
                                + '</div>'
                             + '</div>';
                }

                var approvalHtml = '<div class="approvalProject">'
                                    + '<p>批后跟踪项目</p>'
                                    + html
                                + '</div>';
                eleObj.append(approvalHtml);
                $(".liftContent-Examine-Container .approvalProject").slideDown("fast");
            }
        },


        /**
       *根据当前ID定位项目
       *@method _zoomTo
       *@param value{Array}ID数组
       */
        _zoomTo: function (value) {
            var url = this.url;
            var layers = [];
            layers.push(this.layerIndex);
            var field = "PROJECTID";
            L.dci.app.util.locate.doFind(url, layers, field, value);
        },


        /**
       *根据当前ID定位项目
       *@method _zoomTo2
       *@param value{Array}ID数组
       */
        _zoomTo2: function (value) {
            //这里获取批后的服务地址和图层索引号
            var url = this.config[4].url;
            var layerIndex = this.config[4].layerIndex;
            var layers = [];
            layers.push(layerIndex);
            var field = "ITEMID";
            L.dci.app.util.locate.doFind(url, layers, field, value);
        },

        /**
        *批后项目的详情点击事件
        *@method _viewApproval
        *@param e {Object}       event对象
        */
        _viewApproval: function (e) {
            var projectId = $.trim($(e.target).attr("data-projectid"));
            var title = $.trim($(e.target).attr("data-projectname"));
            var eleObj = $(".liftContent-Approval-Container .percontent");
            if (eleObj.length > 0)
            {
                for (var i = 0; i < eleObj.length; i++)
                {
                    var obj = eleObj[i];
                    var id = $(obj).find("span.viewDetail").attr("data-projectid");
                    //显示批后监管模块
                    $(".liftBtn:last").addClass("active").siblings().removeClass("active");      //显示批后监管tab按钮
                    $(".liftContent:last").addClass("active").siblings().removeClass("active");  //显示批后监管tab内容
                    if (projectId == id)
                    {
                        $(obj).find("span.viewDetail").click();
                    }
                    else
                    {
                        var wholelifecycle = L.dci.app.pool.get("wholelifecycle");
                        $(".liftContent-Approval-Details").siblings().removeClass("active").end().addClass("active");
                        $(".liftContent-Approval-Details .titlecontent").html(title);
                        $(".liftContent-Approval-Details .projectBtn").attr("data-info", projectId);
                        wholelifecycle.approval._getDetailsData(projectId);
                        //绑定返回事件
                        //取消该绑定事件
                        $(".liftContent-Approval-Details .turnback").off('click');
                        $(".liftContent-Approval-Details .turnback").on('click', { context: this }, function (e) {                            
                            //显示规划审批模块
                            $(".liftBtn:eq(1)").addClass("active").siblings().removeClass("active");      //显示规划审批tab按钮
                            $(".liftContent:eq(1)").addClass("active").siblings().removeClass("active");  //显示规划审批tab内容
                        });
                    }
                }
            }
            else
            {
                //显示批后监管模块
                $(".liftBtn:last").addClass("active").siblings().removeClass("active");      //显示批后监管tab按钮
                $(".liftContent:last").addClass("active").siblings().removeClass("active");  //显示批后监管tab内容
                
                $(".liftContent-Approval-Details").siblings().removeClass("active").end().addClass("active");
                $(".liftContent-Approval-Details .titlecontent").html(title);
                $(".liftContent-Approval-Details .projectBtn").attr("data-info", projectId);

                var wholelifecycle = L.dci.app.pool.get("wholelifecycle");
                wholelifecycle.approval._getDetailsData(projectId);
                //绑定返回事件
                //取消该绑定事件
                $(".liftContent-Approval-Details .turnback").off('click');
                $(".liftContent-Approval-Details .turnback").on('click', { context: this }, function (e) {
                    //显示规划审批模块
                    $(".liftBtn:eq(1)").addClass("active").siblings().removeClass("active");      //显示规划审批tab按钮
                    $(".liftContent:eq(1)").addClass("active").siblings().removeClass("active");  //显示规划审批tab内容
                });
            }
        },


        /**
       *清空高亮图层
       *@method removeHighlight
       */
        removeHighlight: function () {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            map.getHighLightLayer().clearLayers();
        }
    });
    return L.DCI.Business.WholeLifeCycleExamine;
});