/**
*用户类
*@module util
*@class DCI.User
*@constructor initialize
*/
define("util/user", [
    "leaflet",
    "core/dcins",
    "plugins/cookie"
], function(L) {
    L.DCI.User = L.Class.extend({
        /**
        *用户id
        *@property _userId
        *@type {String}
        *@private
        */
        _userId: "",
        _token: "",
        /**
        *用户名称
        *@property _userName
        *@type {String}
        *@private
        */
        _userName: "",
        /**
        *显示名称
        *@property _displayName
        *@type {String}
        *@private
        */
        _displayName: "",
        /**
        *简称
        *@property _shortName
        *@type {String}
        *@private
        */
        _shortName: "",
        /**
        *昵称
        *@property _nickName
        *@type {String}
        *@private
        */
        _nickName: "",
        /**
        *用户类型名称
        *@property _userTypeName
        *@type {String}
        *@private
        */
        _userTypeName: "",
        /**
        *用户类型描述
        *@property _userTypeDesctription
        *@type {String}
        *@private
        */
        _userTypeDesctription: "",
        /**
        *用户头像
        *@property _userImages
        *@type {String}
        *@private
        */
        _userImages: "",

        /**
        *与OA关联ID
        *@property _extraId
        *@type {String}
        *@private
        */
        _extraId: "",
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this._userId = "";
            this._userName = "";
            this._token = "";
            this._displayName = "";
            this._shortName = "";
            this._nickName = "";
            this._userTypeName = "";
            this._userTypeDesctription = "";
            this._userImages = "";
            this._extraId = "";
            this.readUserData();
        },
        /**
        *读取用户信息数据
        *@method readUserData
        */
        readUserData: function () {
            var cookieData = $.cookie('userdata');
            if (cookieData == null || cookieData == "")
                return;
            var userdata = $.parseJSON($.cookie('userdata'));
            this._userId = userdata.userId;
            this._userName = userdata.userName;
            this._token = userdata.password;
            this._displayName = userdata.displayName;
            this._shortName = userdata.shortName;
            this._nickName = userdata.nickName;
            this._userTypeName = userdata.userTypeName;
            this._userTypeDesctription = userdata.userTypeDescription;
            this._userImages = userdata.userImages;
            this._extraId = userdata.extraid;
        },
        /**
        *获取当前登录用户
        *@method getCurUser
        *@return {Object} 返回当前用户对象
        */
        getCurUser: function () {
            var user = {
                id: this._userId,
                name: this._userName,
                displayname: this._displayName,
                pass: ''
            }
            return user;
        },

        /**
        *获取当前用户的token
        *@method getToken
        *@return {string} 返回当前用户的token
        */
        getToken: function() {
            return this._token;
        },
        /**
        *获取当前登录用户ID
        *@method getCurUserId
        *@return {String} 返回当前用户ID
        */
        getCurUserId: function () {
            return this._userId;
        },
        /**
        *获取当前登录用户名称
        *@method getCurUserName
        *@return {String} 返回当前用户名称
        */
        getCurUserName: function () {
            return this._userName;
        },
        /**
        *获取当前登录用户显示名称
        *@method getCurUserDisplayName
        *@return {String} 返回当前用户显示名称
        */
        getCurUserDisplayName: function () {
            return this._displayName;
        }

    });

    return L.DCI.User;
});