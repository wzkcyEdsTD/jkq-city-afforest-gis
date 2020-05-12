/**
*信息提示类
*@module util
*@class DCI.MTip
*/
define("util/mtip", ["leaflet", "bootstrap"], function (L) {

    L.DCI.MTip = L.Class.extend({
        /**
        *初始化
        *@method initialize
        */
        initialize: function () { },
        /**
        *信息提示
        *@method usetip
        *@param num{number} 图标序号 1:loading;2:success;3:error;
        *@param info{string} 文字信息
        *@param time{number} 自动消失时间(若num=1该参数设任意值)
        */
        usetip: function (num, info, time) {
            this._load = $(".right_loading");
            var divObj = $(".usetip");
            if (divObj.length > 0)
                this._load.html("");
            var timeNum = 0;
            switch (num) {
                default:
                case 1:
                    this.iconName = "icon-loading";
                    break;
                case 2:
                    this.iconName = "icon-item-information";
                    timeNum = 1500;
                    break;
                case 3:
                    this.iconName = "icon-close1";
                    timeNum = 2000;
                    break;
            };
            var html = '<div class="usetip">'
                          + '<div class="loadingFlash"><span class="' + this.iconName + '"></span>'
                          + '</div>'
                          + '<div class="loadingText">' + info + '</div>'
                      + '</div>'
            ;
            this._load.html(html);
            $(".usetip").css("display", "inline-block");
            var width = '-'+ $(".usetip").width() + 'px';
            $(".usetip").animate({
                right: '0px',
            }, 300);

            if(num!=1){
                setTimeout(function () {
                    $(".usetip").animate({
                        right: width,
                    }, 300);
                    setTimeout(function () { $(".usetip").remove(); }, 350);
                }, timeNum);
                
            };            
        }        
    });
    return L.DCI.MTip;
    

});
