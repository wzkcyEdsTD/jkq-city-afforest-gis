/**
*基础配置
*@module config
*@class Base_ParamConfig
*@static
*/
var Base_ParamConfig = {
    /**
    *默认使用样式
    *@property defaultTheme
    *@type {String}
    */
    defaultTheme: "default",
    /**
    *默认项目
    *@property defaultProject
    *@type {String}
    */
    defaultProject: "default"
};

/*加载必须脚本与样式文件*/
(function () {
    var scriptTags = [];
    var url = location.href.toLowerCase();
    scriptTags.push("<script src='library/jquery/jquery-1.11.1.min.js'></script>");
    scriptTags.push("<script src='projects/" + Base_ParamConfig.defaultProject + "/project." + Base_ParamConfig.defaultProject + ".config.js'></script>");
    if (url.indexOf("login.aspx") > -1) {
        scriptTags.push("<link rel='stylesheet' type='text/css' href='library/bootstrap/bootstrap.min.css' />");
        scriptTags.push("<link rel='stylesheet' type='text/css' href='library/bootstrap/bootstrap-theme.min.css' />");
    }
    if (url.indexOf("default.aspx") > -1) {
        scriptTags.push("<link rel='stylesheet' type='text/css' href='library/bootstrap/bootstrap.min.css' />");
        scriptTags.push("<link rel='stylesheet' type='text/css' href='library/bootstrap/bootstrap-theme.min.css' />");
        scriptTags.push("<link rel='stylesheet' type='text/css' href='themes/" + Base_ParamConfig.defaultTheme + "/css/system.main.css'/>");
        scriptTags.push("<script src='modules/analysis/plupload/plupload.full.min.js'></script>");
    }
    if (url.indexOf("basic.aspx") > -1) {
        scriptTags.push("<link rel='stylesheet' type='text/css' href='library/bootstrap/bootstrap.min.css' />");
        scriptTags.push("<link rel='stylesheet' type='text/css' href='library/bootstrap/bootstrap-theme.min.css' />");
        scriptTags.push("<link rel='stylesheet' type='text/css' href='themes/" + Base_ParamConfig.defaultTheme + "/css/bmap/bmap.main.css'/>");
    }
    if (url.indexOf("splitscreen.aspx") > -1)
    {
        scriptTags.push("<link rel='stylesheet' type='text/css' href='library/bootstrap/bootstrap.min.css' />");
        scriptTags.push("<link rel='stylesheet' type='text/css' href='library/bootstrap/bootstrap-theme.min.css' />");
        scriptTags.push("<link rel='stylesheet' type='text/css' href='themes/" + Base_ParamConfig.defaultTheme + "/css/splitScreen/splitScreen.main.css'/>");
    }
    if (url.indexOf("manage.aspx") > -1) {
        scriptTags.push("<link rel='stylesheet' type='text/css' href='library/bootstrap/bootstrap.min.css'/>");
        scriptTags.push('<link rel="stylesheet" type="text/css" href="library/zTree/css/zTreeStyle/zTreeStyle.css"/>');
        scriptTags.push('<link rel="stylesheet" type="text/css" href="themes/' + Base_ParamConfig.defaultTheme + '/css/manage/manage.main.css"/>');
        scriptTags.push('<script src="library/bootstrap/bootstrap.min.js"></script>');
        scriptTags.push('<script src="library/zTree/js/jquery.ztree.all-3.5.min.js"></script>');
        scriptTags.push('<script src="library/zTree/js/jquery.ztree.exhide-3.5.min.js"></script>');
    }
    for (var i = 0, len = scriptTags.length; i < len; i++) {
        document.write(scriptTags[i]);
    }
})();