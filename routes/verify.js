var jwt = require('jsonwebtoken');
var hash = require('pbkdf2-password')()
const errors = require('../config/errors.json');
const fun = require('../modules/functions');
const sql = () => {
    return `SELECT c_id,email,varified FROM public.clienttable where c_id = $1`;
}

const updateVerify = () => {
    return `UPDATE public.clienttable SET varified='true' where c_id = $1`;
}

module.exports = {
    verify: function (req, res) {
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
                            if (result.rows[0].varified === false) {
                                client.query(updateVerify(), [decoded.a], function onResult(err, result) {
                                    if (err) {
                                        res.send({
                                            "statusCode": 500,
                                            "error": errors.internal_error,
                                            "message": errors.db_not_connect
                                        });
                                    } else {
                                        res.send({
                                            "statusCode": 200,

                                            "message": errors.success_verification
                                        });
                                        client.query(fun.storeActivity(req), [decoded.a, 'verification']);
                                    }

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
    }
}
