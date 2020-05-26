<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="login.aspx.cs" Inherits="Client.Login" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>登录</title>
    <meta http-equiv="Content-Type" content="text/html; charset=gb2312" />
    <link rel="shortcut icon" href="themes/default/images/favicon.ico">
    <link rel="stylesheet" type="text/css" href="themes/default/css/default.login.css" />
    <script type='text/javascript' src='library/jquery/jquery-1.11.1.min.js'></script>
    <script type='text/javascript' src='projects/project.script.js'></script>
    <script type='text/javascript' src='library/bootstrap/bootstrap.min.js'></script>
    <script type='text/javascript' src='plugins/md5/md5.js'></script>
    <script type='text/javascript' src='plugins/jquery.cookie.js'></script>
    <script type='text/javascript' src='modules/login/login.verify.js'></script>
    <script data-main="projects/login/project.login.config.js" src="library/requirejs/requirejs.js"></script>
</head>
<body>
    <div class="div-relative">
        <div class="systemname">
            <!--系统名称-->
            <div class="nameimg">
                <a>
                    <img class="systemImg" src="themes/default/images/title.png" />
                </a>
                <!--<h4>城市绿化管理信息系统</h4><br />
                <p>(绿地动态监管GIS平台)</p>-->
            </div>
            <!--登录form-->
            <div class="login-box">
                <form action="login.aspx" method="post" class="form-login">
                    <div class="val-tips"></div>
                    <div>
                        <input type="hidden" name="url" value="">
                        <input autofocus="autofocus" class="form-control"  data-val="true" data-val-required="用户名 字段是必需的。" id="username" name="UserName" placeholder="用户名/邮箱" type="text" />
                        <i class="icon-user-icon"></i>
                    </div>
                    <div>
                        <input class="form-control" data-val="true" data-val-required="密码 字段是必需的。" id="userpwd" name="PWD" placeholder="密码" type="password" style="ime-mode:disabled" />
                        <i class="icon-password-icon"></i>
                    </div>
                    <div id="logintooltip"></div>
                    <input type="hidden" id="login-verify-url" name="LoginVerifyUrl"/>
                    <button class="btn btn-lg btn-block btn-login" id="btn-login" type="button">登 录</button>
                </form>
            </div>
        </div>
        <!--背景div-->
        <div class="blue-bg">
            <img class="img-bg" src="themes/default/images/Login/blue-bg.png" />
        </div>
        <!--背景div-->
        <!--<div class="map-photo">
            <a class="pull-left">
                <img class="img-bg2" src="themes/default/images/Login/map-photo.png" />
            </a>
        </div>-->
    </div>
</body>
</html>
