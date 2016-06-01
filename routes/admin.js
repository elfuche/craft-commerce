var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');

var dbc = mongojs('mongodb://elfuche:Travail#2016@ds011903.mlab.com:11903/productlist',['commandes']);
var dbu = mongojs('mongodb://elfuche:Travail#2016@ds011903.mlab.com:11903/productlist',['users']);
var db = mongojs('mongodb://elfuche:Travail#2016@ds011903.mlab.com:11903/productlist',['productlist']);
var dbm = mongojs('mongodb://elfuche:Travail#2016@ds011903.mlab.com:11903/productlist',['materiel']);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin',{layout:'other'});
});

router.get('/commandes', function(req, res){
dbc.commandes.find(function(err, docs){
    if(err){console.log("erreur commandes");}
     res.render('commandes',{layout:'other', commandes:docs});
});
});

router.get('/utilisateurs', function(req, res){
    dbu.users.find(function(err, docs){
        if(err){console.log("erreur users");}
         res.render('utilisateurs',{layout:'other', users:docs});
    });
   
});

router.get('/produits', function(req, res){
  db.productlist.find(function(err, docs){
    if(err){console.log("erreur produits");}
    res.render('produits',{layout:'other', produits:docs});
});
});  

router.get('/reservations', function(req, res){
    dbm.materiel.find(function(err, docs){
    if(err){console.log("erreur produits");}
    res.render('booking',{layout:'other', res:docs});
});
});


module.exports = router;
