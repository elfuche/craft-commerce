var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('productlist',['productlist']);
var dbr = mongojs('productlist',['materiel']);

var helpers = require('handlebars-helpers');
var math = helpers.math();
/* GET home page. */
router.get('/', function(req, res, next) {
    req.session.facture = req.session.facture || 0;
  res.render('index');
});

router.get('/articles', function(req, res) {
    
	db.productlist.find(function(err, docs){		
	res.render('articles', {articles:docs});
});  
});



router.get('/articles/:title', function(req, res){
	var nom = req.params.title;
	console.log(nom);
	db.productlist.find({title:nom}, function(err, doc){
		if(err){console.log('erreur lecture produit');}
		res.render('article',{article:doc});
		console.log(doc);
	});
});

router.get('/cart/:id', function(req,res){
	var id = req.params.id;
	console.log(id);
	res.redirect('/cart');
});

//Partie cadi
router.post('/articles/cart', function (req, res) {

        //Load (or initialize) the cart
        req.session.cart = req.session.cart || {};
        var cart = req.session.cart;

        //Read the incoming product data
        var id = req.body.id;

        //Locate the product to be added
        db.productlist.findOne({_id: mongojs.ObjectId(id)}, function(err,doc){
            if (err) {
                console.log('Error adding product to cart: ', err);
                res.redirect('/cart');
                return;
            }

            //Add or increase the product quantity in the shopping cart.
            if (cart[id]) {
                cart[id].qty++;
            }
            else {
                cart[id] = {
                    name: doc.title,
                    price: doc.prix,
                    qty: 1
                };
            }

            //Display the cart for the user
            res.redirect('/cart');

        });
    });

router.get('/cart', function (req, res) {
    
var resa = req.session.md;
var mnt =req.session.mnt;
console.log("le montant :"+mnt);
var fact =req.session.facture = req.session.facture || req.session.facture;
console.log("la facture :"+fact);
console.log("resa - cart : "+resa);
        //Retrieve the shopping cart from memory
        var cart = req.session.cart,
            displayCart = {items: [], total: 0},
            total = 0;

        if (!cart) {
            //res.render('result', {result: 'Your cart is empty!'});
            res.render('cart', {message:'panier vide', resa:resa, mnt:mnt+"", fact:fact});
            return;
        }

        //Ready the products for display
        for (var item in cart) {
            displayCart.items.push(cart[item]);
            total += (cart[item].qty * cart[item].price);
        }
        req.session.total = displayCart.total = total.toFixed(2);
        //var globale

        //req.app.locals.amount = req.session.total;

        req.session.facture = parseFloat(req.session.facture)+parseFloat(req.session.total);
        console.log("cart/ajout - req.session.facture :"+req.session.facture);
        var model =
        {
            cart: displayCart.items,
            total: displayCart.total,
            resa: resa
        };

        res.render('cart', model);
    });


//Triatement modification panier
router.get('/plus/:name', function(req,res){
    console.log(req.params.name);
    var nom = req.params.name;
    var obj = req.session.cart;
    console.log(obj);
    var i=0;
    for(var key in obj){
        i++;
        var value=obj[key];
        console.log(value);
        //for(var v in value){
            if(value["name"]===nom){
                value["qty"]++;
                break;
                var t =value["price"];
            }
        //}
    req.session.total = req.session.total+t;
    //modifier variable globale 
    //var globale
         req.session.facture = req.session.facture+req.session.total;
        console.log("plus - req.session.facture :"+req.session.facture); 
    }

req.session.cart = obj;
    res.redirect('/cart');
});
router.get('/moins/:name', function(req,res){
   console.log(req.params.name);
    var nom = req.params.name;
    var obj = req.session.cart;
    console.log(obj);
    var i=0; 
    for(var key in obj){
        i++;
        var value=obj[key];
        console.log(value);
        //for(var v in value){
            if(value["name"]===nom){
                value["qty"]--;
                break;
                var t =value["price"];
                console.log("qté: "+value["qty"]);
            }
        //}
    req.session.total = req.session.total-t;
    //var globale

         req.session.facture = req.session.facture+req.session.total;
        console.log("moins - req.session.facture :"+req.session.facture);
    
    }

//if(q){obj.splice(i, 1);}
//Partie quantité, suppression
console.log('suppression');
console.log(Object.keys(obj)[i-1]); 
var ind=Object.keys(obj)[i-1];
console.log(obj[ind]["qty"]);
var q=obj[ind]["qty"];
if(q==0){
    console.log("doit etre supprimé!!");
    delete obj[ind];
}
req.session.cart = obj;
    res.redirect('/cart');
});


//Partie reservations
router.get('/reservations', function(req,res){
    
    dbr.materiel.find(function(err, docs){
    console.log(docs);
    res.render('reservations',{res:docs});
  });
});


router.get('/reservations/:nom', function(req, res){
    
  var nom = req.params.nom;
    console.log(nom);
    dbr.materiel.find({nom:nom}, function(err, doc){
        if(err){console.log('erreur reservation produit');}
        res.render('reservation',{res:doc});
    });

});

router.post('/reservations/reserver', function(req, res){

//Calcul dates dans intervalle
var d1=req.body.date_deb;
var d2=req.body.date_fin;
//Calcul dates dans l'intervalle choisi
Date.prototype.addDays = function(days) {
var dat = new Date(this.valueOf());
dat.setDate(dat.getDate() + days);
return dat;
};
//Traitement pour calculer dates dans un intervalle
function getDates(startDate, stopDate) {
var dateArray = [];
var currentDate = startDate;
while (currentDate <= stopDate) {
var month=currentDate.getMonth()+1;
month = month<10 ? "0"+ (currentDate.getMonth()+1) : currentDate.getMonth()+1; 
var jour=currentDate.getDate();
jour = jour<10 ||jour===1 ? "0"+currentDate.getDate() : currentDate.getDate(); 
dateArray.push(jour+"-"+month+"-"+currentDate.getFullYear());
currentDate = currentDate.addDays(1);
}
return dateArray;
}
var ds1=d1.replace('-',' ');
var dc1 = ds1.replace('-',' ');
var startDate = new Date(dc1);
var mon;
mon = mon<9 ? "0"+ (startDate.getMonth()+1) : startDate.getMonth()+1; 
var ds2=d2.replace('-',' ');
var dc2 = ds2.replace('-',' ');
var endDate= new Date(dc2);
var arr = getDates(startDate,endDate);
console.log(arr);

    req.session.mnt=(arr.length*req.body.tarif).toFixed(2);
    req.session.facture = parseFloat(req.session.facture) + parseFloat(req.session.mnt);
    //var faturra = req.session.facture;

var mod={
       idArticle:req.body.idArticle,
       date_deb:req.body.date_deb,
       date_fin:req.body.date_fin,
       dates_res:req.body.dates_res,
       arr:arr.length,
       tarif:req.body.tarif,
       tot:(arr.length*req.body.tarif).toFixed(2)
    };
    console.log(mod);
    //console.log((req.body.rangee*req.body.tarif).toFixed(2));
   
 
    req.session.md =mod;
    //var globale

         //req.session.facture = req.session.facture+req.session.mnt;
        //req.app.locals.facture =req.session.facture;
        
   res.redirect('/cart');
});

router.get('/reservations/cart',function (req, res) {
res.render('cart');
});

module.exports = router;
