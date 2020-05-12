/**
*页码切换控件
*@module controls
*@class DCI.Controls.Paging
*@extends DCI.BaseObject
*@example
    var container = $('#div_paging')[0];
    var paging = new L.DCI.Controls.Paging({ total: 12, 
                                             count: 5, 
                                             present: 2, 
                                             pageChange: function(page){
                                                alert('显示第'+page+'页的数据');
                                             }});
    paging.addTo(container);
*/
define("controls/paging", [
    "leaflet",
    "core/dcins"
], function (L) {
    L.DCI.Controls.Paging = L.DCI.BaseObject.extend({
        /**
        *类标识
        *@property id
        *@type {String}
        */
        id: 'l.dci.controls.paging',
        /**
        *配置
        *@property options
        *@type {Object}
        */
        options: {
            total: 0,/*一共有多少页*/
            count: 5,/*显示多少个页码选择*/
            present: 1,/*当前是多少页*/
            pageChange: null/*页码发生变化时调用的方法*/
        },

        /**
        *初始化
        *@method initialize
        */
        initialize: function (options) {
            L.setOptions(this, options);
        },
        /**
        *将此控件添加到容器
        *@method addTo
        *@param parent {Object} 父容器
        */
        addTo: function (parent) {
            this._initUi();
            this._parentContainer = parent;
            this._parentContainer.appendChild(this._container);
        },
        /**
        *返回此控件的顶层HTML Dom
        *@method getBody
        *@return {Object} 返回控件的DOM标签
        */
        getBody: function () {
            this._initUi();
            return this._container;
        },
        /**
        *从容器中移除此控件
        *@method remove
        */
        remove: function () {
            if (this._parentContainer != null)
                this._container.remove();
        },
        /**
        *设置总页数
        *@method setTotal
        *@param total {Number} 页数
        */
        setTotal: function (total) {
            this.options.total = total;
            if (this._container != null)
                this._changePresentElement(this.options.present);
        },
        /**
        *设置显示的页码个数
        *@method setCount
        *@param count {Number} 个数
        */
        setCount: function (count) {
            this.options.count = count;
            if (this._container != null)
                this._changePresentElement(this.options.present);
        },
        /**
        *设置当前显示的是第几页
        *@method setPresent
        *@param present {Number} 页数
        */
        setPresent: function (present) {
            this.options.present = present;
            if (this._container != null)
                this._changePresentElement(this.options.present);
        },
        /**
        *获取总页数
        *@method setCount
        *@return {Number} 总的页数
        */
        getTotal: function () {
            return this.options.total;
        },
        /**
        *获取显示的页码个数
        *@method getCount
        *@return {Number} 个数
        */
        getCount: function () {
            return this.options.count;
        },
        /**
        *获取当前显示的是第几页
        *@method getPresent
        *@return {Number} 页数
        */
        getPresent: function () {
            return this.options.present;
        },
        /**
        *初始化界面
        *@method _initUi
        *@private
        */
        _initUi: function () {
            var container = this._container = $('<p class="paging container"></p>')[0];
            if (this.options.present > this.options.total)
                this.options.present = this.options.total;
            if (this.options.present < 1)
                this.options.present = 1;
            this._repaintUi(this.options.present);
        },
        /**
        *当页码超出当前显示范围时，重新绘制界面
        *@method _repaintUi
        *@param page {Number} 当前页码
        *@private
        */
        _repaintUi: function (page) {
            var html = '';
            var group = Math.ceil(parseFloat(page) / parseFloat(this.options.count));
            this._presentGroup = group;
            var start = (group - 1) * this.options.count + 1;
            var end = group * this.options.count;
            if (end > this.options.total) end = this.options.total;
            if (start < 1) start = 1;
            html = '<span class="paging button icon-previous-page"></span>';
           

            for (var i = start; i <= end; i++) {
                if (i == page) {
                    html = html + '<span class="paging number present">' + i + '</span>';
                } else {
                    html = html + '<span class="paging number">' + i + '</span>';
                }
            }
                html = html + '<span class="paging button icon-next-page"></span>';
          
            $(this._container).html(html);

            var numbs = $(this._container).find('.number');
            var previous = $(this._container).find('.icon-previous-page')[0];
            var next = $(this._container).find('.icon-next-page')[0];

            //if (page == 1)
            //    $(previous).addClass('hidden');
            //if (page == this.options.total)
            //    $(next).addClass('hidden');

            //if (page < this.options.total)
            //    html = html + '<span class="paging button icon-next-page"></span>';

            L.DomEvent.on(next, 'click', this._nextClick, this);
            L.DomEvent.on(previous, 'click', this._previousClick, this);
            if (numbs != null && numbs.length > 0)
                for (var t = 0; t < numbs.length; t++)
                    L.DomEvent.on(numbs[t], 'click', this._numClick, this);
        },
        /**
        *修改当前页码
        *@method _changePresentElement
        *@param page {Number} 当前页码
        *@private
        */
        _changePresentElement: function (page) {
            var group = Math.ceil(parseFloat(page) / parseFloat(this.options.count));
            this._repaintUi(page);
            var numbers = $(this._container).find('.paging.number');
            for (var i = 0; i < numbers.length; i++) {
                var num = numbers[i];
                if (num.innerHTML == this.options.present) {
                    if (!$(num).hasClass('.present'))
                        $(num).addClass('present');
                } else {
                    $(num).removeClass('present');
                }
            }
        },
        _callPageChange: function () {
            if (this.options.pageChange != null)
                this.options.pageChange(this.options.present);
        },
        /**
        *点击页码
        *@method _numClick
        *@param e {Object} 事件回调对象
        *@private
        */
        _numClick: function (e) {
            var page = parseInt(e.target.innerHTML);
            if (this.options.present != page) {
                this.options.present = page;
                this._changePresentElement(this.options.present);
                this._callPageChange();
            }
            e.stopPropagation();
        },
        /**
        *点击下一页
        *@method _nextClick
        *@param e {Object} 事件回调对象
        *@private
        */
        _nextClick: function (e) {
            if (this.options.present < this.options.total) {
                this.options.present = this.options.present + 1;
                this._changePresentElement(this.options.present);
                this._callPageChange();
            }
            e.stopPropagation();
        },
        /**
        *点击上一页
        *@method _previousClick
        *@param e {Object} 事件回调对象
        *@private
        */
        _previousClick: function (e) {
            if (this.options.present > 1) {
                this.options.present = this.options.present - 1;
                this._changePresentElement(this.options.present);
                this._callPageChange();
            }
            e.stopPropagation();
        }
    });
    return L.DCI.Controls.Paging;
});