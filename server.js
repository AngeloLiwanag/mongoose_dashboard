var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var flash = require('express-flash');
var path = require('path');
var session = require('express-session');

app.use(session({
    secret:"secretkey",
    resave:false,
    saveUninitalized: true,
    cookie:{maxAge: 60000}
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, './static')));
app.use(flash());

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/dashboard');
mongoose.Promise = global.Promise;

var DataSchema = new mongoose.Schema({
    name: {type: String, required: true},
    age: {type: Number, required: true},
    type: {type: String, required: true}
});

mongoose.model('Data', DataSchema);
var Data = mongoose.model('Data');

// localhost:8000 --- Index Page
app.get('/', function(req, res){
    Data.find({}, function(err, data){
        if(err){
            console.log('something went wrong');
        }
        res.render('index', {data:data})
    });
});

// Index Page --- Delete
app.post('/delete/:id', function(req, res){
    Data.remove({_id: req.params.id}, function(err,data){
        if(err){
            console.log('something went wrong', err);
            for (var key in err.errors){
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/new');
        } else {
            console.log('successfully deleted data!')
            res.redirect('/')
        }       
    });
});

// localhost:8000/corgi/:id --- Info Page
app.get('/corgi/:id', function(req, res){
    Data.find({_id: req.params.id}, function(err,data){
        console.log('The Corgi id is: ', req.params.id);
        res.render('info', {data:data});
    });
});

// localhost:8000/corgi/new --- Add New Corgi
app.get('/new', function(req, res){
    res.render('new')
});

app.post('/add_new', function(req, res){
    var data = new Data({name: req.body.name, age: req.body.age, type: req.body.type});
    data.save(function(err){
        if(err){
            console.log('something went wrong', err);
            for (var key in err.errors){
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/new');
        } else {
            console.log('successfully added data!')
            res.redirect('/')
        }
    });
});

// localhost:8000/edit --- Edit Page
app.get('/edit/:id', function(req, res){
    Data.find({_id: req.params.id}, function(err,data){
        res.render('edit', {data:data});
    });
});

// Edit Page --- Edit Corgi
app.post('/edit_corgi/:id', function(req, res){
    Data.update({_id:req.params.id}, {$set:{name: req.body.name, age: req.body.age, type: req.body.type}}, function(err){
        if(err){
            console.log('something went wrong', err);
            for (var key in err.errors){
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/edit/:' + req.params.id);
        } else {
            console.log('successfully updated added data!')
            res.redirect('/')
        }
    });
});

app.listen(8000, function(){
    console.log('listening on port 8000');
});