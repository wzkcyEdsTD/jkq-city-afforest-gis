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
    "core/dcins",
    "plugins/datatables",
], function (L, extra) {
    L.DCI.DataTables = L.DCI.Layout.extend({
        /**
         * 表格对象
         */
        _table: null,
        _id: null,
        _timestamp:null,
        _data: [],
        _hash: {},
        __fieldAliases: {},
        _force: null,
        _config : null,
        /**
         * 表模板
         */
        _template: `<div class='extra_obj extra_dataTable extra_dataTable_###'><div>
            <h4>%%%</h4>
            <div class="extra_header form-inline">
                <div class="form-group mb-2"><label>街道: </label><input data-info="street" class="form-control"/></div>
                <button class='btn btn-primary extra_dataTable_search'>搜索</button>
                <button class='btn btn-primary extra_dataTable_export'>导出</button>
                <span class="extra_dataTable_close">x<span>
            </div>
            <table id='@@'></table></div>`,
        _detail: `<div class='extra_detail'>
                <header>属性</header>
            </div></div>`,
        /**
         * 过滤字段
         */
        _banned: ["FEATUREGUID","PICTURE"],
        initialize: function (id = 'extra_dataTables', config) {
            //  this._table = $(`#${id}`).DataTables();
            this._id = id;
            this._config = config;
            this._timestamp = + new Date();
            this.tableDefault();
            this.tableEvent();
            this.doTable();
        },
        doTable: function () {
            const template = this._template.replace(/@@/g, this._id).replace(/###/g, this._timestamp).replace(/%%%/g, this._config.FeatureName);
            $(".extra_obj").remove();   // DOM删除 无注销内存
            $("body").append(template);
            this.queryTable();
        },
        queryTable: function () {
            const that = this;
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
            }, "1=1");
        },
        initTable: function (data) {
            this._table = $(`#${this._id}`).dataTable({
                serverSide: false,
                data,
                ordering: true,
                scrollY: 240,
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
        doTransform: function ({ x, y }) {
            const crs = new L.Proj.CRS(Project_ParamConfig.crs.code, Project_ParamConfig.crs.defs);
            return crs.projection.unproject(L.point(x, y));
        },
        tableEvent: function () {
            const that = this;
            //  [表格]   搜索
            $('body').on('click', `.extra_dataTable_${that._timestamp} .extra_dataTable_search`, function () {
                that.queryTable();
            })
            //  [表格] 点击条目
            $('body').on('click', `.extra_dataTable_${that._timestamp} tbody tr`, function () {
                const data = that._hash[that._table.fnGetData(this).OBJECTID];
                //  赋值
                that._force = data.attributes;
                //  定位
                const _geometry = that.doTransform(data.geometry);
                const map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                const hlLayer = map.getLabelLayer();
                hlLayer.clearLayers();
                L.marker(_geometry).addTo(hlLayer);
                L.popup({ maxWidth: 80, offsety:10, className: 'popupLittleUp' })
                    .setLatLng(_geometry)
                    .setContent(`${data.attributes.ADDRESS} - [${data.attributes.ZWM}]`)
                    .openOn(map.map);
                map.map.panTo({ ..._geometry, lat: _geometry.lat - 0.02 });
                
                //  弹框
                $(".extra_details").remove();
                $("body").append(extra);
                that.doBasicDisplay();
            });
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
                }
            })
        },
        doDestroy: function () {
            this._table.api().destroy();
            $(".extra_dataTable").remove();
        },
        doBasicDisplay: function () {
            $('.extra_details_body_main').html(`<div><header>基本信息</header><ul>${Object.keys(this._force).filter(v => !~this._banned.indexOf(v)).map(v => { return `<li><label>${this._fieldAliases[v]}</label><span>${this._force[v]}</span></li>` }).join('')}</ul></div>`);
        },
        doMaintainDisplay: function () {
            $('.extra_details_body_main').html(`<div><header>养护信息</header></div>`);
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
    return L.DCI.DataTables;
});

