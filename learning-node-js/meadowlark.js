/**
 * Created by Alex on 2/7/16.
 */
var credentials = require('./credentials.js');
var express = require('express');
var formidable = require('formidable');
var fortune = require('./lib/fortune.js');
var jqupload = require('jquery-file-upload-middleware');
var weather = require('./lib/weather.js');
var handlebars = require('express-handlebars').create({
    defaultLayout:'main',
    helpers: {
        section: function(name,optioins){
            if(!this._sections) this._sections={};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});

var app = express();
app.disable('x-powered-by');

app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
}));
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use('/upload', function(req, res, next){
    var now = Date.now();
    jqupload.fileHandler({
        uploadDir: function(){
            return __dirname + '/public/uploads/' + now;
        },
        uploadUrl: function(){
            return '/uploads/' + now;
        },
    })(req, res, next);
});
app.use(function(req, res, next){
    // if there's a flash message, transfer
    // it to the context, then clear it
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

// set handlebars view engine
var handlebars = require('express-handlebars').create({
      defaultLayout: 'main'
    , helpers: {
        section: function(name, options) {
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});

app.engine('.handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);


// tests
app.use(function(req,res,next){
    res.locals.showTests = app.get('env') !== 'production' &&
            req.query.test ==='1';
    next();
});


// add weather widget
app.use(function(req,res,next){
    if(!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weatherContext = weather.getWeatherData();
    next();
});
// Home page
app.get('/', function(req,res){
    res.render('home');
});
app.get('/about', function(req,res){
    res.render('about', {
        fortune: fortune.getFortune()
        , pageTestScript: '/qa/tests-about.js'
    });
});
app.get('/tours/hood-river', function(req,res){
    res.render('tours/hood-river');
});
app.get('/tours/oregon-coast', function(req,res){
    res.render('tours/oregon-coast');
});
app.get('/tours/request-group-rate', function(req,res){
    res.render('tours/request-group-rate');
});
app.get('/headers', function(req,res){
    res.set('Content-Type', 'text/plain');
    var s = '';
    for (var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
    res.send(s);
});
app.get('/jquery-test', function(req, res){
    res.render('jquery-test');
});
app.get('/thank-you', function(req, res){
    res.render('thank-you');
});
app.get('/nursery-rhyme', function(req, res){
    res.render('nursery-rhyme');
});
app.get('/data/nursery-rhyme', function(req, res){
    res.json({
        animal: 'squirrel',
        bodyPart: 'tail',
        adjective: 'bushy',
        noun: 'heck',
    });
});
app.get('/newsletter', function(req, res){
    // we will learn about CSRF later...for now, we just
    // provide a dummy value
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});
app.get('/contest/vacation-photo',function(req,res){
    var now = new Date();
    res.render('contest/vacation-photo',{
        year: now.getFullYear(),month: now.getMonth()
    });
});


app.post('/contest/vacation-photo/:year/:month', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
        if(err) return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});
app.post('/process', function(req, res){
    if(req.xhr || req.accepts('json,html')==='json'){
        // if there were an error, we would send { error: 'error description' }
        res.send({ success: true });
    } else {
        // if there were an error, we would redirect to an error page
        res.redirect(303, '/thank-you');
    }
});


// custom 404 page
app.use(function(req,res){
    res.status(404);
    res.render('404');
});


// custom 500 page
app.use(function(err,req,res,next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' +
                app.get('port') + '; press Ctrl-C to terminate.');
});

