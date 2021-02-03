var jwt = require('jsonwebtoken');
var hash = require('pbkdf2-password')()
const errors = require('../config/errors.json');
const fun = require('../modules/functions');
const sql = () => {
    return `SELECT c_id,email,varified FROM public.clienttable where email ilike $1`;
}

module.exports = {
    reverify: function (req, res) {
        //parameter not found show error
        fun.validateAccessTokenWithoutVerify(req.query)
            .then(function (decoded) {
                fun.validateEmail(decoded)
                    .then(function () {
                        var client = req.app.get('client'); //db client connect
                        //query for authentication
                        client.query(sql(), [decoded.u], function onResult(err, result) {
                            
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
                                        "error": errors.user_not_found,
                                        "message": errors.user_not_found_message
                                    })
                                } else {
                                    if (result.rows[0].varified === false) {
                                        var data = {
                                            a: result.rows[0].c_id,
                                            v: result.rows[0].varified,
                                            u: result.rows[0].email
                                        }
                                        var token = fun.makeValidTempAccessToken(data);
                                        fun.sendMail(result.rows[0].email, "Verify Your Account", "", "verify", token)
                                            .then(function () {
                                                client.query(fun.storeActivity(req), [result.rows[0].c_id, 'reverify']);
                                                res.send({
                                                    "statusCode": 200,
                                                    "message": errors.success_mail_sent
                                                })
                                            })
                                            .catch(function (errors) {
                                                res.send(errors)
                                            });
                                    } else {
                                        res.send({
                                            "statusCode": 500,
                                            "error": errors.email_verified,
                                            "message": errors.email_verified_message
                                        });
                                    }

                                }

                            }
                        })
                    }).catch(function (errors) {
                        res.send(errors)
                    });
            }).catch(function (errors) {
                res.send(errors)
            });
    }
}
