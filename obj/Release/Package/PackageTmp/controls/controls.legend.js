/**
*图例类
*@module controls
*@class DCI.Controls.Legend
*@extends L.Control
*/
define("controls/legend", [
    "leaflet",
    "core/dcins",
    "plugins/scrollbar"
], function (L) {
    L.DCI.Controls.Legend = L.Control.extend({
        /**
        *配置
        *@property options
        *@type {Object}
        */
        options: {
            position: 'bottomleft',
            isshow: true
        },
        /**
        *保存所有的图层，以及图例
        *{isshow,legends,name,lay,laylabel,legc}
        *@property layers
        *@type {Object}
        */
        layers: null,
        showid: '',
        /**
        *控件高度默认是map高度的40%
        *@property per
        *@type {Number}
        */
        per:0.4,//
        /**
        *初始化
        *@method initialize
        */
        initialize: function (options) {
            if(options==undefined)return;
            if (options.position!=undefined) this.options.position = options.position;
            if (options.isshow != undefined) this.options.isshow = options.isshow;
        },
        /**
        *将此控件添加到容器
        *@method addTo
        *@param map {Object} 地图对象
        */
        onAdd: function (map) {
            this.map = map;
            this.layers = {};
            var conclass = 'legend-control';
            var spanstyle = '';
            if (this.options.isshow == false) {
                conclass = 'legend-hide';
                spanstyle = ' style="transform-origin: 50% 50%; transform: rotate(180deg); -ms-transform-origin-x: 50%; -ms-transform-origin: 50%; -ms-transform: rotate(180deg);"';
            }
            this.container = L.DomUtil.create('div', conclass);
            this.container.id = "legend-control";
            this.header = $('<header class ="header"><label>图例</label><span'+spanstyle+' class="icon-arrows-shrink"></span></header>');
            this.body = $("<div class='legend-body'></div>");
            $(this.container).append([this.header, this.body]);

            //隐藏控件
            this.header.on('click', 'span', { obj: this }, this.headerclick);
            $(this.container).on('click', { obj: this }, this.contrainnerclick);

            this.map.on('layeradd', this._layerAdd, this);
            this.map.on('layerremove', this._layerRemove, this);
            this.map.on('resize', this.clacHight, this);

            L.DomEvent.disableClickPropagation(this.container);
            L.DomEvent.on(this.container, 'mousewheel', L.DomEvent.stopPropagation);
            L.DomEvent.on(this.container, 'click', L.DomEvent.stopPropagation);
            L.DomEvent.on(this.container, 'contextmenu', L.DomEvent.stopPropagation);
            return this.container;
        },
        headerclick:function(e) {
            if (e.data.obj.options.isshow) {
                e.data.obj.hide();
                e.data.obj.options.isshow = false;
            } else {
                e.data.obj.show();
                e.data.obj.options.isshow = true;
            }
            e.stopPropagation();
        },
        contrainnerclick:function(e) {
            if (!e.data.obj.options.isshow) {
                e.data.obj.show();
                e.data.obj.options.isshow = true;
            }
        },
        onRemove: function () {
            this.map.off('layeradd', this._layerAdd, this);
            this.map.off('layerremove', this._layerRemove, this);
            this.map.off('resize', this.clacHight, this);
        },
        _layerAdd: function (o) {
            if (!o.layer.options || !o.layer.options.id || !o.layer.options.name || !o.layer.url) return;
            var id=o.layer.options.id;
            if (this.layers[id] && this.layers[id].lay && this.layers[id].laylabel) {
                this.layers[id].isshow = true;
                (this.body).append(this.layers[id].lay);
                this._shwoLegend(this.layers[id].laylabel);
            } else {
                this.layers[id] = {};
                this.layers[id].isshow = true;
                this.layers[id].name = o.layer.options.name;
                this._requestLegend(id, o.layer.url);
            }
        },
        _layerRemove: function (o) {
            if (!o.layer.options || !o.layer.options.id) return;
            this._removeLegend(o.layer.options.id);
        },

        /**
        *请求图例
        *@method _requestLegend
        *@param id {String} 图层ID
        *@param url {String} 图层服务地址
        *@private
        */
        _requestLegend: function (id,url) {
            L.esri.request(url + 'legend', {}, function (error, response) {
                if (error) {
                    //console.log(error);
                    L.dci.log.showLog(error);
                } else {
                    var _layers = response.layers;
                    if (_layers.length == 0) return;
                    this.layers[id].legends = [];
                    for (var j = 0, k = _layers.length; j < k; j++) {
                        if (_layers[j].legend) {
                            for (var l = 0, m = _layers[j].legend.length; l < m; l++) {
                                if (_layers[j].legend[l].label == "" || _layers[j].legend[l].label == '<all other values>') continue;
                                this.layers[id].legends.push(_layers[j].legend[l]);
                            }
                        }
                    }
                    this._loadLegend(id);
                }
            }, this);
        },
        /**
        *加载图例
        *@method _loadLegend
        *@param id {String} 图层ID
        *@private
        */
        _loadLegend: function (id) {
            if (this.layers[id] && this.layers[id].lay) return;
            //加载该图层标签
            var lay = L.DomUtil.create('div', 'lay-container');
            this.layers[id].lay = lay;//移除时使用
            var laylabel = L.DomUtil.create('div', 'laylabel');
            this.layers[id].laylabel = laylabel;//旋转展开图标时使用，模拟按键时使用
            laylabel.id = 'laylabel_' + id;
            var html=[];
            html.push('<div>'+this.layers[id].name+'</div>');
            html.push('<span class="icon-arrows-right"></span>');
            laylabel.innerHTML = html.join('');
            $(lay).append(laylabel);
            var legc = L.DomUtil.create('div', 'lay-legend');
            legc.id = 'lay-legend_' + id;
            $(lay).append(legc);
            (this.body).append(lay);
            L.DomEvent.on(laylabel, 'click', this._shwoLegend, this);
            
            //显示该图层图例
            this._shwoLegend(this.layers[id].laylabel);
        },
        /**
        *显示图例
        *@method _shwoLegend
        *@private
        */
        _shwoLegend: function (e) {
            var target = e.target;
            if (!target) target = e;
            var id = target.id.split('_')[1];
            if (!id) {
                target = e.target.parentNode;
                id = target.id.split('_')[1];
            }
            if (this.layers[id].isshow == false) {
                $(this.layers[id].lay).hide();
                var height = this._getHeight();
                this.clacHight();
                return;
            }
            else {
                $(this.layers[id].lay).show();
            }
            if (this.showid == id) {
                //收起
                this.layers[id].legc.slideUp(300);
                $(this.layers[id].laylabel).find('span').rotate({ animateTo: 0, duration: 300 });
                this.showid = '';
                return;
            };
            this.showid = id;
            //隐藏其他的图例
            var count = 0;
            for (var i in this.layers) {
                if (this.layers[i].isshow) {
                    count++;
                    if (i != id) {
                        if (this.layers[i].legc) {
                            this.layers[i].legc.slideUp(300);
                        }
                        $(this.layers[i].laylabel).find('span').rotate({ animateTo: 0, duration: 300 });
                    }
                }
            }
            //重新计算高度
            var height = this._getHeight();
            this.clacHight();
            //显示图例容器
            var legc = $(target).next();
            if (this.layers[id].legc) {
                legc = this.refushLegc(legc, id);
            }
            this.layers[id].legc = legc;//显示隐藏图例时使用
            legc.css("maxHeight", height);
            legc.height(height);
            legc.slideDown(300);
            //显示图例
            var legends = this.layers[id].legends;
            var legend = [];
            var html = '';
            for (var i = 0; i < legends.length; i++) {
                var label = legends[i].label;
                var style = 'style ="background:url(data:' + legends[i].contentType + ';base64,' + legends[i].imageData + ');"';
                var li = '<li><span ' + style + ' ></span><label title =" ' + label + '">' + label + '</label></li>';
                legend.push(li);
                if (i == legends.length - 1) {
                    html = '<ul>' + legend.join('') + '</ul>';
                }
            }
            if (legends.length == 0) {
                html = '<ul><li><label title="无可显示图例">无可显示图例</label></li></ul>';
            }
            legc.html(html);
            //滚动条
            $(legc).mCustomScrollbar({
                theme: "minimal-dark"
            });
            
            $(this.layers[id].laylabel).find('span').rotate({ animateTo: 90, duration: 300 });
        },
        /**
        *获取图例控件高度
        *@method _getHeight
        *@return {Number} 高度值
        *@private
        */
        _getHeight: function () {
            var count = 0;
            for (var i in this.layers) {
                if (this.layers[i].isshow) {
                    count++;
                }
            };
            var size = this.map.getSize();
            var ah = 0;
            this.per = 0.1 * (count + 3);
            if (this.per > 0.7) this.per = 0.7;
            ah = parseInt(size.y * this.per);
            var ph = 36;
            var height = ah - ph * (count + 1);
            return height;
        },
        refushLegc: function (legc, id) {
            $(legc).remove();
            var legc2 = L.DomUtil.create('div', 'lay-legend');
            legc2.id = 'lay-legend_' + id;
            $(this.layers[id].lay).append(legc2);
            this.layers[id].legc = $(legc2);
            return $(legc2);
        },
        /**
        *删除图例
        *@method _removeLegend
        *@param id {String} 图例ID
        *@private
        */
        _removeLegend: function (id) {
            //删除图层标签
            if (this.layers[id] && this.layers[id].laylabel) {
                this.layers[id].isshow = false;
                this._shwoLegend(this.layers[id].laylabel);
            }

            //如果该图层的图例是当前显示的，重新调整该显示的图例
            if (this.showid == id) {
                var id2;
                this.showid = '';
                for (var i in this.layers) {
                    if (this.layers[i].isshow)
                        id2 = i;
                }
                if (this.layers[id2] && this.layers[id2].laylabel)
                    this._shwoLegend(this.layers[id2].laylabel);
            }
        },
        /**
        *计算地图高度
        *@method clacHight
        */
        clacHight: function () {
            if (this.options.isshow) {
                var size = this.map.getSize();
                var y = parseInt(size.y * this.per);
                $(this.container).css("height", y);
                $(this.body).css("height", y - 36);
            } else{
                $(this.container).css("height", 36);
                $(this.body).css("height", 0);
            }
        },
        /**
        *显示控件
        *@method show
        */
        show: function () {
            var _this = this;
            $(this.container).hide(10, function () {
                $(this).removeClass('legend-hide');
                $(this).addClass('legend-control');
                _this.clacHight();
                $(this).show(300, function () {
                    $(this).find(".header>span").rotate({ animateTo: 0, duration: 300 });
                });
            });
        },
        /**
        *隐藏控件
        *@method hide
        */
        hide: function () {
            var _this = this;
            $(this.container).hide(300, function () {
                $(this).removeClass('legend-control');
                $(this).addClass('legend-hide');
                _this.clacHight();
                $(this).show(10, function () {
                    $(this).find(".header>span").rotate({ animateTo: 180, duration: 300 });
                });
            });
            
        },
        hidden: function () {
            $(this.container).hide();
        },
        shower: function () {
            $(this.container).show();
        }
    });
    L.dci.legend = function (options) {
        return new L.DCI.Controls.Legend(options);
    }
    
});