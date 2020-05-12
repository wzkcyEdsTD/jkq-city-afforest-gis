/**
*指标对比类
*@module modules.business
*@class DCI.Business.IndexContrast
*@constructor initialize
*/
define("business/indexcontrast", [
    "leaflet",
    "core/dcins",
    "data/ajax",
    "plugins/scrollbar"
], function (L) {
    L.DCI.Business.IndexContrast = L.Class.extend({

        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: "indexcontrast",

        /**
        *配置
        *@property options
        *@type {Object}
        *@private
        */
        options: {
            url: null,//查询服务URL
            ydhxUrl: null,   //用地红线的服务地址（这个看项目具体情况更改）
            tableHeader: null,//表格表头
            queryField: null,//查询字段配置
            layerIndex: null//查询图层index
        },

        /**
        *地图对象
        *@property _map
        *@type {Object}
        *@private
        */
        _map: null,

        /**
        *分析模板html
        *@property _html
        *@type {String}
        *@private
        */
        _html: '<div class="business-contrast-container">'
         + '<div class="business-contrast-header">'
                + '<table>'
                     + '<tr>'
                       + '<td  class="business-contrast-td">指标对比</td>'
                     + '</tr>'
                 + '</table>'
          + '</div>'
        + '<div class="business-contrast-content" >'
            + '<table>'
                  + '<thead></thead>'
                  + '<tbody></tbody>'
               + '</table>'
        + '</div>'
        + '</div>',

        /**
        *初始化
        *@method initialize
        *@param options{Object} 配置参数
        */
        initialize: function (options) {
            this.options = L.setOptions(this, options);
            this._map = L.DCI.App.pool.get("map");

        },

        /**
        *显示分析面板
        *@method show
        */
        show: function () {
            L.DCI.App.pool.get("rightPanel").clear(0);
            L.DCI.App.pool.get("rightPanel").load(this._html, '指标对比', 0);
            this._container = $(".business-contrast-container")[0];
            this.creatTableHead();
            this.creatTbody();
            this._map.activate(L.DCI.Map.StatusType.SELECT, this._bcallback, this.precall, this);
        },
      
        /**
        *填充表格头部
        *@method creatTableHead
        */
        creatTableHead: function () {
            var tableHeaderContainer = $(this._container).find('.business-contrast-content thead');
            var headerhtm = '<tr><td></td>';
            var tableHead = this.options.tableHeader;
            for (var i in tableHead) {
                headerhtm += '<td>' + tableHead[i].alias + '</td>';
            }
            headerhtm += '</tr>';
            tableHeaderContainer.html(headerhtm);
        },

        /**
        *填充表格内容
        *@method creatTbody
        */
        creatTbody: function () {
            var html = '';
            var headField = {
                0: "总规",
                1: "控规",
                2: "用地",
                3: "竣工"
            };
            for (var i in headField) {
                html += '<tr><td>' + headField[i] + '</td>';
                var filterFields = this.options.tableHeader;
                for (var field in filterFields) {
                    html += '<td></td>';
                }
                html += "</tr>";
            }
            $(this._container).find('.business-contrast-content tbody').html(html);
        },

        /**
        *地图点击事件回调函数_查询总规
        *@method _bcallback
        *@param evt{Object} 地图点击事件回传对象
        */
        _bcallback: function (evt) {
            var _this = this;
            _this._map.getHighLightLayer().clearLayers();
            var map = _this._map.getMap();
            var html = '<tr><td>总规</td>';
            //_this._map.activate(L.DCI.Map.StatusType.SELECT, null, this.precall, this);
            L.esri.Tasks.identifyFeatures(_this.options.url)
                    .on(map)
                    .at(evt.latlng)
                    .tolerance(0)
                    .layers(_this.options.layerIndex.zg)
                    .run(function (error, featureCollection, response) {
                        if (response.results.length > 0) {

                            var _results = response.results;
                            var filterFields = _this.options.tableHeader;
                            for (var field in filterFields) {
                                var attr = filterFields[field].alias;
                                html += '<td>' + _results[0].attributes[attr] + '</td>';
                            }
                            html += '</tr>';

                        } else {
                            var filterFields = _this.options.tableHeader;
                            for (var field in filterFields) {
                                html += '<td></td>';
                            }
                            html += '</tr>';

                        }
                        _this.queryKg(_this.options.url, evt, map, html, _this);
                    });

        },

        /**
        *查询控规图层
        *@method queryKg
        *@param url{Object} 查询服务地址
        *@param evt{Object} 地图点击事件回传对象
        *@param map{Object} 地图对象
        *@param html{Object} html元素
        *@param _this{Object} 上下文对象
        */
        queryKg: function (url, evt, map, html, _this) {
            var _this = _this;
            var html1 = html;
            html1 += '<tr><td>控规</td>';
            L.esri.Tasks.identifyFeatures(url)
               .on(map)
               .at(evt.latlng)
               .tolerance(0)
               .layers(_this.options.layerIndex.kg)
               .run(function (error, featureCollection, response) {
                   if (response.results.length > 0) {
                       var _results = response.results;
                       var filterFields = _this.options.tableHeader;

                       for (var field in filterFields) {
                           var attr = filterFields[field].alias;
                           html1 += '<td>' + _results[0].attributes[attr] + '</td>';
                       }
                       html1 += '</tr>';
                   } else {
                       var filterFields = _this.options.tableHeader;
                       for (var field in filterFields) {
                           html1 += '<td></td>';
                       }
                       html1 += '</tr>';
                   }

                   _this.queryYd(url, evt, map, html1, _this);
               });
        },

        /**
        *查询用地图层
        *@method queryYd
        *@param url{Object} 查询服务地址
        *@param evt{Object} 地图点击事件回传对象
        *@param map{Object} 地图对象
        *@param html{Object} html元素
        *@param _this{Object} 上下文对象
        */
        queryYd: function (url, evt, map, html, _this) {

            var url1 = _this.options.ydhxUrl;

            var html2 = html;
            var _this = _this;
            html2 += '<tr><td>用地</td>';
            //L.esri.Tasks.identifyFeatures(url)
            L.esri.Tasks.identifyFeatures(url1)
              .on(map)
              .at(evt.latlng)
              .tolerance(0)
              .layers(2)
              //.layers(_this.options.layerIndex.yd)
              .run(function (error, featureCollection, response) {
                  if (response.results.length > 0) {
                      var _results = response.results;
                      var filterFields = _this.options.ydHeader;
                      for (var field in filterFields) {
                          var attr = filterFields[field].alias;
                          if (_results[0].attributes[attr]) {
                              html2 += '<td>' + _results[0].attributes[attr] + '</td>';
                          } else {
                              html2 += '<td> </td>';
                          }
                      }
                      html2 += '</tr>';
                  } else {
                      var filterFields = _this.options.ydHeader;
                      for (var field in filterFields) {
                          html2 += '<td></td>';
                      }
                      html2 += '</tr>';
                  }
                  _this.queryJg(url, evt, map, html2, _this);
              });

        },

        /**
        *查询竣工图层
        *@method queryJg
        *@param url{Object} 查询服务地址
        *@param evt{Object} 地图点击事件回传对象
        *@param map{Object} 地图对象
        *@param html{Object} html元素
        *@param _this{Object} 上下文对象
        */
        queryJg: function (url, evt, map, html, _this) {
            var html3 = html;
            var _this = _this;
            html3 += '<tr><td>竣工</td>';
            L.esri.Tasks.identifyFeatures(url)
              .on(map)
              .at(evt.latlng)
              .tolerance(0)
              .layers(_this.options.layerIndex.jg)
              .run(function (error, featureCollection, response) {
                  if (response.results.length > 0) {
                      var _results = response.results;
                      var filterFields = _this.options.tableHeader;
                      for (var field in filterFields) {
                          var attr = filterFields[field].alias;
                          html3 += '<td>' + _results[0].attributes[attr] + '</td>';
                      }
                      html3 += '</tr>';
                  } else {
                      var filterFields = _this.options.tableHeader;
                      for (var field in filterFields) {
                          html3 += '<td></td>';
                      }
                      html3 += '</tr>';
                  }
                  $(_this._container).find('.business-contrast-content tbody').html(html3);
                  _this.queryXm(url, evt, map, _this);
              });


        },

        /**
        *查询项目图层
        *@method queryXm
        *@param url{Object} 查询服务地址
        *@param evt{Object} 地图点击事件回传对象
        *@param map{Object} 地图对象
        *@param html{Object} html元素
        *@param _this{Object} 上下文对象
        */
        queryXm: function (url, evt, map, _this) {
            var _this = _this;
            L.esri.Tasks.identifyFeatures(url)
                .on(map)
                .at(evt.latlng)
                .tolerance(0)
                .layers(_this.options.layerIndex.xm)
                .run(function (error, featureCollection, response) {
                    if (response.results.length > 0) {
                        //L.dci.app.util.highLight(_this._map, response.results[0], true, true);
                    } else {

                    }

                });
        },

    });


    return L.DCI.Business.IndexContrast;


});