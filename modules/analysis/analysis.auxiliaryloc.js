/**
*辅助选址分析模块类
*@module modules.analysis
*@class DCI.AuxiliaryLoc
*@constructor initialize
*@extends Class
*/
define("analysis/auxiliaryloc", [
    "leaflet",
    'rqtext!../../components/qyxz.vue.html',
    'rqtext!../../components/xzqh.vue.html',
    'rqtext!../../components/ydlx.vue.html',
    "core/dcins",
    "plugins/scrollbar",
    "analysis/gpHandler"
], function (L, qyxz, xzqh, ydlx) {
    L.DCI.AuxiliaryLoc = L.Class.extend({

        /**
        *类ID
        *@property id
        *@type {String}
        */
        id: 'AuxiliaryLoc',

        /**
        *GP请求总数
        *@property _GPTotal
        *@type {number}
        */
        _GPTotal: 1,
        /**
        *GP请求返回数
        *@property _GPDone
        *@type {number}
        */
        _GPDone: 0,
        /**
        *地块领域分析结果
        *@property _GPTotal
        *@type {number}
        */
        _DKNear: {},
        /**
        *结果地块列表
        *@property _GPTotal
        *@type {number}
        */
        _DKConform: [],

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this.getXingzheng();            
        },
        
        /**
        *关闭
        *@method leftClose
        */
        leftClose: function () {
            L.dci.app.pool.remove('AuxiliaryLoc');
        },
        /**
        *获取行政区域
        *@method getXingzheng
        **/
        getXingzheng: function () {
            L.dci.app.services.baseService.getXingzheng({
                context: this,
                success: function (res) {
                    this.xingZheng = null;
                    this.xingZheng = {
                        "district": Project_ParamConfig.xingzhengConfig.xzqh,
                        "towns": [
                        ]
                    };
                    this.xingZheng.towns = res;
                    L.DCI.App.pool.get('LeftContentPanel').show(this, this.buildPanel(this));
                },
                error: function () {
                    L.dci.app.util.dialog.alert("温馨提示", "行政区划信息获取失败，请检查该服务。");
                }
            });
        },


        /**
        *构建面板
        *@method buildPanel
        **/
        buildPanel: function (obj) {

            var _this = obj;
            //alert("调用成功");
            $(".leftcontentpanel-title>span:first").html("辅助选址分析");         //标题
            this.dom = $(".leftcontentpanel-body");
            this.dom.html('');
            this.dom.append(qyxz);
            this.dom.append(xzqh);
            this.dom.append(ydlx);
            //读取配置信息
            alConfig = Project_ParamConfig.auxiliaryLocConfig;
            xzqhConfig = Project_ParamConfig.xingzhengConfig;
            
            var arr2 = this.xingZheng.towns;

            //$.get("components/YDDM.xml", function (xml) {
            //    $(xml).find("item").length;
            //});
            //var xmlUrl = "components/YDDM.xml";
            //var xmlData
            //L.dci.getxml = new L.DCI.GetXml();
            //var xmlData = L.dci.getxml.getXml(xmlUrl);

            var xmlData = '[{"level":1,"mark":"R","name":"居住用地"},{"level":2,"mark":"R1","name":"一类居住用地","parentmark":"R"},{"level":3,"mark":"R11","name":"住宅用地","parentmark":"R1"},{"level":3,"mark":"R12","name":"服务设施用地","parentmark":"R1"},{"level":2,"mark":"R2","name":"二类居住用地","parentmark":"R"},{"level":3,"mark":"R21","name":"住宅用地","parentmark":"R2"},{"level":3,"mark":"R22","name":"服务设施用地","parentmark":"R2"},{"level":2,"mark":"R3","name":"三类居住用地","parentmark":"R"},{"level":3,"mark":"R31","name":"住宅用地","parentmark":"R3"},{"level":3,"mark":"R32","name":"服务设施用地","parentmark":"R3"},{"level":2,"mark":"R5","name":"商住混合用地","parentmark":"R"},{"level":1,"mark":"A","name":"公共管理与公共服务用地"},{"level":2,"mark":"A1","name":"行政办公用地","parentmark":"A"},{"level":2,"mark":"A2","name":"文化设施用地","parentmark":"A"},{"level":3,"mark":"A21","name":"图书展览设施用地","parentmark":"A2"},{"level":3,"mark":"A22","name":"文化活动设施用地","parentmark":"A2"},{"level":2,"mark":"A3","name":"教育科研用地","parentmark":"A"},{"level":3,"mark":"A31","name":"高等院校用地","parentmark":"A3"},{"level":3,"mark":"A32","name":"中等专业学校用地","parentmark":"A3"},{"level":3,"mark":"A33","name":"中小学用地","parentmark":"A3"},{"level":3,"mark":"A34","name":"特殊教育用地","parentmark":"A3"},{"level":3,"mark":"A35","name":"科研用地","parentmark":"A3"},{"level":2,"mark":"A4","name":"体育用地","parentmark":"A"},{"level":3,"mark":"A41","name":"体育场馆用地","parentmark":"A4"},{"level":3,"mark":"A42","name":"体育训练用地","parentmark":"A4"},{"level":2,"mark":"A5","name":"医疗卫生用地","parentmark":"A"},{"level":3,"mark":"A51","name":"医院用地","parentmark":"A5"},{"level":3,"mark":"A52","name":"卫生防疫用地","parentmark":"A5"},{"level":3,"mark":"A53","name":"特殊医疗养用地","parentmark":"A5"},{"level":3,"mark":"A59","name":"其它医疗卫生用地","parentmark":"A5"},{"level":2,"mark":"A6","name":"社会福利设施用地","parentmark":"A"},{"level":2,"mark":"A7","name":"文物古迹用地","parentmark":"A"},{"level":2,"mark":"A8","name":"外事用地","parentmark":"A"},{"level":2,"mark":"A9","name":"宗教设施用地","parentmark":"A"},{"level":1,"mark":"B","name":"商业服务业设施用地"},{"level":2,"mark":"B1","name":"商业设施用地","parentmark":"B"},{"level":3,"mark":"B11","name":"零售商业设施用地","parentmark":"B1"},{"level":3,"mark":"B12","name":"批发市场用地","parentmark":"B1"},{"level":3,"mark":"B13","name":"餐饮用地","parentmark":"B1"},{"level":3,"mark":"B14","name":"旅馆用地","parentmark":"B1"},{"level":2,"mark":"B2","name":"商务设施用地","parentmark":"B"},{"level":3,"mark":"B21","name":"金融保险用地","parentmark":"B2"},{"level":3,"mark":"B22","name":"艺术传媒用地","parentmark":"B2"},{"level":3,"mark":"B29","name":"其它商务设施用地","parentmark":"B2"},{"level":2,"mark":"B3","name":"娱乐康体设施用地","parentmark":"B"},{"level":3,"mark":"B31","name":"娱乐用地","parentmark":"B3"},{"level":3,"mark":"B32","name":"康体用地","parentmark":"B3"},{"level":2,"mark":"B4","name":"公用设施营业网点用地","parentmark":"B"},{"level":3,"mark":"B41","name":"加油加气站用地","parentmark":"B4"},{"level":3,"mark":"B49","name":"其它公用设施营业网点用地","parentmark":"B4"},{"level":2,"mark":"B9","name":"其它服务设施用地","parentmark":"B"},{"level":1,"mark":"M","name":"工业用地"},{"level":2,"mark":"M1","name":"一类工业用地","parentmark":"M"},{"level":2,"mark":"M2","name":"二类工业用地","parentmark":"M"},{"level":2,"mark":"M3","name":"三类工业用地","parentmark":"M"},{"level":1,"mark":"W","name":"物流仓储用地"},{"level":2,"mark":"W1","name":"一类物流仓储用地","parentmark":"W"},{"level":2,"mark":"W2","name":"二类物流仓储用地","parentmark":"W"},{"level":2,"mark":"W3","name":"三类物流仓储用地","parentmark":"W"},{"level":1,"mark":"S","name":"道路与交通设施用地"},{"level":2,"mark":"S1","name":"城市道路用地","parentmark":"S"},{"level":2,"mark":"S2","name":"城市轨道交通用地","parentmark":"S"},{"level":2,"mark":"S3","name":"交通枢纽用地","parentmark":"S"},{"level":2,"mark":"S4","name":"交通场站用地","parentmark":"S"},{"level":3,"mark":"S41","name":"公共交通场站用地","parentmark":"S4"},{"level":3,"mark":"S42","name":"社会停车场用地","parentmark":"S4"},{"level":2,"mark":"S9","name":"其它交通设施用地","parentmark":"S"},{"level":1,"mark":"U","name":"公用设施用地"},{"level":2,"mark":"U1","name":"供应设施用地","parentmark":"U"},{"level":3,"mark":"U11","name":"供水用地","parentmark":"U1"},{"level":3,"mark":"U12","name":"供电用地","parentmark":"U1"},{"level":3,"mark":"U13","name":"供燃气用地","parentmark":"U1"},{"level":3,"mark":"U14","name":"供热用地","parentmark":"U1"},{"level":3,"mark":"U15","name":"通信设施用地","parentmark":"U1"},{"level":3,"mark":"U16","name":"广播电视设施用地","parentmark":"U1"},{"level":2,"mark":"U2","name":"环境设施用地","parentmark":"U"},{"level":3,"mark":"U21","name":"排水设施用地","parentmark":"U2"},{"level":3,"mark":"U22","name":"环卫设施用地","parentmark":"U2"},{"level":3,"mark":"U23","name":"环保设施用地","parentmark":"U2"},{"level":2,"mark":"U3","name":"安全设施用地","parentmark":"U"},{"level":3,"mark":"U31","name":"消防设施用地","parentmark":"U3"},{"level":3,"mark":"U32","name":"防洪设施用地","parentmark":"U3"},{"level":2,"mark":"U9","name":"其它公用设施用地","parentmark":"U"},{"level":1,"mark":"G","name":"绿地与广场用地"},{"level":2,"mark":"G1","name":"公园绿地","parentmark":"G"},{"level":2,"mark":"G2","name":"防护绿地","parentmark":"G"},{"level":2,"mark":"G3","name":"广场用地","parentmark":"G"},{"level":1,"mark":"H","name":"建设用地"},{"level":2,"mark":"H1","name":"城乡居民点建设用地","parentmark":"H"},{"level":3,"mark":"H11","name":"城市建设用地","parentmark":"H1"},{"level":3,"mark":"H12","name":"镇建设用地","parentmark":"H1"},{"level":3,"mark":"H13","name":"乡建设用地","parentmark":"H1"},{"level":3,"mark":"H14","name":"村庄建设用地","parentmark":"H1"},{"level":2,"mark":"H2","name":"区域交通设施用地","parentmark":"H"},{"level":3,"mark":"H21","name":"铁路用地","parentmark":"H2"},{"level":3,"mark":"H22","name":"公路用地","parentmark":"H2"},{"level":3,"mark":"H23","name":"港口用地","parentmark":"H2"},{"level":3,"mark":"H24","name":"机场用地","parentmark":"H2"},{"level":3,"mark":"H25","name":"管道运输用地","parentmark":"H2"},{"level":2,"mark":"H3","name":"区域公用设施用地","parentmark":"H"},{"level":2,"mark":"H4","name":"特殊用地","parentmark":"H"},{"level":3,"mark":"H41","name":"军事用地","parentmark":"H4"},{"level":3,"mark":"H42","name":"安保用地","parentmark":"H4"},{"level":2,"mark":"H5","name":"采矿用地","parentmark":"H"},{"level":2,"mark":"H9","name":"其它建设用地","parentmark":"H"},{"level":1,"mark":"E","name":"非建设用地"},{"level":2,"mark":"E1","name":"水域","parentmark":"E"},{"level":3,"mark":"E11","name":"自然水域","parentmark":"E1"},{"level":3,"mark":"E12","name":"水库","parentmark":"E1"},{"level":3,"mark":"E13","name":"坑塘沟渠","parentmark":"E1"},{"level":2,"mark":"E2","name":"农林用地","parentmark":"E"},{"level":2,"mark":"E9","name":"其它非建设用地","parentmark":"E"}]'

            xmlData = JSON.parse(xmlData)

            var Vue = require("vue");
            
            
            var xzqhTpl = Vue.extend({
                data:function () {
                    return {
                        message: "hello Vue",
                        items: arr2,
                        districtShow: '江阴市',
                        districtValue: '江阴全市域',
                        selecteddistrict:[]
                    }
                },
                template: '#xzqh-template',
                // 在 `methods` 对象中定义方法
                methods: {
                    collapse: function (e) {
                        var btn_active = 'collapsed';
                        var box_selector = '.wz-collapse';
                        var box_active = "active";
                        var href = $(e.target).attr("href");
                        if ($(e.target).hasClass(btn_active)) {
                            $(e.target).removeClass(btn_active);
                            $(href).removeClass(box_active);
                        } else {
                            $(e.target).siblings(".btn").removeClass(btn_active).end().addClass(btn_active);
                            $(href).siblings(box_selector).removeClass(box_active).end().addClass(box_active);
                        }
                    },
                    ctrlClick: function (e) {
                        var targetName = e.target.attributes.name.value;
                        var li_active = 'active';
                        if ($(e.target).hasClass(li_active)) {
                            $(e.target).removeClass(li_active);
                            this.selecteddistrict.splice(jQuery.inArray(targetName, this.selecteddistrict), 1);
                        } else {
                            //行政区划选择修改为单选模式
                            var _this = this;
                            $("#xzqh-Tepl li[level='two']").each(function (index, node) {
                                if ($(node).hasClass(li_active)) {
                                    $(node).removeClass(li_active);
                                    _this.selecteddistrict.splice(jQuery.inArray(node.attributes.name.value, _this.selecteddistrict), 1);
                                }
                            });
                            $("#xzqh-Tepl li[level='one']").each(function (index, node) {
                                if ($(node).hasClass(li_active)) {
                                    $(node).removeClass(li_active);
                                    _this.selecteddistrict.splice(jQuery.inArray(node.attributes.name.value, _this.selecteddistrict), 1);
                                }
                            });
                            //this.selecteddistrict.push(targetName)
                            this.selecteddistrict = [targetName]
                            $(e.target).addClass(li_active);
                        }
                    },
                    deleteDist: function (e) {
                        var li_active = 'active';
                        var targetName = e.target.attributes.name.value;
                        this.selecteddistrict.splice(jQuery.inArray(targetName, this.selecteddistrict), 1);
                        $("#xzqh-Tepl li[name='" + targetName + "']").each(function (index, node) {
                            if ($(node).hasClass(li_active)) {
                                $(node).removeClass(li_active);
                                _this.selecteddistrict.splice(jQuery.inArray(node.attributes.name.value, _this.selecteddistrict), 1);
                            }
                        });
                    }
                }
            });

            var ydlxTpl = Vue.extend({
                data: function () {
                    return {
                        message: "hello Vue",
                        xmlData: xmlData,
                        selectedlx: []
                    }
                },
                template: '#ydlx-template',
                // 在 `methods` 对象中定义方法
                methods: {
                    ydlxCollapse: function (e) {
                        var textContent = e.target.textContent;
                        e.target.textContent = textContent == "+" ? "-" : "+";
                        var mark = e.target.parentNode.parentNode.attributes.mark.value;
                        $(".ydlx-talbe-tbody tr[parentmark='" + mark + "']").each(function (index, node) {
                            var show = node.style.display;
                            if (show == "none") {
                                node.style.display='';
                            } else {
                                node.style.display = 'none';
                                if (node.attributes.class.value == "level2") {
                                    var mark2 = node.attributes.mark.value
                                    $(".ydlx-talbe-tbody tr[parentmark='" + mark2 + "']").each(function (index2, node2) {
                                        var show = node2.style.display;
                                        node2.style.display = 'none';
                                    });
                                }
                            }
                        });
                    },
                    deleteYdlx: function (e) {
                        var name = e.target.attributes.name.value;
                        var _this = this;
                        $.grep(_this.selectedlx, function (cur, i) {
                            if (cur != undefined) {
                                if (name == cur.name) {
                                    _this.selectedlx.splice(i, 1);
                                };
                            }
                        });

                        $(".ydlx-talbe-tbody tr[name='" + name + "']").each(function (index, node) {
                            $(node).children('.td-check').children('input')[0].checked = false;
                        });
                    },
                    ydlxChecked: function (e) {
                        var clickObj = {};
                        if (e.target.localName == "td") {
                            clickObj = e.target.childNodes[0];
                            clickObj.checked = clickObj.checked ? false : true;
                        } else {
                            clickObj = e.target;
                        }
                        var status = clickObj.checked;
                        var mark = clickObj.parentElement.parentElement.attributes.mark.value;
                        var name = clickObj.parentElement.parentElement.attributes.name.value;
                        var level = clickObj.parentElement.parentElement.className

                        var ydlxInfo = { mark: mark, name: name, level: level };
                        var _this = this;
                        if (status) {
                            this.selectedlx.push(ydlxInfo)
                        } else {
                            $.grep(_this.selectedlx, function (cur, i) {
                                if (cur != undefined) {
                                    if (name == cur.name) {
                                        _this.selectedlx.splice(i, 1);
                                    };
                                }
                            });
                        }

                        switch (level) {                            
                            case "level1":
                                $("[parentmark='" + mark + "']").each(function (index, node) {
                                    var nodeStatus = $(node).find('input')[0].checked
                                    if (status != nodeStatus) {
                                        $(node).find('input').click();
                                        var childMark = node.attributes.mark.value;
                                        $("[parentmark='" + childMark + "']").each(function (index2, node2) {
                                            var nodeStatus2 = $(node2).find('input')[0].checked
                                            if (status != nodeStatus2) {
                                                $(node2).find('input').click();
                                            }                                            
                                        });
                                    }                                    
                                });
                                break;
                            case "level2":
                                $("[parentmark='" + mark + "']").each(function (index, node) {
                                    var nodeStatus = $(node).find('input')[0].checked
                                    if (status != nodeStatus) {
                                        $(node).find('input').click();
                                    }
                                });
                                break;
                            default:
                                break;
                        }

                    }
                }
            });



            this.vue = new Vue({
                el: ".Auxiliary",
                data:{                    
                    optdata: alConfig.factor,
                    opttitle: '',
                    optid: '',
                    //查询到的结果地块
                    auxiDks: [],
                    //分页控制，num：每页显示的数量,index：当前页码,all：总页码数,fenyelen：分页模块显示的页码数量上限,fenyestart：起始页面编号
                    fenye:{num:6,index:1,all:0,fenyelen:6,fenyestart:1},
                    //已选中的“更多筛选”条件
                    selectedopt: [],
                    //“更多筛选”条件设施距离，默认2000
                    optdistance: {},
                    //传入本类AuxiliaryLoc，以便调用vue外部函数
                    auxi: _this
                },
                components: {
                    'xzqh-template': xzqhTpl,
                    'ydlx-template': ydlxTpl
                },
                methods: {
                    collapse: function (e) {
                        var btn_active = 'collapsed';
                        var href = $(e.target).attr("href");
                        if ($(e.target).hasClass(btn_active)) {
                            $(e.target).removeClass(btn_active);
                            $(href).removeClass("show");
                            $(href).addClass("hidden");
                        } else {
                            $(e.target).addClass(btn_active);
                            $(href).removeClass("hidden");
                            $(href).addClass("show");
                        }
                    },
                    showCover: function (e) {
                        $(e.target).addClass("selected");
                        this.opttitle = e.target.textContent;
                        this.optid = e.target.attributes.optid.value;
                        if (!this.optdistance[this.optid]) {
                            //Vue.set( object, key, value )
                            Vue.set(this.optdistance, this.optid, this.optdata[this.optid].defaultdistance)
                            //this.optdistance[this.optid] = this.optdata[this.optid].defaultdistance;
                        }
                        $(".lpcover").animate({ left: '0px' }, "slow", function () {
                        });
                    },
                    hideCover: function (e) {
                        $(".lpcover").animate({ left: '-700px' }, "slow", function () {

                        });
                    },
                    //更多条件页，标签选中状态控制，及下方选中条目控制
                    ctrlactive: function (e) {
                        var targetName = e.target.attributes.name.value;

                        var opttitle = $(".lpcover")[0].attributes.opttitle.value;
                        cond_active = 'active'
                        var vue_this = this;
                        var pcname = e.target.parentNode.className;
                        if ($(e.target).hasClass(cond_active)) {
                            $(e.target).removeClass(cond_active);
                            $.grep(vue_this.selectedopt, function (cur, i) {
                                if (cur != undefined) {
                                    if (targetName == cur.selected) {
                                        vue_this.selectedopt.splice(i, 1);
                                    };
                                }
                            });
                        } else {
                            //selectedopt格式
                            //this.selectedopt.push({ title: opttitle, selected: targetName, num: 1 })
                            //$(e.target).addClass(cond_active);
                            
                            switch (pcname) {
                                case "typetop":                                    
                                    break;
                                case "typesec":                                    
                                    break;
                                case "typethir":
                                    //selectedopt格式
                                    this.selectedopt.push({ title: opttitle, selected: targetName, num: 1 })
                                    $(e.target).addClass(cond_active);
                                    //小类点击效果
                                    //移除中类的选择效果
                                    $(".ssyq div[name=" + e.target.attributes.parentname.value + "]").each(function (index, node) {
                                        if ($(node).hasClass(cond_active)) {
                                            $(node).removeClass(cond_active);
                                            $.grep(vue_this.selectedopt, function (cur, i) {
                                                if (cur != undefined) {
                                                    if (node.attributes.name.value == cur.selected) {
                                                        vue_this.selectedopt.splice(i, 1);
                                                    };
                                                }
                                            });
                                        }
                                        //移除大类的选择效果
                                        $(".ssyq div[name=" + node.attributes.parentname.value + "]").each(function (index2, node2) {
                                            if ($(node2).hasClass(cond_active)) {
                                                $(node2).removeClass(cond_active);
                                                $.grep(vue_this.selectedopt, function (cur, i) {
                                                    if (cur != undefined) {
                                                        if (node2.attributes.name.value == cur.selected) {
                                                            vue_this.selectedopt.splice(i, 1);
                                                        };
                                                    }
                                                });                                                
                                            }
                                        });
                                    });
                                    break;
                                default:
                                    break;
                            }
                        }
                    },
                    //总规控规选择
                    ctrlselect: function (e) {
                        btn_select = 'selected'
                        if ($(e.target).hasClass(btn_select)) {
                            $(e.target).removeClass(btn_select);
                            //$(e.target).siblings().addClass(btn_select);
                        } else {
                            var type = e.target.attributes.ghType.value;
                            if (type == "zg") {
                                $(".gdsx").css("display", "none");
                            } else {
                                $(".gdsx").css("display", "");
                            }

                            $(e.target).addClass(btn_select);
                            $(e.target).siblings().removeClass(btn_select);
                        }
                    },
                    //设施等级选择
                    ssdjselect: function (e) {
                        btn_select = 'selected'
                        if ($(e.target).hasClass(btn_select)) {
                            $(e.target).removeClass(btn_select);
                        } else {
                            var distance = e.target.attributes.value.value;
                            Vue.set(this.optdistance, this.optid, distance)

                            $(e.target).addClass(btn_select);
                            $(e.target).siblings().removeClass(btn_select);
                        }
                    },
                    xuanzhi: function (e) {
                        this.auxi.xuanzhi();
                    },
                    pagination: function (e) {
                        var str = e.target.attributes.pageindex.value;
                        if (str == "per") {
                            if (this.fenye.index > 1) {
                                this.fenye.index = this.fenye.index - 1;
                            }
                            
                        } else if (str == "next") {
                            if (this.fenye.index < this.fenye.all) {
                                this.fenye.index = this.fenye.index + 1;
                            }
                        } else {
                            this.fenye.index = parseInt(e.target.attributes.pageindex.value);
                        }                       
                    },
                    dkLoca: function (e) {
                        var map = L.DCI.App.pool.get('map');
                        var dkNum = e.currentTarget.attributes.dknum.value;
                        var _map = map.map;
                        var dkPolygon = this.auxiDks[dkNum];
                        var feature = this.auxi.converToFeatureGroup([dkPolygon.geometry], _map);
                        var center = feature.getBounds().getCenter();
                        _map.setView(center, 3);

                        var dkLayer = map.getHLLayer("dkloc");
                        dkLayer.clearLayers();

                        feature.geometryType = "esriGeometryPolygon";

                        polygonSymbol = {
                            color: '#ff008d',
                            weight: 2,
                            opacity: 0.9,
                            fill: true,
                            fillColor: '#ff008d',
                            fillOpacity: 0.6
                        };
                        feature.setStyle(polygonSymbol);
                        dkLayer.addLayer(feature);

                    }
                },
                computed: {
                    indexs: function () {
                        var left = 1
                        var right = this.fenye.all
                        var ar = []
                        var half = Math.ceil(this.fenye.fenyelen / 2);
                        if (this.fenye.all > this.fenye.fenyelen) {
                            if (this.fenye.index > half && this.fenye.index < this.fenye.all - half + 1) {
                                left = this.fenye.index - half
                                right = this.fenye.index + half-1
                            } else {
                                if (this.fenye.index <= half) {
                                    left = 1
                                    right = this.fenye.fenyelen
                                } else {
                                    right = this.fenye.all
                                    left = this.fenye.all - this.fenye.fenyelen + 1;
                                }
                            }
                        }
                        while (left <= right) {
                            ar.push(left)
                            left++
                        }
                        return ar
                    },
                }
            });
            //只保留行政区域选择，隐藏其他
            $("#QYHZ").css("display", "none");
            $("#FWXSC").css("display", "none");

            //滚动条
            $(".alPanel").mCustomScrollbar({
                theme: "minimal-dark"
            });
            //滚动条
            $(".lpcover").mCustomScrollbar({
                theme: "minimal-dark"
            });

        },
        /**
        *关闭
        *@method leftClose
        */
        leftClose: function () {
            this._alReset();
            L.dci.app.pool.remove('AuxiliaryLoc');
        },

                
        _getParam: function () {
            //选择对象（总规/控规）
            var xzdx = null;
            if ($(".xzdx .selected").length == 0) {
                L.dci.app.util.dialog.alert("温馨提示", "请填写参数“选址对象”");
                return false;
            } else {
                xzdx = $(".xzdx .selected")[0].textContent;
            };
            
            //范围选择（行政区划）
            var fwxz = [];
            if ($(".fwxz .btn-selected").length == 0) {
                L.dci.app.util.dialog.alert("温馨提示", "请填写参数“选址范围”");
                return false;
            } else {
                $(".fwxz .btn-selected").each(function (index, node) {
                    fwxz.push(node.name);
                });
            };
            
            //用地类型
            var ydlx = [];
            if ($(".ydlx .btn-selected").length == 0) {
                L.dci.app.util.dialog.alert("温馨提示", "请填写参数“用地类型”");
                return false;
            } else {
                $(".ydlx .btn-selected").each(function (index, node) {
                    ydlx.push(node.attributes.mark.value);
                });
            };
            
            //选址指标
            var xzzb = {};
                if ($(".ydmj input")[0].value == "") {
                    L.dci.app.util.dialog.alert("温馨提示", "请填写参数“用地面积”");
                    return false;
                } else {
                    xzzb.ydmj = $(".ydmj input")[0].value;
                };
                xzzb.jzmd = [];
                //建筑密度下限
                xzzb.jzmd[0] = $(".jzmd input")[0].value;
                //建筑密度上限
                xzzb.jzmd[1] = $(".jzmd input")[1].value;
                xzzb.ldl = [];
                //绿地率下限
                xzzb.ldl[0] = $(".ldl input")[0].value;
                //绿地率上限
                xzzb.ldl[1] = $(".ldl input")[1].value;
                xzzb.rjl = [];
                //容积率下限
                xzzb.rjl[0] = $(".rjl input")[0].value;
                //容积率上限
                xzzb.rjl[1] = $(".rjl input")[1].value;
            //禁止压盖
            var jzyg = [];
            $(".jzyg input").each(function (index, node) {                
                if (node.checked == true) {
                    var str = node.parentElement.attributes.name.value;
                    jzyg.push(str)
                }
            });

            var jbsxInput = {};
            jbsxInput.xzdx = xzdx;
            jbsxInput.fwxz = fwxz;
            jbsxInput.ydlx = ydlx;
            jbsxInput.xzzb = xzzb;
            jbsxInput.jzyg = jzyg;
            this._jbsxInput = jbsxInput;

            //获取更多筛选参数
            
            var selectedopt = JSON.stringify(this.vue.selectedopt);
            var optdistance = JSON.stringify(this.vue.optdistance);
            var gdsxInput = {};
            gdsxInput.selectedopt = JSON.parse(selectedopt);
            gdsxInput.optdistance = JSON.parse(optdistance);
            this._gdsxInput = gdsxInput
            return true;
        },
        
        
        xuanzhi: function () {   
            //选址前重置筛选结果
            this._alReset();

            if (this._getParam()) {
                //显示loading
                var obj = $('.dkresult');
                this._loading(obj);
                var jbsxInput = this._jbsxInput;
                var gdsxInput = this._gdsxInput;
                var xingzheng_layer = xzqhConfig.xingzheng_layer;

                var xzUrl = xingzheng_layer.url + "/" + xingzheng_layer.layerIndex;
                var field = xingzheng_layer.field;

                var xzQuery = L.esri.Tasks.query(xzUrl);
                var whereArr = field + " in ("

                for (index in jbsxInput.fwxz) {
                    whereArr += "'" + jbsxInput.fwxz[index] + "',"
                }
                whereArr = whereArr.substring(0, whereArr.length - 1);
                whereArr += ")";

                xzQuery.where(whereArr);
                xzQuery.fields("*");
                xzQuery.params.outSr = xingzheng_layer.sr;
                xzQuery.run(function (error, featureCollection, response) {
                    //this._regionUnion(response);
                    var xzGeometry = response.features[0].geometry;
                    var xzHlGeometry = xzGeometry;
                    for (var i = 1; i < response.features.length; i++) {
                        xzHlGeometry.rings.push(response.features[i].geometry.rings[0]);
                        //xzGeometry.rings[0] = xzGeometry.rings[0].concat(response.features[i].geometry.rings[0]);
                    }
                    this.map = L.DCI.App.pool.get('map');
                    var feature = this.converToFeatureGroup([xzHlGeometry], this.map.map);

                    feature.geometryType = "esriGeometryPolygon";

                    var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                    var HLLayer = map.getHLLayer("auxiXzqh");
                    HLLayer.clearLayers("auxiXzqh");

                    polygonSymbol = {
                        color: '#ff5f00',
                        weight: 1,
                        opacity: 0.8,
                        fill: false,
                    };
                    feature.setStyle(polygonSymbol);

                    HLLayer.addLayer(feature);

                    jbsxInput.xzGeometry = xzHlGeometry;

                    if (gdsxInput.selectedopt.length == 0) {
                        this._startXuanzhi(jbsxInput);
                    } else {
                        this._Siteselection(jbsxInput, gdsxInput);
                    }
                }, this);
            }        
        },


        _loading: function (obj) {
            if (obj.find('.loadingblock').length != 0) {
                obj.find('.loadingblock').show();
            }else{
                var html = '<div class="loadingblock"><div class="loadingFlash"><span class="icon-loading"></span></div></div>'
                obj.prepend(html)
                obj.find('.loadingblock').show();
            }
            
        },
        _loaded:function(obj){
            obj.find('.loadingblock').hide();
        },

        converToFeatureGroup: function (geometries, map) {
            var geos = geometries;
            var polygons = [];
            for (var i in geos) {
                var geo = geos[i].rings;
                for (var j in geo) {
                    var latlngs = [];
                    var ring = geo[j];
                    for (var k in ring) {
                        latlngs.push(map.options.crs.projection.unproject(L.point(ring[k])));
                    }
                    var plygon = L.polygon(latlngs);
                    polygons.push(plygon);
                }
            }
            return L.featureGroup(polygons);
        },

        _startXuanzhi: function (jbsxInput) {
            var jbsxcs = alConfig.jbsx;
            if (jbsxInput.xzdx == "总规") {
                var xzlx = "zg";
            } else {
                var xzlx = "kg";
            }
            var url = jbsxcs[xzlx].url + "/" + jbsxcs[xzlx].layerIndex;
            var ydmj = jbsxcs[xzlx].ydmj;
            var jzmdsx = jbsxcs[xzlx].jzmdsx;
            var rjlsx = jbsxcs[xzlx].rjlsx;
            var ldlxx = jbsxcs[xzlx].ldlxx;
            var jzgdsx = jbsxcs[xzlx].jzgdsx;
            var ydlx = jbsxcs[xzlx].ydlx;
            var filedType = jbsxcs[xzlx].filedType;

            var auxiQuery = L.esri.Tasks.query(url);
            //构建Where 查询语句 arr
            var arr = "";
            arr = ydmj + " > " + (jbsxInput.xzzb.ydmj == "" ? "0" : jbsxInput.xzzb.ydmj);
            //字段类型若为字符型，则需要进行转换cast( *** as int)
            if (filedType == "number") {
                arr += " and (" + rjlsx + " between " + (jbsxInput.xzzb.rjl[0] == '' ? "0" : jbsxInput.xzzb.rjl[0]) + " and " + (jbsxInput.xzzb.rjl[1] == '' ? "10" : jbsxInput.xzzb.rjl[1]) + ") and ("
                + ldlxx + " between " + (jbsxInput.xzzb.ldl[0] == '' ? "0" : jbsxInput.xzzb.ldl[0]) + " and " + (jbsxInput.xzzb.ldl[1] == '' ? "100" : jbsxInput.xzzb.ldl[1]) + ") and ("
                + jzmdsx + " between " + (jbsxInput.xzzb.jzmd[0] == '' ? "0" : jbsxInput.xzzb.jzmd[0]) + " and " + (jbsxInput.xzzb.jzmd[1] == '' ? "100" : jbsxInput.xzzb.jzmd[1]) + ")";
            } else {
                arr +=" and ( cast(" + rjlsx + " as int) between " + (jbsxInput.xzzb.rjl[0] == '' ? "0" : jbsxInput.xzzb.rjl[0]) + " and " + (jbsxInput.xzzb.rjl[1] == '' ? "10" : jbsxInput.xzzb.rjl[1]) + ") and ("
                +" cast("+ ldlxx + " as int) between " + (jbsxInput.xzzb.ldl[0] == '' ? "0" : jbsxInput.xzzb.ldl[0]) + " and " + (jbsxInput.xzzb.ldl[1] == '' ? "100" : jbsxInput.xzzb.ldl[1]) + ") and ("
                +" cast("+ jzmdsx + " as int) between " + (jbsxInput.xzzb.jzmd[0] == '' ? "0" : jbsxInput.xzzb.jzmd[0]) + " and " + (jbsxInput.xzzb.jzmd[1] == '' ? "100" : jbsxInput.xzzb.jzmd[1]) + ")";
            }

            arr += "and " + ydlx + " in("
            for (index in jbsxInput.ydlx) {
                arr += "'" + jbsxInput.ydlx[index] + "',"
            }
            arr = arr.substring(0, arr.length - 1);
            arr += ")";

            auxiQuery.where(arr);
            auxiQuery.fields("*");

            var coordinates = jbsxInput.xzGeometry.rings;
            for (var j = 0; j < jbsxInput.xzGeometry.rings.length; j++) {
                coordinates[j] = jbsxInput.xzGeometry.rings[j];
                for (var i = 0; i < coordinates[j].length; i++) {
                    var cache = coordinates[j][i][0];
                    coordinates[j][i][0] = coordinates[j][i][1];
                    coordinates[j][i][1] = cache;
                }
            }
            
            var lay = L.polygon(coordinates);

            auxiQuery.within(lay);
            auxiQuery.params.outSr = auxiQuery.params.inSr = xzqhConfig.xingzheng_layer.sr;
            auxiQuery.run(function (error, featureCollection, response) {
                if (error) {
                    L.dci.app.util.dialog.alert("温馨提示", "查询未完成。 Code：" + error.code);
                } else {
                    var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                    var HLLayer = map.getHLLayer("auxiliaryloc");
                    map.clearHLLayer("buffdk");
                    map.clearHLLayer("dkloc");
                    map.clearHLLayer("auxiliaryloc");
                    this.vue.auxiDks = response.features;

                    this.vue.fenye.all = Math.ceil(response.features.length / this.vue.fenye.num);//向上取整

                    if (response.features.length == 0) {
                        L.dci.app.util.dialog.alert("温馨提示", "未找到符合要求地块")
                        var obj = $('.dkresult');
                        this._loaded(obj);
                        return;
                    }                    


                    var auxiGeometry = {};
                    auxiGeometry.rings = [];
                    for (var i = 0; i < response.features.length; i++) {
                        auxiGeometry.rings.push(response.features[i].geometry.rings[0]);
                    }
                    this.map = L.DCI.App.pool.get('map');
                    var feature = this.converToFeatureGroup([auxiGeometry], this.map.map);

                    feature.geometryType = "esriGeometryPolygon";

                    polygonSymbol = {
                        color: '#64c8ff',
                        weight: 1,
                        opacity: 0.8,
                        fill: true,
                        fillColor: '#65c8ff',
                        fillOpacity: 0.5
                    };
                    feature.setStyle(polygonSymbol);

                    HLLayer.addLayer(feature);
                    //this._bufferDk(response);
                    var obj = $('.dkresult');
                    this._loaded(obj);
                }
            }, this);
        },

        _Siteselection: function (jbsxInput, gdsxInput) {
            this._DKConform = [];
            this._DKNear = [];
            //基本筛选参数
            var jbsxcs = alConfig.jbsx;
            //更多筛选参数
            var gdsxcs = alConfig.gdsx;
            if (jbsxInput.xzdx == "总规") {
                var xzlx = "zg";
            } else {
                var xzlx = "kg";
            }
            //var url = jbsxcs[xzlx].url + "/" + jbsxcs[xzlx].layerIndex;
            var ydmj = jbsxcs[xzlx].ydmj;
            var jzmdsx = jbsxcs[xzlx].jzmdsx;
            var rjlsx = jbsxcs[xzlx].rjlsx;
            var ldlxx = jbsxcs[xzlx].ldlxx;
            var jzgdsx = jbsxcs[xzlx].jzgdsx;
            var ydlx = jbsxcs[xzlx].ydlx;
            var filedType = jbsxcs[xzlx].filedType;

            //构建Where 查询语句 arr
            var arr = "";
            arr = ydmj + " > " + (jbsxInput.xzzb.ydmj == "" ? "0" : jbsxInput.xzzb.ydmj);
            //字段类型若为字符型，则需要进行转换cast( *** as int)
            if (filedType == "number") {
                arr += " and (" + rjlsx + " between " + (jbsxInput.xzzb.rjl[0] == '' ? "0" : jbsxInput.xzzb.rjl[0]) + " and " + (jbsxInput.xzzb.rjl[1] == '' ? "10" : jbsxInput.xzzb.rjl[1]) + ") and ("
                + ldlxx + " between " + (jbsxInput.xzzb.ldl[0] == '' ? "0" : jbsxInput.xzzb.ldl[0]) + " and " + (jbsxInput.xzzb.ldl[1] == '' ? "100" : jbsxInput.xzzb.ldl[1]) + ") and ("
                + jzmdsx + " between " + (jbsxInput.xzzb.jzmd[0] == '' ? "0" : jbsxInput.xzzb.jzmd[0]) + " and " + (jbsxInput.xzzb.jzmd[1] == '' ? "100" : jbsxInput.xzzb.jzmd[1]) + ")";
            } else {
                arr += " and ( cast(" + rjlsx + " as int) between " + (jbsxInput.xzzb.rjl[0] == '' ? "0" : jbsxInput.xzzb.rjl[0]) + " and " + (jbsxInput.xzzb.rjl[1] == '' ? "10" : jbsxInput.xzzb.rjl[1]) + ") and ("
                + " cast(" + ldlxx + " as int) between " + (jbsxInput.xzzb.ldl[0] == '' ? "0" : jbsxInput.xzzb.ldl[0]) + " and " + (jbsxInput.xzzb.ldl[1] == '' ? "100" : jbsxInput.xzzb.ldl[1]) + ") and ("
                + " cast(" + jzmdsx + " as int) between " + (jbsxInput.xzzb.jzmd[0] == '' ? "0" : jbsxInput.xzzb.jzmd[0]) + " and " + (jbsxInput.xzzb.jzmd[1] == '' ? "100" : jbsxInput.xzzb.jzmd[1]) + ")";
            }

            arr += "and " + ydlx + " in("
            for (index in jbsxInput.ydlx) {
                arr += "'" + jbsxInput.ydlx[index] + "',"
            }
            arr = arr.substring(0, arr.length - 1);
            arr += ")";


            var coordinates = jbsxInput.xzGeometry.rings;
            //for (var j = 0; j < jbsxInput.xzGeometry.rings.length; j++) {
            //    coordinates[j] = jbsxInput.xzGeometry.rings[j];
            //    for (var i = 0; i < coordinates[j].length; i++) {
            //        var cache = coordinates[j][i][0];
            //        coordinates[j][i][0] = coordinates[j][i][1];
            //        coordinates[j][i][1] = cache;
            //    }
            //}

            var lay = L.polygon(coordinates);
            
            var gpurl = gdsxcs.gpservice.gpurl;
            var inputParams = gdsxcs.gpservice.inputParams;
            var outParams = gdsxcs.gpservice.outParams;
            //设置查询区域参数
            var featureSet = new L.DCI.FeatureSet();
            featureSet.features = [lay];
            inputParams.Region = featureSet;
            inputParams.DK_Expression = arr;

            var inPar = {};
            this._GPTotal = 0;
            this._GPDone = 0;
            for (var type in gdsxInput.optdistance) {
                this._GPTotal++;
                inPar[type] = {};
                //根据总规、控规读取相应要素类名称
                inPar[type].GHDK = alConfig.jbsx[xzlx].featureclass;
                inPar[type].SXTJ = alConfig.factor[type].featureclass;
                inPar[type].OBJECTID_Field = inputParams.OBJECTID_Field;
                inPar[type].NAME_Field = alConfig.factor[type].searchfield;
                inPar[type].Region = inputParams.Region;
                inPar[type].DK_Expression = inputParams.DK_Expression;

                var _distance = gdsxInput.optdistance[type];
                inPar[type].SearchRadius = '{ "distance": ' + _distance + ',"units": "esriMeters"}';
                var title = alConfig.factor[type].name;
                inPar[type].GD_Expression = ''
                for (var k = 0; k < gdsxInput.selectedopt.length; k++) {
                    if (title == gdsxInput.selectedopt[k].title) {
                        inPar[type].GD_Expression += "'" + gdsxInput.selectedopt[k].selected + "',"
                    }
                }
                inPar[type].GD_Expression = alConfig.factor[type].searchfield + "  in(" + inPar[type].GD_Expression;
                inPar[type].GD_Expression = inPar[type].GD_Expression.substring(0, inPar[type].GD_Expression.length - 1);
                inPar[type].GD_Expression += ")";

                this.getService(gpurl, inPar[type], outParams);
            }



        },

        _startXuanzhi2: function (dklist) {
            var jbsxInput = this._jbsxInput
            var jbsxcs = alConfig.jbsx;
            if (jbsxInput.xzdx == "总规") {
                var xzlx = "zg";
            } else {
                var xzlx = "kg";
            }
            var url = jbsxcs[xzlx].url + "/" + jbsxcs[xzlx].layerIndex;
            var objectid = jbsxcs[xzlx].objectid

            var auxiQuery = L.esri.Tasks.query(url);
            //构建Where 查询语句 arr
            var arr = "";
            arr = objectid + " in ("
            for (item in dklist) {
                arr += "'" + dklist[item] + "',"
            }
            arr = arr.substring(0, arr.length - 1);
            arr += ")";

            auxiQuery.where(arr);
            auxiQuery.fields("*");

            //var coordinates = jbsxInput.xzGeometry.rings;
            ////for (var j = 0; j < jbsxInput.xzGeometry.rings.length; j++) {
            ////    coordinates[j] = jbsxInput.xzGeometry.rings[j];
            ////    for (var i = 0; i < coordinates[j].length; i++) {
            ////        var cache = coordinates[j][i][0];
            ////        coordinates[j][i][0] = coordinates[j][i][1];
            ////        coordinates[j][i][1] = cache;
            ////    }
            ////}

            //var lay = L.polygon(coordinates);

            //auxiQuery.within(lay);
            auxiQuery.params.outSr = auxiQuery.params.inSr = xzqhConfig.xingzheng_layer.sr;
            auxiQuery.run(function (error, featureCollection, response) {
                if (error) {
                    L.dci.app.util.dialog.alert("温馨提示", "查询未完成。 Code：" + error.code);
                    var obj = $('.dkresult');
                    this._loaded(obj);
                } else {
                    var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                    var HLLayer = map.getHLLayer("auxiliaryloc");
                    map.clearHLLayer("buffdk");
                    map.clearHLLayer("dkloc");
                    map.clearHLLayer("auxiliaryloc");
                    this.vue.auxiDks = response.features;

                    this.vue.fenye.all = Math.ceil(response.features.length / this.vue.fenye.num);//向上取整

                    if (response.features.length == 0) {
                        L.dci.app.util.dialog.alert("温馨提示", "未找到符合要求地块")
                        var obj = $('.dkresult');
                        this._loaded(obj);
                        return;
                    }


                    var auxiGeometry = {};
                    auxiGeometry.rings = [];
                    for (var i = 0; i < response.features.length; i++) {
                        auxiGeometry.rings.push(response.features[i].geometry.rings[0]);
                    }
                    this.map = L.DCI.App.pool.get('map');
                    var feature = this.converToFeatureGroup([auxiGeometry], this.map.map);

                    feature.geometryType = "esriGeometryPolygon";

                    polygonSymbol = {
                        color: '#64c8ff',
                        weight: 1,
                        opacity: 0.8,
                        fill: true,
                        fillColor: '#65c8ff',
                        fillOpacity: 0.5
                    };
                    feature.setStyle(polygonSymbol);

                    HLLayer.addLayer(feature);
                    //this._bufferDk(response);
                    var obj = $('.dkresult');
                    this._loaded(obj);
                }
            }, this);
        },

        _alReset: function () {
            //选址前清空上一次选址结果
            this.vue.auxiDks = [];
            this.vue.fenye.index = 1;
            this.vue.fenye.all = 1;
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            map.clearHLLayer("buffdk");
            map.clearHLLayer("dkloc");
            map.clearHLLayer("auxiXzqh");
            map.clearHLLayer("auxiliaryloc");
        },

        /**
        *请求GP服务
        *@method getService
        *@private
        */
        getService: function (url, inputParams, outParams) {
            var gp = new L.DCI.GPHandler();
            gp.GPHandler(url,inputParams,outParams,
                $.proxy(this.returnGPData, this),
                $.proxy(this.resultImageLayerHandler, this),
                $.proxy(this.errorHandler, this));
        },
        /**
        *处理返回的GP结果
        *@method returnGPData
        *@param res{Object} Json格式结果
        *@private
        */
        returnGPData: function (res) {
            //隐藏正在加载
            this._GPDone += 1;
            var value = res.value;
            if (value == "[]" || value == "]" || value == null) {
                //L.dci.app.util.dialog.alert("温馨提示", "没有查询结果");
            } else {                
                for (var dk in value) {
                    if (this._DKNear[dk]) {
                        this._DKNear[dk] = $.extend(this._DKNear[dk], value[dk])
                    } else {
                        this._DKNear[dk] = value[dk]
                    }
                }
                
                if (this._GPDone == this._GPTotal) {
                    for (var dk in this._DKNear) {
                        this._DKConform.push(dk);
                    }
                    //根据更多筛选要求筛选地块
                    for (var j = 0; j < this.vue.selectedopt.length; j++) {
                        var ssname = this.vue.selectedopt[j].selected
                        for (var dk in this._DKNear) {
                            if (this._DKNear[dk][ssname] < this.vue.selectedopt[j].num) {
                                L.dci.app.util.arrayRemove(this._DKConform, dk)
                            }
                        }
                    }
                    if (this._DKConform.length == 0) {
                        L.dci.app.util.dialog.alert("温馨提示", "没有符合要求的地块");
                        var obj = $('.dkresult');
                        this._loaded(obj);
                    } else {
                        this._startXuanzhi2(this._DKConform);
                    }                    
                }
            }
        },



        /**
        *返回的GP图片信息
        *@method resultImageLayerHandler
        *@private
        */
        resultImageLayerHandler: function () {
            //alert("GP2");
        },
        /**
        *返回的错误信息
        *@method errorHandler
        *@private
        */
        errorHandler: function () {
            //隐藏正在加载
            L.dci.app.util.dialog.alert("温馨提示", "查询错误");
        },

        _regionUnion: function (response) {
            var geom = response.features;
            var obj = { "geometryType": "esriGeometryPolygon", "geometries": [], "attributes": [] };
            for (var j = 0; j < geom.length; j++) {
                obj.geometries.push(geom[j].geometry);
                obj.attributes.push(geom[j].attributes);
            }
            var param = {
                geometries:null,
                sr: xzqhConfig.xingzheng_layer.sr,
            };
            param.geometries = JSON.stringify(obj);

            L.esri.post(alConfig.unionUrl, param,
                function (error, response) {
                    if (error) {
                        console.log(error);
                    } else {
                        //console.log(response.name);
                        var jbsxInput = this._jbsxInput;
                        var gdsxInput = this._gdsxInput;
                        var xzGeometry = response.geometry;
                        var xzHlGeometry = xzGeometry;
                        this.map = L.DCI.App.pool.get('map');
                        var feature = this.converToFeatureGroup([xzHlGeometry], this.map.map);

                        feature.geometryType = "esriGeometryPolygon";

                        var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                        var HLLayer = map.getHLLayer("auxiXzqh");
                        HLLayer.clearLayers("auxiXzqh");

                        polygonSymbol = {
                            color: '#ff5f00',
                            weight: 1,
                            opacity: 0.8,
                            fill: false,
                        };
                        feature.setStyle(polygonSymbol);

                        HLLayer.addLayer(feature);

                        jbsxInput.xzGeometry = xzHlGeometry;

                        if (gdsxInput.selectedopt.length == 0) {
                            this._startXuanzhi(jbsxInput);
                        } else {
                            this._Siteselection(jbsxInput, gdsxInput);
                        }

                    }
                },this);
        },

    });
    return L.DCI.AuxiliaryLoc;
});