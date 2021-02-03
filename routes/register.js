var jwt = require('jsonwebtoken');
var hash = require('pbkdf2-password')()
const errors = require('../config/errors.json');
const fun = require('../modules/functions');
const sql = () => {
    return `SELECT c_id,email,cnumber,varified FROM public.clienttable where email ilike $1 OR cnumber like $2 OR username ilike $3`;
}

const createUserQuery = () => {
    return `INSERT INTO public.clienttable(fname, lname,salt,hash, email, username,cnumber, varified, created_on,tccheck)
    VALUES ($1,$2,$3,$4,$5,$6,$7,false,NOW(),$8);`;
}

module.exports = {
    register: function (req, res) {
        //parameter not found show error
        fun.validateRegisterData(req.body)
            .then(function () {
                var client = req.app.get('client'); //db client connect
                //query for authentication
                client.query(sql(), [req.body.email, req.body.contactNo, req.body.username], function onResult(err, result) {
                    //show error if query failed
                    if (err) {
                        res.send({
                            "statusCode": 500,
                            "error": errors.internal_error,
                            "message": errors.db_not_connect
                        });
                    } else {
                        if (result.rows.length !== 0) {
                            res.send({
                                "statusCode": 500,
                                "error": errors.user_found,
                                "message": errors.user_found_message
                            })
                        } else {
                            hash({
                                password: req.body.password
                            }, function (err, pass, salt, hash) {
                                if (err) {
                                    res.send({
                                        "statusCode": 500,
                                        "error": errors.internal_error,
                                        "message": err
                                    })
                                } else {
                                    client.query(createUserQuery(), [req.body.fname, req.body.lname, salt, hash, req.body.email, req.body.username, req.body.contactNo, req.body.tcCheck], function onResult(err, result) {
                                        if (err) {
                                            res.send({
                                                "statusCode": 500,
                                                "error": errors.internal_error,
                                                "message": errors.db_not_connect
                                            });
                                        } else {
                                            client.query(sql(), [req.body.email, req.body.contactNo], function onResult(err, result) {
                                                //show error if query failed
                                                if (err) {
                                                    res.send({
                                                        "statusCode": 500,
                                                        "error": errors.internal_error,
                                                        "message": errors.db_not_connect
                                                    });
                                                } else {
                                                    var data = {
                                                        a: result.rows[0].c_id,
                                                        v: result.rows[0].varified,
                                                        u: result.rows[0].email
                                                    }
                                                    var token = fun.makeValidTempAccessToken(data);
                                                    fun.sendMail(result.rows[0].email, "Verify Your Account", "", "verify", token)
                                                        .then(function () {
                                                            client.query(fun.storeActivity(req), [result.rows[0].c_id, 'registration']);
                                                            res.send({
                                                                "statusCode": 200,
                                                                "token": token,
                                                                "message": errors.success_registration
                                                            })
                                                        })
                                                        .catch(function (errors) {
                                                            res.send(errors)
                                                        });
                                                }
                                            });


                                        }
                                    });
                                }
                            });
                        }

                    }
                })
            }).catch(function (errors) {

                res.send(errors)
            });
    }
}
