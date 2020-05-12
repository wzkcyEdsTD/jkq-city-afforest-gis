/**
*读取XML类
*@module util
*@class DCI.GetXml
*@constructor initialize
*/
define("util/getxml", [
    "leaflet"
], function (L) {
    L.DCI.GetXml = L.Class.extend({
        /**
        *类ID
        *@property id
        *@type {String}
        */
        id: 'GetXml',
        /**
        *xmlUrl
        *@type {string}
        */
        xmlUrl: '',
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {

        },
        getXml: function (url) {
            



            //var data = this.xmlObject(url);
            var data;
            $.ajax({
                type: "get",
                url: url,
                async: false,
                success: function (xml) {
                    data = xml;
                }
            });

            
            //<landclass>
            //    <bigclass name='居住用地' mark='R'>
            //            <midclass name='一类居住用地' mark='R1'>
            //                <smallclass name='住宅用地' mark='R11'></smallclass>
            //                <smallclass name='服务设施用地' mark='R12'></smallclass>
            //            </midclass>
            //            <midclass name='二类居住用地' mark='R2'>
            //                <smallclass name='住宅用地' mark='R21'></smallclass>
            //                <smallclass name='服务设施用地' mark='R22'></smallclass>
            //            </midclass>
            //            <midclass name='三类居住用地' mark='R3'>
            //                <smallclass name='住宅用地' mark='R31'></smallclass>
            //                <smallclass name='服务设施用地' mark='R32'></smallclass>
            //            </midclass>
            //            <midclass name='商住混合用地' mark='R5'>
            //            </midclass>
            //    </bigclass>
            //……
            var xmlData = [];
            //<landclass>
            for (var itemA = 0; itemA < data.children.length; itemA++) {
                var itemA_obj = data.children[itemA];
                //<bigclass name='' mark=''>
                for (var itemB = 0; itemB < itemA_obj.children.length; itemB++) {
                    var itemB_obj = itemA_obj.children[itemB];
                    if (itemB_obj.attributes.length != 0) {
                        xmlData[itemB] = new Object();
                        for (var i = 0; i < itemB_obj.attributes.length; i++) {
                            var name = itemB_obj.attributes[i].name;
                            var value = itemB_obj.attributes[i].value;
                            xmlData[itemB][name] = value;
                        }
                        xmlData[itemB].items = [];
                        //<midclass name='' mark=''>
                        for (var itemC = 0; itemC < itemB_obj.children.length; itemC++) {
                            var itemC_obj = itemB_obj.children[itemC];
                            if (itemC_obj.attributes.length != 0) {
                                xmlData[itemB].items[itemC] = new Object();
                                for (var i = 0; i < itemC_obj.attributes.length; i++) {
                                    var name = itemC_obj.attributes[i].name;
                                    var value = itemC_obj.attributes[i].value;
                                    xmlData[itemB].items[itemC][name] = value;
                                }
                                xmlData[itemB].items[itemC].items = [];
                                //<smallclass name='' mark=''>
                                for (var itemD = 0; itemD < itemC_obj.children.length; itemD++) {
                                    var itemD_obj = itemC_obj.children[itemD];
                                    if (itemD_obj.attributes.length != 0) {
                                        xmlData[itemB].items[itemC].items[itemD] = new Object();
                                        for (var i = 0; i < itemD_obj.attributes.length; i++) {
                                            var name = itemD_obj.attributes[i].name;
                                            var value = itemD_obj.attributes[i].value;
                                            xmlData[itemB].items[itemC].items[itemD][name] = value;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            var vueData = [];

            for (var ii = 0; ii < xmlData.length; ii++) {
                var arr = {};
                arr.level = 1;
                arr.mark = xmlData[ii].mark;
                arr.name = xmlData[ii].name;
                vueData.push(arr);
                if (xmlData[ii].items.length != 0) {
                    var xml2 = xmlData[ii].items
                    for (var jj = 0; jj < xml2.length; jj++) {
                        var arr2 = {};
                        arr2.level = 2;
                        arr2.mark = xml2[jj].mark;
                        arr2.name = xml2[jj].name;
                        arr2.parentmark = xmlData[ii].mark;
                        vueData.push(arr2);
                        if (xml2[jj].items.length != 0) {
                            var xml3 = xml2[jj].items
                            for (var kk = 0; kk < xml3.length; kk++) {
                                var arr3 = {};
                                arr3.level = 3;
                                arr3.mark = xml3[kk].mark;
                                arr3.name = xml3[kk].name;
                                arr3.parentmark = xml2[jj].mark;
                                vueData.push(arr3);
                            }
                        }
                    }
                }
            };
            return vueData;
        },

        abc: function () {
            function XmlToJson() {
            }
            XmlToJson.prototype.setXml = function (xml) {
                if (xml && typeof xml == "string") {
                    this.xml = document.createElement("div");
                    this.xml.innerHTML = xml;
                    this.xml = this.xml.getElementsByTagName("*")[0];
                }
                else if (typeof xml == "object") {
                    this.xml = xml;
                }
            };
            XmlToJson.prototype.getXml = function () {
                return this.xml;
            };
            XmlToJson.prototype.parse = function (xml) {
                this.setXml(xml);
                return this.convert(this.xml);
            };
            XmlToJson.prototype.convert = function (xml) {
                if (xml.nodeType != 1) {
                    return null;
                }
                var obj = {};
                obj.xtype = xml.nodeName.toLowerCase();
                var nodeValue = (xml.textContent || "").replace(/(\r|\n)/g, "").replace(/^\s+|\s+$/g, "");

                if (nodeValue && xml.childNodes.length == 1) {
                    obj.text = nodeValue;
                }
                if (xml.attributes.length > 0) {
                    for (var j = 0; j < xml.attributes.length; j++) {
                        var attribute = xml.attributes.item(j);
                        obj[attribute.nodeName] = attribute.nodeValue;
                    }
                }
                if (xml.childNodes.length > 0) {
                    var items = [];
                    for (var i = 0; i < xml.childNodes.length; i++) {
                        var node = xml.childNodes.item(i);
                        var item = this.convert(node);
                        if (item) {
                            items.push(item);
                        }
                    }
                    if (items.length > 0) {
                        obj.items = items;
                    }
                }
                return obj;
            };
        }


    });
    return L.DCI.GetXml;
});