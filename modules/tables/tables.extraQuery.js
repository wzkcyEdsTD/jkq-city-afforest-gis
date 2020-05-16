/**
 * 表格
 * @author eds
 * @public
 * @requires jquery.dataTables.min
 * @name extratables
 */

define("tables/extraQuery", [
    "leaflet",
    'rqtext!../../components/extra.html',
    "core/dcins",
    "plugins/datatables",
], function (L, extra) {
    L.DCI.ExtraQuery = L.DCI.Layout.extend({
        /**
         * 表格对象集
         */
        _table: null,
        _id: null,
        _timestamp: null,
        _data: [],
        _hash: {},
        __fieldAliases: {},
        _force: null,
        _config: null,
        _index:null,
        /**
         * 表模板
         */
        _template: `<div class='extra_obj extra_query extra_query_###'><div>
            <h4>数据搜索</h4>
               <div class="extra_header form-inline">
                <div class="form-group mb-3"><label>类型: </label><select class="form-control extra_query_select">
                    <option value='1954@LDGS' selected >公园绿地</option>
                    <option value='1960@LDGS'>道路绿地</option>
                    <option value='1947@NAME'>古木名树</option>
                    <option value='1983@NAME'>地名地址</option>
                </select></div>
                <div class="form-group mb-3"><label>名称搜索: </label><input class="form-control searchName"/></div>
                <button class='btn btn-primary extra_query_search'>搜索</button>
                <button class='btn btn-primary extra_query_export'>导出</button>
                <span class="extra_query_close">x<span>
            </div>
            <table id='@@'></table></div>`,
        _detail: `<div class='extra_detail'>
                <header>属性</header>
            </div></div>`,
        /**
         * 过滤字段
         */
        _banned: ["FEATUREGUID", "PICTURE"],
        initialize: function (id = 'extra_querys') {
            //  this._table = $(`#${id}`).DataTables();
            this._id = id;
            this._timestamp = + new Date();
            this.tableDefault();
            this.tableEvent();
            this.doTable();
        },
        doTable: function () {
            const template = this._template.replace(/@@/g, this._id).replace(/###/g, this._timestamp);
            $(".extra_obj").remove();   // DOM删除 无注销内存
            $("body").append(template);
        },
        queryTable: function () {
            const that = this;
            const arcgisxhr = new L.DCI.ArcgisXhr();
            const [id, index] = ($(".extra_query_select").val() || '1954@LDGS').split('@');
            this._index = index;
            const searchName = $(".searchName").val().trim();
            L.dci.app.services.baseService.getFeatureLayerById({
                id,
                context: that,
                success: function (res) {
                    if (res != "0" && res.length > 0) {
                        const isNew = that._config && that._config.FeatureName == res[0].FeatureName ? false : true;
                        that._config = res[0];
                        const { Url, LayerIndex } = that._config;
                        arcgisxhr.getArcgisByXhr(`${Url}/${LayerIndex}/query`, ({ fieldAliases, features }) => {
                            const _hash = {};
                            const data = features.map((v, index) => {
                                _hash[v.attributes.OBJECTID] = v;
                                return v.attributes;
                            });
                            that._fieldAliases = fieldAliases;
                            that._hash = _hash;
                            that._data = features;
                            if (isNew) {
                                that._table && that._table.api().destroy();
                                $(`#${that._id}`).remove();
                                $('.extra_query').append(`<table id='${that._id}'></table>`);
                                that.initTable(data)
                            } else {
                                that.initDetailTableData(data);
                            }
                        }, !searchName ? "1=1" : encodeURIComponent(`${index} like '%${searchName}%'`));
                    } else {
                        L.dci.app.util.dialog.alert("提示", "该服务已被禁用");
                    }
                }
            });
        },
        initTable: function (data) {
            this._table = $(`#${this._id}`).dataTable({
                serverSide: false,
                data,
                ordering: true,
                scrollY: 160,
                scrollX: true,
                bSort: true,
                searching: false,
                lengthChange: false,
                columns: Object.keys(this._fieldAliases).filter(v => !~this._banned.indexOf(v)).map(v => {
                    return {
                        title: this._fieldAliases[v], data: v, width: 100
                    }
                })
            })
        },
        initDetailTableData: function (dataArr) { //dataArr是表格数据数组，和初始化配置需一样的结构
            var table = this._table;
            var oSettings = table.fnSettings(); //这里获取表格的配置
            table.fnClearTable(this); //动态刷新关键部分语句，先清空数据
            for (var i = 0, l = dataArr.length; i < l; i++) {
                table.oApi._fnAddData(oSettings, dataArr[i]); //这里添加一行数据
            }
            oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
            table.fnDraw();//绘制表格
        },
        doTransform: function (geometry) {
            const crs = new L.Proj.CRS(Project_ParamConfig.crs.code, Project_ParamConfig.crs.defs);
            if (geometry.rings) {
                const { rings } = geometry;
                const sum = [0, 0];
                const polygon = rings[0].map(v => {
                    const { lat, lng } = crs.projection.unproject(L.point(v[0], v[1]));
                    sum[0] += lat;
                    sum[1] += lng;
                    return [lat, lng];
                })
                const center = [sum[0] / polygon.length, sum[1] / polygon.length];
                return { type: 'polygon', geometry: polygon, center };
            } else {
                const { x, y } = geometry;
                const point = crs.projection.unproject(L.point(x, y));
                return { type: 'point', geometry: point, center: point }
            }
        },
        tableEvent: function () {
            const that = this;
            //  [表格]   搜索
            $('body').on('click', `.extra_query_${that._timestamp} .extra_query_search`, function () {
                that.queryTable();
            })
            //  [表格] 点击条目
            $('body').on('click', `.extra_query_${that._timestamp} tbody tr`, function () {
                const data = that._hash[that._table.fnGetData(this).OBJECTID];
                //  赋值
                that._force = data.attributes;
                //  定位
                const { type, geometry } = that.doTransform(data.geometry);
                const map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                const hlLayer = map.getLabelLayer();
                hlLayer.clearLayers();
                if (type == 'point') {
                    L.marker(geometry).addTo(hlLayer);
                    L.popup({ maxWidth: 80, offsety: 10, className: 'popupLittleUp' })
                        .setLatLng(geometry)
                        .setContent(`${data.attributes.ADDRESS} - [${data.attributes[that._index]}]`)
                        .openOn(map.map);
                    map.map.panTo(geometry);
                } else if (type == 'polygon') {
                    const polygon = L.polygon(geometry, { color: 'red' }).addTo(hlLayer);
                    console.log(polygon.getBounds());
                    map.map.fitBounds(polygon.getBounds());
                }

                //  弹框
                $(".extra_details").remove();
                $("body").append(extra);
                that.doBasicDisplay();
            });
            //  [表格]   点击退出
            $('body').on('click', `.extra_query_${that._timestamp} .extra_query_close`, function () {
                that._table.api().destroy();
                $(".extra_query").remove();
            })
            //  [表格]   点击导出
            $('body').on('click', `.extra_query_${that._timestamp} .extra_query_export`, function () {
                that.exportTable(that._data.map((v) => {
                    that._hash[v.attributes.OBJECTID] = v;
                    return v.attributes;
                }))
            })
            //  [弹出框] 点击退出
            $('body').on('click', '.extra_close', function () {
                $('.extra_details').remove();
            })
            //  [弹出框] 切换
            $('body').on('click', '.extra_details_body_left_tip', function () {
                const type = $(this).attr('data-info');
                switch (type) {
                    case 'basic': {
                        that.doBasicDisplay();
                        break;
                    }
                    case 'maintain': {
                        that.doMaintainDisplay();
                        break;
                    }
                    case 'image': {
                        that.doImageDisplay();
                        break;
                    }
                }
            })
        },
        doBasicDisplay: function () {
            $('.extra_details_body_main').html(`<div><header>基本信息</header><ul>${Object.keys(this._force).filter(v => !~this._banned.indexOf(v)).map(v => { return `<li><label>${this._fieldAliases[v]}</label><span>${this._force[v]}</span></li>` }).join('')}</ul></div>`);
        },
        doMaintainDisplay: function () {
            $('.extra_details_body_main').html(`<div><header>养护信息</header></div>`);
        },
        doImageDisplay: function () {
            $('.extra_details_body_main').html(`<div><header>图片展示</header></div>`);
        }, 
        tableDefault: function () {
            $.fn.dataTable.defaults.oLanguage = {
                "sProcessing": "处理中...",
                "sLengthMenu": "显示 _MENU_ 项结果",
                "sZeroRecords": "没有匹配结果",
                "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
                "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
                "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
                "sInfoPostFix": "",
                "sSearch": "搜索：",
                "sUrl": "",
                "sEmptyTable": "表中数据为空",
                "sLoadingRecords": "载入中...",
                "sInfoThousands": ",",
                "oPaginate": {
                    "sFirst": "首页",
                    "sPrevious": "上页",
                    "sNext": "下页",
                    "sLast": "末页"
                },
                "oAria": {
                    "sSortAscending": ": 以升序排列此列",
                    "sSortDescending": ": 以降序排列此列"
                }
            };
        },
        exportTable: function (jsonData, worksheet = +new Date()) {
            const excelContent = `<tr>${Object.keys(jsonData[0])
                .map((v) => `<td>${this._fieldAliases[v] || ``}</td>`)
                .join(``)}</tr>${jsonData
                    .map(
                        (v) =>
                            `<tr>${Object.keys(v)
                                .map((d) => `<td>${v[d] || ``}</td>`)
                                .join(``)}</tr>`
                    )
                    .join(``)}`;
            const uri = "data:application/vnd.ms-excel;base64,";
            const template = `<html xmlns:o="urn:schemas-microsoft-com:office:office" 
  xmlns:x="urn:schemas-microsoft-com:office:excel" 
  xmlns="http://www.w3.org/TR/REC-html40">
  <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
    <x:Name>${worksheet}</x:Name>
    <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>
    </x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
    </head><body><table>${excelContent}</table></body></html>`;
            //下载模板
            // window.location.href = ;
            const link = document.createElement("a");
            link.href = uri + encodeURIComponent(window.btoa(unescape(encodeURIComponent(template))));
            //对下载的文件命名
            link.download = `${worksheet}.xls`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        }
    });
    return L.DCI.ExtraQuery;
});

