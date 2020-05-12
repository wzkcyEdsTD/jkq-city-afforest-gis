/**
*资源访问日志模块类
*@module layout
*@class DCI.VisitedLoggingPanel
*/
define("manage/controls/visitedlogging", [
    "leaflet",
    "manage/layout/visitedlogging"
], function (L) {
    L.DCI.VisitedLoggingPanel = L.Class.extend({
        /**
        *类id
        *@property id
        *@type {String}
        */
        id: 'VisitedLoggingPanel',
        /**
        *该模块的布局类对象
        *@property _layout
        *@type {Object}
        */
        _layout: null,
        /**
        *容器对象
        *@property _body
        *@type {Object}
        */
        _body: null,

        Count: 0,           //资源总数
        showNum: 15,         //每页显示资源个数
        pageCount: 0,       //页码总数
        showPageNum: 0,     //页码最大数
        currentPage: 0,      //当前页码
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this._body = $(".log_manage");
            $(".sitemappanel_title").text("日志管理 > 资源访问日志");
            this._layout = new L.DCI.VisitedLoggingLayout();
            this._body.html(this._layout.getBodyHtml());
            //滚动条
            $(".visitedLoggingContentBody").mCustomScrollbar({
                theme: "minimal-dark"
            });
            this.getVisitedLoggings(1);

            //点击搜索
            $(".visitedloggingPanell_Search").on('click', '.search', { context: this }, function (e) { e.data.context.search(e); });
            //搜索(回车键触发)
            $(".visitedloggingPanell_Search").on('keydown', 'input', { context: this }, function (e) {
                var e = e || window.event;
                if (e.keyCode == 13)
                {
                    e.data.context.search(e);
                    return false;
                }
            });
        },

        /**
        *获取分页访问日志
        *@method getLoggings
        */
        getVisitedLoggings: function (option) {
            var text = $.trim($(".visitedloggingPanell_Search>input").val());
            this.currentPage = option;
            if (text != "")
            {
                text = text.replace(/\s/g, "");
                var patt1 = /[^a-zA-Z0-9\u4E00-\u9FA5]/g;    //匹配所有字母数字和中文
                var result = patt1.test(text);
                if (result == true) {
                    L.dialog.alert("提示", "搜索内容不能包含特殊字符");
                    return;
                }
                else
                {
                    L.baseservice.getPagVisitingLoggingBySearch({
                        keyword: text,
                        showNum: this.showNum,
                        pageNum: this.currentPage,
                        async: true,
                        context: this,
                        success: function (data) {
                            //var obj = JSON.parse(data);
                            this.showPagingInfo(data);
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            L.dialog.alert("错误提示", XMLHttpRequest.status, '');
                        }
                    });
                }
            }
            else
            {
                L.baseservice.getPagVisitingLogging({
                    showNum: this.showNum,
                    pageNum: this.currentPage,
                    async: true,
                    context: this,
                    success: function (data) {
                        //var obj = JSON.parse(data);
                        this.showPagingInfo(data);
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        L.dialog.alert("错误提示", XMLHttpRequest.status, '');
                    }
                });
            }
        },

        /**
        *显示分页信息
        *@method getLoggings
        */
        showPagingInfo: function (options) {
            $(".visitedloggingpanel .pagination").html("");

            this.Count = options.Count;      //总数
            var showNum = options.Objects == null ? 0 : options.Objects.length;
            var html = '';
            if (this.Count > 0)
            {
                this.pageCount = Math.ceil(this.Count / this.showNum);

                for (var i = 0; i < showNum; i++)
                {
                    var id = options.Objects[i]._visitid;                    //编号
                    var time = options.Objects[i]._visittime;                 //访问时间
                    var status = options.Objects[i]._status;            //状态
                    var exception = options.Objects[i]._exception;      //异常信息
                    var resourceId = options.Objects[i]._resid;        //资源名称id（接口没返回）
                    var resource = options.Objects[i]._resourcename;        //资源名称
                    var departmentId = options.Objects[i]._departmentid;      //用户所属部门id
                    var department = options.Objects[i]._departmentname;          //用户所属部门名称
                    var userId = options.Objects[i]._userid;            //用户名称id
                    var user = options.Objects[i]._username;                //用户名称

                    if (status == 0)
                    {
                        status = "正常";
                        exception = '';
                    } else
                    {
                        status = "异常";
                    }

                    html += this._layout.loggingHtml({ "id": id, "time": time, "status": status, "exception": exception, "resource": resource, "departmentId": departmentId, "department": department, "userId": userId, "user": user });
                }
                $(".visitedLoggingTableBody").html(html);

                //调用分页函数
                var _this = this;
                var page = new L.DCI.Pagination({
                    pageCount: this.pageCount,
                    currentPage: this.currentPage,
                    showPageNum: 5,
                    containerObj: $('.pagination'),
                    pageChange: function (page) {
                        _this.changePage(page);
                    }
                });
            }
            else
            {
                var html = '<tr><td colspan="6">没有数据</td></tr>';
                $(".visitedLoggingTableBody").html(html);
            }
        },

        /**
*改变页码
*@method changePage
*@param page {Object}       当前请求的页码
*/
        changePage: function (page) {
            this.currentPage = page;
            this.getVisitedLoggings(page);
        },

        /**
        *搜索
        *@method search
        */
        search: function (e) {
            this.currentPage = 1;
            this.getVisitedLoggings(this.currentPage);
        },

    });
    return L.DCI.VisitedLoggingPanel;
});