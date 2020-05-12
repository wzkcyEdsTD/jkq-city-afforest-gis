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
    "leaflet/polylineDecorator": '../library/leaflet/leaflet.polylineDecorator',
    "leaflet/es5sham": '../library/leaflet/es5-sham.min',
    "leaflet/es5shim": '../library/leaflet/es5-shim.min',

    "core/dcins": "../core/core.namespace",
    "core/baseobject": '../core/core.baseobject',
    "core/pool": '../core/core.pool',
    "core/symbol": '../core/core.symbol',

    "data/ajax": '../data/data.ajax',
    "controls/groupedlayer": "../controls/controls.groupedlayer",
    "plugins/cookie": "../plugins/jquery.cookie",
    "plugins/scrollbar": "../plugins/jquery.customscrollbar/jquery.mCustomScrollbar.min",
    "util/dialog": '../util/util.dialog',
    "util/log": '../util/util.log',
    "util/user": '../util/util.user',
    "util/tool": '../util/util.tool',
    "util/locate": '../util/util.locate',
    "util/base": '../util/util.base',

    "splitscreen/application": '../splitscreen/splitScreen.application',
    "splitscreen/map": '../splitscreen/splitScreen.map',
    "splitscreen/compareResult": '../splitscreen/splitScreen.compareResult'
};

var Default_Shims = {
    "bootstrap": { "deps": ['jquery'] },
    "leaflet": { deps: ['css!../library/leaflet/leaflet.css'] },
    "leaflet/esri": { deps: ['leaflet'] },
    "leaflet/draw": { deps: ["leaflet", 'css!../../../library/leaflet/leaflet.draw/leaflet.draw.css'] },
    "leaflet/label": { deps: ["leaflet", 'css!../../../library/leaflet/leaflet.label/leaflet.label.css'] },
    "leaflet/polylineDecorator": { deps: ['leaflet'] },
    "proj4": { deps: ['leaflet', "leaflet/es5shim"] },
    "leaflet/proj4leaflet": { deps: ['leaflet'] },
    "plugins/scrollbar": { deps: ['css!../../plugins/jquery.customscrollbar/jquery.mCustomScrollbar.css'] },

    "util/locate": { deps: ['leaflet', 'leaflet/esri'] }
}

for (var item in Project_Paths)
{
    Default_Paths[item] = Project_Paths[item];
}
for (var item in Project_Shim)
{
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
    "splitscreen/application",
    "util/log"
], function () {
    $(document).ready(function () {
        if (location.search != null || location.search != "")
        {
            //document.title = Project_ParamConfig.title;
            L.DCI.App = new L.DCI.Application(Project_ParamConfig);
            L.dci.app = L.DCI.App;
            L.dci.application = L.DCI.App;
            var params = [];
            var aParams = document.location.search.substr(1).split('&');
            for (var i = 0; i < aParams.length; i++)
            {
                var aParam = aParams[i].split('=');
                var sParamName = decodeURIComponent(aParam[0].toLowerCase());
                var sParamValue = decodeURIComponent(aParam[1]);
                params[sParamName] = sParamValue;
            }
            var type = params["t"];
            L.dci.app.init(type);
            document.title = Project_ParamConfig.title + "-" + type;
            L.dci.log = L.DCI.Log();
        }
        
    });

});
//*****************************加载后执行***********************************//