/**
*附件类
*@module util
*@class DCI.Attachment
*@constructor initialize
*/
define("util/attachment", [
    "leaflet",
    "ztree",
    "manage/controls/tree",
    "core/dcins"
], function (L) {

    L.DCI.Attachment = L.Class.extend({
        /**
        *_config
        *@type {Object}
        */
        _config: false,
        /**
        *attaHtml
        *@type {Object}
        */
        attaHtml: null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this.tree = new L.DCI.Tree();
        },

        /**
        *判断是否为下载点击
        *
        *_dlfile ,
        *@type {boolean}
        */
        _dlfile: false,

        /*
        *
        *
        *
        */
        getDirectory: function (attObject,caseid,userid,type) {
            this.type = type;
            //测试代码
            //if (type == "pro") {
            //    this.CASEID = 'BM00001526';
            //} else {
            //    this.CASEID = 'BM00001640';
            //};
            //正常功能代码
            if (caseid != null) {
                this.CASEID = caseid;
            } else {

            };
            //END
            
            //var USERID = 'UE000070';
            var data = '{"CASEID":"' + this.CASEID + '","USERID":"' + Manage_ParamConfig.oaUserid + '","USERNAME":"' + Manage_ParamConfig.oaUsername + '","PASSWORD":"' + Manage_ParamConfig.oaPassword + '"}';

            var _this = this;
            this.setting = {
                view: {
                    addHoverDom: addHoverDom,
                    removeHoverDom: removeHoverDom,
                    dblClickExpand: false,
                },
                callback: {
                    onClick: function (event, treeId, treeNode) {
                        _this.featureTreeOnClick(event, treeId, treeNode);
                        var zTree = $.fn.zTree.getZTreeObj("attachmentTree");
                        zTree.expandNode(treeNode);
                    }
                },
            };

            function addHoverDom(treeId, treeNode) {
                var aObj = $("#" + treeNode.tId + "_a");
                if ($("#diyBtn_" + treeNode.id).length > 0 || treeNode.nodeType == "proFolder") return;

                var editStr = "<span id='diyBtn_" + treeNode.id + "' class='icon-downloadicon dicon' title='点击下载文件'></span>";
                aObj.append(editStr);
                var btn = $("#diyBtn_" + treeNode.id);
                _this.clickTreenode = treeNode;
                if (btn) btn.bind("click", function (event, treeId, treeNode) {
                    //下载按钮   
                    _this._dlfile = true;

                    var thisType = _this.clickTreenode.nodeType;
                    switch (thisType) {
                        case "nullcaseFolder":
                        case "proFolder":

                            break;
                            //项目附件下载
                        case "proFile":
                            var img = _this._getUrl(_this.clickTreenode.fileurl);

                            img = encodeURIComponent(img);

                            var postUrl = Project_ParamConfig.defaultServiceUrl + "/util/attachment.ashx";
                            var filedata = '{"URL":"' + img + '"}';

                            var form = $("<form>");//定义一个form表单
                            form.attr("style", "display:none");
                            form.attr("target", "");
                            form.attr("method", "post");
                            form.attr("action", postUrl);

                            var myInput = document.createElement("input");
                            myInput.setAttribute("name", "URL");
                            myInput.setAttribute("value", img);
                            form.append(myInput);
                            form.serializeArray();

                            $("body").append(form);//将表单放置在web中
                            form.submit();

                            break;
                            //业务附件文件夹下载
                        case "caseFolder":
                            var bimid = _this.CASEID;
                            var bicid = _this.clickTreenode.bicid;

                            var filedata = '{"CASEID":"' + bimid + '","BICID":"' + bicid + '","TOKEN":"' + _this.getToken() + '"}';
                            //下载文件夹
                            L.dci.app.services.utilService.dlFolder({
                                async: true,
                                data: filedata,
                                context: _this,
                                success: function (business) {

                                    var folderUrl = _this._getUrl(business);
                                    _this.myWindow = window.open(folderUrl, '右键另存为下载', 'height=500,width=720,top=100,left=100');
                                },
                                error: function () {
                                    L.dialog.errorDialogModel("文件打包失败");
                                }
                            });
                            break;
                        case "caseFile":
                        case "casePic":
                            var img = _this._getUrl(_this.clickTreenode.fileurl);

                            img = encodeURIComponent(img);

                            var postUrl = Project_ParamConfig.defaultServiceUrl + "/util/attachment.ashx";
                            var filedata = '{"URL":"' + img + '"}';

                            var form = $("<form>");//定义一个form表单
                            form.attr("style", "display:none");
                            form.attr("target", "");
                            form.attr("method", "post");
                            form.attr("action", postUrl);

                            var myInput = document.createElement("input");
                            myInput.setAttribute("name", "URL");
                            myInput.setAttribute("value", img);
                            form.append(myInput);
                            form.serializeArray();

                            $("body").append(form);//将表单放置在web中
                            form.submit();

                            break;
                        default:
                            break;

                    };

                });
            };
            function removeHoverDom(treeId, treeNode) {
                $("#diyBtn_"+treeNode.id).unbind().remove();
                //$("#diyBtn_space_" +treeNode.id).unbind().remove();
            };


            //获取OA附件目录树
            //{type} pro:项目附件；case:业务附件
            L.dci.app.services.utilService.getoaAttachment({
                async: true,
                data: data,
                context: this,
                type: type,
                success: function (business) {
                    //var data = JSON.parse(JSON.parse(business));
                    var data = business;

                    this.attaHtml = '<div class = "attahtml">'
                                        + '<div class="attahtml-title">'
                                            +'<span class="turnback icon-return"></span>'
                                            +'<div class="titlecontent">查看附件</div>'
                                        +'</div>'
                                        + '<ul id="attachmentTree" class="ztree"></ul>';
                    +'</div>'

                    if ($(".attahtml").length == 0) {
                        $(attObject).append(this.attaHtml);
                    } else {
                        $(".attahtml")[0] = this.attaHtml;
                    }
                    
                    $(".attahtml").addClass("show").siblings().removeClass("active");

                    //返回按钮
                    $(".attahtml").on('click', '.turnback', { context: this }, function (e) {
                        $(".attahtml").removeClass("show");
                        $(attObject.childNodes[1]).addClass("active")
                    });
                    
                    var dataNodes = new Array();
                    var iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
                    var iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

                    if (this.type == "pro") {
                        for (var i = 0; i < data.length; i++) {
                            //if (/\.(?:csv|xls|xlsx)$/i)

                            dataNodes[i] = { id: i, name: data[i].AffixInfoParentName, children: [], setting: this.setting, open: true, iconOpen: iconOpen, iconClose: iconClose, nodeType: "proFolder"};
                            var detail = data[i].affix
                            for (var j = 0; j < detail.length; j++) {
                                dataNodes[i].children[j] = { id: i.toString() + j.toString(), name: detail[j].AffixInfoName, fileurl: detail[j].FileUrl, nodeType: "proFile"};
                            };
                        };
                    } else {
                        for (var i = 0; i < data.length; i++) {
                            var detail = data[i].ITEMS;
                            if (detail.length == 0) {
                                dataNodes[i] = { id: i, name: data[i].ITEMNAME, children: [], icon: iconClose, bicid: data[i].ITEMID, nodeType: "caseFolder"};
                            } else {
                                dataNodes[i] = { id: i, name: data[i].ITEMNAME, children: [], open: true, iconOpen: iconOpen, iconClose: iconClose, bicid: data[i].ITEMID, nodeType: "caseFolder" };
                                for (var j = 0; j < detail.length; j++) {
                                    var detail2 = detail[j].ITEMS
                                    if (detail2.length == 0) {
                                        //判断是否为图片
                                        if (this.upPicture(detail[j].ITEMNAME)) {
                                            dataNodes[i].children[j] = { id: i.toString() + j.toString(), name: detail[j].ITEMNAME, fileurl: detail[j].AFFIXURL, bicid: detail[j].ITEMID, nodeType: "casePic" };
                                        } else {
                                            dataNodes[i].children[j] = { id: i.toString() + j.toString(), name: detail[j].ITEMNAME, icon: iconClose, bicid: detail[j].ITEMID, fileurl: detail[j].AFFIXURL, nodeType: "nullcaseFolder" };
                                        };
                                    } else {
                                        dataNodes[i].children[j] = { id: i.toString() + j.toString(), name: detail[j].ITEMNAME, children: [], open: true, iconOpen: iconOpen, iconClose: iconClose, bicid: detail[j].ITEMID, nodeType: "caseFolder" };
                                        for (var k = 0; k < detail2.length; k++) {
                                            var detail3 = detail2[k].ITEMS
                                            //最多读取三层目录树
                                            if (this.upPicture(detail2[k].ITEMNAME)) {
                                                dataNodes[i].children[j].children[k] = { id: i.toString() + j.toString() + k.toString(), name: detail2[k].ITEMNAME, fileurl: detail2[k].AFFIXURL, nodeType: "casePic" };
                                            } else {
                                                dataNodes[i].children[j].children[k] = { id: i.toString() + j.toString() + k.toString(), name: detail2[k].ITEMNAME, fileurl: detail2[k].AFFIXURL, nodeType: "caseFile" };
                                            };
                                        }
                                    };
                                };
                            };
                        };
                    };
                    
                    var containerObj = $("#attachmentTree");
                    this.tree.show({ "elementObj": containerObj, "setting": this.setting, "nodes": dataNodes });
                    var treeObj = this.tree.getTreeObj("attachmentTree");
                    this.tree.refresh(treeObj);

                },
                error: function (e) {
                    L.dialog.errorDialogModel("获取OA附件目录树");
                }
            });

            //return attObject;
        },



        upPicture: function (file) {
            var ImageFileExtend = ".gif,.png,.jpg,.ico,.bmp";
            if (file.length > 0) {
                //判断后缀
                var fileExtend = file.substring(file.lastIndexOf('.')).toLowerCase();
                //可以对fileExtend（文件后缀<.xxx>） 进行判断 处理
                if (ImageFileExtend.indexOf(fileExtend) > -1) {
                    return true;
                } else
                    return false;
            }
        },

        /**
        *重构下载地址
        *@method _getUrl
        *@param fileurl {string}      事件对象
        */
        _getUrl: function (fileurl) {
            var locaurl = Project_ParamConfig.oaSystemUrl;
            var arr = locaurl.toString().split("/");

            for (var i = 0 ; i < arr.length; i++) {
                if (arr[i] == "http:" || arr[i] == "") {
                    arr.splice(i, 1);
                    i--;
                }
            }
            var newUrl = "http://" + arr[0] + "/" + fileurl;
            return newUrl;
        },

        /**
        *单击事件（数据专题树）
        *@method featureTreeOnClick
        *@param event {Object}      事件对象
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        featureTreeOnClick: function (event, treeNodeId, treeNode) {
            //图片弹出窗口
            if (this._dlfile) {
                this._dlfile = false;
                return;
            };
                
            var whetherimg = this.upPicture(treeNode.name);
            if (whetherimg) {
                var img = this._getUrl(treeNode.fileurl);

                if ($("#attaimg").length == 0) {
                    $(".out-container").append('<div id="attaimg" class="attaimg-content"><div id="atta_title" class="atta_title"><p id="atta_scnum">' + treeNode.name + '</p><span id="atta_close" class="icon-close2"></span><img class="viewImg" src="' + img + '"><div id="coor"></div></img></div>');

                    $("#atta_close").bind('click', L.bind(function () {
                        if ($("#attaimg").length != 0) {
                            $('#attaimg').remove();
                        }
                    }, this));

                    $('.viewImg').load(function () {
                        // 加载完成   

                        var imgHeight = $('.viewImg').height();
                        $('#attaimg').height(imgHeight);
                    });
                    L.dci.app.util._drag("attaimg", "atta_title");
                    this.zoom("attaimg");
                } else {
                    $(".viewImg").attr("src", img);
                }
            } else {
                if ($("#attaimg").length != 0) {
                    $('#attaimg').remove();
                }
            }

            //if(this.myWindow){
            //    this.myWindow.close();
            //}
        },

        DownLoadFile:function (url) {

            var $iframe = $('<iframe id="down-file-iframe" />');
            var $form = $('<form target="down-file-iframe" method="Get" />');
            $form.attr('action', url);
            $iframe.append($form);
            $(document.body).append($iframe);
            $form[0].submit();
            $iframe.remove();
        },


        zoom: function (attObject) {
            $(document).mousemove(function (e) {
                if (!!this.move) {
                    var posix = !document.move_target ? { 'x': 0, 'y': 0 } : document.move_target.posix,
                        callback = document.call_down || function () {
                            $(this.move_target).css({
                                'top': e.pageY - posix.y,
                                'left': e.pageX - posix.x
                            });
                        };

                    callback.call(this, e, posix);
                }
            }).mouseup(function (e) {
                if (!!this.move) {
                    var callback = document.call_up || function () { };
                    callback.call(this, e);
                    $.extend(this, {
                        'move': false,
                        'move_target': null,
                        'call_down': false,
                        'call_up': false
                    });
                }
            });            

            var $box = $('#' + attObject).on('mousedown', '#coor', function (e) {
                var posix = {
                    'w': $box.width(),
                    'h': $box.height(),
                    'x': e.pageX,
                    'y': e.pageY
                };

                $.extend(document, {
                    'move': true, 'call_down': function (e) {
                        var scale = $('.viewImg').height() / $('.viewImg').width();
                        $box.css({
                            'width': Math.max(30, e.pageX - posix.x + posix.w),
                            'height': Math.max(30, e.pageX - posix.x + posix.w)*scale,
                        });
                    }
                });
                return false;
            });
        },



        /**
        *获取token
        *@method getToken
        */
        getToken: function () {
            var data = '';
            if (Manage_ParamConfig.isUseOAUserInfo == false) {
                //data = $.cookie('attaToken');
                data = Manage_ParamConfig.OADefaultToken;
            }else {
                var token = L.dci.app.util.user.getToken();
                data = token;
            }
            return data;
        },


    });

    return L.DCI.Attachment;
});