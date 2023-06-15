const express = require('express');
const router = express.Router();

router.get('/', (rq, rs) => {
    rs.render('index', {title: 'Vidly', message: 'Hello World!'});
});

module.exports = router;