define("analysis/gpHandler", [
    "leaflet",
    "core/dcins",
    "analysis/geoprocessor"
], function (L) {
    L.DCI.GPHandler = L.Class.extend({
        initialize: function () {
        },
        GPHandler: function (url, params, outParameters, resultDataHandler, resultImageLayerHandler, errorHandler) {
            var map = L.dci.app.pool.get("map");
            var crs = map.options["crs"];       
            var code = crs.code.split(":")[1];
            //var code = map.map.options["crsNum"];
            var gp = new L.DCI.Geoprocessor(url);
            gp.outputSpatialReference = { wkid: parseInt(code), latest: parseInt(code) };
            gp.outSpatialReference = { wkid: parseInt(code), latest: parseInt(code) };
            gp.processSpatialReference = { wkid: parseInt(code), latest: parseInt(code) };
            var p = {
                gp: gp,
                outParameters: outParameters,
                resultDataHandler: resultDataHandler,
                resultImageLayerHandler: resultImageLayerHandler
            };
            gp.submitJob(params, this.statusUpdate, $.extend(this.jobResult, p), null, errorHandler);
        },
        statusUpdate: function () { },
        jobResult: function (jobInfo, gp, outPparameters, resultDataHandler, resultImageLayerHandler) {

            var map = L.dci.app.pool.get("map");
            $.each(outPparameters, function (i, outP) {
                //将结果以客户端图层加载
                if (gp.options.async == false) {
                    if (resultDataHandler && outP.type == "string") {
                        gp._getResultData(jobInfo, resultDataHandler);
                    } else if (resultImageLayerHandler && outP.type == "layer") {//将结果以服务形式加载                    
                        var extent = map.map.getBounds();//???
                        gp._getResultImageLayer(jobInfo.jobId, outP.name, extent, resultImageLayerHandler);
                    }
                } else {
                    if (resultDataHandler && outP.type == "string") {
                        gp.getResultData(jobInfo.jobId, outP.name, resultDataHandler);
                    } else if (resultImageLayerHandler && outP.type == "layer") {//将结果以服务形式加载                    
                        var extent = map.map.getBounds();
                        gp.getResultImageLayer(jobInfo.jobId, outP.name, extent, resultImageLayerHandler);
                    }
                }
            });
        }
    });

    return L.DCI.GPHandler;
});