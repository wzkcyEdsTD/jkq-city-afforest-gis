/**
*top布局类
*@module layout
*@class DCI.Layout.TopPanel
*@constructor initialize
*@extends DCI.Layout
*/
$(document).ready(function(){
	
})
define("layout/toppanel", [
    "leaflet",
    "core/dcins",
    "layout/base",
    "layout/menu",
    "layout/toolbar"
], function (L) {

    L.DCI.Layout.TopPanel = L.DCI.Layout.extend({

        /**
        *html模版
        *@property tempHtml
        *@type {String}
        *@private
        */
        tempHtml: '<nav id="navbar" class="navbar navbar-default">'
                    + '<div class="navbar-container container-fluid">'
                        + '<div class="navbar-header">'
                        //+ '<span class="navbar-header-home icon-home-icon" title="主页"></span>'
                        //+ '<img  class="navbar-header-title"/>'
							+'<div class="logo-menu pull-left">'
								+'<a class="logo" href="/GGSS/JGSP">'
                                    + '城市绿化管理信息系统（绿地动态监管GIS平台）'
								+'</a>'
							+'</div>'
                        + '</div>'  
						+'<div class="nav-move slideMenuBar">'
							+'<ul class="nav navbar-nav slideMenu" style="left: 0px;">'
								+'<li class="nav-item">'
									+'<a href="javascript:" class="top_manager_mapLayer">'
										+'图层管理'
									+'</a>'
								+'</li>'
								+'<li class="nav-item ">'
                                    +'<a href="javascript:" class="top_manager_data">'
										+'数据统计'
									+'</a>'
								+'</li>'
								+'<li class="nav-item ">'
                                    +'<a href="javascript:" class="top_manager_division">'
										+'行政区划'
									+'</a>'
								+'</li>'
                                + '<li class="nav-item ">'
                                    + '<a href="javascript:" class="top_manager_project">'
                                        + '项目管理'
                                    + '</a>'
                                + '</li>'
                                + '<li class="nav-item ">'
                                    + '<a href="javascript:" class="top_manager_system">'
                                        + '系统管理'
                                    + '</a>'
                                + '</li>'
							+'</ul>'
						+'</div>'
                        + '<ul id="nav-dorpdownF" class="nav navbar-nav navbar-right"></ul>'
                        + '</div>'
                + '</nav>',
        searchHtml: '<form class="navbar-form navbar-left" id="navbar-form-search">'
                            + '<div class="form-group">'
                                + '<a id="nav-search" class ="nav-search" data-info="searchRange"><span class="icon-search-icon"></span></a>'
                                + '<input type="text" class="form-control input-sm" id="search_key" placeholder="请输入道路名/项目关键字" />'
                            + '</div>'
                        + '</form>',

        /**
        *是否全屏
        *@property _fullscreen
        *@type {Boolean}
        *@private
        */
        _fullscreen: false,

        /**
        *查询类对象
        *@property _query
        *@type {Object}
        *@private
        */
        _query: null,

        /**
        *工具条
        *@property _toolbar
        *@type {Object}
        *@private
        */
        _toolbar: null,

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            L.DCI.Layout.prototype.initialize.call(this);
            this.id = "topPanel";
            this.body = $("#toppanel");
            this.body.html(this.tempHtml);
            $("body").append(this.searchHtml);
            //加载用户信息
            this._loadUserTool();
            //加载工具栏
            this._toolbar = new L.DCI.Layout.ToolBar();
            if (L.dci.app.pool.has("toolbar") == false)
            {
                L.dci.app.pool.add(this._toolbar);
            }

            $('#nav-dorpdownF').on({ 'mouseenter': this.show, 'mouseleave': this.hidden }, '[data-info ="slip"]', { obj: this });
            $('#nav-search').on('click', this.search);
            var _this = this;
            document.getElementById("search_key").onkeydown = function (e) {
                var e = e || window.event;
                if (e.keyCode == 13) {
                    _this.search();
                    return false;
                }
            };
            this._setSystemType();
        },



        /**
        *显示用户信息
        *@method show
        *@param event{Object} 事件对象
        */
        show: function (event) {
            var ele = $(this).find(".dropdown-menu");
            if (ele.length === 0) {
                var _ele = $(this).find('#user');
                var _ele_width = event.data.obj.getWidth(_ele.find('li'));
                _ele.width(_ele_width).children().width(_ele_width);
                return;
            }
            var ele_height = event.data.obj.getHeight(ele.children());
            ele.height(ele_height);
            if (ele.prev().hasClass("user")) return;
            ele.css({ "border-bottom": "solid 1px #787878", "overflow": "hidden" });
            if (ele.hasClass("dropdown-menus")) {

                $("._moretool").prev().removeClass("dropdown-toggle");
                $("._moretool").prev().addClass("dropdown-menu-toggle");
            }
            else {
                ele.prev().removeClass("dropdown-toggle");
                ele.prev().addClass("dropdown-menu-toggle");
            }
        },
        
        /**
        *隐藏用户信息
        *@method hidden
        */
        hidden: function () {
            var $this = $(this);
            if ($this.hasClass("dropdown-user")) {
                $this.find('#user').width(0);
                return;
            }
            $this.find('.dropdown-menu').height(0);
            $this.find('.dropdown-menu').css({ "border-bottom": "none", "height": "0px", "overflow": "hidden" });
            if ($this.find('.dropdown-menu').hasClass("dropdown-menus")) {
                $("._moretool").prev().removeClass("dropdown-menu-toggle");
                $("._moretool").prev().addClass("dropdown-toggle");
            }
            else {
                $this.children("a").removeClass("dropdown-menu-toggle");
                $this.children("a").addClass("dropdown-toggle");
            }
        },

        /**
        *获取菜单工具高度
        *@method getHeight
        *@param ele{Object} 元素集
        */
        getHeight: function (ele) {
            var _height = 0;
            var _b_height = 0;
            ele.each(function () {
                if ($(this).css('display') == 'none') {                   //调节隐藏后元素的高度        
                    _height = _height;
                    _b_height = 10;

                }
                else {
                    _height = _height + $(this).outerHeight(true);
                    if ($(this).index() == ele.length - 1) {
                        _b_height = 0;                                       //调节样式一致
                    }
                }
            });
            _height = _height + _b_height;
            return _height;
        },

        /**
        *获取菜单工具宽度
        *@method getWidth
        *@param ele{Object} 元素集
        */
        getWidth: function (ele) {
            var _width = 0;
            ele.each(function () {
                _width = _width + $(this).outerWidth(true);
            });
            return _width;
        },
        
        /**
        *工具
        *@method tool
        *@param o{Object} 点击对象a
        */
        tool: function (o) {
            var id = o.currentTarget.id;
            id = id.split('_')[1];
            L.dci.app.menu.excuteTool(id);
        },

        /**
        *搜索
        *@method search
        */
        search: function (o) {
            $('#search_panel').fadeIn({ easing: 'linear' });
            var key = document.getElementById("search_key").value;
            key = key.replace(/\s/g, "");
            var patt1 = /[^a-zA-Z0-9\u4E00-\u9FA5\-]/g;    //匹配所有字母数字和中文以及字符"-"
            var result = patt1.test(key);
            if (result == true) {
                L.dci.app.util.dialog.alert("温馨提示", '搜索内容不能包含特殊字符');
                return;
            } else {
                var map = L.DCI.App.pool.get("map");
                map.query(key);
            }
        },


        /**
        *加载用户菜单
        *@method _loadUserTool
        */
        _loadUserTool: function () {
            var curUser = L.dci.app.util.user.getCurUserDisplayName();
            html = [];
            var user = new L.DCI.User();
            var path = user._userImages;
            html.push('<li data-info="slip"  class="dropdown" >');
            html.push('<a href="#" class="dropdown-toggle" data-toggle="dropdown">');

            html.push('<img class ="user-img" src="' + Project_ParamConfig.defaultUserImages + path + '?' + Math.random() * 10 + '" />');
            html.push('<span>' + curUser + '</span><span class="icon-triangle"></span>');
            html.push('</a>');

            html.push('<ul class="dropdown-menu">');
            html.push('<li id="login-settings"><a href="#"><i class="icon-set"></i>&nbsp&nbsp&nbsp设置</a></li>');
            html.push('<li id="manage-system" style="display: none;"><a href="#"><i class="icon-tool"></i>&nbsp&nbsp运维</a></li>');
            html.push('<li id="loginout-toppanel"><a href="#"><i class="icon-exit"></i>&nbsp&nbsp&nbsp退出</a></li>');
            html.push('</ul></li>');
            var nav = $("#nav-dorpdownF");
            nav.append(html.join(''));

            $("#loginout-toppanel").on("click", function () {
                L.dci.app.util.dialog.confirm("温馨提示", "确认要退出系统？", function () {
                    //location.href = "login.aspx";
                    //退出登录，返回审批平台登录页面
                    location.href ="/GGSS/JGSP/User/Login";
                });
            });
            $("#login-settings").on("click", function () {
                L.dci.app.tool["loginSetting"]();
            });


            var userId = L.dci.app.util.user.getCurUserId();
            var ajax = new L.DCI.Ajax();
            var services = Project_ParamConfig.defaultCoreServiceUrl;
            var url = services + '/cpzx/manage/user/ywxt/access/' + userId;
            ajax.requestText(url, null, true, this, function (res) {
                if (res.toLowerCase() == "true") {
                    $("#manage-system").show();
                    $("#manage-system").on("click", function () {
                        L.dci.app.util.tool.autoOpenManageWindow("manage.aspx", L.dci.app.util.user.getToken());
                    });
                } else {
                    $("#manage-system").hide();
                }
            });
        },

        /**
        *设置系统类型
        *@method _setSystemType
        */
        _setSystemType: function () {
            var params = [];
            var aParams = document.location.search.substr(1).split('&');
            for (var i = 0 ; i < aParams.length ; i++) {
                var aParam = aParams[i].split('=');
                var sParamName = decodeURIComponent(aParam[0]);
                var sParamValue = decodeURIComponent(aParam[1]);
                params[sParamName] = sParamValue;
            }
            $(".navbar-header-title").attr("src", "themes/default/images/layout/guihuamap.png");
            //var type = "ss";
            //if (params["fea_type"] != null && params["fea_type"] != "")
            //    type = params["fea_type"];
            //if (type == "ph") {
            //    $(".navbar-header-title").attr("src", "themes/default/images/layout/pihoumap.png");
            //} else if (type == "bz") {
            //    $(".navbar-header-title").attr("src", "themes/default/images/layout/bianzhimap.png");
            //} else {
            //    $(".navbar-header-title").attr("src", "themes/default/images/layout/shishimap.png");
            //}
            $(".navbar-header-home").on("click", function () {
                location.href = "home.aspx";
            });
        }
    });
    return L.DCI.TopPanel;
});
//获取url中的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}