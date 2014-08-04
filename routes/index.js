var BodyTrackDatastore = require('bodytrack-datastore');
var datastore = new BodyTrackDatastore({binDir : "./datastore/datastore", dataDir : "./datastore/db/dev.kvs"});

const DEFAULT_USER_ID = 1;

var createChannel = function(deviceName, name, specs) {

   // create the default style
   var style = { "styles" : [ ] };
   if (name == "Sleep_Graph") {
      style.styles.push({
                           "type" : "zeo",
                           "show" : true
                        });
   }
   else {
      style.styles.push({
                           "type" : "line",
                           "lineWidth" : 1,
                           "show" : true
                        });
   }

   // create the channel
   var channel = {
      "deviceName" : deviceName,
      "name" : name,
      "min" : specs.channel_bounds.min_value,
      "max" : specs.channel_bounds.max_value,
      "min_time" : specs.channel_bounds.min_time,
      "max_time" : specs.channel_bounds.max_time,
      "time_type" : "gmt",
      style : style,
      builtin_default_style : style
   };

   // set the channel type, if defined
   if (typeof specs.channelType !== 'undefined' && specs.channelType != null) {
      channel['type'] = specs.channelType;
   }

   if (typeof specs.objectTypeName !== 'undefined' && specs.objectTypeName != null) {
      channel['objectTypeName'] = specs.objectTypeName;
   }

   // time_type defaults to gmt.  It can be overridden to "local" for channels that only know local time
   if (typeof specs.time_type !== 'undefined' && specs.time_type != null) {
      channel['time_type'] = specs.time_type;
   }

   return channel;
};

function createSources(infoResponse) {
   var sourcesMap = {};

   for (var fullName in infoResponse.channel_specs) {
      var specs = infoResponse.channel_specs[fullName];
      var split = fullName.split(".");
      // device.objectTypeName._comment should not generate an entry
      if (split.length > 2) {
         continue;
      }
      var deviceName = split[0];
      var objectTypeName = split[1];

      // make sure this device exists in the sourcesMap
      if (typeof sourcesMap[deviceName] === 'undefined') {
         sourcesMap[deviceName] = { "name" : deviceName, "channels" : []};
      }

      sourcesMap[deviceName].channels.push(createChannel(deviceName, objectTypeName, specs));
   }

   // convert the sourcesMap to an array
   var sources = [];
   for (var sourceName in sourcesMap) {
      sources.push(sourcesMap[sourceName]);
   }
   return sources;
}

var createUploadResponse = function(wasSuccessful, payload) {
   var response = {
      "result" : (!!wasSuccessful) ? "OK" : "KO",
      "message" : (!!wasSuccessful) ? "Upload successful!" : "Upload failed"
   };
   if (typeof payload !== 'undefined' && payload != null) {
      response['payload'] = payload;
   }

   if (!wasSuccessful) {
      console.log("bodytrack-datastore.importJson: upload failed: " + JSON.stringify(payload));
   }

   return response;
};

exports.index = function(req, res) {
   // Use the default user ID unless a different (valid) one is specified in the URL.
   var userId = DEFAULT_USER_ID;
   if (typeof req.params.uid !== 'undefined') {
      var userIdAsInt = parseInt(req.params.uid, 10);
      if (!isNaN(userIdAsInt) && userIdAsInt >= 0) {
         userId = userIdAsInt;
      }
   }

   console.log("userId: " + userId);

   datastore.getInfo(userId,
                     function(err, infoResponse) {

                        console.log("INFO RESPONSE: " + JSON.stringify(infoResponse, null, 3));
                        var sources = createSources(infoResponse);

                        var selectedDevice = '';
                        var selectedChannel = '';

                        // if the device and channel are specified in the URL, validate them
                        // against the sources
                        var areDeviceAndChannelValid = true;
                        var channel = null;
                        if (typeof req.params.deviceNickname !== 'undefined' &&
                            typeof req.params.channelName !== 'undefined') {

                           areDeviceAndChannelValid = false;

                           for (var i = 0; i < sources.length; i++) {
                              if (sources[i]['name'] == req.params.deviceNickname) {
                                 // we found the device, so try to find the channel
                                 var channels = sources[i]['channels'];
                                 for (var j = 0; j < channels.length; j++) {
                                    if (channels[j]['name'] == req.params.channelName) {
                                       selectedDevice = req.params.deviceNickname;
                                       selectedChannel = req.params.channelName;
                                       console.log("valid device and channel!");
                                       areDeviceAndChannelValid = true;
                                       channel = channels[j];
                                       break;
                                    }
                                 }

                                 break;
                              }
                           }

                        }

                        if (areDeviceAndChannelValid) {
                           res.render('index',
                                      {
                                         title : 'Simple Datastore Server',
                                         devices : sources,
                                         channelJson : JSON.stringify(channel),
                                         userId : userId,
                                         selectedDevice : selectedDevice,
                                         selectedChannel : selectedChannel,
                                         isDeviceAndChannelSelected : selectedDevice != '' && selectedChannel != '',
                                         isDatastoreEmpty : sources.length == 0
                                      });
                        }
                        else {
                           console.log("Invalid device and/or channel, redirecting...");
                           res.redirect("/");
                        }
                     });
};

exports.multigrapher = function(req, res) {
   // Use the default user ID unless a different (valid) one is specified in the URL.
   var userId = DEFAULT_USER_ID;
   if (typeof req.params.uid !== 'undefined') {
      var userIdAsInt = parseInt(req.params.uid, 10);
      if (!isNaN(userIdAsInt) && userIdAsInt >= 0) {
         userId = userIdAsInt;
      }
   }

   // split and trim
   var requestedDevicesAndChannels = req.params.devicesAndChannels.split(",").map(function(item) {
      return item.trim()
   });

   datastore.getInfo(userId,
                     function(err, infoResponse) {

                        var sources = createSources(infoResponse);
                        //console.log("SOURCES: " + JSON.stringify(sources, null, 3));

                        // first validate each of the requested devices/channels, and remove any dupes by storing them in a set.
                        // We'll also get the channel specs from the sources retrieved above
                        var devicesAndChannels = {};
                        var count = 0;
                        requestedDevicesAndChannels.forEach(function(deviceAndChannel) {
                           if (infoResponse['channel_specs'].hasOwnProperty(deviceAndChannel)) {
                              if (typeof devicesAndChannels[deviceAndChannel] === 'undefined') {
                                 var deviceAndChannelSplit = deviceAndChannel.split('.').map(function(item) {
                                    return item.trim()
                                 });
                                 if (deviceAndChannelSplit.length >= 2) {
                                    var deviceName = deviceAndChannelSplit[0];
                                    var channelName = deviceAndChannelSplit[1];

                                    for (var i = 0; i < sources.length; i++) {
                                       if (sources[i]['name'] == deviceName) {
                                          // we found the device, so try to find the channel
                                          var channels = sources[i]['channels'];
                                          for (var j = 0; j < channels.length; j++) {
                                             if (channels[j]['name'] == channelName) {
                                                devicesAndChannels[deviceAndChannel] = channels[j];
                                                count++;
                                                break;
                                             }
                                          }
                                          break;
                                       }
                                    }
                                 }
                              }

                           }
                        });

                        console.log("devicesAndChannels = " + JSON.stringify(devicesAndChannels, null, 3));

                        res.render('multigrapher',
                                   {
                                      title : 'Simple Datastore Server',
                                      devices : sources,
                                      userId : userId,
                                      devicesAndChannels : JSON.stringify(devicesAndChannels),
                                      isSomethingSelected : count > 0,
                                      isDatastoreEmpty : sources.length == 0
                                   });
                     });
};

exports.listSources = function(req, res) {
   datastore.getInfo(req.params.uid,
                     function(err, infoResponse) {
                        if (err) {
                           // TODO: do something better
                           console.log("Error returned from datastore.getInfo(): " + err);
                           res.jsonp({});
                        }
                        else {
                           res.jsonp(createSources(infoResponse));
                        }
                     });
};

exports.getTile = function(req, res) {
   datastore.getTile(req.params.uid,
                     req.params.deviceNickname,
                     req.params.channelName,
                     req.params.level,
                     req.params.offset,
                     function(err, tile) {

                        if (err || typeof tile['data'] === 'undefined') {
                           // respond with an empty tile
                           tile = {"data" : [], "fields" : ["time", "mean", "stddev", "count"], "level" : req.params.level, "offset" : req.params.offset, "sample_width" : 0};
                        }

                        // Must set the type since the grapher won't render anything if the type is not set
                        tile['type'] = "value";

                        res.jsonp(tile);
                     });
};

exports.uploadJson = function(req, res) {
   datastore.importJson(DEFAULT_USER_ID,   // for now, just always use the default user ID
                        req.query.dev_nickname,
                        req.body,
                        function(err, response) {
                           var uploadResponse = null;
                           if (err) {
                              uploadResponse = createUploadResponse(false, {
                                 error : err,
                                 reason : err.message
                              });
                           }
                           else {
                              uploadResponse = createUploadResponse(true, response);
                           }
                           res.type('application/json');
                           res.send(JSON.stringify(uploadResponse));
                        }
   );
};