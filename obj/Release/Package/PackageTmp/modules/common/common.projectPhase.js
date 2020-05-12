/**
*项目阶段类
*@module modules.common
*@class DCI.Common.PojectPhase
*@constructor initialize
*@extends DCI.Layout
*/
define("common/projectPhase", [
    "leaflet",
    "leaflet/esri",
], function (L) {
    L.DCI.Common.PojectPhase = L.DCI.Layout.extend({
        /**
        *类id
        *@property id
        *@type {String}
        *@private
        */
        id: "projectPhase",

        /**
        *项目阶段HTML模板
        *@property phaseHtmlTemplet
        *@type {String}
        *@private
        */
        phaseHtmlTemplet: '<div class="projectPhase">'
                            + '<p><span>主要指标</span></p>'  //<span class="projectPhase-goto-oa" data-info="">业务表单</span>
                            + '<p class="phaseRarrow"></p>'
                            + '<div></div>'
                            //+ '<table>'
                            //    //+ '<thead>'
                            //    //    + '<tr><td>指标项</td><td>指标值</td></tr>'   
                            //    //+ '</thead>'
                            //    + '<tbody></tbody>'
                            //+ '</table>'
                          + '</div>',


        /**
        *项目空间数据
        *@property projectFeatures
        *@type {Object}
        *@private
        */
        projectFeature: null,

        /**
        *当前阶段添加的服务图层
        *@property phaseLayer
        *@type {Object}
        *@private
        */
        phaseLayer: null,

        /**
        *项目阶段配置内容
        *@property phaseConfig
        *@type {Array}
        *@private
        */
        phaseConfig: [],

        /**
        *当前阶段所在数组的索引
        *@property currentIndex
        *@type {Number}
        *@private
        */
        currentIndex: 0,


        /**
        *初始化
        *@method initialize
        *@param projectId {String}              项目PROJECTID
         *@param projectFeature {Object}       项目空间数据
        *@param projectStatus {String}          项目状态
        *@param projectType {String}            项目类型
        *@param containerId {String}            填充容器的id,如 <div id="projectDetail">内容填充区域</div>，    containerId: #projectDetail
        *@param functionName {String}           功能模块名称,如 项目一张图，    functionName: 项目一张图
        */
        initialize: function (projectId, projectFeature, projectStatus, projectType, containerId, functionName) {
            //初始化变量
            this.currentIndex = 0;
            this.projectFeature = projectFeature;
            this.phaseConfig.length = 0;
            for (var i = 0; i < Project_ParamConfig.projectPhaseConfig.length; i++)
            {
                this.phaseConfig.push(Project_ParamConfig.projectPhaseConfig[i]);
            }
            //插入模版元素
            $(containerId).html(this.phaseHtmlTemplet);
            //获取当前阶段的阶段id，以及所在数组的索引
            for (var i = 0; i < this.phaseConfig.length; i++)
            {
                if (projectStatus == this.phaseConfig[i].name)
                {
                    this.currentIndex = i;
                    break;
                }
            }
            //插入阶段的服务
            this._map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            this.addLayer(this.currentIndex,functionName);

            //构造项目阶段html
            var phaseHtml = '';
            for (var i = 0; i < this.phaseConfig.length; i++)
            {
                //插入其它阶段
                if (i < this.currentIndex)
                {
                    phaseHtml += '<span class="project-rarrow pass" title="' + this.phaseConfig[i].description + '" projectId="' + projectId + '" index="' + i + '" containerId="' + containerId + '" functionName="' + functionName + '">' + this.phaseConfig[i].name + '</span>';
                }
                else if (i == this.currentIndex)
                {
                    phaseHtml += '<span class="project-rarrow pass select" title="' + this.phaseConfig[i].description + '" projectId="' + projectId + '" index="' + i + '" containerId="' + containerId + '" functionName="' + functionName + '">' + this.phaseConfig[i].name + '</span>';
                }
                else
                {
                    phaseHtml += '<span class="project-rarrow" title="' + this.phaseConfig[i].description + '" projectId="' + projectId + '" index="' + i + '" containerId="' + containerId + '" functionName="' + functionName + '">' + this.phaseConfig[i].name + '</span>';
                }
            }
            //插入阶段指标箭头元素
            $(containerId).find(".phaseRarrow").html(phaseHtml);
            //获取阶段内容
            this.getPhaseData(projectId, this.currentIndex, containerId);
            //绑定点击阶段事件
            $(containerId).on('click', 'span.project-rarrow.pass:not(".select")', { context: this }, function (e) { e.data.context.click(e); });
        },

        /**
        *添加阶段图层服务
        *@method addLayer
        *@param functionName {String}
        */
        addLayer: function (currentIndex, functionName) {
            var url = this.phaseConfig[currentIndex].url;
            var layerIndex = this.phaseConfig[currentIndex].layerIndex;
            var idStr = "phash-" + this.phaseConfig[currentIndex].name;
            var _count = this._map.getLayers().length;
            var isHas = false;
            this._map.map.eachLayer(function (layer) {
                _count--;
                if (layer.options && layer.options.id == idStr) {
                    isHas = true;
                    return;
                }
                if(_count==0 && isHas==false){
                    this.deleteLayer();
                    if (url != "") {
                        this._map.addLayer(url, { layers: [layerIndex], id: idStr });
                    }
                }
                
            }, this);
        },

        /**
        *删除阶段图层服务
        *@method deleteLayer
        */
        deleteLayer: function () {
            for (var i = 0; i < this.phaseConfig.length; i++) {
                var idStr = "phash-" + this.phaseConfig[i].name;
                this._map.removeLayer(idStr);
            }
        },

        /**
        *获取项目阶段信息
        *@method getPhaseData
        *@param projectId {String}              项目PROJECTID
        *@param currentIndex {String}           当前阶段的数组索引
        *@param containerId {String}            填充容器的id,如 <div id="projectDetail">内容填充区域</div>，    containerId: #projectDetail
        */
        getPhaseData: function (projectId, currentIndex, containerId) {
            if (currentIndex == 0)
            {
                //查询控规阶段数据,通过项目坐标查询属性信息
                var url = this.phaseConfig[currentIndex].url + '/' + this.phaseConfig[currentIndex].layerIndex;
                var query = L.esri.Tasks.query(url, { proxy: Project_ParamConfig.defaultAjaxProxy });
                query.params.outSr = "";
                query.intersects(this.projectFeature);
                query.params.inSr = "";
                query.fields(this.phaseConfig[currentIndex].queryFields);
                query.run(function (error, featureCollection, response) {
                    if (typeof error == "undefined")
                    {
                        var data = featureCollection.features;
                        if (data.length == 0)
                        {
                            this.fillPhaseInfo(null, currentIndex, containerId, "");
                        }
                        else
                        {
                            this.fillPhaseInfo(data, currentIndex, containerId, "");
                        }
                    }
                    else if (typeof error == "object")
                    {
                        this.fillPhaseInfo(data, currentIndex, containerId, "无数据");
                        //console.log(error.message);
                    }
                }, this);
            }
            else
            {
                //查询其它阶段，通过项目编号projectId查询属性信息
                var url = this.phaseConfig[currentIndex].url + '/' + this.phaseConfig[currentIndex].layerIndex;
                var text = "PROJECTID='" + projectId + "'";
                var query = L.esri.Tasks.query(url);
                query.fields(this.phaseConfig[currentIndex].queryFields);
                query.params.outSr = "";
                query.where(text);
                query.run(function (error, featureCollection, response) {
                    if (typeof error == "undefined")
                    {
                        var data = featureCollection.features;
                        if (data.length == 0)
                        {
                            this.fillPhaseInfo(null, currentIndex, containerId, "");
                        }
                        else
                        {
                            this.fillPhaseInfo(data, currentIndex, containerId, "");
                        }
                    }
                    else if (typeof error == "object")
                    {
                        this.fillPhaseInfo(data, currentIndex, containerId, "无数据");
                        //console.log(error.message);
                    }
                }, this);
            }

            
        },

        /**
        *填充项目阶段信息
        *@method fillPhaseInfo
        *@param data {Object}                   项目阶段信息
        *@param containerId {String}            填充容器的id,如 <div id="projectDetail">内容填充区域</div>，    containerId: #projectDetail
        */
        fillPhaseInfo: function (data,currentIndex, containerId,errorText) {
            var trHtml = ''
            var queryFields = this.phaseConfig[currentIndex].queryFields;
            var displayFieldsName = this.phaseConfig[currentIndex].displayFieldsName;

            if (errorText != "")
            {
                trHtml += '<table><tbody><tr><td class="emptyPhaseInfo" colspan="2">'+ errorText +'</td></tr></tbody></table>';
                $(containerId).find('div.projectPhase').find('div').html(trHtml);
                //给业务表单赋值
                $(containerId).find('div.projectPhase').find('span.projectPhase-goto-oa').attr("data-info", "");
                return;
            }
            if (data == null || queryFields.length == 0)
            {
                trHtml += '<table><tbody><tr><td class="emptyPhaseInfo" colspan="2">无数据</td></tr></tbody></table>';
                $(containerId).find('div.projectPhase').find('div').html(trHtml);
                //给业务表单赋值
                $(containerId).find('div.projectPhase').find('span.projectPhase-goto-oa').attr("data-info", "");
                return;
            }


            //currentIndex == 0为控规阶段，控规阶段没有业务表单
            if (currentIndex == 0)
            {
                for (var n = 0; n < data.length; n++)
                {
                    trHtml += '<table class="noProjectFrom"><tbody>';
                    var dataObj = data[n].properties;

                    for (var att in dataObj)
                    {
                        //过滤不显示CASE_ID字段
                        if (att == "CASE_ID") continue;

                        for (var i = 0; i < queryFields.length; i++)
                        {
                            if (att == queryFields[i])
                            {
                                var value = dataObj[att] == null ? "" : dataObj[att];
                                var filed = "";
                                if (displayFieldsName.length == 0)
                                    filed = att;
                                else
                                    filed = displayFieldsName[i] == "" ? att : displayFieldsName[i];
                                trHtml += '<tr><td>' + filed + '</td><td>' + value + '</td></tr>';
                            }
                        }
                    }
                    trHtml += "</tbody></table>";
                }
            }
            else
            {
                for (var n = 0; n < data.length; n++)
                {
                    //给业务表单赋值
                    if (data[n].properties.hasOwnProperty('CASE_ID') == true)
                    {
                        trHtml += '<p><span class="projectPhase-goto-oa" data-info="' + data[0].properties['CASE_ID'] + '">业务表单</span></p>';
                    }
                    else
                    {
                        trHtml += '<p><span class="projectPhase-goto-oa" data-info="">业务表单</span></p>';
                    }

                    trHtml += '<table><tbody>';
                    var dataObj = data[n].properties;
                    for (var att in dataObj)
                    {
                        //过滤不显示CASE_ID字段
                        if (att == "CASE_ID") continue;

                        for (var i = 0; i < queryFields.length; i++)
                        {
                            if (att == queryFields[i])
                            {
                                var value = dataObj[att] == null ? "" : dataObj[att];
                                var filed = "";
                                if (displayFieldsName.length == 0)
                                    filed = att;
                                else
                                    filed = displayFieldsName[i] == "" ? att : displayFieldsName[i];
                                trHtml += '<tr><td>' + filed + '</td><td>' + value + '</td></tr>';
                            }
                        }
                    }
                    trHtml += "</tbody></table>";
                }
            }

            
            $(containerId).find('div.projectPhase').find('div').html(trHtml);
        },

        /**
        *项目阶段点击事件
        *@method click
        *@param e {Object}事件对象
        */
        click: function (e) {
            var projectId = $(e.target).attr("projectId");
            this.currentIndex = parseInt($(e.target).attr("index"));
            var containerId = $(e.target).attr("containerId");
            var functionName = $(e.target).attr("functionName");
            $(e.target).addClass("select").siblings(".pass").removeClass("select");
            this.addLayer(this.currentIndex, functionName);
            e.data.context.getPhaseData(projectId, this.currentIndex, containerId);
            e.stopPropagation();
        }   
    });
    return L.DCI.Common.PojectPhase;
});