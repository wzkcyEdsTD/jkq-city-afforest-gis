/**
*项目列表共用模版类
*@module modules.common
*@class DCI.Common.projectListTemplate
*@constructor initialize
*@extends DCI.Layout
*/
define("common/projectListTemplate", [
    "leaflet",
    "leaflet/esri",
    "plugins/pagination"

], function (L) {
	L.DCI.Common.ProjectListTemplate = L.DCI.Layout.extend({

		/*
        *类id
        *@property id
        *@type {String}
        *@private
        */
		id: "projectListTemplate",

		container: null,  //项目列表的容器
		names: [],        //属性的别名
		dataArray: [],    //项目列表数组
		notNullValue: false,  //是否过滤空值
		//index: 1,
		//theme: 'timeline',
		//titleWidth: 70,
		//isAnimate: "true",

		buttonType: "详情",  //详情按钮类型，包括"详情"和"查看业务"
		notShowAttribute: [],  //不显示的字段
		viewDetailAttribute: { number: null, type: null, fieldName: null, ajbm: null, projectId: null, projectName: null, planunit: null, caseid: null },   //详情按钮属性对应的字段
		viewDetailAttributelist: { number: "number", type: "type", fieldName: "data-fieldName", ajbm: "data-ajbm", projectId: "data-projectid", projectName: "data-projectname", planunit: "data-planunit", caseid: "data-caseid" },  //详情按钮属性名
	    //viewDetailType: null,

	    pageNum: null,  //分页数
		currentPage: 1,   //当前页码
		maxShowNum: 10,   //每页最多显示内容个数
		//phase: 0, 
		//condition: "0",
		changePageContainer: null,  //分页控件的容器

		changePageCallback: null,        //切换页码回调函数
		viewDetailCallback: null,        //查看详情回调函数
		zoomToProjCallback: null,        //项目定位回调函数

		/*
        *初始化
        *@method initialize
        *@param options {Object}
        */
		initialize: function (options) {
			this.container = options.container;
			this.names = options.names;
			this.dataArray = options.dataArray;
			//this.index = options.index;
			//this.theme = options.theme == null || options.theme == undefined ? 'current' : options.theme;
			//this.isAnimate = options.isAnimate == null || options.isAnimate == undefined ? "false" : options.isAnimate;
			//this.titleWidth = options.titleWidth == null || options.titleWidth == undefined ? 100 : options.titleWidth;
			this.changePageCallback = options.changePageCallback == null || options.changePageCallback == undefined ? null : options.changePageCallback;
			this.viewDetailCallback = options.viewDetailCallback == null || options.viewDetailCallback == undefined ? null : options.viewDetailCallback;
			this.zoomToProjCallback = options.zoomToProjCallback == null || options.zoomToProjCallback == undefined ? null : options.zoomToProjCallback;

		    this.notShowAttribute = options.notShowAttribute;
		    this.viewDetailAttribute = options.viewDetailAttribute;
		    //this.viewDetailType = options.viewDetailType;
		    this.buttonType = options.buttonType;
		    this.notNullValue = options.notNullValue == null || options.notNullValue == undefined ? false : options.notNullValue;;

			this.pageNum = options.pageNum;
			this.currentPage = options.currentPage;

			if (options.changePageContainer) {
			    this.changePageContainer = options.changePageContainer;
			} else if ($('.bottom')) {
			    this.changePageContainer = $('.bottom');
			} else {
			    $(this.container).before('<div class="bottom test"></div>');
			    this.changePageContainer = $('.bottom');
			}
		},


		/**
        *获取项目列表内容
        *@method _insertProjectListContent
        */
		getProjectListContent: function () {
			//清空内容区域和页码区域
			var containerObj = $(this.container);
			containerObj.html("");
			//$('.projectmap_tabContent2 .bottom').html("");

		    var data = this.dataArray;       //保存具体内容数据
			var columnName = this.names; //保存列名称
			//判断是否有匹配数据
			if (data == null || data.length == 0) {
				var html = '<p class="emptyResult">没有匹配的数据!</p>';
				containerObj.html(html);
			}
			else {
				var html = '';
				for (var i = 0; i < data.length; i++) {
					var trHtml = '';
					var obj = data[i];
					for (var att in obj) {//遍历要插入的字段信息
						var key = att;
						for (var kk in columnName) {//将英文字段名改为对应的中文名
							if (att == kk) {
								key = columnName[kk];
								break;
							}
						}
						//过滤不显示的字段
						if (!L.dci.app.util.tool.isShowAttribute(this.notShowAttribute, att)) {
							continue;
						} else if (this.notNullValue && (obj[att] == null || obj[att] == "")) { //如果过滤空值，且值为空时
						    continue;
						} else {
						    if (this.notShowAttribute == Project_ParamConfig.bzOneMapConfig.attributes) {
						        //如果为编制一张图
						        if (att.indexOf("Time") > -1) {//开始时间处理   2014-09-10T00:00:00  去掉后面的时间，只保留日期
						            var str = obj[att];
						            var value = str.substring(0, str.indexOf(' '));
						            trHtml += '<tr><td>' + key + ':</td><td>' + value + '</td></tr>';
						        }
						        else {
						            if (obj[att] == null)
						                trHtml += '<tr><td>' + key + ':</td><td></td></tr>';
						            else {
						                //排除“更新时间”
						                if (kk != "UPLOADDATE")
						                    trHtml += '<tr><td>' + key + ':</td><td>' + obj[att] + '</td></tr>';
						            }

						        }
                                //
						    } else {
						        var value = obj[att] == null ? "" : obj[att];
						        trHtml += '<tr><td>' + key + ':</td><td>' + value + '</td></tr>';
						    }
						}
					}

                    //设置详情按钮属性
					var viewDetailHtml = "";  //详情按钮
					var viewDetailAttrHtml = "";  //详情按钮的属性
					if (this.viewDetailAttribute.number) {
					    viewDetailAttrHtml = ' number = ' + i;
					}
					for (attr in this.viewDetailAttribute) {
					    if (this.viewDetailAttribute[attr] == "Ajbm" && this.viewDetailAttributelist == "data-fieldName") {
					        if (parseInt(data[i]["IsPlan"]) > 1) {
					            viewDetailAttrHtml += ' ' + this.viewDetailAttributelist[attr] + ' = ' + 'Xmbm';
					        } else {
					            viewDetailAttrHtml += ' ' + this.viewDetailAttributelist[attr] + ' = ' + 'Ajbm';
					        }
					    } else if (attr != null && attr != "number") {
					        viewDetailAttrHtml += ' ' + this.viewDetailAttributelist[attr] + ' = ' + data[i][this.viewDetailAttribute[attr]];
					    }
					}

					if (this.buttonType == "查看业务") {
					    //设置查看业务按钮属性
					    var primaryKey = this.viewDetailAttribute.caseid;
					    viewDetailHtml = '<span class="viewDetail" tag="' + primaryKey + "='" + data[i][primaryKey] + "'" + '"' + viewDetailAttrHtml + '>查看业务</span>';
					} else {
					    //设置查看详情按钮属性
					    viewDetailHtml = '<span class="viewDetail"' + viewDetailAttrHtml + '>详情</span>';
					}			   					
				    
					var iconMarkHtml = "";
				    //添加编后一张图的修编标记
					if ((parseInt(data[i]["IsPlan"]) > 1) && (this.notShowAttribute == Project_ParamConfig.bzOneMapConfig.attributes)) {
					    //当项目处于修编状态时，添加类.iconMark显示修编图标
					    iconMarkHtml = '<span class="iconMark"></span>';
					}
				    //添加批后一张图的已处理标记
					else if ((data[i]["IsDispose"] != "") && (this.notShowAttribute == Project_ParamConfig.phOneMapConfig.attributes)) {
					    //当项目处于已处理状态时，添加类.iconMark显示已处理图标
					    iconMarkHtml = '<span class="iconMark"></span>';
					}

					html += '<div class="percontent test111">'
                                //+ '<div class="pic1">'
                                //+ '<div class= ' + data[i].proType + '></div>' //项目类型：编制，实施，批后
                                + '<div class="percontent-content">'
                                + '<table>'
                                + '<tbody>'
                                + trHtml
                                + '</tbody>'
                                + '</table>'
                                + '</div>'
                                + '<div class="operation">'
                                + iconMarkHtml
                                //+ '<span class=""></span>'     //这个类看情况添加iconMark
                                //+ '<span class="viewDetail" number = ' + number + '  data-projectid="' + projectId + '" data-projectname="' + projectName + '">详情</span>'
                                + viewDetailHtml  //详情按钮
                                + '</div>'
                                + '</div>';
				}
				containerObj.html(html);

				//调用分页函数
				var _this = this;
				var page = new L.DCI.Pagination({
					pageCount: this.pageNum,
					currentPage: this.currentPage,
					showPageNum: 5,
					containerObj: this.changePageContainer,
					pageChange: function (page) {
						_this.changePage(page);
					}
				});

				//查看详情
				if (this.viewDetailCallback) {
				    $(".percontent").on('click', 'span.viewDetail', { context: this }, function (e) {
				        //_this.viewDetail(e);
				        return _this.viewDetailCallback(e);
				    });
				}

			    //项目定位
				if (this.zoomToProjCallback) {
				    $(".percontent").on('click', { context: this }, function (e) {
				        //_this.zoomToProj(e);
				        return _this.zoomToProjCallback(e);
				    });
				}
			}

		},

	    /**
        *改变页码
        *@method changePage
        *@param page {Object}       当前请求的页码
        */
		changePage: function (page) {
		    this.currentPage = page;
		    //this.getPageData(page, this.maxShowContentNum, this.phase, this.condition);
		    return this.changePageCallback(page);
		},

	    /**
        *查看详情
        *@method viewDetail
        */
		//viewDetail: function (e) {
		//    return this.viewDetailCallback(e);
		//},

	    /**
        *项目定位
        *@method viewDetail
        */
		//zoomToProj: function (e) {
		//    return this.zoomToProjCallback(e);
		//},

	});
	return L.DCI.ProjectListTemplate;
});