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
        /**
         * 表模板
         */
        _template: `<div class='extra_obj extra_query extra_query_###'><div>
            <h4>数据搜索</h4>
               <div class="extra_header form-inline">
                <div class="form-group mb-3"><label>类型: </label><select class="form-control">
                    <option selected>公园绿地</option>
                    <option>道路绿地</option>
                    <option>古木名树</option>
                    <option>地名地址</option>
                </select></div>
                <div class="form-group mb-3"><label>名称搜索: </label><input data-info="street" class="form-control"/></div>
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
            arcgisxhr.getArcgisByXhr("http://192.168.0.158:6080/arcgis/rest/services/YLGIS/ZHYL/MapServer/0/query", ({ fieldAliases, features }) => {
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
                const _geometry = { lat: data.geometry.y, lng: data.geometry.x }
                const map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                const hlLayer = map.getLabelLayer();
                hlLayer.clearLayers();
                L.marker(_geometry).addTo(hlLayer);
                L.popup({ maxWidth: 80, offsety: 10, className: 'popupLittleUp' })
                    .setLatLng(_geometry)
                    .setContent(`${data.attributes.ADDRESS} - [${data.attributes.ZWM}]`)
                    .openOn(map.map);
                map.map.panTo({ ..._geometry, lat: data.geometry.y - 0.02 });

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
                }
            })
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
    });
    return L.DCI.ExtraQuery;
});

