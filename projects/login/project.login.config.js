require.config({
    paths: {
        "leaflet": '../../library/leaflet/leaflet',
        "browser/setting": '../../modules/common/common.browser.setting',
        "core/dcins": "../../core/core.namespace"
    },
    shim: {

    }
});

//*******************加载后执行******************//
require(["leaflet","browser/setting"], function () {
        $(document).ready(function () {
            //浏览器版本提示
            var browser = new L.DCI.BrowserSetting();
        });
    });