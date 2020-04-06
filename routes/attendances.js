var express = require('express');
var router = express.Router();
var connection  = require('../lib/db');
var LibLogger = require('../lib/log');
var libLogger = new LibLogger().getInstance();

router.get('/', function(req, res, next) {
     
    connection.query('SELECT * FROM Users', function(err,rows)     {
        if(err){
            req.flash('error', err); 
            return res.render('users',{page_title:"Users - Node.js",data:''});   
        }else{  
            var attendanceArr = []; 
            for (let index = 0; index < rows.length; index++) {
                const element = rows[index];
                let userAttendance = {};
                userAttendance['id'] = element.id;
                userAttendance['name'] = element.name;
                userAttendance['code'] = element.code;

                connection.query('SELECT * FROM Attendances where ( user_id = ' + element.id + ' AND DATE(created_at) = curdate() ) order by created_at limit 1', function(errInTime,inTimeRows) {
                    libLogger.log('QUERY WITH USER_ID: ' + element.id);
                    if (errInTime) {
                        req.flash('error', errInTime); 
                        return res.render('attendances',{page_title:"Attendances - Node.js",data:''});   
                    }
                                        
                    if (inTimeRows.length <= 0) {
                        libLogger.log('ADD WITH USER_ID: ' + element.id);
                        userAttendance[ 'inTime' ] = "Đang cập nhật";
                        userAttendance[ 'outTime' ] = "Đang cập nhật";
                        attendanceArr.push( userAttendance );
                    }
                    else{
                        userAttendance[ 'inTime' ] = inTimeRows[0].created_at;         
                        connection.query('SELECT * FROM Attendances where ( user_id = ' + element.id + ' AND id != ' + inTimeRows[0].id + ' AND DATE(created_at) = curdate() ) order by created_at DESC limit 1',function(errOutTime,inOutRows) {
                            if (errOutTime) {
                                req.flash('error', errOutTime); 
                                return res.render('attendances',{page_title:"Attendances - Node.js",data:''});   
                            }
                            
                            if( inOutRows.length <= 0)
                            {
                                libLogger.log('ADD WITH USER_ID: ' + element.id);
                                userAttendance[ 'outTime' ] = "Đang cập nhật";                                 
                                attendanceArr.push( userAttendance );
                            } 
                            else
                            {
                                libLogger.log('ADD WITH USER_ID: ' + element.id);
                                userAttendance[ 'outTime' ] = inOutRows[0].created_at;
                                libLogger.log('OUTTIME OF USER ID: ' + element.id + ' IS: ' + userAttendance[ 'outTime' ]);                                              
                                attendanceArr.push( userAttendance );
                            }
                        });
                    }                                       
                    libLogger.log('INTIME OF USER ID: ' + element.id + ' IS: ' + userAttendance[ 'inTime' ]);                  
                });

            }

            setTimeout(function(){ 
                
                res.render('attendances',{page_title:"Users - Node.js",data:attendanceArr}); 
            }, 1000);
        
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


router.get('export/(:id)', function*( req, res, next )
{
    connection.query('SELECT * FROM Users WHERE id = ' + req.params.id,function(err,rows)     {
        if(err){
            req.flash('error', err); 
            return res.render('users',{page_title:"Users - Node.js",data:''});   
        }else{  
            var attendanceArr = []; 
            for (let index = 0; index < rows.length; index++) {
                const element = rows[index];
                var userAttendance = {};
                userAttendance['id'] = element.id;
                userAttendance['name'] = element.name;
                userAttendance['code'] = element.code;

                connection.query('SELECT * FROM Attendances where ( user_id = ' + element.id + ' AND DATE(created_at) = curdate() ) order by created_at limit 1',function(errInTime,inTimeRows) {
                    
                    if (errInTime) {
                        req.flash('error', errInTime); 
                        return res.render('attendances',{page_title:"Attendances - Node.js",data:''});   
                    }
                                        
                    if (inTimeRows.length <= 0) {
                        userAttendance[ 'inTime' ] = "Đang cập nhật";
                        userAttendance[ 'outTime' ] = "Đang cập nhật";
                    }
                    else{
                        userAttendance[ 'inTime' ] = inTimeRows[0].created_at;                           
                        connection.query('SELECT * FROM Attendances where ( user_id = ' + element.id + ' AND id != ' + inTimeRows[0].id + ' AND DATE(created_at) = curdate() ) order by created_at DESC limit 1',function(errOutTime,inOutRows) {
                            if (errOutTime) {
                                req.flash('error', errOutTime); 
                                return res.render('attendances',{page_title:"Attendances - Node.js",data:''});   
                            }

                            if( inOutRows.length <= 0)
                            {
                                userAttendance[ 'outTime' ] = "Đang cập nhật";                                 
                            } 
                            else
                            {
                                userAttendance[ 'outTime' ] = inOutRows[0].created_at;
                            }                            
                        });
                    }                                       
                });

                attendanceArr.push( userAttendance );
            }

            setTimeout(function(){ 
                var json2csv = require('json2csv');
                var fields = ['User ID', 'User Name', 'Employer ID', 'In Time', 'Out Time'];
                var fieldNames = ['User ID', 'User Name', 'Employer ID', 'In Time', 'Out Time'];
                var data = json2csv({ data: docs, fields: fields, fieldNames: fieldNames });
                res.render('attendances',{page_title:"Users - Node.js",data:attendanceArr}); 
            }, 500);
        
        }                            
    });
});
 
 
module.exports = router;