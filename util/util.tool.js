/**
*全局工具函数类
*@module util
*@class DCI.UtilTool
*/
define("util/tool", [
    "leaflet",
    "core/dcins"
], function (L) {
    L.DCI.UtilTool = L.Class.extend({


        /**
        *_attaToken
        *@type {string}
        */
        _oaToken: null,


        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            //if (this._attaToken == null)
            //{
            //    var username = Manage_ParamConfig.oaUsername;
            //    var password = Manage_ParamConfig.oaPassword;

                //$.getJSON(Project_ParamConfig.oaSystemUrl + "/User/GetToKen?callback=?", { UserName: username, Password: password }, this._setOatoken);
            //};
        },


        /**
        *自动登录规管系统
        *@method autoLogin
        *@param caseId {String} 案件编号
        */
        autoLogin: function (caseId) {
            if (caseId == undefined || caseId =="") {
                //alert("未能找到该项目");
                return;
            }
            $.getJSON(Project_ParamConfig.oaSystemUrl + "/User/GetToKen?callback=?", { UserName: '管理员', Password: '112', BimId: caseId }, function (json) {
                if (json && json.ReturnCode == 0) {
                    window.open(Project_ParamConfig.oaSystemUrl + "/User/AutoLogin?returnUrl=%2fDCIWeb4%2fBusiness%2fBusinessInfo%3fbimId%3d" + caseId + "&bimId=" + caseId + "&token=" + json.Message);
                }
                else {
                    L.dci.app.util.dialog.alert("温馨提示", "未能找到该项目表单");
                }
            });
            //window.open(Project_ParamConfig.oaSystemUrl + "/User/AutoLogin?returnUrl=%2fDCIWeb4%2fBusiness%2fBusinessInfo%3fbimId%3d" + caseId + "&bimId=" + caseId + "&token=" + L.dci.app.util.user.getToken());
        },

        /**
        *设置规管token
        *@method oatoken
        */
        _setOatoken: function (json) {
            this._oaToken = json.Message;
            $.cookie('attaToken', this._oaToken);
        },

        /**
        *自动登录一张图系统
        *@method autoLoginOneMap
        *@param name {String} 用户名
        *@param pwd {String} 密码
        */
        autoLoginOneMap: function (name, pwd) {
            $.getJSON(Project_ParamConfig.defaultCoreServiceUrl + "/core/validate/token?name=gh&pwd=Fy4CuoJuaw54+eWvxisZXw==", function (json) {
                window.open(Project_ParamConfig.defaultUserImages + "/default.aspx?token=" + json);
            });
        },

        /**
        *判断是否是显示字段
        *@method showAttribute
        *@param attributes{Array} 过滤数组
        *@param att{String} 属性
        */
        isShowAttribute: function (attributes, att) {
            for (var i = 0; i < attributes.length; i++) {
                if (attributes[i].toLowerCase() == att.toLowerCase()) {
                    return false;
                }
            }
            return true;
        },
        /**
        *自动登录运维系统
        *@method autoOpenManageWindow
        *@param url{String} 地址
        *@param data{String} 参数
        */
        autoOpenManageWindow: function (url,data) {
            var tempForm = document.createElement("form");
            tempForm.id = "tempForm1";
            tempForm.method = "post";
            tempForm.target = "_blank";
            tempForm.action = url;
            var hideInput = document.createElement("input");
            hideInput.type = "hidden";
            hideInput.name = "token";
            hideInput.value = data;
            tempForm.appendChild(hideInput);
            $(tempForm).on("onsubmit", function() {
                window.open(url);
            });
            document.body.appendChild(tempForm);
            tempForm.submit();
            document.body.removeChild(tempForm);
        }
    });

    return L.DCI.UtilTool;
});