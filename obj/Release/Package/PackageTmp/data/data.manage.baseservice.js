/*
*基础服务调用
*/
define("data/manage/baseservice", [
    "leaflet",
    "core/dcins",
    "data/ajax"
], function (L) {
    L.DCI.Manage.BaseServices = L.Class.extend({

        id: 'BaseService',

        ajax: null,

        baseUrl: null,

        initialize: function () {
            this.baseUrl = Project_ParamConfig.defaultCoreServiceUrl;
            this.ajax = new L.DCI.Ajax();
        },

        /**
        * 部门
        -----------------------------*/

        //获取组织机构树（所有部门）
        getOrganizationTree: function (options) {
            var url = this.baseUrl + "/cpzx/manage/department/all";
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        //获取所有部门的用户（用户部门表）
        getDeptUser: function (options) {
            var url = this.baseUrl + "/cpzx/manage/department/all/user";
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        //获取所有部门的用户（用户部门表OA信息）
        getOaDeptUser: function (options) {
            var url = this.baseUrl + "/cpzx/manage/department/all/oa/user";
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        //添加一个部门
        addDepartment: function (options) {
            var url = this.baseUrl + "/cpzx/manage/department/add";
            this.ajax.put(url, options.data, options.async, options.context, options.success, options.error);
        },
        //更改一个部门
        updateDepartment: function (options) {
            var url = this.baseUrl + "/cpzx/manage/department/update";
            this.ajax.post(url, options.data, options.async, options.context, options.success, options.error);
        },
        //删除部门(可删除多个)
        deleteDepartment: function (options) {
            var url = this.baseUrl + "/cpzx/manage/department/deleteMore";
            this.ajax.Delete(url, options.data, options.async, options.context, options.success, options.error);
        },
        //通过部门id获取用户
        getUserFromDepartmentId: function (options) {
            var url = this.baseUrl + "/cpzx/manage/department/"+ options.id +"/user";
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        //删除部门用户
        deleteUserDept: function (options) {
            var url = this.baseUrl + "/cpzx/manage/department/delete/user";
            this.ajax.Delete(url, options.data, options.async, options.context, options.success, options.error);
        },


        //同步OA数据库的用户以及组织机构信息
        synchronizedOAInfo: function (options) {
            var url = this.baseUrl + "/cpzx/manage/department/synchronizedOAInfo/" + options.status;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },



        /**
       * 用户
       -----------------------------*/

        //获取用户树（所有用户）
        getUserTree: function (options) {
            var url = this.baseUrl + "/cpzx/manage/user/all";
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        //添加一个用户
        addUser: function (options) {
            var url = this.baseUrl + "/cpzx/manage/user/add";
            this.ajax.put(url, options.data, options.async, options.context, options.success, options.error);
        },
        //更改一个用户
        editUser: function (options) {
            var url = this.baseUrl + "/cpzx/manage/user/update";
            this.ajax.post(url, options.data, options.async, options.context, options.success, options.error);
        },
        //删除一个用户
        deleteUser: function (options) {
            var id = options.id;
            var url = this.baseUrl + "/cpzx/manage/user/" + id;
            this.ajax.Delete(url, options.data, options.async, options.context, options.success, options.error);
        },
        //删除多个用户
        deleteUsers: function (options) {
            var url = this.baseUrl + "/cpzx/manage/user/delete/more";
            this.ajax.Delete(url, options.data, options.async, options.context, options.success, options.error);
        },
        //添加用户部门
        addUserDept: function (options) {
            var url = this.baseUrl + "/cpzx/manage/user/add/user/department";
            this.ajax.put(url, options.data, options.async, options.context, options.success, options.error);
        },

        //验证用户密码
        verifyUserPassword: function (options) {
            var url = this.baseUrl + "/cpzx/manage/user/verifyPassword/" + options.userId +"/"+ options.password;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        
        /**
       * 角色
       -----------------------------*/

        //获取所有角色
        getRole: function (options) {
            var url = this.baseUrl + "/cpzx/manage/role/base/all";
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        //获取所有角色的用户（用户角色表）
        getUserRole: function (options) {
            var url = this.baseUrl + "/cpzx/manage/role/base/all/user";
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        //添加角色
        addRole: function (options) {
            var url = this.baseUrl + "/cpzx/manage/role/base/add";
            this.ajax.put(url, options.data, options.async, options.context, options.success, options.error);
        },
        //更改角色
        updateRole: function (options) {
            var url = this.baseUrl + "/cpzx/manage/role/base/update";
            this.ajax.post(url, options.data, options.async, options.context, options.success, options.error);
        },
        //删除一个角色
        deleteRole: function (options) {
            var id = options.id;
            var url = this.baseUrl + "/cpzx/manage/role/base/" + id;
            this.ajax.Delete(url, null, options.async, options.context, options.success, options.error);
        },
        //删除多个角色
        deleteRoles: function (options) {
            var url = this.baseUrl + "/cpzx/manage/role/base/deleteMore";
            this.ajax.Delete(url, options.data, options.async, options.context, options.success, options.error);
        },
        //添加用户角色（用户角色表）
        addUserRoles: function (options) {
            var url = this.baseUrl + "/cpzx/manage/role/base/user/role";
            this.ajax.put(url, options.data, options.async, options.context, options.success, options.error);
        },
        //删除一个用户角色权限
        deleteUserRole: function (options) {
            var url = this.baseUrl + "/cpzx/manage/role/base/user/role";
            this.ajax.Delete(url, options.data, options.async, options.context, options.success, options.error);
        },

       /**
       * 专题
       -----------------------------*/
        //获取所有专题
        getAllFeature: function (options) {
            var url = this.baseUrl + "/cpzx/manage/feature/base/all";
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        /**
         *更新某一专题顺序sIndex
         *@method updateSindex
         *@param options {Object} 次序更新参数
         */
        updateSindex: function (options) {
            var id = options.id;
            var pId = options.pId;
            var sIndex = options.sIndex;
            var targetIndex = options.targetIndex;
            var url = this.baseUrl + "/cpzx/manage/feature/base/update/" + id + "/" + pId + "/" + sIndex + "/" + targetIndex;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },

        //获取某一专题所拥有的图层和资源（限于资源图层表）
        getLayersFromFeatureId: function (options) {
            var id = options.id;
            var url = this.baseUrl + "/cpzx/manage/feature/base/feature/" + id;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        //获取专题图片名称集
        getImageName: function (options) {
            var url = 'manage/GetAllFeaturePicturesName.ashx';
            this.ajax.post(url, options.data, options.async, options.context, options.success, options.error);
        },
        //添加一个专题
        addFeature: function (options) {
            var url = this.baseUrl + "/cpzx/manage/feature/base/add";
            this.ajax.put(url, options.data, options.async, options.context, options.success, options.error);
        },
        //编辑一个专题
        editFeature: function (options) {
            var id = options.id;
            var url = this.baseUrl + "/cpzx/manage/feature/base/update";
            this.ajax.post(url, options.data, options.async, options.context, options.success, options.error);
        },
        //删除一个专题
        deleteFeature: function (options) {
            var id = options.id;
            var url = this.baseUrl + "/cpzx/manage/feature/base/" + id;
            this.ajax.Delete(url, null, options.async, options.context, options.success, options.error);
        },
        //添加图层到专题
        addFeatureLayers: function (options) {
            var url = this.baseUrl + "/cpzx/manage/feature/base/add/feature/layer";
            this.ajax.put(url, options.data, options.async, options.context, options.success, options.error);
        },
        //删除专题图层
        deleteFeatureLayers: function (options) {
            var url = this.baseUrl + "/cpzx/manage/feature/base/delete/feature/layer";
            this.ajax.Delete(url, options.data, options.async, options.context, options.success, options.error);
        },





       /**
       * 服务资源
       -----------------------------*/

        //获取所有资源类型
        getResourceType: function (options) {
            var url = this.baseUrl + "/cpzx/manage/resource/base/type/all";
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        //获取所有资源
        getResource: function (options) {
            var url = this.baseUrl + "/cpzx/manage/resource/base/all";
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        //获取所有图层
        getLayer: function (options) {
            var url = this.baseUrl + "/cpzx/manage/resource/base/layer/all";
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        //获取一个服务的图层信息：
        getLayers: function (options) {
            var url = options.url;
            //var data = { f: "json" };
            this.ajax.get(url, '', options.async, options.context, options.success, options.error);
        },
        //获取分页资源
        getPageResource: function (options) {
            var showNum = options.showNum;      //每页最多显示个数
            var pageNum = options.pageNum;      //显示第几页
            var url = this.baseUrl + "/cpzx/manage/resource/base/page/" + showNum + "/" + pageNum;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        //模糊搜索获取分页资源
        getPageResourceByFuzzy: function (options) {
            var name = options.name;            //搜索名称
            var showNum = options.showNum;      //每页最多显示个数
            var pageNum = options.pageNum;      //显示第几页
            var url = this.baseUrl + "/cpzx/manage/resource/base/pageByFuzzy/" + name + "/" + showNum + "/" + pageNum;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        //注册切片服务
        addResource: function (options) {
            var url = this.baseUrl + '/cpzx/manage/resource/base/tileResource';
            this.ajax.put(url, options.data, options.async, options.context, options.success, options.error);
        },
        //注册矢量服务(插入资源以及相应的图层信息)
        addResourceAndLayer: function (options) {
            var url = this.baseUrl + '/cpzx/manage/resource/base/dynamicResource';
            this.ajax.put(url, options.data, options.async, options.context, options.success, options.error);
        },
        //删除服务
        deleteResource: function (options) {
            var id = options.id;
            var url = this.baseUrl + "/cpzx/manage/resource/base/" + id;
            this.ajax.Delete(url, options.async, options.data, options.context, options.success, options.error);
        },
        /**
         *更新资源锁定状态
         *@method updateResourceLock
         *@param options {Object} 锁定资源id和状态
         */
        updateResourceLock: function (options) {
            var locked = options.locked;
            var resourceId = options.resourceId;

            var url = this.baseUrl + "/cpzx/manage/resource/base/" + resourceId + "/" + locked;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        /**
         *更新资源
         *@method updateResourceData
         *@param options {Object} 资源的信息
         */
        updateResourceData: function (options) {
            var url = this.baseUrl + "/cpzx/manage/resource/base/updateResource";
            this.ajax.post(url, options.data, options.async, options.context, options.success, options.error);
        },

        /**
         *验证服务地址是否正确可用
         *@method varifyServiceUrl
         *@param options {Object} 资源的信息
         */
        varifyServiceUrl: function (options) {
            var url = 'manage/varifyServerUrl.ashx';
            this.ajax.post(url, options.data, options.async, options.context, options.success, options.error);
        },

       /**
       * 功能
       -----------------------------*/

        //获取所有功能类型
        getFunctionType: function (options) {
            var url = this.baseUrl + "/cpzx/manage/function/type/all";
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        //获取功能树
        getFunction: function (options) {
            var url = this.baseUrl + "/cpzx/manage/function/base/all";
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        getFunctionTypeById: function (options) {
            var url = this.baseUrl + "/cpzx/manage/function/type/" + options.id;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        getFunctionById: function(options) {
            var url = this.baseUrl + "/cpzx/manage/function/base/"+options.id;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },


        //添加功能类型
        addFunctionType: function (options) {
            var url = this.baseUrl + "/cpzx/manage/function/type/add";
            this.ajax.put(url, options.data, options.async, options.context, options.success, options.error);
        },
        //添加功能
        addFunction: function (options) {
            var url = this.baseUrl + "/cpzx/manage/function/base/add";
            this.ajax.put(url, options.data, options.async, options.context, options.success, options.error);
        },
        //编辑功能类型
        editFunctionType: function (options) {
            var url = this.baseUrl + "/cpzx/manage/function/type/update";
            this.ajax.post(url, options.data, options.async, options.context, options.success, options.error);
        },
        //编辑功能
        editFunction: function (options) {
            var url = this.baseUrl + "/cpzx/manage/function/base/update";
            this.ajax.post(url, options.data, options.async, options.context, options.success, options.error);
        },
        //删除功能类型
        deleteFunctionType: function (options) {
            var id = options.id;
            var url = this.baseUrl + "/cpzx/manage/function/type/" + id;
            this.ajax.Delete(url, null, options.async, options.context, options.success, options.error);
        },
        //删除功能
        deleteFunction: function (options) {
            var id = options.id;
            var url = this.baseUrl + "/cpzx/manage/function/base/" + id;
            this.ajax.Delete(url, null, options.async, options.context, options.success, options.error);
        },

        /**
         *更新功能类型顺序sIndex
         *@method updateFunctionTypeSindex
         *@param options {Object} 次序更新参数
         */
        updateFunctionTypeSindex: function (options) {
            var id = options.id;
            var pId = options.pId;
            var sIndex = options.sIndex;
            var targetIndex = options.targetIndex;
            var url = this.baseUrl + "/cpzx/manage/function/type/update/" + id + "/" + sIndex + "/" + targetIndex;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        /**
         *更新功能顺序sIndex
         *@method updateFunctionSindex
         *@param options {Object} 次序更新参数
         */
        updateFunctionSindex: function (options) {
            var id = options.id;
            var pId = options.pId;
            var sIndex = options.sIndex;
            var targetIndex = options.targetIndex;
            var url = this.baseUrl + "/cpzx/manage/function/base/update/" + id + "/" + pId + "/" + sIndex + "/" + targetIndex;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },

        




        /**
       * 图层对照
       -----------------------------*/

        /**
        *获取一个业务的信息（一张图浏览版）
        *@method getOneBusinessFromOaMap
        *@param options {Object} 参数集
        */
        getOneBusinessFromOaMap: function (options) {
            var url = this.baseUrl + "/cpzx/manage/layerContrast/base/oa/" + options.id;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },

        /**
        *获取OA子系统列表
        *@method getBusinessSystemList
        *@param options {Object} 参数集
        */
        getBusinessSystemList: function (options) {
            var url = this.baseUrl + "/cpzx/manage/layerContrast/base/oa/business/subsys/list";
            this.ajax.post(url, options.data, options.async, options.context, options.success, options.error);
        },

        /**
        *获取OA子系统业务树
        *@method getBusinessSystemTree
        *@param options {Object} 参数集
        */
        getBusinessSystemTree: function (options) {
            var url = this.baseUrl + "/cpzx/manage/layerContrast/base/oa/business/subsys/tree";
            this.ajax.post(url, options.data, options.async, options.context, options.success, options.error);
        },


        /**
        *获取一个业务信息
        *@method getOneBusiness
        *@param options {Object} 参数集
        */
        getOneBusiness: function (options) {
            var url = this.baseUrl + "/cpzx/manage/layerContrast/base/" + options.id;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },

        /**
        *添加一个业务信息
        *@method addOneBusiness
        *@param options {Object} 参数集
        */
        addOneBusiness: function (options) {
            var url = this.baseUrl + "/cpzx/manage/layerContrast/base/add";
            this.ajax.put(url, options.data, options.async, options.context, options.success, options.error);
        },

        /**
        *更新一个业务信息
        *@method updateOneBusiness
        *@param options {Object} 参数集
        */
        updateOneBusiness: function (options) {
            var url = this.baseUrl + "/cpzx/manage/layerContrast/base/update";
            this.ajax.post(url, options.data, options.async, options.context, options.success, options.error);
        },

        /**
        *删除一个业务信息
        *@method deleteOneBusiness
        *@param options {Object} 参数集
        */
        deleteOneBusiness: function (options) {
            var id = options.id;
            var url = this.baseUrl + "/cpzx/manage/layerContrast/base/delete/" + id;
            this.ajax.Delete(url, null, options.async, options.context, options.success, options.error);
        },




        /**
       * 权限配置
       -----------------------------*/

        /**
        *获取一个角色的所有专题
        *@method getRoleFeature
        *@param options {Object} 参数集
        */
        getRoleFeature: function (options) {
            var url = this.baseUrl + "/cpzx/manage/role/feature/" + options.id;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
        /**
        *获取一个角色的所有功能
        *@method getRoleFucntion
        *@param options {Object} 参数集
        */
        getRoleFunction: function (options) {
            var url = this.baseUrl + "/cpzx/manage/role/function/" + options.id;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },

        /**
        *更新角色的专题权限
        *@method getRoleFucntion
        *@param options {Object} 参数集
        */
        updateRoleFeature: function (options) {
            var url = this.baseUrl + "/cpzx/manage/role/feature/update";
            this.ajax.post(url, options.data, options.async, options.context, options.success, options.error);
        },
        updateRoleFunction: function (options) {
            var url = this.baseUrl + "/cpzx/manage/role/function/update";
            this.ajax.post(url, options.data, options.async, options.context, options.success, options.error);
        },



        /**
       * 日志管理
       -----------------------------*/

        //获取分页登陆日志
        getPageLogging: function (options) {
            var showNum = options.showNum;
            var pageNum = options.pageNum;
            var url = this.baseUrl + "/cpzx/manage/log/page/login/" + showNum + "/" + pageNum ;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },

        //搜索登陆日志
        getPageLoggingBySearch: function (options) {
            var keyword = options.keyword;
            var showNum = options.showNum;
            var pageNum = options.pageNum;
            var url = this.baseUrl + "/cpzx/manage/log/page/loginBySearch/" + keyword + "/" + showNum + "/" + pageNum;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },


        //获取分页资源访问日志
        getPagVisitingLogging: function (options) {
            var showNum = options.showNum;
            var pageNum = options.pageNum;
            var url = this.baseUrl + "/cpzx/manage/log/page/visit/" + showNum + "/" + pageNum;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },

        //关键字搜索登陆日志
        getPagVisitingLoggingBySearch: function (options) {
            var keyword = options.keyword;
            var showNum = options.showNum;
            var pageNum = options.pageNum;
            var url = this.baseUrl + "/cpzx/manage/log/page/visitBySearch/" + keyword + "/" + showNum + "/" + pageNum;
            this.ajax.get(url, null, options.async, options.context, options.success, options.error);
        },
    });

    return L.DCI.Manage.BaseServices;
});