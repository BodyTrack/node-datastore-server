var express = require('express');
var routes = require('./routes/index');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'hjs');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.compress());        // enables gzip compression
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.set("jsonp callback", true);
app.set('json spaces', 0);           // setting this to 0 removes whitespace from json

// development only
if ('development' == app.get('env')) {
   app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/grapher/:uid', routes.index);
app.get('/grapher/:uid/:deviceNickname/:channelName', routes.index);
app.get('/users/:uid/sources/list', routes.listSources);
app.get('/tiles/:uid/:deviceNickname.:channelName/:level.:offset.json', routes.getTile);
app.post('/api/bodytrack/jupload', routes.uploadJson);
app.post('/upload', routes.uploadJson);

http.createServer(app).listen(app.get('port'), function() {
   console.log('Express server listening on port ' + app.get('port'));
});
