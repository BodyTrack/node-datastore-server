var datastore = require('bodytrack-datastore');

exports.index = function(req, res) {
   datastore.listSources(datastore.DEFAULT_USER_ID,   // for now, just always use the default user ID
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