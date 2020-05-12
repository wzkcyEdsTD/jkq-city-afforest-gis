/**
*业务阶段顺序共用模版类
*@module modules.common
*@class DCI.Common.businessTemplate
*@constructor initialize
*@extends DCI.Layout
*/
define("common/businessTemplate", [
    "leaflet",
    "leaflet/esri"
], function (L) {
    L.DCI.Common.BusinessTemplate = L.DCI.Layout.extend({

        /*
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: "businessTemplate",

        container: null,
        names: [],
        data: [],
        index: 1,
        theme:'current',
        stepClickCallback: null,        //切换顺序回调函数
        viewAccessoryCallback:null,     //查看附件回调函数
        viewFormCallback: null,          //查看表单回调函数

        htmlTemplate: '<div class="businessTemplate">'
                        + '<p></p>'
                        + '<div class="businessTemplateLeft"></div>'
                        + '<div class="businessTemplateRight"></div>'
                     + '</div>',


        /*
        *初始化
        *@method initialize
        *@param options {Object}
        */
        initialize: function (options) {
            this.container = options.container;
            var title = options.title;
            this.names = options.names;
            this.data = options.data;
            this.index = options.index;
            this.theme = options.theme == null || options.theme == undefined ? 'current' : options.theme;
            this.isAnimate = options.isAnimate == null || options.isAnimate == undefined ? "false" : options.isAnimate;
            this.titleWidth = options.titleWidth == null || options.titleWidth == undefined ? 100 : options.titleWidth;
            this.stepClickCallback = options.stepClick == null || options.stepClick == undefined ? null : options.stepClick;
            this.viewAccessoryCallback = options.viewAccessory == null || options.viewAccessory == undefined ? null : options.viewAccessory;
            this.viewFormCallback = options.viewForm == null || options.viewForm == undefined ? null : options.viewForm;            

            //插入模版
            $(this.container).html(this.htmlTemplate);
            $(this.container).find(".businessTemplate>p").html(title);
            //插入类businessTemplateLeft的内容
            $(this.container).find(".businessTemplateLeft").html(this.getStepHtml(this.names,this.index));
            $(this.container).find(".businessTemplateRight").html(this.getContentHtml(this.data));
            this.setContentHeight();

            if (this.isAnimate == "true")
            {
                $(this.container).find(".businessTemplate").on('mouseenter', '.businessTemplateLeft', { context: this }, function (e) { e.data.context.mouseoverEvent(e); });
                $(this.container).find(".businessTemplate").on('mouseleave', '.businessTemplateLeft', { context: this }, function (e) { e.data.context.mouseoutEvent(e); });
            } 

            //绑定点击步骤序号事件
            if (this.theme == 'current')
            {
                $(this.container).find(".businessTemplate").on('click', 'div.stepNum:not(".currentStep")', { context: this }, function (e) { e.data.context.clickStep(e); });
            }
            else if (this.theme == 'timeline')
            {
                $(this.container).find(".businessTemplate").on('click', 'div.stepNum.passedStep:not(".currentStep")', { context: this }, function (e) { e.data.context.clickStep(e); });
            }

            $(this.container).find(".businessTemplate").on('click', 'span.viewAccessory', { context: this }, function (e) { e.data.context.viewAccessory(e); });
            $(this.container).find(".businessTemplate").on('click', 'span.viewForm', { context: this }, function (e) { e.data.context.viewForm(e); });
            
        },

        /*
        *获取步骤html
        *@method getStepHtml
        *@param names {Array}
        @param index {Number}
        */
        getStepHtml: function (names,index) {
            var sequenceHtml = '';
            for (var i = 1; i <= this.names.length; i++)
            {
                if (this.theme == 'current')
                {
                    if (i == index)
                    {
                        sequenceHtml += '<div class="stepNum otherStep currentStep" num="' + i + '">' + i + '<span>' + this.names[i - 1] + '</span></div>';
                    }
                    else
                    {
                        sequenceHtml += '<div class="stepNum otherStep" num="' + i + '">' + i + '<span>' + this.names[i - 1] + '</span></div>';
                    }
                }
                else if (this.theme == 'timeline')
                {
                    if (i < index)
                    {
                        sequenceHtml += '<div class="stepNum passedStep" num="' + i + '">' + i + '<span>' + this.names[i - 1] + '</span></div>';
                    }
                    else if (i == index)
                    {
                        sequenceHtml += '<div class="stepNum passedStep currentStep" num="' + i + '">' + i + '<span>' + this.names[i - 1] + '</span></div>';
                    }
                    else
                    {
                        sequenceHtml += '<div class="stepNum" num="' + i + '">' + i + '<span>' + this.names[i - 1] + '</span></div>';
                    }
                }
                else
                {
                }
            }
            return sequenceHtml;
        },

        /*
        *获取内容html
        *@method getContentHtml
        *@param data {Array}
        */
        getContentHtml: function (data) {
            var tableHtml = '';
            if (data.length == 0 || data == null)
            {
                tableHtml += '<div><p data-caseId="' + caseId + '" style="visibility: hidden;"><span class="viewAccessory">查看附件</span><span class="viewForm">查看表单</span></p>';
                tableHtml += '<table><tbody><tr><td class="emptyContent" colspan="2">无数据</td></tr></tbody></table></div>';
            }
            
            for (var i = 0; i < data.length; i++)
            {
                var isHas = false;
                var dataObj = data[i];
                var caseId = "";
                for (var att in dataObj)
                {
                    if (att == "CASE_ID")
                    {
                        isHas = true;
                        caseId = dataObj[att] == null?"":dataObj[att];
                        delete dataObj["CASE_ID"];
                        break;
                    }     
                }
                if (isHas == true)
                {
                    tableHtml += '<div><p data-caseId="' + caseId + '"><span class="viewAccessory">查看附件</span><span class="viewForm">查看表单</span></p>';
                    tableHtml += '<table><tbody>';
                }
                else
                {
                    tableHtml += '<div><p data-caseId="' + caseId + '" style="visibility: hidden;"><span class="viewAccessory">查看附件</span><span class="viewForm">查看表单</span></p>';
                    tableHtml += '<table><tbody>';
                }
                    
                
                
                for (var att in dataObj)
                {
                    if (typeof dataObj[att] == "number")
                        tableHtml += '<tr><td>' + att + '</td><td>' + dataObj[att].toFixed(2) + '</td></tr>';
                    else
                        tableHtml += '<tr><td>' + att + '</td><td>' + dataObj[att] + '</td></tr>';
                }
                tableHtml += "</tbody></table></div>";
            }
            return tableHtml;
        },

        /*
        *重新填充内容html
        *@method reFillData
        *@param data {Array}
        @param index {Number}
        */
        reFillData: function (data, index) {

            $(this.container).find(".businessTemplateRight").html("");
            var tableHtml = '';
            if (data.length == 0 || data == null)
            {
                tableHtml += '<div><p data-caseId="' + caseId + '" style="visibility: hidden;"><span class="viewAccessory">查看附件</span><span class="viewForm">查看表单</span></p>';
                tableHtml += '<table><tbody><tr><td class="emptyContent" colspan="2">无数据</td></tr></tbody></table></div>';
            }

            for (var i = 0; i < data.length; i++)
            {
                var isHas = false;
                var dataObj = data[i];
                var caseId = "";
                for (var att in dataObj)
                {
                    if (att == "CASE_ID")
                    {
                        isHas = true;
                        caseId = dataObj[att] == null ? "" : dataObj[att];
                        delete dataObj["CASE_ID"];
                        break;
                    }
                }

                if (isHas == true)
                {
                    tableHtml += '<div><p data-caseId="' + caseId + '"><span class="viewAccessory">查看附件</span><span class="viewForm">查看表单</span></p>';
                    tableHtml += '<table><tbody>';
                }
                else
                {
                    tableHtml += '<div><p data-caseId="' + caseId + '" style="visibility: hidden;"><span class="viewAccessory">查看附件</span><span class="viewForm">查看表单</span></p>';
                    tableHtml += '<table><tbody>';
                }

                for (var att in dataObj)
                {
                    if (typeof dataObj[att] == "number")
                        tableHtml += '<tr><td>' + att + '</td><td>' + dataObj[att].toFixed(2) + '</td></tr>';
                    else
                        tableHtml += '<tr><td>' + att + '</td><td>' + dataObj[att] + '</td></tr>';
                }
                tableHtml += "</tbody></table></div>";
            }
            $(this.container).find(".businessTemplateRight").html(tableHtml);
            this.setContentHeight();
        },


        setContentHeight:function(){
            var pHeight = parseInt($(this.container).find(".businessTemplate>p").outerHeight(true));
            var leftHeight = parseInt($(this.container).find(".businessTemplateLeft").height());
            var rightHeight = parseInt($(this.container).find(".businessTemplateRight").height());
            var height;
            if (leftHeight > rightHeight)
                height = leftHeight + pHeight;
            else
                height = rightHeight + pHeight - 20;
            $(this.container).find(".businessTemplate").css("height",height);
        },

        
        /*
        *步骤点击事件
        *@method clickStep
        *@param e {Object}
        */
        clickStep:function(e){
            var ele = e.currentTarget;
            $(ele).addClass("currentStep").siblings().removeClass("currentStep");
            return this.stepClickCallback(e);
        },


        /*
        *查看附件
        *@method viewAccessory
        *@param e {Object}
        */
        viewAccessory: function (e) {
            var ele = e.currentTarget;
            var caseId = $(ele).parent().attr("data-caseId");
            return this.viewAccessoryCallback(caseId,e);
        },

        /*
        *查看表单
        *@method viewForm
        *@param e {EventObject}
        */
        viewForm: function (e) {
            var ele = e.currentTarget;
            var caseId = $(ele).parent().attr("data-caseId");
            return this.viewFormCallback(caseId, e);
        },


        mouseoverEvent: function (e) {

            var ele = e.currentTarget;
            $(ele).stop();
            $(ele).animate({
                width: this.titleWidth + "px"
            }, 300);

        },

        mouseoutEvent: function (e) {
            var ele = e.currentTarget;
            $(ele).stop();
            $(ele).animate({
                width: "30px",
            }, 100);
        },

    });
    return L.DCI.BusinessTemplate;
});