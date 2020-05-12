/**
*用户密码头像设置类
*@module modules.login
*@class DCI.LoginSettings
*@constructor initialize
*/
define("login/settings", [
    "leaflet",
    "core/dcins",
    "plugins/form"
], function (L) {
    L.DCI.LoginSettings = L.Class.extend({
        /**
        *界面主体
        *@property html
        *@type {String}
        */
        html: '<div class="center-userset-panel" style="display: none;">'
            + ' <div class="container " style="max-height: 640px; width: 1040px;">'
            + '  <div class="usset-navbar">'
            + '      <div class="usset-title">'
            + '        <span>设置</span>'
            + '    </div>'
            + ' </div>'
            + '  <div class="userset white-sty boxshadow" style="border: 3px;">'
            + '     <ul class="nav">'
            + '        <li id="pwreset">'
            + '      <span class="icon-password-icon">&nbsp修改密码</span>'
            + '   </li>'
            + ' <li id="imgreset">'
            + ' <span class="icon-user-icon">&nbsp修改图像</span>'
            + ' </li>'
            + ' </ul>'
            + ' <div id="pwd-set">'
            + '    <div class="password-reset col-xs-6 col-lg-offset-3 col-sm-offset-4" style="padding: 20px; margin-top: 40px;" method="post" action="">'
            + '<p class="tooltip-change-password"></p>'
            + '   <div class="row">'
            + '     <p class="col-xs-4" style="text-align: right; vertical-align: central">原密码:</p>'
            + '   <p class="col-xs-8" style="width: 260px; height: 32px;">'
            + ' <input id="oldpassword" class="form-control" type="password" />'
            + ' </p>'
            + '</div>'
            + ' <div class="row" style="margin-top: 15px;">'
            + ' <p class="col-xs-4" style="text-align: right; vertical-align: central">新密码:</p>'
            + '  <p class="col-xs-8" style="width: 260px; height: 32px;">'
            + '  <input id="newpassword1" class="form-control" type="password" placeholder=""/>'
            + ' </p>'
            + '</div>'
            + '<div class="row " style="margin-top: 15px;">'
            + '<p class="col-xs-4" style="text-align: right;">确认新密码:</p>'
            + ' <p class="col-xs-8" style="width: 260px; height: 32px;">'
            + ' <input id="newpassword2" class="form-control" type="password" placeholder=""/>'
            + ' </p>'
            + '</div>'
            + '<div class="row pw-btn-gp">'
            + ' <p class="col-xs-3"></p>'
            + ' <p>'
            + '  <button id="change-password" class="btn-blue">保 存</button>'
            //+ '<asp:Button ID="btnSave" style="width:30px;height:20px" runat="server" Text="Save" onclick="PhotoToBinary()" />'
            + ' </p>'
            + ' </div>'
            + '</div>'
            + '</div>'
            + ' <div id="pic-set" style="display: none;">'
            + '  <div class="col-xs-5 col-xs-offset-2">'
            + '  <div class="upl-img">'
            + '<img class="head-yuan" border="0" style="display:none;width: 360px;height: 358px;margin-top: -15px;" />'
            + '<div class="upl">'
            + ' <p style="float: left;margin-top: 200px;">'
            + '   支持jpg，gif，png图片文件，且文件小于2MB，尺寸不小于180*180。<br />'
            + '  鼓励上传真实高清头像！'
            + '   <br />'
            + ' <br />'
            + '上传头像后，您可能需要刷新（F5）一下才能看见最新效果'
            + '<br />'
            + ' </p>'
            + '  </div>'
            + ' </div>'
            + '<div class="row pw-btn-gp">'
            + '<button id="re-choose" class=" pull-left" style="height: 32px; width: 100px; background: #3cc8ff;"> 选择</button>'
            + '  <form id="form1" runat="server">'
            + '<input id="imgfile" class="re-upload" name="imgfile" type="file"/>'
            + '</form>'
            + '<button id="iptUp" class="btn-blue pull-right">保 存</button>'
            + ' </div>'
            + ' </div>'
            + '<div class="col-xs-5">'
            + ' <div class="imgtip-box">'
            + ' <img class="head-big" style="width: 180px; height: 180px" src="themes/default/images/layout/u89.png" />'
            + ' <p>180*180像素</p>'
            + '  <img class="head-zho" style="width: 60px; height: 60px" src="themes/default/images/layout/u89.png" />'
            + '  <p>60*60像素</p>'
            + ' <img class="head-small" style="width: 30px; height: 30px" src="themes/default/images/layout/u89.png" />'
            + ' <p>30*30像素</p>'
            + '</div>'
            + '</div>'
            + '</div>'
            + ' </div>'
            + '</div>'
            + '<span class="center-userset-panel-close icon-close2"></span>'
            + ' </div>',
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            $(".out-container").append(this.html);
            $(".center-userset-panel").css({ "display": "block" });
            $("#pwd-set").css({ "display": "block" });
            $("#pic-set").css({ "display": "none" });
            $("#pwreset>span").css({ "border-bottom": "3px solid #ffb400" });
            $("#pwreset").on("click", function () {
                $("#pwd-set").css({ "display": "block" });
                $("#pic-set").css({ "display": "none" });
                $("#pwreset>span").css({ "border-bottom": "3px solid #ffb400" });
                $("#imgreset>span").css({ "border-bottom": "0px" });
            });
            $("#imgreset").on("click", function () {
                $("#pwd-set").css({ "display": "none" });
                $("#pic-set").css({ "display": "block" });
                $("#imgreset>span").css({ "border-bottom": "3px solid #ffb400" });
                $("#pwreset>span").css({ "border-bottom": "0px" });
            });
            $(".center-userset-panel-close").on("click", function () {
                $(".center-userset-panel").remove();
                $("#imgreset>span").css({ "border-bottom": "0px" });

            });

            $("#change-password").on({ 'click': this._changeP }, { obj: this });
            $("#imgfile").on({ "change": this.fileSelected }, {});
            $("#re-upload").on({ "change": this.fileSelected }, {});
            //$("#imgfile").on({ "click": this.fileSelected }, {});
            //$("#re-upload").on({ "click": this.fileSelected }, {});

            $("#iptUp").on({ "click": this.upload }, { obj: this });
        },
        /**
        *修改密码
        *@method _changeP
        *@private
        */
        _changeP: function(o) {
            var _this = o.data.obj;
            var url = Project_ParamConfig.defaultCoreServiceUrl + "/cpzx/core/validate/change/password";
            var _pwd = $("#oldpassword").val();
            var _npwd = $("#newpassword1").val();
            var _npwd1 = $("#newpassword2").val();

            //验证新密码是否符合规范
            //验证新密码或确认密码
            var passwordObj1 = _this.verifyPassword(_npwd, "新密码");
            var passwordObj2 = _this.verifyPassword(_npwd1, "确认新密码");
            if (passwordObj1.verifyName == false)
            {
                $(".tooltip-change-password").text(passwordObj1.errorText);
                return;
            }
            if (passwordObj2.verifyName == false)
            {
                $(".tooltip-change-password").text(passwordObj2.errorText);
                return;
            }


            if (_npwd != _npwd1) {
                $(".tooltip-change-password").text("两次输入新密码必须相同！");
            } else {
                var username = L.dci.app.util.user.getCurUser().name;
                //var params = '{"name":"' + username + '","pwd":"' + hex_md5(_pwd) + '","npwd":"' + hex_md5(_npwd) + '",}';
                var params = '{"name":"' + username + '","pwd":"' + _pwd + '","npwd":"' + _npwd + '",}';
                $.ajax({
                    url: url,
                    type: 'POST', //数据发送方式  
                    dataType: 'json', //接受数据格式  
                    contentType: "application/json",
                    data: params, //要传递的数据  
                    timeout: 1000,
                    error: _this._error,
                    success: _this.showtitile
                });
            }
        },

        /**
        *验证密码
        *@method verifyPassword
        *@param password {String} 密码
        *@param name {String} 提示名称
        *@return {Object} 密码验证结果以及提示内容
        */
        verifyPassword: function (password, name) {
            var regex = new RegExp("[A-Z]");
            if (password == "")
                return { "verifyName": false, "errorText": "" + name + "不能为空" };
            if (password.indexOf(" ") > -1)
                return { "verifyName": false, "errorText": "" + name + "不能包含空格" };
            //if (!regex.test(password))
            //    return { "verifyName": false, "errorText": "" + name + "没有包含一个大写字母" };
            //if (password.length < 6){
            //    return { "verifyName": false, "errorText": "" + name + "长度不能小于6" };
            //}
            return { "verifyName": true, "errorText": "" };
        },


        /**
        *显示标题
        *@method showtitile
        *@private
        */
        showtitile: function(data) {
            var _data = JSON.parse(data);
            if (_data.status) {
                var changpa = '<p style="font-size:14px;color:red;margin-top:6%;margin-left:45%">修改密码成功！</p>';
                $(".password-reset").css('display', 'none');
                $("#pwd-set").append(changpa);
            } else {
                $(".tooltip-change-password").text(_data.msg);
            }

        },
        /**
        *修改头像
        *@method uploadstr
        *@param str {String} 上传地址
        */
        uploadstr: function(str) {
            var username = L.dci.app.util.user.getCurUser().name;
            var _url = Project_ParamConfig.defaultCoreServiceUrl + '/cpzx/core/validate/change?name=' + username + '&url=' + str;
            var _dciAjax = new L.DCI.Ajax();
            _dciAjax.get(_url, null, true, null, function() {
                L.dci.app.util.dialog.alert("温馨提示", "修改头像成功");
                var user = new L.DCI.User();
                var path = user._userImages;
                $(".user-img").attr("src", Project_ParamConfig.defaultUserImages + path + "?" + Math.random() * 10); //加随机参数便于图片刷新
            }, function() {
                L.dci.app.util.dialog.alert("温馨提示", "修改头像失败");
            });
        },
        /**
        *上传头像图片
        *@method upload
        */
        upload: function(o) {
            var _this = o.data.obj;
            $("#form1").ajaxSubmit({
                success: function(str) {
                    if (str != null && str != "undefined") {
                        if (str != "2" || str != "3" || str != "4") {
                            _this.uploadstr(str);
                        } else if (str == "2") {
                            L.dci.app.util.dialog.alert("温馨提示", "只能上传jpg格式的图片");
                        } else if (str == "3") {
                            L.dci.app.util.dialog.alert("温馨提示", "图片不能大于1M");
                        } else if (str == "4") {
                            L.dci.app.util.dialog.alert("温馨提示", "请选择要上传的文件");
                        } else {
                            L.dci.app.util.dialog.alert("温馨提示", "操作失败");
                        }
                    } else L.dci.app.util.dialog.alert("温馨提示", "操作失败"); 
                },
                error: function (error) {
                    L.dci.app.util.dialog.alert("温馨提示", "操作失败");
                     //alert(error);
                },
                url: 'login.setting.ashx', /*设置post提交到的页面*/
                type: "post", /*设置表单以post方法提交*/
                dataType: "text" /*设置返回值类型为文本*/
            });
        },
        /**
        *修改密码错误提示
        *@method _error
        *@private
        */
        _error: function() {
            L.dci.app.util.dialog.alert("温馨提示", "修改密码请求失败，请重试");
        },
        /**
        *文件选择
        *@method fileSelected
        *@private
        */
        fileSelected: function() {
            if (navigator.userAgent.indexOf("Trident") >= 1)
            { // IE  MSIE
                if (navigator.userAgent.indexOf("MSIE 8.0") >= 1 || navigator.userAgent.indexOf("MSIE 9.0") >= 1)
                    url = document.getElementById(this.id).value;
                else
                    url = window.URL.createObjectURL(document.getElementById(this.id).files.item(0));
            } else if (navigator.userAgent.indexOf("Firefox") > 0) { // Firefox 
                url = window.URL.createObjectURL(document.getElementById(this.id).files.item(0));
            } else if (navigator.userAgent.indexOf("Chrome") > 0) { // Chrome 
                url = window.URL.createObjectURL(document.getElementById(this.id).files.item(0));
            }
            $(".head-big").attr("src", url);
            $(".head-zho").attr("src", url);
            $(".head-small").attr("src", url);
            $(".head-yuan").attr("src", url);
            $(".head-yuan").css('display', 'block');
            $(".upl").css('display', 'none');
            $("#re-choose").text("重新选择");
        }
    });
});