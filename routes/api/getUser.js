var keystone = require('keystone'),


    exports = module.exports = function(req, res) {
        return res.apiResponse({
            data: {
                "user": req.user,
                "status": "success"
            }
        });
    };