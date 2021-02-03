var jwt = require('jsonwebtoken');
var hash = require('pbkdf2-password')()
const errors = require('../config/errors.json');
const fun = require('../modules/functions');
const sql = () => {
    return `SELECT c_id,email,varified FROM public.clienttable where c_id = $1`;
}

const changepasswordquery = () => {
    return `UPDATE public.clienttable SET salt=$2,hash=$3,password_expiry=false where c_id = $1`;
}

module.exports = {
    changepassword: function (req, res) {
        //parameter not found show error
        fun.validateTempAccessToken(req.query)
            .then(function (decoded) {
                var client = req.app.get('client'); //db client connect
                //query for authentication
                client.query(sql(), [decoded.a], function onResult(err, result) {
                    //show error if query failed
                    if (err) {
                        res.send({
                            "statusCode": 500,
                            "error": errors.internal_error,
                            "message": errors.db_not_connect
                        });
                    } else {
                        if (result.rows.length === 0) {
                            res.send({
                                "statusCode": 500,
                                "error": errors.user_found,
                                "message": errors.user_found_message
                            })
                        } else {
                            fun.matchPassowrds(req.query, req.body)
                                .then(function () {
                                    hash({
                                        password: req.body.password
                                    }, function (err, pass, salt, hash) {
                                        client.query(changepasswordquery(), [decoded.a, salt, hash], function onResult(err, result) {
                                            if (err) {
                                                res.send({
                                                    "statusCode": 500,
                                                    "error": errors.internal_error,
                                                    "message": errors.db_not_connect
                                                });
                                            } else {
                                                res.send({
                                                    "statusCode": 200,
                                                    "message": errors.success_changepassword
                                                });
                                                client.query(fun.storeActivity(req), [decoded.a, 'changepassword']);
                                            }
                                        });
                                    })
                                })
                                .catch(function (errors) {
                                    res.send(errors)
                                });
                        }
                    }
                })
            }).catch(function (errors) {
                res.send(errors)
            });
    }
}
