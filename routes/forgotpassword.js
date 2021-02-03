var jwt = require('jsonwebtoken');
var hash = require('pbkdf2-password')()
const errors = require('../config/errors.json');
const fun = require('../modules/functions');
const sql = () => {
    return `SELECT c_id,email,varified FROM public.clienttable where email ilike $1`;
}

module.exports = {
    forgotpassword: function (req, res) {
        //parameter not found show error
        fun.validateEmail(req.body)
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
                        if (result.rows.length === 0) {

                            res.send({
                                "statusCode": 500,
                                "error": errors.user_found,
                                "message": errors.user_found_message
                            })
                        } else {
                            var data = {
                                a: result.rows[0].c_id,
                                v: result.rows[0].varified,
                                u: result.rows[0].email
                            }
                            var token = fun.makeValidTempAccessToken(data);
                            fun.sendMail(result.rows[0].email, "Change Your Password", "", "changepassword", token)
                                .then(function () {
                                    res.send({
                                        "statusCode": 200,
                                        "message": errors.success_mail_sent
                                    });
                                    client.query(fun.storeActivity(req), [result.rows[0].c_id, 'forgotpassword']);
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
