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
        _field_ : [],
        _force: null,
        _config: null,
        _formConfig: {},
        _displayFieldName : '',
        _queryResult : null,
        /**
         * 表模板
         */
        _template: `<div class='extra_obj extra_dataTable extra_dataTable_###'><div>
            <h4>%%%<button class='btn btn-primary btn-updown' data-info="on">收起</button></h4>
            <div class="extra_header form-inline">
                @formConfig@
                <button class='btn btn-primary extra_dataTable_export'>导出</button><br />
                <div data-tag='@analyseConfig@'></div>
                <span class="extra_dataTable_close">x<span>
            </div>
            <div class="loading" style="display:none;"><img /></div>
            <table id='@@'></table></div>` ,
        _detail: `<div class='extra_detail'>
                <header>属性</header>
            </div></div>`,
        /**
         * 过滤字段
         */
        _banned: ["OBJECTID_1", "WD", "JD", "CONTENT", "FEATUREGUID", "SHAPE.LEN","PICTURE"],
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
            const _template_ = template.replace(/@formConfig@/g, formConfig?(formConfig.h.map(v => {
                return `<div class="form-group mb-2"><label>${v.n}: </label>${v.t == 'input' ? `<input class="form-control form-data-${v.k}"/>` : `<select class="form-control form-data-${v.k}">${v.v.map(d => `<option value="${d.v}">${d.n}</option>`).join('')}</select>`}</div>`
            }).join('') + (formConfig.h.length ? `<button class='btn btn-primary extra_dataTable_search'>搜索</button>` : ``)) : '');
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
            $(".loading").show();
            arcgisxhr.countArcgisByXhr(`${Url}/${LayerIndex}/query`, ({ count }) => {
                $.fn.dataTable.defaults.oLanguage["sInfo"] = "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项".replace(/_TOTAL_/g, count),
                    arcgisxhr.getArcgisByXhr(`${Url}/${LayerIndex}/query`, ({ displayFieldName, fieldAliases, fields, features }) => {
                    const _hash = {};
                    const data = features.map((v, index) => {
                        for (const d in v.attributes) {
                            !~that._banned.concat(['OBJECTID']).indexOf(d) && typeof v.attributes[d] === 'number' && (v.attributes[d] = parseFloat(v.attributes[d].toFixed(2)));
                        }
                        _hash[v.attributes.OBJECTID] = v;
                        return v.attributes;
                    });
                    that._displayFieldName = displayFieldName;
                    that._fieldAliases = fieldAliases;
                    that._hash = _hash;
                    that._data = features;
                    // !that._table ? that.initTable(data) : that.initDetailTableData(data);
                        !(that._formConfig && that._formConfig.noanalyse) && that.initAnalyze(fields);
                    that.initTable(data);
                    $(".loading").hide();
                }, encodeURIComponent(query || "1=1"));
            }, encodeURIComponent(query || "1=1"));
        },
        doAnalyse: function () {
            /*const [name, nameAlias] = $(".analyse-title").val().split("/");
            const [able, ableAlias] = $(".analyse-able").val().split("/");
            if (!able) return L.dci.app.util.dialog.alert("提示", "无可用统计字段");
            const countJson = {};
            this._data.map(({ attributes }) => {
                const val = attributes[able] ? parseFloat(attributes[able]) : 0;
                const _name_ = name ? (attributes[name] || '其他') : nameAlias;
                !countJson[_name_] && (countJson[_name_] = 0);
                countJson[_name_] += val;
            })
            this.showAnalyse(nameAlias, ableAlias, countJson);*/
            /**
             * 统计分析
             * */
            const [groupByFieldsForStatistics, nameAlias] = $(".analyse-title").val().split("/");
            const [able, ableAlias] = $(".analyse-able").val().split("/");
            const [statisticType, statisticTypeName] = $(".analyse-type").val().split("/");
            if (!groupByFieldsForStatistics || !able) return L.dci.app.util.dialog.alert("提示", "无可用统计字段");
            const outStatistics = JSON.stringify([{ statisticType, outStatisticFieldName: statisticType, onStatisticField: able }]);
            const { Url, LayerIndex } = this._config;
            const arcgisxhr = new L.DCI.ArcgisXhr();
            arcgisxhr.analyseArcgisByXhr(`${Url}/${LayerIndex}/query`, { outStatistics, groupByFieldsForStatistics }, (data) => {
                this.showAnalyse(data.features, { groupByFieldsForStatistics, nameAlias, ableAlias, statisticType, statisticTypeName});
            });
        },
        /**
         * 添加统计分析按钮
         * */
        initAnalyze: function (fields) {
            if (this._fields_) return;
            const analyzeUnit = ["esriFieldTypeDouble", "esriFieldTypeSmallInteger", "esriFieldTypeInteger"];
            const analyseTitleUnit = ["esriFieldTypeString"];
            const analyzeAble = fields.filter(v => ~analyzeUnit.indexOf(v.type) && !v.alias.includes('率') && !v.alias.includes('系数'));
            const analyzeTitle = fields.filter(v => ~analyseTitleUnit.indexOf(v.type));
            $(".extra_header div[data-tag='@analyseConfig@']").html(`
                <div class="form-group mb-2"><label>分类字段: </label>
                    <select class="form-control analyse-title">${[{ name: "", alias: "全部" }].concat(analyzeTitle).map(v => `<option value="${v.name}/${v.alias}">${v.alias}</option>`).join('')}</select>
                </div>
                <div class="form-group mb-2"><label>统计字段: </label>
                    <select class="form-control analyse-able">${analyzeAble.map(v => `<option value="${v.name}/${v.alias}">${v.alias}</option>`).join('')}</select>
                </div>
                <div class="form-group mb-2"><label>统计方式: </label>
                    <select class="form-control analyse-type">
                        <option value='sum/总和'>相加总和</option>
                        <option value='count/数量'>条目数量</option>
                        <option value='avg/平均值'>平均值</option>
                        <option value='max/最大值'>最大值</option>
                        <option value='min/最小值'>最小值</option>
                    </select>
                </div>
                <button class='btn btn-primary extra_dataTable_analyse'>统计分析</button>
            `).addClass('extra_dataTable_analyseFrame');
            this._fields_ = fields;
        },
        initTable: function (data) {
            this._table && this._table.api && this._table.api().destroy();
            this._table = $(`#${this._id}`).dataTable({
                serverSide: false,
                data,
                ordering: true,
                scrollY: 340,
                pageLength : 20,
                scrollX: true,
                bProcessing: true,
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
            table.oApi._fnProcessingDisplay(oSettings, false);
        },
        doTransform: function (geometry) {
            const crs = new L.Proj.CRS(Project_ParamConfig.crs.code, Project_ParamConfig.crs.defs);
            if (geometry.rings) {
                const { rings } = geometry;
                const polygon = rings.map(item => {
                    return item.map(v => {
                        const { lat, lng } = crs.projection.unproject(L.point(v[0], v[1]));
                        return [lat, lng];
                    })
                })
                return { type: 'polygon', geometry: polygon };
            } else if (geometry.paths) {
                const { paths } = geometry;
                const sum = [0, 0];
                const polyline = paths[paths.length - 1].map(v => {
                    const { lat, lng } = crs.projection.unproject(L.point(v[0], v[1]));
                    sum[0] += lat;
                    sum[1] += lng;
                    return [lat, lng];
                })
                const center = [sum[0] / polyline.length, sum[1] / polyline.length];
                return { type: 'polyline', geometry: polyline, center };
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
            //  [表格]   统计分析
            $('body').on('click', `.extra_dataTable_${that._timestamp} .extra_dataTable_analyse`, function () {
                that.doAnalyse();
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
                !(that._formConfig && that._formConfig.nolocate) && arcgisxhr.getArcgisByXhr(`${Url}/${LayerIndex}/query`, ({ features }) => {
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
                        const _path_ = [];
                        let _center_ = null;
                        geometry.map(v => {
                            _path_.push(v[0]);
                            _path_.push(v[Math.floor(v.length / 4 * 1)]);
                            _path_.push(v[Math.floor(v.length / 4 * 2)]);
                            _path_.push(v[Math.floor(v.length / 4 * 3)]);
                            _center_ = L.polygon(v, { color: 'red' }).addTo(hlLayer);
                        })
                        geometry.length > 1 && (_center_ = L.polyline(_path_, { color: 'rgba(0,0,0,0)', width: 1 }).addTo(hlLayer));
                        map.map.fitBounds(_center_.getBounds());
                    } else if (type == 'polyline') {
                        const polyline = L.polyline(geometry, { color: 'red' }).addTo(hlLayer);
                        map.map.fitBounds(polyline.getBounds());
                    }
                }, `OBJECTID=${data.attributes.OBJECTID}`, true);
                //  弹框
                that.showDetails(data);
                !(that._formConfig && that._formConfig.nolocate) && $(".extra_obj").addClass("extra_obj_hidden") && $(".btn-updown").attr("data-info", "off").text("展开")
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
        showAnalyse: function (data, { groupByFieldsForStatistics, nameAlias, ableAlias, statisticType, statisticTypeName }) {
            $(".extra_details").remove();
            $("body").append(extra);
            $(".extra_details_body_main").html(`<table border=1 style="width:100%;"><thead><tr><th>${nameAlias}</th><th>${ableAlias}(${statisticTypeName})</th></tr></thead><tbody>${data.map(v => `<tr><td>${v.attributes[groupByFieldsForStatistics]}</td><td>${v.attributes[statisticType].toFixed(4)}</td></tr>`).join('')}</tbody></table>`);
            this.doExtraEvent();
        },
        showDetails: function (data) {
            const that = this;
            const attributes = {};
            Object.keys(data.attributes).map(item => { attributes[that._fieldAliases[item]] = data.attributes[item] });
            this._queryResult = new L.DCI.QueryResult();
            this._queryResult.showTo('空间查询');
            this._queryResult.load([{ attributes, layerName: that._config.LayerName, displayFieldName: that._displayFieldName, value: data.attributes[that._displayFieldName] }]);
            L.dci.app.util.hideLoadFlash($('.result-list-group-loadflash'));
            setTimeout(() => {
                $(".resultselect-list:nth-child(1) .resultselect-list-view").click();
            }, 0)
        },
        doDestroy: function () {
            this._table && this._table.api && this._table.api().destroy();
            $(".extra_dataTable").remove();
        },
        doExtraEvent: function () {
            $(".extra_details").unbind();
            //  [弹出框] 点击退出
            $('.extra_details').on('click', '.extra_close', function () {
                $('.extra_details').remove();
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
            if (jsonData.length > 2000) {
                return L.dci.app.util.dialog.alert("提示", "该表格最多支持2000条数据导出");
            }
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
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${this._config.LayerName}-${worksheet}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
    });
    return L.DCI.DataTables;
});

