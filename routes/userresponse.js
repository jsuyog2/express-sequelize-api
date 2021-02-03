var jwt = require('jsonwebtoken');
var hash = require('pbkdf2-password')()
const errors = require('../config/errors.json');
const fun = require('../modules/functions');
const sql = () => {
    return `SELECT json_build_object(
    'name',concat(c.fname,' ',c.lname),
    'email',c.email, 
    'username',c.username, 
    'number',c."cnumber", 
    'varified',c.varified, 
    'created_on',c.created_on, 
    'last_login',c.last_login, 
    'tccheck',c.tccheck
    )
    FROM public.clienttable c where c_id = $1;`;
}

module.exports = {
    userresponse: function (req, res) {
        //parameter not found show error
        fun.ValidAccessToken(req.query, req)
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
                            if (result.rows[0].varified !== "false") {
                                const allData = result.rows[0].json_build_object;
                                res.send(allData)
                                client.query(fun.storeActivity(req), [decoded.a, 'getalldata']);
                            } else {
                                res.send({
                                    "statusCode": 500,
                                    "error": errors.email_not_verified,
                                    "message": errors.email_not_verified_message
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
