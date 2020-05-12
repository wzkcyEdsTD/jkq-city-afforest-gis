/**
*审批浏览版类
*@module bmap
*@class DCI.BMap
*@constructor initialize
*/
define("bmap/business", [
    "leaflet",
    "leaflet/esri",
    "core/dcins",
    "core/symbol",
    "plugins/scrollbar"
], function (L) {

    L.DCI.BMap.QueryBusinessResult = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: 'QueryBusinessResult',

        /**
        *初始化传进来的数据
        *@property data
        *@type {Object}
        *@private
        */
        data: null,

        /**
        *标记类
        *@property _symbol
        *@type {Object}
        *@private
        */
        _symbol: null,

        /**
        *
        *@property _currentExtent
        *@type {Object}
        *@private
        */
        _currentExtent:null,

        /**
        *html模版
        *@property temphtml
        *@type {Object}
        *@private
        */
        temphtml: '<div class="queryBusinessResult">'
                    + '<p><span></span></p>'
                    + '<div>'
                        + '<div class="baseInfo">'
                            + '<p>基本信息</p>'
                            + '<table>'
                                + '<tbody>'
                                    + '<tr class="planName"><td class="key">项目名称:</td><td class="value"></td></tr>'
                                    + '<tr class="planUnit"><td class="key">编制名称:</td><td class="value"></td></tr>'
                                + '</tbody>'
                            + '</table>'
                        + '</div>'
                        + '<p>编制经历</p>'
                        + '<div class="experience">'
                        + '</div>'
                    + '</div>'
                + '</div>',


        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this._symbol = new L.DCI.Symbol();
        },

        /**
        *导入
        *@method load
        *@param data {Object} 数据
        *@param isDefLayer {Enum} 是否渲染当前方案
        */
        load: function (data, isDefLayer) {
            this.data = null;
            this.data = data;
            var caseId = data.CaseId;           //当浏览版初始化时，这里是编制项目的当前方案的CASE_ID；当执行项目查询编制业务时，这里是编制项目的最新方案的CASE_ID
            var startTime = data.StartTime;     //同上
            var obj = data.Values;              //这里的数据统一按照入库时间的降序
            
            this.rightPanle = L.dci.app.pool.get('bmapRightPanel');
            this.rightPanle.load(this.temphtml,0);
            //滚动条
            $(".queryBusinessResult>div").mCustomScrollbar({
                theme: "minimal-dark"
            });

            //显示标题和基本信息
            var planName = obj[0].PLANNAME;
            var planUnit = obj[0].PLANUNIT;
            $(".queryBusinessResult>p>span").html(planName);
            $(".queryBusinessResult .planName").find("td:last-child").html(planName);
            $(".queryBusinessResult .planUnit").find("td:last-child").html(planUnit);
            //信息编制经历
            var numIndex = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十"];
            //获取阶段显示名称（这里为鼠标移到数字上显示）
            var html = "";
            for (var i = 0; i < obj.length; i++) {
                var titleName = '';
                if (i == 0)
                    titleName = '第一次编制';
                else
                {
                    var num = numIndex[i - 1];
                    titleName = '第' + num + '次调整';
                }

                html += this.getExperienceHtml(titleName, obj[i]);
            }
            $(".queryBusinessResult .experience").html(html);

            var objData = null;
            for (var i = 0; i < obj.length; i++) {
                if (obj[i].CASE_ID == caseId) {
                    objData = obj[i];
                    break;
                }
            }
            //图像渲染
            if (isDefLayer == true) {
                this.DefLayer(objData);
                //标志当前的编制
                $(".experienceBusiness[data='" + caseId + "']").siblings().addClass("active");
            }

            //if (caseId != "") {
            //    var bmap = L.dci.app.pool.get('bmap');
            //    bmap.addHighLightLayer("CASE_ID", caseId);  //添加高亮图层并定位
            //}

            //绑定事件
            //跳转表单
            $(".queryBusinessResult").on('click', 'span.experienceBusiness', { context: this }, function (e) {
                var caseId = $(e.target).attr("data");
                L.dci.util.tool.autoLogin(caseId);
            });
            //显示图层
            $(".queryBusinessResult").on('click', 'span.experienceName:not(".active")', { context: this }, function (e) { e.data.context.ChooseProject(e); });
        },

        /**
        *获取模版
        *@method getExperienceHtml
        *@param titleName {String} 标题
        *@param data {Object} 数据
        */
        getExperienceHtml: function (titleName, data) {
            var caseId = data.CASE_ID;
            var startTime = data.STARTTIME;
            var endTime = data.ENDTIME;
            var passTime = data.PASSDATE;

            var html = '<div>'
                            + '<p><span class="experienceName">' + titleName + '</span><span class="experienceBusiness" data="' + caseId + '">业务表单</span></p>'
                            + '<table>'
                                + '<tbody>'
                                    + '<tr><td class="key">编制开始时间</td><td class="value">' + startTime + '</td></tr>'
                                    + '<tr><td class="key">编制完成时间</td><td class="value">' + endTime + '</td></tr>'
                                    + '<tr><td class="key">上报批复时间</td><td class="value">' + passTime + '</td></tr>'
                                + '</tbody>'
                            + '</table>'
                       + '</div>';
            return html;
        },

        /**
        *选择编制方案进行筛选显示地图要素(编制业务)
        *@method ChooseProject
        *@private
        */
        ChooseProject: function (e) {
            var caseId = $(e.target).siblings().attr("data");
            if (caseId != "" || caseId != undefined) {
                var objData = null;
                var obj = this.data.Values;
                for (var i = 0; i < obj.length; i++) {
                    if (obj[i].CASE_ID == caseId) {
                        objData = obj[i];
                        break;
                    }
                }
                //图像渲染
                this.DefLayer(objData);
                //取消其它标记的编制，高亮标志当前的编制
                var eles = $(".experienceName");
                for (var i = 0; i < eles.length; i++) {
                    $(eles[i]).removeClass("active");
                }
                $(".experienceBusiness[data='" + caseId + "']").siblings().addClass("active");
            }

            //this.addHighLightLayer("CASE_ID", caseId);
        },

        /**
        *筛选显示地图要素(编制业务)
        *@method DefLayer
        *@private
        */
        DefLayer: function (objData) {
            var config = Project_ParamConfig.bmapConfig;
            var data = config.bzBusinessDefLayer.data;
            var _map = L.dci.app.pool.get('bmap').getMap();

            //通过后台服务获取到的编制项目数据，可配变量如以下：
            var AREA = objData.AREA;
            var CASE_ID = objData.CASE_ID;
            var COMMENTS = objData.COMMENTS;
            var ENDTIME = objData.ENDTIME;
            var OBJECTID = objData.OBJECTID;
            var PASSDATE = objData.PASSDATE;
            var PLANDATE = objData.PLANDATE;
            var PLANNAME = objData.PLANNAME;
            var PLANSEQ = objData.PLANSEQ;
            var PLANTYPE = objData.PLANTYPE;
            var PLANUNIT = objData.PLANUNIT;
            var REMARK = objData.REMARK;
            var STARTTIME = objData.STARTTIME;


            for (var i = 0; i < data.length; i++) {
                var url = data[i].url;
                var defLayer = data[i].defLayer;
                _map.eachLayer(function (layer) {
                    if (layer.options && layer.options.id != undefined && layer.options.id != "baseLayer") {
                        var num = layer.options.id.indexOf("浏览版");
                        var urlResult = layer.url.indexOf(url);
                        if (num >= 0 && urlResult >= 0) {
                            var deflayer = JSON.stringify(defLayer);
                            deflayer = deflayer.replace(/th_AREA/g, AREA);
                            deflayer = deflayer.replace(/th_CASE_ID/g, CASE_ID);
                            deflayer = deflayer.replace(/th_ENDTIME/g, ENDTIME);
                            deflayer = deflayer.replace(/th_OBJECTID/g, OBJECTID);
                            deflayer = deflayer.replace(/th_PASSDATE/g, PASSDATE);
                            deflayer = deflayer.replace(/th_PLANDATE/g, PLANDATE);
                            deflayer = deflayer.replace(/th_PLANNAME/g, PLANNAME);
                            deflayer = deflayer.replace(/th_PLANSEQ/g, PLANSEQ);
                            deflayer = deflayer.replace(/th_PLANTYPE/g, PLANTYPE);
                            deflayer = deflayer.replace(/th_PLANUNIT/g, PLANUNIT);
                            deflayer = deflayer.replace(/th_REMARK/g, REMARK);
                            deflayer = deflayer.replace(/th_STARTTIME/g, STARTTIME);
                            deflayer = JSON.parse(deflayer);
                            var layerDefs = deflayer;
                            layer.setLayerDefs(layerDefs);
                            layer.setOpacity(1);
                        }
                    }
                }, this);
            }
        }
    });

    return L.DCI.BMap.QueryBusinessResult;
});