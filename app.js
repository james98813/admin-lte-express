var express      = require('express');
var exphbs       = require('express-handlebars');
var session      = require('express-session');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var Router       = require('named-routes');
var Autoloader   = require('./lib/autoloader');
var Auth         = require('./lib/auth').Auth;
var Errors       = require('./lib/errors');

// Main App
var app = express();
// Config named routes
var router = new Router();
router.extendExpress(app);
router.registerAppHelpers(app);
// Config session
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'A77as7diubhaisdgibkn!'
}));
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/admin', express.static(path.join(__dirname, 'public')));

// Active URL
var activeUrl = '';
app.use(function(request, response, next) {
  var route = router.match(request)
  if (route) {
    activeUrl = route.route.options.name
  }
  next()
});

// MVC Autoloader
Autoloader(app, {verbose: !module.parent});
// Auth load
Auth.load(app, {verbose: !module.parent})
// Config Handlebars
var blocks = {};
var Handlebars = exphbs.create({
  defaultLayout: 'main',
  helpers      : {
    url: function(routeName, params) {
      return app.locals.url(routeName, params);
    },
    activeRoute: function(routeName) {
      return routeName === activeUrl ? 'active' : '';
    },
    activeRoutes: function(routeNames) {
      // TODO
      return routeNames.split(',').indexOf(activeUrl) >= 0 ? 'active' : '';
    },
    block: function(name) {
      var val = (blocks[name] || []).join('\n');

      // clear the block
      blocks[name] = [];
      return val;
    },
    extend: function(name, context) {
      var block = blocks[name];
      if (!block) {
          block = blocks[name] = [];
      }

      block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
    }
  }
});
// View engine setup
app.engine('handlebars', Handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
// uncomment after placing your favicon in /public

// Errors load
Errors(app);

module.exports = app;
