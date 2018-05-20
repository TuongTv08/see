var express = require("express"),
  router = express.Router()
var MongoClient = require('mongodb').MongoClient; // connect online
var uri = "mongodb+srv://duy:vippergod12@data-imllf.mongodb.net/test"; // connect online

var directName = require('../../demo');
router.use(express.static('/Data'));


var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: true
}));

function isAdminLoggedin(req, res, next) {
  if (req.isAuthenticated() && req.user.ID[0] == 's') {
    return next();
  }
  res.redirect('/');
}

// default direct for css and html bug not load

router.get('/admin/quanlytaikhoan', isAdminLoggedin, function(req, res) { // ham index de vao web chinh

  var customer = require('../../models/customer');
  customer.customerCollection(function(result) {
    res.render('manage', {
      user: req.user,
      customer: result,
      flag: false,
      customerresult: null,
      body: "staff/quanlytaikhoan.ejs"
    });
  });
});

function findCustomer(idkh, callback) { // customer
  MongoClient.connect(uri, function(err, db) {

    if (err) throw err;
    var dbo = db.db("3dwebsite");
    dbo.collection("customer").findOne({
      ID: idkh
    }, function(err, result) {
      if (err) {
        console.log(err);
        throw err;
        callback("errorIDcustomer");
      } else {
        callback(result);
      }
    });
  });
}

var cusresult;
router.post('/admin/findCustomer', isAdminLoggedin, function(req, res) { //
  var idCustomer = req.body.idCustomer;
  console.log("id: "+idCustomer);
  findCustomer(idCustomer, function(result) {
    if (result[0] == "e" || result == null) {
      console.log("find Failed customer");
      cusresult = null;
      res.redirect('/admin/findFailedCustomer');
    } else {
      console.log("findCustomer" + result);
      cusresult = result;
      res.redirect('/admin/findSuccessCustomer');
    }
  });
});

router.get('/admin/findSuccessCustomer', isAdminLoggedin, function(req, res) { //
  var customer = require('../../models/customer');
  customer.customerCollection(function(result) {
    res.render('manage', {
      user: req.user,
      customer: result,
      flag: true,
      customerresult: cusresult,
      body: "staff/quanlytaikhoan.ejs"
    });
  });
});

router.get('/admin/findFailedCustomer', isAdminLoggedin, function(req, res) { //
  var customer = require('../../models/customer');
  customer.customerCollection(function(result) {
    res.render('manage', {
      user: req.user,
      customer: result,
      flag: false,
      customerresult: cusresult,
      body: "staff/quanlytaikhoan.ejs"
    });
  });
});

function updateCus(id, hoten, password, diachi, email, dienthoai) { // customer
  MongoClient.connect(uri, function(err, db) {
    //var ids = "/"+nameProduct+"/";
    if (err) throw err;
    var dbo = db.db("3dwebsite");
    dbo.collection("customer").update({
      ID: id
    }, {
      $set: {
        hoten: hoten,
        password: password,
        diachi: diachi,
        email: email,
        dienthoai: dienthoai
      }
    }, {
      multi: true
    });
  });
}

var updateCustomer;
router.get('/admin/updateCustomer?:ID', isAdminLoggedin, function(req, res) { //
  findCustomer(req.query.ID, function(result) {
    res.render('manage', {
      user: req.user,
      updateCustomer: result,
      body: "staff/updateCustomer.ejs"
    });
  });
})


router.post('/admin/adminUpdateCustomer', isAdminLoggedin, function(req, res) { //
  var idkh = req.body.idkh;
  var hoten = req.body.hoten;
  var password = req.body.password;
  var diachi = req.body.diachi;
  var email = req.body.email;
  var dienthoai = req.body.dienthoai;
  updateCus(idkh, hoten, password, diachi, email, dienthoai);
  console.log("Update Success Customer "+idkh);
  var customer = require("../../models/customer");
  customer.customerCollection(function(result) {
    res.render('manage', {
      user: req.user,
      customer: result,
      flag: false,
      customerresult: null,
      body: "staff/quanlytaikhoan.ejs"
    });
  });
  idkh = null;
});

function removeCustomer(id) { // customer
  MongoClient.connect(uri, function(err, db) {
    //var ids = "/"+nameProduct+"/";
    if (err) throw err;
    var dbo = db.db("3dwebsite");
    dbo.collection("customer").remove({
      ID: id
    });
  });
}

router.get('/admin/removeCustomer?:ID', isAdminLoggedin, function(req, res) {
  var idkh = req.query.ID; //, isAdminLoggedin
  removeCustomer(idkh);
  console.log("remove Success " +idkh);
  res.redirect('/admin/removeSuccess');
});

router.get('/admin/removeSuccess', isAdminLoggedin, function(req, res) { //, isAdminLoggedin
  var customer = require("../../models/customer")
  customer.customerCollection(function(result) {
    res.render('manage', {
      user: req.user,
      customer: result,
      flag: false,
      customerresult: null,
      body:"staff/quanlytaikhoan.ejs"
    });
  });
});

module.exports = router;
