/*
类名：资源模块布局类
*/
define("manage/layout/resourcepanel", ["leaflet"], function (L) {

    L.DCI.ResourcePanelLayout = L.Class.extend({

        initialize: function () {

        },

        //总布局
        getBodyHtml: function () {
            var html = '<div class="registerResource">'
                        + '<div class="registerResource_search">'
                            + '<div>'
                                + '<input type="text" class="form-control" placeholder="请输入服务名称"><span class="icon-search-icon search"></span>'
                                + '<div class="showNumDropmenu">'
                                    + '<span>每页显示数目：</span>'
                                    + '<select type="text">'
                                        + '<option>5</option>'
                                        + '<option selected>10</option>'
                                        + '<option>15</option>'
                                        + '<option>20</option>'
                                        + '<option>25</option>'
                                        + '<option>30</option>'
                                    + '</select>'
                                + '</div>'
                            + '</div>'
                        + '</div>'
                        + '<div class="registerResource_content"><div></div></div>'
                        + '<div class="registerResource_add">'
                            + '<p><span class="icon-zoom-in"></span>添加服务资源</p>'
                        + '</div>'
                        + '<div class="registerResource_paging"></div>'
                     + '</div>';
            return html;
        },

        //服务注册
        addResourceHtml: function () {
            var html = '<div class="addResource">'
                            + '<form class="form-horizontal">'
                            + '<div>'
                                + '<span class="star">*</span>'
                                + '<label class="control-label">名称:</label>'
                                + '<input class="txtName" type="text" placeholder="服务名称长度小于等于10">'
                            + '</div>'
                            + '<div class=""dropdown">'
                                + '<span class="star">*</span>'
                                + '<label class="control-label">类型:</label>'
                                + '<input class="txtType" type="text" id="addResourcedropdownMenuText" data-toggle="dropdown" data-info="1" value="矢量图层" readonly="readonly"><span class="caret"></span></input>'
                                + '<ul class="dropdown-menu addResourcedropdownMenu" role="menu" aria-labelledby="dropdownMenu">'
                                    + '<li role="presentation"><a role="menuitem" tabindex="-1" href="#">矢量图层</a></li>'
                                    + '<li role="presentation"><a role="menuitem" tabindex="-1" href="#">切片图层</a></li>'
                                    + '<li role="presentation"><a role="menuitem" tabindex="-1" href="#">WMS图层</a></li>'
                                    + '<li role="presentation"><a role="menuitem" tabindex="-1" href="#">WMTS图层</a></li>'
                                    + '<li role="presentation"><a role="menuitem" tabindex="-1" href="#">注记图层</a></li>'
                                + '</ul>'
                            + '</div>'
                            + '<div>'
                                + '<span class="star">*</span>'
                                + '<label class="control-label">地址:</label>'
                                + '<input class="txtURL" type="text" placeholder="请输入服务地址">'
                           + '</div>'
                           + '</form>'
                           + '<div class="tip"><span class="errorText"></span></div>'
                           + '<div><button type="button" class="btn cancelResouce">取消</button><button type="button" class="btn saveResource">保存</button></div>'
                     + '</div>';
            return html;
        },

        //资源列表布局
        resourceHtml: function (id, name, type, key, url, metadata, locked) {
            var resourceType = '';
            switch (type)
            {
                case 1: resourceType = "矢量图层"; break;
                case 2: resourceType = "切片图层"; break;
                case 3: resourceType = "WMS图层"; break;
                case 4: resourceType = "WMTS图层"; break;
                case 5: resourceType = "注记图层"; break;
                default: break;
            }

            var lockedClass = '';
            if (locked == 1)
            {
                lockedClass = 'icon-hide';
            }
            else
            {
                lockedClass = 'icon-show';
            }

            var html = '<div class="resourceContent" data-info="' + id + '">'
                            + '<span class="reslock ' + lockedClass + '" lock="' + locked + '"></span>'
                            + '<div class="resourceImage"><img src="./themes/default/images/feature/u15.png" alt=""></div>'
                            + '<div class="resourceAttribute">'
                                + '<p><span class="attributeName">名称:</span><span class="attriuteValue">' + name + '</span></p>'
                                + '<p><span class="attributeName">类型:</span><span class="attriuteValue">' + resourceType + '</span></p>'
                                + '<p><span class="attributeName">地址:</span><span class="attriuteValue">' + url + '</span></p>'
                            + '</div>'
                            + '<span class="icon-clear resourceDelete" data-name="' + name + '" title="删除"></span>'
                            + '<span class="icon-revamped resourceEdit" title="修改"></span>'
                            + '<span class="resourceDetail ">详情</span>'
                     + '</div>';

            return html;
        },

        //删除服务
        deleteResourceHtml: function () {
            var html = '<div class="deleteResource">'
                           + '<div><p></p></div>'
                           + '<div><button type="button" class="btn cancelDeleteResource">取消</button><button type="button" class="btn submitDeleteResource">确定</button></div>'
                     + '</div>';
            return html;
        },

    });
    return L.DCI.ResourcePanelLayout;
});