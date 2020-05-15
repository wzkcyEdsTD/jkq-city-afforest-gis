/**
*服务器地址配置
*@url config 
*@type {Object} 
*/
var UrlConfig = {
  /**
  *服务器地址配置
  *@property changeLayers
  */
    IP1: "192.168.200.119:6080",
    IP2: "192.168.39.134:6080"
};
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
    defaultTitle: '二三维一体化运维管理系统',
    /* 
    *是否使用OA组织用户数据
    *@property isUseOAUserInfo
    *@type {String}
    */
    isUseOAUserInfo: true,
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
    title: '二三维一体化',
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
    *geometryServer路径
    *@property geometryServerUrl
    *@type {String}
    */
    geometryServerUrl: "http://192.168.39.40:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer",
    /**
    *默认服务层地址
    *@property defaultCoreServiceUrl
    *@type {String}
    */
    defaultCoreServiceUrl: "http://192.168.0.158/DCI.Services/v1",
    /**
    *附件服务地址
    *@property defaultServiceUrl
    *@type {String}
    */
    defaultServiceUrl: "http://192.168.39.41/GGSS/mapServices",
    /**
    *图片地址
    *@property defaultUserImages
    *@type {String}
    */
    defaultUserImages: "http://192.168.39.41/GGSS/map",
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
    oaSystemUrl: "http://192.168.39.41/GGSS/JGSP",
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
        timesliderControl: true,
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
       code:'EPSG: {"wks": "PROJCS["wenzhou2000",GEOGCS["GCS_China_Geodetic_Coordinate_System_2000",DATUM["D_China_2000",SPHEROID["CGCS2000",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Gauss_Kruger"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",120.666666666667],PARAMETER["Scale_Factor",1.0],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]"}',

	  /**
        *投影坐标系引用
        *@property defs
        *@type {String}
        */
       
		//defs: '+proj=tmerc +lat_0=0 +lon_0=120.666666666667 +k=1 +x_0=500000 +y_0=0 +a=6378245.0 +rf=298.3 +units=m +no_defs',
		defs: '+proj=tmerc +lat_0=0 +lon_0=120.666666666667 +k=1 +x_0=500000.0 +y_0=0 +a=6378137.0 +rf=298.257222101 +units=m +no_defs'
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
        //url: 'http://192.168.20.54:6080/arcgis/rest/services/WZLSYX_WZ/25DYX_wz3q/MapServer',
        //url: 'http://192.168.39.134:6080/arcgis/rest/services/kfq_basemap_wz2000/kfq_erwei/MapServer',
        url: 'http://10.36.160.161:8080/OneMapServer/rest/services/shiliang_wz2000/MapServer',
        //url: 'http://' + UrlConfig.IP2 + '/arcgis/rest/services/basemap/kfq_slwz2000/MapServer',
        /**
        *原点
        *@property origin
        *@type {Array}
        */
        origin: [-5123300.0 , 1.00023E7],
        //origin: [-5123300.0, 1.00023E7],
        /**
        *初始范围
        *@property fullextent
        *@type {Array}
        */
        //fullextent: [507575.909, 3077625.757, 516296.593, 3085171.689],
       fullextent: [475120.7994806275,3077037.3853657073,556946.4706471281,3125089.9118644656],
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
        //minZoom: 7,
        minZoom: 4,
        /**
        *最大级数
        *@property maxZoom
        *@type {Number}
        */
       // maxZoom: 20,
        maxZoom: 13,
        /**
        *当前级数
        *@property zoom
        *@type {Number}
        */
        //zoom: 15,
        zoom: 6,
        /**
        *切图比例
        *@property resolutions
        *@type {Array}
        */
       resolutions: [
            1222.994898823131,
            611.4974494115655,
            305.74872470578276,
            152.87436235289138,
            76.43717985352637,
            38.2185912496825,
            19.10929430192194,
            9.55464715096097,
            4.777323575480485,
            2.3886631106595546,
            1.1943315553297773,
            0.5971657776648887,
            0.2985828888324443,
            0.14929144441622216
        ],
        /**
        *切图比例尺
        *@property lods
        *@type {Array}
        */
        lods: [
            4622333.68,
            2311166.84,
            1155583.42,
            577791.71,
            288895.85,
            144447.93,
            72223.96,
            36111.98,
            18055.99,
            9028,
            4514,
            2257,
            1128.5,
            564.25
        ]
    },
   
    /**
    *底图切换服务地址设置
    *@property changeLayers
    *@type {Object}
    */
    changeLayers: [
        {
            id: 'baseLayer-yx',//切图
            name: '影像图',
            tiled: true,
            img: 'yingxiangtu.png',
            tileSize: 256,
            //origin: [-40451.4885089805, 64140.9319180626],
            origin: [-5123300.0 , 1.00023E7],
            //url: 'http://' + UrlConfig.IP2 + '/arcgis/rest/services/basemap/kfq_yxwz2000/MapServer'
            url: 'http://10.36.160.161:8080/OneMapServer/rest/services/yingxiang_wz2000/MapServer'
        },
		 {
            id: 'baseLayer-25D',//25维
            name: '25D维',
            tiled: true,
            img: 'dixingtu.png',
            tileSize: 256,
            //origin: [-40451.4885089805, 64140.9319180626],
            origin: [-5123200.0, 1.00021E7],
             url: 'http://10.36.160.161:8080/OneMapServer/rest/services/25D_wz2000/MapServer'
        },
        {
            id: 'baseLayer-bai',//25维
            name: '无底图',
            tiled: true,
            img: 'yingxiangtu1.png',
            tileSize: 256,
            origin: [-5123300.0, 1.00023E7],
            url: 'http://'+ UrlConfig.IP2+'/arcgis/rest/services/basemap/kfq_vector/MapServer'
        }
    ],
    projectLayer: [
        {
            url: 'http://192.168.39.40:6080/arcgis/rest/services/kfqsz/v_ggss_range/MapServer',
			featureUrl:'http://192.168.39.40:6080/arcgis/rest/services/kfqsz/range/FeatureServer/0'
            
        }
    ],
	 /**
    *获取养护列表
    *@property getYhListUrl
    *@type {String}
    */
    getYhListUrl: "http://192.168.39.41/GGSS/JGSP/MaintainManage/getYhjlinfo",
	/**
    *养护图片加载
    *@property loadImgUrl
    *@type {String}
    */
	//綠地變化分析
    getGreenChangeArea: "http://192.168.39.41/GGSS/JGSP/MaintainManage/getGreenChangeArea",
    getYhImgUrl: "http://192.168.39.41/GGSS/JGSP",
    /**
    *专题图服务地址设置
    *@property themLayers
    *@type {Object}
    */
    themLayers: [
        //{ id: 'kgyzt', name: '控规一张图', url: 'http://192.168.200.164:6080/ArcGIS/rest/services/JY/KGYZT/MapServer/' }
    ],
    /**
    *地名地址服务地址设置
    *@property dmdzLayers
    *@type {Object}
    */
    dmdzLayers: "http://192.168.39.40:6080/arcgis/rest/services/kfqsz/address/MapServer",
    /**
    *地名地址服务地址设置
    *@property dmdzLayers
    *@type {Object}
    */
    ldbhfxLayers: "http://192.168.39.40:6080/arcgis/rest/services/kfqsz/LDBHFX/MapServer",
    /**
    *浏览版专题图服务地址设置
    *@property bmapLayers
    *@type {Object}
    */
    bmapLayers: [
        { name: '用地红线', url: 'http://' + UrlConfig.IP1 + '/ArcGIS/rest/services/JY/GHSPSJ/MapServer', layerIndex: [] },
        { name: '控规一张图', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KG_YD/MapServer', layerIndex: [11, 20] }
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
        projectView: { name: '项目查看功能查询服务', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGDK/MapServer', layerIndex: '0' },   //查控规地块
        bzBusinessDefLayer: {
            name: '编制业务过滤参数配置', 
            data: [
                    {
                        name: '控规显势图层',
                        url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGDK/MapServer',
                        defLayer: { all: "STARTTIME <= date 'th_STARTTIME' AND PLANNAME = 'th_PLANNAME'" }
                    },
                    {
                        name: '控规历史图层',
                        url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGDK_HH/MapServer',
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
        { name: '现状道路地图服务', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/DL_XZ/MapServer', layerIndex: [2] },
        { name: '规划道路地图服务', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/DL_GH/MapServer', layerIndex: [1] }
    ],

    /**
    *快速搜索定位图层
    *@property quickquery
    *@type {Object}
    */
    quickquery: [
        { name: '编制', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/BzOnemap/MapServer', layerIndex: 0 },
        { name: '实施', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/GHSPSJ/MapServer', layerIndex: 4 },
        { name: '批后', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/PhOnemap/MapServer', layerIndex: 0 }
    ],


    /**
    *地块全生命周期配置
    *@property wholelifecycleConfig
    *@type {Object}
    */
    wholelifecycleConfig: [{
        "name": "总规的规划地块图层", "url": 'http://'+UrlConfig.IP1+'/arcgis/rest/services/JY/ZTGHZK/MapServer', "layerIndex": "7"
    },{
        "name": "分规的规划地块图层", "url": 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/FQGHZK/MapServer', "layerIndex": "64"
    },{
        "name": "控规的规划地块图层", "url": 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGDK/MapServer', "layerIndex": "0"
    },{
        "name": "项目一张图业务红线服务", "url": 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/GHSPSJ/MapServer', "layerIndex": "4"
    },{
        "name": "批后一张图", "url": 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/PhOnemap/MapServer', "layerIndex": "0"
    }
    ],

    /**
    *项目阶段指标（项目一张图以及地块全生命周期功能包含）
    *@property projectPhaseConfig
    *@type {Object}
    */
    projectPhaseConfig: [{
        "id": 1, "name": "控规", "description": "规划控规阶段", "url": 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGDK/MapServer', "layerIndex": "0",
        "queryFields": ["DKBH", "DKMJ", "RJL", "JZMD", "LDL", "YDXZ"], "displayFieldsName": ["地块编号", "地块面积", "容积率", "建筑密度", "绿地率", "用地性质"]
    }, {
        "id": 2, "name": "选址", "description": "规划选址阶段", "url": 'http://'+UrlConfig.IP1+'/arcgis/rest/services/JY/GHSPSJ/MapServer', "layerIndex": "1",
        "queryFields": ["CASE_ID", "PROJECTID", "YDMJ", "JZGM", "YDXZ", "ZSH", "ZSRQ"],
        "displayFieldsName": ["图文关联ID", "项目编号", "用地面积", "建设规模","用地性质", "证书编号","发证日期"]
    }, {
        "id": 3, "name": "条件", "description": "规划条件阶段", "url": 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/GHSPSJ/MapServer', "layerIndex": "0",
        "queryFields": ["CASE_ID", "XMMC", "ZDYDXZ", "JRYDXZ", "JRBL", "YDMJ", "RJLSX", "RJLXX", "LDLSX", "LDLXX", "JZMDSX", "JZMDXX", "JZXG", "XQCZH", "ZXCZH", "ZSH","BJSJ"],
        "displayFieldsName": ["图文关联ID", "项目名称", "主导用地性质", "兼容用地性质", "兼容比例", "用地面积", "容积率上限", "容积率下限", "绿地率上限", "绿地率下限", "建筑密度上限", "建筑密度下限", "建筑限高", "机车车停车位", "非机动车停车位", "通知书编号", "发证日期"]
    }, {
        "id": 4, "name": "用地", "description": "建设用地阶段", "url": 'http://'+UrlConfig.IP1+'/arcgis/rest/services/JY/GHSPSJ/MapServer', "layerIndex": "2",
        "queryFields": ["CASE_ID", "XMMC", "ZDYDXZ", "JRYDXZ", "JRBL", "YDMJ", "RJLSX", "RJLXX", "LDLSX", "LDLXX", "JZMDSX", "JZMDXX","JZXG","XQCZH","ZXCZH","ZSH","ZSRQ"],
        "displayFieldsName": ["图文关联ID", "项目名称", "主导用地性质", "兼容用地性质", "兼容比例", "用地面积", "容积率上限", "容积率下限", "绿地率上限", "绿地率下限", "建筑密度上限", "建筑密度下限", "建筑限高", "机车车停车位", "非机动车停车位", "证书编号", "发证日期"]
    }, {
        "id": 5, "name": "方案", "description": "方案阶段", "url": "", "layerIndex": "", "queryFields": [], "displayFieldsName": []
    }, {
        "id": 6, "name": "工程", "description": "建设工程阶段", "url": 'http://'+UrlConfig.IP1+'/arcgis/rest/services/JY/GHSPSJ/MapServer', "layerIndex": "3",
        "queryFields": ["CASE_ID", "XMMC", "JRJZMJ", "RJL", "LDL", "JZMD", "ZSH", "ZSRQ"],
        "displayFieldsName": ["图文关联ID", "项目名称", "计容建筑面积", "容积率", "绿地率", "建筑密度", "证书编号", "发证日期"]
    }, {
        "id": 7, "name": "核实", "description": "规划核实阶段", "url": "", "layerIndex": "", "queryFields": [], "displayFieldsName": []
    }
    ],

    /**
    *用地平衡分析、用地开发强度评价、一书三证--默认添加专题
    *@property landLayers
    *@type {Object}
    */
    landLayers: [
        { name: '用地平衡分析', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGDK/MapServer', layerIndex: '0' },
        { name: '用地开发强度评价', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGDK/MapServer/', layerIndex: '0' },
        { name: '容积率', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGDK/MapServer/', layerIndex: '1' },
        { name: '绿地率', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGDK/MapServer/', layerIndex: '2' },
        { name: '建筑密度', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGDK/MapServer/', layerIndex: '3' },

        //一书三证
        { name: '选址意见书', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/GHSPSJ/MapServer', layerIndex: '1' },
        { name: '建设用地规划许可证', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/GHSPSJ/MapServer', layerIndex: '2' },
        { name: '建设工程规划许可证', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/GHSPSJ/MapServer', layerIndex: '3' },

    ],

    /**
    *冲突分析--默认添加专题
    *@property conflictLayers
    *@type {Object}
    *layerPath为各图层在SDE数据库中图层名称
    */
    conflictLayers: [
        {
            name: '控规', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGGH/MapServer', layerIndex: '71',
            zoomItemName: "OBJECTID", layerPath: 'JYGISDATA.A_JYKG_规划地块_1'
        },
        {
            name: '规划设计条件', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/GHSPSJ/MapServer', layerIndex: '0',         
            zoomItemName: "OBJECTID", layerPath: 'JYGISDATA.GHTJ_DDT'   
        },
        {
            name: '用地红线', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/GHSPSJ/MapServer', layerIndex: '2',         
            zoomItemName: "OBJECTID", layerPath: 'JYGISDATA.GHYD_DDT'  
        },
        {
            name: '工程红线', url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/GHSPSJ/MapServer', layerIndex: '3',         
            zoomItemName: "OBJECTID", layerPath: 'JYGISDATA.GC_YD_DDT'  
        },

    ],

    /**
    *时间轴所需的服务，可以配置不同年份的专题图
    *@property timeLayers
    *@type {Object}
    layerType配置1代表feature类型图层
    */
    timeLayers: [
	{
        id: 'yx', name: '历史影像', layers: [
           { year: 2005, layerType: 2, url: 'http://' + UrlConfig.IP2 + '/arcgis/rest/services/basemap/kfqhis_2005/MapServer' },
			{ year: 2010, layerType: 2, url: 'http://'+ UrlConfig.IP2+'/arcgis/rest/services/basemap/kfqhis_2010/MapServer'},
			{ year: 2011, layerType: 2, url: 'http://'+ UrlConfig.IP2+'/arcgis/rest/services/basemap/kfqhis_2011/MapServer'},
            { year: 2012, layerType: 2, url: 'http://'+ UrlConfig.IP2+'/arcgis/rest/services/basemap/kfqhis_2012/MapServer'},
			{ year: 2017, layerType: 2, url: 'http://'+ UrlConfig.IP2+'/arcgis/rest/services/basemap/kfq_yxwz2000/MapServer'}
        ]
	}
	],
    /**
    *行政区域信息配置
    *@property xingzhengConfig
    *@type {Object}
    */
    xingzhengConfig: {
        xzqh: '江阴市',
        xingzheng_layer: {
            url: 'http://' + UrlConfig.IP2 + '/arcgis/rest/services/JY/XZQH/MapServer',
            layerIndex: "1",
            sr: 2379,//地图服务的空间参考
            field: 'NAME',
            districtValue: "江阴全市域"
        }
    },
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
        url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/landbalanceJY/GPServer/LandBalance',
        inputParams: {
            In_region: null,
            in_kg_layer: 'JYGISDATA.A_JYKG_规划地块', //图层路径
            in_mark_field: 'YDDM',
            in_popu_field: '',
        },
        outParams: [{ name: 'out_result', type: "string" }],
        PreResult: true,
    },

    /**
    *一书两证统计gp配置
    *@property ydphfxConfig
    *@type {Object}
    */
    yslztjConfig: {
        url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/threeCertificate/GPServer/threeCertificate',
        inputParams: {
            selectRegion:'JYGISDATA.JYXZQH_dt',//全市域数据
            XZFT_Layer: 'JYGISDATA.XZFT_DDT',
            GHYD_Layer: 'JYGISDATA.GHYD_DDT',
            GC_YD_Layer: 'JYGISDATA.GC_YD_DDT',

            MJField: 'YDMJ',
            DMField: 'ZDYDXZ;YDXZ',
            TimeFile: 'STARTTIME',
            NowTime: null,//"2016","2005-07;"自动获取，不用配置
            RegionName: null//"all","澄江街道,顾山镇"自动获取，不用配置
        },
        outParams: [{ name: 'outResult', type: "string" }],
        PreResult: false,
    },

    /**
    *冲突分析gp配置
    *@property ctfxConfig
    *@type {Object}
    */
    ctfxConfig: {
        url:'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/jyconflictAnalysis/GPServer/conflictAnalysis',
        //url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/xj/conflictAnalysis30/GPServer/conflictAnalysis',
        inputParams: {
            Region_Layer: null,//自动获取，无需配置
            //参考对象
            A_JYKG_Layer: 'JYGISDATA.A_JYKG_规划地块_1', 
            //分析对象
            GH_DDT_Layer: 'JYGISDATA.GHTJ_DDT'
        },
        outParams: [{ name: 'outResult', type: "string" }],
    },
    /**
    *用地开发强度评价gp配置
    *@property ydkfqdpjConfig
    *@type {Object}
    */
    ydkfqdpjConfig: {
        url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/landuseIntensityJY/GPServer/landuseIntensity',
        inputParams: {
            In_region: null,//全市域要素类，配置全市域。
            In_PLOTRGN: 'JYGISDATA.A_JYKG_规划地块_1', //图层路径            
            in_otherInfo_str: '[{"0min":"0","0max":"1","1min":"0","1max":"10","2min":"0","2max":"10"},{"0min":"1","0max":"2","1min":"10","1max":"20","2min":"10","2max":"20"},{"0min":"2","0max":"3","1min":"20","1max":"30","2min":"20","2max":"30"},{"0min":"3","0max":"4","1min":"30","1max":"40","2min":"30","2max":"40"},{"0min":"4","0max":"Max","1min":"40","1max":"Max","2min":"40","2max":"Max"}]',
            RJL_field: 'UPLOTRATIO;GREENRATIODO;DENSITYUP',
            tj_field: 'DKMJ',
        },
        In_otherInfo: [{ phase0: " 0＜容积率≤1", phase1: " 1<容积率≤2", phase2: " 2＜容积率≤3", phase3: " 3＜容积率≤4", phase4: " 4＜容积率" }, { phase0: " 0＜绿地率≤10", phase1: " 10＜绿地率≤20", phase2: " 20＜绿地率≤30", phase3: " 30＜绿地率≤40", phase4: " 40＜绿地率" }, { phase0: " 0＜建筑密度≤10", phase1: " 10＜建筑密度≤20", phase2: " 20＜建筑密度≤30", phase3: " 30＜建筑密度≤40", phase4: " 40＜建筑密度" }],
        query_Info: [{ phase0: " UPLOTRATIO<=1", phase1: " UPLOTRATIO<=2 and UPLOTRATIO>1", phase2: " UPLOTRATIO<=3 and UPLOTRATIO>2", phase3: " UPLOTRATIO<=4 and UPLOTRATIO>3", phase4: " UPLOTRATIO>4" }, { phase0: " GREENRATIODO<=10", phase1: " GREENRATIODO<=20 and GREENRATIODO>10", phase2: "GREENRATIODO<=30 and GREENRATIODO>20", phase3: "GREENRATIODO<=40 and GREENRATIODO>30", phase4: "GREENRATIODO>40" }, { phase0: "DENSITYUP<=10", phase1: "DENSITYUP<=20 and DENSITYUP>10", phase2: "DENSITYUP<=30 and DENSITYUP>20", phase3: "DENSITYUP<=40 and DENSITYUP>30", phase4: "DENSITYUP>40" }],
        outParams: [{ name: 'out_result', type: "string" }],
        PreResult: true,
    },
    /**
    *可用地存量分析GP配置
    *@property landuseStockConfig
    *@type {Object}
    **/
    landuseStockConfig: {
        url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/LanduseStock/GPServer/LanduseStock',
        inputParams: {
            In_region: null,
            in_kg_layer: 'JYGISDATA.A_JYKG_规划地块', //图层多个用','隔开
            in_yd_layer: 'JYGISDATA.GHYD_DDT',//用地红线图层，多个用','隔开
            in_mark_field: 'YDDM'//控规用地性质代码字段
        },
        outParams: [{ name: 'out_result', type: "string" }],
        PreResult: true,
    },

    /**
       *公服设施分析GP配置
       *@property PublicServiceConfig
       *@type {Object}
       **/
    PublicServiceConfig: {
        url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/PublicService/GPServer/PublicService',
        inputParams: {
            In_region: null,
            Gh_publicservices: 'JYGISDATA.A_JYKG_配套设施', //图层多个用','隔开
            Type_Field: 'NAME'//控规用地性质代码字段
        },
        outParams: [{ name: 'out_result', type: "string" }],
        PreResult: true,
        buffer_query: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGGH/MapServer/68',
        buffer_url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/BufferAnalysis/GPServer/ServerBuffer',
        buffer_inputParams: {
            Gh_publicservices: null, //公服设施点
            Distance:'',
        },
        buffer_outParams: [{ name: 'out_result', type: "string" }],
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
        queryLayer: 'http://'+UrlConfig.IP1+'/arcgis/rest/services/JY/BzOnemap/MapServer/',//查询图层
        queryAttribute: "案件编码",//项目查看时对应属性
        attributes: ["ObjectId", "PlanDate", "UPDATEDATE", "PassDate", "IsDispose", "StartPlanTime", "StartTime", "PassDate", "Ajbm", "Xzqy", "IsPlan"],//不显示的属性
        detailConfig: [
            {
                name: '控规显势图层',
                url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGDK/MapServer',
                defLayer: { all: "STARTTIME <= date 'th_STARTTIME' AND PLANNAME = 'th_PLANNAME'" }
            },
            {
                name: '控规历史图层',
                url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGDK_HH/MapServer',
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
        url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/GHSPSJ/MapServer',  //项目一张图服务地址
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
        url: 'http://'+UrlConfig.IP1+'/ArcGIS/rest/services/JY/KGDK/MapServer/',//控规服务地址
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
        url: 'http://'+UrlConfig.IP2+'/ArcGIS/rest/services/JY/KGYZT/MapServer/',     //控规服务地址
        ydhxUrl: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/GHSPSJ/MapServer',  //用地红线地址
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
        url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/GHSPSJ/MapServer',//服务地址
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
            url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGDK/MapServer',
            defLayer: { all: "STARTTIME <= date 'th_STARTTIME'" }
            //url: 'http://'+UrlConfig.IP1+'/arcgis/rest/services/JY/KGGH/MapServer',
            //defLayer: { 72: "STARTTIME <= date 'th_STARTTIME'" }
        },
        {
            name: '控规历史图层',
            url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGGH_HH/MapServer',
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
        url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/GHSPSJ/MapServer',//服务地址
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
        manageCellLayer: { url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KZDYBJ/MapServer', layers: [0] },//规划管理单元图层
        statLayers: [//统计图层
            { name: "KGDK", url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGDK/MapServer', layers: [0] },//规划地块
            { name: "YDHX", url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/GHSPSJ/MapServer', layers: [2] },//用地红线
            { name: "PTSS", url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/KGGH/MapServer', layers: [68] }//配套设施
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
                name: "道路",
                url: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/DL_GH/MapServer',
                fields: "DLMC,DLDJ",
                layers: "1"
            }
        ]
    },

    /*****智能选址*****/
    auxiliaryLocConfig: {
        //基本筛选条件
        jbsx:{
            zg: {
                url: 'http://'+UrlConfig.IP1+'/arcgis/rest/services/JY/ZTGHZK/MapServer',
                layerIndex: "7",
                jzmdsx: "JZMD",
                rjlsx: "RJL",
                ldlxx: "LDL",
                jzgdsx: "JZGD",
                ydmj: "SHAPE_Area",
                ydlx: "YDDM",
                filedType:'string',//筛选字段类型“string”“number”
                objectid: "OBJECTID",
                featureclass: "JYGISDATA.A_JYKG_规划地块"//图层对应的数据源名称
            },//jzmdsx: 建筑密度上限, rjlsx: 容积率上限, ldlxx: 绿地率下限,jzgdsx:建筑高度上限
            kg: {
                url: 'http://'+UrlConfig.IP1+'/arcgis/rest/services/JY/KGGH/MapServer',
                layerIndex: "71",
                jzmdsx: "DENSITYUP",
                rjlsx: "UPLOTRATIO",
                ldlxx: "GREENRATIODO",
                jzgdsx: "JZGD",
                ydmj: "SHAPE.AREA",
                ydlx: "YDDM ",
                filedType: 'number',//筛选字段类型“string”“number”
                objectid:"OBJECTID",
                featureclass: "JYGISDATA.A_JYKG_规划地块"//图层对应的数据源名称
            },
        },
        //更多筛选设置
        gdsx: {
            //配套设施
            ptss: {
                url: 'http://'+UrlConfig.IP1+'/arcgis/rest/services/JY/KGGH/MapServer',
                layerIndex: "68",
                //设施名称字段名
                searchfield: "NAME",
            },
            gpservice: {                
                gpurl: 'http://' + UrlConfig.IP1 + '/arcgis/rest/services/JY/sitesele/GPServer/Siteselection',
                inputParams: {
                    GHDK: 'JYGISDATA.A_JYKG_规划地块',
                    DK_Expression:'',
                    SXTJ: 'JYGISDATA.A_JYKG_配套设施',
                    GD_Expression: '',
                    OBJECTID_Field: 'OBJECTID',
                    NAME_Field: 'NAME',
                    Region: null,
                    SearchRadius: '{ "distance": 1000,"units": "esriMeters"}',                    
                },
                outParams: [{ name: 'out_result', type: "string" }],
            }
        },
        factor: {
            szyq: {
                name: "市政设施要求",
                id: "szyq",
                visible: true,
                url: 'http://'+UrlConfig.IP1+'/arcgis/rest/services/JY/KGGH/MapServer',
                layerIndex: "68",
                //设施名称字段名
                searchfield: "NAME",
                featureclass: "JYGISDATA.A_JYKG_配套设施",//图层对应的数据源名称
                //默认分析范围
                defaultdistance:3000,
                level: [
                         { name: "高", value: 1000, items: ["水厂", "加压泵站"], toolTip: "备选地块1000米范围内要求有所选设施." },
                         { name: "中", value: 2000, items: ["污水处理厂", "垃圾中转站"], toolTip: "备选地块2000米范围内要求有所选设施." },
                         { name: "低", value: 3000, items: ["节制闸", "其他设施"], toolTip: "备选地块3000米范围内要求有所选设施." }
                ],
                type: "设施要求",
                mark: "本次选址 <b>{0}</b> 米范围内 <b>{1}</b> {2}，最少需要 <b>{3}</b> 个，该设施服务半径大于等于 <b>{4}</b> 米。",
                condition: [
                    {
                        name: "市政设施",
                        layer: "",
                        items: {
                            对外交通: { layer: "SWATPNT_TZKZ", items: ["铁路站场", "火车站", "公路客运站场", "港口", "飞机场", "城市广场", "社会停车场"] },
                            城市道路: { layer: "SELEPNT_TZKZ", items: ["城市广场", "社会停车场"] },
                            供水排水: { layer: "GASPNT_TZKZ", items: ["自来水厂", "供水加压站", "取水口", "供水管理用房", "污水处理厂", "雨水泵站", "污水泵站", "排水泵站", "防洪闸", "雨水管检查井", "污水管检查井"] },
                            供电: { layer: "SIGPNT_TZKZ", items: ["550KV变电站", "220KV变电站", "110KV变电站", "变电所", "热电厂", "规划10KV开关站", "规划110KV总降压站"] },
                            燃气: { layer: "SOUWRGN_TZKZ", items: ["燃气气源厂", "燃气调压站", "门站", "燃气设施抢险点", "燃气储配站"] },
                            供热: { layer: "CORRRNG_TZKZ", items: ["热源厂", "热力站"] },
                            公共交通: { layer: "MICRLIN_TZKZ", items: ["公交首末站", "公交站场", "公交停车保养场", "轮渡", "货运站", "地铁地面站", "轻轨地面站", "液化石油气汽车加气站", "液化气站", "加油站"] },
                            邮政: { layer: "SELEPNT_TZKZ", items: ["邮政局", "邮政支局", "邮政所"] },
                            电信: { layer: "MICRLIN_TZKZ", items: ["电信枢纽中心", "综合电信母局", "电信端局", "电信分局", "交换局", "保护无线电台站", "保护微波通道", "移动通信基站"] },
                            环卫: { layer: "MICRLIN_TZKZ", items: ["垃圾转运站", "垃圾压缩站", "垃圾填埋场", "环卫所", "环卫停车场", "公共厕所"] },
                            殡葬: { layer: "CORRRNG_TZKZ", items: ["殡葬设施"] },
                            其他市政公用设施: { layer: "MICRLIN_TZKZ", items: ["消防指挥中心", "消防站（一般)", "消防站（特勤)", "消防站（水上）", "水闸", "排涝泵站", "市场管理", "市政管理"] }
                        }
                    }
                ]
            },
            ggyq: {
                name: "公共服务设施要求",
                id: "ggyq",
                visible: true,
                url: 'http://'+UrlConfig.IP1+'/arcgis/rest/services/JY/KGGH/MapServer',
                layerIndex: "68",
                //设施名称字段名
                searchfield: "NAME",
                featureclass: "JYGISDATA.A_JYKG_配套设施",//图层对应的数据源名称
                //默认分析范围
                defaultdistance: 1500,
                level: [
                         { name: "高", value: 500, items: ["图书展览设施", "青少年宫"], toolTip: "备选地块500米范围内要求有所选设施." },
                         { name: "中", value: 1000, items: ["综合文化活动中心", "居民健身设施"], toolTip: "备选地块1000米范围内要求有所选设施." },
                         { name: "低", value: 1500, items: ["职业学校", "动物检疫站"], toolTip: "备选地块1500米范围内要求有所选设施." }
                ],
                type: "设施要求",
                condition: [
                    {
                        name: "公共服务设施",
                        layer: "CULPNT_TZKZ",
                        items: {
                            居住: { layer: "", items:  ["小学", "幼儿园", "托儿所", "文化体育活动站", "居民健身设施", "卫生站", "便利店", "储蓄所", "变电所", "餐饮", "综合百货店", "其他第三产业设施", "社区服务中心", "托老所", "社区居委会", "物业管理", "路灯配电室"]},
                            行政办公: { layer: "", items:  ["公安派出所", "工商所", "税务所", "街道办事处", "市政府"]},
                            商业金融: { layer: "", items:  ["银行", "保险公司", "证券公司", "购物中心","专业商场", "综合商场", "旅馆", "中西药店"]},
                            文化娱乐: { layer: "", items:  ["图书馆", "博物馆", "影剧院", "青少年活动中心","文化活动中心", "综合娱乐", "休闲服务", "书店"]},
                            体育: { layer: "", items:  ["体育中心", "运动场", "游泳场", "居住区体育中心"]},
                            医疗卫生: { layer: "", items:  ["综合医院", "疾病预防控制中心", "妇幼保健医院", "残疾人康复中心", "护理院"]},
                            教育科研: { layer: "", items:  ["职业技术教育专业培训"]},
                            文物古迹: { layer: "", items:  ["国家级文保单位", "省级文保单位", "市级文保单位", "区级及其以下文保单位"]},
                            其他公益性建设: { layer: "", items:  ["福利院", "养老院", "残疾人托养所"]},
                            社区配套公建: { layer: "", items:  ["绿地", "中学", "社区卫生服务中心", "肉菜市场", "老年公寓", "社区活动用房", "其他管理用房"]},
                            人防抗震: { layer: "", items:  ["人防指挥所", "避震疏散场地", "中心避震疏散场地"]},
                            燃气: { layer: "", items:  ["高中压调压站", "高高压调压站"]},
                            电信: { layer: "", items:  ["综合通信中心（多网合一）"]},
                            广电: { layer: "", items:  ["广电中心", "广电站"]},
                        } 
                    }
                ]
            },
            dlyq: {
                name: "道路要求",
                id: "dlyq",
                visible: true,
                url: 'http://'+UrlConfig.IP1+'/arcgis/rest/services/JY/KGGH/MapServer',
                layerIndex: "68",
                //设施名称字段名
                searchfield: "DLDJ",
                type: "交通要求",
                featureclass: "JYGISDATA.B_JYKG_道路中心线",//图层对应的数据源名称
                //默认分析范围
                defaultdistance: 3000,
                level: [
                             { name: "高", value: 1000, toolTip: "备选地块1000米范围内要求有所选道路." },
                             { name: "中", value: 2000, toolTip: "备选地块2000米范围内要求有所选道路." },
                             { name: "低", value: 3000, toolTip: "备选地块3000米范围内要求有所选道路." }
                ],

                condition: [
                    {
                        name: "道路",
                        layer: "",
                        items: {
                            道路类型: { layer: "gsgl_dlyq", items: ["高速公路", "快速路", "主干道"] }
                        }
                    }]
            }            
        },
        region_table: 'ZJRGN_SDJCKJ',
        region_field: 'XZQMC',

        //用地类型
        landType_select: [
            { name: "总规", landType_table: "PLOTRGN_SDZG", landType_field: "OLDMARK,OLDKINDS" },
            { name: "控规和分规", landType_table: "PLOTRGN_TZKZ;PLOTRGN_DYKZ", landType_field: "MARK,KINDS;MARK,KINDS" }
        ],
        landType_table: 'PLOTRGN_TZKZ',
        landType_field: 'KINDS'
    }

    
};