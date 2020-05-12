/**
*toolbar类
*@module layout
*@class DCI.Layout.ToolBar
*@constructor initialize
*@extends DCI.Layout
*/
define("layout/toolbar", [
    "leaflet",
    "core/dcins",
    "layout/base"
], function (L) {
    L.DCI.Layout.ToolBar = L.DCI.Layout.extend({
        /**
        *工具条内容模版
        *@property ihtml
        *@type {String}
        *@private
        */
        ihtml: '<div id="toolbar" class="toolbar-content"></div>',
        /**
        *是否全屏
        *@property _fullcreen
        *@type {Boolean}
        *@private
        */
        _fullcreen: false,
        /**
         *初始化
         *@method initialize
         */
        initialize: function () {
            L.DCI.Layout.prototype.initialize.call(this);
            this.id = "toolbar";
            this.body = $("#toppanel");
            var _this = this;
            if ($("#toolbar").length == 0) {
                this.body.append(this.ihtml);
                this._loadTools();
            }
            //工具栏上的按钮事件
            $("#toolbar").unbind();
            $('#toolbar').on('click', 'a', { obj: this }, this.tool);
        },

        /**
        *详细按钮事件
        *@method _loadTools
        *@private
        */
        _loadTools: function () {
            L.dci.app.menu.register(this, function (data) {
                var content = $("#toolbar");
                var html = [];
                for (var j = 0; j < data.length; j++)
                {
                    var clsName = data[j].clsName;
                    var name = data[j].name;
                    var menu = data[j].menu;
                    switch (name)
                    {
                        //系统权限配置不显示
                        case '系统':
                            break;
                        case '工具':
                            if (menu.length > 0)
                            {
                                for (var i = 0; i < menu.length; i++)
                                {
                                    var bar = '<div class="toolbar-bar onlyIcon">'
                                                + '<a class="toolbar-a-style" id="menu_' + menu[i].id + '">'
                                                    + '<span  class="' + menu[i].clsName + '"></span>'
                                                    + '<span></span>'
                                                + '</a>'
                                              + '</div>';
                                    html.push(bar);
                                }
                                //添加分割线
                                var splitLine = '<span class="splitLine"></span>';
                                html.push(splitLine);
                            }
                            break;
                        case '更多':
                            if (menu.length > 0)
                            {
                                for (var i = 0; i < menu.length; i++)
                                {
                                    var bar = '<div class="toolbar-bar">'
                                                + '<a class="toolbar-a-style" id="menu_' + menu[i].id + '">'
                                                    + '<span  class="' + menu[i].clsName + '">&nbsp;</span>'
                                                    + '<span>' + menu[i].name + '</span>'
                                                +'</a>'
                                              +'</div>';
                                    html.push(bar);
                                }
                                //添加分割线
                                var splitLine = '<span class="splitLine"></span>';
                                html.push(splitLine);
                            }
                            break;
                        case '测量':
                        case '标绘':
                        case '分屏':
                        case '分享':
                        case '收藏':
                            if (menu.length > 0)
                            {
                                var bar = '<div class="toolbar-bar hasBox">'
                                      + '<a class="toolbar-a-style" id="">'
                                        + '<span  class="' + clsName + '">&nbsp;</span>'
                                        + '<span>' + name + '</span>'
                                      + '</a>'
                                     + '</div>';
                                html.push(bar);
                            }

                            if (name == "分屏")
                            {
                                //添加分割线
                                var splitLine = '<span class="splitLine"></span>';
                                html.push(splitLine);
                            }
                            break;
                        case '分析':
                            if (menu.length > 0)
                            {
                                var dropHtml = '';
                                dropHtml = this.analysisDropHtml(menu);
                                var bar = '<div class="toolbar-bar hasDropMenu">'
                                      + '<a class="toolbar-a-style" id="">'
                                        + '<span  class="' + clsName + '">&nbsp;</span>'
                                        + '<span>' + name + '</span>'
                                        + '<span class="icon-arrows-right dropIcon"></span>'
                                      + '</a>'
                                      + dropHtml
                                     + '</div>';
                                html.push(bar);
                            }
                            break;
                        default:
                            if (menu.length > 0) {
                                var dropHtml = '';
                                dropHtml = this.analysisDropHtml(menu);
                                var bar = '<div class="toolbar-bar hasDropMenu">'
                                      + '<a class="toolbar-a-style" id="">'
                                        + '<span  class="' + clsName + '">&nbsp;</span>'
                                        + '<span>' + name + '</span>'
                                        + '<span class="icon-arrows-right dropIcon"></span>'
                                      + '</a>'
                                      + dropHtml
                                     + '</div>';
                                html.push(bar);
                            }
                            break;
                    }
                }
                content.append(html.join(''));
            });
        },
        /**
        *显示“更多”工具
        *@method show
        *@private
        */
        show: function (o) {
            var _length = $('#menu_tools li').length;
            var _height = 29 * (_length + 1);
            $('#menu_tools').height(_height);
        },
        /**
        *隐藏“更多”工具
        *@method hidden
        *@private
        */
        hidden: function (o) {
            var _height = 24;
            $('#menu_tools').height(_height);
        },

        /**
        *全屏
        *@method togglefullscreen
        */
        togglefullscreen: function () {
            if (this._fullcreen) {
                this.showothers();
                $("#menu_FullScreen").children("span:eq(0)").removeClass("icon-exit-full-screen").addClass("icon-full-screen");

                $('.body-nav-search').animate({
                    top: "15px"
                }, "fast", function () {
                    $(".body-nav-search").css("z-index","-1");
                    $(".body-nav-search").remove();
                });
                
            }
            else {
                this.hideothers();
                $("#menu_FullScreen").children("span:eq(0)").removeClass("icon-full-screen").addClass("icon-exit-full-screen");

                
                $("#navbar .form-group").clone(false).appendTo(".out-container").addClass("body-nav-search");
                $('.body-nav-search').animate({
                    top: "50px"
                }, "fast");


                $('.body-nav-search').on('keydown', 'input', function (e) {
                    if (e.keyCode == 13)
                    {
                        var key = $.trim($(e.currentTarget).val());
                        var map = L.DCI.App.pool.get("map");
                        map.query(key);
                    }
                });

                $('.body-nav-search').on('click', '[data-info="searchRange"]', function (e) {
                    var key = $.trim($(e.currentTarget).siblings()[0].value);
                    var map = L.DCI.App.pool.get("map");
                    map.query(key);
                });

                

            }
            //刷新菜单高度
            L.dci.app.pool.get("leftPanel").refreshBaseMenuHeight();
            setTimeout(function () {
                L.dci.app.pool.get("map").map.invalidateSize({
                    animate: false,
                    pan: false
                });
            }, 500);

        },

        /**
        *全屏
        *@method fullscreen
        */
        fullscreen: function () {
            var docElm = document.documentElement;
            //W3C 
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            }
                //FireFox 
            else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            }
                //Chrome等 
            else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            }
                //IE11 
            else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
            //this.hideothers();

        },

        /**
        *隐藏其他菜单
        *@method hideothers
        */
        hideothers: function () {
            $(".out-container").addClass("FullScreen");
            this._fullcreen = true;
        },

        /**
        *显示其他菜单
        *@method showothers
        */
        showothers: function () {
            $(".out-container").removeClass("FullScreen");
            this._fullcreen = false;
        },

        /**
        *全屏界面高度调整
        *@method jugemapnum
        */
        jugemapnum: function () {
            var _width = null;
            if (L.DCI.App.pool.get("MultiMap").preSplit == "one") {
                if (L.dci.app.pool.get("leftPanel")._showpanel == false)
                    _width = 40;
                else
                    _width = 180;
            }
            else if (L.DCI.App.pool.get("MultiMap").preSplit == "tow") {
                if (L.dci.app.pool.get("leftPanel")._showpanel == false)
                    _width = 20;
                else
                    _width = 90;
            }
            else if (L.DCI.App.pool.get("MultiMap").preSplit == "three") {
                if (L.dci.app.pool.get("leftPanel")._showpanel == false)
                    _width = 20;
                else
                    _width = 90;
            }
            else if (L.DCI.App.pool.get("MultiMap").preSplit == "four") {
                if (L.dci.app.pool.get("leftPanel")._showpanel == false)
                    _width = 20;
                else
                    _width = 90;
            }
            return _width;
        },

        /**
        *退出全屏
        *@method exitfullscreen
        */
        exitfullscreen: function () {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
            else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            //this.showothers();
        },

        /**
        *执行菜单
        *@method tool
        */
        tool: function (e) {
            e.stopPropagation();
            L.DomEvent.stopPropagation(e);
            var id = e.currentTarget.id;
            if (id != "")
            {
                id = id.split('_')[1];
                L.dci.app.menu.excuteTool(id);
            }
            else
            {
                var name = $(e.currentTarget).children("span:eq(1)").html();
                var eleObj = $(e.currentTarget);
                if (name == "分析")
                {
                    e.data.obj.dropBox(eleObj);
                } else if (name == "分享") {

                    if (L.dci.app.pool.has("SView") == false) {
                        var sView = new L.DCI.SView();
                        L.dci.app.pool.add(sView);
                    }
                    L.DCI.App.pool.get("SView").saveView();                    
                }
                else if (name == "收藏") {

                    if (L.dci.app.pool.has("SView") == false) {
                        var sView = new L.DCI.SView();
                        L.dci.app.pool.add(sView);
                    }
                    L.DCI.App.pool.get("SView").getslist();
                }
                else
                {
                    //弹出工具盒
                    e.data.obj.createToolBoxContent(name, eleObj);
                }
                
                
            }
            
        },

        /**
        *构造工具盒子的内容
        *@method createToolBoxContent
        */
        createToolBoxContent: function (name, eleObj) {
            var data = L.dci.app.menu._data;
            var targetData = null;
            var html = '';
            for (var i = 0; i < data.length; i++)
            {
                if (name == data[i].name)
                {
                    targetData = data[i].menu;
                    break;
                }
            }

            for (var j = 0; j < targetData.length; j++)
            {
                html += '<a class="toolbox-a-style" id="menu_' + targetData[j].id + '">'
                           + '<span  class="' + targetData[j].clsName + '"></span>'
                           + '<span class="toolName">' + targetData[j].name + '</span>'
                       + '</a>';
            }

            //弹出工具盒
            this.toolBox(name, html, eleObj);
            $('#toolbox').on('click', 'a', { obj: this }, this.tool);
            
        },

        /**
        *分析下来菜单html
        *@method analysisDropHtml
        */
        analysisDropHtml:function(data){
            var smarty = [];        //常用分析功能数组
            var layerControl = [];  //以图管控分析功能数组
            var landPanel = [];    //用地分析功能数组
            var others = [];        //其它分析功能数组
            var html = '';

            for (var i = 0; i < data.length; i++)
            {
                var name1 = data[i].name;
                //构造常用分析功能数据
                if (name1 == "用地平衡分析" || name1 == "以图管控" || name1 == "公服设施分析")
                    smarty.push(data[i]);

                if (name1.indexOf("设施") !=-1)
                {
                    //构造设施类数据
                    layerControl.push(data[i]);
                }
                else if (name1.indexOf("用地") != -1)
                {
                    //构造用地分析数据
                    landPanel.push(data[i]);
                }
                else
                {
                    //综合类数据
                    others.push(data[i]);
                }
            }

            html += '<div class="analysisDropMenu">'
            if (smarty.length > 0)
            {
                html += '<div class="analysisDropMenu-smarty">';
                for (var j = 0; j < smarty.length; j++)
                {
                    if(j == smarty.length-1)
                        html += '<a class="analysisDropMenu-a-smarty lastchild" id="menu_' + smarty[j].id + '">' + smarty[j].name + '</a>';
                    else
                        html += '<a class="analysisDropMenu-a-smarty" id="menu_' + smarty[j].id + '">' + smarty[j].name + '</a>';
                    
                }
                html += '</div>';
            }
            if (layerControl.length > 0)
            {
                html += '<div class="analysisDropMenu-layercontrol"><p>设施类</p><div>';
                for (var j = 0; j < layerControl.length; j++)
                {
                    html += '<a class="analysisDropMenu-a" id="menu_' + layerControl[j].id + '">' + layerControl[j].name + '</a>';
                }
                html += '</div></div>';
            }
            if (landPanel.length > 0)
            {
                html += '<div class="analysisDropMenu-landpanel"><p>用地类</p><div>';
                for (var j = 0; j < landPanel.length; j++)
                {
                    html += '<a class="analysisDropMenu-a" id="menu_' + landPanel[j].id + '">' + landPanel[j].name + '</a>';
                }
                html += '</div></div>';
            }
            if (others.length > 0)
            {
                html += '<div class="analysisDropMenu-others"><p>综合类</p><div>';
                for (var j = 0; j < others.length; j++)
                {
                    html += '<a class="analysisDropMenu-a" id="menu_' + others[j].id + '">' + others[j].name + '</a>';
                }
                html += '</div></div>';
            }
            html += '</div>';
            return html;
        },



        /**
        *工具盒子
        *@method toolBox
        */
        toolBox: function (title, html, eleObj) {
            //定义一个随机数
            var num = Math.ceil(Math.random() * 100);
            var ele = $(".toolbox");
            for (i = 0; i < ele.length; i++)
            {
                var titleName = $(ele[i]).children("p").children("span:first").html();
                if (titleName == title)
                    return;
            }
            var id = "toolbox" + num;
            var titleId = "toolbox" + num + "_title";

            var boxHtml = '<div id="'+ id +'" class="toolbox">'
                            + '<p id="'+ titleId +'"><span>' + title + '</span><span class="icon-close2 close_toolbox"></span></p>'
                            + '<div>'
                                + html
                            + '</div>'
                        + '</div>'

            $("body").append(boxHtml);
            //定位
            //获取元素距离当前视口左边的距离
            var leftOffSet = Math.ceil(eleObj.offset().left);
            var eleWidth = eleObj.width();
            var width = $("#"+ id).width();
            var windowWidth = $("body").width();
            if (leftOffSet > (width / 2) && (leftOffSet + (eleWidth / 2) + (width / 2)) < windowWidth)
            {//垂直元素居中
                var w = leftOffSet + (eleWidth / 2) - (width / 2);
                $("#"+id).css("left", w + "px");
            } 
            else if (leftOffSet <= (width / 2))
            {//垂直元素左对齐
                $("#" + id).css("left", leftOffSet + "px");
            } 
            else
            {//隔离当前视口右边10像素
                var width2 = windowWidth - width - 10;
                $("#" + id).css("left", width2 + "px");
            }


            //添加可拖动事件
            L.dci.app.util._drag(id, titleId);
            $("#" + id).on('click', 'span.close_toolbox', function () { $("#" + id).remove(); });
            $("#" + id).on('click', 'a', { obj: this }, this.tool);
                
        },

        /**
        *分析下拉框
        *@method dropBox
        */
        dropBox: function (eleObj) {
            
            if (eleObj.hasClass("active"))
            {
                eleObj.removeClass("active");
                eleObj.children("span:eq(2)").removeClass("icon-arrows-down").addClass("icon-arrows-right");
            }
            else
            {
                eleObj.addClass("active");
                eleObj.children("span:eq(2)").removeClass("icon-arrows-right").addClass("icon-arrows-down");
            }
               
            //定位
            //获取元素距离当前视口左边的距离
            var leftOffSet = Math.ceil(eleObj.offset().left);
            var eleWidth = eleObj.width();
            var width = $(".analysisDropMenu").width();
            var windowWidth = $("body").width();

            if ((leftOffSet + width) <= (windowWidth - 3))
            {//垂直元素左对齐
                $(".analysisDropMenu").css("left", "0px");
            }
            else
            {//垂直元素右对齐
                var width2 = -(width - eleWidth);
                $(".analysisDropMenu").css("left", width2 + "px");
            }
        },

    });
    return L.DCI.ToolBar;
});