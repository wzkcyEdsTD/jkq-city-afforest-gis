/**
*消息框类
*@module util
*@class DCI.Dialog
*@constructor initialize
*/
define("util/dialog", [
    "leaflet",
    "core/dcins",
    "bootstrap"
], function (L) {
    L.DCI.Dialog = L.Class.extend({
        /**
        *界面主体
        *@property _body
        *@type {String}
        *@private
        */
        _body: '<div class="modal fade" id="modal-dialog">'
                + '<div class="modal-dialog modal-sm dci-modal">'
                + '<div class="modal-content">'
                + '<div class="modal-header">'
                + '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
                + '<h4 class="modal-title" id="modal-title">标题</h4>'
                + '</div>'
                + '<div class="modal-body">'
                + '<p id="modal-text">内容</p>'
                + '</div>'
                + '<div class="modal-footer">'
                + '<button type="button" class="btn dci-btn" id="modal-todo">确认</button>'
                + '<button type="button" class="btn btn-default" data-dismiss="modal" id="modal-close">关闭</button>'
                + '</div></div></div></div>',
        /**
        *容器
        *@property _container
        *@type {Object}
        *@private
        */
        _container: null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this._container = L.DomUtil.create("div", "", document.body);
            this._container.innerHTML = this._body;
            L.DomEvent.addListener(L.DomUtil.get("modal-close"), "click", function () {
                this._close();
            }, this);
        },
        /**
        *关闭提示框
        *@method _close
        *@private
        */
        _close: function () {
            $('#modal-dialog').modal('hide');
        },
        /**
        *显示提示框
        *@method _show
        *@private
        */
        _show: function () {
            $('#modal-dialog').modal("show");
        },
        /**
        *设置提示框显示
        *@method _setDialog
        *@private
        */
        _setDialog: function (title, text) {
            L.DomUtil.get("modal-title").innerHTML = title;
            L.DomUtil.get("modal-text").innerHTML = text;
        },
        /**
        *设置关闭按钮显示
        *@method _setClose
        *@private
        */
        _setClose: function (visible) {
            if (visible == true) {
                L.DomUtil.get("modal-close").style.display = "";
            } else
                L.DomUtil.get("modal-close").style.display = "none";
        },

        /**
        *信息框
        *@method alert
        *@param title {String} 提示框标题
        *@param text {String} 提示框显示内容
        */
        alert: function (title, text) {
            this._setClose(false);
            this._setDialog(title, text);
            this._show();
            $("#modal-todo").unbind();
            $("#modal-todo").bind("click", this, function (event) {
                event.data._close();
            });
        },

        /**
        *错误框
        *@method error
        *@param title {String} 提示框标题
        *@param text {String} 提示框显示内容
        */
        error: function (title, text) {
            this._setClose(false);
            this._setDialog(title, text);
            this._show();
            $("#modal-todo").unbind();
            $("#modal-todo").bind("click", this, function (event) {
                event.data._close();
            });
        },

        /**
        *确认框
        *@method confirm
        *@param title {String} 提示框标题
        *@param text {String} 提示框显示内容
        *@param callback {Function} 回调函数
        */
        confirm: function (title, text, callback) {
            this._setClose(true);
            this._setDialog(title, text);
            this._show();
            $("#modal-todo").unbind();
            $("#modal-todo").bind("click", this, function (event) {
                event.data._close();
                callback();
            });
            $("#modal-close").bind("click", this, function (event) {
                event.data._close();
            });
        },

        /**
        *对话框模版
        *@method dialogModel
        *@param id {String} 对话框的id
        *@param top {Number} 对话框距顶部的距离
        *@param width {Number} 对话框的宽度
        *@param html {String} 对话框的内容元素
        */
        dialogModel: function (id, top, width, html, title) {
            var tempHtml = '<div class="dialogModel" id="' + id + '">'
                            + '<div class="dialogModel_Mask"></div>'
                            + '<div class="dialogModel_Body">'
                                + '<div class="dialogModel_Container">'
                                    + '<div class="dialogModel_Container_Title">'
                                        + '<span>' + title + '</span>'
                                        + '<span class="icon-close1 closeModel"></span>'
                                    + '</div>'
                                    + '<div class="dialogModel_Container_Content"></div>'
                                + '</div>'
                            + '</div>'
                      + '</div>';

            $("body").append(tempHtml);
            $(".dialogModel_Container_Content").html(html);
            $(".dialogModel").css("display", "block");
            if (top == undefined || top == null)
                top = 150;
            if (width != undefined || width != null)
                $(".dialogModel_Container").css("width", width);
            //$(".dialogModel_Container").slideDown("slow");
            //$(".dialogModel_Container").fadeIn("fast");
            $(".dialogModel_Body").animate({
                top: top + 'px'
            }, 500);

            $(".dialogModel .closeModel").on('click', { context: this }, function (e) {
                var obj = $(e.target).parents(".dialogModel");
                e.data.context.closeDialogModel(obj);
            });
        },

        /**
        *隐藏对话框
        *@method hideDialogModel
        *@param obj {Object} 对话框元素对象
        */
        hideDialogModel: function (obj) {
            obj.css("display", "none");
        },

        /**
        *关闭对话框
        *@method closeDialogModel
        *@param obj {Object} 对话框元素对象
        */
        closeDialogModel: function (obj) {
            obj.remove();
        },


        /**
        *错误提示对话框
        *@method errorDialogModel
        *@param errorText {String} 提示内容
        */
        errorDialogModel: function (errorText) {
            var tempHtml = '<div class="errorDialogModel">'
                            + '<div class="errorDialogModel_Title">'
                                + '<span>温馨提示</span>'
                                + '<span class="icon-close1 closeModel"></span>'
                            + '</div>'
                            + '<div class="errorDialogModel_Content">' + errorText + '</div>'
                         + '</div>';

            $("body").append(tempHtml);

            $(".errorDialogModel").animate({
                top: '30px'
            }, 500);

            $(".errorDialogModel .closeModel").on('click', { context: this }, function (e) {
                var obj = $(e.target).parents(".errorDialogModel");
                e.data.context.closeErrorDialogModel(obj);
            });
        },


        /**
        *关闭错误提示对话框
        *@method closeErrorDialogModel
        *@param obj {Object} 对话框元素对象
        */
        closeErrorDialogModel: function (obj) {
            obj.remove();
        }

    });

    return L.DCI.Dialog;
});