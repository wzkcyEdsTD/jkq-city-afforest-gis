/**
 * 表格
 * @author eds
 * @public
 * @requires jquery.dataTables.min
 * @name extratables
 */

define("tables/dataTables", [
    "leaflet",
    'rqtext!../../components/extra.html',
    "tables/formObj",
    "core/dcins",
    "plugins/datatables",
], function (L, extra, formConfig) {
    L.DCI.DataTables = L.DCI.Layout.extend({
        /**
         * 表格对象
         */
        _table: null,
        _id: null,
        _timestamp:null,
        _data: [],
        _hash: {},
        _fieldAliases: {},
        _force: null,
        _config: null,
        _formConfig: {},
        /**
         * 表模板
         */
        _template: `<div class='extra_obj extra_dataTable extra_dataTable_###'><div>
            <h4>%%%<button class='btn btn-primary btn-updown' data-info="on">收起</button></h4>
            <div class="extra_header form-inline">
                @formConfig@
                <button class='btn btn-primary extra_dataTable_search'>搜索</button>
                <button class='btn btn-primary extra_dataTable_export'>导出</button>
                <span class="extra_dataTable_close">x<span>
            </div>
            <table id='@@'></table></div>` ,
        _detail: `<div class='extra_detail'>
                <header>属性</header>
            </div></div>`,
        /**
         * 过滤字段
         */
        _banned: ["OBJECTID_1", "WD", "JD", "CONTENT", "FEATUREGUID", "PICTURE"],
        initialize: function (id = 'extra_dataTables', config, FEATUREPARENTID) {
            this._FEATUREPARENTID = FEATUREPARENTID;
            this._id = id;
            this._formConfig = formConfig[id];
            this._config = config;
            this._timestamp = + new Date();
            this.tableDefault();
            this.tableEvent();
            this.doTable();
        },
        doTable: function () {
            const formConfig = this._formConfig;
            const template = this._template.replace(/@@/g, this._id).replace(/###/g, this._timestamp).replace(/%%%/g, this._config.FeatureName);
            const _template_ = template.replace(/@formConfig@/g, formConfig?formConfig.h.map(v => {
                return `<div class="form-group mb-2"><label>${v.n}: </label>${v.t == 'input' ? `<input class="form-control form-data-${v.k}"/>` : `<select class="form-control form-data-${v.k}">${v.v.map(d=> `<option value="${d.v}">${d.n}</option>`).join('')}</select>`}</div>`
            }).join('') : '');
            $(".extra_details").remove();
            $(".extra_obj").remove();   // DOM删除 无注销内存
            $("body").append(_template_);
            this.queryTable();
        },
        queryTable: function () {
            const that = this;
            const query = that._formConfig ? that._formConfig.h.map(v => {
                const val = $(`.form-data-${v.k}`).val();
                return !val ? '' : `${v.k} like '%${val}%'`;
            }).filter(v => v).join(' and ') : '';
            const { Url, LayerIndex } = that._config;
            const arcgisxhr = new L.DCI.ArcgisXhr();
            arcgisxhr.getArcgisByXhr(`${Url}/${LayerIndex}/query`, ({ fieldAliases, features }) => {
                const _hash = {};
                const data = features.map((v, index) => {
                    _hash[v.attributes.OBJECTID] = v;
                    return v.attributes;
                });
                that._fieldAliases = fieldAliases;
                that._hash = _hash;
                that._data = features;
                !that._table ? that.initTable(data) : that.initDetailTableData(data);
            }, encodeURIComponent(query || "1=1"));
        },
        initTable: function (data) {
            this._table = $(`#${this._id}`).dataTable({
                serverSide: false,
                data,
                ordering: true,
                scrollY: 340,
                pageLength : 20,
                scrollX: true,
                bSort: true,
                searching: false,
                lengthChange: false,
                columns: Object.keys(this._fieldAliases).filter(v => !~this._banned.indexOf(v)).map(v => {
                    return {
                        title: this._fieldAliases[v], data: v, width: 120
                    }
                })
            })
        },
        initDetailTableData: function (dataArr) {
            var table = this._table;
            var oSettings = table.fnSettings();
            table.fnClearTable(this);
            for (var i = 0, l = dataArr.length; i < l; i++) {
                table.oApi._fnAddData(oSettings, dataArr[i]);
            }
            oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
            table.fnDraw();
        },
        doTransform: function (geometry) {
            const crs = new L.Proj.CRS(Project_ParamConfig.crs.code, Project_ParamConfig.crs.defs);
            if (geometry.rings) {
                const { rings } = geometry;
                const sum = [0, 0];
                const polygon = rings[rings.length -1].map(v => {
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
            $('body').on('click', `.extra_dataTable_${that._timestamp} .extra_dataTable_search`, function () {
                that.queryTable();
            })
            //  [表格] 收起&展开
            $('body').on('click', `.extra_dataTable_${that._timestamp} .btn-updown`, function () {
                const ison = $(this).attr("data-info") == "on";
                ison && $(".extra_obj").addClass("extra_obj_hidden") && $(this).attr("data-info", "off").text("展开");
                !ison && $(".extra_obj").removeClass("extra_obj_hidden") && $(this).attr("data-info", "on").text("收起");
            })
            //  [表格] 点击条目
            $('body').on('click', `.extra_dataTable_${that._timestamp} tbody tr`, function () {
                if (that._FEATUREPARENTID == 2059) return;
                const data = that._hash[that._table.fnGetData(this).OBJECTID];
                //  赋值
                that._force = data.attributes;
                //  定位
                const { Url, LayerIndex } = that._config;
                const arcgisxhr = new L.DCI.ArcgisXhr();
                arcgisxhr.getArcgisByXhr(`${Url}/${LayerIndex}/query`, ({ features }) => {
                    const { type, geometry } = that.doTransform(features[0].geometry);
                    const map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                    const hlLayer = map.getLabelLayer();
                    hlLayer.clearLayers();
                    if (type == 'point') {
                        L.marker(geometry).addTo(hlLayer);
                        L.popup({ maxWidth: 80, offsety: 10, className: 'popupLittleUp' })
                            .setLatLng(geometry)
                            .setContent(that._formConfig ? that._formConfig.s.map(v => data.attributes[v]).join(' - ') : data.attributes['COUNTY'])
                            .openOn(map.map);
                        map.map.panTo(geometry);
                    } else if (type == 'polygon') {
                        const polygon = L.polygon(geometry, { color: 'red' }).addTo(hlLayer);
                        map.map.fitBounds(polygon.getBounds());
                    };
                    //  弹框
                    $(".extra_details").remove();
                    $("body").append(extra);
                    $(".extra_obj").addClass("extra_obj_hidden") && $(".btn-updown").attr("data-info", "off").text("展开")
                    that.doExtraEvent();
                }, `OBJECTID=${data.attributes.OBJECTID}`,true);
            });
            //  [表格]   选择区划
            $('body').on('change', `.extra_dataTable_${that._timestamp} .form-data-COUNTY`, function () {
                const val = $('.form-data-COUNTY').val();
                const town = that._formConfig.h.filter(v => v.k == 'COUNTY')[0].v.filter(v => v.v == val)[0].child;
                $('.form-data-TOWN').val("");
                $('.form-data-TOWN').html(town.map(v=>`<option value='${v.v}'>${v.n}</option>`));
            })
            //  [表格]   点击退出
            $('body').on('click', `.extra_dataTable_${that._timestamp} .extra_dataTable_close`, function () {
                that.doDestroy();
            })
            //  [表格]   点击导出
            $('body').on('click', `.extra_dataTable_${that._timestamp} .extra_dataTable_export`, function () {
                that.exportTable(that._data.map((v) => {
                    that._hash[v.attributes.OBJECTID] = v;
                    return v.attributes;
                }))
            })
            
        },
        doDestroy: function () {
            this._table && this._table.api && this._table.api().destroy();
            $(".extra_dataTable").remove();
        },
        doExtraEvent: function () {
            const that = this;
            $(".extra_details").unbind();
            //  [弹出框] 点击退出
            $('.extra_details').on('click', '.extra_close', function () {
                $('.extra_details').remove();
            })
            //  [弹出框] 切换
            $('.extra_details').on('click', '.extra_details_body_left_tip', function () {
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
            });
            that.doBasicDisplay();
        },
        doBasicDisplay: function () {
            $('.extra_details_body_main').html(`<div><header>基本信息</header><ul>${Object.keys(this._force).filter(v => !~this._banned.indexOf(v)).map(v => { return `<li><label>${this._fieldAliases[v]}</label><span>${this._force[v]}</span></li>` }).join('')}</ul></div>`);
        },
        doMaintainDisplay: function () {
            $('.extra_details_body_main').html(`<div><header>养护信息</header></div>`);
        },
        doImageDisplay: function () {
            $('.extra_details_body_main').html(`<div><header>图片展示</header><div>${this._formConfig && this._formConfig.img ? this._force.PICTURE.split(';').map(v => `<img src='${Project_ParamConfig.imgHost}/${this._formConfig.img}/${v.toLowerCase().includes('.jpg') ? v : `${v}.jpg`}'/>`).join('') : ''}</div></div>`);
        },
        tableDefault: function () {
            $.fn.dataTable.defaults.fnFormatNumber = function (v) { return v };
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
            const str = `${Object.keys(jsonData[0])
                .map((v) => `${this._fieldAliases[v] || ``},`)
                .join(``)}\n${jsonData
                    .map(
                        (v) =>
                            `${Object.keys(v)
                                .map((d) => `${v[d] || ``}`)
                                .join(`,`)}`
                    )
                    .join(`\n`)}`;
            var link = document.createElement("a");
            var csvContent = "data:text/csv;charset=utf-8,\uFEFF" + str;
            var encodedUri = csvContent;
            console.log(encodedUri.length)
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${this._config.LayerName}-${worksheet}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        exportTable_: function (jsonData, worksheet = +new Date()) {
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
            link.href = uri + window.btoa(unescape(encodeURIComponent(template)));
            //对下载的文件命名
            link.download = `${this._config.LayerName}-${worksheet}.xls`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            
        }
    });
    return L.DCI.DataTables;
});

