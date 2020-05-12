/**
*专题顺序及透明度类
*@module controls
*@class DCI.Controls.LayerIndexAndOpacity
*@extends L.Control
*/
define("controls/indexandopacity", [
    "leaflet",
    "core/dcins",
    "plugins/scrollbar",
    "plugins/icheck",
    "controls/layertab"
], function (L) {

    L.DCI.Controls.LayerIndexAndOpacity = L.Class.extend({
        /**
        *类标识
        *@property id
        *@type {String}
        */
        id: 'layerIndexAndOpacity',
        /**
        *专题列表界面标签
        *@property btnTemp
        *@type {String}
        */
        btnTemp: '<div class="leaflet-control-featurelist leaflet-control" id="leaflet-control-featurelist">专题列表</div>',
        /**
        *控件界面主体
        *@property temp
        *@type {String}
        */
        temp: '<div class="leaflet-controls-featurelist-container leaflet-control" datainfo="none" id="leaflet-controls-featurelist-container">'
                + '<div class="featurelist-triangle"></div>'
                + '<div class="featurelist-container">'
                    + '<div class="featurelist-container-top">'
                        + '<span class="checkAll"><input type="checkbox"/></span>'
                        + '<span class="checkAllText">全选</span>'
                        + '<span class="deletefeature">删除</span>'
                    + '</div>'
                    + '<div class="featurelist-container-center"></div>'
                    + '<div class="featurelist-container-bottom">'
                        + '<p>透明度</p>'
                        + '<div id="scrollBar">'
                            + '<div id="scroll_Track"></div>'
                            + '<div id="scroll_Thumb"></div>'
                        + '</div>'
                        + '<span id="scrollBarTxt">55%</span>'
                    + '</div>'
                + '</div>'
             + '</div>',
        /**
        *进度条透明度最大值
        *@property _scrollBar_maxValue
        *@type {Number}
        *@default 100
        *@private
        */
        _scrollBar_maxValue: 100,
        /**
        *当前控件宽度
        *@property _currentWidth
        *@type {Number}
        *@default 0
        *@private
        */
        _currentWidth: 0,
        /**
        *当前控件X值
        *@property _currentX
        *@type {Number}
        *@default 0
        *@private
        */
        _currentX: 0,
        /**
        *每次增加间隔数
        *@property _step
        *@type {Number}
        *@default 1
        *@private
        */
        _step: 1,
        /**
        *滚动条透明度初始化值
        *@property _value
        *@type {Number}
        *@default 100
        *@private
        */
        _value: 100,
        _valite: false,
        /**
        *选中的专题
        *@property _tabNum
        *@type {Array}
        *@private
        */
        _tabNum: [],
        /**
        *拖曳的专题
        *@property _dropElement
        *@type {Object}
        *@private
        */
        _dropElement: null,
        /**
        *拖曳状态，默认不能拖动
        *@property _dropStatus
        *@type {Object}
        *@private
        */
        _dropStatus: false,
        /**
        *当前上下文
        *@property _this
        *@type {Object}
        *@private
        */
        _this: null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this._this = this;
            this.container = L.DomUtil.get('layertab-tabs-map-main');
            $(this.container).parent().append(this.btnTemp);
            $(this.container).parent().append(this.temp);

            this.feaBtn = L.DomUtil.get('leaflet-control-featurelist');
            this.feaContainer = L.DomUtil.get('leaflet-controls-featurelist-container');
            this.scrollBar = L.DomUtil.get('scrollBar');

            L.DomEvent.on(this.feaBtn, 'click', this.clickFeatureList, this);

            L.DomEvent.on(this.feaBtn, 'click', function (e) { L.DomEvent.stopPropagation(e); });
            L.DomEvent.on(this.feaBtn, 'dblclick', function (e) { L.DomEvent.stopPropagation(e); });
            L.DomEvent.on(this.feaBtn, 'mousemove', function (e) { L.DomEvent.stopPropagation(e); });

            L.DomEvent.on(this.feaContainer, 'click', function (e) { L.DomEvent.stopPropagation(e); });
            L.DomEvent.on(this.feaContainer, 'dblclick', function (e) { L.DomEvent.stopPropagation(e); });
            L.DomEvent.on(this.feaContainer, 'mousemove', function (e) { L.DomEvent.stopPropagation(e); });
            L.DomEvent.on(this.feaContainer, 'scroll', function (e) { L.DomEvent.stopPropagation(e); });
            L.DomEvent.on(this.feaContainer, 'mousedown', function (e) { L.DomEvent.stopPropagation(e); });

            //复选框使用插件
            $('.featurelist-container-top').find('input').each(function () {
                $(this).iCheck({
                    checkboxClass: 'icheckbox_flat-red',
                });
            });

            //滚动条
            $(".featurelist-container-center").mCustomScrollbar({
                theme: "minimal-dark"
            });

            //全选/取消
            var inpAll = $(".checkAll").find('input')[0];
            $(inpAll).on('ifClicked', { context: this }, function (e) {
                if (!$(this).is(':checked')) {
                    e.data.context.checkedAll();
                }
                else {
                    e.data.context.unCheckedAll();
                }
            });

            //删除
            $(".deletefeature").on('click',
                { context: this }, function (e) { e.data.context.deleteBtn(); });

            //拖动专题
            $(".featurelist-container-center .mCSB_container").on('mousedown',
                { context: this }, function (e) { e.data.context.featureMouseDownEvent(e); });

            //初始化后加入到缓存池中
            L.dci.app.pool.add(this);
        },

        /**
        *全选中
        *@method checkedAll
        */
        checkedAll: function () {
            var ele = $(".featurelist-container-center").find('div.icheckbox_flat-red');
            if (ele.length > 0) {
                for (var i = 0; i < ele.length; i++) {
                    $(ele[i]).iCheck("check");
                    var id = $(ele[i]).children("input").attr("layerid");
                    var name = $(ele[i]).children("input").attr("layername");
                    //var id = ele[i].childNodes[0].attributes[1].value;
                    //var name = ele[i].childNodes[0].attributes[2].value;
                    //获取对应专题的透明度
                    var opacity = this.getFeatureOpacity(id);
                    this._tabNum.push({ "id": id, "name": name, "opacity": opacity });
                }
            }
            //如果只有一个被选中，则显示其透明度
            if (this._tabNum.length == 1) {
                this.setScrollBarValue(this._tabNum[0].opacity);
            }
        },
        /**
        *全取消
        *@method unCheckedAll
        */
        unCheckedAll: function () {
            var ele = $(".featurelist-container-center").find('div.icheckbox_flat-red');
            if (ele.length > 0) {
                for (var i = 0; i < ele.length; i++) {
                    $(ele[i]).iCheck("uncheck");
                }
            }
            this._tabNum.length = 0;
        },
        /**
        *选中一个
        *@method checkedOne
        *@param e {Object} 事件回调对象
        */
        checkedOne: function (e) {
            var id = $(e.target).attr("layerid");
            var name = $(e.target).attr("layername");
            //获取对应专题的透明度
            var opacity = Math.round(this.getFeatureOpacity(id));
            this._tabNum.push({ "id": id, "name": name, "opacity": opacity });
            //如果只有一个被选中，则显示其透明度
            if (this._tabNum.length == 1) {
                this.setScrollBarValue(this._tabNum[0].opacity);
            }

            var ele = $(".featurelist-container-center").find('div.icheckbox_flat-red');
            if (this._tabNum.length == ele.length) {
                var inpAll = $(".checkAll").find('input')[0];
                $(inpAll).iCheck("check");
            }
        },
        /**
        *取消一个
        *@method unCheckedOne
        *@param e {Object} 事件回调对象
        */
        unCheckedOne: function (e) {
            var id = $(e.target).attr("layerid");
            //var id = e.target.attributes[1].value;
            for (var i = 0; i < this._tabNum.length; i++) {
                if (this._tabNum[i].id == id) {
                    this._tabNum.splice(i, 1);
                }
            }

            //存在一个没被勾选时，取消全选状态
            var ele = $(".featurelist-container-center").find('div.icheckbox_flat-red');
            if (this._tabNum.length != ele.length) {
                var inpAll = $(".checkAll").find('input')[0];
                $(inpAll).iCheck("uncheck");
            }

            //如果剩下一个被选中，则显示其透明度
            if (this._tabNum.length == 1) {
                this.setScrollBarValue(this._tabNum[0].opacity);
            }
        },

        /**
        *添加一个专题图层
        *@method addFeature
        *@param id {String} 专题ID
        *@param name {String} 专题名称
        */
        addFeature: function (id, name) {
            var html = '<div class="featureProgressBarContainer">'
                            + '<div class="featureProgressBar" layerID="' + id + '">'
                            + '<div class="featureCheckbox">'
                                + '<input type="checkbox" layerID="' + id + '" layerName="' + name + '"/>'
                            + '</div>'
                            + '<div class="featureContent">'
                                + '<div id="progressBar">'
                                    + '<div id="progressBar_Track"></div>'
                                + '</div>'
                                + '<div id="progressBarText">'
                                    + '<span>' + name + '</span>'
                                    + '<span>100%</span>'
                                + '</div>'
                            + ' </div>'
                        + '</div></div>';

            $(".featurelist-container-center .mCSB_container").append(html);

            //复选框使用插件  .featurelist-container-center   
            $('.featurelist-container-center .mCSB_container').find('input').each(function () {
                var kkk = $('.featurelist-container-center .mCSB_container').find('input:last');
                $(kkk).iCheck({
                    checkboxClass: 'icheckbox_flat-red',
                });
            });

            this.bingCheckOneEvent();            
        },
        /**
        *绑定check事件
        *@method bingCheckOneEvent
        */
        bingCheckOneEvent: function () {
            //单选、取消
            var inpOne = $(".featurelist-container-center").find('input:last');
            $(inpOne).on('ifClicked', { context: this }, function (e) {
                if (!$(this).is(':checked')) {
                    e.data.context.checkedOne(e);
                }
                else {
                    e.data.context.unCheckedOne(e);
                }
            });
        },
        /**
        *绑定选中全部事件
        *@method bingCheckAllEvent
        */
        bingCheckAllEvent: function () {

            var inp = $(".featurelist-container-center").find('input');
            for (var i = 0; i < inp.length; i++) {
                $(inp[i]).iCheck({
                    checkboxClass: 'icheckbox_flat-red',
                });

                $(inp[i]).on('ifClicked', { context: this }, function (e) {
                    if (!$(this).is(':checked')) {
                        e.data.context.checkedOne(e);
                    }
                    else {
                        e.data.context.unCheckedOne(e);
                    }
                });
            }
        },
        /**
        *删除一个专题图层
        *@method bingCheckAllEvent
        *@param options {Object} 专题配置
        */
        removeFeature: function (options) {
            if (options.map == "main") {
                var id = options.id;
                var kkk = $('.featurelist-container-center').find('input');
                for (var j = 0; j < kkk.length; j++)
                {
                    var deleteId = $(kkk[j]).attr("layerid");
                    //var deleteId = kkk[j].attributes[1].value;
                    if (deleteId == id) {
                        $(kkk[j]).parents(".featureProgressBarContainer").remove();
                    }
                }

                for (var i = 0; i < this._tabNum.length; i++) {
                    if (id == this._tabNum[i].id) {
                        this._tabNum.splice(i, 1);
                    }
                }
            }
        },
        /**
        *删除按钮
        *@method deleteBtn
        */
        deleteBtn: function () {
            var layerTab = L.DCI.App.pool.get("layerTab");
            var i = 0;
            while(this._tabNum.length!=0){
                var id = this._tabNum[i].id;
                var name = this._tabNum[i].name;

                var kkk = $('.featurelist-container-center').find('input');
                for (var j = 0; j < kkk.length; j++)
                {
                    var deleteId = $(kkk[j]).attr("layerid");
                    //var deleteId = kkk[j].attributes[1].value;
                    if (deleteId == id) {
                        $(kkk[j]).parents(".featureProgressBarContainer").remove();
                    }
                }
                //移除tab
                layerTab.removeFromMap(id, name);

                var lpId = id.split('-')[1];
                L.dci.app.pool.get("leftPanel")._setMenuStyleById(lpId, false);
            }
            this._tabNum.length = 0;
            //取消全选
            var inpAll = $(".checkAll").find('input')[0];
            $(inpAll).iCheck("uncheck");
        },
        /**
        *显示专题列表button
        *@method showBtn
        */
        showBtn: function () {
            this.obj = $('.leaflet-control-featurelist');
            this.obj.css("display", "block");
        },
        /**
        *隐藏专题列表button
        *@method hideBtn
        */
        hideBtn: function () {
            this.obj = $('.leaflet-control-featurelist');
            this.obj.css("display", "none");

            this.obj2 = $('.leaflet-controls-featurelist-container');
            this.obj2.css("display", "none");
        },
        /**
        *点击--专题列表
        *@method clickFeatureList
        */
        clickFeatureList: function () {
            this.obj = $('.leaflet-controls-featurelist-container');
            var text = this.obj.attr("datainfo");
            if (text == 'none') {
                this.obj.attr("datainfo", "block");
                //this.obj.css("display", "block");
                this.obj.animate({height: 'toggle'},"fast");
                this.scrollBar_Initialize();
            }
            else if (text == "block") {
                this.obj.attr("datainfo", "none");
                //this.obj.css("display", "none");
                this.obj.animate({ height: 'toggle' }, "fast");
                //取消所有勾选项
                var eleAll = $(".featurelist-container-top").find('div.icheckbox_flat-red')[0];
                $(eleAll).iCheck("uncheck");

                var ele = $(".featurelist-container-center").find('div.icheckbox_flat-red');
                if (ele.length > 0) {
                    for (var i = 0; i < ele.length; i++) {
                        $(ele[i]).iCheck("uncheck");
                    }
                }
                this._tabNum.length = 0;
            }
        },
        /**
        *获取对应专题的透明度
        *@method getFeatureOpacity
        *@param id {String} 专题ID
        */
        getFeatureOpacity: function (id) {
            //这里只对第一屏做专题透明度控制
            var map1 = L.DCI.App.pool.get("map").map;
            var opacity = 100;
            map1.eachLayer(function (layer) {
                if (layer.options && layer.options.id == id && layer.options.id != null) {
                    opacity = layer.options.opacity * 100;
                }
            });
            return opacity;
        },


        /*
        * 进度条-模块方法
        *****************************************************************************/
        /**
        *设置专题进度条值
        *@method setFeature
        *@options id {Object} 专题信息
        */
        setFeature: function (options) {
            var opacity = options.opacity;
            var opacityValue = options.opacityValue;
            var mWidth = opacity / this._scrollBar_maxValue * $("#progressBar").width();

            //判断要改变透明度的专题个数
            if (this._tabNum.length > 0) {
                //调整第一屏的图层透明度
                var map1 = L.DCI.App.pool.get("map").map;

                for (var i = 0; i < this._tabNum.length; i++) {
                    //获取专题id
                    var id = this._tabNum[i].id;
                    //改变tab保存的专题透明度值
                    this._tabNum[i].opacity = opacity;

                    //设置对应的滚动条透明值
                    var ele = $(".featurelist-container-center").find('div.icheckbox_flat-red');
                    if (ele.length > 0) {
                        for (var j = 0; j < ele.length; j++)
                        {
                            var layerId = $(ele[j].childNodes[0]).attr("layerid");
                            //var layerId = ele[j].childNodes[0].attributes[1].value;
                            if (layerId == id) {
                                var element1 = $(ele[j]).parent().siblings().find('div#progressBar_Track')[0];
                                var element2 = $(ele[j]).parent().siblings().find('div#progressBarText')[0];
                                $(element1).css("width", mWidth);
                                $(element2).children().last().text(opacityValue);
                            }
                        }
                    }
                    //结束-设置对应的滚动条透明值


                    //设置对应的专题的图层显示透明度
                    map1.eachLayer(function (layer) {
                        if (layer.options && layer.options.id == id && layer.options.id != null) {
                            var layer = layer;
                            layer.setOpacity(opacity / 100);
                        }
                    });
                    //结束-设置对应的专题的图层显示透明度



                }
            }

        },



        /*
        * 滑动条-模块方法
        *****************************************************************************/
        /**
        *初始化滑动条
        *@method scrollBar_Initialize
        */
        scrollBar_Initialize: function () {
            if (this._value > this._scrollBar_maxValue)
                return;            this.setScrollBarValue(this._value);
            $(".featurelist-container-bottom").on('mousedown',
                { context: this }, function (e) { e.data.context.mouseDownEvent(e); });
            $(".featurelist-container-bottom").on('mouseup',
                { context: this }, function (e) { e.data.context.mouseUpEvent(); });
            $("#scrollBar").on('click',
                { context: this }, function (e) { e.data.context.clickEvent(e); });
        },
        /**
        *通过透明度值设置滑动条值
        *@method setScrollBarValue
        *@param value {Number} 透明度值
        */
        setScrollBarValue: function (value) {
            this._currentX = $("#scrollBar").width() * (value / this._scrollBar_maxValue);
            $("#scroll_Track").css("width", this._currentX + 2 + "px");
            $("#scroll_Thumb").css("margin-left", this._currentX + "px");

            var opacityValue = value + "%";
            $("#scrollBarTxt").text(opacityValue);
            $("#scrollBarTxt").css("margin-left", this._currentX - 16 + "px");
        },
        /**
        *按下滑块事件
        *@method mouseDownEvent
        *@param e {Object} 事件回调对象
        */
        mouseDownEvent: function (e) {
            var ele = $("#scroll_Thumb");
            if ($(e.target).is(ele)) {
                this._valite = true;
                this._currentWidth = $("#scroll_Track").width();
                $(".featurelist-container-bottom").on('mousemove',
                    { context: this }, function (e) { e.data.context.mousemoveEvent(e) });
            }
        },

        /**
        *鼠标移动
        *@method mousemoveEvent
        *@param e {Object} 事件回调对象
        */
        mousemoveEvent: function (e) {
            if (this._valite == false) return;
            var moveWidth = event.clientX - $("#scrollBar").offset().left;
            var barWidth = $("#scrollBar").width();
            if (moveWidth <= 0) {
                moveWidth = 0;
                $("#scroll_Track").css("width", "0px");
                $("#scroll_Thumb").css("margin-left", "0px");
            }
            else if (moveWidth >= barWidth) {
                moveWidth = barWidth;
                $("#scroll_Track").css("width", barWidth + "px");
                $("#scroll_Thumb").css("margin-left", barWidth - 4 + "px");
            }
            else {
                $("#scroll_Track").css("width", moveWidth + 4 + "px");
                $("#scroll_Thumb").css("margin-left", moveWidth + "px");
            }


            var opacity = Math.round(moveWidth / barWidth * 100);
            var opacityValue = opacity + "%";
            $("#scrollBarTxt").text(opacityValue);
            $("#scrollBarTxt").css("margin-left", moveWidth - 16 + "px");

            this.setFeature({ "opacity": opacity, "opacityValue": opacityValue });
        },
        /**
        *松开滑块
        *@method mouseUpEvent
        *@param e {Object} 事件回调对象
        */
        mouseUpEvent: function (e) {
            this._valite = false;
            $(".featurelist-container-bottom").off('mousemove',
                { context: this }, function (e) { e.data.context.mousemoveEvent() });
        },
        /**
        *鼠标点击
        *@method clickEvent
        *@param e {Object} 事件回调对象
        */
        clickEvent: function (e) {
            var moveWidth = event.clientX - $("#scrollBar").offset().left;
            var barWidth = $("#scrollBar").width();
            if (moveWidth <= 0) {
                moveWidth = 0;
                $("#scroll_Track").css("width", "0px");
                $("#scroll_Thumb").css("margin-left", "0px");
            }
            else if (moveWidth >= barWidth) {
                moveWidth = barWidth;
                $("#scroll_Track").css("width", barWidth + "px");
                $("#scroll_Thumb").css("margin-left", barWidth - 4 + "px");
            }
            else {
                $("#scroll_Track").css("width", moveWidth + 4 + "px");
                $("#scroll_Thumb").css("margin-left", moveWidth + "px");
            }


            var opacity = Math.round(moveWidth / barWidth * 100);
            var opacityValue = opacity + "%";
            $("#scrollBarTxt").text(opacityValue);
            $("#scrollBarTxt").css("margin-left", moveWidth - 16 + "px");

            this.setFeature({ "opacity": opacity, "opacityValue": opacityValue });
        },


        /*
        * 专题拖曳-模块方法
        *****************************************************************************/
        /**
        *按下
        *@method featureMouseDownEvent
        *@param e {Object} 事件回调对象
        */
        featureMouseDownEvent: function (e) {
            var ele = $(".featureContent");
            var eleContainer = $(".featurelist-container-center .mCSB_container");
            if ($(e.target).parents(".featureContent").is(ele)) {
                this._dropStatus = true;
                var layerId = $(e.target).parents(".featureProgressBar").attr("layerid");

                var eleContainerTop = eleContainer.offset().top;
                var eleContainerLeft = eleContainer.offset().left;
                var eleContainerHeight = eleContainer.height();
                var eleConatinerWidth = eleContainer.width();
                var eleTop = $(e.target).parents(".featureProgressBar").offset().top;
                var eleClientY = e.clientY;
                var top = eleTop - eleContainerTop;

                $(e.target).parents(".featureProgressBar")
                    .addClass("dropFeatureNode");
                $(e.target).parents(".featureProgressBar")
                    .clone(true)
                    .appendTo(".featurelist-container-center .mCSB_container");

                $(e.target).parents(".featureProgressBar")
                    .parent()
                    .addClass("fDashed");
                $(e.target)
                    .parents(".featureProgressBarContainer")
                    .html("");

                $(".dropFeatureNode").css("top", top);

                var options = {
                    "eleContainerTop": eleContainerTop,
                    "eleContainerLeft": eleContainerLeft,
                    "eleContainerHeight": eleContainerHeight,
                    "eleConatinerWidth": eleConatinerWidth,
                    "eleClientY": eleClientY,
                    "layerId": layerId,
                }

                $(".featurelist-container-center .mCSB_container").on('mousemove',
                    { context: this }, function (e) { e.data.context.featureMousemoveEvent(e, options); });

                $(".featurelist-container-center .mCSB_container").on('mouseup',
                    { context: this }, function (e) { e.data.context.featureMouseUpEvent(e,options); });
            }
        },
        /**
        *拖动
        *@method featureMousemoveEvent
        *@param e {Object} 事件回调对象
        */
        featureMousemoveEvent: function (e, options) {
            if (this._dropStatus == false) return;

            var layerId = options.layerId;
            var moveClientY = e.clientY;
            var moveClientX = e.clientX;
            var marginTop = moveClientY - options.eleClientY;
            var maxTop = options.eleContainerTop + options.eleContainerHeight;
            var maxWidth = options.eleContainerLeft + options.eleConatinerWidth;


            if (moveClientX < options.eleContainerLeft
                || moveClientX > maxWidth
                || moveClientY < options.eleContainerTop
                || moveClientY > maxTop) {
                //this.featureMouseUpEvent(e, options);
            }
            else {
                $(".dropFeatureNode").css("margin-top", marginTop);
                var fea = $(".featurelist-container-center .mCSB_container").find(".featureProgressBarContainer");
                var top = e.clientY - options.eleContainerTop;
                var index = Math.ceil(top / 30);

                if (index <= fea.length) {
                    var Id = $(fea[index - 1]).children().attr("layerid");
                    if (Id != layerId) {
                        //移动专题
                        $(fea[index - 1]).children().clone(true).appendTo(".featureProgressBarContainer.fDashed");
                        $(".featureProgressBarContainer.fDashed").removeClass("fDashed");

                        //删除原来的专题
                        $(fea[index - 1]).addClass("fDashed");
                        $(fea[index - 1]).html("");
                    }
                }
            }

        },
        /**
        *松开
        *@method featureMouseUpEvent
        *@param e {Object} 事件回调对象
        */
        featureMouseUpEvent: function (e, options) {
            $(".dropFeatureNode").clone(true).appendTo(".featureProgressBarContainer.fDashed");
            var newNode = $(".featureProgressBarContainer.fDashed");
            newNode.children().removeClass("dropFeatureNode");
            newNode.children().css({ "top": "0px", "margin-top": "0px" });
            newNode.removeClass("fDashed");
            $(".dropFeatureNode").remove();
            $(".featurelist-container-center .mCSB_container").off('mousemove');
            $(".featurelist-container-center .mCSB_container").off('mouseup');

            this._dropStatus = false;
            // 重新绑定专题的复选框事件
            this.bingCheckAllEvent();

            var nodes = $(".featureProgressBar");
            for (var i = 0; i < nodes.length; i++) {
                var layerId = $(nodes[i]).attr("layerid");
                this.setFeatureLayerIndex(layerId, i+1);
            }
        },
        /**
        *调整图层顺序
        *@method setFeatureLayerIndex
        *@param layerId {String} 专题ID
        *@param index {Number} 专题所在索引
        */
        setFeatureLayerIndex: function (layerId,index) {
            var map = L.DCI.App.pool.get("map").map;
            if (map == null) {
                dci.app.util.dialog.error("map is null");
                return;
            };
            map.eachLayer(function (layer) {
                if (layer.options && layer.options.id != null && layer.options.id == layerId) {
                    if (layer.options.layerType == 1) {
                        if (layer._currentImage._image) {
                            layer._currentImage._image.style.zIndex = index;
                        }
                    }else if (layer.options.layerType == 2) {
                        if (layer._container) {
                            layer._container.style.zIndex =index;
                        }
                    }
                }
            });
        }
    });

    return L.DCI.Controls.LayerIndexAndOpacity;
});
