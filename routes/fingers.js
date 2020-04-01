var express = require('express');
var router = express.Router();
var connection  = require('../lib/db');
var LibLogger = require('../lib/log');
var libLogger = new LibLogger().getInstance();

router.get('/', function(req, res, next) {
      
    connection.query('SELECT * FROM Fingers ORDER BY id desc',function(err,rows)     {
        if(err){
            req.flash('error', err); 
            res.render('fingers',{page_title:"Fingers - Node.js",data:''});   
        }else{     
            for (let index = 0; index < rows.length; index++) {
                const current_finger = rows[index];
                connection.query('SELECT * FROM Users WHERE id = ' + current_finger.user_id, function(err, userRows, fields) {
                    if(err) throw err

                    if (userRows.length <= 0) {
                        userRows[index].name = 'Đang cập nhật';
                        userRows[index].user_code = 'Đang cập nhật';                        
                    }
                    else { 
                        rows[index].name = userRows[0].name;
                        rows[index].user_code = userRows[0].code;                                                                      
                    } 
                });
            }
            
            res.render('fingers',{page_title:"Fingers - Node.js",data:rows});
        }                            
    });        
});
       
router.get('/delete/(:id)', function(req, res, next) {
    var finger = { id: req.params.id }
     
    connection.query('DELETE FROM Fingers WHERE id = ' + req.params.id, finger, function(err, result) {        
        if (err) {
            req.flash('error', err)            
            res.redirect('/fingers')
        } else {


            req.flash('success', 'Finger deleted successfully! id = ' + req.params.id)            
            res.redirect('/fingers')
        }
    })
})
 
 
module.exports = router;