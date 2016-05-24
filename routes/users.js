var express = require('express');
var router = express.Router();
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongojs = require('mongojs');
var User = require('../models/user');
var dbc = mongojs('mongodb://elfuche:Travail#2016@ds011903.mlab.com:11903/productlist',['commandes']);
var dbr = mongojs('mongodb://elfuche:Travail#2016@ds011903.mlab.com:11903/productlist',['materiel']);
/* GET users listing. */

router.get('/login', function(req, res, next) {
  res.render('login');
});


// Register
router.get('/register', function(req, res){
	res.render('register');
});
// Regsiter User
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	//Validation
	req.checkBody('name', 'Nom requis').notEmpty();
	req.checkBody('email', 'Email requis').notEmpty();
	req.checkBody('email', 'Email invalide').isEmail();
	req.checkBody('username', 'Username requis').notEmpty();
	req.checkBody('password', 'Mot de passe requis').notEmpty();
	req.checkBody('password2', 'Mots de passe ne correspondent pas').equals(req.body.password);


	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password
		});
		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});
		req.flash('success_msg', 'Vous êtes enregistré, vous pouvez vous connectez maintenant');

		res.redirect('/users/login');
	}
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Utilisateur inconnu'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Mot de passe incorrect'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});
router.post('/login',
  passport.authenticate('local', {successRedirect:'/users/dashboard', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
  	req.session.username = req.body.username;
    res.redirect('/');
  });

router.get('/dashboard', function(req, res){
	var q= req.session.total;
	console.log("q-dash"+q);
	var f= req.session.mnt;
	console.log("f-dash"+f);
	if(!isNaN(q)){var a = parseFloat(q);} else {a=0;}
	if(!isNaN(f)){var b = parseFloat(f);} else {b=0;}
	var somme = a+b;
	console.log("somme : "+somme);
	var panier = req.session.cart;
	var booking = req.session.md;
	res.render('dashboard', {montant:somme, cart:panier, resa:booking});
});



router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'Vous êtes déconnecté!');

	res.redirect('/users/login');
});

//Archivage des ventes et des réservations
router.post('/payer', function(req, res){
	var username = req.body.username;
	console.log(username);
	var intervalle = req.body.intervalle;
	console.log(intervalle);
	var range = intervalle.split(',');
	console.log(range);
	var cart = req.body.cart;
	console.log("payer- cart :" +cart);
	var debut = req.body.debut;
	var fin = req.body.fin;
	var montant = req.body.montant;
    var id = req.body.id;
    console.log(id);
	 //Ajouter proprement élément par élément(mise à jour des dates non disponibles)
  for(var i=0; i<intervalle.length-1;i++){ 
  dbr.materiel.update({ _id: mongojs.ObjectId(id) },{ $addToSet: {dates_non_comprises: range[i]}}, function(err,doc){
    if(err){console.log('errrrrrrrr');}
  });
  } //fin boucle for

  //Archivage, Historisation
  dbc.commandes.insert({nom:username,date_debut:debut, date_fin:fin, panier:JSON.parse(cart), montant:montant, date: new Date()}, function(doc,err){
    if(err){ console.log('erreur archivage');}
  });
  

});


module.exports = router;
