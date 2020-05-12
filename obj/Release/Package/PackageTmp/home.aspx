<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="home.aspx.cs" Inherits="Client.Home" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
    <link rel="shortcut icon" href="themes/default/images/favicon.ico">
    <link href="library/bootstrap/bootstrap.min.css" rel="stylesheet" />
    <link href="themes/default/css/layout.home.css" rel="stylesheet" />
    <link href="themes/default/css/default.icon.css" rel="stylesheet" />
    <link href="plugins/jquery.customscrollbar/jquery.mCustomScrollbar.css" rel="stylesheet" />
    <link href="plugins/jquery.bxslider/jquery.bxslider.css" rel="stylesheet" />
    <script src="projects/project.script.js" type='text/javascript'></script>
    <script src='plugins/md5/md5.js' type='text/javascript' ></script>
    <script data-main="layout/layout.home.js" src="library/requirejs/requirejs.js"></script>
    <!--[if IE 8]><link rel="stylesheet" type="text/css" href="themes/default/css/ie8.css" /><![endif]-->
</head>
<body>
    <div class="outwidth container-fluid">
        <div class="outwidth first-row row out-container">
            <%-- top --%>
            <div class="top-panel">
                <nav class="navbar navbar-default">
                    <div class="navbar-container container-fluid">
                        <div class="navbar-header">
                            <a class="navbar-brand" href="#"></a>
                        </div>
                        <ul id="nav-dorpdownF" class="nav pull-right dropdown-user">
                            <li data-info="slip" class="dropdown">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                                    <img class="user-img" src="" />
                                    <span id="user-name"></span>
                                    <b class="caret"></b>
                                </a>
                                <ul class="dropdown-menu dropdown-menu-right">
                                    <li>
                                        <a id="setbutton" href="#"><i class="icon-set"></i>&nbsp&nbsp&nbsp设置</a>
                                    </li>
                                    <li>
                                        <a id="manageSystem" href="#" style="display: none;"><i class="icon-tool"></i>&nbsp&nbsp&nbsp运维</a>
                                    </li>
                                    <li>
                                        <a id="quitbutton" href="#"><i class="icon-exit"></i>&nbsp&nbsp&nbsp退出</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
            <%-- center --%>
            <div class="center-panel">
                <div class="center-panel-menu-contain">
                <div class="center-panel-menu">
                    <div class="center-panel-menu-item">
                        <a href="default.aspx?fea_type=bz">
                            <div class="tip "></div>
                        <span>编制一张图</span></a>
                    </div>
                    <div class="center-panel-menu-item">
                        <a href="default.aspx?fea_type=ss">
                        <div class="tip tip-two"></div>
                        <span>实施一张图</span></a>
                    </div>
                    <div class="center-panel-menu-item">
                        <a href="default.aspx?fea_type=ph">
                        <div class="tip tip-three"></div>
                        <span>批后一张图</span></a>
                    </div>
                </div>
                </div>

                <div class="center-panel-content">
                    <div class="center-panel-content-items">
                        <div class="item item-one">
                            <div class="title">控规</div>
                            <div class="chart" id="prj-info-chart-kg"></div>
                            <div class="content">
                                <p><span></span>&nbsp;&nbsp;&nbsp;覆盖面积</p>
                                <p><span></span>&nbsp;&nbsp;&nbsp;市域面积</p>
                            </div>
                        </div>
                        <div class="item item-two">
                            <div class="title">分区规划</div>
                            <div class="chart" id="prj-info-chart-fg"></div>
                            <div class="content">
                                <p><span></span>&nbsp;&nbsp;&nbsp;覆盖面积</p>
                                <p><span></span>&nbsp;&nbsp;&nbsp;市域面积</p>
                            </div>
                        </div>
                        <div class="item item-three">
                            <div class="title">总规用地</div>
                            <div class="chart" id="prj-info-chart-zx"></div>
                            <div class="content">
                                <p><span></span>&nbsp;&nbsp;&nbsp;覆盖面积</p>
                                <p><span></span>&nbsp;&nbsp;&nbsp;市域面积</p>
                            </div>
                        </div>
                        <div class="item item-four">
                            <div class="title">基础地形1:500分幅</div>
                            <div class="chart" id="prj-info-chart-dx"></div>
                            <div class="content">
                                <p><span></span>&nbsp;&nbsp;&nbsp;覆盖面积</p>
                                <p><span></span>&nbsp;&nbsp;&nbsp;市域面积</p>
                            </div>
                        </div>
                    </div>
                    <div class="center-panel-feature-chart">
                        <div class="chart-obj">
                            <div class="title title-sp"><p>规划审批数据入库情况</p><span class="icon-Viewform"></span></div>
                            <div class="content" id="chart-sp"></div>
                            <table class="homecharts-charts-table hides" id="acharts-charts-table-sp">
                               <thead><tr><td class="key">类型</td><td class="key-value">面积（m²）</td></tr></thead>
                               <tbody></tbody>
                            </table>
                        </div>
                        <div class="chart-obj">
                            <div class="title title-kg"><p>规划审批用地类型构成</p><span class="icon-Viewform"></span></div>
                            <div class="content" id="chart-kg"></div>
                            <table class="homecharts-charts-table hides" id="acharts-charts-table-kg">
                               <thead><tr><td class="key">类型</td><td class="key-value">业务量</td></tr></thead>
                               <tbody></tbody>
                            </table>
                        </div>
                    </div>
                    <div class="center-panel-feature-chart">
                        <div class="chart-obj">
                            <div class="title title-ydlx"><p>规划审批用地按用地类型统计</p><span class="icon-Viewform"></span></div>
                            <div class="content" id="chart-ydlx"></div>
                            <table class="homecharts-charts-table hides" id="acharts-charts-table-ydlx">
                               <thead><tr><td class="key">类型</td><td class="key-value">面积(m²)</td></tr></thead>
                               <tbody></tbody>
                            </table>
                        </div>
                        <div class="chart-obj">
                            <div class="title title-xzq"><p>规划审批用地按行政区统计</p><span class="icon-Viewform"></span></div>
                            <div class="content" id="chart-xzq"></div>
                            <table class="homecharts-charts-table hides" id="acharts-charts-table-xzq">
                               <thead><tr><td class="key">行政区</td><td class="key-value">面积(m²)</td></tr></thead>
                               <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    </div>
</body>
</html>
