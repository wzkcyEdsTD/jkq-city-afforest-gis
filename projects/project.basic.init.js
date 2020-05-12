/*基础版*/
var Default_Paths = {
    "css": '../library/requirejs/css.min',
    "bootstrap": "../library/bootstrap/bootstrap.min",
    "jquery": '../library/jquery/jquery-1.11.1.min',
    "leaflet": '../library/leaflet/leaflet',
    "proj4": '../library/leaflet/proj4',
    "leaflet/proj4leaflet": '../library/leaflet/proj4leaflet',
    "leaflet/esri": '../library/leaflet/arcgis/esri-leaflet',
    "leaflet/draw": '../library/leaflet/leaflet.draw/leaflet.draw-src',
    "leaflet/epsg4490": 'L.CRS.EPSG4490',
    "leaflet/CRS2379": '../library/leaflet/L.CRS2379',
    "data/ajax": '../data/data.ajax',
    "util/dialog": '../util/util.dialog',
    "util/log": '../util/util.log',
    "util/user": '../util/util.user',
    "util/tool": '../util/util.tool',
    "util/locate": '../util/util.locate',
    "util/base": '../util/util.base',

    "core/dcins": '../core/core.namespace',
    "core/pool": '../core/core.pool',
    "core/symbol": '../core/core.symbol',
    "core/baseobject": '../core/core.baseobject',
    "controls/groupedlayer": '../controls/controls.groupedlayer',
    "plugins/cookie": "../plugins/jquery.cookie",
    "plugins/print": "../plugins/jquery.print",
    "plugins/scrollbar": "../plugins/jquery.customscrollbar/jquery.mCustomScrollbar.min",
    "bmap/application": '../bmap/bmap.application',
    "bmap/map": '../bmap/bmap.map',
    "bmap/rightpanel": '../bmap/bmap.rightpanel',
    "bmap/resultpanel": '../bmap/bmap.resultpanel',
    "bmap/foldcontrol": '../bmap/bmap.fold',
    "bmap/toolbar": '../bmap/bmap.toolbar',
    "bmap/business": '../bmap/bmap.business'
}

var Default_Shims = {
    "plugins/scrollbar": { "deps": ['jquery', 'css!../../plugins/jquery.customscrollbar/jquery.mCustomScrollbar.css'] },
    "plugins/print": { "deps": ['jquery'] },
    "bmap/rightpanel": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/bmap/bmap.rightpanel.css'] },
    "bmap/resultpanel": { "deps": ['plugins/scrollbar'] }
}

for (var item in Project_Paths) {
    Default_Paths[item] = Project_Paths[item];
}
for (var item in Project_Shim) {
    Default_Shims[item] = Project_Shim[item];
}
//****************************加载脚本***************************************//
require.config({
    paths: Default_Paths,
    shim: Default_Shims
});

//************************************************************************//

//*****************************加载后执行***********************************//
require(["leaflet",
    "bmap/map",
    "bmap/application",
    "bmap/rightpanel",
    "util/base"
], function () {
    //初始化参数
    init_params = [];
    if (location.search != null || location.search != "") {
        var params = [];
        var aParams = document.location.search.substr(1).split('&');
        for (var i = 0; i < aParams.length; i++) {
            var aParam = aParams[i].split('=');
            var sParamName = decodeURIComponent(aParam[0].toLowerCase());
            var sParamValue = decodeURIComponent(aParam[1]);
            params[sParamName] = sParamValue;
            init_params[sParamName] = sParamValue;
        }
        //定义几个全局变量保存系统传过来的参数
        var projectId = params["projectid"];
        var btmId = params["btmid"];
        var caseId = params["caseid"];
        var userId = params["userid"];
        var type = params["sysKey"];

        L.dci.app = new L.DCI.BMap.Application();
        var map = new L.DCI.BMap.Map('map', 'map_size_min', 'map_size_max', type);
        $('#map').css('display', 'block');
        L.dci.app.pool.add(map);
        var rightpanel = new L.DCI.BMap.RightPanel(); //右边模块
        L.dci.app.pool.add(rightpanel);
        L.dci.util = new L.DCI.Util();
        //这两个参数是OA要传的
        //BM0007为业务红线  BM00000880为对应的caseid    BM00000872为对应projectId;          caseid： BM00001094    
        //BM0058为编制业务  BM00001420为对应的caseid
        //BM0060为编制业务  BM00001422为对应的caseid    BM00001419为对应projectId; 
        //BM0060为编制业务  BM00001427为对应的caseid    BM00001424为对应projectId; 
        //btmId = 'BM0007';
        //caseId = 'BM00001094';
        //projectId = 'BM00000872';
        //定义几个全局变量
        businessProjectData = null;     //业务数据
        businessType = '';              //业务类型
        refreshData = null;             //复位按钮执行复位功能所需要的数据

        map.map.whenReady(function () {
            if (btmId == null || btmId == undefined)
            {//项目视图（oa中的大视图）
                map.getProjectInfo(projectId);//获取项目信息
            } else
            {
                //表单（oa中的小视图）
                map.getBusinessInfo(projectId,btmId,caseId);    //获取运维配置的服务信息
            }
        });
    }
});

