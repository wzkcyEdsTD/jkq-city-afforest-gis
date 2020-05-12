/*
类名：数据处理类
*/

define("data/manage/handledata", [
    "leaflet",
    "core/dcins"
], function (L) {

    L.DCI.Manage.HandleData = L.Class.extend({
        id: 'handleData',

        initialize: function () {
        },

        /*
        * 用户管理模块
        */

        //用户树(#userTree )-根节点
        userTreeRoot: function () {
            this.id = 0;
            this.pId = -1;
            this.name = "用户列表";
            this.type = "root";
            this.open = true;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose};
        },
        //用户树(#userTree)-用户节点
        userTreeUser: function (id, userName, name, password) {
            this.id = id;
            this.pId = 0;
            this.name = userName;
            this.displayName = name;
            this.password = password;
            this.type = "user";
            this.icon = "themes/default/images/manage/user.png";      //自定义图标

            return { "id": this.id, "pId": this.pId, "name": this.name, "displayName": this.displayName, "password": this.password, "type": this.type, "icon": this.icon};
        },

        //组织机构树(#organizationTree)-根节点
        organizationRoot: function () {
            this.id = 'department-0';
            this.pId = -1;
            this.departmentId = 0;
            this.name = "组织机构列表";
            this.type = "root";
            this.open = true;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "departmentId": this.departmentId, "name": this.name, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose};
        },
        //组织机构树(#organizationTree)-部门节点
        organizationDepartment: function (id, pId, name, description, type, sIndex, status) {
            this.id = 'department-' + id;
            this.pId = 'department-' + pId;
            this.departmentId = id;
            this.departmentPId = pId;
            this.name = name;
            this.description = description;
            this.sIndex = sIndex;
            this.type = type;
            this.open = status;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "departmentId": this.departmentId, "departmentPId": this.departmentPId, "name": this.name, "description": this.description, "sIndex": this.sIndex, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose};
        },
        //组织机构树(#organizationTree)-用户节点
        organizationUser: function (id, pId, name) {
            this.id = id;
            this.pId = 'department-' + pId;
            this.userId = id;
            this.departmentId = pId;
            this.name = name;
            this.type = "user";
            this.icon = "themes/default/images/manage/user.png";      //自定义图标

            return { "id": this.id, "pId": this.pId, "userId": this.userId, "departmentId": this.departmentId, "name": this.name, "type": this.type, "icon": this.icon};
        },

        //角色树(#roleTree)-根节点
        roleTreeRoot: function () {
            this.id = 0;
            this.pId = -1;
            this.name = "角色列表";
            this.type = "root";
            this.open = true;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose};
        },
        //角色树(#roleTree)-角色节点
        roleTreeRole: function (id, name, description, sIndex, status) {
            this.id = 'role-' + id;
            this.pId = 0;
            this.roleId = id;
            this.name = name;
            this.description = description;
            this.sIndex = sIndex;
            this.type = "role";
            this.open = status;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "roleId": this.roleId, "name": this.name, "description": this.description, "sIndex": this.sIndex, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose};
        },
        //角色树(#roleTree)-用户节点
        roleTreeUser: function (id, pId, name) {
            this.id = 'user-' + id;
            this.pId = 'role-' + pId;
            this.userId = id;
            this.roleId = pId;
            this.name = name;
            this.type = "user";
            this.nocheck = true;
            this.icon = "themes/default/images/manage/user.png";      //自定义图标

            return { "id": this.id, "pId": this.pId, "userId": this.userId, "roleId": this.roleId, "name": this.name, "type": this.type, "nocheck": this.nocheck, "icon": this.icon};
        },




        /*
        * 专题配置模块
        */
        //资源树(#featureTree)-根节点
        featureTreeRoot: function () {
            this.id = 0;
            this.pId = -1;
            this.name = "一张图";
            this.type = "root";
            this.open = true;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        //专题树(#featureTree)-专题类型节点
        featureTreeFeatureType: function (id, pId, name, type, sIndex, extent, image, status) {
            this.id = id;
            this.pId = pId;
            this.name = name;
            this.type = type;
            this.sIndex = sIndex;
            this.extent = extent;
            this.image = image;
            this.open = status;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "sIndex": this.sIndex, "extent": this.extent, "image": this.image, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        //专题树(#featureTree)-专题节点
        featureTreeFeature: function (id, pId, name, type, sIndex, extent, image) {
            this.id = id;
            this.pId = pId;
            this.name = name;
            this.type = type;
            this.sIndex = sIndex;
            this.extent = extent;
            this.image = image;
            this.icon = "themes/default/images/manage/thematic.png";      //自定义图标

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "sIndex": this.sIndex, "extent": this.extent, "image": this.image, "icon": this.icon };
        },

        //资源树(#resourceTree)-根节点
        resourceRoot: function () {
            this.id = 0;
            this.pId = -1;
            this.name = "服务资源";
            this.type = "root";
            this.open = true;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        //资源树(#resourceTree)-资源类型节点
        resourceType: function (id, name, status) {
            this.id = 'resourceType-' + id;
            this.pId = 0;
            this.name = name;
            this.type = "resourceType";
            this.open = status;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        //资源树(#resourceTree)-矢量图层节点(包括矢量图层类型和WMS图层类型)
        resourceDynamicMapLayer: function (id, pId, name, status) {
            this.id = 'dynamicLayer-' + id;
            this.pId = 'resourceType-' + pId;
            this.name = name;
            this.type = "dynamicLayer";
            this.open = status;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        //资源树(#resourceTree)-切片图层下的节点(包括切片图层类型和WMTS图层类型)
        resourceTiledMapLayer: function (id, pId, name) {
            this.id = 'tiledLayer-' + id;
            this.pId = 'resourceType-' + pId;
            this.layerId = "";
            this.resourceId = id;
            this.name = name;
            this.type = "tiledLayer";

            return { "id": this.id, "pId": this.pId, "layerId": this.layerId, "resourceId": this.resourceId, "name": this.name, "type": this.type};
        },
        //资源树(#resourceTree)-矢量图下的图层节点
        resourceLayer: function (id, pId, resourceId, name, sIndex) {
            this.id = 'layer-' + id;
            this.pId = 'dynamicLayer-' + pId;
            this.layerId = id;
            this.resourceId = resourceId;
            this.name = name;
            this.sIndex = sIndex;
            this.type = "layer";

            return { "id": this.id, "pId": this.pId, "layerId": this.layerId, "resourceId": this.resourceId, "name": this.name, "sIndex": this.sIndex, "type": this.type};
        },

        //专题配置结果(#featureResourceTree)-根节点
        featureConfigResultRoot: function () {
            this.id = 0;
            this.pId = -1;
            this.name = "专题配置结果";
            this.type = "root";
            this.open = true;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）
            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        //专题配置结果(#featureResourceTree)-节点
        featureConfigResult: function (layerId, nodeId, resourceId, name, sIndex) {
            this.id = layerId;
            this.pId = 0;
            this.nodeId = nodeId;
            this.resourceId = resourceId;
            this.name = name;
            this.sIndex = sIndex;
            this.type = "layer";

            return { "id": this.id, "pId": this.pId, "nodeId": this.nodeId, "resourceId": this.resourceId, "name": this.name, "sIndex": this.sIndex, "type": this.type };
        },



        /*
        * 权限配置模块
        */

        //角色树(#privilegeConfigRoleTree)-根节点
        roleTreeRoot2: function () {
            this.id = 0;
            this.pId = -1;
            this.name = "角色列表";
            this.type = "root";
            this.open = true;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        //角色树(#privilegeConfigRoleTree)-角色节点
        roleTreeRole2: function (id, name, description, sIndex) {
            this.id = 'role-' + id;
            this.pId = 0;
            this.roleId = id;
            this.name = name;
            this.description = description;
            this.sIndex = sIndex;
            this.type = "role";
            this.icon = "themes/default/images/manage/role.png";      //自定义图标

            return { "id": this.id, "pId": this.pId, "roleId": this.roleId, "name": this.name, "description": this.description, "sIndex": this.sIndex, "type": this.type, "icon": this.icon };
        },

        //资源树(#privilegeConfigFeatureTree)-根节点
        featureTreeRoot2: function () {
            this.id = 0;
            this.pId = -1;
            this.name = "一张图";
            this.type = "root";
            this.open = true;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        //专题树(#privilegeConfigFeatureTree)-专题类型节点
        featureTreeFeatureType2: function (id, pId, name, type, sIndex, extent, image, status) {
            this.id = id;
            this.pId = pId;
            this.name = name;
            this.type = type;
            this.sIndex = sIndex;
            this.extent = extent;
            this.image = image;
            this.open = status;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "sIndex": this.sIndex, "extent": this.extent, "image": this.image, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        //专题树(#privilegeConfigFeatureTree)-专题节点
        featureTreeFeature2: function (id, pId, name, type, sIndex, extent, image) {
            this.id = id;
            this.pId = pId;
            this.name = name;
            this.type = type;
            this.sIndex = sIndex;
            this.extent = extent;
            this.image = image;
            this.icon = "themes/default/images/manage/thematic.png";      //自定义图标

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "sIndex": this.sIndex, "extent": this.extent, "image": this.image, "icon": this.icon };
        },

        //功能资源树(#privilegeConfigFunctionTree)-根节点  
        functionTreeRoot2: function (id, name) {
            this.id = 'functionType-0';
            this.pId = -1;
            this.name = "功能";
            this.type = "root";
            this.open = true;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        //功能资源树(#privilegeConfigFunctionTree)-功能类型节点
        functionTreeFunctionType2: function (id, name, sIndex) {
            this.id = 'functionType-' + id;
            this.pId = "functionType-0";
            this.name = name;
            this.sIndex = sIndex;
            this.type = "functionType";
            this.open = open;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "sIndex": this.sIndex, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        //功能资源树(#privilegeConfigFunctionTree)-功能节点
        functionTreeFunction2: function (id, pId, name, sIndex) {
            this.id = 'function-' + id;
            this.pId = 'functionType-' + pId;
            this.name = name;
            this.sIndex = sIndex;
            this.type = "function";
            this.icon = "themes/default/images/manage/function.png";      //自定义图标

            return { "id": this.id, "pId": this.pId, "name": this.name, "sIndex": this.sIndex, "type": this.type, "icon": this.icon };
        },



        /*
        * 功能管理模块
        */

        //功能资源树(#resFunctionFunctionTree)-根节点  
        functionTreeRoot: function () {
            this.id = 'functionType-0';
            this.pId = -1;
            this.name = "功能";
            this.type = "root";
            this.open = true;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        //功能资源树(#resFunctionFunctionTree)-功能类型节点
        functionTreeFunctionType: function (id, name,clsName,description, sIndex) {
            this.id = 'functionType-' + id;
            this.pId = "functionType-0";
            this.functionTypeId = id;
            this.name = name;
            this.clsName = clsName;
            this.description = description;
            this.sIndex = sIndex;
            this.type = "functionType";
            this.open = open;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "functionTypeId": this.functionTypeId, "name": this.name, "clsName": this.clsName, "description": this.description, "sIndex": this.sIndex, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        //功能资源树(#resFunctionFunctionTree)-功能节点
        functionTreeFunction: function (id, pId, name,displayName,execute,clsName,description, sIndex) {
            this.id = 'function-' + id;
            this.pId = 'functionType-' + pId;
            this.functionId = id;
            this.functionTypeId = pId;
            this.name = displayName;
            this.functionName = name;
            this.displayName = displayName;
            this.execute = execute;
            this.clsName = clsName;
            this.description = description;
            this.sIndex = sIndex;
            this.type = "function";
            this.icon = "themes/default/images/manage/function.png";      //自定义图标

            return { "id": this.id, "pId": this.pId, "functionId": this.functionId, "functionTypeId": this.functionTypeId, "name": this.name, "functionName": this.functionName, "displayName": this.displayName, "execute": this.execute, "clsName": this.clsName, "description": this.description, "sIndex": this.sIndex, "type": this.type, "icon": this.icon };
        },



        /*
        * 图层对照模块
        */

        //案件列表树(#businessTree)-根节点  
        layerContrastBusinessRoot: function () {
            this.id = 0;
            this.pId = -1;
            this.name = "业务列表";
            this.type = "root";
            this.open = true;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },

        //案件列表树(#businessTree)-子系统节点
        layerContrastBusinessSystem: function (id, name, sIndex, syskey, status) {
            this.id = id;
            this.pId = 0;
            this.name = name;
            this.type = "子系统";
            this.sIndex = sIndex;
            this.syskey = syskey;
            this.open = status;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "sIndex": this.sIndex, "syskey": this.syskey, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },

        //案件列表树(#businessTree)-类型节点
        layerContrastBusinessType: function (id, pId, name, btmId, type, sIndex,syskey, status) {
            this.id = id;
            this.pId = pId;
            this.name = name;
            this.btmId = btmId;
            this.type = type;
            this.sIndex = sIndex;
            this.syskey = syskey;
            this.open = status;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "btmId": this.btmId, "type": this.type, "sIndex": this.sIndex, "syskey": this.syskey, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },

        //案件列表树(#businessTree)-业务节点
        layerContrastBusiness: function (id, pId, displayName, name, btmId, type, sIndex, syskey) {
            this.id = id;
            this.pId = pId;
            this.name = displayName;
            this.nodeName = name;
            this.btmId = btmId;
            this.type = type;
            this.sIndex = sIndex;
            this.syskey = syskey;
            this.icon = "themes/default/images/manage/thematic.png";      //自定义图标

            return { "id": this.id, "pId": this.pId, "name": this.name, "nodeName": this.nodeName, "btmId": this.btmId, "type": this.type, "sIndex": this.sIndex, "syskey": this.syskey, "icon": this.icon };
        },



        //专题树(#layerContrastTree)-根节点
        layerContrastFeatureRoot: function () {
            this.id = 0;
            this.pId = -1;
            this.name = "一张图";
            this.type = "root";
            this.open = true;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        //专题树(#layerContrastTree)-专题类型节点
        layerContrastFeatureType: function (id, pId, name, type, sIndex, extent, image, status) {
            this.id = id;
            this.pId = pId;
            this.name = name;
            this.type = type;
            this.sIndex = sIndex;
            this.extent = extent;
            this.image = image;
            this.open = status;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "sIndex": this.sIndex, "extent": this.extent, "image": this.image, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        //专题树(#layerContrastTree)-专题节点
        layerContrastFeature: function (id, pId, name, type, sIndex, extent, image) {
            this.id = id;
            this.pId = pId;
            this.name = name;
            this.type = type;
            this.sIndex = sIndex;
            this.extent = extent;
            this.image = image;
            this.icon = "themes/default/images/manage/thematic.png";      //自定义图标

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "sIndex": this.sIndex, "extent": this.extent, "image": this.image, "icon": this.icon };
        },


        //资源树(#layerContrastTree)-根节点
        layerContrastResourceRoot: function () {
            this.id = 0;
            this.pId = -1;
            this.name = "服务资源";
            this.type = "root";
            this.open = true;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        
        //资源树(#layerContrastTree)-资源类型节点
        layerContrastResourceType: function (id, name, status) {
            this.id = 'resourceType-' + id;
            this.pId = 0;
            this.name = name;
            this.type = "resourceType";
            this.open = status;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        
        //资源树(#layerContrastTree)-矢量图层节点(包括矢量图层类型和WMS图层类型)
        layerContrastResourceDynamicMapLayer: function (id, pId, name, status) {
            this.id = 'dynamicLayer-' + id;
            this.pId = 'resourceType-' + pId;
            this.name = name;
            this.type = "dynamicLayer";
            this.open = status;
            this.isParent = true;
            this.children = [];
            this.iconOpen = "themes/default/images/manage/folder-open.png";       //自定义图标（打开）
            this.iconClose = "themes/default/images/manage/folder-close.png";     //自定义图标（关闭）

            return { "id": this.id, "pId": this.pId, "name": this.name, "type": this.type, "open": this.open, "isParent": this.isParent, "children": this.children, "iconOpen": this.iconOpen, "iconClose": this.iconClose };
        },
        //资源树(#layerContrastTree)-切片图层下的节点(包括切片图层类型和WMTS图层类型)
        layerContrastResourceTiledMapLayer: function (id, pId, name) {
            this.id = 'tiledLayer-' + id;
            this.pId = 'resourceType-' + pId;
            this.layerId = "";
            this.resourceId = id;
            this.name = name;
            this.type = "tiledLayer";

            return { "id": this.id, "pId": this.pId, "layerId": this.layerId, "resourceId": this.resourceId, "name": this.name, "type": this.type };
        },
        //资源树(#layerContrastTree)-矢量图下的图层节点
        layerContrastResourceLayer: function (id, pId, resourceId, name, sIndex) {
            this.id = 'layer-' + id;
            this.pId = 'dynamicLayer-' + pId;
            this.layerId = id;
            this.resourceId = resourceId;
            this.name = name;
            this.sIndex = sIndex;
            this.type = "layer";

            return { "id": this.id, "pId": this.pId, "layerId": this.layerId, "resourceId": this.resourceId, "name": this.name, "sIndex": this.sIndex, "type": this.type };
        },

        //全局查询配置结果（#GlobalSearchResultTree）
        globalsearchConfigResult: function (id, recordid, layers, field, name) {
            var node = new Object();
            node.id = id;
            node.pId = -1;
            node.name = name;
            node.type = "record";
            node.open = false;
            node.isParent = false;
            node.children = [];
            node.fields = field;
            node.layers = layers;
            node.iconOpen = "themes/default/images/controls/folder-open.png";       //自定义图标（打开）
            node.iconClose = "themes/default/images/controls/folder-close.png";     //自定义图标（关闭）

            return { "recordid": recordid, "id": node.id, "pId": node.pId, "name": node.name, "fields": node.fields, "layerChecked": node.layers, "type": node.type, "open": node.open, "isParent": node.isParent, "children": node.children, "iconOpen": node.iconOpen, "iconClose": node.iconClose };
        },

    });
});