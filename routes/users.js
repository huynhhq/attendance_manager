var express = require('express');
var router = express.Router();
var connection  = require('../lib/db');
var mqttHandler = require('../lib/mqtt');
var mqttClient = new mqttHandler().getInstance();
 
router.get('/', function(req, res, next) {
      
 connection.query('SELECT * FROM Users ORDER BY id desc',function(err,rows)     {
        if(err){
            req.flash('error', err); 
            res.render('users',{page_title:"Users - Node.js",data:''});   
        }else{            
            res.render('users',{page_title:"Users - Node.js",data:rows});
        }                            
    });        
});
 
router.get('/add', function(req, res, next){        
    res.render('users/add', {
        title: 'Add New Users',
        name: '',
        employerId: ''        
    })
})
 
router.post('/add', function(req, res, next){    
    req.assert('name', 'Name is required').notEmpty();
    req.assert('code', 'Employer is required').notEmpty(); 
  
    var errors = req.validationErrors()
     
    if( !errors ) {
        var user = {
            name: req.sanitize('name').escape().trim(),
            code: req.sanitize('code').escape().trim()
        }
         
     connection.query('INSERT INTO Users SET ?', user, function(err, result) {                
            if (err) {
                req.flash('error', err);

                res.render('users/add', {
                    title: 'Add New User',
                    name: user.name,
                    code: user.code                    
                });               
            } else {  
                // Send message to IOT device
                mqttClient.sendMessage('command', '1');
                mqttClient.sendMessage('name', user.name);
                mqttClient.sendMessage('code', user.code);
                // End send message to IOT device              
                req.flash('success', 'Data added successfully!');
                res.redirect('/users');
            }
        })
    }
    else {
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })                
        req.flash('error', error_msg)            
        res.render('users/add', { 
            title: 'Add New User',
            name: req.body.name,
            code: req.body.code
        })
    }
})
 
router.get('/edit/(:id)', function(req, res, next){
   
connection.query('SELECT * FROM Users WHERE id = ' + req.params.id, function(err, rows, fields) {
            if(err) throw err

            if (rows.length <= 0) {
                req.flash('error', 'Users not found with id = ' + req.params.id)
                res.redirect('/users')
            }
            else {                 
                res.render('users/edit', {
                    title: 'Edit user',                     
                    id: rows[0].id,
                    name: rows[0].name,
                    code: rows[0].code                    
                })
            }            
        })
  
})
 
router.post('/update/:id', function(req, res, next) {
    req.assert('name', 'Name is required').notEmpty();
    req.assert('code', 'Name is required').notEmpty();    
  
    var errors = req.validationErrors()
     
    if( !errors ) {   
 
        var user = {
            name: req.sanitize('name').escape().trim(),
            code: req.sanitize('code').escape().trim()
        }
         
        connection.query('UPDATE Users SET ? WHERE id = ' + req.params.id, user, function(err, result) {            
            if (err) {
                req.flash('error', err)
                                    
                res.render('Users/edit', {
                    title: 'Edit User',
                    id: req.params.id,
                    name: req.body.name,
                    code: req.body.code
                })
            } else {
                req.flash('success', 'Data updated successfully!');
                res.redirect('/users');
            }
        });         
    }
    else {
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)         
        res.render('users/edit', { 
            title: 'Edit User',            
            id: req.params.id, 
            name: req.body.name,
            code: req.body.code
        })
    }
})
       
router.get('/delete/(:id)', function(req, res, next) {
    var user = { id: req.params.id }
     
connection.query('DELETE FROM Users WHERE id = ' + req.params.id, user, function(err, result) {        
        if (err) {
            req.flash('error', err)            
            res.redirect('/users')
        } else {
            req.flash('success', 'User deleted successfully! id = ' + req.params.id)            
            res.redirect('/users')
        }
    })
})
 
 
module.exports = router;