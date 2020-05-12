/**
*服务注册类
*@module core
*@class DCI.Application
*/
define("manage/controls/registerresource", [
    "leaflet",
    "manage/layout/resourcepanel",
    "plugins/pagination",
    "plugins/scrollbar"
], function (L) {

    L.DCI.RegisterResource = L.Class.extend({
        id: 'registerResource',
        _layout: null,
        _body: null,

        layers: [],         //保存矢量图服务的图层信息
        showNum: 10,         //每页显示资源个数
        pageCount: 0,       //页码总数
        currentPage: 1,      //当前页码

        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            $(".sitemappanel_title").text("资源管理 > 服务注册");
            this._body = $(".resource_manage");
            this._layout = new L.DCI.ResourcePanelLayout();
            this._body.html(this._layout.getBodyHtml());
            this.getResources(1);
            $(".registerResource_add").on("click", { context: this }, function (e) { e.data.context.addResourceDialog() });
            //改变显示个数
            $(".registerResource_search select").on("change", { context: this }, function (e) {
                var num = parseInt($(this).val());
                e.data.context.changeShowNum(num)
            });
            //点击搜索
            $(".registerResource_search").on('click', '.search', { context: this }, function (e) { e.data.context.search(e); });
            //搜索(回车键触发)
            $(".registerResource_search").on('keydown', 'input', { context: this }, function (e) {
                var e = e || window.event;
                if (e.keyCode == 13)
                {
                    e.data.context.search(e);
                    return false;
                }
            });

        },

        /**
        *添加服务对话框
        *@method addResourceDialog
        */
        addResourceDialog: function () {
            //显示对话框
            var html = this._layout.addResourceHtml();
            L.dci.dialog.dialogModel('addResourceModel', 150, 400, html, '添加服务');

            $(".addResourcedropdownMenu a").on('click', { context: this }, function (e) { e.data.context.selectType(e); });
            $("#addResourcedropdownMenuText").on('click', { context: this }, function (e) { e.data.context.showDropMenu(e); });
            $(".addResourcedropdownMenu").on('mouseleave', { context: this }, function (e) { e.data.context.hideDropMenu(e); });

            $(".saveResource").on('click', { context: this }, function (e) { e.data.context.saveResource(e); });
            $(".cancelResouce").on('click', { context: this }, function (e) { e.data.context.cancelResouce(e); });
        },

        /**
        *显示下拉菜单
        *@method showDropMenu
        *@param e {Object} 事件对象
        */
        showDropMenu: function (e) {
            var obj = $(".addResourcedropdownMenu");
            obj.css("display", "block");
        },

        /**
        *隐藏下拉菜单
        *@method showDropMenu
        *@param e {Object} 事件对象
        */
        hideDropMenu: function (e) {
            var obj = $(".addResourcedropdownMenu");
            obj.css("display", "none");
        },

        /**
        *选择类型
        *@method showDropMenu
        *@param e {Object} 事件对象
        */
        selectType: function (e) {
            var text = $(e.target).text();
            switch (text)
            {
                case '矢量图层':
                    $("#addResourcedropdownMenuText").attr("data-info", "1");
                    break;
                case '切片图层':
                    $("#addResourcedropdownMenuText").attr("data-info", "2");
                    break;
                case 'WMS图层':
                    $("#addResourcedropdownMenuText").attr("data-info", "3");
                    break;
                case 'WMTS图层':
                    $("#addResourcedropdownMenuText").attr("data-info", "4");
                    break;
                case '注记图层':
                    $("#addResourcedropdownMenuText").attr("data-info", "5");
                    break;
                default: break;
            }
            $("#addResourcedropdownMenuText").attr("value", text);
            this.hideDropMenu();
        },

        /**
        *保存按钮--添加服务对话框
        *@method saveResource
        *@param e {Object} 事件对象
        */
        saveResource: function (e) {
            var name = $.trim($(".addResource .txtName").val());
            var obj = this.verifyResourceName(name);
            if (obj.verifyName == false)
            {
                $(".errorText").text(obj.errorText);
                return;
            }

            var url = $.trim($(".addResource .txtURL").val());
            if (url == "")
            {
                $(".errorText").text("服务地址不能为空");
                return;
            }

            this.closeButton();

            this.add();
            //L.baseservice.getLayers({
            //    url: url,
            //    context: this,
            //    success: function (resource) {
            //        if (resource.layers == undefined || resource.layers == null)
            //        {
            //            this.openButton();
            //            $(".errorText").text("服务地址有误，请检查");
            //        }
            //        else
            //            this.add();
            //    },
            //    error: function (XMLHttpRequest, textStatus, errorThrown) {
            //        this.openButton();
            //        $(".errorText").text("服务地址有误，请检查");
            //    }
            //});

        },

        /**
        *取消按钮--添加服务对话框
        *@method cancelResouce
        *@param e {Object} 事件对象
        */
        cancelResouce: function (e) {
            $("#addResourceModel").remove();
        },

        /**
        *禁用按钮
        *@method closeButton
        *@param elements {Object} 元素集
        */
        closeButton: function (elements) {
            $(".saveResource").attr("disabled", false);
        },

        /**
        *启用按钮
        *@method openButton
        *@param elements {Object} 元素集
        */
        openButton: function (elements) {
            $(".saveResource").removeAttr("disabled");
        },

        /**
        *验证服务名称
        *@method verifyResourceName
        *@param name {String} 服务名称
        *@return {Object} 服务名称验证结果以及提示内容
        */
        verifyResourceName: function (name) {
            if (name == "")
                return { "verifyName": false, "errorText": "服务名称不能为空" };
            if (name.indexOf(" ") > -1)
                return { "verifyName": false, "errorText": "服务名称不能包含空格" };
            if (name.length > 10)
            {
                return { "verifyName": false, "errorText": "服务名称长度不能大于10" };
            }
            var result = null;
            L.baseservice.getResource({
                async: false,
                context: this,
                success: function (resource) {
                    if (resource == null)
                    {
                        result = { "verifyName": true, "errorText": "" };
                    }
                    else
                    {
                        var data = resource;
                        var count = 0;
                        for (var i = 0; i < data.length; i++)
                        {
                            if (data[i].RESOURCENAME == name)
                            {
                                result = { "verifyName": false, "errorText": "服务名称已使用，请重新重新输入" };
                                count = 1;
                                break;
                            }
                        }
                        if (count == 0)
                        {
                            result = { "verifyName": true, "errorText": "" };
                        }
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    result = { "verifyName": false, "errorText": "获取所有资源信息失败" };
                }
            });
            return result;
        },
        /**
        *更新锁定状态
        *@method updateResourceLock
        *@param elements {Object} 元素集
        */
        updateResourceLock: function (e) {
            var resourceId = $(e.target).parents().attr("data-info");
            var locked = $(e.target).attr("lock");
            L.baseservice.updateResourceLock({
                resourceId: resourceId,
                locked: locked,
                async: true,
                context: this,
                success: function (data) {
                    this.getResources(this.currentPage);
                    //显示保存成功提示信息
                    L.mtip.usetip(2, "更新成功", 1234);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.mtip.usetip(3, "更新失败", 1234);
                }
            });
        },

        //获取分页资源
        getResources: function (option) {
            var text = $.trim($(".registerResource_search>div>input").val());
            this.currentPage = option;
            if (text == "")
            {
                L.baseservice.getPageResource({
                    showNum: this.showNum,
                    pageNum: this.currentPage,
                    async: true,
                    context: this,
                    success: function (data) {
                        //var obj = JSON.parse(data);
                        this.showPagingInfo(data);
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        L.dci.app.util.dialog.alert("温馨提示", "获取服务列表失败");
                        //L.dialog.errorDialogModel("获取服务列表失败");
                    }
                });
            }
            else
            {
                L.baseservice.getPageResourceByFuzzy({
                    name: text,
                    showNum: this.showNum,
                    pageNum: this.currentPage,
                    async: true,
                    context: this,
                    success: function (data) {
                        //var obj = JSON.parse(data);
                        this.showPagingInfo(data);
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        L.dci.app.util.dialog.alert("温馨提示", "获取服务列表失败");
                        //L.dialog.errorDialogModel("获取服务列表失败");
                    }
                });
            }

        },

        //显示分页信息
        showPagingInfo: function (option) {
            var mainObj = $(".registerResource_content");
            var divObj = $(".registerResource_content>div>div");
            if (divObj.length > 0)
            {
                $(".registerResource_content>div").remove();
                mainObj.html('<div></div>');
            }

            var resourceCount = option.Count;      //资源总数
            var showNum = option.Objects.length;
            if (resourceCount == 0)
            {
                //当没有资源时，隐藏类为registerResource_content的div，并且将类为registerResource_add的样式改变
                $(".registerResource_content").addClass("contentHide");
                $(".registerResource_add").addClass("addMoveTop");
            }
            else
            {
                if ($(".registerResource_content").hasClass("contentHide"))
                    $(".registerResource_content").removeClass("contentHide");
                if ($(".registerResource_add").hasClass("addMoveTop"))
                    $(".registerResource_add").removeClass("addMoveTop");


                var html = '';
                this.pageCount = Math.ceil(resourceCount / this.showNum);


                for (var i = 0; i < showNum; i++)
                {
                    var id = option.Objects[i].RESOURCEID;       //资源id
                    var name = option.Objects[i].RESOURCENAME;   //资源名称
                    var type = option.Objects[i].RESOURCETYPEID;   //资源类型
                    var key = option.Objects[i].KEY;     //资源关键字
                    var url = option.Objects[i].URL;     //资源地址
                    var metadata = option.Objects[i].METADATAID;   //元数据id
                    var locked = option.Objects[i].ISLOCKEDOUT;       //资源锁定状态
                    html += this._layout.resourceHtml(id, name, type, key, url, metadata, locked);
                }

                $(".registerResource_content >div").html(html);
                //滚动条
                $(".registerResource_content>div").mCustomScrollbar({
                    theme: "minimal-dark"
                });

                //调用分页函数
                var _this = this;
                var page = new L.DCI.Pagination({
                    pageCount: this.pageCount,
                    currentPage: this.currentPage,
                    showPageNum: 5,
                    containerObj: $('.registerResource_paging'),
                    pageChange: function (page) {
                        _this.changePage(page);
                    }
                });




            }

            //更新锁定
            $(".reslock").on("click", { context: this }, function (e) { e.data.context.updateResourceLock(e) });
            //修改服务
            $(".resourceEdit").on("click", { context: this }, function (e) {
                var resourceId = $(this).parents(".resourceContent").attr("data-info");
                var obj = $(this).siblings(".resourceAttribute").find(".attriuteValue");
                var name = $(obj[0]).text();
                var type = $(obj[1]).text();
                var url = $(obj[2]).text();
                e.data.context.updateResource(resourceId, name, type, url)
            });
            //删除服务
            $(".resourceDelete").on("click", { context: this }, function (e) {
                var id = $(e.target).parents().attr("data-info");
                var name = $(e.target).attr("data-name");
                e.data.context.deleteData({ "id": id, "name": name });
            });
        },

        /**
        *改变每页显示个数
        *@method changeShowNum
        *@param num {Object}       当前请求的显示个数
        */
        changeShowNum: function (num) {
            this.showNum = num;
            this.getResources(1);
        },

        /**
        *改变页码
        *@method changePage
        *@param page {Object}       当前请求的页码
        */
        changePage: function (page) {
            this.currentPage = page;
            this.getResources(page);
        },

        /**
        *添加服务
        *@method add
        */
        add: function () {
            var type = parseInt($.trim($("#addResourcedropdownMenuText").attr("data-info")));
            var name = $.trim($(".txtName").val());
            var url = $.trim($(".txtURL").val());
            var obj = $("#addResourceModel");
            //验证服务地址是否正确
            var varifyUrl = this.varifyUrl(url);
            if (varifyUrl.varify == false)
            {
                var errorText = varifyUrl.error;
                $("#addResourceModel .errorText").html(errorText);
                return;
            }
            //验证服务是否已存在
            var checkRepeatUrl = this.checkRepeatUrl(url,type);
            if (checkRepeatUrl.varify == false)
            {
                var errorText = checkRepeatUrl.error;
                $("#addResourceModel .errorText").html(errorText);
                return;
            }

            ////删除对话框
            this.cancelResouce();
            switch (type)
            {
                case 1: this.addDynamicMapService({ name: name, url: url, type: type }); break;   //添加矢量图
                case 2: this.addTiledMapService({ name: name, url: url, type: type }); break;     //添加切片图
                case 3: this.addDynamicMapService({ name: name, url: url, type: type }); break;     //添加WMS图(同矢量图处理)
                case 4: this.addTiledMapService({ name: name, url: url, type: type }); break;       //添加WMTS图(同切片图处理)
                case 5: this.addDynamicMapService({ name: name, url: url, type: type }); break;   //添加注记图
                default: break;
            }
        },


        /**
        *添加切片图服务
        *@method addTiledMapService
        *@param options {Object} 参数（name:服务名称，type:服务类型，url:服务地址）
        */
        addTiledMapService: function (options) {
            var name = options.name;
            var url = options.url;
            var type = options.type;
            var data = '{ "RESOURCENAME":"' + name + '", "RESOURCETYPEID":' + type + ',"URL": "'
                + url + '", "PROXYURL":"","KEY":"","ISLOCKEDOUT":0,"METADATAID":1, "DESCRIPTION":""}';
            L.baseservice.addResource({
                async: true,
                data: data,
                context: this,
                success: function (text) {
                    if (text.indexOf("Message") > -1)
                    {
                        L.mtip.usetip(3, "添加服务失败", 1234);
                    } else
                    {
                        this.getResources(1);
                        //显示保存成功提示信息
                        L.mtip.usetip(2, "添加成功", 1234);
                    }
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "添加服务失败", 1234);
                }
            });

        },

        /**
        *添加矢量图服务
        *@method addDynamicMapService
        *@param options {Object} 参数（name:服务名称，type:服务类型，url:服务地址）
        */
        addDynamicMapService: function (options) {
            var name = options.name;
            var url = options.url;
            var type = options.type;
            L.baseservice.getLayers({
                url: url,
                context: this,
                success: function (layerdata) {
                    var resourcepanel = L.app.pool.get("registerResource");
                    resourcepanel.layers = [];
                    var obj = layerdata.layers;
                    var length = layerdata.layers.length;
                    if (length > 0)
                    {
                        for (var i = 0; i < length; i++)
                        {
                            if (type != 5) {
                                if (obj[i].subLayerIds == null) {
                                    resourcepanel.layers.push({ "name": obj[i].name, "address": "", "index": obj[i].id });
                                }
                            } else {
                                resourcepanel.layers.push({ "name": obj[i].name, "address": "", "index": obj[i].id });
                            }
                        }
                    }

                    var layerhtml = '';
                    var layerObj = resourcepanel.layers;
                    var length = layerObj.length;
                    if (length > 0)
                    {
                        layerhtml += '{"LAYERNAME": "' + layerObj[0].name + '","ADDRESSNAME":"","SINDEX":"' + layerObj[0].index + '"}';
                        for (var j = 1; j < length; j++)
                        {
                            layerhtml += ',{"LAYERNAME": "' + layerObj[j].name + '","ADDRESSNAME":"","SINDEX":"' + layerObj[j].index + '"}';
                        }
                    }
                    var data = '{ "Resource": { "RESOURCENAME":"'
                        + name + '", "RESOURCETYPEID":"'
                        + type + '","URL": "'
                        + url + '", "PROXYRUL":"", "KEY":"","ISLOCKEDOUT":"0","METADATAID":"1", "DESCRIPTION":""},"Layers":[' + layerhtml + '] }';
                    L.baseservice.addResourceAndLayer({
                        async: true,
                        data: data,
                        context: this,
                        success: function (text) {
                            if (text.indexOf("Message") > -1)
                            {
                                L.mtip.usetip(3, "添加失败", 1234);
                            } else
                            {
                                this.getResources(1);
                                //显示保存成功提示信息
                                L.mtip.usetip(2, "添加成功", 1234);
                            }
                        },
                        error: function (XMLHttpRequest, errorThrown) {
                            L.mtip.usetip(3, "添加失败", 1234);
                        }
                    });
                },
                error: function (XMLHttpRequest, status, errorThrown) {
                    L.mtip.usetip(3, "获取服务图层信息失败", 1234);
                }
            });

        },

        /**
        *修改按钮--更新资源
        *@method updateResource
        *@param options {Object} 参数（resourceId:服务id，name:服务名称，type:服务类型，url:服务地址）
        */
        updateResource: function (resourceId, name, type, url) {
            //显示对话框
            var html = this._layout.addResourceHtml();
            L.dci.dialog.dialogModel('addResourceModel', 150, 400, html, '修改服务');

            $(".addResourcedropdownMenu a").on('click', { context: this }, function (e) { e.data.context.selectType(e); });
            $("#addResourcedropdownMenuText").on('click', { context: this }, function (e) { e.data.context.showDropMenu(e); });
            $(".addResourcedropdownMenu").on('mouseleave', { context: this }, function (e) { e.data.context.hideDropMenu(e); });
            var resourceType = 0;
            switch (type)
            {
                case '矢量图层':
                    resourceType = 1;
                    break;
                case '切片图层':
                    resourceType = 2;
                    break;
                case 'WMS图层':
                    resourceType = 3;
                    break;
                case 'WMTS图层':
                    resourceType = 4;
                    break;
                case '注记图层':
                    resourceType = 5;
                    break;
                default: break;
            }

            //显示旧的数据
            $(".txtName").val(name);
            $(".txtURL").val(url);
            switch (type)
            {
                case '矢量图层':
                    $("#addResourcedropdownMenuText").attr("data-info", "1");
                    break;
                case '切片图层':
                    $("#addResourcedropdownMenuText").attr("data-info", "2");
                    resourceType = 2;
                    break;
                case 'WMS图层':
                    $("#addResourcedropdownMenuText").attr("data-info", "3");
                    resourceType = 3;
                    break;
                case 'WMTS图层':
                    $("#addResourcedropdownMenuText").attr("data-info", "4");
                    resourceType = 4;
                    break;
                case '注记图层':
                    $("#addResourcedropdownMenuText").attr("data-info", "5");
                    resourceType = 5;
                    break;
                default: break;
            }
            $("#addResourcedropdownMenuText").attr("value", type);

            //确定事件，传递该服务的原始数据，以便后面对比验证
            $(".saveResource").on('click', { context: this }, function (e) { e.data.context.saveUpdateResource(resourceId, name, resourceType, url); });
            $(".cancelResouce").on('click', { context: this }, function (e) { e.data.context.cancelResouce(e); });

        },

        /**
        *确定按钮--更新资源
        *@method saveUpdateResource
        *@param options {Object} 参数（resourceId:服务id，name:服务名称，type:服务类型，url:服务地址）
        */
        saveUpdateResource: function (resourceId, name, type, url) {
            var newName = $.trim($(".txtName").val());
            var newUrl = $.trim($(".txtURL").val());
            var newType = parseInt($.trim($("#addResourcedropdownMenuText").attr("data-info")));

            var originType, currentType;
            if (type == 1 || type == 3)
                originType = '矢量类型';
            else if (type == 2 || type == 4)
                originType = '切片类型';
            else
            { }

            if (newType == 1 || newType == 3)
                currentType = '矢量类型';
            else if (newType == 2 || newType == 4)
                currentType = '切片类型';
            else
            { }

            //数据变量
            var resourceName = name;
            var resourceType = type;
            var resourceUrl = url;
            var isDeleteLayers = false;    //是否删除资源的对应所有图层信息
            var layerhtml = '';
            var data = '';

            //若数据没变化则关闭弹出框
            if (name == newName && type == newType && url == newUrl)
            {
                this.cancelResouce();
                return;
            }
            else (name != newName || type != newType || url != newUrl)
            {
                //服务名称改变
                if (name != newName)
                {
                    var obj = this.verifyResourceName(newName);
                    if (obj.verifyName == false)
                    {
                        $(".errorText").text(obj.errorText);
                        return;
                    }
                    resourceName = newName;
                }

                //服务类型是否改变（这里指大类切片或矢量）
                if (originType != currentType)
                    resourceType = newType;

                //服务地址是否改变
                var getLayers = false;
                if (url != newUrl)
                {
                    resourceUrl = newUrl;
                    var varifyUrl = this.varifyUrl(newUrl);
                    var checkRepeatUrl = this.checkRepeatUrl(newUrl,newType);
                    if (varifyUrl.varify == false)
                    {
                        var errorText = varifyUrl.error;
                        $("#addResourceModel .errorText").html(errorText);
                        return;
                    }

                    if (checkRepeatUrl.varify == false)
                    {
                        var errorText = checkRepeatUrl.error;
                        $("#addResourceModel .errorText").html(errorText);
                        return;
                    }
                    

                    if ((originType == '矢量类型' && currentType == '矢量类型') || (originType == '矢量类型' && currentType == '切片类型'))
                    {
                        isDeleteLayers = true;   //当原来的类型为矢量时，要删除原来的图层信息
                    }
                    if (currentType == '矢量类型')
                        getLayers = true;

                }
                else
                {
                    if (originType == '矢量类型' && currentType == '切片类型')
                        isDeleteLayers = true;   //当原来的类型为矢量时，要删除原来的图层信息
                    if (originType == '切片类型' && currentType == '矢量类型')
                        getLayers = true;
                }

                //如果getLayers为true，则获取服务的图层信息
                if (getLayers == true)
                {
                    var varifyUrl = this.varifyUrl(newUrl);
                    if (varifyUrl.varify == false)
                    {
                        var errorText = varifyUrl.error;
                        $("#addResourceModel .errorText").html(errorText);
                        return;
                    }
                    else
                    {
                        L.baseservice.getLayers({
                            async: false,
                            url: resourceUrl,
                            context: this,
                            success: function (layerdata) {
                                var resourcepanel = L.app.pool.get("registerResource");
                                resourcepanel.layers = [];
                                var obj = layerdata.layers;
                                var length = layerdata.layers.length;
                                if (length > 0)
                                {
                                    for (var i = 0; i < length; i++)
                                    {
                                        if (obj[i].subLayerIds == null)
                                        {
                                            resourcepanel.layers.push({ "name": obj[i].name, "address": "", "index": obj[i].id });
                                        }
                                    }
                                }

                                var layerObj = resourcepanel.layers;
                                var length = layerObj.length;
                                if (length > 0)
                                {
                                    layerhtml += '{"LAYERNAME": "' + layerObj[0].name + '","ADDRESSNAME":"","SINDEX":"' + layerObj[0].index + '"}';
                                    for (var j = 1; j < length; j++)
                                    {
                                        layerhtml += ',{"LAYERNAME": "' + layerObj[j].name + '","ADDRESSNAME":"","SINDEX":"' + layerObj[j].index + '"}';
                                    }
                                }
                                data = '{ "RESOURCEID":"'
                                    + resourceId + '", "RESOURCENAME":"'
                                    + resourceName + '","RESOURCETYPE": "' + resourceType + '", "URL":"' + resourceUrl + '", "ISDELETELAYERS":' + isDeleteLayers + ',"Layers":[' + layerhtml + '] }';
                                this.updateReSourceData(data);
                            },
                            error: function (XMLHttpRequest, status, errorThrown) {
                                L.mtip.usetip(3, "获取服务图层信息失败", 1234);
                            }
                        });
                    }
                }
                else
                {
                    data = '{ "RESOURCEID":"'
                                + resourceId + '", "RESOURCENAME":"'
                                + resourceName + '","RESOURCETYPE": "' + resourceType + '", "URL":"' + resourceUrl + '", "ISDELETELAYERS":' + isDeleteLayers + ',"Layers":[' + layerhtml + '] }';
                    this.updateReSourceData(data);
                }
            }

















        },


        /**
        *验证服务地址
        *@method varifyUrl
        *@param url {String} 地图服务地址
        */
        varifyUrl: function (url) {
            data = '{"url": "' + url + '"}';
            var varifyUrl = null;
            L.baseservice.varifyServiceUrl({
                async: false,
                context: this,
                data: data,
                success: function (varify) {
                    varifyUrl = varify;
                },
                error: function (XMLHttpRequest, status, errorThrown) {
                    L.mtip.usetip(3, "验证服务地址失败", 1234);
                }
            });
            return varifyUrl;
        },

        /**
        *验证服务地址
        *@method checkRepeatUrl
        *@param url {String} 地图服务地址
        *@param type {String} 地图服务类型
        */
        checkRepeatUrl:function(url,type)
        {
            var checkRepeatUrl = {
                varify: true,
                error: ""
                };
            L.baseservice.getResource({
                showNum: this.showNum,
                pageNum: this.currentPage,
                async: false,
                context: this,
                success: function (data) {
                    for (var i = 0; i < data.length; i++)
                    {
                        if (url == data[i].URL && type == data[i].RESOURCETYPEID)
                        {
                            checkRepeatUrl = {
                                varify: false,
                                error: "服务已存在"
                            };
                            break;
                        }
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.mtip.usetip(3, "判断服务是否存在失败", 1234);
                }
            });

            return checkRepeatUrl;
        },

        /**
        *请求服务--更新资源信息
        *@method updateReSourceData
        *@param options {Object} 参数
        */
        updateReSourceData: function (data) {
            this.cancelResouce();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);

            L.baseservice.updateResourceData({
                data: data,
                async: true,
                context: this,
                success: function (text) {
                    var num = JSON.parse(JSON.parse(text));
                    if (num > 0)
                    {
                        this.getResources(1);
                        //显示保存成功提示信息
                        L.mtip.usetip(2, "修改成功", 1234);
                    } else
                    {
                        L.mtip.usetip(3, "修改失败", 1234);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.mtip.usetip(3, "修改失败", 1234);
                }
            });
        },


        //删除服务
        deleteData: function (options) {
            var html = this._layout.deleteResourceHtml();
            L.dci.dialog.dialogModel('deleteResourceModel', 150, 300, html, '删除服务');
            var text = '是否删除服务:' + options.name + ' ?';
            $(".deleteResource p").html(text);
            $(".submitDeleteResource").on('click', { context: this }, function (e) { e.data.context.submitDeleteResource(options.id); });
            $(".cancelDeleteResource").on('click', { context: this }, function (e) { e.data.context.cancelDeleteResource(e); });
        },
        /**
        *取消按钮--删除服务对话框
        *@method cancelDeleteResource
        *@param e {Object} 事件对象
        */
        cancelDeleteResource: function (e) {
            $("#deleteResourceModel").remove();
        },
        /**
        *确定按钮--删除服务对话框
        *@method submitDeleteResource
        *@param resourceId {Number} 服务id
        */
        submitDeleteResource: function (resourceId) {
            this.cancelDeleteResource();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);

            L.baseservice.deleteResource({
                id: resourceId,
                async: true,
                context: this,
                success: function (text) {
                    var num = JSON.parse(JSON.parse(text));
                    if (num == 1)
                    {
                        this.cancelDeleteResource();
                        this.getResources(1);
                        //显示保存成功提示信息
                        L.mtip.usetip(2, "删除成功", 1234);
                    } else
                    {
                        L.mtip.usetip(3, "删除失败", 1234);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.mtip.usetip(3, "删除失败", 1234);
                }
            });
        },


        search: function (e) {
            this.currentPage = 1;
            this.getResources(this.currentPage);
        },
    });
    return L.DCI.RegisterResource;
});