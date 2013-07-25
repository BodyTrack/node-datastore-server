function loadJson(url, successCallback, failureCallback, completeCallback, willCache) {
   willCache = (typeof willCache === 'undefined') ? true : willCache;

   var handleFailure = function(jqXHR, textStatus, errorThrown) {
      console.log("loadJson.handleFailure(): FAILURE! errorThrown:" + errorThrown);
      try {
         if (typeof failureCallback === 'function') {
            failureCallback(errorThrown);
         }
      }
      catch (ex) {
         console.log("loadJson.handleFailure(): FAILURE! ex:" + ex);
      }
   };
   $.ajax(
         {
            cache : willCache,
            url : url,
            success : function(data, textStatus, jqXHR) {
               try {
                  if (typeof successCallback === 'function') {
                     // send the JSON as a String...
                     successCallback(typeof data === 'string' ? data : JSON.stringify(data));
                  }
               }
               catch (ex) {
                  handleFailure(jqXHR, "JSON parse error", ex);
               }
            },
            error : handleFailure,
            complete : function(jqXHR, textStatus) {
               try {
                  if (typeof completeCallback === 'function') {
                     completeCallback(jqXHR, textStatus);
                  }
               }
               catch (ex) {
                  console.log("loadJson(): Failed to call the completeCallback:" + ex);
               }
            }
         }
   );
}

function channelDatasource(userId, deviceName, channelName) {
   var urlPrefix = "/tiles/" + userId + "/" + deviceName + "." + channelName + "/";

   return function(level, offset, successCallback, failureCallback) {
      var url = urlPrefix + level + "." + offset + ".json";
      //console.log("channelDatasource(" + url + ")");
      loadJson(url, successCallback, failureCallback, null, true);
   }
}

function createPlot(userId, deviceName, dateAxis, yAxis, channel) {
   return new DataSeriesPlot(channelDatasource(userId, deviceName, channel['name']),
                             dateAxis,
                             yAxis,
                             {"style" : channel["style"], "localDisplay" : channel["time_type"] == "local"});
}

function createYAxis(channel, yAxisElementId) {
   var yMin = channel.min;
   var yMax = channel.max;
   var yDiff = yMax - yMin;
   var padding = 0.5;
   if (yDiff < 1e-10) {
      padding = 0.5;
   }
   else {
      padding = 0.1 * yDiff;
   }

   return new NumberAxis(yAxisElementId,
                         "vertical",
                         {
                            "min" : yMin - padding,
                            "max" : yMax + padding
                         });
}
