/**
*Application类
*@module core
*@class DCI.Application
*/
define("core/application", [
    "leaflet",
    "core/dcins",
    "core/pool",
    "util/user",
    "data/manage/baseservice",
    "manage/controls/userpanel",
    "manage/controls/featurepanel",
    "manage/controls/registerresource",
    "manage/controls/resfunction",
    "manage/controls/privilegeconfig",
    "manage/controls/loggingpanel",
    "manage/controls/visitedlogging",
    "manage/controls/layerContrast",
    "manage/controls/globalsearchpanel"
], function (L) {

    L.DCI.Application = L.Class.extend({
      
        /**
        *缓冲池对象
        *@property pool
        *@type {Object}
        */
        pool: null,
        user:null,

        
        userPanel: null,
        rolePanel: null,
        featurePanel: null,
        registerresource: null,
        loggingPanel: null,
        visitedLoggingPanel: null,

        _logoHtml: '',
        _menuHtml: '',
        _body: null,
        currentMenu: null,
        currentMenuText:'',


        /**
        *html模版
        *@property _html
        *@type {String}
        */
        _html: '<div class="container-fluid main-container">'
                    + '<div class="row toppanel">'
                        + '<div class="toppanel_left"></div>'
                        + '<div class="toppanel_middle"></div>'
                        + '<div class="toppanel_right"></div>'                        
                    + '</div>'
                    + '<div class="row sitemappanel">'
                        + '<div class="sitemappanel_title"></div>'
                        + '<div class="right_loading"></div>'
                    + '</div>'
                    + '<div class="row mainpanel">'
                        + '<div class="submainpanel use_manage active"></div>'
                        + '<div class="submainpanel resource_manage"></div>'
                        + '<div class="submainpanel privilege_config"></div>'
                        + '<div class="submainpanel log_manage"></div>'
                    + '</div>'
                + '</div>',

        userHtml: '<div class="userPanel">'
                                    + '<li class="menuLi dropdown">'
                                        + '<a class="dropdown-toggle" data-toggle="dropdown" href="#">'
                                            + '<img class="user-img" src="" />'
                                            + '<span id="user-name">管理员</span>'
                                            + '<b class="caret"></b>'
                                        + '</a>'
                                        + '<ul class="dropdown-menu subMenu">'
                                            + '<li>'
                                                + '<a id="loginout-toppanel" href="#"><i class="icon-exit"></i><span style="margin-left:10px">退出</span></a>'
                                            + '</li>'
                                        + '</ul>'
                                    + '</li>'
                             + '</div>',


        /**
        *菜单模版
        *@property ulHtml
        *@type {String}
        */
        ulHtml: '<ul class="nav navbar-nav dci_navbar">'
                    + '<li class="menuLi active">'
                        + '<a class="dropdown-toggle navA" href="#">用户管理</a>'
                    + '</li>'
                    + '<li class="menuLi dropdown hasSubMenu">'
                        + '<a class="dropdown-toggle" data-toggle="dropdown" href="#">资源管理<span class="icon-triangle"></span></a>'
                        + '<ul class="dropdown-menu subMenu">'
                            + '<li><a class="navA" href="#">服务注册</a></li>'
                            + '<li><a class="navA" href="#">专题配置</a></li>'
                            + '<li><a class="navA" href="#">功能管理</a></li>'
                            + '<li><a class="navA" href="#">图层对照</a></li>'
                            + '<li><a class="navA" href="#">全局搜索配置</a></li>'
                        + '</ul>'
                    + '</li>'
                    + '<li class="menuLi">'
                        + '<a class="dropdown-toggle navA" href="#">权限配置</a>'
                    + '</li>'
                    + '<li class="menuLi dropdown hasSubMenu">'
                        + '<a class="dropdown-toggle" data-toggle="dropdown" href="#">日志管理<span class="icon-triangle"></span></a>'
                        + '<ul class="dropdown-menu subMenu">'
                            + '<li><a class="navA" href="#">登录日志</a></li>'
                            +'<li><a class="navA" href="#">资源访问日志</a></li>'
                        + '</ul>'
                    + '</li>'
             + '</ul>',


        

        initialize: function () {
            this.pool = new L.DCI.Pool();      
            document.oncontextmenu = function () { return false; };     //隐藏浏览器右键菜单
            document.body.innerHTML = this._html;
            $(".toppanel_middle").append(this.ulHtml);
            $(".toppanel_right").append(this.userHtml);
            this.currentMenu = $(".menuLi.active");
            this.currentMenuText = "用户管理";
            this._loadUserTool();
            $(".dci_navbar").on('mouseover', 'ul.subMenu', { context: this }, function (e) { e.data.context.enterSubMenu(e); });
            $(".dci_navbar").on('mouseout', 'ul.subMenu', { context: this }, function (e) { e.data.context.leaveSubMenu(e); });
            $(".dci_navbar").on('click', 'li', { context: this }, function (e) { var text = $(e.target).text(); e.data.context.targetMenu(text, e); });

            $(".toppanel_left").text(Manage_ParamConfig.defaultTitle);
            //点击空白处关闭温馨提示框
            //$(".main-container").on('click', { context: this }, function (e) {
            //    var obj = $(".errorDialogModel");
            //    if (obj.length != 0)
            //        obj.remove();
            //});
        },
        /**
        *加载用户菜单
        *@method _loadUserTool
        */
        _loadUserTool: function () {
            
            html = [];
            this.user = new L.DCI.User();

            var curUser = this.user.getCurUserName();

            var curUserDisplayName = this.user.getCurUserDisplayName();

            var path = this.user._userImages;

            $('.user-img')[0].src = Project_ParamConfig.defaultUserImages + path + '?' + Math.random() * 10;
            //$('#user-name')[0].innerHTML = curUserDisplayName + "(" + curUser + ")";
            $('#user-name')[0].innerHTML = curUserDisplayName ;

            $("#loginout-toppanel").on("click", function () {
               
                //L.dialog.confirm("退出提示", "确认要退出系统？", function () {
                //location.href = "login.aspx";
                //});
                L.dialog.confirm("温馨提示", "确认要退出系统？", function () {
                    location.href = "login.aspx";
                });
            });
        },


        /**
        *获取Logo的html元素
        *@method getLogoHtml
        */
        getLogoHtml: function () {
            var html = '<div class="logo"><img src="themes/default/images/controls/123.png" /></div>';
            return html;
        },
        
        /**
        *进入子菜单
        *@method enterSubMenu
        *@param e {Object} 事件对象
        */
        enterSubMenu: function (e) {
            var targetObj = $(e.target).hasClass(".hasSubMenu") ? $(e.target) : $(e.target).parents(".hasSubMenu");
            targetObj.addClass("active");
        },
        /**
        *离开子菜单
        *@method leaveSubMenu
        *@param e {Object} 事件对象
        */
        leaveSubMenu: function (e) {
            var targetObj = $(e.target).hasClass(".hasSubMenu") ? $(e.target) : $(e.target).parents(".hasSubMenu");
            targetObj.removeClass("active");
            //显示当前菜单状态
            this.currentMenu.addClass("active");
        },

        /**
        *跳转到菜单
        *@method targetMenu
        *@param text {String} 菜单名称
        *@param e {Object} 事件对象
        */
        targetMenu: function (text, e) {
            switch (text)
            {
                case '用户管理':
                case '服务注册':
                case '专题配置':
                case '功能管理':
                case '图层对照':
                case '权限配置':
                case '登录日志':
                case '资源访问日志':
                case '全局搜索配置':
                    if (text == this.currentMenuText) return;
                    this.changeState(text, e);
                    this.menu(text);
                    this.currentMenuText = text;
                    break;
                default:
                    break;
            }
        },

        /**
        *改变菜单状态以及内容容器状态
        *@method changeState
        *@param text {String} 菜单名称
        *@param e {Object} 事件对象
        */
        changeState: function (text, e) {
            if (text == "资源管理" || text == "日志管理") return;

            //改变菜单状态
            var ele = $(".menuLi");
            for (var i = 0; i < ele.length; i++)
            {
                if ($(ele[i]).hasClass("active"))
                {
                    $(ele[i]).removeClass("active");
                }
            }
            var targetObj = $(e.target).hasClass("menuLi") ? $(e.target) : $(e.target).parents(".menuLi");
            targetObj.addClass("active");
            this.currentMenu = targetObj;

            //改变内容容器状态
            //隐藏内容模块
            var containers = $(".mainpanel").find('div.submainpanel');
            for (var j = 0; j < containers.length; j++)
            {
                if ($(containers[j]).hasClass("active"))
                {
                    $(containers[j]).removeClass("active");
                    break;
                }
            }
            //显示当前内容模块
            switch (text)
            {
                case '用户管理':
                    $(".use_manage").addClass("active");
                    break;
                case '服务注册':
                case '专题配置':
                case '功能管理':
                case '图层对照':
                case '全局搜索配置':
                    $(".resource_manage").addClass("active");
                    break;
                case '权限配置':
                    $(".privilege_config").addClass("active");
                    break;
                case '登录日志':
                case '资源访问日志':
                    $(".log_manage").addClass("active");
                    break;
                default:
            }


            
        },

        /**
        *跳转功能
        *@method menu
        *@param text {String} 菜单名称
        */
        menu: function (text) {

            switch (text)
            {
                case '用户管理':
                    this.userPanel = new L.DCI.UserPanel();
                    L.app.pool.add(this.userPanel);
                    this.userPanel.loading();
                    break;
                case '服务注册':
                    this.registerresource = new L.DCI.RegisterResource();
                    L.app.pool.add(this.registerresource);
                    break;
                case '专题配置':
                    this.featurePanel = new L.DCI.FeaturePanel();
                    L.app.pool.add(this.featurePanel);
                    this.featurePanel.loading();
                    break;
                case '功能管理':
                    this.resfunction = new L.DCI.ResFunction();
                    L.app.pool.add(this.resfunction);
                    break;
                case '图层对照':
                    this.layerContrast = new L.DCI.LayerContrast();
                    L.app.pool.add(this.layerContrast);
                    break;
                case '权限配置':
                    this.privilegeConfig = new L.DCI.PrivilegeConfig();
                    L.app.pool.add(this.privilegeConfig);
                    this.privilegeConfig.loading();
                    break;
                case '登录日志':
                    this.loggingPanel = new L.DCI.LoggingPanel();
                    L.app.pool.add(this.loggingPanel);
                    break;
                case '资源访问日志':
                    this.visitedLoggingPanel = new L.DCI.VisitedLoggingPanel();
                    L.app.pool.add(this.visitedLoggingPanel);
                    break;
                case '全局搜索配置':
                    this.globalSearchPanel = new L.DCI.GlobalSearchPanel();
                    L.app.pool.add(this.globalSearchPanel);
                    this.globalSearchPanel.loading();
                    break;
                default:
            }
        },
    });

    return L.DCI.Application;
});