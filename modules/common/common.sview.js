/**
*视图保存类
*@module modules.common
*@class DCI.sview
*@constructor initialize
*/
define("common/sview", [
    "leaflet",
    "core/dcins",
    "plugins/scrollbar",
    "controls/draw",
    "controls/measure",
    "layout/leftpanel",
    "layout/toolbar"
], function (L) {
    L.DCI.SView = L.Class.extend({

        /**
        *类ID
        *@property id
        *@type {String}
        */
        id: 'SView',
        /**
        *标绘容器
        *@property plot
        *@type {String}
        */
        plot: [],

        /**
        *初始化
        *@method initialize
        *param geometry{Object} geometry数据
        *param map{Object} 地图对象
        *param lay{Object} 图层
        */
        initialize: function () {
            this.map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            this._map = L.DCI.App.pool.get('MultiMap').getActiveMap().getMap();

            var scene = this._GetRequest();
            if(scene["scene"] != null){
                this.recoverView(scene["scene"]);
            }
        },

        saveView: function (sname) {
            this.center = this._getCenter();
            this.zoom = this._getZoom();
            this.IDs = this._getLayerIDs()[0];
            this.plot = this._getPlot();
            //this.measurement = this._getMeasurement()
            this.measurement = this._getMeasure();

            //将场景信息保存至数据库中
            this.sView = { "center": this.center, "zoom": this.zoom, "IDs": this.IDs, "plot": this.plot, "measurement": this.measurement };

            var userdata = $.parseJSON($.cookie('userdata'));
            var userId = userdata.userId;
            var datetime = new Date();
            var jsonScene = JSON.stringify(this.sView);
            var timestamp = new Date().getTime();
            var srandom = timestamp.toString().substr(0, 10);           

            this._addSname = sname;

            if (this._addSname == "" || this._addSname == null) {
                Date.prototype.Format = function (fmt) { //author: meizz 
                    var o = {
                        "M+": this.getMonth() + 1, //月份 
                        "d+": this.getDate(), //日 
                        "h+": this.getHours(), //小时 
                        "m+": this.getMinutes(), //分 
                        "s+": this.getSeconds(), //秒 
                        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
                        "S": this.getMilliseconds() //毫秒 
                    };
                    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                    for (var k in o)
                        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                    return fmt;
                }

                var date1 = new Date().Format("yyyy/MM/dd hh:mm:ss");
                var scene = { "USERID": userId, "SCENE": jsonScene, "SRANDOM": srandom, "SNAME": date1 };
            } else {
                var scene = { "USERID": userId, "SCENE": jsonScene, "SRANDOM": srandom, "SNAME": sname };
            }

            var data = JSON.stringify(scene)
            L.dci.app.services.SviewService.addScene({
                data: data,
                context: this,
                success: function (res) {
                    //L.dci.app.util.dialog.alert("提示", "场景保存成功" + res);
                    arr = res.replace("\"", "")
                    arr = arr.replace("\"", "")
                    $("#sview_key").val(arr);

                    var scene = res.substring(res.indexOf("\"") + 1, res.lastIndexOf("\""));
                    if (this._addSname == "" || this._addSname == null) {
                        this._shareSce(scene);
                    } else {
                        this.getslist();
                        $(".addSce").css("display", "none");
                    }
                    
                },
                error: function () {
                    L.dci.app.util.dialog.alert("提示", "未找到对应的服务地址");
                }
            });
        },

        recoverView: function (srandom) {

            //srandom = "1461901934";
            var map = L.DCI.App.pool.get('MultiMap').getActiveMap();
            map.clear();

            this._getSviewData(srandom);

            //this._reMeasure();

            //res = '{"point":[{"latlng":{"lat":0.2908552058560277,"lng":97.77549151781},"mypopup":{"_tooltip":null,"_titles":null,"_content":null,"statu":0}},{"latlng":{"lat":0.22641772863663784,"lng":97.74766217958357},"mypopup":{"_tooltip":null,"_titles":null,"_content":null,"statu":0}},{"latlng":{"lat":0.19601076096916595,"lng":97.81403956635258},"mypopup":{"_tooltip":null,"_titles":null,"_content":null,"statu":0}}],"pointtext":[{"latlng":{"lat":0.2615896222111537,"lng":97.67713992456932},"mypopup":{"_titles":"123","_content":"234","statu":1,"_tooltip":{"_leaflet_pos":{"x":493,"y":255}}}},{"latlng":{"lat":0.2139263049239679,"lng":97.87863178309438},"mypopup":{"_titles":"asd","_content":"erg","statu":1,"_tooltip":{"_leaflet_pos":{"x":833,"y":335}}}}],"polyline":[{"latlngs":[{"lat":0.16320486120258149,"lng":97.84723366727636},{"lat":0.16855774108121158,"lng":97.77019432481475},{"lat":0.20017651615240198,"lng":97.7737422980995},{"lat":0.22583006760387775,"lng":97.77788334781683}],"mypopup":{"_titles":"xcbvde","_content":"werghwerg","statu":1}},{"latlngs":[{"lat":0.10772278976057698,"lng":97.87509720916421},{"lat":0.12502919867403064,"lng":97.89880108111059},{"lat":0.13696975299514252,"lng":97.94147244079028},{"lat":0.1554656367257252,"lng":97.93317134171107}],"mypopup":{"_titles":"x12","_content":"x34","statu":1}}],"circle":[{"center":{"lat":0.25085910172221887,"lng":97.69610386014088},"radius":1334.5458564268329,"mypopup":{"_titles":"reg","_content":"thrrr","statu":1}},{"center":{"lat":0.30448833081445553,"lng":97.55863229765204},"radius":2552.0153403015734,"mypopup":{"_titles":"bbb","_content":"dddd","statu":1}}],"rectangle":[{"latlngs":[{"lat":0.23354350762446238,"lng":97.60959675271745},{"lat":0.26395171641640486,"lng":97.60959675271745},{"lat":0.26395171641640486,"lng":97.64159973490536},{"lat":0.23354350762446238,"lng":97.64159973490536}],"mypopup":{"_titles":"ttt","_content":"ggg","statu":1}},{"latlngs":[{"lat":0.11248183410661929,"lng":97.73286710963399},{"lat":0.14946043424740005,"lng":97.73286710963399},{"lat":0.14946043424740005,"lng":97.77731531121513},{"lat":0.11248183410661929,"lng":97.77731531121513}],"mypopup":{"_titles":"yyy","_content":"fff","statu":1}}],"polygon":[{"latlngs":[{"lat":0.09518527603662769,"lng":97.80931737526184},{"lat":0.11666583659020231,"lng":97.83064840941725},{"lat":0.12621446133538858,"lng":97.84842566611314},{"lat":0.14351076718393618,"lng":97.81701390655337}],"mypopup":{"_titles":"hh","_content":"ddd","statu":1}},{"latlngs":[{"lat":0.25866951670421806,"lng":97.86261696714676},{"lat":0.2843079809174602,"lng":97.81638310476079},{"lat":0.27117887843896216,"lng":97.8051281881809},{"lat":0.24673124814530062,"lng":97.84484158414736}],"mypopup":{"_titles":"rrr","_content":"xxx","statu":1}}]}';

        },

        getslist: function () {
            var userdata = $.parseJSON($.cookie('userdata'));
            var userid = userdata.userId;

            L.dci.app.services.SviewService.getSceneList({
                userid: userid,
                context: this,
                success: function (res) {
                    //var res = [{ "SID": 98, "USERID": 182, "CTIME": "2016-05-10", "SCENE": "", "SRANDOM": "1462873981", "SNAME": "" }, { "SID": 97, "USERID": 182, "CTIME": "2016-05-10", "SCENE": "", "SRANDOM": "1462873818", "SNAME": "" }, { "SID": 96, "USERID": 182, "CTIME": "2016-05-10", "SCENE": "", "SRANDOM": "1462873818", "SNAME": "" }, { "SID": 95, "USERID": 182, "CTIME": "2016-05-10", "SCENE": "", "SRANDOM": "1462873784", "SNAME": "" }, { "SID": 94, "USERID": 182, "CTIME": "2016-05-10", "SCENE": "", "SRANDOM": "1462867517", "SNAME": "" }, { "SID": 93, "USERID": 182, "CTIME": "2016-05-10", "SCENE": "", "SRANDOM": "1462866877", "SNAME": "" }, { "SID": 92, "USERID": 182, "CTIME": "2016-05-10", "SCENE": "", "SRANDOM": "1462859721", "SNAME": "场景一              " }, { "SID": 91, "USERID": 182, "CTIME": "2016-05-10", "SCENE": "", "SRANDOM": "1462859677", "SNAME": "场景2               " }, { "SID": 90, "USERID": 182, "CTIME": "2016-05-10", "SCENE": "", "SRANDOM": "1462859237", "SNAME": "场景3               " }, { "SID": 89, "USERID": 182, "CTIME": "2016-05-10", "SCENE": "", "SRANDOM": "1462858829", "SNAME": "场景4               " }]
                    var plist = '';
                    for (var i = 0; i < res.length; i++) {
                        plist += '<li class="item" srandom = "' + res[i].SRANDOM + '"><div class="sname">' + res[i].SNAME + '</div><span class="icon-close2 right"></span><span class="icon-shareicon right"></span></li>';
                    }

                    html = '<div class="pcollection">'
                        + '<ul>'
                        + plist
                        + '</ul>'
                        + '</div>'
                    +'<div class="adddiv">'  
                    + '<div class="addcoll"><span class="icon-zoom-in"></span> 添加收藏</div>'
                    + '<div  class="addSce"><input id="sceName" class="addSname" autofocus="autofocus" placeholder="请输入专题名称(不超过30字符)"></input><button id="addbutt">添加</button></div>'
                    +'</div>'

                    var collecticonobj = $(".pcollection");
                    if (collecticonobj.length == 0) {
                        //弹出工具盒
                        eleObj = $(".icon-collecticon");
                        name = "专题收藏";
                        this._toolbar = new L.DCI.Layout.ToolBar();
                        this._toolbar.toolBox(name, html, eleObj);

                        //滚动条
                        $(".pcollection").mCustomScrollbar({
                            theme: "minimal-dark"
                        });

                        function getRealLen(str) {
                            return str.replace(/[^\x00-\xff]/g, '__').length; //这个把所有双字节的都给匹配进去了
                        }
                        //input输入控制
                        $('#sceName').keyup({ maxlen: 29 }, function (event) {
                            var maxl = event.data.maxlen;
                            var strobj = event.target;

                            for (var i = 0; i < strobj.value.length; i++) {
                                var subarr = strobj.value.substr(0, i);
                                var reallen = getRealLen(subarr);
                                if (reallen > maxl) {
                                    strobj.value = subarr;
                                    break;
                                }
                            }
                        });

                        $(".item").on('click', '.sname', { context: this }, function (e) {
                            var srandomId = $(e.target.parentNode).attr("srandom");
                            e.data.context.recoverView(srandomId);
                        });
                        $(".item").on('click', '.icon-shareicon', { context: this }, function (e) {
                            var srandomId = $(e.target.parentNode).attr("srandom");
                            e.data.context._shareSce(srandomId);
                        });
                        $(".item").on('click', '.icon-close2', { context: this }, function (e) {
                            var srandomId = $(e.target.parentNode).attr("srandom");
                            e.data.context.deleteScene(srandomId);
                        });
                    } else {
                        var newhtml = '<ul>'
                                    + plist
                                    + '</ul>'

                        $(".pcollection .mCSB_container").html("");
                        $(".pcollection .mCSB_container").append(newhtml);
                        //更新滚动
                        $(".content").mCustomScrollbar("update");

                        $(".item").on('click', '.sname', { context: this }, function (e) {
                            var srandomId = $(e.target.parentNode).attr("srandom");
                            e.data.context.recoverView(srandomId);
                        });
                        $(".item").on('click', '.icon-shareicon', { context: this }, function (e) {
                            var srandomId = $(e.target.parentNode).attr("srandom");
                            e.data.context._shareSce(srandomId);
                        });
                        $(".item").on('click', '.icon-close2', { context: this }, function (e) {
                            var srandomId = $(e.target.parentNode).attr("srandom");
                            e.data.context.deleteScene(srandomId);
                        });
                    }
                    //添加收藏
                    $(".adddiv").unbind();
                    $(".adddiv").on('click', '.addcoll', { context: this }, function (e) {
                        $(".addSce").css("display", "block");
                    });
                    $("#addbutt").unbind();
                    $('#addbutt').on('click', { context: this }, function (e) {
                        var sname = $('.addSname').val();
                        if (sname == "") {
                            $('.addSname').attr('placeholder', '专题名称不能为空');
                            $(".addSname").focus();
                        } else {
                            $('.addSname').val("");
                            e.data.context.saveView(sname);
                        };                        
                    });

                },
                error: function () {
                    L.dci.app.util.dialog.alert("提示", "未找到对应的服务地址");
                }
            });

        },

        deleteScene: function (srandom) {
            L.dci.app.services.SviewService.deleteScene({
                sid: srandom,
                context: this,
                success: function (res) {
                    this.getslist();
                },
                error: function () {
                    L.dci.app.util.dialog.alert("提示", "未找到对应的服务地址");
                }
            });
        },

        renameScene: function () {

        },

        _GetRequest: function () {
            var url = location.search; //获取url中"?"符后的字串 
            var theRequest = new Object();
            if (url.indexOf("?") != -1) {
                var str = url.substr(1);
                strs = str.split("&");
                for (var i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
                }
            }
            return theRequest;
        },

        _shareSce: function (sceneId) {
            var locUrl = document.location.origin + document.location.pathname + document.location.search;
            if (locUrl.indexOf("?") == -1) {
                var shareUrl = locUrl + "?scene=" + sceneId;
            } else {
                var shareUrl = locUrl + "&scene=" + sceneId;
            }
            
            html = '<div class="shareInfo">您可以将当前地图中的数据、标绘、测量内容分享给好友</div>'
                + '<div><input type="text" id = "shareurl" value =' + shareUrl + '></input>'
                + '<span id="clip_container"><span id="clip_button"><strong>复制</strong></span></span>'
                +'</div>'

            //弹出工具盒
            var shareobj = $(".shareInfo");
            if (shareobj.length == 0) {
                eleObj = $(".icon-shareicon");
                name = "分享";
                this._toolbar = new L.DCI.Layout.ToolBar();
                this._toolbar.toolBox(name, html, eleObj);

                //zeroclioboard
                clip = new ZeroClipboard.Client();
                clip.setHandCursor(true);
                clip.addEventListener('mouseOver', function (client) {
                    // update the text on mouse over
                    clip.setText($('#shareurl')[0].value);
                });

                clip.addEventListener('complete', function (client, text) {
                    //debugstr("Copied text to clipboard: " + text );
                    alert("分享链接已复制");
                });

                clip.glue('clip_button', 'clip_container');
            } else {
                
                $("#shareurl").val(shareUrl);
            }           
        },
        
        _docCopy: function () {
            document.execCommand("Copy","false",null);
        },
        
        _getSviewData: function (srandom) {

            L.dci.app.services.SviewService.getScene({
                sid:srandom,
                context: this,
                success: function (res) {
                    this.newData = res;

                    this._reLayers(this.newData.IDs);
                    this._reView(this.newData.center, this.newData.zoom);
                    this._rePlots(this.newData.plot);
                    this._reMeasure(this.newData.measurement);
                },
                error: function () {
                    L.dci.app.util.dialog.alert("提示", "未找到对应的服务地址");
                }
            });

        },
        /**
        *保存当前视野
        *@method _reshowedit
        *param _lay{Object} 图层
        */
        _getBounds: function () {
            var bound = this._map.getBounds();
            return bound;
        },
        _getCenter: function () {
            var center = this._map.getCenter();
            return center;
        },
        _getZoom: function () {
            var zoom = this._map.getZoom();
            return zoom;
        },

        _getLayers: function () {
            var layers = this.map.getLayers();
            return layers;
        },

        _getLayerIDs: function () {
            var layerIDs = $(".leaflet-control-layertab-tab");
            var IDs = [];
            var Ltitles = [];

            for (var i = 0; i < layerIDs.length; i++) {
                //IDs[i] = layerIDs[i].id.split('-')[1];
                IDs[i] = layerIDs[i].id.replace(/[^0-9]/ig, "");
                Ltitles[i] = layerIDs[i].innerText;
            }
            return [IDs, Ltitles];
        },

        _getMeasure: function () {
            var meaInfo = {
                area: null,
                distance: null
            };
            if (this.map._measureTool != null) {
                var mTools = this.map._measureTool.Tools;
                
                if (mTools.area != null) {
                    if (mTools.area._poly != null) {
                        var latlngs = mTools.area._poly._latlngs;
                        var area = mTools.area._tooltip._popupPane.innerText;
                        var fylatlng = mTools.area.fylatlng
                        var mArea = { latlngs: latlngs, fylatlng: fylatlng, area: area };

                        meaInfo.area = mArea;
                    }
                };
                if (mTools.distance != null) {
                    if (mTools.distance._poly != null) {
                        var latlngs = mTools.distance._poly._latlngs;
                        var length = mTools.distance._popupPane.innerText;
                        var fylatlng = mTools.distance.fylatlng;
                        var mDistance = { latlngs: latlngs, fylatlng: fylatlng, length: length };

                        meaInfo.distance = mDistance;
                    };
                };
            };
            return meaInfo;            
        },


        _getPlot: function () {

            var plot = {
                point: null,
                pointtext: null,
                polyline: null,
                circle: null,
                rectangle: null,
                polygon: null
            };

            if (this.map._drawTool == null) {
                //this.map._drawTool = L.dci.draw(this.map);
            }
            else//按标绘类型分别保存标绘结果
            {
                var Tools = this.map._drawTool.Tools;
                //保存圆标绘
                if (Tools.circle != null) {
                    if (Tools.circle.lays != null) {
                        var circles = Tools.circle.lays[0]._layers;
                        var plotCir = [];
                        for (cir in circles) {
                            var center = circles[cir]._latlng;
                            var radius = circles[cir]._mRadius;
                            var mypopup = circles[cir].options.mypopup;
                            plotCir.push({ center: center, radius: radius, mypopup: mypopup });
                        };
                        plot.circle = plotCir;
                    };
                };
                //保存点标绘
                if (Tools.point != null) {
                    if (Tools.point.lays != null) {
                        var points = Tools.point.lays[0]._layers;
                        var plotPoi = [];
                        for (poi in points) {
                            var latlng = points[poi]._latlng;
                            var mypopup = points[poi].options.mypopup;
                            plotPoi.push({ latlng: latlng, mypopup: mypopup });
                        };
                        plot.point = plotPoi;
                    }
                };
                //保存标注
                if (Tools.pointtext != null) {
                    if (Tools.pointtext.lays != null) {
                        var poitxts = Tools.pointtext.lays[0]._layers;
                        var plotPoit = [];
                        for (poit in poitxts) {
                            var latlng = poitxts[poit]._latlng;
                            var mypopup = poitxts[poit].options.mypopup;
                            plotPoit.push({ latlng: latlng, mypopup: mypopup });
                        };
                        plot.pointtext = plotPoit;
                    }
                };
                //保存多边形标绘
                if (Tools.polygon != null) {
                    if (Tools.polygon.lays != null) {
                        var polygons = Tools.polygon.lays[0]._layers;
                        var plotPolygon = [];
                        for (polyg in polygons) {
                            var latlngs = polygons[polyg]._latlngs;
                            var mypopup = polygons[polyg].options.mypopup;
                            plotPolygon.push({ latlngs: latlngs, mypopup: mypopup });
                        };
                        plot.polygon = plotPolygon;
                    }
                };
                //保存折线标绘
                if (Tools.polyline != null) {
                    if (Tools.polyline.lays != null) {
                        var polylines = Tools.polyline.lays[0]._layers;
                        var plotPolyline = [];
                        for (polyl in polylines) {
                            var latlngs = polylines[polyl]._latlngs;
                            var mypopup = polylines[polyl].options.mypopup;
                            plotPolyline.push({ latlngs: latlngs, mypopup: mypopup });
                        };
                        plot.polyline = plotPolyline;
                    }
                };
                //保存矩形标绘
                if (Tools.rectangle != null) {
                    if (Tools.rectangle.lays != null) {
                        var rectangles = Tools.rectangle.lays[0]._layers;
                        var plotRec = [];
                        for (rec in rectangles) {
                            var latlngs = rectangles[rec]._latlngs;
                            var mypopup = rectangles[rec].options.mypopup;
                            plotRec.push({ latlngs: latlngs, mypopup: mypopup });
                        };
                        plot.rectangle = plotRec;
                    }
                };
            }            
            return plot;
        },

        //恢复图层
        _reLayers: function (IDs) {
            var rvIDs = this._getLayerIDs()[0];
            var rvLtitles = this._getLayerIDs()[1];

            var leftP = L.dci.app.pool.get("leftPanel");
            //如果已加载图层不再恢复数据中则移除已加载该图层
            for (var i = 0; i < rvIDs.length; i++) {
                var rid = rvIDs[i];
                var rltitle = rvLtitles[i];
                var yonA = this._contains(IDs, rid);
                if (yonA == false) {
                    leftP.layerRemove(rid, rltitle);
                }
            };
            //加载恢复数据中未加载的图层
            for (var i = 0; i < IDs.length; i++) {
                var tid = IDs[i];
                var yonB = this._contains(rvIDs, tid);
                if (yonB == false) {
                    leftP.layerAdd(tid);
                }
            };
        },


        //恢复视野
        _reView: function (center, zoom) {
            this._map.setView(center, zoom);
        },

        _reMeasure: function (measurement) {
            
            if (measurement.distance != null) {
                if (this.map._drawTool == null)
                    this.map._drawTool = L.dci.draw(this.map);
                if (this.map._drawTool.Tools.polyline == null) {
                    this.map._drawTool.Tools.polyline = new L.DCI.DrawPolyline(this._map);
                }
                ////扩展
                this.map._drawTool.Tools.polyline._onZoomEnded = function () {
                    for (var q = 0; q < this.lays.length; q++) {
                        for (ly in this.lays[q]._layers) {
                            if (this.lays[q]._layers[ly]._tooltip != null) {
                                this.lays[q]._layers[ly]._tooltip.updatePosition(this.fylatlng)
                            }
                        };
                    }
                },
                this.map._drawTool.Tools.polyline.rePolyline = function (latlngs, obj) {

                    //L.Draw.Polyline.prototype._onZoomEnd.call(this);
                    //多屏同步显示
                    var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
                    for (var q = 0; q < mapGroup.length; q++) {
                        var qmap = mapGroup[q].getMap();
                        if (this.lays == null) this.lays = [L.layerGroup([]), L.layerGroup([]), L.layerGroup([]), L.layerGroup([])];
                        var lay = L.polyline(latlngs, this.options.shapeOptions);
                        lay.clone = this.clone;

                        this.fylatlng = obj.fylatlng;

                        this.lays[q].addLayer(lay);
                        this.lays[q].addTo(qmap);
                        lay._tooltip = new L.Tooltip(qmap);

                        lay._tooltip.updatePosition(obj.fylatlng);
                        var labelText = {
                            text: obj.length,
                            subtext: null
                        };
                        lay._tooltip.updateContent(labelText);
                        var closePic = $('<img id="closePic" style="position: absolute;left: 30px;top: 32px;cursor: pointer;" alt="" src="themes/default/images/controls/draw/close.png"/>');
                        $(lay._tooltip._container).append(closePic);

                        L.DomEvent.on(closePic[0], 'click', function (e) {
                            lay._tooltip.dispose();
                            lay._tooltip = null;
                            this.lays[0].removeLayer(this.lays[0]._layers[lay._leaflet_id]);
                        }, this);
                        qmap.on('zoomend', this._onZoomEnded, this);
                        //lay._tooltip.dispose();
                    }
                }
                this.map._drawTool.Tools.polyline.rePolyline(measurement.distance.latlngs, measurement.distance);
            }

            if (measurement.area != null) {
                if (this.map._drawTool == null)
                    this.map._drawTool = L.dci.draw(this.map);

                if (this.map._drawTool.Tools.polygon == null) {
                    this.map._drawTool.Tools.polygon = new L.DCI.DrawPolygon(this._map);
                }

                ////扩展
                this.map._drawTool.Tools.polygon._onZoomEnded = function () {
                    for (var q = 0; q < this.lays.length; q++) {
                        for (ly in this.lays[q]._layers) {
                            if (this.lays[q]._layers[ly]._tooltip != null) {
                                this.lays[q]._layers[ly]._tooltip.updatePosition(this.fylatlng)
                            }
                        };
                    }
                },
                this.map._drawTool.Tools.polygon.rePolygon = function (latlngs, obj) {


                    //多屏同步显示
                    var mapGroup = L.DCI.App.pool.get("MultiMap").getMapGroup();
                    for (var q = 0; q < mapGroup.length; q++) {
                        var qmap = mapGroup[q].getMap();
                        if (this.lays == null) this.lays = [L.layerGroup([]), L.layerGroup([]), L.layerGroup([]), L.layerGroup([])];
                        var lay = L.polygon(latlngs, this.options.shapeOptions);
                        lay.clone = this.clone;
                        
                        this.fylatlng = obj.fylatlng;
                        
                        this.lays[q].addLayer(lay);
                        this.lays[q].addTo(qmap);
                        lay._tooltip = new L.Tooltip(qmap);

                        lay._tooltip.updatePosition(obj.fylatlng);
                        var labelText = {
                            text: obj.area,
                            subtext: null
                        };

                        lay._tooltip.updateContent(labelText);
                        var closePic = $('<img id="closePic" style="position: absolute;left: 30px;top: 32px;cursor: pointer;" alt="" src="themes/default/images/controls/draw/close.png"/>');
                        $(lay._tooltip._container).append(closePic);

                        L.DomEvent.on(closePic[0], 'click', function (e) {
                            lay._tooltip.dispose();
                            lay._tooltip = null;
                            this.lays[0].removeLayer(this.lays[0]._layers[lay._leaflet_id]);
                        }, this);
                        qmap.on('zoomend', this._onZoomEnded, this);
                        //lay._tooltip.dispose();
                    }
                }
                this.map._drawTool.Tools.polygon.rePolygon(measurement.area.latlngs, measurement.area);
            };            

        },


        //恢复标绘
        _rePlots: function (plot) {
            //恢复标绘信息
            if (this.map._drawTool == null)
                this.map._drawTool = L.dci.draw(this._map);
            //plot = JSON.parse(this.TestJson);
            
            var reCircle = plot.circle;
            var rePoint = plot.point;
            var rePointtext = plot.pointtext;
            var rePolygon = plot.polygon;
            var rePolyline = plot.polyline;
            var reRectangle = plot.rectangle;
            
            //恢复圆
            if (reCircle != null) {
                if (this.map._drawTool.Tools.circle == null) {
                    this.map._drawTool.Tools.circle = new L.DCI.DrawCircle(this._map);
                }
                for (var i = 0; i < reCircle.length; i++) {
                    this.map._drawTool.Tools.circle._exist(reCircle[i].center, reCircle[i].radius, reCircle[i].mypopup);
                }
            };
            //恢复点
            if (rePoint != null) {
                if (this.map._drawTool.Tools.point == null) {
                    this.map._drawTool.Tools.point = new L.DCI.DrawPoint(this._map);
                }
                for (var i = 0; i < rePoint.length; i++) {
                    this.map._drawTool.Tools.point._exist(rePoint[i].latlng, rePoint[i].mypopup);
                }
            };
            //恢复标注
            if (rePointtext != null) {
                if (this.map._drawTool.Tools.pointtext == null) {
                    this.map._drawTool.Tools.pointtext = new L.DCI.DrawPointText(this._map);
                }
                var Options = this.map._drawTool.Tools.pointtext.options;

                for (var i = 0; i < rePointtext.length; i++) {
                    this.map._drawTool.Tools.pointtext._exist(rePointtext[i].latlng, rePointtext[i].mypopup);
                }
            };
            //恢复多边形 
            if (rePolygon != null) {
                if (this.map._drawTool.Tools.polygon == null) {
                    this.map._drawTool.Tools.polygon = new L.DCI.DrawPolygon(this._map);
                }

                for (var i = 0; i < rePolygon.length; i++) {
                    this.map._drawTool.Tools.polygon._exist(rePolygon[i].latlngs, rePolygon[i].mypopup);
                }
            };
            //恢复折线
            if (rePolyline != null) {
                if (this.map._drawTool.Tools.polyline == null) {
                    this.map._drawTool.Tools.polyline = new L.DCI.DrawPolyline(this._map);
                }
                for (var i = 0; i < rePolyline.length; i++) {
                    this.map._drawTool.Tools.polyline._exist(rePolyline[i].latlngs, rePolyline[i].mypopup);
                }
            };
            //恢复矩形
            if (reRectangle != null) {
                if (this.map._drawTool.Tools.rectangle == null) {
                    this.map._drawTool.Tools.rectangle = new L.DCI.DrawRectangle(this._map);
                }
                for (var i = 0; i < reRectangle.length; i++) {

                    this.map._drawTool.Tools.rectangle._exist(reRectangle[i].latlngs, reRectangle[i].mypopup);
                }
            };            
        },   
        //判断一个元素是否包含于一个数组
        _contains: function (arr, obj) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === obj) {
                    return true;
                }
            }
            return false;
        },
    });
    return L.DCI.sview;
});