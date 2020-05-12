/**
*right布局类
*@module layout
*@class DCI.Layout.RightPanel
*@constructor initialize
*@extends DCI.Layout
*/
define("layout/rightpanel", [
    "leaflet",
    "core/dcins",
    "layout/base"
], function (L) {

    L.DCI.Layout.RightPanel = L.DCI.Layout.extend({
        /**
        *面板容器数量
        *@property _items
        *@type {Array}
        *@private
        */
        _items: [],

        /**
        *内容模版
        *@property tempHtml
        *@type {String}
        *@private
        */
        _tempHtml: '<div class="rightpanel-content">'
                    + '<div class="result-list-group-button">'
                       + '<div class="button hide" index="0"><span style="top: 13px;" class="icon-close2 closeBtn closeTab1"></span><span class="result-attribute-button" data-info="1" index="0"></span></div>'
                       + '<div class="button hide" index="1"><span style="top: 13px;" class="icon-close2 closeBtn closeTab2"></span><span data-info="1" index="1"></span></div>'
                       + '<div class="button rightpanel-conten-bz" name="编制一张图" data-type="onemap"><label index="1" class="summ">编</label></div>'
                       + '<div class="button rightpanel-conten-xm" name="项目一张图" data-type="onemap"><label index="1" class="summ">项</label></div>'
                       + '<div class="button rightpanel-conten-sx" name="时限一张图" data-type="onemap"><label index="1" class="summ">时</label></div>'
                       + '<div class="button rightpanel-conten-ph" name="批后一张图" data-type="onemap"><label index="1" class="summ">批</label></div>'
                    + '</div>'
                    + '<div class="result-list-group-loadflash"><div class="loadingFlash"><span class="icon-loading"></span></div></div>'
                    + '<div class="result-list-group hide" id="right-panel-body" index="0"></div>'
                    + '<div class="result-list-group rightonemep hide" index="1"></div>'
                 + '</div>',

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            L.DCI.Layout.prototype.initialize.call(this);
            this.id = "rightPanel";
            this.dom = $("#rightpanel");
            this.dom.html(this._tempHtml);
            this.body = $('.result-list-group');
            var _this = this;
            $(".result-list-group-button .button").click(function (e) {
                var index = $(e.currentTarget).attr("index");
                if (index == undefined)
                    return;
                else
                    _this._buttonClick(e);
            });
            var _this = this;
            $(".closeTab1").click(function (e) {
                var labelSelector = '.rightpanel-content .result-list-group-button .button[index=0] span:last-child';
                var title = $(labelSelector)[0].innerText;
                _this.clear(title);
                e.stopPropagation();
                if (title == "全生命周期")
                {
                    L.dci.app.pool.remove("wholelifecycle");
                }
            });
            $(".closeTab2").click(function (e) {
                //一张图功能关闭事件
                var featureName = $(e.currentTarget).siblings("span").text();
                L.dci.app.pool.get('leftPanel').removeLayerByName(featureName);
                e.stopPropagation();
            });
            $(".result-list-group-button").on('click', 'div[data-type]', { obj: this }, function (e) {
                e.stopPropagation();
                var _this = e.data.obj;
                var eleObj = $(".rightpanel-content .result-list-group-button .button[index=0]");
                if (!eleObj.hasClass("hide"))
                {
                    if (eleObj.hasClass("selected"))
                    {
                        _this.clearOldStatusInfo(0);
                    }
                }


                //切换一张图功能显示面板
                
                var name = $(e.currentTarget).attr("name");
                var labelSelector = '.rightpanel-content .result-list-group-button .button[index=1] span:last-child';
                var oldTitle = $(labelSelector)[0].innerText;
                $(labelSelector)[0].innerText = name;
                $(e.currentTarget).removeClass("show");
                var oldSelector = ".rightpanel-content .result-list-group-button .button[name='" + oldTitle + "']";
                $(oldSelector).addClass("show");
                var content = _this._getItemByName(name);
                //先将旧的功能高亮去掉以及保存对应的状态信息，以便下次切换回功能面板时恢复
                var oldContent = _this._getItemByName(oldTitle);
                if (oldContent.context.hideMarks)
                {
                    oldContent.context.hideMarks.call(oldContent.context);
                }

                //填充新的功能内容
                _this.load(content.context, name, 1);
                //遍历数组，把当前的一张图功能数据保存在数组的最后，以便于删除标签时可以及时恢复最近打开的标签功能
                var currentItem = null;
                for (var i = 0; i < _this._items.length; i++)
                {
                    if (_this._items[i]["title"] == name && i != _this._items.length-1)
                    {
                        currentItem = _this._items[i];
                        _this._items.splice(i, 1);
                        break;
                    }
                }
                if(currentItem != null)
                    _this._items.push(currentItem);
                
            });
        },

        /**
        *获取容器，index值0或1，index为空时默认添加到index=0的容器中
        *@method getBody
        *@param index{Number} 索引
        */
        getBody: function (index) {
            if (index == null)
                index = 0;
            var slector = '.result-list-group[index=' + index + ']';
            return $(slector)[0];
        },

        /**
        *获取当前显示的项
        *@method getCurrentItems
        *@return {Array} 返回当前项的对象数组
        */
        getCurrentItems: function () {
            var labelSelector0 = $('.rightpanel-content .result-list-group-button .button[index=0] span:last-child')[0].innerText;
            var labelSelector1 = $('.rightpanel-content .result-list-group-button .button[index=1] span:last-child')[0].innerText;
            var item1 = this._getItemByName(labelSelector0);
            var item2 = this._getItemByName(labelSelector1);
            return [item1, item2];
        },
        /**
        *加载内容到容器中显示
        *@method load
        *@param content{Object} 上下文
        *@param title{String} 标题
        *@param selected{Boolean}选中状态
        *@param index{Number} 索引
        */
        load: function (content, title, index) {
            var param = {
                context: content,
                title: title,
                selected: true,
                index: index
            }
            this._showItem(param);
            this._add(param);

            if (content.showMarks)
            {
                content.showMarks.call(content);
            }
        },

        /**
        *加载内容到容器中显示
        *@method loadByOption
        *@param content{Object} 上下文
        *@param title{String} 标题
        *@param selected{Boolean}选中状态
        *@param index{Number} 索引
        */
        loadByOption: function (options) {
            var index = options.index;
            if (index === 0)
            {
                //判断原来的tab是否已经存在，如已存在则删除模块的所有信息
                var length = this._items.length;
                var name = '';
                var isSame = false;
                for(var i = 0; i < length; i++)
                {
                    if(this._items[i].index == 0)
                    {
                        if (this._items[i].title == options.title)
                            isSame = true;
                        else
                        {
                            name = this._items[i].title;
                            this._items.splice(i, 1);
                        }
                        break;
                    }     
                }

                switch (name)
                {
                    case '属性查询':
                        var _map = L.DCI.App.pool.get("map");
                        _map.activate(L.DCI.Map.StatusType.SELECT, null, null, this);
                        break;
                    case '全生命周期':
                        if (isSame != true)
                        {
                            L.DCI.App.pool.get("wholelifecycle").deleteLayer();
                            L.dci.app.pool.remove("wholelifecycle");
                        }
                        break;
                    case '快速查询':
                        break;
                    default:
                        break;
                }
            }
            this._showItem(options);
            this._add(options);
            
        },

        /**
        *根据标题名加载内容到容器中显示
        *@method loadByName
        *@param title{String} 标题
        */
        loadByName: function (title) {
            this._clearLayer();
            for (var i = 0; i < this._items.length; i++) {
                if (this._items[i]["title"] == title) {
                    this.loadByOption(this._items[i]);
                    if (this._items[i].context.showMarks) this._items[i].context.showMarks();
                    break;
                }
            }
        },

        /**
        *添加项到数组中
        *@method _add
        *@param context{Object} 上下文
        *@param title{String} 标题
        *@param selected{Boolean}选中状态
        *@param index{Number} 索引
        *@private
        */
        _add: function (options) {
            var isHas = false;
            for (var i = 0; i < this._items.length; i++) {
                if (this._items[i]["title"] == options.title) {
                    this._items[i]["context"] = options.context
                    isHas = true;
                    break;
                }
            }
            if (isHas == false) {
                this._items.push(options);
            }
        },
        /**
        *加载内容到容器中显示
        *@method _showItem
        *@param context{Object} 上下文
        *@param title{String} 标题
        *@param selected{Boolean}选中状态
        *@param index{Number} 索引
        *@private
        */
        _showItem: function (options) {
            this._setItemStatus(options.index,false);
            this._clearLayer();
            var index = options.index;
            var content = options.context;
            options.selected = true;
            if (typeof (options.context) == "object")
                content = options.context.getBody();
            var title = options.title;

            if (index != null) {
                this._hideDetails();
                var containerSelector = '.result-list-group[index=' + index + ']';
                var buttonSelector = '.rightpanel-content .result-list-group-button .button[index=' + index + ']';
                var oppButtonSelector = '.rightpanel-content .result-list-group-button .button[index!=' + index + ']';
                var labelSelector = '.rightpanel-content .result-list-group-button .button[index=' + index + '] span:last-child';
                var container = $(containerSelector)[0];
                var label = $(labelSelector);
                var button = $(buttonSelector);
                $(oppButtonSelector).removeClass('selected');

                $(button).removeClass('hide');
                $(button).addClass('selected');
                if (index == 0)
                    $(button).animate({ height: '133px' }, "normal");
                else
                    $(button).css("height", "133px");
                $(label).html(title);
                $(container).children().detach();
                if (typeof (content) == 'string') {
                    $(container).html(content);
                } else if (typeof (content) == 'object') {
                    container.appendChild(content);
                }
                $(".result-list-group").addClass('hide');
                $(containerSelector).removeClass('hide');
                L.dci.app.pool.get("layerTab").selectTabByName(options.title);
                this.show();

                var map = L.DCI.App.pool.get("map").map;
                this.topLayer = options.title;
                map.eachLayer(function (layer) {
                    if (layer.options != null) {
                        if (layer.options.name != null) {
                            var ele = $(".result-list-group-button").find("div[data-type='onemap']");
                            for (var i = 0; i < ele.length; i++) {
                                var btnText = $(ele[i]).attr("name");
                                if (layer.options.name == btnText) {
                                    this._changeLayerId(layer, 2);
                                }
                            }
                            if (layer.options.name == this.topLayer) {
                                this._changeLayerId(layer, 3);
                            }
                        }
                    }
                }, this);               

            }
        },

        _changeLayerId:function(layer,index){
            if (layer._currentImage) {
                layer._currentImage._image.style.zIndex = index;
            } else if (layer._container) {
                layer._container.style.zIndex = index;
            }                 
        },

        /**
        *隐藏right模版
        *@method hide
        */
        hide: function () {
            $(".result-list-group-button .button span").attr("data-info", "1");
            this.dom.animate({ right: '-400px' }, "fast");
        },

        /**
        *显示right模版
        *@method show
        */
        show: function () {
            $(".result-list-group-button .button span").attr("data-info", "0");
            this.dom.animate({ right: '0px' }, "fast");
        },

        /**
        *清除指定容器中的内容并隐藏左侧对应标签
        *@method clear
        *@param title{Number} 标题
        */
        clear: function (title) {
            var item = this._getItemByName(title);
            if (item == null) {
                this._clearLayer();
                return;
            }
            if (item.index == 0) {
                var newItems = [];
                for (var i = 0; i < this._items.length; i++) {
                    if (this._items[i].index != 0) {
                        newItems.push(this._items[i]);
                    }
                }
                this._items = [];
                this._items = newItems;
            } else {
                for (var i = 0; i < this._items.length; i++) {
                    if (this._items[i].title == title) {
                        this._items.splice(i, 1);
                        break;
                    }
                }
            }
            if (this._items.length == 0) {
                this._clearLayer();
                this._closeItemByTitle(item);
                this.hide();
                return;
            }

            this._closeItemByTitle(item);
            var _hasItems = [], _theShowItem;
            for (var i = 0; i < this._items.length; i++) {
                if (this._items[i].index == item.index) {
                    _hasItems.push(this._items[i]);
                }
            }
            if (_hasItems.length != 0) {
                _theShowItem = _hasItems[_hasItems.length - 1];
                for (var i = 0; i < _hasItems.length; i++) {
                    if (_hasItems[i].selected == true) _theShowItem = _hasItems[i];
                }
            } else {
                _theShowItem = this._items[this._items.length - 1];
                for (var i = 0; i < this._items.length; i++) {
                    if (this._items[i].selected == true) _theShowItem = this._items[i];
                }
            }
            if (_theShowItem != null) {
                this._showItem(_theShowItem);
                if (_theShowItem.context.showMarks) _theShowItem.context.showMarks();
            }
        },

        /**
        *详情展示栏
        *@method details
        */
        details: function () {
            var html = '<div class="rightpanel-details" id="rightpanel-details">'
                            + '<div class="rightpanel-details-info"></div>'
                      + '</div>';
            var bodyObj = $("#rightpanel");
            bodyObj.append(html);
        },

        /**
        *关闭详细信息栏
        *@method _hideDetails
        *@private
        */
        _hideDetails: function () {
            $(".rightpanel-details").hide();
        },
        /**
        *左侧标签点击事件，切换显示内容与标签样式
        *@method _buttonClick
        *@private
        */
        _buttonClick: function (e) {
            this._clearLayer();
            var index = $(e.currentTarget).attr('index');
            var num = $(e.target).attr('data-info');
            var isCurrent = $(e.currentTarget).hasClass('selected');
            var text = $(e.currentTarget).text();
            if (isCurrent) {
                if (num == 0) {
                    this.hide();
                } else {
                    this.show();
                }
            } else
            {
                var indexTab;
                if (index == "0")
                    indexTab = 1;
                else
                    indexTab = 0;
                //清除旧tab的状态信息
                this.clearOldStatusInfo(indexTab);

                var item = this._getItemByName(text);
                this._setItemStatus(item.index,false);
                item.selected = true;
                //if (item.context.reActive) item.context.reActive();
                //if (item.context.showMarks) item.context.showMarks();
                this._showItemByIndex(index);
                L.dci.app.pool.get("layerTab").selectTabByName(text);
                this.show();
                //恢复当前查看的tab状态信息
                this.refleshCurrentStatusInfo(index);
            }
        },

        /**
        *显示指定索引的项
        *@method _showItemByIndex
        *@param index{Number} 索引
        *@private
        */
        _showItemByIndex: function (index) {
            this._hideDetails();
            var containerSelector = '.result-list-group[index!=' + index + ']';
            var buttonSelector = '.rightpanel-content .result-list-group-button .button[index=' + index + ']';
            var oppButtonSelector = '.rightpanel-content .result-list-group-button .button[index!=' + index + ']';

            $(oppButtonSelector).removeClass('selected');
            $(buttonSelector).addClass('selected');
            $(buttonSelector).animate({ height: '133px' }, "normal");

            if (!$(containerSelector).hasClass('hide'))
                $(containerSelector).addClass('hide');

            containerSelector = '.result-list-group[index=' + index + ']';

            if ($(containerSelector).hasClass('hide'))
                $(containerSelector).removeClass('hide');
        },

        /**
        *关闭指定项
        *@method _closeItemByTitle
        *@param item{Object} 项
        *@private
        */
        _closeItemByTitle: function (item) {
            if (item != null) {
                this._hideDetails();
                var containerSelector = '.result-list-group[index=' + item.index + ']';
                var buttonSelector = '.rightpanel-content .result-list-group-button .button[index=' + item.index + ']';
                var labelSelector = '.rightpanel-content .result-list-group-button .button[index=' + item.index + '] span';
                var container = $(containerSelector);
                var label = $(labelSelector);
                $(container).children().detach();
                $(label).html('');
                $(buttonSelector).removeClass("selected");
                if (item.index == 0) {
                    var buttonSelector2 = '.rightpanel-content .result-list-group-button .button[index=1]';
                    $(buttonSelector2).addClass("selected");
                    $(buttonSelector).animate({ height: '0px' }, "normal", function() {
                        $(buttonSelector).addClass('hide');
                    });
                    var mapGroup = L.DCI.App.pool.get("MultiMap");
                    var _map = mapGroup.getActiveMap();
                    _map.deactivate();
                    mapGroup._readdclickEvent(_map);
                } else {
                    $(buttonSelector).addClass('hide');
                }
                if (item.context.deleteLayer) item.context.deleteLayer();
            }
        },

        /**
        *根据名称获取项
        *@method _getItemByName
        *@param name{String} 标题
        *@return {Object} 指定项
        *@private
        */
        _getItemByName: function (name) {
            for (var i = 0; i < this._items.length; i++) {
                if (this._items[i]["title"] == name)
                    return this._items[i];
            }
            return null;
        },

        /**
        *清空地图
        *@method _clearLayer
        *@private
        */
        _clearLayer: function () {
            var mapGroup = L.DCI.App.pool.get("MultiMap");
            var _map = mapGroup.getActiveMap();
            _map.getHighLightLayer().clearLayers();
        },

        _setItemStatus: function(index,status) {
            for (var i = 0; i < this._items.length; i++) {
                if(index==this._items[i].index)
                    this._items[i]["selected"] = status;
            }
        },

        /**
        *显示一张图功能展示面板的状态
        *@method showOneMapFunctionStatus
        *@private
        */
        showOneMapFunctionStatus: function (featurename) {
            var featureName = L.dci.app.pool.get('leftPanel')._subjectFeatureName;
            var ele = $(".result-list-group-button").find("div[data-type='onemap']");
            
            var addweth = true;
            for (var j = 0; j < ele.length; j++)
            {
                $(ele[j]).removeClass("show")
                if ($(ele[j])[0].getAttribute("name") == featurename || featurename == null) {
                    addweth = false;
                }
            }
            if (addweth) {
                var rightTab = '<div class="button rightpanel-conten-default" name="' + featurename + '" data-type="onemap">'
                        + '<label index="1" class="summ" title = "' + featurename + '">' + featurename.substring(0, 1) + '</label></div>'
                $(".result-list-group-button").append(rightTab);
            }
            var ele = $(".result-list-group-button").find("div[data-type='onemap']");
            var currentFeatureName = featureName[featureName.length - 1];
            for (var i = 0; i < ele.length; i++)
            {
                var btnText = $(ele[i]).attr("name");
                for (var j = 0; j < featureName.length; j++)
                {
                    if (featureName[j] == btnText && btnText == currentFeatureName) {
                        $(ele[i]).removeClass("show")
                        //initHtml = '<h1>' + featurename + '</h1>'
                        //var ele2 = $(".rightonemep").html(initHtml);
                    }                      

                    if (featureName[j] == btnText && btnText != currentFeatureName)
                        $(ele[i]).addClass("show")
                }
            }
            
        },

        /**
        *清除旧标签页的状态信息
        *@method clearOldStatusInfo
        *@param index{String} 
        *@private
        */
        clearOldStatusInfo: function (index) {
            var ele = $(".result-list-group-button  .button[index='" + index + "']");
            var name = $(ele).children("span").last().html();
            switch (name)
            {
                case '属性查询':
                    var _map = L.DCI.App.pool.get("map");
                    _map.activate(L.DCI.Map.StatusType.SELECT, null, null, this);
                    break;
                case '全生命周期':
                    if (L.dci.app.pool.get("wholelifecycle"))
                    {
                        if (L.dci.app.pool.get("wholelifecycle").hideMarks())
                            L.dci.app.pool.get("wholelifecycle").hideMarks();
                    }
                    break;
                case '项目一张图':
                    L.dci.app.pool.get("business-projectmap").hideMarks();
                    break;
                case '时限一张图':
                    L.dci.app.pool.get("business-sxonemap").hideMarks();
                    break;
                case '编制一张图':
                    L.dci.app.pool.get("business-compilemap").hideMarks();
                    break;
                case '批后一张图':
                    L.dci.app.pool.get("business-approvedmap").hideMarks();
                    break;
                default:
                    break;
            }
        },

        /**
        *恢复当前查看标签页的状态信息
        *@method refleshCurrentStatusInfo
        *@param index{String} 
        *@private
        */
        refleshCurrentStatusInfo: function (index) {
            var ele = $(".result-list-group-button  .button[index='" + index + "']");
            var name = $(ele).children("span").last().html();
            switch (name)
            {
                case '属性查询':
                    var tool = L.DCI.App.pool.get("Tool").identify();
                    break;
                case '全生命周期':
                    L.dci.app.pool.get("wholelifecycle").showMarks();
                    break;
                case '全生命周期':
                    L.dci.app.pool.get("wholelifecycle").showMarks();
                    break;
                case '项目一张图':
                    L.dci.app.pool.get("business-projectmap").showMarks();
                    break;
                case '时限一张图':
                    L.dci.app.pool.get("business-sxonemap").showMarks();
                    break;
                case '编制一张图':
                    L.dci.app.pool.get("business-compilemap").showMarks();
                    break;
                case '批后一张图':
                    L.dci.app.pool.get("business-approvedmap").showMarks();
                    break;
                default:
                    break;
            }
        },

    });

    return L.DCI.RightPanel;
});