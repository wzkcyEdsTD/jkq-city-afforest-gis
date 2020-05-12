/**
*项目代码配置
*@module config
*@class Project_Paths
*@static
*/
var Project_Paths = {

}
/**
*项目代码依赖配置
*@module config
*@class Project_Shim
*@static
*/
var Project_Shim = {

}

/**
*运维系统配置
*@module config
*@class Manage_ParamConfig
*@static
*/
var Manage_ParamConfig = {
    /**
   *系统标题
   *@property defaultTitle
   *@type {String}
   */
    defaultTitle: '规划一张图运维管理系统',
    /* 
    *是否使用OA组织用户数据
    *@property isUseOAUserInfo
    *@type {String}
    */
    isUseOAUserInfo: false,
    /* 
    *OA默认taken  当isUsrOAInfo为false时使用
    *@property OADefaultToken
    *@type {String}
    */
    OADefaultToken: '5pu55Li5fDExMg==',

    /**
    *oa用户名
    *@property defaultTitle
    *@type {String}
    */
    oaUsername: '曹丹',
    /**
    *oa用户ID
    *@property defaultTitle
    *@type {String}
    */
    oaUserid: 'UE000070',
    /**
    *oa密码
    *@property defaultTitle
    *@type {String}
    */
    oaPassword: '112',
}
/**
*项目配置
*@module config
*@class Project_ParamConfig
*@static
*/
var Project_ParamConfig = {
    /**
    *系统标题
    *@property title
    *@type {String}
    */
    title: '规划一张图',
    /**
    *左面板配置
    *@property left
    *@type {Object}
    */
    left: {
        visible: true,
        width: 0
    },
    /**
    *右面板配置
    *@property right
    *@type {Object}
    */
    right: {
        visible: true,
        width: 0
    },
    /**
    *右面板配置
    *@property right
    *@type {Object}
    */
    sidebar: {
        visible: true,
        width: 0
    },

    /**
    *顶部面板配置
    *@property top
    *@type {Object}
    */
    top: {
        visible: true,
        height: 0
    },
    /**
    *底部面板配置
    *@property bottom
    *@type {Object}
    */
    bottom: {
        visible: true,
        height: 0
    },
    /**
    *中心面板配置
    *@property center
    *@type {Object}
    */
    center: {
        visible: true
    },
    /**
    *是否转发
    *@property isProxy
    *@type {String}
    */
    isProxy: 'false',
    /**
    *是否使用缓存
    *@property isCache
    *@type {String}
    */
    isCache: 'fasle',
    /**
    *cadserver路径
    *@property cadserver
    *@type {String}
    */
    cadserver: 'http://192.168.200.119:6081/CADServer',
    //cadserver: 'http://172.26.40.187:6081/OverlayDataService',
    /**
    *默认服务层地址
    *@property defaultCoreServiceUrl
    *@type {String}
    */
    defaultCoreServiceUrl: "http://172.26.40.189/DCI.Services/v1",
    /**
    *附件服务地址
    *@property defaultServiceUrl
    *@type {String}
    */
    defaultServiceUrl: "http://172.26.40.189/DCI.Services",
    /**
    *图片地址
    *@property defaultUserImages
    *@type {String}
    */
    defaultUserImages: "http://172.26.40.189/DCI.Client",
    /**
    *转发地址
    *@property defaultProxy
    *@type {String}
    */
    defaultProxy: "http://localhost/GHAdapter",
    /**
    *规管系统地址
    *@property oaSystemUrl
    *@type {String}
    */
    oaSystemUrl: "http://192.168.200.108/DCIWeb4",
    /**
    *跨域转发文件路径
    *@property defaultAjaxProxy
    *@type {String}
    */
    defaultAjaxProxy: "proxy/proxy.ashx",
    /**
    *控件显示设置
    *@property controls
    *@type {Object}
    */
    controls: {
        defaultExtentControl: true,
        navigationControl: true,
        scalebarControl: true,
        miniMapControl: false,
        layerSwitchControl: true,
        loadingControl: true,
        panControl: true,
        contextmenu: true,
        timesliderControl:true,
        fullscreenControl: true,
        layerTabControl: true
    },
    /**
    *投影坐标系
    *@property crs
    *@type {Object}
    */
    crs: {
        /**
        *投影坐标系代号
        *@property code
        *@type {String}
        */
        code: 'EPSG:2379',
        /**
        *投影坐标系引用
        *@property defs
        *@type {String}
        */
        defs: '+proj=tmerc +lat_0=0 +lon_0=102 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs'
    },

    /**
    *底图设置
    *@property baseLayer
    *@type {Object}
    */
    baseLayer: {
        /**
        *底图类型 vector-矢量图 tile-切图
        *@property type
        *@type {String}
        */
        type: 'tile',
        /**
        *底图名称
        *@property name
        *@type {String}
        */
        name: '地图',
        /**
        *底图配置图标
        *@property img
        *@type {String}
        */
        img: 'images/controls/grouplayer/map.png',
        /**
        *服务地址
        *@property url
        *@type {String}
        */
        url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/BJDT/MapServer',
        /**
        *原点
        *@property origin
        *@type {Array}
        */
        origin: [-5123200.0, 1.00021E7],
        /**
        *初始范围
        *@property fullextent
        *@type {Array}
        */
        fullextent: [-4428.000305175783,2898.3146268100763,59286.173645019575,45472.57319057277],
        /**
        *切片图片大小
        *@property tileSize
         *@type {Number}
        */
        tileSize: 256,
        /**
        *最小级数
        *@property minZoom
        *@type {Number}
        */
        minZoom: 0,
        /**
        *最大级数
        *@property maxZoom
        *@type {Number}
        */
        maxZoom: 8,
        /**
        *当前级数
        *@property zoom
        *@type {Number}
        */
        zoom: 0,
        /**
        *切图比例
        *@property resolutions
        *@type {Array}
        */
        resolutions: [
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
        ],
        /**
        *切图比例尺
        *@property lods
        *@type {Array}
        */
        lods: [
            250000,
            125000,
            64000,
            32000,
            16000,
            8000,
            4000,
            2000,
            1000,
            500,
            250
        ]
    },

    /**
    *底图切换服务地址设置
    *@property changeLayers
    *@type {Object}
    */
    changeLayers: [{
        id: 'baseLayer-dx',//矢量图
        name: '地形图',
        tiled: false,
        img: 'dixingtu.png',
        layerIndex: [11, 20],
        url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KG_YD/MapServer'
    }, {
        id: 'baseLayer-yx',//切图
        name: '影像图',
        tiled: true,
        img: 'yingxiangtu.png',
        tileSize: 512,
        origin: [-40451.4885089805, 64140.9319180626],
        url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/YX2013/MapServer'
    }],
    /**
    *专题图服务地址设置
    *@property themLayers
    *@type {Object}
    */
    themLayers: [
        //{ id: 'kgyzt', name: '控规一张图', url: 'http://192.168.200.164:6080/ArcGIS/rest/services/JY/KGYZT/MapServer/' }
    ],

    /**
    *浏览版专题图服务地址设置
    *@property bmapLayers
    *@type {Object}
    */
    bmapLayers: [
        { name: '用地红线', url: 'http://192.168.200.119:6080/ArcGIS/rest/services/JY/GHSPSJ/MapServer', layerIndex: [] },
        { name: '控规一张图', url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KG_YD/MapServer', layerIndex: [11, 20] }
    ],

    /**
    *浏览版配置
    *@property bmapConfig
    *@type {Object}
    *1.projectView:项目查看（查询用控规地块）
    *2.bzBusinessDefLayer:编制业务过滤参数
    *含有值的可配置字段名有以下：
    * AREA、CASE_ID、COMMENTS、ENDTIME、OBJECTID、PASSDATE、PLANDATE、PLANNAME、PLANSEQ、PLANTYPE、PLANUNIT、REMARK、STARTTIME
    *填充时在字段名前添加"th_"前缀，如STARTTIME >= th_STARTTIME    
    */
    bmapConfig: {
        projectView: { name: '项目查看功能查询服务', url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KGDK/MapServer', layerIndex: '0' },   //查控规地块
        bzBusinessDefLayer: {
            name: '编制业务过滤参数配置', 
            data: [
                    {
                        name: '控规显势图层',
                        url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KGDK/MapServer',
                        defLayer: { all: "STARTTIME <= date 'th_STARTTIME' AND PLANNAME = 'th_PLANNAME'" }
                    },
                    {
                        name: '控规历史图层',
                        url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KGDK_HH/MapServer',
                        defLayer: { all: "STARTTIME <= date 'th_STARTTIME' AND ENDTIME > date 'th_STARTTIME' AND PLANNAME = 'th_PLANNAME'" }
                    }
            ]
        }
    },

    /**
    *道路搜索地图服务
    *@property dlsearchLayers
    *@type {Object}
    */
    dlsearchLayers: [
        { name: '现状道路地图服务', url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/DL_XZ/MapServer', layerIndex: [2] },
        { name: '规划道路地图服务', url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/DL_GH/MapServer', layerIndex: [1] }
    ],

    /**
    *快速搜索定位图层
    *@property quickquery
    *@type {Object}
    */
    quickquery: [
        { name: '编制', url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/BzOnemap/MapServer', layerIndex: 0 },
        { name: '实施', url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/GHSPSJ/MapServer', layerIndex: 4 },
        { name: '批后', url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/PhOnemap/MapServer', layerIndex: 0 }
    ],


    /**
    *地块全生命周期配置
    *@property wholelifecycleConfig
    *@type {Object}
    */
    wholelifecycleConfig: [{
            "name": "总规的规划地块图层", "url": "http://192.168.200.119:6080/arcgis/rest/services/JY/ZTGHZK/MapServer", "layerIndex": "7"
        },{
            "name": "分规的规划地块图层", "url": "http://192.168.200.119:6080/arcgis/rest/services/JY/FQGHZK/MapServer", "layerIndex": "64"
        },{
            "name": "控规的规划地块图层", "url": "http://192.168.200.119:6080/arcgis/rest/services/JY/KGDK/MapServer", "layerIndex": "0"
        },{
            "name": "项目一张图业务红线服务", "url": "http://192.168.200.119:6080/arcgis/rest/services/JY/GHSPSJ/MapServer", "layerIndex": "4"
        },{
            "name": "批后一张图", "url": "http://192.168.200.119:6080/arcgis/rest/services/JY/PhOnemap/MapServer", "layerIndex": "0"
        }
    ],

    /**
    *项目阶段指标（项目一张图以及地块全生命周期功能包含）
    *@property projectPhaseConfig
    *@type {Object}
    */
    projectPhaseConfig: [{
        "id": 1, "name": "控规", "description": "规划控规阶段", "url": "http://192.168.200.119:6080/arcgis/rest/services/JY/KGDK/MapServer", "layerIndex": "0",
            "queryFields": ["DKBH", "DKMJ", "RJL", "JZMD", "LDL", "YDXZ"], "displayFieldsName": ["地块编号", "地块面积", "容积率", "建筑密度", "绿地率", "用地性质"]
        }, {
            "id": 2, "name": "选址", "description": "规划选址阶段", "url": "http://192.168.200.119:6080/arcgis/rest/services/JY/GHSPSJ/MapServer", "layerIndex": "1",
            "queryFields": ["CASE_ID", "PROJECTID", "YDMJ", "JZGM", "YDXZ", "ZSH", "ZSRQ"],
            "displayFieldsName": ["图文关联ID", "项目编号", "用地面积", "建设规模","用地性质", "证书编号","发证日期"]
        }, {
            "id": 3, "name": "条件", "description": "规划条件阶段", "url": "http://192.168.200.119:6080/arcgis/rest/services/JY/GHSPSJ/MapServer", "layerIndex": "0",
            "queryFields": ["CASE_ID", "XMMC", "ZDYDXZ", "JRYDXZ", "JRBL", "YDMJ", "RJLSX", "RJLXX", "LDLSX", "LDLXX", "JZMDSX", "JZMDXX", "JZXG", "XQCZH", "ZXCZH", "ZSH","BJSJ"],
            "displayFieldsName": ["图文关联ID", "项目名称", "主导用地性质", "兼容用地性质", "兼容比例", "用地面积", "容积率上限", "容积率下限", "绿地率上限", "绿地率下限", "建筑密度上限", "建筑密度下限", "建筑限高", "机车车停车位", "非机动车停车位", "通知书编号", "发证日期"]
        }, {
            "id": 4, "name": "用地", "description": "建设用地阶段", "url": "http://192.168.200.119:6080/arcgis/rest/services/JY/GHSPSJ/MapServer", "layerIndex": "2",
            "queryFields": ["CASE_ID", "XMMC", "ZDYDXZ", "JRYDXZ", "JRBL", "YDMJ", "RJLSX", "RJLXX", "LDLSX", "LDLXX", "JZMDSX", "JZMDXX","JZXG","XQCZH","ZXCZH","ZSH","ZSRQ"],
            "displayFieldsName": ["图文关联ID", "项目名称", "主导用地性质", "兼容用地性质", "兼容比例", "用地面积", "容积率上限", "容积率下限", "绿地率上限", "绿地率下限", "建筑密度上限", "建筑密度下限", "建筑限高", "机车车停车位", "非机动车停车位", "证书编号", "发证日期"]
        }, {
            "id": 5, "name": "方案", "description": "方案阶段", "url": "", "layerIndex": "", "queryFields": [], "displayFieldsName": []
        }, {
            "id": 6, "name": "工程", "description": "建设工程阶段", "url": "http://192.168.200.119:6080/arcgis/rest/services/JY/GHSPSJ/MapServer", "layerIndex": "3",
            "queryFields": ["CASE_ID", "XMMC", "JRJZMJ", "RJL", "LDL", "JZMD", "ZSH", "ZSRQ"],
            "displayFieldsName": ["图文关联ID", "项目名称", "计容建筑面积", "容积率", "绿地率", "建筑密度", "证书编号", "发证日期"]
        }, {
            "id": 7, "name": "核实", "description": "规划核实阶段", "url": "", "layerIndex": "", "queryFields": [], "displayFieldsName": []
        }
    ],

    /**
    *用地平衡分析和用地开发强度评价--默认添加专题
    *@property landLayers
    *@type {Object}
    */
    landLayers: [
        { name: '用地平衡分析', url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KGDK/MapServer', layerIndex: '0' },
        { name: '用地开发强度评价', url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KGDK/MapServer/', layerIndex: '0' },
        { name: '容积率', url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KGDK/MapServer/', layerIndex: '1' },
        { name: '绿地率', url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KGDK/MapServer/', layerIndex: '2' },
        { name: '建筑密度', url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KGDK/MapServer/', layerIndex: '3' }
    ],

    /**
    *时间轴所需的服务，可以配置不同年份的专题图
    *@property timeLayers
    *@type {Object}
    */
    timeLayers: [{
        id: 'kg', name: '历史控规', layers: [
            { year: 2011, url: 'http://192.168.200.164:6080/ArcGIS/rest/services/JY/YDFL2011A/MapServer/' },
            { year: 2012, url: 'http://192.168.200.164:6080/ArcGIS/rest/services/JY/XZQH/MapServer' },
            { year: 2013, url: 'http://192.168.200.164:6080/ArcGIS/rest/services/JY/XMYZT/MapServer/' },
            { year: 2014, url: 'http://192.168.200.164:6080/ArcGIS/rest/services/JY/GHSPSJ/MapServer/' },
            { year: 2015, url: 'http://192.168.200.164:6080/ArcGIS/rest/services/JY/XZQH/MapServer' }
        ]
    }, {
        id: 'yd', name: '历史用地', layers: [
            { year: 2004, url: 'http://arcserver/ArcGIS/rest/services/JY/YDFL2004/MapServer/' },
            { year: 2007, url: 'http://arcserver/ArcGIS/rest/services/JY/YDFL2007/MapServer/' },
            { year: 2010, url: 'http://arcserver/ArcGIS/rest/services/JY/YDFL2010/MapServer/' },
            { year: '2011上半年', url: 'http://arcserver/ArcGIS/rest/services/JY/YDFL2011A/MapServer/' },
            { year: '2011下半年', url: 'http://arcserver/ArcGIS/rest/services/JY/YDFL2011B/MapServer/' },
            { year: 2012, url: 'http://arcserver/ArcGIS/rest/services/JY/YDFL2012/MapServer' },
            { year: 2013, url: 'http://arcserver/ArcGIS/rest/services/JY/YDFL2013/MapServer' },
            { year: 2014, url: 'http://192.168.200.164:6080/ArcGIS/rest/services/JY/GHSPSJ/MapServer/' },
            { year: 2015, url: 'http://arcserver/ArcGIS/rest/services/JY/YDFL2014/MapServer' }
        ]
    }, {
        id: 'yx', name: '历史影像', layers: [
            { year: 2009, url: 'http://arcserver/ArcGIS/rest/services/JY/YX2009/MapServer/' },
            { year: 2011, url: 'http://arcserver/ArcGIS/rest/services/JY/YX2011/MapServer/' },
            { year: 2013, url: 'http://arcserver/ArcGIS/rest/services/JY/YX2013/MapServer/' },
            { year: 2015, url: 'http://arcserver/ArcGIS/rest/services/JY/YDFL2014/MapServer' }

        ]
    }, {
        id: 'dx', name: '历史地形', layers: [
            { year: 2000, url: 'http://arcserver/ArcGIS/rest/services/JY/DX2000/MapServer/' },
            { year: 2007, url: 'http://arcserver/ArcGIS/rest/services/JY/DX2007/MapServer/' },
            { year: 2008, url: 'http://arcserver/ArcGIS/rest/services/JY/DX2008/MapServer/' },
            { year: 2009, url: 'http://arcserver/ArcGIS/rest/services/JY/DX2009/MapServer/' },
            { year: 2011, url: 'http://arcserver/ArcGIS/rest/services/JY/DX2011/MapServer/' },
            { year: 2012, url: 'http://arcserver/ArcGIS/rest/services/JY/DX2012/MapServer/' },
            { year: 2013, url: 'http://arcserver/ArcGIS/rest/services/JY/DX2013/MapServer/' },
            { year: 2014, url: 'http://arcserver/ArcGIS/rest/services/JY/DX2014/MapServer/' },
            { year: 2015, url: 'http://arcserver/ArcGIS/rest/services/JY/YDFL2014/MapServer' }
        ]
    }],

    /**
    *设置是否开启用地分析预处理功能
    *@property LandPre
    *@type {Object}
    */
    LandPre: {
        doPre:false,
    },

    /**
    *用地平衡分析gp配置
    *@property ydphfxConfig
    *@type {Object}
    */
    ydphfxConfig: {
        url: 'http://192.168.200.119:6080/arcgis/rest/services/landbalanceJY/GPServer/LandBalance',
        inputParams: {
            In_region: null,
            in_kg_layer: 'JYGISDATA.A_JYKG_规划地块', //图层路径
            in_mark_field: 'YDDM',
            in_popu_field: '',
        },
        outParams: [{ name: 'out_result', type: "string" }],
        PreResult: true,
        xzqh: '江阴市', //行政区划地区设置
        xingzheng_layer: {
            url: 'http://192.168.200.164:6080/arcgis/rest/services/JY/XZQH/MapServer',
            layerIndex:"1",
            sr: 2379,//地图服务的空间参考
            field: 'NAME',
            districtValue:"江阴全市域"
        }
    },

    /**
    *用地开发强度评价gp配置
    *@property ydkfqdpjConfig
    *@type {Object}
    */
    ydkfqdpjConfig: {
        url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/landuseIntensityJY/GPServer/landuseIntensity',
        inputParams: {
            In_region: null,
            In_PLOTRGN: 'JYGISDATA.A_JYKG_规划地块_1', //图层路径            
            in_otherInfo_str: '[{"0min":"0","0max":"1","1min":"0","1max":"10","2min":"0","2max":"10"},{"0min":"1","0max":"2","1min":"10","1max":"20","2min":"10","2max":"20"},{"0min":"2","0max":"3","1min":"20","1max":"30","2min":"20","2max":"30"},{"0min":"3","0max":"4","1min":"30","1max":"40","2min":"30","2max":"40"},{"0min":"4","0max":"Max","1min":"40","1max":"Max","2min":"40","2max":"Max"}]',
            RJL_field: 'UPLOTRATIO;GREENRATIODO;DENSITYUP',
            tj_field: 'DKMJ',
        },
        In_otherInfo: [{ phase0: " 0＜容积率≤1", phase1: " 1<容积率≤2", phase2: " 2＜容积率≤3", phase3: " 3＜容积率≤4", phase4: " 4＜容积率" }, { phase0: " 0＜绿地率≤10", phase1: " 10＜绿地率≤20", phase2: " 20＜绿地率≤30", phase3: " 30＜绿地率≤40", phase4: " 40＜绿地率" }, { phase0: " 0＜建筑密度≤10", phase1: " 10＜建筑密度≤20", phase2: " 20＜建筑密度≤30", phase3: " 30＜建筑密度≤40", phase4: " 40＜建筑密度" }],
        query_Info: [{ phase0: " UPLOTRATIO<=1", phase1: " UPLOTRATIO<=2 and UPLOTRATIO>1", phase2: " UPLOTRATIO<=3 and UPLOTRATIO>2", phase3: " UPLOTRATIO<=4 and UPLOTRATIO>3", phase4: " UPLOTRATIO>4" }, { phase0: " GREENRATIODO<=10", phase1: " GREENRATIODO<=20 and GREENRATIODO>10", phase2: "GREENRATIODO<=30 and GREENRATIODO>20", phase3: "GREENRATIODO<=40 and GREENRATIODO>30", phase4: "GREENRATIODO>40" }, { phase0: "DENSITYUP<=10", phase1: "DENSITYUP<=20 and DENSITYUP>10", phase2: "DENSITYUP<=30 and DENSITYUP>20", phase3: "DENSITYUP<=40 and DENSITYUP>30", phase4: "DENSITYUP>40" }],
        outParams: [{ name: 'out_result', type: "string" }],
        PreResult: true,
        xzqh: '江阴市',//行政区划地区设置
        xingzheng_layer: {
            url: 'http://192.168.200.164:6080/arcgis/rest/services/JY/XZQH/MapServer',
            layerIndex: "1",
            sr: 2379,//地图服务的空间参考
            field: 'NAME',
            districtValue:"江阴全市域"
        }
    },
    /**
    *可用地存量分析GP配置
    *@property landuseStockConfig
    *@type {Object}
    **/
    landuseStockConfig: {
        url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/LanduseStock/GPServer/LanduseStock',
        inputParams: {
            In_region: null,
            in_kg_layer: 'JYGISDATA.A_JYKG_规划地块', //图层多个用','隔开
            in_yd_layer: 'JYGISDATA.GHYD_DDT',//用地红线图层，多个用','隔开
            in_mark_field: 'YDDM'//控规用地性质代码字段
        },
        outParams: [{ name: 'out_result', type: "string" }],
        PreResult: true,
        xzqh: '江阴市',
        xingzheng_layer: {
            url: 'http://192.168.200.164:6080/arcgis/rest/services/JY/XZQH/MapServer',
            layerIndex: "1",
            sr: 2379,//地图服务的空间参考
            field: 'NAME',
            districtValue: "江阴全市域"
        }
    },

    /**
       *公服设施分析GP配置
       *@property PublicServiceConfig
       *@type {Object}
       **/
    PublicServiceConfig: {
        url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/PublicService/GPServer/PublicService',
        inputParams: {
            In_region: null,
            Gh_publicservices: 'JYGISDATA.A_JYKG_配套设施', //图层多个用','隔开
            Type_Field: 'NAME'//控规用地性质代码字段
        },
        outParams: [{ name: 'out_result', type: "string" }],
        PreResult: true,
        buffer_query: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KGGH/MapServer/68',
        buffer_url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/BufferAnalysis/GPServer/ServerBuffer',
        buffer_inputParams: {
            Gh_publicservices: null, //公服设施点
            Distance:'',
        },
        buffer_outParams: [{ name: 'out_result', type: "string" }],
        xzqh: '江阴市',
        xingzheng_layer: {
            url: 'http://192.168.200.164:6080/arcgis/rest/services/JY/XZQH/MapServer',
            layerIndex: "1",
            sr: 2379,//地图服务的空间参考
            field: 'NAME',
            districtValue: "江阴全市域"
        }
    },

    /**
    *批后一张图专题配置
    *@property phOneMapConfig
    *@type {Object}
    */
    phOneMapConfig: {
        name:"批后一张图",//模块名称
        year: '2015',   //年份
        city: '江阴市', //城市
        projCount: 20,  //工程证
        zoomItemName: "JYGISDATA.PH_ManageCell.ITEMID",//定位查询字段
        queryAttribute: "案件编号",//项目查看时对应属性
        attributes: ["ObjectId", "ZsBookId", "ItemId", "OldItemID", "Fguid","Xzqy", "Ydxz", "Xzqydm", "IsDispose", "UpdateDate", "IsViolation"] //不显示的属性
    },

    /**
    *编制一张图专题配置
    *@property bzOneMapConfig
    *@type {Object}
    *detailConfig:编制业务过滤参数
    *含有值的可配置字段名有以下：
    * AREA、CASE_ID、COMMENTS、ENDTIME、OBJECTID、PASSDATE、PLANDATE、PLANNAME、PLANSEQ、PLANTYPE、PLANUNIT、REMARK、STARTTIME
    *填充时在字段名前添加"th_"前缀，如STARTTIME >= th_STARTTIME   
    */
    bzOneMapConfig: {
        name: '编制一张图',
        year: '2015',    //年份
        city: '江阴市',  //城市
        totalProgram: {//总体规划
            cityProgramming: '江阴市城市总体规划(2011-2030)',   //城市总体规划书
            planningRegion: '江阴市域'                         //规划区域
        },
        zoomItemName: "AJBM",//定位查询字段
        queryLayer: "http://192.168.200.119:6080/arcgis/rest/services/JY/BzOnemap/MapServer/",//查询图层
        queryAttribute: "案件编码",//项目查看时对应属性
        attributes: ["ObjectId", "PlanDate", "UPDATEDATE", "PassDate", "IsDispose", "StartPlanTime", "StartTime", "PassDate", "Ajbm", "Xzqy", "IsPlan"],//不显示的属性
        detailConfig: [
            {
                name: '控规显势图层',
                url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KGDK/MapServer',
                defLayer: { all: "STARTTIME <= date 'th_STARTTIME' AND PLANNAME = 'th_PLANNAME'" }
            },
            {
                name: '控规历史图层',
                url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KGDK_HH/MapServer',
                defLayer: { all: "STARTTIME <= date 'th_STARTTIME' AND ENDTIME > date 'th_STARTTIME' AND PLANNAME = 'th_PLANNAME'" }
            }
       ]
    },
    /**
    *项目一张图专题配置
    *@property xmOneMapConfig
    *@type {Object}
    */
    xmOneMapConfig: {
        name: '项目一张图',
        url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/GHSPSJ/MapServer',  //项目一张图服务地址
        zoomItemName: "PROJECTID",//定位查询字段
        queryAttribute:"项目编号",//项目查看时对应属性
        attributes: ["CASEID", "PROJECTSTA", "XMLX"]
    },

    /**
    *时限一张图专题配置
    *@property sxOneMapConfig
    *@type {Object}
    */
    sxOneMapConfig: {
        name: '时限一张图',
        zoomItemName: "ITEMID",//定位查询字段
        queryAttribute: "项目编号",//项目查看时对应属性
    },

    /**
    *净容积率统计配置
    *@property netvolumeratioConfig
    *@type {Object}
    */
    netvolumeratioConfig: {
        url: "http://192.168.200.119:6080/ArcGIS/rest/services/JY/KGDK/MapServer/",//控规服务地址
        layerIndex: 0,//控规-规划地块图层索引
        charHandler_R: '/[≤≥%]/g',//处理不规则的数据,若容积率为范围值,则需要配置,若容积率是数值则可配置为空
        charHandler_S: '/[,-]/g',
        fieldConfig: {
            YDXZ: "YDXZ",//用地性质字段
            DKMJ: "DKMJ",//地块面积字段
            JZMJ: "JZMJ",//建筑面积字段
            RJL: "RJL",//容积字段率
            AREA: "SHAPE.AREA"//图形面积字段
        }
    },

    /**
    *指标分析
    *@property indexcontrastConfig
    *@type {Object}
    */
    indexcontrastConfig: {
        url: "http://192.168.200.164:6080/ArcGIS/rest/services/JY/KGYZT/MapServer/",     //控规服务地址
        ydhxUrl: 'http://192.168.200.119:6080/arcgis/rest/services/JY/GHSPSJ/MapServer',  //用地红线地址
        layerIndex: {
            zg: 'visible:14',       //总规地块
            kg: 'visible:10',       //控规地块
            yd: 'visible:10',       //用地图层（由于这里控规没有用地图层，所有在上面单独配多一个用地红线，对应功能代码里也是直接使用上面的用地红线地址做分析）
            jg: 'visible:10',      //竣工图层（目前没数据）
            xm: 'visible:3'        //项目图层
        },
        tableHeader: {
            0: { name: "RJL", alias: "容积率" },
            1: { name: "LDL", alias: "绿地率" },
            2: { name: "JZMD", alias: "建筑密度" },
            3: { name: "JZGD", alias: "建筑高度" },
            4: { name: "YDXZ", alias: "用地性质" }
        },
        ydHeader: {
            0: { name: "RJL", alias: "容积率上限" },
            1: { name: "LDL", alias: "绿地率下限" },
            2: { name: "JZMD", alias: "建筑密度上限" },
            3: { name: "JZGD", alias: "建筑限高" },
            4: { name: "YDXZ", alias: "主导用地性质" }
        }

    },


    

    /**
    *相关查询
    *@property relatedIdentifyConfig
    *@type {Object}
    */
    relatedIdentifyConfig: [{
        name: '用地审批',//分类名称
        url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/GHSPSJ/MapServer',//服务地址
        layerIndex: [2],//图层索引
        servicesType: 'AGS',//服务类型 AGS——表示ArcGIS Server服务
        displayShortAttributes: [//列表显示属性
            { name: '项目名称', alias: '项目名称' },
            { name: '项目地址', alias: '项目地址' },
            { name: '建设单位 ', alias: '建设单位' },
            { name: '入库人', alias: '入库人' }
        ],
        displayAttributes: 'all'//详细信息项目属性 all——表示全部显示
    }],

    /**
    *审批浏览版的编制业务过滤配置
    *@property bmap
    *@type {Object}
    *含有值的可配置字段名有以下：
    * AREA、CASE_ID、COMMENTS、ENDTIME、OBJECTID、PASSDATE、PLANDATE、PLANNAME、PLANSEQ、PLANTYPE、PLANUNIT、REMARK、STARTTIME
    *填充时在字段名前添加"th_"前缀，如STARTTIME =》 th_STARTTIME
    */
    bmapBzDefLayerConfig:[
        {
            name: '控规显势图层',
            url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KGDK/MapServer',
            defLayer: { all: "STARTTIME <= date 'th_STARTTIME'" }
            //url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KGGH/MapServer',
            //defLayer: { 72: "STARTTIME <= date 'th_STARTTIME'" }
        },
        {
            name: '控规历史图层',
            url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KGGH_HH/MapServer',
            defLayer: { all: "STARTTIME <= date 'th_STARTTIME' AND ENDTIME > date 'th_STARTTIME'" }
        }
    ],

    /**
    *相关查询
    *@property relatedIdentifyConfig
    *@type {Object}
    */
    relatedIdentifyConfig: [{
        name: '用地审批',//分类名称
        url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/GHSPSJ/MapServer',//服务地址
        layerIndex: [2],//图层索引
        servicesType: 'AGS',//服务类型 AGS——表示ArcGIS Server服务
        displayShortAttributes: [//列表显示属性
            { name: '项目名称', alias: '项目名称' },
            { name: '项目地址', alias: '项目地址' },
            { name: '建设单位 ', alias: '建设单位' },
            { name: '入库人', alias: '入库人' }
        ],
        displayAttributes: 'all'//详细信息项目属性 all——表示全部显示
    }],

    /**
    *以图管控配置
    *@property mapMonitorConfig
    *@type {Object}
    */
    mapMonitorConfig: {
        manageCellLayer: { url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KZDYBJ/MapServer', layers: [0] },//规划管理单元图层
        statLayers: [//统计图层
            { name: "KGDK", url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KGDK/MapServer', layers: [0] },//规划地块
            { name: "YDHX", url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/GHSPSJ/MapServer', layers: [2] },//用地红线
            { name: "PTSS", url: 'http://192.168.200.119:6080/arcgis/rest/services/JY/KGGH/MapServer', layers: [68] }//配套设施
        ]
    },
    /**
    *全局查询默认配置/若运维配置后会自动替换该配置
    *@property globalSearch
    *@type {Object}
    */
    globalSearch: {
        layers: [
    {
        name: "项目一张图",//服务名称说明
        url: "http://61.177.141.190:6080/arcgis/rest/services/SX/indexcontrast/MapServer",//服务地址
        fields: "项目编号,项目名称",//查询字段,可包含多个图层字段
        layers: "1,2,3,4,5"//查询图层
    },
    {
        name: "道路",
        url: "http://61.177.141.190:6080/arcgis/rest/services/LF/LF_DL/MapServer",
        fields: "道路名称",
        layers: "2"
    }
        ]
    }
    
};