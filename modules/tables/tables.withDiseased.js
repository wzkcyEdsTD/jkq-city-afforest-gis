/**
 * 表格
 * @author eds
 * @public
 * @requires jquery.dataTables.min
 * @name extratables
 */

define("tables/withDiseased", [
    "leaflet",
    'rqtext!../../components/extra.html',
    "core/dcins",
    "plugins/datatables",
], function (L, extra) {
        L.DCI.WithDiseased = L.DCI.Layout.extend({
        /**
         * 表格对象集
         */
        _table: null,
        _id: null,
        _timestamp: null,
        _data: [],
        _hash: {},
        _fieldAliases: {},
        _force: null,
        _config: null,
        _resourceId: 1986,
        /**
         * 表模板
         */
        _template: `<div class='extra_obj extra_withDiseased extra_withDiseased_###'><div>
            <h4>病虫害</h4>
               <div class="extra_header form-inline">
                <div class="form-group mb-3"><label>病虫害名称: </label><input class="form-control diseasedName"/></div>
                <button class='btn btn-primary extra_withDiseased_search'>搜索</button>
                <button class='btn btn-primary extra_withDiseased_export'>导出</button>
                <span class="extra_withDiseased_close">x<span>
            </div>
            <table id='@@'></table></div>`,
        _detail: `<div class='extra_detail'>
                <header>属性</header>
            </div></div>`,
        /**
         * 过滤字段
         */
            _banned: ["ESRI_OID", "PIC"],
        initialize: function (id = 'extra_withDiseaseds') {
            //  this._table = $(`#${id}`).DataTables();
            this._id = id;
            this._timestamp = + new Date();
            this.tableDefault();
            this.tableEvent();
            this.doTable();
        },
        doTable: function () {
            const template = this._template.replace(/@@/g, this._id).replace(/###/g, this._timestamp);
            $(".extra_details").remove();
            $(".extra_obj").remove();   // DOM删除 无注销内存
            $("body").append(template);
            this.queryTable();
        },
        queryTable: function () {
            const that = this;
            const arcgisxhr = new L.DCI.ArcgisXhr();
            const id = 1986;
            L.dci.app.services.baseService.getFeatureLayerById({
                id,
                context: that,
                success: function (res) {
                    if (res != "0" && res.length > 0) {
                        const isNew = that._config && that._config.FeatureName == res[0].FeatureName ? false : true;
                        that._config = res[0];
                        const { Url, LayerIndex } = that._config;
                        const diseasedName = $('.diseasedName').val().trim();
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
                                $('.extra_withDiseased').append(`<table id='${that._id}'></table>`);
                                that.initTable(data)
                            } else {
                                that.initDetailTableData(data);
                            }
                        }, !diseasedName ? "1=1" : encodeURIComponent(`MC like '%${diseasedName}%'`));
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
                scrollY: 340,
                pageLength: 20,
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
            $('body').on('click', `.extra_withDiseased_${that._timestamp} .extra_withDiseased_search`, function () {
                that.queryTable();
            })
            //  [表格]   点击退出
            $('body').on('click', `.extra_withDiseased_${that._timestamp} .extra_withDiseased_close`, function () {
                that._table.api().destroy();
                $(".extra_withDiseased").remove();
            })
            //  [表格]   点击导出
            $('body').on('click', `.extra_withDiseased_${that._timestamp} .extra_withDiseased_export`, function () {
                that.exportTable(that._data.map((v) => {
                    that._hash[v.attributes.OBJECTID] = v;
                    return v.attributes;
                }))
            })
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
        return L.DCI.WithDiseased;
});

