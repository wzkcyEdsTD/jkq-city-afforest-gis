/**
*登录日志模块类
*@module layout
*@class DCI.LoggingPanel
*/
define("manage/controls/loggingpanel", [
    "leaflet",
    "manage/layout/loggingpanel"
], function (L) {
    L.DCI.LoggingPanel = L.Class.extend({
        /**
        *类id
        *@property id
        *@type {String}
        */
        id: 'LoggingPanel',
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
            $(".sitemappanel_title").text("日志管理 > 登录日志");
            this._layout = new L.DCI.LoggingPanelLayout();
            this._body.html(this._layout.getBodyHtml());
            //滚动条
            $(".loggingContentBody").mCustomScrollbar({
                theme: "minimal-dark"
            });
            this.getLoggings(1);

            //点击搜索
            $(".loggingPanel_Search").on('click', '.search', { context: this }, function (e) { e.data.context.search(e); });
            //搜索(回车键触发)
            $(".loggingPanel_Search").on('keydown', 'input', { context: this }, function (e) {
                var e = e || window.event;
                if (e.keyCode == 13)
                {
                    e.data.context.search(e);
                    return false;
                }
            });
        },

        /**
        *获取分页登录日志
        *@method getLoggings
        */
        getLoggings: function (option) {
            var text = $.trim($(".loggingPanel_Search>input").val());
            this.currentPage = option;
            if (text != "")
            {
                text = text.replace(/\s/g, "");
                var patt1 = /[^a-zA-Z0-9\u4E00-\u9FA5]/g;    //匹配所有字母数字和中文
                var result = patt1.test(text);
                if (result == true) {
                    L.dci.app.util.dialog.alert("温馨提示", '搜索内容不能包含特殊字符');
                    return;
                }
                else {
                    L.baseservice.getPageLoggingBySearch({
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
                            L.dci.app.util.dialog.alert("温馨提示", XMLHttpRequest.status, '');
                        }
                    });
                }
            }
            else
            {
                L.baseservice.getPageLogging({
                    showNum: this.showNum,
                    pageNum: this.currentPage,
                    async: true,
                    context: this,
                    success: function (data) {
                        //var obj = JSON.parse(data);
                        this.showPagingInfo(data);
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        L.dci.app.util.dialog.alert("温馨提示", XMLHttpRequest.status, '');
                    }
                });
            }
        },


        /**
        *显示分页信息
        *@method getLoggings
        */
        showPagingInfo: function (options) {
            $(".loggingpanel .pagination").html("");


            this.Count = options.Count;      //总数
            var showNum = options.Objects == null ? 0 : options.Objects.length;
            var html = '';
            if (this.Count > 0)
            {
                this.pageCount = Math.ceil(this.Count / this.showNum);

                for (var i = 0; i < showNum; i++)
                {
                    var id = options.Objects[i]._logid;               //资源id
                    var time = options.Objects[i]._visittime;           //登录时间
                    var user = options.Objects[i]._username;           //用户名称
                    var department = options.Objects[i]._departmentname == null ? "" : options.Objects[i]._departmentname;    //用户所属部门
                    var status = options.Objects[i]._status;      //登录状态
                    var exception = options.Objects[i]._exception;     //异常信息
                    var userId = options.Objects[i]._userid;           //用户id
                    var departmentId = options.Objects[i]._departmentid;     //部门id

                    if (status == 0)
                    {
                        status = "正常";
                        exception = '';
                    } else
                    {
                        status = "异常";
                    }

                    html += this._layout.loggingHtml({ "id": id, "time": time, "status": status, "exception": exception, "department": department, "user": user });
                }
                $(".loggingTableBody").html(html);

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
                var html = '<tr><td colspan="5">没有数据</td></tr>';
                $(".loggingTableBody").html(html);
            }
        },

        /**
        *改变页码
        *@method changePage
        *@param page {Object}       当前请求的页码
        */
        changePage: function (page) {
            this.currentPage = page;
            this.getLoggings(page);
        },

        /**
        *搜索
        *@method search
        */
        search: function (e) {
            this.currentPage = 1;
            this.getLoggings(this.currentPage);
        },



    });
    return L.DCI.LoggingPanel;
});