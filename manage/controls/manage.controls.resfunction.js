/**
*资源管理下功能管理类
*@module core
*@class DCI.Application
*/
define("manage/controls/resfunction", [
    "leaflet",
    "manage/layout/resfunction",
    "plugins/pagination",
    "plugins/scrollbar"
], function (L) {

    L.DCI.ResFunction = L.Class.extend({
        id: 'resFunction',

        /**
        *该模块的布局类对象
        *@property _layout
        *@type {Object}
        */
        _layout: null,
        /**
        *容器对象
        *@property _body
        *@type {Object}
        */
        _body: null,
        /**
        *树操作类对象
        *@property tree
        *@type {Object}
        */
        tree: null,
        /**
        *数据处理类对象
        *@property handleData
        *@type {Object}
        */
        handleData: null,

        /**
        *功能树数据集
        *@property functionData
        *@type {Array}
        */
        functionData: [],

        /**
        *初始化
        *@method initialize
        */
        initialize: function() {
            $(".sitemappanel_title").text("资源管理 > 功能管理");
            this._body = $(".resource_manage");
            this._layout = new L.DCI.ResFunctionLayout();
            this._body.html(this._layout.getBodyHtml());
            this.handleData = new L.DCI.Manage.HandleData();
            this.tree = new L.DCI.Tree();

            this.getFunctionTree();
            //滚动条
            $(".resFunction_Left_Container>div").mCustomScrollbar({ theme: "minimal-dark" });
            //功能树绑定事件
            $(".resFunction_Left").on('click', '.addFunction.titleIconActive', { context: this }, function (e) { e.data.context.addFunctionTree(e); });
            $(".resFunction_Left").on('click', '.deleteFunction.titleIconActive', { context: this }, function (e) { e.data.context.deleteFunctionTree(e); });
            //默认添加功能类型（只有当没有数据的时候）
            $("#addFunctionTypeDiv").on('click', 'div', { context: this }, function (e) { e.data.context.defaultAddFunctionType(e); });
            //查看样式
            $(".resFunction_Right_Body").on('click', 'input.viewClsName', { context: this }, function (e) { e.data.context.viewClsName(e); });

            //功能树--点击搜索
            $(".resFunction_Left").on('click', '.search', { context: this }, function (e) { e.data.context.search(e); });
            //功能树--搜索(回车键触发)
            $(".resFunction_Left_Search").on('keydown', 'input', { context: this }, function (e) {
                var e = e || window.event;
                if (e.keyCode == 13)
                {
                    e.data.context.search(e);
                    return false;
                }
            });
        },


        /**
        *功能资源树配置
        *@method featureTreeSetting
        *@return {Object}   返回配置Json对象
        */
        functionTreeSetting: function() {
            var _this = this;
            var setting = {
                check: {
                    enable: true,
                    chkStyle: "radio",
                    radioType: "all",
                    nocheckInherit: false
                },
                data: {
                    keep: {
                        parent: true,
                        leaf: true
                    },
                    simpleData: {
                        enable: true
                    }
                },
                edit: {
                    enable: true,
                    drag: {
                        autoExpandTrigger: true,
                        isCopy: false,
                        isMove: true,
                        autoOpenTime: 0,
                        prev: levelDrop,
                        next: levelDrop,
                        inner: false
                    },
                    showRemoveBtn: false,
                    showRenameBtn: false
                },
                callback: {
                    onCheck: function(event, treeId, treeNode) {
                        _this.functionTreeOnClick(event, treeId, treeNode);
                    },
                    onClick: function(event, treeId, treeNode) {
                        var ele = $(event.target).parent().siblings('.chk');
                        $(ele).click();
                    },
                    onDrop: onDrop,
                    beforeDrop: levelDrop
                },
            };

            function onDrop(event, treeId, treeNodes, targetNode, moveType, isCopy) {
                if (moveType != null)
                {
                    var updateOption = [treeNodes, targetNode, moveType];
                    _this._updateFunctionTreeSindex(updateOption);
                }
            }
            //禁止越级拖动
            function levelDrop(treeId, treeNodes, targetNode, moveType, isCopy) {
                if (treeNodes[0].pId == targetNode.pId)
                {
                    return true;
                };
                return false;
            };

            return setting;
        },

        /**
        *更新功能顺序
        *@method _updateFunctionTreeSindex
        *@param updateOption {Object} 节点信息
        */
        _updateFunctionTreeSindex: function (updateOption) {
            L.mtip.usetip(1, "保存中...", 1234);

            transIndex = 1;
            if (updateOption[0][0].sIndex < updateOption[1].sIndex)
            {
                if (updateOption[2] == "next")
                {
                    transIndex = updateOption[1].sIndex;
                } else if (updateOption[2] == "prev")
                {
                    transIndex = updateOption[1].sIndex - 1;
                }
            } else
            {
                if (updateOption[2] == "next")
                {
                    transIndex = updateOption[1].sIndex + 1;
                } else if (updateOption[2] == "prev")
                {
                    transIndex = updateOption[1].sIndex;
                }
            };

            //更新功能类型顺序或功能顺序
            var type = updateOption[1].type;
            if (type == "functionType")
            {
                L.baseservice.updateFunctionTypeSindex({
                    id: updateOption[0][0].functionTypeId,
                    sIndex: updateOption[0][0].sIndex,
                    targetIndex: transIndex,

                    async: true,
                    context: this,
                    success: function (num) {

                        if (num > 0)
                        {
                            this.getFunctionTree();
                            L.mtip.usetip(2, "已保存。", 2234);
                        } else
                        {
                            L.mtip.usetip(3, "未保存。", 1234);
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        L.mtip.usetip(3, "无法更新功能类型顺序", 2234);
                    }
                });
            }
            else if (type == "function")
            {
                L.baseservice.updateFunctionSindex({
                    id: updateOption[0][0].functionId,
                    pId: updateOption[0][0].functionTypeId,
                    sIndex: updateOption[0][0].sIndex,
                    targetIndex: transIndex,

                    async: true,
                    context: this,
                    success: function (num) {

                        if (num > 0)
                        {
                            this.getFunctionTree();
                            L.mtip.usetip(2, "已保存。", 2234);
                        } else
                        {
                            L.mtip.usetip(3, "未保存。", 1234);
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        L.mtip.usetip(3, "无法更新功能顺序", 2234);
                    }
                });
            }
        },



        /**
        *获取功能资源树
        *@method getFunctionTree
        */
        getFunctionTree: function() {
            L.baseservice.getFunction({
                async: true,
                context: this,
                success: function(functions) {
                    var dataObj = functions;
                    var length = dataObj.length;
                    var dataNodes = new Array();
                    if (length == 0)
                    {
                        //当没有用户数据时，显示默认添加框
                        this.openDefaultStatus();
                    }
                    else
                    {
                        dataNodes.push(this.handleData.functionTreeRoot());
                    }
                    for (var i = 0; i < length; i++) {
                        var obj = dataObj[i].Obj;
                        var values = dataObj[i].Values;
                        dataNodes.push(
                            this.handleData.functionTreeFunctionType(
                                obj.FUNCTIONTYPEID,
                                obj.FUNCTIONTYPENAME,
                                obj.CLSNAME,
                                obj.DESCRIPTION,
                                obj.SINDEX));

                        if (values.length > 0) {
                            for (var j = 0; j < values.length; j++) {
                                //if (values[j]["FUNCTIONNAME"].toLowerCase() == "splitline") continue;
                                dataNodes.push(
                                    this.handleData.functionTreeFunction(
                                        values[j].FUNCTIONID,
                                        values[j].FUNCTIONTYPEID,
                                        values[j].FUNCTIONNAME,
                                        values[j].DISPLAYNAME,
                                        values[j].EXECUTE,
                                        values[j].CLSNAME,
                                        values[j].DESCRIPTION,
                                        values[j].SINDEX));
                            }
                        } 
                    }
                    //生成树
                    var containerObj = $("#resFunctionFunctionTree");
                    this.tree.show({ "elementObj": containerObj, "setting": this.functionTreeSetting(), "nodes": dataNodes });
                    var treeObj = this.tree.getTreeObj("resFunctionFunctionTree");
                    this.tree.refresh(treeObj);
                    this._functionTreeObj = treeObj;
                },
                error: function () {
                    L.dci.app.util.dialog.alert("温馨提示", "获取功能资源树失败");
                   // L.dialog.errorDialogModel("获取功能资源树失败");
                }
            });
        },


        /**
        *显示默认添加功能类型菜单
        *@method openDefaultStatus
        */
        openDefaultStatus: function (e) {
            //显示默认添加用户框
            $(".resFunction_Left_Search").removeClass("active");
            $("#addFunctionTypeDiv").addClass("active");
            //关闭按钮
            $("#resfunction_add").removeClass("titleIconActive").addClass("titleIcon");
            $("#resfunction_delete").removeClass("titleIconActive").addClass("titleIcon");
        },
        /**
        *隐藏默认添加功能类型菜单
        *@method openDefaultStatus
        */
        closeDefaultStatus: function (e) {
            //隐藏默认添加用户框
            $(".resFunction_Left_Search").addClass("active");
            $("#addFunctionTypeDiv").removeClass("active");
        },


        /**
        *默认添加功能类型事件(只有没有功能类型数据的时候才调用)
        *@method defaultAddFunctionType
        *@param e {Object}   事件对象
        */
        defaultAddFunctionType: function (e) {
            //标题显示添加功能类型
            $(".resFunction_Right .title").addClass("highlight");
            $(".resFunction_Right .title").html("添加功能类型");
            //显示添加模块
            $(".resFunction_Right_Body").html(this._getAddFunctionTypeHtml());
            $(".resFunction_Right-save").on("click", { context: this }, function (e) { e.data.context._saveDefaultAdd(e); });
        },
        /**
        *保存默认添加功能类型
        *@method saveDefaultAdd
        *@param e {Object}   事件对象
        */
        _saveDefaultAdd: function (e) {
            var sIndex = 1;
            var typeName = $.trim($(".typeName").val());
            var themeName = $.trim($(".themeName").val());
            var description = $.trim($(".description").val());
            var typeNameObj = this.verifyFunctionTypeName(typeName);
            if (typeNameObj.verifyName == false)
            {
                $(".errorText").text(typeNameObj.errorText);
                return;
            }
            var themeNameObj = this.verifyThemeName(themeName);
            if (themeNameObj.verifyName == false)
            {
                $(".errorText").text(themeNameObj.errorText);
                return;
            }
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);
            //提交保存内容
            var data = '{"FUNCTIONTYPEID":1, "FUNCTIONTYPENAME":"' + typeName + '", "DESCRIPTION":"' + description + '","CLSNAME": "' + themeName + '", "SINDEX":' + sIndex + ',"PARENTID":1}';

            L.baseservice.addFunctionType({
                async: true,
                data: data,
                context: this,
                success: function (id) {
                    //隐藏默认添加用户框
                    this.closeDefaultStatus();

                    var newNodeId = JSON.parse(JSON.parse(id));
                    var dataNodes = new Array();
                    dataNodes.push(this.handleData.functionTreeRoot());
                    dataNodes.push(this.handleData.functionTreeFunctionType(newNodeId, typeName, themeName, description, sIndex));
                    //生成树
                    var containerObj = $("#resFunctionFunctionTree");
                    this.tree.show({ "elementObj": containerObj, "setting": this.functionTreeSetting(), "nodes": dataNodes });
                    //清空内容模版
                    this.clearContentTemp();
                    //显示保存成功提示信息
                    L.mtip.usetip(2, "添加成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "添加功能类型失败", 1234);
                }
            });
        },

        /**
        *查看样式
        *@method viewClsName
        *@param e {Object}   事件对象
        */
        viewClsName: function (e) {
            var href = 'themes/default/fonts/manage/demo.html';
            window.open(href);
        },

        /**
        *单击事件(功能资源树)
        *@method functionTreeOnClick
        *@param event {Object}      事件对象
        *@param treeId {Object}     树对象
        *@param treeNode {Object}   节点对象
        */
        functionTreeOnClick: function(event, treeId, treeNode) {
            _this = this;

            //添加按钮的激活或关闭
            if (treeNode.checked == true && treeNode.type != "function")
            {
                $("#resfunction_add").removeClass("titleIcon").addClass("titleIconActive");
            }
            else
            {
                $("#resfunction_add").removeClass("titleIconActive").addClass("titleIcon");
            }

            //删除按钮的激活或关闭
            if ((treeNode.children == undefined || treeNode.children.length == 0 )&& treeNode.checked == true)
            {
                $("#resfunction_delete").removeClass("titleIcon").addClass("titleIconActive");
            }
            else
            {
                $("#resfunction_delete").removeClass("titleIconActive").addClass("titleIcon");
            }

            //显示功能或功能类型信息
            if (treeNode.type == "function" && treeNode.checked == true)
            {
                //高亮标题
                $(".resFunction_Right .title").addClass("highlight");
                $(".resFunction_Right .title").html("编辑功能");
                //显示信息
                $(".resFunction_Right_Body").html(this._getEditFunctionHTML(treeNode));
                $(".resFunction_Right-save").on("click", { context: this }, function (e) { e.data.context._saveEditFunction(treeNode) });
            }
            else if (treeNode.type == "functionType" && treeNode.checked == true)
            {
                //高亮标题
                $(".resFunction_Right .title").addClass("highlight");
                $(".resFunction_Right .title").html("编辑功能类型");
                //显示信息
                $(".resFunction_Right_Body").html(this._getEditFunctionTypeHtml(treeNode));
                $(".resFunction_Right-save").on("click", { context: this }, function (e) { e.data.context._saveEditFunctionType(treeNode) });
            }
            else
            {
                //去掉高亮标题
                $(".resFunction_Right .title").removeClass("highlight");
                $(".resFunction_Right .title").html("");
                $(".resFunction_Right_Body").html("");
            }
        },


        /**
        *获取添加功能的html
        *@method _getAddFunctionHTML
        */
        _getAddFunctionHTML: function () {
            var html = [];
            html.push("<div class='row'><span class='redStar'>*</span><span>功能名称:</span><input class='functionName' type='text' value='' placeholder='请输入功能名称'/></div>");
            html.push("<div class='row'><span class='redStar'>*</span><span>显示名称:</span><input class='displayName' type='text' value='' placeholder='请输入显示名称且长度不能大于7'/></div>");
            html.push("<div class='row'><span class='redStar'>*</span><span>执行函数:</span><input class='codeFunctionName' type='text' value='' placeholder='请输入代码执行函数名称'/></div>");
            html.push("<div class='row'><span class='redStar'>*</span><span>样式名称:</span><input class='themeName' type='text' value='' placeholder='请输入文字图标样式名'/><input class='viewClsName' type='button' value='查看样式'/></div>");
            html.push("<div class='row'><span class='whiteStar'>*</span><span>功能描述:</span><textarea class='description'></textarea></div>");
            html.push("<div class='row'><span class='errorText'></span></div>");
            html.push('<div class="resFunction_Right-details-analyze">');
            html.push('<input class="resFunction_Right-save" type="button" value="保 存"/></div>');
            return html.join(' ');
        },
        /**
        *获取添加功能类型的html
        *@method _getAddFunctionTypeHtml
        */
        _getAddFunctionTypeHtml: function () {
            var html = [];
            html.push("<div class='row'><span class='redStar'>*</span><span>类型名称:</span><input class='typeName' type='text' value='' placeholder='请输入中文名称且长度不能大于2'/></div>");
            html.push("<div class='row'><span class='redStar'>*</span><span>样式名称:</span><input class='themeName' type='text' value='' placeholder='请输入文字图标样式名'/><input class='viewClsName' type='button' value='查看样式'/></div>");
            html.push("<div class='row'><span class='whiteStar'>*</span><span>类型描述:</span><textarea class='description'></textarea></div>");
            html.push("<div class='row'><span class='errorText'></span></div>");
            html.push('<div class="resFunction_Right-details-analyze">');
            html.push('<input class="resFunction_Right-save" type="button" value="保 存"/></div>');
            return html.join(' ');
        },
        /**
        *获取编辑功能的html
        *@method _getEditFunctionHTML
        *@param treeNode {Object}      节点对象
        */
        _getEditFunctionHTML: function (treeNode) {
            var html = [];
            html.push("<div class='row'><span class='redStar'>*</span><span>功能名称:</span><input class='functionName' type='text' value='" + treeNode.functionName + "' /></div>");
            html.push("<div class='row'><span class='redStar'>*</span><span>显示名称:</span><input class='displayName' type='text' value='" + treeNode.displayName + "' /></div>");
            html.push("<div class='row'><span class='redStar'>*</span><span>执行函数:</span><input class='codeFunctionName' type='text' value='" + treeNode.execute + "' /></div>");
            html.push("<div class='row'><span class='redStar'>*</span><span>样式名称:</span><input class='themeName' type='text' value='" + treeNode.clsName + "' /><input class='viewClsName' type='button' value='查看样式'/></div>");
            var des = treeNode.description == null ? "" : treeNode.description;
            html.push("<div class='row'><span class='whiteStar'>*</span><span>功能描述:</span><textarea class='description'>" + des + "</textarea></div>");
            html.push("<div class='row'><span class='errorText'></span></div>");
            html.push('<div class="resFunction_Right-details-analyze">');
            html.push('<input class="resFunction_Right-save" type="button" value="保 存"/></div>');
            return html.join(' ');
        },
        /**
        *获取编辑功能类型的html
        *@method _getEditFunctionTypeHtml
        *@param treeNode {Object}     节点对象
        */
        _getEditFunctionTypeHtml: function (treeNode) {
            var html = [];
            html.push("<div class='row'><span class='redStar'>*</span><span>类型名称:</span><input class='typeName' type='text' value='" + treeNode.name + "' placeholder='请输入中文名称且长度不能大于2'/></div>");
            html.push("<div class='row'><span class='redStar'>*</span><span>样式名称:</span><input class='themeName' type='text' value='" + treeNode.clsName + "' placeholder='请输入文字图标样式名'/><input class='viewClsName' type='button' value='查看样式'/></div>");
            var des = treeNode.description == null ? "" : treeNode.description;
            html.push("<div class='row'><span class='whiteStar'>*</span><span>类型描述:</span><textarea class='description'>" + des + "</textarea></div>");
            html.push("<div class='row'><span class='errorText'></span></div>");
            html.push('<div class="resFunction_Right-details-analyze">');
            html.push('<input class="resFunction_Right-save" type="button" value="保 存"/></div>');
            return html.join(' ');
        },



        /**
        *添加事件
        *@method addFunctionTree
        *@param e {Object}   事件对象
        */
        addFunctionTree: function (e) {
            var treeObj = this.tree.getTreeObj("resFunctionFunctionTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
            if (nodes.length > 0)
            {
                var treeNode = nodes[0];
                var type = treeNode.type;
                if (type == "root")
                {
                    //标题显示添加功能类型
                    $(".resFunction_Right .title").addClass("highlight");
                    $(".resFunction_Right .title").html("添加功能类型");
                    //显示添加模块
                    $(".resFunction_Right_Body").html(this._getAddFunctionTypeHtml());
                    $(".resFunction_Right-save").on("click", { context: this }, function (e) { e.data.context._saveAddFunctionType(treeNode); });
                }
                else if (type == "functionType")
                {
                    //标题显示添加功能
                    $(".resFunction_Right .title").html("添加功能");
                    //显示添加模块
                    $(".resFunction_Right_Body").html(this._getAddFunctionHTML());
                    $(".resFunction_Right-save").on("click", { context: this }, function (e) { e.data.context._saveAddFunction(treeNode); });
                }
            }
        },
        /**
        *保存按钮--添加功能类型
        *@method _saveAddFunctionType
        *@param treeNode {Object}   节点对象
        */
        _saveAddFunctionType: function (treeNode) {
            //获取索引
            var sIndex = 1;
            if (treeNode.children.length > 0)
            {
                var length = treeNode.children.length -1;
                sIndex = treeNode.children[length].sIndex +1;
            }
            var typeName = $.trim($(".typeName").val());
            var themeName = $.trim($(".themeName").val());
            var description = $.trim($(".description").val());
            var typeNameObj = this.verifyFunctionTypeName(typeName);
            if (typeNameObj.verifyName == false)
            {
                $(".errorText").text(typeNameObj.errorText);
                return;
            }
            var themeNameObj = this.verifyThemeName(themeName);
            if (themeNameObj.verifyName == false)
            {
                $(".errorText").text(themeNameObj.errorText);
                return;
            }
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);
            //提交保存内容
            var data = '{"FUNCTIONTYPEID":1, "FUNCTIONTYPENAME":"' + typeName + '", "DESCRIPTION":"' + description + '","CLSNAME": "' + themeName + '", "SINDEX":' + sIndex + ',"PARENTID":1}';

            L.baseservice.addFunctionType({
                async: true,
                data: data,
                context: this,
                success: function (id) {
                    var newNodeId = JSON.parse(JSON.parse(id));
                    var treeObj = this.tree.getTreeObj("resFunctionFunctionTree");
                    treeNode.children.push(this.handleData.functionTreeFunctionType(newNodeId, typeName, themeName, description, sIndex));
                    //取消勾选项
                    treeNode.checked = false;
                    this.tree.refresh(treeObj);
                    //清空内容模版
                    this.clearContentTemp();
                    //显示保存成功提示信息
                    L.mtip.usetip(2, "添加成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "添加功能类型失败", 1234);
                }
            });
        },
        /**
        *保存按钮--添加功能
        *@method _saveAddFunctionType
        *@param treeNode {Object}   节点对象
        */
        _saveAddFunction: function (treeNode) {
            //获取索引
            var sIndex = 1;
            if (treeNode.children.length > 0)
            {
                var length = treeNode.children.length - 1;
                sIndex = treeNode.children[length].sIndex + 1;
            }
            var functionName = $.trim($(".functionName").val());
            var displayName = $.trim($(".displayName").val());
            var codeFunctionName = $.trim($(".codeFunctionName").val());
            var themeName = $.trim($(".themeName").val());
            var description = $.trim($(".description").val());
            var functionTypeId = treeNode.functionTypeId;
            //验证功能名称
            this.verifyFunctionName(functionName, functionNameObj => {
                if (functionNameObj.verifyName == false) {
                    $(".errorText").text(functionNameObj.errorText);
                    return;
                }
                //验证显示名称
                var displayNameObj = this.verifyDisplayName(displayName);
                if (displayNameObj.verifyName == false) {
                    $(".errorText").text(displayNameObj.errorText);
                    return;
                }
                //验证执行函数名称
                var codeFunctionNameObj = this.verifyCodeFunctionName(codeFunctionName);
                if (codeFunctionNameObj.verifyName == false) {
                    $(".errorText").text(codeFunctionNameObj.errorText);
                    return;
                }
                //验证样式名称
                var themeNameObj = this.verifyThemeName(themeName);
                if (themeNameObj.verifyName == false) {
                    $(".errorText").text(themeNameObj.errorText);
                    return;
                }

                //显示保存中提示信息
                L.mtip.usetip(1, "保存中...", 1234);
                //提交保存内容
                var data = '{"FUNCTIONID":1, "FUNCTIONNAME":"' + functionName + '", "DISPLAYNAME":"' + displayName + '","FUNCTIONTYPEID": ' + functionTypeId + ', "DESCRIPTION":"' + description + '","EXECUTE":"' + codeFunctionName + '","CLSNAME":"' + themeName + '","SINDEX":' + sIndex + '}';

                L.baseservice.addFunction({
                    async: true,
                    data: data,
                    context: this,
                    success: function (id) {
                        var newNodeId = JSON.parse(JSON.parse(id));
                        var treeObj = this.tree.getTreeObj("resFunctionFunctionTree");
                        treeNode.children.push(this.handleData.functionTreeFunction(newNodeId, functionTypeId, functionName, displayName, codeFunctionName, themeName, description, sIndex));
                        //取消勾选项
                        treeNode.checked = false;
                        this.tree.refresh(treeObj);
                        //清空内容模版
                        this.clearContentTemp();
                        //显示保存成功提示信息
                        L.mtip.usetip(2, "添加成功", 1234);
                    },
                    error: function (XMLHttpRequest, errorThrown) {
                        L.mtip.usetip(3, "添加功能失败", 1234);
                    }
                });
            });
            
        },



        /**
        *保存按钮--编辑功能类型
        *@method _saveEditFunctionType
        *@param treeNode {Object}   节点对象
        */
        _saveEditFunctionType: function (treeNode) {
            //旧的数据
            var functionTypeId = treeNode.functionTypeId;
            var oldTypeName = treeNode.name;
            var oldDescription = treeNode.description == null ? "" : treeNode.description;
            var oldThemeName = treeNode.clsName;
            var oldSindex = treeNode.sIndex;
            //新的数据
            var newTypeName = $.trim($(".typeName").val());
            var newThemeName = $.trim($(".themeName").val());
            var newDescription = $.trim($(".description").val());
            if (oldTypeName == newTypeName && oldThemeName == newThemeName && oldDescription == newDescription)
            {
                //显示提示信息
                L.mtip.usetip(2, "内容没有更改", 1234);
                return;
            }
            else
            {
                //判断类型名称
                if (oldTypeName != newTypeName)
                {
                    var typeNameObj = this.verifyFunctionTypeName(newTypeName);
                    if (typeNameObj.verifyName == false)
                    {
                        $(".errorText").text(typeNameObj.errorText);
                        return;
                    }
                }
                //判断样式名称
                if (oldThemeName != newThemeName)
                {
                    var themeNameObj = this.verifyThemeName(newThemeName);
                    if (themeNameObj.verifyName == false)
                    {
                        $(".errorText").text(themeNameObj.errorText);
                        return;
                    }
                }

                //显示保存中提示信息
                L.mtip.usetip(1, "保存中...", 1234);
                //提交保存内容
                var data = '{"FUNCTIONTYPEID":' + functionTypeId + ', "FUNCTIONTYPENAME":"' + newTypeName + '", "DESCRIPTION":"' + newDescription + '","CLSNAME": "' + newThemeName + '", "SINDEX":' + oldSindex + ',"PARENTID":1}';

                L.baseservice.editFunctionType({
                    async: true,
                    data: data,
                    context: this,
                    success: function (id) {
                        var treeObj = this.tree.getTreeObj("resFunctionFunctionTree");
                        treeNode.name = newTypeName;
                        treeNode.description = newDescription;
                        treeNode.clsName = newThemeName;
                        treeObj.updateNode(treeNode);
                        //取消勾选项
                        treeNode.checked = false;
                        this.tree.refresh(treeObj);
                        //清空内容模版
                        this.clearContentTemp();
                        //显示保存成功提示信息
                        L.mtip.usetip(2, "编辑成功", 1234);
                    },
                    error: function (XMLHttpRequest, errorThrown) {
                        L.mtip.usetip(3, "编辑功能类型失败", 1234);
                    }
                });
            }
                
        },
        
        /**
        *保存按钮--编辑功能
        *@method _saveEditFunction
        *@param treeNode {Object}   节点对象
        */
        _saveEditFunction: function (treeNode) {
            //旧的数据
            var functionId = treeNode.functionId;
            var functionTypeId = treeNode.functionTypeId;
            var oldFunctionName = treeNode.functionName;
            var oldDisplayName = treeNode.displayName;
            var oldExecute = treeNode.execute;
            var oldThemeName = treeNode.clsName;
            var oldDescription = treeNode.description == null ? "" : treeNode.description;
            var oldSindex = treeNode.sIndex;
            //新的数据
            var newFunctionName = $.trim($(".functionName").val());
            var newDisplayName = $.trim($(".displayName").val());
            var newExecute = $.trim($(".codeFunctionName").val());
            var newThemeName = $.trim($(".themeName").val());
            var newDescription = $.trim($(".description").val());
            if (oldFunctionName == newFunctionName && oldDisplayName == newDisplayName && oldExecute == newExecute && oldThemeName == newThemeName && oldDescription == newDescription)
            {
                //显示提示信息
                L.mtip.usetip(2, "内容没有更改", 1234);
                return;
            }
            else
            {
                //判断功能名称
                if (oldFunctionName != newFunctionName)
                {
                    var functionNameObj = this.verifyFunctionName(newFunctionName);
                    if (functionNameObj.verifyName == false)
                    {
                        $(".errorText").text(functionNameObj.errorText);
                        return;
                    }
                }
                //判断显示名称
                if (oldDisplayName != newDisplayName)
                {
                    var displayNameObj = this.verifyDisplayName(newDisplayName);
                    if (displayNameObj.verifyName == false)
                    {
                        $(".errorText").text(displayNameObj.errorText);
                        return;
                    }
                }
                //判断执行函数
                if (oldExecute != newExecute)
                {
                    var codeFunctionNameObj = this.verifyCodeFunctionName(newExecute);
                    if (codeFunctionNameObj.verifyName == false)
                    {
                        $(".errorText").text(codeFunctionNameObj.errorText);
                        return;
                    }
                }
                //判断样式名称
                if (oldThemeName != newThemeName)
                {
                    var themeNameObj = this.verifyThemeName(newThemeName);
                    if (themeNameObj.verifyName == false)
                    {
                        $(".errorText").text(themeNameObj.errorText);
                        return;
                    }
                }

                //显示保存中提示信息
                L.mtip.usetip(1, "保存中...", 1234);
                //提交保存内容
                var data = '{"FUNCTIONID":' + functionId + ', "FUNCTIONNAME":"' + newFunctionName + '", "DISPLAYNAME":"' + newDisplayName + '","FUNCTIONTYPEID": ' + functionTypeId + ', "DESCRIPTION":"' + newDescription + '","EXECUTE":"' + newExecute + '","CLSNAME":"' + newThemeName + '","SINDEX":' + oldSindex + '}';

                L.baseservice.editFunction({
                    async: true,
                    data: data,
                    context: this,
                    success: function (id) {
                        var treeObj = this.tree.getTreeObj("resFunctionFunctionTree");
                        treeNode.name = newDisplayName;
                        treeNode.functionName = newFunctionName;
                        treeNode.displayName = newDisplayName;
                        treeNode.execute = newExecute;
                        treeNode.clsName = newThemeName;
                        treeNode.description = newDescription;
                        treeObj.updateNode(treeNode);
                        //取消勾选项
                        treeNode.checked = false;
                        this.tree.refresh(treeObj);
                        //清空内容模版
                        this.clearContentTemp();
                        //显示保存成功提示信息
                        L.mtip.usetip(2, "编辑成功", 1234);
                    },
                    error: function (XMLHttpRequest, errorThrown) {
                        L.mtip.usetip(3, "编辑功能失败", 1234);
                    }
                });
            }
        },


        

        /**
        *删除事件
        *@method deleteFunctionTree
        *@param e {Object}   事件对象
        */
        deleteFunctionTree: function (e) {
            var treeObj = this.tree.getTreeObj("resFunctionFunctionTree");
            var nodes = this.tree.getCheckedNodes({ "treeObj": treeObj, "checked": true });
            if (nodes.length > 0)
            {
                var treeNode = nodes[0];
                var type = treeNode.type;
                var id = 0;
                if (type == "function")
                {
                    id = treeNode.functionId;
                    this.deleteFunction(id, treeNode);
                }
                else if (type == "functionType")
                {
                    id = treeNode.functionTypeId;
                    this.deleteFunctionType(id, treeNode);
                }
            }
        },
        /**
        *删除功能类型
        *@method deleteFunctionType
        *@param id {Object}   功能类型id
        *@param treeNode {Object}   节点对象
        */
        deleteFunctionType: function (id,treeNode) {
            var html = this._layout.deleteFunctionHtml();
            L.dci.dialog.dialogModel('deleteModel', 150, 300, html, '删除功能类型');
            var name = treeNode.name;
            var text = '是否删除功能类型：' + name + '?';
            $(".deleteFunction p").html(text);
            $(".submitDelete").on('click', { context: this }, function (e) { e.data.context.submitDeleteFunctionType(id, treeNode); });
            $(".cancelDelete").on('click', { context: this }, function (e) { e.data.context.cancelDelete(e); });
        },
        /**
        *确定按钮--删除功能类型对话框
        *@method submitDeleteFunctionType
        *@param id {Object}   功能类型id
        *@param treeNode {Object} 节点对象
        */
        submitDeleteFunctionType: function (id,treeNode) {
            this.cancelDelete();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);

            L.baseservice.deleteFunctionType({
                async: true,
                id: id,
                context: this,
                success: function (text) {
                    var treeObj = this.tree.getTreeObj("resFunctionFunctionTree");
                    treeObj.removeNode(treeNode);
                    this.tree.refresh(treeObj);
                    //如果没有功能类型
                    var nodes = this.tree.getNodes({ "treeObj": treeObj, "key": "type", "value": "functionType" });
                    if (nodes.length == 0)
                    {
                        var node = this.tree.getNode({ "treeObj": treeObj, "key": "type", "value": "root" });
                        this.tree.removeNode({ "treeObj": treeObj, "treeNode": node });
                        this.tree.refresh(treeObj);
                        this.openDefaultStatus();
                    }
                    //清空内容模版
                    this.clearContentTemp();
                    //显示保存成功提示信息
                    L.mtip.usetip(2, "删除成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "删除功能类型失败", 1234);
                }
            });
        },
        /**
        *删除功能
        *@method deleteFunction
        *@param id {Object}   功能类型id
        *@param treeNode {Object}   节点对象
        */
        deleteFunction: function (id, treeNode) {
            var html = this._layout.deleteFunctionHtml();
            L.dci.dialog.dialogModel('deleteModel', 150, 300, html, '删除功能');
            var name = treeNode.name;
            var text = '是否删除功能：' + name + '?';
            $(".deleteFunction p").html(text);
            $(".submitDelete").on('click', { context: this }, function (e) { e.data.context.submitDeleteFunction(id, treeNode); });
            $(".cancelDelete").on('click', { context: this }, function (e) { e.data.context.cancelDelete(e); });
        },
        /**
        *确定按钮--删除功能对话框
        *@method submitDeleteFunction
        *@param id {Object}   功能类型id
        *@param treeNode {Object} 节点对象
        */
        submitDeleteFunction: function (id, treeNode) {
            this.cancelDelete();
            //显示保存中提示信息
            L.mtip.usetip(1, "保存中...", 1234);

            L.baseservice.deleteFunction({
                async: true,
                id: id,
                context: this,
                success: function (text) {
                    var treeObj = this.tree.getTreeObj("resFunctionFunctionTree");
                    treeObj.removeNode(treeNode);
                    this.tree.refresh(treeObj);
                    //清空内容模版
                    this.clearContentTemp();
                    //显示保存成功提示信息
                    L.mtip.usetip(2, "删除成功", 1234);
                },
                error: function (XMLHttpRequest, errorThrown) {
                    L.mtip.usetip(3, "删除功能失败", 1234);
                }
            });
        },
        /**
        *取消按钮--删除对话框
        *@method cancelDelete
        *@param e {Object} 事件对象
        */
        cancelDelete: function (e) {
            $("#deleteModel").remove();
        },




        /**
        *清空内容模版
        *@method clearContentTemp
        */
        clearContentTemp: function () {
            $(".resFunction_Right .title").removeClass("highlight");
            $(".resFunction_Right .title").html("");
            $(".resFunction_Right_Body").html("");
        },


        /**
        *验证功能类型名称是否唯一
        *@method verifyFunctionTypeName
        *@param name {String} 功能类型名
        *@return {Object} 功能类型名验证结果以及提示内容
        */
        verifyFunctionTypeName: function (name) {
            if (name == "")
                return { "verifyName": false, "errorText": "类型名称不能为空" };
            if (name.indexOf(" ") > -1)
                return { "verifyName": false, "errorText": "类型名称字符串不能包含空格" };
            var re = /[^\u4e00-\u9fa5]/;
            if (re.test(name))
            {
                return { "verifyName": false, "errorText": "类型名称只能为汉字" };
            }
            if (name.length > 2)
            {
                return { "verifyName": false, "errorText": "类型名称字符串长度大于2" };
            }
            var result = null;
            L.baseservice.getFunction({
                async: false,
                context: this,
                success: function (functions) {
                    if (functions == null)
                    {
                        result = { "verifyName": true, "errorText": "" };
                    }
                    else
                    {
                        var data = functions;
                        var count = 0;
                        for (var i = 0; i < data.length; i++)
                        {
                            if (data[i].Obj.FUNCTIONTYPENAME == name)
                            {
                                result = { "verifyName": false, "errorText": "类型名称已使用" };
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
                    result = { "verifyName": false, "errorText": "获取功能信息失败" };
                }
            });
            return result;
        },

        /**
        *验证样式名称
        *@method verifyThemeName
        *@param name {String} 功能类型名
        *@return {Object} 样式名称证结果以及提示内容
        */
        verifyThemeName: function (name) {
            if (name == "")
                return { "verifyName": false, "errorText": "样式名称不能为空" };
            if (name.indexOf(" ") > -1)
                return { "verifyName": false, "errorText": "样式名称字符串不能包含空格" };
            if (name.match(/\d+/g))
                return { "verifyName": false, "errorText": "样式名称字符串不能包含数字" };
            var patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
            if (patrn.exec(name))
            {
                return { "verifyName": false, "errorText": "样式名称字符串不能包含汉字" };
            }
            else
            {
                return { "verifyName": true, "errorText": "" };
            }
        },

        /**
        *验证功能名称是否唯一
        *@method verifyFunctionName
        *@param name {String} 功能类型名
        *@return {Object} 功能名验证结果以及提示内容
        */
        verifyFunctionName: function (name,fn) {
            if (name == "")
                return { "verifyName": false, "errorText": "功能名称不能为空" };
            if (name.indexOf(" ") > -1)
                return { "verifyName": false, "errorText": "功能名称字符串不能包含空格" };
            var result = null;
            L.baseservice.getFunction({
                async: false,
                context: this,
                success: function (functions) {
                    if (functions == null)
                    {
                        result = { "verifyName": true, "errorText": "" };
                    }
                    else
                    {
                        this.functionData.length = 0;
                        var data = functions;
                        //获取所有的功能信息
                        for (var i = 0; i < data.length; i++)
                        {
                            var funcData = data[i].Values;
                            for (var j = 0; j < funcData.length; j++)
                            {
                                this.functionData.push(funcData[j]);
                            }
                        }

                        //判断功能名称是否已使用
                        var count = 0;
                        for (var i = 0; i < this.functionData.length; i++)
                        {
                            if (this.functionData[i].FUNCTIONNAME == name)
                            {
                                result = { "verifyName": false, "errorText": "功能名称已使用" };
                                count = 1;
                                break;
                            }
                        }
                        if (count == 0)
                        {
                            result = { "verifyName": true, "errorText": "" };
                        }
                        fn && fn(result);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    result = { "verifyName": false, "errorText": "获取功能信息失败" };
                    fn && fn(result);
                }
            });
        },

        /**
        *验证显示名称是否唯一
        *@method verifyDisplayName
        *@param name {String} 显示名称
        *@return {Object} 显示名称验证结果以及提示内容
        */
        verifyDisplayName: function (name) {
            if (name == "")
                return { "verifyName": false, "errorText": "显示名称不能为空" };
            if (name.indexOf(" ") > -1)
                return { "verifyName": false, "errorText": "显示名称字符串不能包含空格" };
            if (name.length > 7)
            {
                return { "verifyName": false, "errorText": "显示名称字符串长度大于7" };
            }

            //判断显示名称是否已使用
            var count = 0;
            var result = null;
            for (var i = 0; i < this.functionData.length; i++)
            {
                if (this.functionData[i].DISPLAYNAME == name)
                {
                    result = { "verifyName": false, "errorText": "显示名称已使用" };
                    count = 1;
                    break;
                }
            }
            if (count == 0)
            {
                result = { "verifyName": true, "errorText": "" };
            }
            return result;
        },

        /**
        *验证执行函数是否唯一
        *@method verifyCodeFunctionName
        *@param name {String} 执行函数名称
        *@return {Object} 执行函数名称验证结果以及提示内容
        */
        verifyCodeFunctionName: function (name) {
            if (name == "")
                return { "verifyName": false, "errorText": "执行函数名称不能为空" };
            if (name.indexOf(" ") > -1)
                return { "verifyName": false, "errorText": "执行函数名称字符串不能包含空格" };
            
            //判断显示名称是否已使用
            var count = 0;
            var result = null;
            for (var i = 0; i < this.functionData.length; i++)
            {
                if (this.functionData[i].EXECUTE == name)
                {
                    result = { "verifyName": false, "errorText": "执行函数名称已使用" };
                    count = 1;
                    break;
                }
            }
            if (count == 0)
            {
                result = { "verifyName": true, "errorText": "" };
            }
            return result;
        },

        /**
        *专题搜索
        *@method search
        */
        search: function (e) {
            var text = $.trim($(".resFunction_Left_Search>input").val());
            var treeObj = this.tree.getTreeObj("resFunctionFunctionTree");
            var Nodes1 = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "type", "value": "functionType" });    //获取所有功能类型节点
            var Nodes2 = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "type", "value": "function" });        //获取所有功能节点
            var Nodes = Nodes1.concat(Nodes2);   //所有节点，根节点除外

            if (text == "")
            {
                treeObj.showNodes(Nodes);
            }
            else
            {
                var funcNodes = [], funcNodes1 = [], funcNodes2 = [];
                var searchNodes = this.tree.getNodesByParamFuzzy({ "treeObj": treeObj, "key": "name", "value": text });
                //获取搜索到的专题节点
                for (var i = 0; i < searchNodes.length; i++)
                {
                    if (searchNodes[i].type == "function")
                    {
                        funcNodes1.push(searchNodes[i]);
                    }
                }

                //获取含有功能的功能类型节点
                for (var i = 0; i < funcNodes1.length; i++)
                {
                    var parentNode = this.tree.getNode({ "treeObj": treeObj, "key": "id", "value": funcNodes1[i].pId });
                    var count = 0;
                    for (var j = 0; j < funcNodes2.length; j++)
                    {
                        if (parentNode.id == funcNodes2[j].id && parentNode.type != "root")
                        {
                            count++;
                            break;
                        }
                    }
                    if (count == 0)
                    {
                        funcNodes2.push(parentNode);
                    }
                }


                funcNodes = funcNodes1.concat(funcNodes2);

                //隐藏所有节点（除根节点）
                treeObj.hideNodes(Nodes);
                //显示模糊搜索的结果
                treeObj.showNodes(funcNodes);
            }
        },
        

    });
    return L.DCI.ResFunction;
});