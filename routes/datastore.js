var datastore = require('bodytrack-datastore');

exports.listSources = function(req, res) {
   datastore.listSources(req.params.uid,
                     function(sources) {
                        res.jsonp(sources);
                     });
};

exports.getTile = function(req, res) {
   datastore.getTile(req.params.uid,
                     req.params.deviceNickname,
                     req.params.channelName,
                     req.params.level,
                     req.params.offset,
                     function(tile) {
                        res.jsonp(tile);
                     });
};

exports.uploadJson = function(req, res) {
   datastore.importJson(datastore.DEFAULT_USER_ID,   // for now, just always use the default user ID
                        req.query.dev_nickname,
                        req.body,
                        function(response) {
                           res.type('application/json');
                           res.send(JSON.stringify(response));
                        }
   );
};