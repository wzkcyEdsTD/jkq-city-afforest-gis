/**
*叠加CAD/SHP数据类
*@module modules.analysis
*@class DCI.AddCad
*@constructor initialize
*@extends Class
*/
define("analysis/addcad", [
    "leaflet",
    "core/dcins",
    "analysis/colorpick"
], function (L) {
    L.DCI.AddCad = L.Class.extend({
        /**
        *类ID
        *@property id
        *@type {String}
        */
        id: 'AddCad',
        /**
        *uploader实例对象
        *@property swfu
        *@type {Object}
        */
        uploader: null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this.initArray();
            swfu = null;
        },
        /**
        *置空
        *@method _addContextmenu
        *@private
        */
        initArray: function () {
            this.cadUrlArray = [];
            this.cadFileNameArray = [];
            this.shpNameArray = [];
            this.shpUrlArray = [];
        },
        /**
        *弹出添加对话框
        *@method addmodal
        */
        addmodal: function () {
            var html = '<div id="dj_title" class="dj_title"><p id="scnum">叠加CAD文件</p><p id="scnum1"></p>'
                + '</div>'
                + '<span id="close" class="icon-close2"></span>'
                + ' <div id="frmMain" action="" runat="server" enctype="multipart/form-data">'
                + ' &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;请选择要叠加的文件：'
                + '<button id="spanButtonPlaceHolder">选择文件</button>'
                + '<ul id="file-list">'
                + '<div id="divprogresscontainer" class="divprogress"></div>'
                + '<div id="divprogressGroup" style="display:none;"></div>'
                + '</div>'
                + ' <div class="op1">'
                + '<p style="font-size:14px;float:left;font-weight: bold;margin-left: 10px;margin-top: 5px;">图形设置:</p>'
                + '<p style="font-size:12px; position:absolute;top:50px; left:20px;">线型：</p>'
                + '<div class="op" >'
                + '<div id="jieguo" ><p id="num">1</p><hr id="line"/></div>'
                + '<div class="linetogg"><span class="icon-triangle"></span></div>'
                + '<ul id="cuxi" class="op-list hide">'
                + '<li class="op-list-item"><p style="width:15px;float: left;">1</p><hr  style="border-top: 1px solid #000;margin-top: 5px; margin-bottom: 5px; width:90px;"/></li>'
                + '<li class="op-list-item"><p style="width:15px;float: left;">2</p><hr  style="border-top: 2px solid #000;margin-top: 5px; margin-bottom: 5px; width:90px;"/></li>'
                + '<li class="op-list-item"><p style="width:15px;float: left;">3</p><hr style="border-top: 3px solid #000;margin-top: 5px; margin-bottom: 5px; width:90px;"/></li>'
                + '<li class="op-list-item"><p style="width:15px;float: left;">4</p><hr style="border-top: 4px solid #000;margin-top: 5px; margin-bottom: 5px; width:90px;"/></li>'
                + '<li class="op-list-item"><p style="width:15px;float: left;">5</p><hr style="border-top: 5px solid #000;margin-top: 5px; margin-bottom: 5px; width:90px;"/></li>'
                + '<li class="op-list-item"><p style="width:15px;float: left;">6</p><hr style="border-top: 6px solid #000;margin-top: 5px; margin-bottom: 5px; width:90px;"/></li>'
                + '<li class="op-list-item"><p style="width:15px;float: left;">7</p><hr style="border-top: 7px solid #000;margin-top: 5px; margin-bottom: 5px; width:90px;"/></li>'
                + '</ul>'
                + '</div>'
                + '<p style="font-size:12px; position:absolute;top:50px; left:230px;">颜色：</p>'
                + '<div id="custom" class="input_cxcolor" readonly value="#000000" ><div style="background-color:#ffffff;width=50px;height:28px" ><span class="icon-Paint-bucket" style="color: #787878;font-size: 16px;top: 5px;left: 8px;position: absolute;">'
                + '</span><span style="font-size: 16px;position: absolute;right: 2px;top: 5px;color: #787878;" class="icon-triangle"><span></div></div>'
                + '<div id="yanse"></div>'
                + '</div>'
                + '<p class="zhuji">*请上传数据后再点击确定添加图层</p>'
                + '<input id="queding"  type="button" value="确  定"/>';
            if ($("#djcad").length == 0) {
                $(".out-container").append('<div id="djcad" class="ui-widget-content"></div>');
            }
            document.getElementById("djcad").innerHTML = "";
            $("#djcad").css("height", "450px");
            $("#djcad").html(html);
            $("#close").bind('click', L.bind(function () {
                this.initArray();
                $('#djcad').css("display", "none");
            }, this));
            $(".op").bind('click', function () {
                var op_list = this.children[2];
                if (op_list.className.indexOf('hide') > -1) {
                    op_list.className = op_list.className.replace(/(^|\s)hide(\s|$)/, '');
                } else {
                    op_list.className += ' hide';
                }
            });
            $(".op-list-item").bind('click', function () {
                var a = $(this).index() + 1;
                $("#num").html(a);
                $("#line").css("border-top-width", a + "px");
            });
            $("#scnum1").css("left", $("#scnum").css("width"));
            L.dci.app.util._drag("djcad", "dj_title");
            $("#custom").cxColor();
            $("#custom").bind('change', function () {
                $("#yanse").css("background", this.value);
                $("#custom").attr("value", this.value);
            });

            $('#djcad').css("display", "block");
            $(".op1").css("display", "block");
        },
        /**
        *配置上传参数
        *@method _GetUploadObj
        *@param type {String} ("cad")("shp")
        *@private
        */
        _GetUploadObj: function (type) {
            this.addmodal();
            this._show(type);
            var fileTypes, uploadUrl;
            var url = Project_ParamConfig.cadserver;//叠加SHP服务器地址
            //var file_upload_limit = 5;
            var uploadSuccess = null;
            if (type == "cad") {
                fileTypes = "*.dwg";
                uploadUrl = url + "/Request/SaveCADFile.ashx";
                filters = {
                    mime_types: [ //只允许上传CAD文件
                      { title: "CAD文件", extensions: "dwg" },
                    ],
                    max_file_size: '204800kb', //最大只能上传200MB的文件
                    prevent_duplicates: true //不允许选取重复文件
                };
                uploadSuccess = this.uploadCADSuccess;
            } else {
                fileTypes = "*.shp;*.dbf;*.shx;*.prj;*.sbn;*.sbx";
                uploadUrl = url + "/Request/SaveSHPFile.ashx";
                filters = {
                    mime_types: [ //只允许上传CAD文件
                      { title: "SHP文件", extensions: "shp,dbf,shx,prj,sbn,sbx" },
                    ],
                    max_file_size: '204800kb', //最大只能上传200MB的文件
                    prevent_duplicates: true //不允许选取重复文件
                };
                uploadSuccess = this.uploadSHPSuccess;
            }
            if (url == null) return null;
            var flashUrl = "/modules/analysis/plupload/Moxie.swf";


            //实例化一个plupload上传对象
            uploader = new plupload.Uploader({
                _this: this,
                filters: filters,
                drop_element: 'file-list',
                //chunk_size:'10mb',
                browse_button: 'spanButtonPlaceHolder', //触发文件选择对话框的按钮，为那个元素id
                url: uploadUrl, //服务器端的上传页面地址
                flash_swf_url: url + '/plupload/Moxie.swf', //swf文件，当需要使用swf方式进行上传时需要配置该参数
                silverlight_xap_url: url + '/plupload/Moxie.xap', //silverlight文件，当需要使用silverlight方式进行上传时需要配置该参数
            });

            uploader.init();

            //绑定文件添加进队列事件
            uploader.bind('FilesAdded', function (uploader, files) {
                if (files.length > 5) {
                    L.dci.app.util.dialog.alert("提示", "至多叠加5个文件");
                    return false;
                } else {
                    for (var i = 0, len = files.length; i < len; i++) {
                        var file_name = files[i].name; //文件名
                        //构造html来更新UI
                        var html = '<div id="file-' + files[i].id + '" class="progressobj">'
                                    + '<span id="fbu" class="icon-CADicon"></span><span title="' + file_name + '" class="fle ftt">' + file_name + '</span>'
                                    + '<div class="statebarSmallDiv">'
                                        + '<div class="statebar" id="file_' + files[i].id + '_progress">&nbsp;</div>'
                                    + '</div>'
                                        + '<span class="ftt fper" style="margin-top: 10px;">临时数据</span>'
                                        + '<span id="fsize" class="ftt">' + plupload.formatSize(files[i].size) + '</span>'
                                        + '<span id="fdelete" class="ftt icon-close1 fd1"></span>'
                                    + '</div>'


                        //var html = '<li id="file-' + files[i].id + '"><p class="file-name">' + file_name + '</p><p class="progress"></p></li>';
                        $(html).appendTo('#divprogresscontainer');
                        uploader.start(); //开始上传
                    }
                };
            });
            //绑定文件上传进度事件
            uploader.bind('UploadProgress', function (uploader, file) {
                $('#file_' + file.id + '_progress').css('width', file.percent + '%');//控制进度条
            });

            //绑定文件上传进度事件
            uploader.bind('Error', function (uploader, err) {
                $('#file-' + err.file.id + ' .fper').text(err.message);//控制进度条
            });

            uploader.bind('FileUploaded', function (uploader, file, responseObject) {
                uploadSuccess(uploader, file, responseObject)
                $("#file-" + file.id + " #fdelete").removeClass('icon-close1 fd1').addClass('icon-pitch-on fd2');//控制进度条
            });


        },

        /**
        *配置上传参数
        *@method _GetUploadObj
        *@param type {String} 限制上传文件数量
        *@private
        */
        _GetUploadObj_new: function (num) {
            this.num = num;
            this.addmodal();
            this._show_new();
            var uploadUrl;
            var url = Project_ParamConfig.cadserver;//叠加数据服务器地址
            //var file_upload_limit = 5;
            var uploadSuccess = null;
            filters = {
                mime_types: [ //只允许上传CAD文件
                  { title: "数据文件", extensions: "dwg,shp" },
                ],
                max_file_size: '204800kb', //最大只能上传200MB的文件
                prevent_duplicates: true //不允许选取重复文件
            };

            uploadUrl = url + "/Request/SaveCADFile.ashx";
            uploadSuccess = this.uploadSuccess;
            if (url == null) return null;
            var flashUrl = "/modules/analysis/plupload/Moxie.swf";


            //实例化一个plupload上传对象
            uploader = new plupload.Uploader({
                _this: this,
                filters: filters,
                drop_element: 'file-list',
                //chunk_size:'10mb',
                browse_button: 'spanButtonPlaceHolder', //触发文件选择对话框的按钮，为那个元素id
                url: uploadUrl, //服务器端的上传页面地址
                flash_swf_url: url + '/plupload/Moxie.swf', //swf文件，当需要使用swf方式进行上传时需要配置该参数
                silverlight_xap_url: url + '/plupload/Moxie.xap', //silverlight文件，当需要使用silverlight方式进行上传时需要配置该参数
            });

            uploader.init();

            //绑定文件添加进队列事件
            uploader.bind('FilesAdded', function (uploader, files) {
                if (files.length > uploader.settings._this.num) {
                    L.dci.app.util.dialog.alert("提示", "最多叠加" + uploader.settings._this.num + "个文件");
                    return false;
                } else {
                    for (var i = 0, len = files.length; i < len; i++) {
                        var file_name = files[i].name; //文件名
                        //构造html来更新UI
                        var html = '<div id="file-' + files[i].id + '" class="progressobj">'
                                    + '<span id="fbu" class="icon-CADicon"></span><span title="' + file_name + '" class="fle ftt">' + file_name + '</span>'
                                    + '<div class="statebarSmallDiv">'
                                        + '<div class="statebar" id="file_' + files[i].id + '_progress">&nbsp;</div>'
                                    + '</div>'
                                        + '<span class="ftt fper" style="margin-top: 10px;">临时数据</span>'
                                        + '<span id="fsize" class="ftt">' + plupload.formatSize(files[i].size) + '</span>'
                                        + '<span id="fdelete" class="ftt icon-close1 fd1"></span>'
                                    + '</div>'


                        //var html = '<li id="file-' + files[i].id + '"><p class="file-name">' + file_name + '</p><p class="progress"></p></li>';
                        $(html).appendTo('#divprogresscontainer');
                        uploader.start(); //开始上传
                    }
                };
            });
            //绑定文件上传进度事件
            uploader.bind('UploadProgress', function (uploader, file) {
                $('#file_' + file.id + '_progress').css('width', file.percent + '%');//控制进度条
            });

            //绑定文件上传进度事件
            uploader.bind('Error', function (uploader, err) {
                $('#file-' + err.file.id + ' .fper').text(err.message);//控制进度条
            });

            uploader.bind('FileUploaded', function (uploader, file, responseObject) {
                uploadSuccess(uploader, file, responseObject)
                $("#file-" + file.id + " #fdelete").removeClass('icon-close1 fd1').addClass('icon-pitch-on fd2');//控制进度条
            });
        },

        /**
        *叠加SHP文件
        *@method addshp
        */
        addshp: function () {
            this._GetUploadObj("shp");
            //确定事件
            $("#queding").off();
            $("#queding").bind('click', L.bind(function () {
                var url = this.shpUrlArray.join(';');
                if (url == null || !url) { $('.zhuji').css('display', 'block'); return; }
                L.dci.app.util.showLoading();
                var tUrl = Project_ParamConfig.cadserver + "/Request/RequestServices.ashx";
                var params = {
                    shapePath: url,
                    type: "shape"
                };
                var color = $("#custom").attr("value");
                var numb = $("#num").html();
                $.extend(params, {
                    lineWidth: numb,
                    lineColor: color
                });
                this.addshp1(params, tUrl);
                this._hide();
            }, this));
        },
        /**
        *弹出框配置（“叠加CAD”或“叠加SHP”）
        *@method _show
        *@param type {String} ("cad")("shp")
        *@private
        */
        _show: function (type) {
            var hm = $("#divprogresscontainer");
            hm.html("");
            hm.removeClass('divprogress1');
            hm.addClass("divprogress");
            $(".zhuji").css("display", "none");
            if (type == "cad")
                $("#scnum").html("叠加CAD文件");
            else
                $("#scnum").html("叠加SHP文件");
        },
        _hide: function () {
            $('#djcad').css("display", "none");
        },
        /**
        *弹出框配置（“叠加CAD”或“叠加SHP”）
        *@method _show_new
        *@param type {String} ("cad")("shp")
        *@private
        */
        _show_new: function () {
            var hm = $("#divprogresscontainer");
            hm.html("");
            hm.removeClass('divprogress1');
            hm.addClass("divprogress");
            $(".zhuji").css("display", "none");
            $("#scnum").html("添加CAD/SHP文件");
        },
        /**
        *叠加CAD文件
        *@method addshp
        */
        addcad: function () {
            this._GetUploadObj("cad");

            $("#queding").off();
            $("#queding").bind('click', L.bind(function () {
                var url = this.cadUrlArray.join(';');
                if (url == null || !url) { $('.zhuji').css('display', 'block'); return; }
                L.dci.app.util.showLoading();
                var tUrl = Project_ParamConfig.cadserver + "/Request/RequestServices.ashx";
                var layertypes = "Polyline;Annotation";
                var color = $("#custom").attr("value");
                var numb = $("#num").html();
                var params = {
                    type: "cad",
                    dwg: url,
                    layerTypes: layertypes,
                    lineWidth: numb,
                    lineColor: color
                };
                this.addcad1(params, tUrl);
                this._hide();
            }, this));
        },


        /**
        *叠加数据文件
        *@method addshp
        */
        adddata: function () {
            this._GetUploadObj_new(5);

            $("#queding").off();
            $("#queding").bind('click', L.bind(function () {
                var url = this.cadUrlArray.join(';');
                var shpurl = this.shpUrlArray.join(';');
                if (url == null || !url) { if (shpurl == null || !shpurl) { $('.zhuji').css('display', 'block'); return; } }

                L.dci.app.util.showLoading();
                var tUrl = Project_ParamConfig.cadserver + "/Request/RequestServices.ashx";
                var color = $("#custom").attr("value");
                var numb = $("#num").html();

                if (url) {
                    var layertypes = "Polyline;Annotation";
                    var params = {
                        type: "cad",
                        dwg: url,
                        layerTypes: layertypes,
                        lineWidth: numb,
                        lineColor: color
                    };
                    this.addcad1(params, tUrl);
                };

                if (shpurl) {
                    var shpparams = {
                        shapePath: shpurl,
                        type: "shape"
                    };
                    $.extend(shpparams, {
                        lineWidth: numb,
                        lineColor: color
                    });
                    this.addshp1(shpparams, tUrl);
                };

                this._hide();
            }, this));
        },

        /**
        *叠加数据文件并返回处理后数据
        *@param callback type {function} 回调函数
        *@param object type {object} 
        *@method addshp
        */
        adddata_ar: function (callback, object) {
            //每次仅允许叠加一份数据
            this._GetUploadObj_new(1);

            $("#queding").off();
            $("#queding").bind('click', L.bind(function () {
                var url = this.cadUrlArray.join(';');
                var shpurl = this.shpUrlArray.join(';');
                if (url == null || !url) { if (shpurl == null || !shpurl) { $('.zhuji').css('display', 'block'); return; } }

                L.dci.app.util.showLoading();
                var tUrl = Project_ParamConfig.cadserver + "/Request/RequestServices.ashx";
                var color = $("#custom").attr("value");
                var numb = $("#num").html();

                if (url) {
                    var layertypes = "Polyline;Annotation";
                    var params = {
                        type: "cad",
                        dwg: url,
                        layerTypes: layertypes,
                        lineWidth: numb,
                        lineColor: color
                    };
                    this.addcad_ar(params, tUrl, callback, object);
                };

                if (shpurl) {
                    var shpparams = {
                        shapePath: shpurl,
                        type: "shape"
                    };
                    $.extend(shpparams, {
                        lineWidth: numb,
                        lineColor: color
                    });
                    this.addshp_ar(shpparams, tUrl, callback, object);
                };

                this._hide();
            }, this));
        },
        addcad_ar: function (params, tUrl, callback, object) {
            $.ajax({
                //跨域调用
                async: false,
                url: tUrl,
                data: params,
                type: "GET",
                dataType: 'jsonp',
                timeout: 5000,
                context: $.extend(this, params),
                success: function (json) {
                    var js1 = JSON.parse(json);
                    var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                    var index = 0;
                    var bounds = [];
                    for (var layer in js1) {
                        var color = this.lineColor;
                        var width = this.lineWidth;
                        var dwgPath = this.dwg;
                        var groupId = this.randomCADGroupId();
                        var name = this.cadFileNameArray[index];
                        var js2 = js1[layer];
                        var layers = [];
                        for (var attr in js2) {
                            switch (attr) {
                                case "Polyline":
                                    $.each(js2[attr].features, function (i, ft) {
                                        var paths = ft.geometry.paths[0];
                                        var rs = [];
                                        $.each(paths, function (i0, ft0) {
                                            var relPoint = map.options.crs.projection.unproject(L.point([ft0[0], ft0[1]]));
                                            rs.push(relPoint);
                                            bounds.push(relPoint);
                                        });

                                        var ply = L.polyline(rs).setStyle({ color: color, weight: width });
                                        ply.clone = function () {
                                            return L.polyline(this.getLatLngs(), this.options);
                                        }
                                        layers.push(ply);

                                    });
                                    break;
                                case "Annotation":
                                    break;
                            }
                        }

                        var __options__ = {
                            id: 'layer-' + groupId,
                            declaredClass: "cad"
                        }

                        var lGroup = L.layerGroup(layers);
                        lGroup.__options__ = __options__;
                        //克隆
                        lGroup.clone = function () {
                            var layers = this.getLayers();
                            var _layer = [];
                            $.each(layers, function (i, item) {
                                _layer.push(item.clone());
                            });
                            var lg = L.layerGroup(_layer);
                            lg.__options__ = this.__options__;
                            return lg;
                        }

                        var objL = { groupId: groupId, group: lGroup, dwgPath: dwgPath, name: name }

                        var _map = L.dci.app.pool.get("map");
                        _map.cadLayerGroups.push(objL);

                        map.addCad(groupId);

                        var liename = '<li id=layer-dom-' + groupId + ' style="color:red" class="list-group-item"  title = ' + name + ' data-info="map-layer_l"><span class="icon-pitch-on list-group-item-img-display"></span><span>' + name + '</span></li>';
                        $("#cadul").append(liename);
                        index++;
                    }

                    map.map.fitBounds(L.polyline(bounds).getBounds());
                    this.initArray();
                    L.dci.app.util.hideLoading();
                    //叠加cad回调
                    if (typeof callback === 'function')
                        callback.apply(object || this, [{ caddata: js2["Polyline"].features }]);
                },
                error: function (er) {
                    L.dci.app.util.hideLoading();
                    L.dci.app.util.dialog.error("错误提示", "调用CAD服务错误,请检查上传服务");
                }
            });
        },
        addshp_ar: function (params, tUrl, callback, object) {
            $.ajax({
                //跨域调用
                async: false,
                url: tUrl,
                data: params,
                type: "GET",
                dataType: 'jsonp',
                timeout: 5000,
                context: $.extend(this, params),
                success: function (json) {
                    var js1 = JSON.parse(json);
                    var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                    var index = 0;
                    var bounds = [];
                    for (var layer in js1)   //遍历shape集合
                    {
                        var color = this.lineColor ? this.lineColor : "#000000";
                        var width = this.lineWidth ? this.lineWidth : 1;
                        var shapePath = this.shapePath;
                        var groupId = this.randomSHPGroupId();
                        var name = this.shpNameArray[index];
                        var js2 = js1[layer];   //取出当前遍历到的一个shape
                        var layers = [];
                        $.each(js2.features, function (i, ft) { //遍历当前shp的每个feature  ft
                            switch (js2.geometryType) {
                                case "esriGeometryPolygon":  //当前shp为面类型
                                    {
                                        var rings = ft.geometry.rings[0];
                                        var rs = [];
                                        $.each(rings, function (i0, ft0) { //取出面的每个点，进行坐标转换，将结果保存到rs数组中
                                            var relPoint = map.options.crs.projection.unproject(L.point([ft0[0], ft0[1]]));
                                            rs.push(relPoint);
                                            bounds.push(relPoint);
                                        });
                                        var plygon = L.polygon(rs).setStyle({ color: color, weight: width }); //创建一个新的面要素
                                        plygon.clone = function () {
                                            return L.polygon(this.getLatLngs(), this.options);
                                        }
                                        layers.push(plygon); //将面要素加载到图层集合中
                                    }
                                    break;
                                case "esriGeometryPolyline": //当前shp为线类型
                                    {
                                        var paths = ft.geometry.paths[0];
                                        var rs = [];
                                        $.each(paths, function (i0, ft0) {
                                            var relPoint = map.options.crs.projection.unproject(L.point([ft0[0], ft0[1]]));
                                            rs.push(relPoint);
                                            bounds.push(relPoint);
                                        });
                                        var ply = L.polyline(rs).setStyle({ color: color, weight: width });
                                        ply.clone = function () {
                                            return L.polyline(this.getLatLngs(), this.options);
                                        }
                                        layers.push(ply);
                                    }
                                    break;
                                case "esriGeometryPoint": //当前shp为点类型
                                    break;
                            }
                        });

                        var __options__ = {
                            id: 'layer-' + groupId,
                            declaredClass: "shpfile"
                        }

                        var lGroup = L.layerGroup(layers);
                        lGroup.__options__ = __options__;

                        lGroup.clone = function () {
                            var layers = this.getLayers();
                            var _layer = [];
                            $.each(layers, function (i, item) {
                                _layer.push(item.clone());
                            });

                            var lg = L.layerGroup(_layer);
                            lg.__options__ = this.__options__;
                            return lg;
                        }

                        var objL = { groupId: groupId, group: lGroup, shapePath: shapePath, name: name }

                        var _map = L.dci.app.pool.get("map");
                        _map.shpLayerGroups.push(objL);
                        map.addShp(groupId);
                        var liename = '<li id=layer-dom-' + groupId + ' style="color:red" class="list-group-item"  title = ' + name + ' data-info="map-layer_l_s"><span class="icon-pitch-on list-group-item-img-display"></span><span>' + name + '</span></li>';
                        $("#cadul_s").append(liename);
                        index++;
                    }

                    map.map.fitBounds(L.polyline(bounds).getBounds());
                    this.initArray();
                    L.dci.app.util.hideLoading();

                    //叠加shp回调
                    if (typeof callback === 'function')
                        callback.apply(object || this, [{ shpdata: js2.features }]);
                },
                error: function (er) {
                    L.dci.app.util.hideLoading();
                    L.dci.app.util.dialog.error("错误提示", "调用Shapfile服务错误,请检查上传服务");
                }
            });
        },


        /**
        *上传错误处理函数
        *@method _fileQueueError
        *@param file {Object} SWFUpload文件对象
        *@param errorCode {Number} 错误代码
        *@param message {String} 错误信息
        *@private
        */
        _fileQueueError: function (file, errorCode, message) {
            try {
                if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
                    L.dci.app.util.dialog.alert("提示", "至多叠加" + this.settings.file_upload_limit + "个文件");
                    return;
                }
                var progress = new FileProgress(file, swfu.settings.custom_settings.progressTarget);

                progress.setShow(false);

                fg_fileSizes -= file.size;
                fg_erNum += 1;
                switch (errorCode) {
                    case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                        MaxSizeError = true;
                        if (UploaFileMsg == "")
                            UploaFileMsg = file.name;
                        else
                            UploaFileMsg += "、" + file.name;
                        break;
                    case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                        L.dci.app.util.dialog.alert(file.name + " 文件内容为空，不能上传0节字文件!");
                        this.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                        break;
                    case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                        L.dci.app.util.dialog.alert("不允许上传文件类型的文件");
                        this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                        break;
                    default:
                        if (file != null) {
                            progress.setStatus("Unhandled Error");
                        }
                        L.dci.app.util.dialog.alert("未知错误");
                        this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                        break;
                }
            } catch (ex) {
                this.debug(ex);
            }
        },
        /**
        *随机生成CAD图层ID
        *@method randomCADGroupId
        *@return groupId{String} 图层ID
        *@private
        */
        randomCADGroupId: function () {
            var groupId = "cadLayer" + L.stamp({});
            return groupId;
        },
        /**
        *随机生成SHP图层ID
        *@method randomSHPGroupId
        *@return groupId{String} 图层ID
        *@private
        */
        randomSHPGroupId: function () {
            var groupId = "shpLayer" + L.stamp({});
            return groupId;
        },
        /**
        *ajax添加CAD方法
        *@method addcad1
        *@param params {Object} 添加CAD参数，eg.{"type": "cad","dwg": url, "layerTypes": layertypes,"lineWidth": numb,"lineColor": color};
        *@param tUrl {String}  请求地址
        *@private
        */
        addcad1: function (params, tUrl) {
            $.ajax({//跨域调用
                async: false,
                url: tUrl,
                data: params,
                type: "GET",
                dataType: 'jsonp',
                timeout: 5000,
                context: $.extend(this, params),
                success: function (json) {
                    var js1 = JSON.parse(json);
                    var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                    var index = 0;
                    var bounds = [];
                    for (var layer in js1) {
                        var color = this.lineColor;
                        var width = this.lineWidth;
                        var dwgPath = this.dwg;
                        var groupId = this.randomCADGroupId();
                        var name = this.cadFileNameArray[index];
                        var js2 = js1[layer];
                        var layers = [];
                        for (var attr in js2) {
                            switch (attr) {
                                case "Polyline":
                                    $.each(js2[attr].features, function (i, ft) {
                                        var paths = ft.geometry.paths[0];
                                        var rs = [];
                                        $.each(paths, function (i0, ft0) {
                                            var relPoint = map.options.crs.projection.unproject(L.point([ft0[0], ft0[1]]));
                                            rs.push(relPoint);
                                            bounds.push(relPoint);
                                        });

                                        var ply = L.polyline(rs).setStyle({ color: color, weight: width });
                                        ply.clone = function () {
                                            return L.polyline(this.getLatLngs(), this.options);
                                        }
                                        layers.push(ply);

                                        /*
                                        ////用地平衡分析调用
                                        //if (L.dci.app.pool.has("LandBalance") == true) {
                                        //    L.dci.app.pool.get("LandBalance").getCADRegion(ft);
                                        //}

                                        ////用地开发强度评价调用
                                        //if (L.dci.app.pool.has("LandStrength") == true) {
                                        //    L.dci.app.pool.get("LandStrength").getCADRegion(ft);
                                        //}

                                        ////可用地存量调用
                                        //if (L.dci.app.pool.has("LandStock") == true) {
                                        //    L.dci.app.pool.get("LandStock").getCADRegion(ft);
                                        //}

                                        ////公服设施分析调用
                                        //if (L.dci.app.pool.has("PublicService") == true) {
                                        //    L.dci.app.pool.get("PublicService").getCADRegion(ft);
                                        //}
                                        */
                                    });
                                    break;
                                case "Annotation":
                                    break;
                            }
                        }

                        var __options__ = {
                            id: 'layer-' + groupId,
                            declaredClass: "cad"
                        }

                        var lGroup = L.layerGroup(layers);
                        lGroup.__options__ = __options__;
                        //克隆
                        lGroup.clone = function () {
                            var layers = this.getLayers();
                            var _layer = [];
                            $.each(layers, function (i, item) {
                                _layer.push(item.clone());
                            });
                            var lg = L.layerGroup(_layer);
                            lg.__options__ = this.__options__;
                            return lg;
                        }

                        var objL = { groupId: groupId, group: lGroup, dwgPath: dwgPath, name: name }

                        var _map = L.dci.app.pool.get("map");
                        _map.cadLayerGroups.push(objL);

                        map.addCad(groupId);

                        var liename = '<li class="baseFeatureLayer active" id="layer-base-' + groupId + '" title ="' + name + '" data-info="map-layer_l" style="color:red"><span class="icon-pitch-on"></span><span>' + name + '</span></li>';
                        $("#cadUL").append(liename);
                        index++;
                    }

                    map.map.fitBounds(L.polyline(bounds).getBounds());
                    this.initArray();
                    L.dci.app.util.hideLoading();
                },
                error: function (er) {
                    L.dci.app.util.hideLoading();
                    L.dci.app.util.dialog.error("错误提示", "调用CAD服务错误,请检查上传服务");
                }
            });
        },
        /**
        *移除CAD要素
        *@method removerCAD
        */
        removerCAD: function () {
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            map.removeAllCad();
        },
        /**
        *ajax添加SHP方法
        *@method addshp1
        *@param params {Object} 添加SHP参数，eg.{"type": "cad","dwg": url, "layerTypes": layertypes,"lineWidth": numb,"lineColor": color};
        *@param tUrl {String}  请求地址
        *@private
        */
        addshp1: function (params, tUrl) {
            $.ajax({//跨域调用
                async: false,
                url: tUrl,
                data: params,
                type: "GET",
                dataType: 'jsonp',
                timeout: 5000,
                context: $.extend(this, params),
                success: function (json) {
                    var js1 = JSON.parse(json);
                    var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
                    var index = 0;
                    for (var layer in js1)   //遍历shape集合
                    {
                        var color = this.lineColor ? this.lineColor : "#000000";
                        var width = this.lineWidth ? this.lineWidth : 1;
                        var shapePath = this.shapePath;
                        var groupId = this.randomSHPGroupId();
                        var name = this.shpNameArray[index];
                        var js2 = js1[layer];   //取出当前遍历到的一个shape
                        var layers = [];
                        $.each(js2.features, function (i, ft) { //遍历当前shp的每个feature  ft
                            switch (js2.geometryType) {
                                case "esriGeometryPolygon":  //当前shp为面类型
                                    {
                                        /*
                                        //用地平衡分析调用
                                        if (L.dci.app.pool.has("LandBalance") == true) {
                                            L.dci.app.pool.get("LandBalance").getSHPRegion(ft);
                                        }

                                        //用地开发强度评价调用
                                        if (L.dci.app.pool.has("LandStrength") == true) {
                                            L.dci.app.pool.get("LandStrength").getSHPRegion(ft);
                                        }
                                        //可用地存量
                                        if (L.dci.app.pool.has("LandStock") == true) {
                                            L.dci.app.pool.get("LandStock").getSHPRegion(ft);
                                        }
                                        //公服设施分析
                                        if (L.dci.app.pool.has("PublicService") == true) {
                                            L.dci.app.pool.get("PublicService").getSHPRegion(ft);
                                        }
                                        */

                                        var rings = ft.geometry.rings[0];
                                        var rs = [];
                                        $.each(rings, function (i0, ft0) { //取出面的每个点，进行坐标转换，将结果保存到rs数组中
                                            var relPoint = map.options.crs.projection.unproject(L.point([ft0[0], ft0[1]]));
                                            rs.push(relPoint);
                                        });
                                        var plygon = L.polygon(rs).setStyle({ color: color, weight: width }); //创建一个新的面要素
                                        plygon.clone = function () {
                                            return L.polygon(this.getLatLngs(), this.options);
                                        }
                                        layers.push(plygon); //将面要素加载到图层集合中
                                        if (i == 0)
                                            map.map.fitBounds(plygon.getBounds());
                                    }
                                    break;
                                case "esriGeometryPolyline": //当前shp为线类型
                                    {
                                        var paths = ft.geometry.paths[0];
                                        var rs = [];
                                        $.each(paths, function (i0, ft0) {
                                            var relPoint = map.options.crs.projection.unproject(L.point([ft0[0], ft0[1]]));
                                            rs.push(relPoint);
                                        });
                                        var ply = L.polyline(rs).setStyle({ color: color, weight: width });
                                        ply.clone = function () {
                                            return L.polyline(this.getLatLngs(), this.options);
                                        }
                                        layers.push(ply);
                                        if (i == 0)
                                            map.map.fitBounds(ply.getBounds());
                                    }
                                    break;
                                case "esriGeometryPoint": //当前shp为点类型
                                    break;
                            }
                        });

                        var __options__ = {
                            id: 'layer-' + groupId,
                            declaredClass: "shpfile"
                        }

                        var lGroup = L.layerGroup(layers);
                        lGroup.__options__ = __options__;

                        lGroup.clone = function () {
                            var layers = this.getLayers();
                            var _layer = [];
                            $.each(layers, function (i, item) {
                                _layer.push(item.clone());
                            });

                            var lg = L.layerGroup(_layer);
                            lg.__options__ = this.__options__;
                            return lg;
                        }

                        var objL = { groupId: groupId, group: lGroup, shapePath: shapePath, name: name }

                        var _map = L.dci.app.pool.get("map");
                        _map.shpLayerGroups.push(objL);
                        map.addShp(groupId);
                        var liename = '<li class="baseFeatureLayer active" id="layer-base-' + groupId + '" title = ' + name + ' data-info="map-layer_l_s" style="color:red"><span class="icon-pitch-on"></span><span>' + name + '</span></li>';
                        $("#shpUL").append(liename);
                        index++;
                    }
                    //if (L.DCI.Hgxjc._IsHeGuiXinJianChaShp == true)//合规性检测*************************
                    //{
                    //    var _analysishgxjc = new L.DCI.Hgxjc();
                    //    _analysishgxjc.SanGuiCompareWithShp(js1);

                    //    L.DCI.Hgxjc._IsHeGuiXinJianChaShp = false;//用完之后应该将其置为false
                    //}
                    this.initArray();
                    L.dci.app.util.hideLoading();
                },
                error: function (er) {
                    L.dci.app.util.hideLoading();
                    L.dci.app.util.dialog.error("错误提示", "调用Shapfile服务错误,请检查上传服务");
                }
            });
        },
        /**
        *上传成功函数
        *@method uploadSuccess
        *@param file {Object} 文件对象
        *@param serverData {String}  
        *@private
        */
        uploadSuccess: function (uploader, file, responseObject) {
            if (file.name.toLowerCase().indexOf("shp") != -1) {
                $("#divprogresscontainer").attr("class", "divprogress1");
                var length = $("#djcad").find('.progressobj').length - 1;
                try {
                    var _this = uploader.getOption()._this;
                    if (file.name.indexOf(".shp") != -1) {
                        _this.shpNameArray.push(file.name);
                        _this.shpUrlArray.push(responseObject.response);
                    }
                    if (responseObject.status != 200) {
                        L.dci.app.util.dialog.alert("提示", "上传没有成功,请重新上传");
                        return;
                    }
                } catch (ex) {
                    L.dci.app.util.hideLoading();
                    this.debug(ex);
                }
            }
            if (file.name.toLowerCase().indexOf("dwg") != -1) {
                $("#divprogresscontainer").attr("class", "divprogress1");
                var length = $("#djcad").find('.progressobj').length - 1;
                try {
                    var _this = uploader.getOption()._this;
                    _this.cadUrlArray.push(responseObject.response);
                    _this.cadFileNameArray.push(file.name);
                    if (_this.cadUrlArray == null || _this.cadUrlArray.length == 0) {
                        L.dci.app.util.dialog.alert("提示", "上传没有成功,请重新上传");
                        return;
                    }
                } catch (ex) {
                    L.dci.app.util.hideLoading();
                    this.debug(ex);
                }
            }

        },

        /**
        *上传CAD成功函数
        *@method uploadCADSuccess
        *@param file {Object} SWFUpload文件对象
        *@param serverData {String}  
        *@private
        */
        uploadCADSuccess: function (uploader, file, responseObject) {
            $("#divprogresscontainer").attr("class", "divprogress1");
            var length = $("#djcad").find('.progressobj').length - 1;
            try {
                var _this = uploader.getOption()._this;
                _this.cadUrlArray.push(responseObject.response);
                _this.cadFileNameArray.push(file.name);
                if (_this.cadUrlArray == null || _this.cadUrlArray.length == 0) {
                    L.dci.app.util.dialog.alert("提示", "上传没有成功,请重新上传");
                    return;
                }
            } catch (ex) {
                L.dci.app.util.hideLoading();
                this.debug(ex);
            }

        },
        /**
        *上传SHP成功函数
        *@method randomSHPGroupId
        *@param file {Object} SWFUpload文件对象
        *@param serverData {String}  
        *@private
        */
        uploadSHPSuccess: function (uploader, file, responseObject) {
            $("#divprogresscontainer").attr("class", "divprogress1");
            var length = $("#djcad").find('.progressobj').length - 1;
            try {
                var _this = uploader.getOption()._this;
                if (file.name.indexOf(".shp") != -1) {
                    _this.shpNameArray.push(file.name);
                    _this.shpUrlArray.push(responseObject.response);
                }
                if (responseObject.status != 200) {
                    L.dci.app.util.dialog.alert("提示", "上传没有成功,请重新上传");
                    return;
                }
            } catch (ex) {
                L.dci.app.util.hideLoading();
                this.debug(ex);
            }

        }
    });
    return L.DCI.AddCad;
});