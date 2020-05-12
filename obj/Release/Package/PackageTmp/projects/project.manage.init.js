/*运维系统*/
var Default_Paths = {
    "leaflet": '../library/leaflet/leaflet',
    "leaflet/esri": '../library/leaflet/arcgis/esri-leaflet',
    "jquery": '../library/jquery/jquery-1.11.1',
    "bootstrap": '../library/bootstrap/bootstrap.min',
    "css": '../library/requirejs/css.min',
    "ztree": '../library/zTree/js/jquery.ztree.all-3.5.min',
    "ztree/exhide": '../library/zTree/js/jquery.ztree.exhide-3.5.min',

    "manage/controls/tree": '../manage/controls/manage.controls.tree',
    "manage/controls/userpanel": '../manage/controls/manage.controls.userpanel',
    "manage/controls/userpanelUserTree": '../manage/controls/manage.controls.userpanel_usertree',
    "manage/controls/userpanelRoleTree": '../manage/controls/manage.controls.userpanel_roletree',
    "manage/controls/registerresource": '../manage/controls/manage.controls.resourcepanel',
    "manage/controls/featurepanel": '../manage/controls/manage.controls.featurepanel',
    "manage/controls/featurepanelResourceTree": '../manage/controls/manage.controls.featurepanel_resourcetree',
    "manage/controls/resfunction": '../manage/controls/manage.controls.resfunction',
    "manage/controls/privilegeconfig": '../manage/controls/manage.controls.privilegeconfig',
    "manage/controls/loggingpanel": '../manage/controls/manage.controls.loggingpanel',
    "manage/controls/visitedlogging": '../manage/controls/manage.controls.visitedlogging',
    "manage/controls/layerContrast": '../manage/controls/manage.controls.layerContrast',
    "manage/controls/globalsearchpanel": "../manage/controls/manage.controls.globalsearchpanel",
    "manage/controls/resourcetree": '../manage/controls/manage.controls.resourcetree',

    "core/dcins": "../core/core.namespace",
    "core/baseobject": '../core/core.baseobject',
    "core/pool": '../core/core.pool',
    "core/application": '../manage/manage.application',

    "data/ajax": '../data/data.ajax',
    "data/manage/baseservice": '../data/data.manage.baseservice',
    "data/manage/handledata": '../data/data.manage.handledata',

    "manage/layout/userpanel": '../manage/layout/manage.layout.userpanel',
    "manage/layout/resourcepanel": '../manage/layout/manage.layout.resourcepanel',
    "manage/layout/featurepanel": '../manage/layout/manage.layout.featurepanel',
    "manage/layout/resfunction": '../manage/layout/manage.layout.resfunction',
    "manage/layout/privilegeconfig": '../manage/layout/manage.layout.privilegeconfig',
    "manage/layout/loggingpanel": '../manage/layout/manage.layout.loggingpanel',
    "manage/layout/visitedlogging": '../manage/layout/manage.layout.visitedlogging',
    "manage/layout/layerContrast": '../manage/layout/manage.layout.layerContrast',
    "manage/layout/globalsearchpanel": "../manage/layout/manage.layout.globalsearchpanel",

    "plugins/pagination": '../plugins/plugins.pagination',
    "plugins/scrollbar": "../plugins/jquery.customscrollbar/jquery.mCustomScrollbar.min",
    "plugins/md5": '../plugins/md5/md5',
    "plugins/cookie": "../plugins/jquery.cookie",
    "plugins/datetimepicker": '../plugins/bootstrap-datetimepicker/bootstrap-datetimepicker.min',
    "plugins/datetimepicker.zh-CN": '../plugins/bootstrap-datetimepicker/bootstrap-datetimepicker.zh-CN',
    "plugins/icheck": '../plugins/jquery.icheck/icheck',
    
    "util/dialog": '../util/util.dialog',
    "util/user": '../util/util.user',
    "util/mtip": '../util/util.mtip'
}

var Default_Shims = {
    "bootstrap": { "deps": ['jquery'] },
    "leaflet": { deps: ['css!../library/leaflet/leaflet.css'] },
    "leaflet/esri": { deps: ['leaflet'] },
    "ztree": { deps: ['jquery'] },
    "ztree/exhide": { deps: ['ztree'] },
    "core/application": { deps: ['core/pool'] },
    "manage/controls/userpanel": { deps: ['css!../../../themes/' + Base_ParamConfig.defaultTheme + '/css/manage/manage.controls.userpanel.css', 'data/manage/baseservice', 'data/manage/handledata'] },
    "manage/controls/registerresource": { deps: ['css!../../../themes/' + Base_ParamConfig.defaultTheme + '/css/manage/manage.controls.resourcepanel.css', 'data/manage/baseservice', 'data/manage/handledata'] },
    "manage/controls/featurepanel": { deps: ['css!../../../themes/' + Base_ParamConfig.defaultTheme + '/css/manage/manage.controls.featurepanel.css', 'data/manage/baseservice', 'data/manage/handledata'] },
    "manage/controls/resfunction": { deps: ['css!../../../themes/' + Base_ParamConfig.defaultTheme + '/css/manage/manage.controls.resfunction.css', 'data/manage/baseservice', 'data/manage/handledata'] },
    "manage/controls/privilegeconfig": { deps: ['css!../../../themes/' + Base_ParamConfig.defaultTheme + '/css/manage/manage.controls.privilegeconfig.css', 'data/manage/baseservice', 'data/manage/handledata'] },
    "manage/controls/loggingpanel": { deps: ['css!../../../themes/' + Base_ParamConfig.defaultTheme + '/css/manage/manage.controls.loggingpanel.css', 'data/manage/baseservice', 'data/manage/handledata', 'data/ajax', "plugins/datetimepicker"] },
    "manage/controls/visitedlogging": { deps: ['css!../../../themes/' + Base_ParamConfig.defaultTheme + '/css/manage/manage.controls.visitedlogging.css', 'data/manage/baseservice', 'data/manage/handledata', 'data/ajax'] },
    "manage/controls/layerContrast": { deps: ['css!../../../themes/' + Base_ParamConfig.defaultTheme + '/css/manage/manage.controls.layerContrast.css', 'data/manage/baseservice', 'data/manage/handledata', 'data/ajax'] },
    "manage/controls/globalsearchpanel": { deps: ['css!../../../themes/' + Base_ParamConfig.defaultTheme + '/css/manage/manage.controls.globalsearchpanel.css', 'data/manage/baseservice', 'data/manage/handledata', 'data/ajax'] },

    "plugins/datetimepicker": { deps: ['css!../../plugins/bootstrap-datetimepicker/bootstrap-datetimepicker.css'] },
    "plugins/pagination": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/plugins.pagination.css'] },
    "plugins/scrollbar": { deps: ['css!../../plugins/jquery.customscrollbar/jquery.mCustomScrollbar.css'] },
    "plugins/icheck": { deps: ['css!../../plugins/jquery.icheck/red.css'] },

    "util/dialog": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/util.dialog.css'] },
    "util/mtip": { deps: ['css!../../themes/' + Base_ParamConfig.defaultTheme + '/css/util.mtip.css'] }
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
//***************************加载后执行*********************//
require([
    "leaflet",
    "core/dcins",
    "core/application",
    "data/manage/baseservice",
    "data/manage/handledata",
    "util/dialog",
    "util/mtip"
], function (L) {
    $(document).ready(function () {
        document.title = Manage_ParamConfig.defaultTitle;
        L.baseservice = new L.DCI.Manage.BaseServices();
        L.handledata = new L.DCI.Manage.HandleData();
        L.app = new L.DCI.Application();
        L.app.menu("用户管理");
        L.dialog = new L.DCI.Dialog();
        L.mtip = new L.DCI.MTip();
    });
});