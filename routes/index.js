var datastore = require('bodytrack-datastore');

exports.index = function(req, res) {
   // Use the default user ID unless a different (valid) one is specified in the URL.
   var userId = datastore.DEFAULT_USER_ID;
   if (typeof req.params.uid !== 'undefined') {
      var userIdAsInt = parseInt(req.params.uid,10);
      if (!isNaN(userIdAsInt) && userIdAsInt >= 0) {
         userId = userIdAsInt;
      }
   }

   datastore.listSources(userId,
                         function(sources) {

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