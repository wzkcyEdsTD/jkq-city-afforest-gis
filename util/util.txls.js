/**
*xls文件导出类
*@module util
*@class DCI.TXls
*/
define("util/txls", [
    "leaflet",
    "bootstrap",
    "core/dcins"
], function (L) {
    L.DCI.TXls = L.Class.extend({
        /**
        *初始化
        *@method initialize
        */
        initialize: function () { },
        /**
        *转换成xls文件
        *@method converttoxls
        *@param e {object}||{string} 表单所在容器（DOM对象或HTML字符串），容器内应该有且只有一个结构完整（包括thead和tbody）的table
        */
        converttoxls: function (e) {
            //获取表单元素并放入新创建的临时表单
            $(".leftcontentpanel-body").append('<div id="temptable"></div>');
            $(e).clone(true).appendTo("#temptable");
            //将所有表单元素设置为显示状态
            $("#temptable table tr").css({ "display": "block" });

            //导出Excel文件
            if (!!window.ActiveXObject || "ActiveXObject" in window) {   //如果是IE浏览器
                //把thead和tbody放在同一个table里
                $("#temptable tbody").parent().prepend($("#temptable thead"));
                var winname = window.open('', '_blank', 'top=10000');
                var strHTML = $("#temptable tbody").parent().parent().html();
                winname.document.open('text/html', 'replace');
                winname.document.writeln(strHTML);
                winname.document.execCommand('saveas', '', 'tableExport.xls');
                winname.close();
            } else {   //如果不是IE浏览器
                //data协议方式
                var table = document.getElementById("temptable");
                var html = table.outerHTML;
                window.open('data:application/vnd.ms-excel;base64,' + this.base64Encode(html));
            }
            //移除临时表单
            $("#temptable").remove();
        },
        /**
        *base64编码
        *@method base64Encode
        *@param input {string} 
        */
        base64Encode: function (input) {
            var rv;
            rv = encodeURIComponent(input);
            rv = unescape(rv);
            rv = window.btoa(rv);
            return rv;
        }
    });
    return L.DCI.TXls;

});
