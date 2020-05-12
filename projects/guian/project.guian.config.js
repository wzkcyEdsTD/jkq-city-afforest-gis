/*贵安项目配置*/
var Project_ParamConfig = {
    title: '',
    left: {
        visible: true,
        width: 0
    },
    right: {
        visible: false,
        width: 0
    },
    top: {
        visible: true,
        height: 0
    },
    bottom: {
        visible: true,
        height: 0
    },
    center: {
        visible: true
    },
    controls: {
        defaultExtentControl: true,
        navigationControl: true,
        scalebarControl: true,
        miniMapControl: true,
        layerSwitchControl: true,
        sidebarControl: true,
        loadingControl: true,
        panControl: true
    },
    crs: {
        /*代号*/
        code: 'SR-ORG:7408',
        /*引用*/
        defs: '+proj=longlat +ellps=GRS80 +no_defs'
    },
    /*底图设置*/
    baseLayer: {
        url: 'http://arcserver/ArcGIS/rest/services/GAXQ/DT/MapServer',
        origin: [-5123200, 1.00021E7],
        fullextent: [ 396251.25009999983,2062322.3421999998,453963.41669999994,2112614.9751999993],
        tileSize: 256,
        minZoom: 0,
        maxZoom: 12,
        zoom: 0,
        resolutions: [
            132.291931250529,
            66.1459656252646,
            33.0729828126323,
            16.9333672000677,
            8.46668360003387,
            4.23334180001693,
            2.11667090000847,
            1.05833545000423,
            0.529167725002117,
            0.264583862501058,
            0.132291931250529,
            0.0661459656252646
        ]
    },
    baseLayers: [
        { name: '影像', img: '/themes/default/images/controls/layerswitch/yingxiang.png', url: 'http://arcserver/ArcGIS/rest/services/GAXQ/TGTDGH/MapServer' },
        { name: '三维', img: '/themes/default/images/controls/layerswitch/sanwei.png', url: 'http://arcserver/ArcGIS/rest/services/GAXQ/HJBHGH/MapServer' }
    ],
    /*专题图*/
    themLayers: [
        { name: '红线', img: '/themes/default/images/controls/layerswitch/hongxian.png', url: 'http://arcserver/ArcGIS/rest/services/GAXQ/TGTDGH/MapServer' },
        { name: '蓝线', img: '/themes/default/images/controls/layerswitch/lanxian.png', url: 'http://arcserver/ArcGIS/rest/services/GAXQ/HJBHGH/MapServer' },
        { name: '绿线', img: '/themes/default/images/controls/layerswitch/lvxian.png', url: 'http://arcserver/ArcGIS/rest/services/GAXQ/TGTDGH/MapServer' }
    ]
};