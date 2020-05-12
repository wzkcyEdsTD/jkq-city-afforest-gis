/*管理版*/
var Default_Paths = {
    "jquery": '../library/jquery/jquery-1.11.1.min',
    "bootstrap": "../library/bootstrap/bootstrap.min",
    "css": '../library/requirejs/css.min',
    "leaflet": '../library/leaflet/leaflet',
    "library/echarts": "../library/echarts/echarts",
    //"libaray/echarts-all": "../library/echarts/echarts-all",

    "proj4": '../library/leaflet/proj4',
    "leaflet/proj4leaflet": '../library/leaflet/proj4leaflet',
    "leaflet/CRS2379": '../library/leaflet/L.CRS2379',
    "leaflet/wmts": '../library/leaflet/wmts',
    "leaflet/esri": '../library/leaflet/arcgis/esri-leaflet',
    "leaflet/draw": '../library/leaflet/leaflet.draw/leaflet.draw-src',
    "leaflet/label": '../library/leaflet/leaflet.label/leaflet.label',
    "leaflet/contextmenu": '../library/leaflet/leaflet.contextmenu/leaflet.contextmenu',
    "leaflet/polylineDecorator": '../library/leaflet/leaflet.polylineDecorator',
    "leaflet/es5sham": '../library/leaflet/es5-sham.min',
    "leaflet/es5shim": '../library/leaflet/es5-shim.min',

    "core/dcins": "../core/core.namespace",
    "core/baseobject": '../core/core.baseobject',
    "core/application": '../core/core.application',
    "core/pool": '../core/core.pool',
    "core/map": '../core/core.map',
    "core/multimap": '../core/core.multimap',
    "core/symbol": '../core/core.symbol',

    "data/ajax": '../data/data.ajax',
    "data/services": '../data/data.services',
    "data/baseservice": '../data/data.baseservice',
    "data/analysis": '../data/data.analysis',
    "data/business": '../data/data.business',
    "data/statistics": '../data/data.statistics',
    "data/query": '../data/data.query',
    "data/util": '../data/data.util',
    "data/common/sview": '../data/data.common.sview',

    "layout/base": '../layout/layout.base',
    "layout/centerpanel": '../layout/layout.centerpanel',
    "layout/bottompanel": '../layout/layout.bottompanel',
    "layout/leftpanel": '../layout/layout.leftpanel',
    "layout/rightpanel": '../layout/layout.rightpanel',

    "layout/toppanel": '../layout/layout.toppanel',
    "layout/menu": '../layout/layout.menu',
    "layout/toolbar": '../layout/layout.toolbar',
    "layout/leftcontentpanel": '../layout/layout.leftcontentpanel',
    "layout/tool": '../layout/layout.tool',

    "controls/defaultextent": '../controls/controls.defaultextent',
    "controls/minimap": '../controls/controls.minimap',
    "controls/scalebar": '../controls/controls.scalebar',
    "controls/navigation": '../controls/controls.navigation',
    "controls/measure": '../controls/controls.measure',
    "controls/loading": '../controls/controls.loading',
    "controls/opacity": '../controls/controls.opacity',
    "controls/legend": '../controls/controls.legend',
    "controls/layerswitch": '../controls/controls.layerswitch',
    "controls/draw": '../controls/controls.draw',
    "controls/pan": "../controls/controls.pan",
    "controls/groupedlayer": "../controls/controls.groupedlayer",
    "controls/layertab": '../controls/controls.layertab',
    "controls/fullscreen": '../controls/controls.fullscreen',
    "controls/dlLegend": '../controls/controls.dynamicLayerLegend',
    "controls/paging": '../controls/controls.paging',
    "controls/indexandopacity": '../controls/controls.layerIndexAndOpacity',
    "controls/timeslider": '../controls/controls.timeslider',

    "query/quickquery": '../modules/query/query.quickquery',
    "query/identify": '../modules/query/query.identify',
    "query/projectidentify": '../modules/query/query.projectidentify',
    "query/resultpanel": '../modules/query/query.resultpanel',
    "query/contain": '../modules/query/query.contain',
    "query/relatedidentify": '../modules/query/query.relatedidentify',

    "analysis/addcad": '../modules/analysis/analysis.addcad',
    "analysis/colorpick": '../modules/analysis/colorpick/jquery.cxcolor',
    "analysis/landbalance": '../modules/analysis/analysis.landbalance',
    "analysis/landstrength": '../modules/analysis/analysis.landstrength',
    "analysis/gpHandler": '../modules/analysis/gp/gpHandler',
    "analysis/geoprocessor": '../modules/analysis/gp/geoprocessor',
    "analysis/netvolumeratio": '../modules/analysis/analysis.netvolumeratio',
    "analysis/landstock": '../modules/analysis/analysis.landstock',
    "analysis/autogp": '../modules/analysis/analysis.autogp',
    "analysis/publicservice": '../modules/analysis/analysis.publicservice',

    "common/plotting": '../modules/common/common.plotting',
    "common/projectPhase": '../modules/common/common.projectPhase',
    "common/businessTemplate": '../modules/common/common.businessTemplate',
    "common/sview": '../modules/common/common.sview',
    "zeroclipboard": '../library/zeroclipboard/ZeroClipboard',


    "login/settings": '../modules/login/login.settings',

    "output/print": '../modules/output/output.print',
    "output/legend": '../modules/output/output.legend',

    "plugins/base64": "../plugins/base64.min",
    "plugins/print": "../plugins/jquery.print",
    "plugins/mousewheel": '../plugins/jquery.mousewheel/jquery.mousewheel',
    "plugins/draggable": '../plugins/jquery.draggable/jquery.draggable',
    "plugins/scrollbar": "../plugins/jquery.customscrollbar/jquery.mCustomScrollbar.min",
    "plugins/cookie": "../plugins/jquery.cookie",
    "plugins/rotate": '../plugins/jquery.rotate',
    "plugins/form": '../plugins/jquery.form',
    "plugins/icheck": '../plugins/jquery.icheck/icheck',
    "plugins/bxslider": "../plugins/jquery.bxslider/jquery.bxslider",
    "plugins/pagination":"../plugins/plugins.pagination",
    "plugins/tableexport": "../plugins/tableExport",
    
    "util/dialog": '../util/util.dialog',
    "util/log": '../util/util.log',
    "util/user": '../util/util.user',
    "util/tool": '../util/util.tool',
    "util/locate": '../util/util.locate',
    "util/base": '../util/util.base',
    "util/attachment": '../util/util.attachment',
    "util/txls": '../util/util.txls',
    "manage/controls/tree": '../manage/controls/manage.controls.tree',
    "ztree": '../library/zTree/js/jquery.ztree.all-3.5.min',
    "ztree/exhide": '../library/zTree/js/jquery.ztree.exhide-3.5.min',


    "business/approvalcharts": '../modules/business/business.approvalcharts',
    "business/sxonemap": '../modules/business/business.sxonemap',
    "business/query": '../modules/business/business.query',
    "business/projectmap": '../modules/business/business.projectmap',
    "business/organization": '../modules/business/business.organization.query',
    "business/approvedmap": '../modules/business/business.approvedmap',
    "business/approvedtracking": '../modules/business/business.approvedtracking',
    "business/approvedmapillegalproject": '../modules/business/business.approvedmap.illegalproject',
    "business/compilemap": '../modules/business/business.compilemap',
    "business/regulatoryplan": '../modules/business/business.regulatoryplan',
    "business/wholelifecycle": '../modules/business/business.wholelifecycle',
    "business/wholelifecycleexamine": '../modules/business/business.wholelifecycle.examine',
    "business/wholelifecycleapproval": '../modules/business/business.wholelifecycle.approval',
    "business/indexcontrast": '../modules/business/business.indexcontrast',
    "business/mapmonitor": '../modules/business/business.mapmonitor'
};

var Default_Shims = {
    "bootstrap": { "deps": ['jquery'] },
    "leaflet": { deps: ['css!../library/leaflet/leaflet.css'] },
    "leaflet/esri": { deps: ['leaflet'] },
    "leaflet/draw": { deps: ["leaflet", 'css!../../../library/leaflet/leaflet.draw/leaflet.draw.css'] },
    "leaflet/label": { deps: ["leaflet", 'css!../../../library/leaflet/leaflet.label/leaflet.label.css'] },
    "leaflet/contextmenu": { deps: ['css!../../../library/leaflet/leaflet.contextmenu/leaflet.contextmenu.css'] },
    "leaflet/polylineDecorator": { deps: ['leaflet'] },
    "proj4": { deps: ['leaflet', "leaflet/es5shim"] },
    "leaflet/proj4leaflet": { deps: ['leaflet'] },
    "controls/defaultextent": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/controls.defaultextent.css'] },
    "controls/minimap": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/controls.minimap.css'] },
    "controls/scalebar": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/controls.scalebar.css'] },
    "controls/navigation": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/controls.navigation.css'] },
    "controls/loading": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/controls.loading.css'] },
    "controls/legend": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/controls.legend.css'] },
    "controls/toolbar": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/controls.toolbar.css'] },
    "controls/sidebar": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/controls.sidebar.css'] },
    "controls/pan": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/controls.pan.css'] },
    "controls/groupedlayer": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/controls.groupedlayer.css'] },
    "controls/layertab": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/controls.layertab.css'] },
    "controls/dlLegend": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/controls.dynamicLayerLegend.css'] },
    "controls/fullscreen": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/controls.fullscreen.css'] },
    "controls/paging": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/controls.paging.css'] },
    "controls/indexandopacity": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/controls.layerIndexAndOpacity.css'] },
    "controls/timeslider": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/controls.timeslider.css'] },

    "layout/toolbar": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/layout.toolbar.css'] },
    "layout/leftcontentpanel": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/layout.leftcontentpanel.css'] },

    "query/projectidentify": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/query.projectidentify.css'] },
    "query/resultpanel": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/query.resultpanel.css'] },
    "query/contain": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/query.contain.css'] },

    "common/plotting": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/common.plotting.css'] },
    "common/sview": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/common.sview.css', 'zeroclipboard'] },
    "common/projectPhase": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/common.projectPhase.css'] },
    "common/businessTemplate": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/common.businessTemplate.css'] },

    "output/print": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/output.print.css'] },
    "output/legend": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/output.legend.css'] },

    "login/settings": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/login.settings.css'] },

    "analysis/addcad": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/analysis.addcad.css'] },
    "analysis/colorpick": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/jquery.cxcolor.css'] },
    "analysis/landbalance": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/analysis.landbalance.css'] },
    "analysis/landstrength": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/analysis.landstrength.css'] },
    "analysis/netvolumeratio": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/analysis.netvolumeratio.css'] },
    "analysis/landstock": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/analysis.landbalance.css', 'css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/analysis.landstock.css'] },
    "analysis/publicservice": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/analysis.publicservice.css'] },
    
    //"analysis/autogp": { deps: ['analysis/gpHandler'] },

    "plugins/scrollbar": { deps: ['css!../../plugins/jquery.customscrollbar/jquery.mCustomScrollbar.css'] },
    "plugins/icheck": { deps: ['css!../../plugins/jquery.icheck/red.css'] },
    "plugins/pagination": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/plugins.pagination.css'] },

    "business/sxonemap": { deps: ['plugins/scrollbar', 'css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/business.sxonemap.css'] },
    "business/projectmap": { deps: ['plugins/scrollbar','css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/business.projectmap.css'] },
    "business/approvalcharts": { deps: ['plugins/scrollbar', 'css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/business.approvalcharts.css'] },
    "business/approvedmap": { deps: ['plugins/scrollbar', 'css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/business.approvedmap.css'] },
    "business/approvedtracking": { deps: ['plugins/scrollbar', 'css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/business.approvedtracking.css'] },
    "business/approvedmapillegalproject": { deps: ['plugins/scrollbar', 'css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/business.approvedmap.illegalproject.css'] },
    "business/compilemap": { deps: ['plugins/scrollbar', 'css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/business.compilemap.css'] },
    "business/regulatoryplan": { deps: ['plugins/scrollbar', 'css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/business.regulatoryplan.css'] },
    "controls/spotanalysis": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/controls.spotAnalysis.css'] },
    "business/query": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/business.query.css'] },
    "business/wholelifecycle": { deps: ['plugins/scrollbar', 'css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/business.wholelifecycle.css'] },
    "business/indexcontrast": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/business.indexcontrast.css'] },
    "business/mapmonitor": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/business.mapmonitor.css'] },
    
    "util/locate": { deps: ['leaflet', 'leaflet/esri'] },

    "util/attachment": { deps: ['css!../../library/zTree/css/zTreeStyle/zTreeStyle.css', 'css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/util.attachment.css'] },
   
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
require([
    "jquery",
    "leaflet",
    "bootstrap",
    "core/application",
    "analysis/autogp",
    "util/log"
], function () {
    $(document).ready(function () {
        var center = document.getElementById("initCenter").value;
        var zoom = document.getElementById("initZoom").value;
        var caseId = document.getElementById("initCaseId").value;
        var btmId = document.getElementById("initBtmId").value;
        document.title = Project_ParamConfig.title;
        L.DCI.App = new L.DCI.Application(Project_ParamConfig);
        L.dci.app = L.DCI.App;
        if (center != null && zoom != null) {
            L.dci.app.initZoom = {
                center: center,
                zoom: zoom,
                caseId: caseId,
                btmId: btmId
            };
        }
        L.dci.application = L.DCI.App;
        L.dci.app.init();
        //判断、执行GP服务预处理
        this.autogp = new L.DCI.AutoGP();
        //this.autogp.getDivisions();
        L.dci.log = new L.DCI.Log();
    });
   
});
//*****************************加载后执行***********************************//