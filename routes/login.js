var jwt = require('jsonwebtoken');
var hash = require('pbkdf2-password')()
const errors = require('../config/errors.json');
const fun = require('../modules/functions');
const sql = () => {
    return `SELECT c_id,email,varified,salt,hash,password_expiry FROM public.clienttable where email ilike $1`;
}

const store_login_time = () => {
    return `UPDATE public.clienttable
            SET last_login=NOW()
            WHERE c_id = $1;`;
}

module.exports = {
    login: function (req, res) {
        //parameter not found show error
        fun.validateLoginData(req.body)
            .then(function () {
                var client = req.app.get('client'); //db client connect
                //query for authentication
                client.query(sql(), [req.body.email], function onResult(err, result) {
                    //show error if query failed
                    if (err) {
                        res.send({
                            "statusCode": 500,
                            "error": errors.internal_error,
                            "message": errors.db_not_connect
                        });
                    } else {
                        if (result.rows.length == 0) {
                            res.send({
                                "statusCode": 500,
                                "error": errors.user_not_found,
                                "message": errors.user_not_found_message
                            })
                        } else {
                            var data = {
                                a: result.rows[0].c_id,
                                v: result.rows[0].varified,
                                u: result.rows[0].email
                            }
                            if (result.rows[0].password_expiry) {
                                var token = fun.makeValidTempAccessToken(data);
                                fun.sendMail(result.rows[0].email, "Your Password is expired", "", "forgotpassword", token)
                                    .then(function () {
                                        res.send({
                                            "statusCode": 500,
                                            "error": errors.password_expire,
                                            "message": errors.password_expire_message
                                        });
                                        client.query(fun.storeActivity(req), [result.rows[0].c_id, 'passwordexpired']);
                                    })
                                    .catch(function (errors) {
                                        res.send(errors)
                                    });
                            } else {
                                hash({
                                    password: req.body.password,
                                    salt: result.rows[0].salt
                                }, function (err, pass, salt, hash) {
                                    if (err) {
                                        res.send({
                                            "statusCode": 500,
                                            "error": errors.internal_error,
                                            "message": err
                                        })
                                    } else if (hash === result.rows[0].hash) {
                                        if (result.rows[0].varified === "false") {
                                            var token = fun.makeValidTempAccessToken(data);
                                            fun.sendMail(result.rows[0].email, "Verify Your Account", "", "verify", token)
                                                .then(function () {
                                                    client.query(fun.storeActivity(), [result.rows[0].c_id, 'unverified login']);
                                                    res.send({
                                                        "statusCode": 200,
                                                        "token": token,
                                                        "message": errors.success_unvrified_login
                                                    })
                                                })
                                                .catch(function (errors) {
                                                    res.send(errors)
                                                });
                                        } else {
                                            var token = fun.makeValidAccessToken(data, req);
                                            client.query(store_login_time(), [result.rows[0].c_id]);
                                            client.query(fun.storeActivity(req), [result.rows[0].c_id, 'login']);
                                            res.send({
                                                "statusCode": 200,
                                                "message": errors.success_login,
                                                "token": token

                                            })
                                        }
                                    } else {
                                        res.send({
                                            "statusCode": 500,
                                            "error": errors.password_wrong,
                                            "message": errors.password_wrong_message
                                        })
                                    }
                                });
                            }
                        }
                    }

                });
            }).catch(function (errors) {
                res.send(errors)
            });
    }
}
