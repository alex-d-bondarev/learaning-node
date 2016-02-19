/**
 * Created by Alex on 2/7/16.
 */
var express = require('express');
var fortune = require('./lib/fortune.js');
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

app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').urlencoded({ extended: true }));


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

app.post('/process', function(req, res){
    console.log('Form (from querystring): ' + req.query.form);
    console.log('CSRF token (from hidden form field): ' + req.body._csrf);
    console.log('Name (from visible form field): ' + req.body.name);
    console.log('Email (from visible form field): ' + req.body.email);
    res.redirect(303, '/thank-you');
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

