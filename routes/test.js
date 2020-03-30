var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('test', {
        title: 'Test Arduino',
        name: '',
        email: ''        
    })
});

module.exports = router;
