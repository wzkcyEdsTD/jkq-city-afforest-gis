/**
*分页插件
*@module plugins
*@class DCI.Pagination
*@example
    var page = new L.DCI.Pagination({
                    pageCount: 10,
                    currentPage: 1,
                    showPageNum: 5,
                    containerObj: $('.projectmap_tabContent2 .bottom'),
                    pageChange: function (page) {
                        alert('显示第'+page+'页的数据');
                    }
                });

   pageCount: 总页数
   currentPage:当前显示页码
   showPageNum: 可见的页码数目
   containerObj:分页填充容器对象
   pageChage: 改变页码事件
*/
define("plugins/pagination", ["leaflet"], function (L) {
    if (L.DCI == null) L.DCI = {};
    L.DCI.Pagination = L.Class.extend({

        pageCount: 0,       //页码总数
        showPageNum: 5,     //可显示最多个页数
        currentPage: 0,     //当前页数
        callback:null,      //回调函数

        initialize: function (options) {
            this.pageCount = options.pageCount;
            this.currentPage = options.currentPage;
            this.showPageNum = options.showPageNum;
            var html = this.pagingHtml();
            options.containerObj.html(html);
            this.callback = options.pageChange;
            $(".pageHighlight").css({ "background-color": "#ffb400", "color": "#fff" });

            //点击页码
            options.containerObj.off("click", 'a');
            options.containerObj.on("click", 'a', { context: this }, function (e) {
                var num = parseInt($(this).attr("data-info"));
                e.data.context.pageChange(num);
            });
        },

        //分页布局
        pagingHtml: function () {
            var pageCount = this.pageCount;          //页码总数
            var currentPage = this.currentPage;       //当前页码
            var showPageNum = this.showPageNum;
            var pageHtml = '';

            if (pageCount >= 1)
            {
                var html = '';
                if (pageCount <= showPageNum)
                {//当页码总数<最多显示页码个数,显示全部页码
                    for (var i = 1; i <= pageCount; i++)
                    {
                        if (i == currentPage)
                        {
                            html += '<li><a class="pageHighlight" href="#" data-info=' + i + '>' + i + '</a></li>';
                        }
                        else
                        {
                            html += '<li><a href="#" data-info=' + i + '>' + i + '</a></li>';
                        }
                    }
                }
                else if (pageCount > showPageNum)
                {//当页码总数>最多显示页码个数

                    if (currentPage < showPageNum - 1)
                    {
                        for (var i = 1; i <= showPageNum; i++)
                        {
                            if (i == currentPage)
                            {
                                html += '<li><a class="pageHighlight" href="#" data-info=' + i + '>' + i + '</a></li>';
                            }
                            else
                            {
                                html += '<li><a href="#" data-info=' + i + '>' + i + '</a></li>';
                            }
                        }
                    }

                    if (currentPage >= showPageNum - 1 && currentPage <= pageCount - 3)
                    {
                        for (var i = currentPage - 2; i <= currentPage + 2; i++)
                        {
                            if (i == currentPage)
                            {
                                html += '<li><a class="pageHighlight" href="#" data-info=' + i + '>' + i + '</a></li>';
                            }
                            else
                            {
                                html += '<li><a href="#" data-info=' + i + '>' + i + '</a></li>';
                            }
                        }
                    }

                    if (currentPage > pageCount - 3 && currentPage <= pageCount)
                    {
                        for (var i = pageCount - 4; i <= pageCount; i++)
                        {
                            if (i == currentPage)
                            {
                                html += '<li><a class="pageHighlight" href="#" data-info=' + i + '>' + i + '</a></li>';
                            }
                            else
                            {
                                html += '<li><a href="#" data-info=' + i + '>' + i + '</a></li>';
                            }
                        }
                    }

                }

                pageHtml += '<div class="myPagination">'
                                +'<ul>'
                                + '<li><a href="#" data-info="-1"><<</a></li>'
                                + html
                                + '<li><a href="#" data-info="0">>></a></li>'
                                + '</ul>'
                            +'</div>';
            }
            return pageHtml;
        },

        pageChange: function (num) {
            var pageNum = num;
            if (num == -1)
            {
                if (this.currentPage > 1)
                {
                    pageNum = this.currentPage - 1;
                }
                else
                {
                    pageNum = 1;
                }
            }
            else if (num == 0)
            {
                if (this.currentPage < this.pageCount)
                {
                    pageNum = this.currentPage + 1;
                }
                else
                {
                    pageNum = this.pageCount;
                }
            }
            return this.callback(pageNum);
        },
    });

    return L.DCI.Pagination;
});