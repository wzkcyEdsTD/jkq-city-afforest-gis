/**
*用地平衡、用地强度预处理
*@module modules.analysis
*@class DCI.AutoGP
*@constructor initialize
*@extends Class
*/
define("analysis/autogp", [
    "leaflet",
    "core/dcins",
    "plugins/scrollbar",
    "analysis/gpHandler"
], function (L) {
    L.DCI.AutoGP = L.Class.extend({
        /**
        *类ID
        *@property id
        *@type {String}
        */
        id: 'AutoGP',
        /**
        *预处理结果
        *@property presult
        *@type {Array}
        */
        presult: [],

        /**
        *行政区划图形
        *@property Area
        *@type {Array}
        */
        Area: [],

        num: 0,

        sendNum:0,

        GPtype: "lb",
        SecGPtype: "lst",

        _getfirst: false,
        _getSec: false,

        _Ado:false,

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            var week = new Date().getDay();
            //仅在星期一执行预处理
            if (week == 1) {
                var doPre = Project_ParamConfig.LandPre.doPre;
                if (doPre) {

                    L.dci.app.services.baseService.whetherPre({
                        context: this,
                        success: function (yn) {
                            if (yn) {
                                this._getfirst = true;
                            }
                            this.whetherSecPre();
                        },
                        error: function () {
                            //报错则不执行任何操作，静默
                        }
                    });

                }
            }            
        },
        /**
       *判断是否执行第二类分析功能的预处理
       *@method whetherSecPre
       */
        whetherSecPre: function () {
            //Sec
            L.dci.app.services.baseService.whetherSecPre({
                context: this,
                success: function (yn) {
                    if (yn) {
                        this._getSec = true;
                    }
                    if (this._getSec || this._getfirst) {
                        this.getDivisions();
                    }                    
                },
                error: function () {
                    //报错则不执行任何操作，静默
                }
            });
        },


        /**
       *获取行政区划信息
       *@method getDivisions
       */
        getDivisions: function () {
            _this = this;
            L.dci.app.services.baseService.getXingzheng({

                success: function (res) {
                    for (var rn in res) {
                        _this.presult.push({ name: res[rn].RegionName, region: '', landb_result: '', lands_result: '', landst_result: '', landpu_result: '', });
                    }
                    _this.presult.push({ name: Project_ParamConfig.xingzhengConfig.xingzheng_layer.districtValue, region: '', landb_result: '', lands_result: '', landst_result: '', landpu_result: '', });
                    //一、获取完毕行政区划信息后，再开始执行行政区划边界查询操作
                    _this.doPre();                    
                    
                },
                error: function () {
                    L.DCI.app.util.dialog.alert("温馨提示", "行政区划信息获取失败，请检查该服务。");
                }
            });
        },

        createXMLDoc:function() {
          try //Internet Explorer
            {
            var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        }catch(e) {
            try //Firefox, Mozilla, Opera, etc.
        {
              var xmlDoc = document.implementation.createDocument("","",null);
        } catch(e) {
            alert(e.message)
        }
        }
        return xmlDoc;
        },
        serializeXMLDoc:function(doc) {
            var text;
            try {
                text = (new XMLSerializer()).serializeToString(doc);
            } catch(e) {
                text = doc.xml;
            }
            return text;
        },



        /**
       *执行用地平衡分析预处理
       *@method doPre
       */
        doPre: function () {
            var _this = this;
            var url = Project_ParamConfig.xingzhengConfig.xingzheng_layer.url;
            var field = Project_ParamConfig.xingzhengConfig.xingzheng_layer.field;
            var text = this.presult[this.num].name;
            var layerIndex = "1";

            var find = new L.esri.Tasks.find(url);
            find.layers(layerIndex).text(text).fields(field);
            find.params.sr = Project_ParamConfig.xingzhengConfig.xingzheng_layer.sr;
            find.run(function (error, featureCollection, response) {
                if (error) {
                    _this.num++;
                    if (_this.num == _this.presult.length - 1) {
                        _this.num = 0;
                        _this.getService();
                        //L.dci.app.util.dialog.alert("温馨提示", "区域查询完成");
                    } else
                        _this.doPre();
                    //L.dci.app.util.dialog.alert("代码:" + error.code, "详情:" + error.message);
                } else {
                    if (featureCollection != null) {
                        var feature = featureCollection.features[0];

                        var coordinates = feature.geometry.coordinates;
                        for (var i = 0; i < coordinates[0].length; i++) {
                            var cache = coordinates[0][i][0];
                            coordinates[0][i][0] = coordinates[0][i][1];
                            coordinates[0][i][1] = cache;
                        }
                        var lay = L.polygon(coordinates);

                        var featureSet = new L.DCI.FeatureSet();
                        featureSet.features = [lay];
                        _this.presult[_this.num].region = featureSet;

                    } else {
                        L.dci.app.util.dialog.alert("温馨提示", "没有区域查询结果");
                    }
                    _this.num++;
                    if (_this.num == _this.presult.length) {
                        _this.num = 0;
                        //二、查询完毕所有行政区划的边界并储存，然后开始依次执行用地平衡分析操作；                        
                        if (_this._getfirst) {
                            _this._Ado = false;
                            _this._getService();
                        }else if(_this._getSec){
                            _this._getSecService();
                        }; 
                        //L.dci.app.util.dialog.alert("温馨提示", "区域查询完成");
                    } else
                        _this.doPre();
                }
            });
        },
               
        /**
        *请求GP服务
        *@method getService
        *@param type{string} 执行GP分析类型
        *@private
        */
        _getService: function () {
            var type = this.GPtype;
            if (type == "lb") {
                Project_ParamConfig.ydphfxConfig.inputParams.In_region = this.presult[this.num].region;
                var url = Project_ParamConfig.ydphfxConfig.url;
                var gp = new L.DCI.GPHandler();
                gp.GPHandler(url, Project_ParamConfig.ydphfxConfig.inputParams, Project_ParamConfig.ydphfxConfig.outParams, $.proxy(this.returnGPData, this), $.proxy(this.resultImageLayerHandler, this), $.proxy(this.errorHandler, this));
            } else if (type == "ls") {
                Project_ParamConfig.ydkfqdpjConfig.inputParams.In_region = this.presult[this.num].region;
                var url = Project_ParamConfig.ydkfqdpjConfig.url;
                var gp = new L.DCI.GPHandler();
                gp.GPHandler(url, Project_ParamConfig.ydkfqdpjConfig.inputParams, Project_ParamConfig.ydkfqdpjConfig.outParams, $.proxy(this.returnGPData, this), $.proxy(this.resultImageLayerHandler, this), $.proxy(this.errorHandler, this));
            }
        },

        /**
        *请求GP服务
        *@method getService
        *@param type{string} 执行GP分析类型
        *@private
        */
        _getSecService: function () {
            var type = this.SecGPtype;
            if (type == "lst") {
                Project_ParamConfig.landuseStockConfig.inputParams.In_region = this.presult[this.num].region;
                var url = Project_ParamConfig.landuseStockConfig.url;
                var gp = new L.DCI.GPHandler();
                gp.GPHandler(url, Project_ParamConfig.landuseStockConfig.inputParams, Project_ParamConfig.landuseStockConfig.outParams, $.proxy(this.returnSecGPData, this), $.proxy(this.resultImageLayerHandler, this), $.proxy(this.errorHandler, this));
            } else if (type == "lpu") {
                Project_ParamConfig.PublicServiceConfig.inputParams.In_region = this.presult[this.num].region;
                var url = Project_ParamConfig.PublicServiceConfig.url;
                var gp = new L.DCI.GPHandler();
                gp.GPHandler(url, Project_ParamConfig.PublicServiceConfig.inputParams, Project_ParamConfig.PublicServiceConfig.outParams, $.proxy(this.returnSecGPData, this), $.proxy(this.resultImageLayerHandler, this), $.proxy(this.errorHandler, this));
            }
        },


        /**
        *处理返回的GP结果
        *@method returnGPData
        *@param res{Object} Json格式结果
        *@private
        */
        returnGPData: function (res) {
            //隐藏正在加载
            var type = this.GPtype;
            if (type == "lb") {
                //如果结果有空值，则本次预处理结果全部不保存
                if (res.value == null) {
                    this.num = this.presult.length + 1;
                } else {
                    this.presult[this.num].landb_result = res.value;
                    this.num++;
                    if (this.num == this.presult.length) {
                        this.num = 0;
                        //三、执行用地平衡分析操作后，再执行用地强度评价分析；
                        this.GPtype = "ls";
                        this._getService();
                        //L.dci.app.util.dialog.alert("温馨提示", "执行完毕");
                    } else
                        this._getService();
                }
            } else if (type == "ls") {
                if (res.value == null) {
                    this.num = this.presult.length + 1;
                } else {
                    this.presult[this.num].lands_result = res.value;

                    this.presult[this.num].region = '';
                    this.num++;
                    if (this.num == this.presult.length) {
                        //后台保存代码
                        this._sendPre();
                    } else
                        this._getService();
                }
            }
        },

        /**
        *处理返回的GP结果
        *@method returnSecGPData
        *@param res{Object} Json格式结果
        *@private
        */
        returnSecGPData: function (res) {
            //隐藏正在加载            
            //Sec
            var sectype = this.SecGPtype;
            if (sectype == "lst") {
                //如果结果有空值，则本次预处理结果全部不保存
                if (res.value == null) {
                    this.num = this.presult.length + 1;
                } else {
                    this.presult[this.num].landst_result = res.value;
                    this.num++;
                    if (this.num == this.presult.length) {
                        this.num = 0;
                        //三、执行用地平衡分析操作后，再执行用地强度评价分析；
                        this.SecGPtype = "lpu";
                        this._getSecService();
                        //L.dci.app.util.dialog.alert("温馨提示", "执行完毕");
                    } else
                        this._getSecService();
                }
            } else if (sectype == "lpu") {
                if (res.value == null) {
                    this.num = this.presult.length + 1;
                } else {
                    this.presult[this.num].landpu_result = res.value;

                    this.presult[this.num].region = '';
                    this.num++;
                    if (this.num == this.presult.length) {
                        //后台保存代码
                        this._sendSecPre();
                    } else
                        this._getSecService();
                }
            }
        },




        _sendPre: function () {           
            if (this.sendNum == this.presult.length) {
                var statu = "优化完毕1";
                if (this._getSec) {
                    this._getSecService();
                };
                //L.dci.app.util.dialog.alert("温馨提示", "系统自动优化完毕,祝您工作愉快");
            } else {
                var preJson = '';
                preJson += '{"num" : "' + this.sendNum + '","length" : "' + this.presult.length + '","name" : "' + this.presult[this.sendNum].name + '","landb_result":\'' + JSON.stringify(this.presult[this.sendNum].landb_result) + '\',"lands_result":\'' + JSON.stringify(this.presult[this.sendNum].lands_result) + '\'}';


                _this = this;
                L.dci.app.services.baseService.saveLandPre({
                    async: true,
                    data: preJson,
                    context: this,
                    success: function (ss) {
                        _this.sendNum++;
                        _this._sendPre();
                    },
                    error: function (XMLHttpRequest, errorThrown) {
                        //L.dci.app.util.dialog.alert("温馨提示", "执行错误");
                    }
                });

            }
        },

        _sendSecPre: function () {
            if (this.sendNum == this.presult.length) {
                var statu = "优化完毕2";
                //L.dci.app.util.dialog.alert("温馨提示", "系统自动优化完毕,祝您工作愉快");
            } else {
                var preJson = '';
                preJson += '{"num" : "' + this.sendNum + '","length" : "' + this.presult.length + '","name" : "' + this.presult[this.sendNum].name + '","landst_result":\'' + JSON.stringify(this.presult[this.sendNum].landst_result) + '\',"landpu_result":\'' + JSON.stringify(this.presult[this.sendNum].landpu_result) + '\'}';

                _this = this;
                L.dci.app.services.baseService.saveSecLandPre({
                    async: true,
                    data: preJson,
                    context: this,
                    success: function (ss) {
                        _this.sendNum++;
                        _this._sendSecPre();
                    },
                    error: function (XMLHttpRequest, errorThrown) {
                        //L.dci.app.util.dialog.alert("温馨提示", "执行错误");
                    }
                });

            }
        },




        /**
        *返回的错误信息
        *@method errorHandler
        *@private
        */
        errorHandler: function () {
            this.num = 0;
        },


    });
    return L.DCI.AutoGP;
});
