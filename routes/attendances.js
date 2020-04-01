var express = require('express');
var router = express.Router();
var connection  = require('../lib/db');
var LibLogger = require('../lib/log');
var libLogger = new LibLogger().getInstance();

router.get('/', function(req, res, next) {
      
    connection.query('SELECT * FROM Attendances ORDER BY id desc',function(err,rows)     {
        if(err){
            req.flash('error', err); 
            res.render('attendances',{page_title:"Attendances - Node.js",data:''});   
        }else{                             
            res.render('attendances',{page_title:"Attendances - Node.js",data:rows});
        }                            
    });        
});
       
router.get('/delete/(:id)', function(req, res, next) {
    var finger = { id: req.params.id }
     
    connection.query('DELETE FROM Attendances WHERE id = ' + req.params.id, finger, function(err, result) {        
        if (err) {
            req.flash('error', err)            
            res.redirect('/attendances')
        } else {


            req.flash('success', 'Attendances deleted successfully! id = ' + req.params.id)            
            res.redirect('/attendances')
        }
    })
})
 
 
module.exports = router;