<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="default.aspx.cs" Inherits="Client._Default" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <script>L_PREFER_CANVAS = true;</script>
    <link rel="shortcut icon" href="themes/default/images/favicon.ico">
    <link rel="stylesheet" type="text/css" href="library/bootstrap/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="library/bootstrap/bootstrap-theme.min.css">
    <link rel="stylesheet" type="text/css" href="themes/default/css/system.main.css">
    <link type="text/css" rel="stylesheet" href="projects/layout/../../themes/default/css/layout.leftcontentpanel.css">
    <link type="text/css" rel="stylesheet" href="projects/layout/../../themes/default/css/layout.toolbar.css">



    <script src="projects/project.script.js" type='text/javascript'></script>
    <script data-main="projects/project.premium.init.js" src="library/requirejs/requirejs.js"></script>
    <!--[if IE 8]><link rel="stylesheet" type="text/css" href="themes/default/css/ie8.css" /><![endif]-->
</head>
<body>
    <input type="hidden" id="initCenter" runat="server"/>
    <input type="hidden" id="initZoom" runat="server"/>
    <input type="hidden" id="initCaseId" runat="server"/>
    <input type="hidden" id="initBtmId" runat="server"/>


    <div class="container-fluid out-container">
        <div class="row nav-row toppanel" id="toppanel">
            <nav id="navbar" class="navbar navbar-default">
                <div class="navbar-container container-fluid">
                    <div class="navbar-header">
                        <span class="navbar-header-home icon-home-icon" title="主页"></span>
                        <img class="navbar-header-title" src="themes/default/images/layout/guihuamap.png">
                    </div>
                    <form class="navbar-form navbar-left">
                        <div class="form-group">
                            <a id="nav-search" class="nav-search" data-info="searchRange">
                                <span class="icon-search-icon"></span>
                            </a>
                            <input type="text" class="form-control input-sm" id="search_key" placeholder="请输入道路名/项目关键字"></div>
                    </form>

                    <ul class="nav navbar-nav navbar-right">
                        <li data-info="slip" class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                                <img class="user-img" src=""><span></span><span class="icon-triangle"></span>
                            </a>
                        </li>

                    </ul>
                </div>
            </nav>
            <div id="toolbar" class="toolbar-content">
            </div>
        </div>
        <div class="row leftpanel" id="leftpanel"></div>
        <div class="row mappanel" id="centerpanel">
            <div id="map-main" class="col-sm-6 mapone leaflet-container leaflet-fade-anim" tabindex="0"></div>
        </div>
        <div class="row rightpanel" id="rightpanel"></div>
    </div>
</body>
</html>
