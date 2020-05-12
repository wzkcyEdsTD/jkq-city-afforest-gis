/**
*地块全生命周期(的批后监察内容)类
*@module modules.business
*@class DCI.Business.WholeLifeCycleApproval
*@constructor initialize
*/
define("business/wholelifecycleapproval", [
    "leaflet",
    "core/dcins",
    "leaflet/esri",
    "plugins/scrollbar",
    "plugins/pagination"
], function(L) {

    L.DCI.Business.WholeLifeCycleApproval = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: 'WholeLifeCycleApproval',

        /**
        *批后一张图服务地址
        *@property url
        *@type {String}
        *@private
        */
        url: '',

        /**
        *批后一张图图层索引
        *@property layerIndex
        *@type {String}
        *@private
        */
        layerIndex:'',            

        /**
        *当前页数据的项目的Itemid,用来获取对应的项目信息
        *@property currentProjectId
        *@type {Array}
        *@private
        */
        currentProjectId: [],

        /**
        *当前页数据的项目信息
        *@property currentProjectData
        *@type {Array}
        *@private
        */
        currentProjectData: [],

        /**
        *当前页数据的项目的坐标信息
        *@property currentData
        *@type {Array}
        *@private
        */
        currentData: [],

        /**
        *详情页的项目坐标信息
        *@property oneProjectData
        *@type {Array}
        *@private
        */
        oneProjectData: [],

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
        *初始化
        *@method initialize
        */
        initialize: function () {
            this.config = Project_ParamConfig.wholelifecycleConfig;
            this.url = this.config[4].url;
            this.layerIndex = this.config[4].layerIndex;
        },

        /**
        *显示加载动画--批后监管
        *@method showApprovalLoading
        */
        showApprovalLoading: function () {
            $(".liftContent-Approval-Loading").css("z-index", "5");
        },

        /**
        *隐藏加载动画--批后监管
        *@method hideApprovalLoading
        */
        hideApprovalLoading: function () {
            $(".liftContent-Approval-Loading").css("z-index", "-1");
        },

        /**
        *加载
        *@method load
        *@param geometry{Object} 查询条件
        */
        load: function (geometry) {
            var html = '<div class="liftContent-Approval-Body active">'
                        + '<div class="liftContent-Approval-Container"></div>'
                        + '<div class="liftContent-Approval-Bottom"></div>'
                     +'</div>'
                     + '<div class="liftContent-Approval-Details">'
                        + '<div class="top">'
                            + '<span class="turnback icon-return"></span>'
                            + '<div class="titlecontent"></div>'
                            + '<span class="projectBtn" data-info="">项目详情</span>'
                        + '</div>'
                        + '<div class="content">'
                            + '<table class="table table-bordered">'
                                + '<thead><tr><th>批后进度</th><th>是否存在违规</th><th>是否已处理</th></tr></thead>'
                                + '<tbody class="liftContent-approval-detail-content-tbody"></tbody>'
                            + '</table>'
                        + '</div>'
                     + '</div>'
                     + '<div class="liftContent-Approval-Loading">'
                         + '<div class="loadingFlash"><span class="icon-loading"></span></div>'
                         + '<div class="loadingText">数据加载中，请耐心等待...</div>'
                     + '</div>';

            $(".liftContent-Approval").html(html);

            if (geometry == null)
            {
                var html = '<div class="emptyResult">该地块无批后监管数据</div>';
                $(".liftContent-Approval-Container").append(html);

            } else
            {
                this.getProjectInfo(geometry);
            }

            $('.liftContent-Approval-Container').mCustomScrollbar({ theme: 'minimal-dark' });   //滚动条
            $('.liftContent-Approval-Details .content').mCustomScrollbar({ theme: 'minimal-dark' });   //滚动条

            
            ////返回按钮
            //$(".liftContent-Approval-Details").on('click', '.turnback', { context: this }, function (e) { e.data.context._turnBack(e); });
            //项目视图（图文跳转）
            $(".liftContent-Approval-Details").on('click', '.projectBtn', { context: this }, function (e) { e.data.context._viewProject(e); });

            //点击详情
            $(".liftContent-Approval-Body").on('click', 'span.viewDetail', { context: this }, function (e) {
                //状态为详情内容
                e.data.context.isDetail = true;
                var id = $.trim($(e.target).attr("data-projectid"));
                e.data.context.detailDataIndex = parseInt($(e.target).attr("number"));  //保存当前的项目索引
                e.data.context._viewDetail(e);
                e.stopPropagation();
                //同时定位
                $(e.target).parents(".percontent").siblings().removeClass("selected").end().addClass("selected");
                var id = $.trim($(e.target).attr("data-projectid"));
                e.data.context._zoomTo(id);
            });

            //项目定位
            $(".liftContent-Approval-Body").on('click', 'div.percontent', { context: this }, function (e) {
                if ($(e.currentTarget).hasClass("selected"))
                {
                    e.data.context.detailDataIndex = -1;
                    $(e.currentTarget).removeClass("selected");
                    e.data.context.removeHighlight();
                }
                else
                {
                    $(e.currentTarget).siblings().removeClass("selected").end().addClass("selected");
                    var id = $.trim($(e.currentTarget).children(".operation").children("span:last-child").attr("data-projectid"));
                    var num = $.trim($(e.currentTarget).children(".operation").children("span:last-child").attr("number"));
                    e.data.context.detailDataIndex = parseInt(num);
                    e.data.context._zoomTo(id);
                }
            });
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
            this.showApprovalLoading();

            this.currentProjectId.length = 0;
            var url = this.url + '/' + this.layerIndex;
            var query = L.esri.Tasks.query(url, { proxy: Project_ParamConfig.defaultAjaxProxy });
            query.params.outSr = "";
            query.intersects(geoObj);
            query.params.inSr = "";
            query.run(function (error, featureCollection, response) {
                if (response == null || response.features.length == 0)
                {
                    var thtml = '<div class="emptyResult">该地块无批后监管数据</div>';
                    $(".liftContent-Approval-Container .mCSB_container").html(thtml);
                    //隐藏加载动画
                    this.hideApprovalLoading();
                }
                else 
                {
                    for (var i = 0; i < response.features.length; i++)
                    {
                        var obj = response.features[i].attributes;
                        var id = obj["JYGISDATA.PH_ManageCell.ITEMID"];    //案件编号，这个字段经常变化要手动更正                   
                        this.currentProjectId.push(id);
                    }
                    //获取项目信息
                    this.getProjectInfoFromIds();
                }
            },this);
        },

        /**
        *通过ids获取项目信息
        *@method getProjectInfoFromIds
        */
        getProjectInfoFromIds: function () {
            L.dci.app.services.businessService.queryPhByCaseIds({
                caseIds: this.currentProjectId.join(','),
                context: this,
                success: function (res) {
                    this.data = null;
                    this.pageNum = 0;
                    this.data = res;
                    var projectNums = this.data.Objects.length;
                    this.pageNum = Math.ceil(projectNums / 10);
                    this.insertProjectInfo(this.data, 1);
                },
                error: function (error) {
                    L.dci.app.util.dialog.alert("温馨提示", "未找到对应的服务地址");
                }
            });
        },


        /**
        *插入项目信息
        *@method insertProjectInfo
        */
        insertProjectInfo: function (pageData, showPage) {
            //清空内容区域和页码区域
            var containerObj = $(".liftContent-Approval-Container .mCSB_container");
            containerObj.html("");
            //隐藏加载动画
            this.hideApprovalLoading();
            var columnName = pageData.Columns; //保存列名称
            var projectNum = pageData.Objects.length;  //项目总数
            if (projectNum == 0)
            {
                var html = '<div class="emptyResult">该地块无批后监管数据</div>';
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
                        endIndex = (showPage - 1) * 10 + (projectNum % 10) - 1;
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
                        if (!L.dci.app.util.tool.isShowAttribute(Project_ParamConfig.phOneMapConfig.attributes, att)){
                            continue;
                        }
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
                    containerObj: $('.liftContent-Approval-Bottom'),
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
            $(".liftContent-Approval-Details").siblings().removeClass("active").end().addClass("active");
            var prjectId = $.trim($(e.target).attr("data-projectid"));
            var title = $(e.target).attr("data-projectname");
            $(".liftContent-Approval-Details .titlecontent").html(title);
            $(".liftContent-Approval-Details .projectBtn").attr("data-info", prjectId);
            this._getDetailsData(prjectId); //获取详情信息
            //返回按钮
            $(".liftContent-Approval-Details .turnback").off("click")
            $(".liftContent-Approval-Details .turnback").on('click', { context: this }, function (e) { e.data.context._turnBack(e); });
        },

        /**
        *获取详情数据
        *@method _getDetailsData
        *@param id{String} 项目号
        */
        _getDetailsData: function (id) {
            L.dci.app.services.businessService.getApprovedTrackingDetailData({
                id: id,
                context: this,
                success: function (res) {
                    var data = res;
                    var container = $(".liftContent-Approval-Details .liftContent-approval-detail-content-tbody");

                    var trHtml = '';
                    if (data.length == 0)
                    {
                        trHtml += '<tr><td colspan="3">没有匹配的数据!</td></tr>';
                    } else
                    {
                        for (var i = 0; i < data.length; i++)
                        {
                            var value1 = '否';
                            var value2 = '否';
                            if (data[i].IsViolation == 1)   //是否存在违规
                                value1 = "是";
                            if (data[i].IsDispose == 1)     //是否已处理
                                value2 = "是";
                            trHtml += '<tr><td>' + data[i].StatusName + '</td><td>' + value1 + '</td><td>' + value2 + '</td></tr>';
                        }
                    }
                    container.html(trHtml);
                },
                error: function () {
                    L.dci.app.util.dialog.alert("温馨提示", "未找到对应的服务地址");
                }
            });
        },

        /**
        *返回
        *@method _turnBack
        */
        _turnBack: function () {
            //状态为项目列表
            this.isDetail = false;
            $(".liftContent-Approval-Body").siblings().removeClass("active").end().addClass("active");
            //取消原来保留项目选中状态
            var ele = $(".liftContent-Approval").find("div.percontent")[this.detailDataIndex];
            $(ele).removeClass("selected");
            this.detailDataIndex = -1;
        },

        /**
        *项目详情点击事件
        *@method _viewProject
        */
        _viewProject: function () {
            var id = $(".liftContent-Approval-Details .projectBtn").attr("data-info");
            L.dci.app.util.tool.autoLogin(id);
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
            var field = "ITEMID";
            L.dci.app.util.locate.doFind(url, layers, field, value);
        },

        /**
       *清空高亮图层
       *@method removeHighlight
       */
        removeHighlight: function () {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            map.getHighLightLayer().clearLayers();
        },


    });
    return L.DCI.Business.WholeLifeCycleApproval;
});