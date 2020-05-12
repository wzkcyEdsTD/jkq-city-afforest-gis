/**
*标绘功能类
*   （弹出框模板html、标注名 _titlename、标注名详情 _labeldetails
*     引用类库：leaflet,如需更改GIS类库，需替换_function中_setposition。本类所有对DOM的操作均需要juqery的支撑，在引用前先引用Jquery
*     analysis/colorpick,颜色选择器插件，便于对颜色进行选择
*     leaflet/polylineDecorator,leaflet绘制虚线插件）
*@module modules.common
*@class DCI.plotting
*@constructor initialize
*/
define("common/plotting", [
    "leaflet",
    "core/dcins",
    "analysis/colorpick",
    "leaflet/polylineDecorator"
], function (L) {
    L.DCI.plotting = L.Class.extend({

        /**
        *弹出框模板HTML
        *@property _html
        *@type {String}
        *@private
        */
        _html: //'<div class="label-popup-contains">'                                                        //弹出框容器
             '<div class="label-popup-titles"><p class="label-popup-titles-name"></p>'
            + '<span class="label-popup-close-button icon-close2"></span>'
            + '</div>'       //弹出框标题
            + '<div class="label-popup-content">'           //弹出框内容

            + '</div>'
            + '</div>'
            + '<div class="arrow1"></div>',
        //+ '</div>',

        /**
        *编辑样式模板HTML
        *@property _edit_html
        *@type {String}
        *@private
        */
        _edit_html: '<div class="label-popup-content-edit">'
            + '<div class="label-name-content"><span>名称</span><input id="bz-name" type="text" style="width: 330px;height: 32px;" value="标题长度不能多于15个字"></div>'
            + '<div class="label-name-content" style="margin-top: 10px;">'
            + '<span style="float: left;">备注</span><textarea id="bz-beizhu" style="width: 330px;height: 90px;">备注长度不能多于100个字</textarea></div>'
            + '<div class="bz-name-command" style="margin-top: 10px;">'                                    //弹出框按钮区
            + '<button class="plotting-button" id="change-style">更换样式</button>'
            + '<button class="plotting-button" id="restore-popup">保存</button>'
            + '<button class="plotting-button" id="delete-popup">删除</button>'
            + '</div>',

        /**
        *更改点样式模板HTML
        *@property _point_html
        *@type {String}
        *@private
        */
        _point_html: '<div class="label-point-image">'
            + '<div class="pind_img" id="imgList"><div class="pubpind" id="point_86223_point0" style="background-position: -5px -5px;"></div>'
            + '<div class="pubpind" id="point_86223_point1" style="background-position: -54px -5px;"></div>'
            + '<div class="pubpind" id="point_86223_point2" style="background-position: -103px -5px;"></div>'
            + '<div class="pubpind" id="point_86223_point3" style="background-position: -152px -5px;"></div>'
            + '<div class="pubpind" id="point_86223_point4" style="background-position: -202px -5px;"></div>'
            + '<div class="pubpind" id="point_86223_point5" style="background-position: -251px -5px;"></div>'
            + '<div class="pubpind" id="point_86223_point6" style="background-position: -300px -5px;"></div>'
            + '<div class="pubpind" id="point_86223_point7" style="background-position: -5px -40px;"></div>'
            + '<div class="pubpind" id="point_86223_point8" style="background-position: -54px -40px;"></div>'
            + '<div class="pubpind" id="point_86223_point9" style="background-position: -103px -40px;"></div>'
            + '<div class="pubpind" id="point_86223_point10" style="background-position: -152px -40px;"></div>'
            + '<div class="pubpind" id="point_86223_point11" style="background-position: -202px -40px;"></div>'
            + '<div class="pubpind" id="point_86223_point12" style="background-position: -251px -40px;"></div>'
            + '<div class="pubpind" id="point_86223_point13" style="background-position: -300px -40px;"></div>'
            + '<div class="pubpind" id="point_86223_point14" style="background-position: -5px -75px;"></div>'
            + '<div class="pubpind" id="point_86223_point15" style="background-position: -54px -75px;"></div>'
            + '<div class="pubpind" id="point_86223_point16" style="background-position: -103px -75px;"></div>'
            + '<div class="pubpind" id="point_86223_point17" style="background-position: -152px -75px;"></div>'
            + '<div class="pubpind" id="point_86223_point18" style="background-position: -202px -75px;"></div>'
            + '<div class="pubpind" id="point_86223_point19" style="background-position: -251px -75px;"></div>'
            + '<div class="pubpind" id="point_86223_point20" style="background-position: -300px -75px;"></div></div>'
            + '<button class="plotting-button re-back">返回</button>'
            + '</div>',

        /**
        *更改线样式模板HTML
        *@property _line_html
        *@type {String}
        *@private
        */
        _line_html: '<div class="label-line-style">'
            + '<div class="line-style-content"><span>线型</span>'
             + '<div class="line-style-choose"><div class="line-style-result" ><p class="line-style-choose-num">1</p><hr class="line-style-choose-line"/></div><span class="icon-triangle"></span>'
                + '<ul id="cuxi" class="line-style-choose-ul   hide">'
                + '<li class="line-style-list-item op-list-item"><p style="width:15px;float: left;">1</p><hr  style="border-top: 2px solid #000;margin-top: 5px; margin-bottom: 5px; width:250px;"/></li>'
                + '<li class="line-style-list-item op-list-item"><p style="width:15px;float: left;">2</p><hr  style="border-top: 2px dashed #000;margin-top: 5px; margin-bottom: 5px; width:250px;"/></li>'
                + '</ul>'
                + '</div>'

            + '</div>'
             + '<div class="line-width-content"><span>线宽</span>'
                + '<div class="line-width-choose"><div class="line-style-result" ><p class="line-style-choose-num">1</p><hr class="line-style-choose-line"/></div><span class="icon-triangle"></span>'
                + '<ul id="cuxi" class="line-style-choose-ul  hide">'
                + '<li class="line-style-list-item op-list-item"><p style="width:15px;float: left;">1</p><hr  style="border-top: 2px solid #000;margin-top: 5px; margin-bottom: 5px; width:250px;"/></li>'
                + '<li class="line-style-list-item op-list-item"><p style="width:15px;float: left;">2</p><hr  style="border-top: 4px solid #000;margin-top: 5px; margin-bottom: 5px; width:250px;"/></li>'
                + '<li class="line-style-list-item op-list-item"><p style="width:15px;float: left;">3</p><hr  style="border-top: 6px solid #000;margin-top: 5px; margin-bottom: 5px; width:250px;"/></li>'
                + '<li class="line-style-list-item op-list-item"><p style="width:15px;float: left;">4</p><hr  style="border-top: 8px solid #000;margin-top: 5px; margin-bottom: 5px; width:250px;"/></li>'
                + '</ul>'
                + '</div>'
             + '</div>'
             + '<div class="line-color-opacity-content">'
             + '<span>线型颜色</span>'
              + '<div  class="_custom input_cxcolor" readonly value="#000000" ><div style="background-color:#ffffff;width=50px;height:28px" ><span class="icon-Paint-bucket">'
                + '</span><span class="icon-triangle"><span></div></div>'
             + '<span style="margin-left:10px">透明度</span>'
             + '<input style="margin-left:5px; width:40px;margin-top:5px" type="text">'
             + '<span style="margin-right:165px;float:right">%</span>'
             + '</div>'
             + '<div class="line-result-style">'
             + '<span>边框效果</span>'
             + '<div><hr style="border-top: 2px solid #000;margin-top: 13px; margin-left: 5px; width:260px;"/></div>'
             + '</div>'
             + '<button class="plotting-button line-style-command">确定</button>'
             + '<button class="plotting-button line-style-cancel">取消</button>'
            + '</div>',

        /**
        *更改面样式模板HTML
        *@property _polygon_html
        *@type {String}
        *@private
        */
        _polygon_html: '<div class="label-line-style">'
            + '<div class="line-style-content"><span>线型</span>'
             + '<div class="line-style-choose"><div class="line-style-result" ><p class="line-style-choose-num">1</p><hr class="line-style-choose-line"/></div><span class="icon-triangle"></span>'
                + '<ul id="cuxi" class="line-style-choose-ul line-style-choose-li  hide">'
                + '<li class="line-style-list-item op-list-item"><p style="width:15px;float: left;">1</p><hr  style="border-top: 2px solid #000;margin-top: 5px; margin-bottom: 5px; width:250px;"/></li>'
                + '<li class="line-style-list-item op-list-item"><p style="width:15px;float: left;">2</p><hr  style="border-top: 2px dashed #000;margin-top: 5px; margin-bottom: 5px; width:250px;"/></li>'
                + '</ul>'
                + '</div>'

            + '</div>'
             + '<div class="line-width-content"><span>线宽</span>'
                + '<div class="line-width-choose"><div class="line-style-result" ><p class="line-style-choose-num">1</p><hr class="line-style-choose-line"/></div><span class="icon-triangle"></span>'
                + '<ul id="cuxi" class="line-style-choose-ul  hide">'
                + '<li class="line-style-list-item op-list-item"><p style="width:15px;float: left;">1</p><hr  style="border-top: 2px solid #000;margin-top: 5px; margin-bottom: 5px; width:250px;"/></li>'
                + '<li class="line-style-list-item op-list-item"><p style="width:15px;float: left;">2</p><hr  style="border-top: 4px solid #000;margin-top: 5px; margin-bottom: 5px; width:250px;"/></li>'
                + '<li class="line-style-list-item op-list-item"><p style="width:15px;float: left;">3</p><hr  style="border-top: 6px solid #000;margin-top: 5px; margin-bottom: 5px; width:250px;"/></li>'
                + '<li class="line-style-list-item op-list-item"><p style="width:15px;float: left;">4</p><hr  style="border-top: 8px solid #000;margin-top: 5px; margin-bottom: 5px; width:250px;"/></li>'
                + '</ul>'
                + '</div>'
             + '</div>'
             + '<div class="fill-color-opacity-content">'
             + '<span>填充颜色</span>'
              + '<div class="_custom input_cxcolor" readonly value="#000000" ><div style="background-color:#ffffff;width=50px;height:28px" ><span class="icon-Paint-bucket">'
                + '</span><span class="icon-triangle"><span></div></div>'
             + '<span style="margin-left:10px">透明度</span>'
             + '<input style="margin-left:5px;float:left; width:40px;margin-top: 5px;" type="text">'
             + '<span style="margin-left: 5px;">%</span>'
             + '<span style="margin-left: 10px;">填充效果</span>'
             + '<div class="fill-result-style-div"></div>'
             + '</div>'
              + '<div class="line-color-opacity-content">'
             + '<span>线型颜色</span>'
              + '<div class="_custom input_cxcolor" readonly value="#000000" ><div style="background-color:#ffffff;width=50px;height:28px" ><span class="icon-Paint-bucket">'
                + '</span><span class="icon-triangle"><span></div></div>'
             + '<span style="margin-left:10px">透明度</span>'
             + '<input style="margin-left:5px; width:40px;  margin-top: 5px;" type="text">'
             + '<span style="margin-right:165px;float:right">%</span>'
             + '</div>'
             + '<div class="line-result-style">'
             + '<span>边框效果</span>'
             + '<div><hr style="border-top: 2px solid #000;margin-top: 13px; margin-left: 5px; width:260px;"/></div>'
             + '</div>'
             + '<button class="plotting-button line-style-command">确定</button>'
             + '<button class="plotting-button line-style-cancel">取消</button>'
            + '</div>',

        /**
        *弹出框标注名
        *@property _titlename
        *@type {Object}
        *@private
        */
        _titlename: null,

        /**
        *标绘类别别名
        *@property _drawalias
        *@type {Object}
        *@private
        */
        _drawalias: {
            point: '点标绘',
            polyline: '线标绘',
            polygon: '多边形标绘',
            rectangle: '矩形标绘',
            circle: '圆标绘',
        },

        /**
        *线样式
        *@property _polystyle
        *@type {Object}
        *@private
        */
        _polystyle: {
            linestyle: 'solid',
            linewidth: 3,
            linecolor: '#ff5f00',
            lineopacity: 0.5,
            fillcolor: '#ff5f00',
            fillopacity: '0.2',
        },

        /**
        *标注名详情
        *@property _labeldetails
        *@type {Object}
        *@private
        */
        _labeldetails: null,

        /**
        *位置信息
        *@property _point
        *@type {Object}
        *@private
        */
        _point: null,

        /**
        *图片地址
        *@property _imgurl
        *@type {String}
        *@private
        */
        _imgurl: Project_ParamConfig.defaultUserImages + '/themes/default/images/point/',

        /**
        *外部类库方法
        *@property _function
        *@type {Object}
        *@private
        */
        _function: {
            _setposition: L.DomUtil.setPosition,      //定位标注位置      
            _create: L.DomUtil.create,                 //leaflet创建要素
            _disableclickpropagation: L.DomEvent.disableClickPropagation            //弹出框清除地图事件
        },

        /**
        *传入geometry模板
        *@property _geometry
        *@type {Object}
        *@private
        */
        _geometry: {
            style: null,
            ring: null,
        },

        /**
        *初始化
        *@method initialize
        *param geometry{Object} geometry数据
        *param map{Object} 地图对象
        *param lay{Object} 图层
        */
        initialize: function (geometry, map, lay) {
            if (geometry && map && lay) {
                this._map = map;
                this._geometry = geometry;
                this._lay_a = lay;
                if (lay.options.dashArray == "") { lay.options.dashArray = "solid" };
                this._polystyle = {
                    linestyle: lay.options.dashArray,
                    linewidth: lay.options.weight,
                    linecolor: lay.options.color,
                    lineopacity: lay.options.opacity,
                    fillcolor: lay.options.fillColor,
                    fillopacity: lay.options.fillOpacity,
                };
                if ($('.label-popup-contains').length == 0) {
                    this.LoadModel(geometry, this._map, lay);
                }
                else {
                    this._judgeClick(geometry, this._map, lay);
                }
            }
        },

        /**
        *加载标注弹出框模板
        *@method LoadModel
        *param geometry{Object} geometry数据
        *param map{Object} 地图对象
        *param lay{Object} 图层
        */
        LoadModel: function (geometry, map, lay) {
            var _pane = map.getPanes().popupPane;
            var _style = geometry.style;
            var _this = this;
            this._el = this._function._create('div', 'label-popup-contains', _pane);                 //标绘弹出框容器
            this._function._disableclickpropagation(this._el);
            $(this._el).append(this._html);            
            if (lay.options.mypopup.statu == 0) {
                $(this._el).children().eq(1).append(_this._edit_html);
                this._removetoolelert();
                this._reshowedit(lay);
                if (_style == "point") {
                    var _pos = map.latLngToLayerPoint(geometry.ring);
                    var content = $('.label-popup-content');
                    this._function._setposition(this._el, _pos);
                    if ($(lay.options.mypopup._tooltip).length != 0) {
                        $(lay.options.mypopup._tooltip).css('display', 'none');
                    }
                    this._mappopup();
                    //$('#bz-name').focus();
                    map.panTo(geometry.ring);
                    $('.label-popup-titles-name').text(this._drawalias.point);
                    $('#change-style').on('click', { _content: content, obj: this, _lay: lay }, this.getPointStyle);    //注册更改样式事件
                }
                else if (_style == "polyline") {
                    $('.label-popup-titles-name').text(this._drawalias.polyline);
                    var _pos = map.latLngToLayerPoint(geometry.ring);
                    var content = $('.label-popup-content');
                    this._function._setposition(this._el, _pos);
                    this._mappopup();
                    $(this._el).css({ 'margin-left': '-70px', 'margin-top': '-272px' });
                    map.panTo(geometry.ring);
                    //$('#bz-name').focus();
                    $('#change-style').on('click', { _content: content, obj: this, _lay: lay }, this.getPolylineStyle);    //注册更改样式事件
                }
                else if (_style == "polygon" || _style == "rectangle" || _style == "circle") {
                    if (_style == "polygon")
                        $('.label-popup-titles-name').text(this._drawalias.polygon);
                    else if (_style == "rectangle")
                        $('.label-popup-titles-name').text(this._drawalias.rectangle);
                    else if (_style == "circle")
                        $('.label-popup-titles-name').text(this._drawalias.circle);
                    var _pos = map.latLngToLayerPoint(geometry.ring);
                    var content = $('.label-popup-content');
                    this._function._setposition(this._el, _pos);
                    this._mappopup();
                    $(this._el).css({ 'margin-left': '-70px', 'margin-top': '-272px' });
                    map.panTo(geometry.ring);
                    $('#change-style').on('click', { _content: content, obj: this, _lay: lay }, this.getPolylineStyle);    //注册更改样式事件
                }
            }
            else {
                var _pos = map.latLngToLayerPoint(geometry.ring);
                var content = $('.label-popup-content');
                this._function._setposition(this._el, _pos);
                this._mappopup();
                this._updateContent(lay, this._el, this);
            }
            $('#restore-popup').on('click', { _content: this._el, obj: this, _lay: lay }, this._RetoreDraw);    //注册保存编辑事件
            $('#delete-popup').on('click', { _content: this._el, _lay: lay, obj: this, }, this._deleteDraw);
            $('.label-popup-close-button').on('click', { _content: this._el, obj: this, _lay: lay }, this._closePopup);                 //注册关闭按钮
        },

        /**
        *重新加载编辑框
        *@method _reshowedit
        *param _lay{Object} 图层
        */
        _reshowedit: function (_lay) {
            if (_lay.options.mypopup._titles != "") {
                $('#bz-name').val(_lay.options.mypopup._titles);
                $('#bz-name').css('color', '#000');
            }
            if (_lay.options.mypopup._content != "") {
                $('#bz-beizhu').val(_lay.options.mypopup._content);
                $('#bz-beizhu').css('color', '#000');
            }
        },

        /**
        *提示输入字符长度过长DIV清除
        *@method _removetoolelert
        */
        _removetoolelert: function () {
            $('#bz-name').bind('click', function () {
                if ($(".bz-name-toolalert").length != 0) {
                    $(".bz-name-toolalert").remove();
                }
            });
            $('#bz-name').bind('focus', function () {
                if (this.value == '标题长度不能多于15个字') { this.value = ''; } this.style.color = '#000';
            });

            $('#bz-name').bind('blur', function () {
                if (this.value == '') { this.value = '标题长度不能多于15个字'; this.style.color = '#ccc'; };
            });

            $('#bz-beizhu').bind('focus', function () {
                if (this.value == '备注长度不能多于100个字') { this.value = ''; } this.style.color = '#000';
            });

            $('#bz-beizhu').bind('blur', function () {
                if (this.value == '') { this.value = '备注长度不能多于100个字'; this.style.color = '#ccc'; };
            });
            $('#bz-beizhu').bind('click', function () {
                if ($(".bz-name-toolalert").length != 0) {
                    $(".bz-name-toolalert").remove();
                }
            });
         
        },

        /**
        *弹出框位移
        *@method _mappopup
        */
        _mappopup: function () {
            this._map.on('viewreset', this.viewresetfun, this);
            if (L.Browser.any3d && this._map.options.zoomAnimation) {
                this._map.on('zoomanim', this._zoomanimupdata, this);
            }
        },

        /**
        *viewreset响应函数
        *@method viewresetfun
        */
        viewresetfun: function (e) {
            if (e && e.hard) {
                var _pos = this._map.latLngToLayerPoint(this._geometry.ring).round();
                this._function._setposition(this._el, _pos);
                if ($(this._lay_a.options.mypopup._tooltip).length != 0) {
                    this._function._setposition(this._lay_a.options.mypopup._tooltip, _pos);
                }
            }
        },

        /**
        *关闭弹出框
        *@method _closePopup
        *@param o{Object} 数据集对象
        */
        _closePopup: function (o) {
            var _lay = o.data._lay;
            var _content = o.data._content;
            var _this = o.data.obj;
            $(_content).remove();
            if ($(_lay.options.mypopup._tooltip).length != 0 &&_lay.options.mypopup.statu==1) {
                $(_lay.options.mypopup._tooltip).css('display', 'block');
            }
        },

        /**
        *删除标绘内容
        *@method _deleteDraw
        *@param o{Object} 数据集对象
        */
        _deleteDraw: function (o) {
            //修复删除单个标绘之后，其他标绘信息无法删除的问题
            var delmap = L.DCI.App.pool.get('MultiMap').getActiveMap();            
            var lid = o.data._lay._leaflet_id;
            delmap._drawTool.clearLayer(lid);
            //end
            var _lay = o.data._lay;
            var _this = o.data.obj;
            var _content = o.data._content;
            $(_content).remove();
            $(_lay.options.mypopup._tooltip).remove();
            _lay.onRemove(_this._map);
            if (_lay.options.mypopup.dashline) {
                _lay.options.mypopup.dashline.onRemove(_this._map);
                _lay.options.mypopup.dashline = null;
            }
            _this._map.off('viewreset', _this.viewresetfun, this);
            _this._map.off('zoomanim', _this._zoomanimupdata, this);
        },

        /**
        *清空
        *@method _clear
        *@param map{Object} 地图对象
        */
        _clear:function(map){
            $('.label-popup-contains').remove();
            $('.marker-label-tooltip').remove();
            map.eachLayer(function (layer) {
                if (layer._latlngs && layer.options.mypopup) {
                    if (layer.options.mypopup.dashline) {
                        layer.options.mypopup.dashline.onRemove(map);
                        layer.options.mypopup.dashline = null;
                    }
                }
            });
            //if (_lay.options.mypopup.dashline) {
            //    _lay.options.mypopup.dashline.onRemove(map);
            //    _lay.options.mypopup.dashline = null;
            //}
        },

        /**
        *编辑标绘内容
        *@method _editDraw
        *@param o{Object} 数据集对象
        */
        _editDraw: function (o) {
            var _lay = o.data._lay;
            var _this = o.data.obj;
            var _content = o.data._content;
            $('.label-popup-contains').remove();
            _lay.options.mypopup.statu = 0;
            _this.LoadModel(_this._geometry, _this._map, _lay);
            $('#bz-name').val(_lay.options.mypopup._titles);
            $('#bz-beizhu').val(_lay.options.mypopup._content);
            if ($('#bz-name').val() == "")
                $('#bz-name').val("标题长度不能多于15个字");
            if ($('#bz-beizhu').val() == "")
                $('#bz-beizhu').val("备注长度不能多于100个字");
        },

        /**
        *判断点击区域，是否点击同一个位置
        *@method _judgeClick
        *param geometry{Object} geometry数据
        *param map{Object} 地图对象
        *param lay{Object} 图层
        */
        _judgeClick: function (geometry, _map, lay) {
            var _pos = _map.latLngToLayerPoint(geometry.ring);
            var _matrix = 'matrix(1, 0, 0, 1, ' + _pos.x + ', ' + _pos.y + ')';
            if ($('.label-popup-contains').css('transform') == _matrix) {
                $('.label-popup-contains').remove();
                if ($(lay.options.mypopup._tooltip).length != 0 && lay.options.mypopup.statu == 1) {
                    $(lay.options.mypopup._tooltip).css('display', 'block');
                }
            }
            else {
                $('.label-popup-contains').remove();
                this.LoadModel(geometry, _map, lay);
            }

        },

        /**
        *保存弹出框
        *@method _RetoreDraw
        *@param o{Object} 数据集对象
        */
        _RetoreDraw: function (o) {         
            var _content = o.data._content;
            var _lay = o.data._lay;
            var _this = o.data.obj;
            if ($(".bz-name-toolalert").length != 0) {
                $(".bz-name-toolalert").remove();
            }
            var tahtml = '<div class="bz-name-toolalert"></div>';
            if ($('#bz-name').val().length > 15) {
                $(_content).children().eq(1).append(tahtml);
                $(".bz-name-toolalert").css('display', 'block');
                $(".bz-name-toolalert").html("标题长度不能多于15个字");
            }
            else if ($('#bz-beizhu').val().length > 100) {
                $(_content).children().eq(1).append(tahtml);
                $(".bz-name-toolalert").css({ 'display': 'block','top':'80px'});
                $(".bz-name-toolalert").html("备注长度不能多于100个字");
            }
            else if ($('#bz-name').val() == "标题长度不能多于15个字") {
                $(_content).children().eq(1).append(tahtml);
                $(".bz-name-toolalert").css({ 'display': 'block', 'top': '40px' });
                $(".bz-name-toolalert").html("标题不能为空！");
            }
            else {
                if ($('#bz-name').val() == "标题长度不能多于15个字")
                    $('#bz-name').val("");
                if ($('#bz-beizhu').val() == "备注长度不能多于100个字")
                    $('#bz-beizhu').val("");
                _lay.options.mypopup._titles = $('#bz-name').val();
                _lay.options.mypopup._content = $('#bz-beizhu').val();
                _lay.options.mypopup.statu = 1;
                $(_content).children().eq(1).children().eq(0).css('display', 'none');
                _this._updateContent(_lay, _content, _this);
            }
        },

        /**
        *弹出框样式  statu:{0:编辑状态，1：保存后状态}
        *@method _updateContent
        *@param _lay{Object} 图层
        *@param _content{Object} 元素对象
        *@param _this{Object} 上下文
        */
        _updateContent: function (_lay, _content, _this) {
            var _statu = _lay.options.mypopup.statu;
            if (_statu == 1) {
                var _edit_delete_html = '<span class="label-popup-delete-span icon-clear"></span>'
           + '<span class="label-popup-edit-span icon-plotting"></span>';
                $(_content).children().eq(0).append(_edit_delete_html);
                var _bcontenthtml = '<div style="word-wrap:break-word; word-break:break-all;display:block;width:95%;" class="biaozhu-conent-retire"><p></p></div>';
                // $(_content).children().eq(1).children().eq(0).css('display', 'none');
                $(_content).children().eq(0).children().eq(0).text(_lay.options.mypopup._titles);
                if (_this._geometry.style == 'point') {
                    $(_content).css({ 'height': '130px', 'margin-top': '-185px' });//对应上面
                    _this.loadtooltip(_lay, _this);
                }
                else if (_this._geometry.style == 'polyline')
                    $(_content).css({ 'height': '130px', 'margin-top': '-160px' });
                else if (_this._geometry.style == 'polygon' || _this._geometry.style == 'rectangle' || _this._geometry.style == 'circle')
                    $(_content).css({ 'height': '130px', 'margin-top': '-160px' });
                $(_content).children().eq(2).css('top', '125px');//对应三角
                $(_content).children().eq(1).append(_bcontenthtml);
                // $('.biaozhu-conent-retire').children().eq(0).text(_lay.options.mypopup._content);
                $('.biaozhu-conent-retire').children().eq(0).text(_lay.options.mypopup._content);
                $('.label-popup-delete-span').on('click', { _content: _content, _lay: _lay, obj: _this, }, _this._deleteDraw);
                $('.label-popup-edit-span').on('click', { _content: _content, _lay: _lay, obj: _this, }, _this._editDraw);

            }
            else if (_statu == 0) {

            }
        },

        /**
        *显示弹出框 
        *@method _showpopup
        */
        _showpopup: function () {
            $(this._el).css('display', 'block');
        },

        /**
        *隐藏弹出框 
        *@method _hidepopup
        */
        _hidepopup: function () {
            $(this._el).css('display', 'none');
        },

        /**
        *弹出框位置更新
        *@method _zoomanimupdata
        *@param opt{Object}  配置参数
        */
        _zoomanimupdata: function (opt) {
            var _pos = this._map._latLngToNewLayerPoint(this._geometry.ring, opt.zoom, opt.center).round();
            this._function._setposition(this._el, _pos);
            if ($(this._lay_a.options.mypopup._tooltip).length != 0) {
                this._function._setposition(this._lay_a.options.mypopup._tooltip, _pos);
            }
        },

        /**
        *更换点样式模板，返回选择图片ID（content:标绘内容容器）
        *@method getPointStyle
        *@param o{Object}  数据对象
        */
        getPointStyle: function (o) {
            var _content = o.data._content;
            var _lay = o.data._lay;
            var _this = o.data.obj;
            var _iconurl = _lay.options.icon.options.iconUrl;
            var defaultchoose = _iconurl.slice(_iconurl.length - 10, _iconurl.length - 4).replace(/[^0-9]/ig, "");
            if ($(".bz-name-toolalert").length != 0) {
                $(".bz-name-toolalert").remove();
            }
            //var defaultchoose = _iconurl.replace(/[^0-9]/ig, "");
            _content.children().eq(0).css('display', 'none');
            _content.parent().css({ 'margin-top': '-288px', 'height': '225px' });
            _content.parent().children().eq(2).css('top', '217px');
            _content.append(_this._point_html);
            $("#point_86223_point" + defaultchoose).addClass('pubpind-hover');
            $('.pubpind').on('click', { lay: _lay, _this: _this }, _this.choosePicture);
            $('.re-back').on('click', { content: _content, obj: _this }, _this.rebackEdit);
        },

        /**
        *更换线的样式
        *@method getPolylineStyle
        *@param o{Object}  数据对象
        */
        getPolylineStyle: function (o) {
            var _content = o.data._content;
            var _lay = o.data._lay;
            var _this = o.data.obj;
            if ($(".bz-name-toolalert").length != 0) {
                $(".bz-name-toolalert").remove();
            }
            _content.children().eq(0).css('display', 'none');
            _this.jugepositionpolystyle(_this, _content);
            _this.initializelinestyle(_this);
            $(".line-style-choose").on('click', {}, _this.toggleline);
            $(".line-width-choose").on('click', {}, _this.toggleline);
            $(".line-width-choose .op-list-item").on('click', {}, _this.togglelinewidth);
            $(".line-style-choose .op-list-item").on('click', {}, _this.togglelinestyle);
            $(".line-color-opacity-content ._custom").cxColor();
            $(".line-color-opacity-content ._custom").bind('change', function () {
                $(".line-result-style hr").css("border-top-color", this.value);
            });
            $(".fill-color-opacity-content ._custom").cxColor();
            $(".fill-color-opacity-content ._custom").bind('change', function () {
                $(".fill-result-style-div").css("background-color", this.value);
            });
            $(".line-style-command").on('click', { content: _content, obj: _this ,lay:_lay}, _this.restorelinestyle);
            $(".line-style-cancel").on('click', { content: _content, obj: _this }, _this.rebackEdit);
        },

        /**
        *判断线、多边形、矩形、圆形更改样式弹出框样式
        *@method jugepositionpolystyle
        *@param _this{Object}  上下文
        *@param _content{Object}  元素对象
        */
        jugepositionpolystyle: function (_this, _content) {
            $(".line-style-choose-li").css("height", "60px");
            if (_this._geometry.style == "polyline") {
                _content.parent().css({ 'height': '250px', 'margin-top': '-280px' });
                _content.parent().children().eq(2).css('top', '249px');
                _content.append(_this._line_html);
            }
            else if (_this._geometry.style == 'polygon' || _this._geometry.style == 'rectangle' || _this._geometry.style == 'circle') {
                _content.parent().css({ 'height': '290px', 'margin-top': '-325px' });
                _content.parent().children().eq(2).css('top', '288px');
                _content.append(_this._polygon_html);
                if (_this._geometry.style == 'circle')
                {
                    $(".line-style-choose-li").children().eq(1).css("display", "none");
                    $(".line-style-choose-li").css("height", "30px");
                }
            }
        },

        /**
        *下拉框线样式选择
        *@method togglelinestyle
        */
        togglelinestyle: function (o) {
            var a = $(this).index() * 2 + 2;
            $(".line-width-choose .line-style-choose-num").html($(this).index() + 1);
            if ($(this).index() == '1') {
                $(".line-style-choose .line-style-choose-line").css("border-top-style", "dashed");
                $(".line-result-style hr").css("border-top-style", "dashed");
            }
            else {
                $(".line-style-choose .line-style-choose-line").css("border-top-style", "solid");
                $(".line-result-style hr").css("border-top-style", "solid");
            }
        },

        /**
        *下拉框线宽选择
        *@method togglelinewidth
        */
        togglelinewidth: function (o) {
            var a = $(this).index() * 2 + 2;
            $(".line-width-choose .line-style-choose-num").html($(this).index() + 1);
            $(".line-width-choose .line-style-choose-line").css("border-top-width", a + "px");
            $(".line-result-style hr").css("border-top-width", a + "px");
        },

        /**
        *下拉框事件
        *@method toggleline
        */
        toggleline: function (o) {
            var op_list = this.children[2];
            if (op_list.className.indexOf('hide') > -1) {
                op_list.className = op_list.className.replace(/(^|\s)hide(\s|$)/, '');
            }
            else {
                op_list.className += ' hide';
            }
            op_list.onclick = function (event) {
                if (event.target.className.indexOf('op-list-item') > -1) {
                }
            }
        },

        /**
        *保存样式
        *@method restorelinestyle
        */
        restorelinestyle: function (o) {
            var _content = o.data.content;
            var _this = o.data.obj;
            var _lay = o.data.lay;
            _this._polystyle.linestyle = $(".line-result-style hr").css("border-top-style");
            _this._polystyle.linewidth = parseInt($(".line-result-style hr").css("border-top-width"));
            _this._polystyle.linecolor = $(".line-result-style hr").css("border-top-color");
            _this._polystyle.lineopacity = $(".line-color-opacity-content input").val() / 100;
            _this._polystyle.fillcolor = $(".fill-result-style-div").css("background-color");
            _this._polystyle.fillopacity = $(".fill-color-opacity-content input").val() / 100;
            $(this).parent().remove();
            _content.children().eq(0).css('display', 'block');
            _content.parent().css({ 'margin-left': '-70px', 'margin-top': '-272px', 'height': '245px' });;
            _content.parent().children().eq(2).css('top', '240px');
            if (_this._geometry.style == 'polyline' || _this._geometry.style == 'polygon' || _this._geometry.style == 'rectangle' || _this._geometry.style == 'circle') {
                if (_this._polystyle.linestyle == "dashed") {
                    //_lay.onRemove(_this._map);
                    _lay.options.fillOpacity = _this._polystyle.fillopacity;
                    _lay.options.fillColor = _this._polystyle.fillcolor;
                    _lay.options.stroke = false;
                    _lay.options.dashArray = "dashed";
                    var pathPattern = L.polylineDecorator(_lay,
                        {
                            patterns: [
                              {
                                  offset: 5, repeat: 15, symbol: L.Symbol.dash({
                                      pixelSize: 10, pathOptions: {
                                          color: _this._polystyle.linecolor,
                                          weight: _this._polystyle.linewidth,
                                          opacity: _this._polystyle.lineopacity,
                                      }
                                  })
                              }
                            ]
                        }
                 ).addTo(_this._map);
                    _lay.redraw();
                    _lay.options.mypopup.dashline = pathPattern;
                }
                else if (_this._polystyle.linestyle == "solid") {
                    _lay.options.stroke = true;
                    if (_lay.options.mypopup.dashline) {
                        _lay.options.mypopup.dashline.onRemove(_this._map);
                        _lay.options.mypopup.dashline = null;
                    }
                    _lay.options.color = _this._polystyle.linecolor;
                    _lay.options.weight = _this._polystyle.linewidth;
                    _lay.options.opacity = _this._polystyle.lineopacity;
                    _lay.options.fillOpacity = _this._polystyle.fillopacity;
                    _lay.options.fillColor = _this._polystyle.fillcolor;
                    _lay.options.dashArray = "solid";                 
                    _lay.redraw();
                }
            }
        },

        /**
        *返回编辑状态
        *@method rebackEdit
        */
        rebackEdit: function (o) {
            var _content = o.data.content;
            var _this = o.data.obj;
            _content.children().eq(0).css('display', 'block');
            $(this).parent().remove();
            if (_this._geometry.style == "point") {
                _content.parent().css({ 'height': '245px', 'margin-top': '-310px' });
                _content.parent().children().eq(2).css('top', '240px');
            }
            else if (_this._geometry.style == "polyline") {
                _content.parent().css({ 'margin-left': '-70px', 'margin-top': '-272px', 'height': '245px' });
                _content.parent().children().eq(2).css('top', '240px');
            }

            else if (_this._geometry.style == 'polygon' || _this._geometry.style == 'rectangle' || _this._geometry.style == 'circle') {
                _content.parent().css({ 'margin-left': '-70px', 'margin-top': '-272px', 'height': '245px'});
                _content.parent().children().eq(2).css('top', '240px');
            }

        },

        /**
        *选择点图片显示样式
        *@method choosePicture
        */
        choosePicture: function (o) {
            var _lay = o.data.lay;
            var _this = o.data._this;
            var id = $(this).attr('id');
            id = id.split('_')[2];
            $('.pubpind').removeClass('pubpind-hover');
            $(this).addClass('pubpind-hover');
            var _icon = new L.Icon({
                iconUrl: _this._imgurl + id + '.png',
                iconSize: [37, 33],
                iconAnchor: [18.5, 43]
            });
            _lay.setIcon(_icon);
        },

        /**
        *限制input只能输入数字
        *@method numonly
        */
        numonly: function () {
            if (!((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)))
                event.returnValue = false;
        },

        /**
        *初始化选择框
        *@method initializelinestyle
        *@param _this{Object} 上下文
        */
        initializelinestyle: function (_this) {
            $(".line-style-choose .line-style-choose-line").css("border-top-style", _this._polystyle.linestyle);
            $(".line-result-style hr").css("border-top-style", _this._polystyle.linestyle);
            $(".line-width-choose .line-style-choose-num").html(_this._polystyle.linewidth/2);
            $(".line-width-choose .line-style-choose-line").css("border-top-width", _this._polystyle.linewidth + "px");
            $(".line-result-style hr").css("border-top-width", _this._polystyle.linewidth + "px");
            $(".line-result-style hr").css("border-top-color", _this._polystyle.linecolor);
            $(".fill-result-style-div").css("background-color", _this._polystyle.fillcolor);
            $(".fill-color-opacity-content input").val(_this._polystyle.fillopacity * 100);
            $(".line-color-opacity-content input").val(_this._polystyle.lineopacity * 100);
            if (_this._polystyle.linestyley == "solid") {
                $(".line-width-choose .line-style-choose-num").html("1");
            }
            else if (_this._polystyle.linestyle == "dashed") {
                $(".line-width-choose .line-style-choose-num").html("2");
            };
        },

        /**
        *标绘内容tooltip
        *@method loadtooltip
        *@param _lay{Object} 图层
        *@param _this{Object} 上下文
        */
        loadtooltip: function (_lay, _this) {
            var _pane = _this._map.getPanes().markerPane;
            if ($(_lay.options.mypopup._tooltip).length == 0) {
                _lay.options.mypopup._tooltip = _this._function._create('div', 'marker-label-tooltip', _pane);                 //标绘弹出框容器

                var _pos = _this._map.latLngToLayerPoint(_this._geometry.ring);
                _this._function._setposition(_lay.options.mypopup._tooltip, _pos);
                var _tooltiphtml = "<p></p>";
                $(_lay.options.mypopup._tooltip).append(_tooltiphtml);
            }
            $(_lay.options.mypopup._tooltip).children().eq(0).text(_lay.options.mypopup._titles);
            $(_lay.options.mypopup._tooltip).css('display', 'none');
        },

        /**
        *显示内容tooltip
        *@method showtooltip
        *@param _lay{Object} 图层对象
        *@param map{Object} 地图对象
        */
        showtooltip: function (_lay,map) {
            var tooltip = L.DomUtil.create('div', 'marker-label-tooltip', map.getPanes().markerPane);
            var _pos = map.latLngToLayerPoint(_lay._latlng);
            L.DomUtil.setPosition(tooltip, _pos);
                var _tooltiphtml = "<p></p>";
                $(tooltip).append(_tooltiphtml);
                $(tooltip).children().eq(0).text(_lay.options.mypopup._titles);
        }

    });

    L.Marker.mergeOptions({                                                    //为leaflet的Marker类添加属性保存popup的参数
        mypopup: {
            _tooltip: null,
            _titles: null,
            _content: null,
            statu: 0,
        }
    });

    L.Path.mergeOptions({                                                    //为leaflet的path类添加属性保存popup的参数
        mypopup: {
            _titles: null,
            _content: null,
            statu: 0,
            dashline:null,
        }
    });

});