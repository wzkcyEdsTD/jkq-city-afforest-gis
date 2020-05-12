/**
*浏览器版本提示类
*@module modules.common
*@class DCI.BrowserSetting
*@constructor initialize
*/
define("browser/setting", [
    "leaflet",
    "core/dcins"
], function (L) {
    L.DCI.BrowserSetting = L.Class.extend({

        /**
        *系统类型
        *@property system
        *@type {String}
        *@private
        */
        system: '',

        /**
        *系统位数
        *@property bit
        *@type {String}
        *@private
        */
        bit: 0,

        /**
        *浏览器类型
        *@property browser
        *@type {String}
        *@private
        */
        browser: '',

        /**
        *浏览器版本号
        *@property browser
        *@type {String}
        *@private
        */
        version: '',

        /**
        *是否更新或下载浏览器
        *@property updatebrowser
        *@type {Boolean}
        *@private
        */
        updatebrowser: false,

        /**
        *是否下载sp1
        *@property downloadsp1
        *@type {Boolean}
        *@private
        */
        downloadsp1: false,     

        /**
        *html模版
        *@property tempHtml
        *@type {String}
        *@private
        */
        tempHtml: '<div class="browsertip">'
                  + '<div class="browsermain">'
                    + '<div class="browserbody">'
                        + '<p class="title">使用IE11、Chrome浏览器才能达到最佳的浏览效果</p>'
                        + '<p class="resolution ">最佳分辨率：1280*768</p>'
                        + '<div class="imageContent">'
                            + '<div class="browser">'
                                + '<span class="IEimage">'
                                    + '<img src="themes/default/images/browser/IEicon.png" />'
                                + '</span>'
                                + '<p class="downloadbrowser"><a href="#" onfocus="this.blur();">下载IE11</a></p>'
                            + '</div>'
                            + '<div class="browser">'
                                + '<span class="Chromeimage">'
                                    + '<img src="themes/default/images/browser/Chromeicon.png" />'
                                + '</span>'
                                + '<p class="downloadbrowser"><a href="#" onfocus="this.blur();">下载Chrome</a></p>'
                            + '</div>'
                        + '</div>'
                        + '<div class="sp1">'
                            + '<p>下载win7补丁sp1：<a href="browser/windows6.1-KB976932-X86.exe" onfocus="this.blur();">32位</a>/<a href="browser/windows6.1-KB976932-X64.exe" onfocus="this.blur();">64位</a></p>'
                        + '</div>'
                        + '<div class="tip">'
                            + '<span>不再提醒</span><input class="checkbox" value="false" type="checkbox"/>'
                        + '</div>'
                    + '</div>'
                    + '<div class="closebtn icon-close1"></div>'
                + '</div>'
                + '<div class="masklayer"></div>'
               + '</div>',

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this.system = '';
            this.bit = 0;
            this.browser = '';
            this.version = '';
            this.updatebrowser = false;
            this.downloadsp1 = false;
            this.checkCookie();
        },

        /**
        *点击下载浏览器时提示
        *@method browsetip
        */
        browsetip: function () {
            $('body').append(this.tempHtml);

            $(".browser").on("mouseover mouseout", function () {
                $(this).children('.downloadbrowser').toggleClass("downloadshow");
            });

            $(".closebtn").on('click', function () {
                $(".browsertip").remove();
            });

            $(".checkbox").on('click', function () {
                if ($("input[type='checkbox']").is(':checked')) {
                    var d = new Date();
                    d.setTime(d.getTime() + (360 * 24 * 60 * 60 * 1000));
                    var expires = "expires=" + d.toGMTString();
                    document.cookie = "dci-browsertips = false; " + expires;
                }
                else {
                    document.cookie = "dci-browsertips= true; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                }
            });

            $(".downloadbrowser").on('click', { "content": this }, function (e) {
                var text = $(this).children().html();
                _this = e.data.content;
                if (text == '下载IE11') {
                    if (_this.system == 'WinXP') {
                        alert('您的系统不支持IE11,请下载Chrome！');
                    }
                    else if (_this.system == 'Win7') {
                        if (_this.browser == 'IE') {
                            if (_this.updatebrowser == true) {
                                window.location = 'browser/EIE11_ZH-CN_WOL_WIN764.EXE';
                            }
                            else {
                                alert('您的浏览器是IE11,无需升级！');
                            }
                        }
                        else {
                            window.location = 'browser/EIE11_ZH-CN_WOL_WIN764.EXE';
                        }
                    }
                }
                else if (text == '下载Chrome') {
                    if (_this.browser == 'chrome') {
                        if (_this.updatebrowser == true) {
                            window.location = 'browser/42.0.2311.90_chrome_installer.exe';
                        }
                        else {
                            alert('您的浏览器是Chrome42.0.2311.90,无需升级！');
                        }
                    }
                    else {
                        window.location = 'browser/42.0.2311.90_chrome_installer.exe';
                    }
                }
                else {
                }
            });

        },

        /**
        *检测cookie
        *@method checkCookie
        */
        checkCookie: function () {
            var username = this.getCookie("dci-browsertips");
            if (username == "false" || username == "") {
                //获取浏览器版本信息、客户端计算机信息以及跳转到浏览器版本提醒页面
                this.getBrowserInfo();
                this.compareBrowser();
                this.isUserAgent();
                this.setCookie();


                if (this.browser.toLowerCase() == "ie" || this.browser.toLowerCase() == "chrome") {
                    if (this.browser.toLowerCase() == "ie" && this.updatebrowser == true || this.browser.toLowerCase() == "chrome" && this.updatebrowser == true) {
                        this.browsetip();
                    }
                }
                else {
                    this.browsetip();
                }
            }
            else {
                //不做任何操作 alert("Welcome again " + username);
            }
        },

        /**
        *获取cookie
        *@method getCookie
        *@param cname{String} cookie的key名称
        */
        getCookie: function (cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                //var c = ca[i].trim();
                var c = $.trim(ca[i]);   //解决ie8不支持trim()函数
                if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
            }
            return "";
        },

        /**
        *设置cookie
        *@method setCookie
        */
        setCookie: function () {
            var name = this.getCookie("dci-browsertips-parameter");
            if (name == '') {
                var d = new Date();
                d.setTime(d.getTime() + (360 * 24 * 60 * 60 * 1000));
                var expires = "expires=" + d.toGMTString();
                document.cookie = 'dci-browsertips-parameter = {"system":"' + this.system + '", "bit":"' + this.bit + '","browser":"' + this.browser + '","version":"' + this.version + '","updatebrowser":"' + this.updatebrowser + '","downloadsp1":"' + this.downloadsp1 + '"}; ' + expires;
            }
            else {
                document.cookie = "dci-browsertips-parameter =; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                var d = new Date();
                d.setTime(d.getTime() + (360 * 24 * 60 * 60 * 1000));
                var expires = "expires=" + d.toGMTString();
                document.cookie = 'dci-browsertips-parameter = {"system":"' + this.system + '", "bit":"' + this.bit + '","browser":"' + this.browser + '","version":"' + this.version + '","updatebrowser":"' + this.updatebrowser + '","downloadsp1":"' + this.downloadsp1 + '"}; ' + expires;
            }
        },

        /**
        *判断客户端计算机的系统 xp or win7
        *@method isUserAgent
        */
        isUserAgent: function () {

            var ua = navigator.userAgent;
            //alert(ua);
            if (ua.indexOf("Windows NT 5") != -1) {
                this.system = 'WinXP';
            }
            else if (ua.indexOf("Windows NT 6.1") != -1) {
                this.system = 'Win7';
            }
            else {
                this.system = 'other';
            }
        },

        /**
        *获取浏览器信息（浏览器名称和版本号）
        *@method getBrowserInfo
        */
        getBrowserInfo: function () {
            var userAgent = navigator.userAgent.toLowerCase();
            var browser;
            var version;
            var browserMatch = this.Match(userAgent);
            if (browserMatch.browser) {
                browser = browserMatch.browser;
                version = browserMatch.version;
            }
            //alert(browser+version);
            this.browser = browser;
            this.version = version;
        },

        /**
        *判断浏览器类型及版本号
        *@method Match
        *@param ua{String} 浏览器信息
        *@return {Object} 返回浏览器名称和版本号
        */
        Match: function (ua) {
            rMsie = /(msie\s|trident.*rv:)([\w.]+)/,
            rFirefox = /(firefox)\/([\w.]+)/,
            rOpera = /(opera).+version\/([\w.]+)/,
            rChrome = /(chrome)\/([\w.]+)/,
            rSafari = /version\/([\w.]+).*(safari)/;

            var match = rMsie.exec(ua);
            if (match != null) {
                return { browser: "IE", version: match[2] || "0" };
            }
            var match = rFirefox.exec(ua);
            if (match != null) {
                return { browser: match[1] || "", version: match[2] || "0" };
            }
            var match = rOpera.exec(ua);
            if (match != null) {
                return { browser: match[1] || "", version: match[2] || "0" };
            }
            var match = rChrome.exec(ua);
            if (match != null) {
                return { browser: match[1] || "", version: match[2] || "0" };
            }
            var match = rSafari.exec(ua);
            if (match != null) {
                return { browser: match[2] || "", version: match[1] || "0" };
            }
            if (match != null) {
                return { browser: "", version: "0" };
            }
        },

        //
        /**
        *比较两个浏览器,设置服务器最新的浏览器版本号
        *@method compareBrowser
        */
        compareBrowser: function () {
            var ieBrowserVersion = '11.0';
            var chromeBrowserVersion = '42.0.2311.90';
            if (this.browser.toLowerCase() == 'ie')
            {
                if (parseFloat(this.version) < parseFloat(ieBrowserVersion))
                {
                    this.updatebrowser = true;
                }
                else
                {
                    this.updatebrowser = false;
                }
            }

            if (this.browser.toLowerCase() == 'chrome')
            {
                var current = this.version.split(".")[0];
                var compareVersion = chromeBrowserVersion.split(".")[0];
                if (parseInt(current) < parseInt(compareVersion))
                {
                    this.updatebrowser = true;
                }
                else
                {
                    this.updatebrowser = false;
                }
            }
        },

    });
    return L.DCI.BrowserSetting;
});

