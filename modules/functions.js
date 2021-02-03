var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var fs = require('fs');
const path = require('path');
const requestIp = require('request-ip');
const errors = require('../config/errors.json');
const config = require('../config');

module.exports = {
    validateEmail: function (data) {
        return new Promise(function (resolve, reject) {
            if (data.u || data.email) {
                var email = data.email;
                if (data.u) {
                    email = data.u;
                }
                validateEmail(email)
                    .then(function () {
                        resolve();
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            } else {
                reject({
                    "statusCode": 500,
                    "error": errors.email_not_found,
                    "message": errors.email_not_found_message
                })
            }
        });
    },
    validateLoginData: function (data) {
        return new Promise(function (resolve, reject) {
            if (!data.password || !data.email) {
                reject({
                    "statusCode": 500,
                    "error": errors.email_not_found,
                    "message": errors.email_not_found_message
                })
            } else {
                validatePassword(data.password, 6)
                    .then(function () {
                        return validateEmail(data.email);
                    })
                    .then(function () {
                        resolve();
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            }
        });
    },
    matchPassowrds: function (data, body) {
        return new Promise(function (resolve, reject) {
            if (!body.password || !body.cpassword) {
                console.log(data)
                reject({
                    "statusCode": 500,
                    "error": errors.password_not_found,
                    "message": errors.password_not_found_message
                })
            } else {
                matchPassword(data.password, data.cpassword)
                    .then(function () {
                        resolve();
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            }
        });
    },
    validateRegisterData: function (data) {
        return new Promise(function (resolve, reject) {
            if (!data.password || !data.email || !data.cpassword || !data.fname || !data.lname || !data.username || !data.contactNo || !data.tcCheck) {
                reject({
                    "statusCode": 500,
                    "error": errors.fill_form,
                    "message": errors.fill_form_message
                })
            } else {

                validatePassword(data.password, 6)
                    .then(function () {
                        return validateEmail(data.email)
                            .then(function () {
                                return matchPassword(data.password, data.cpassword)
                                    .then(function () {
                                        return tcCheck(data.tcCheck)
                                    })
                                    .then(function () {
                                        resolve();
                                    })
                                    .catch(function (err) {
                                        reject(err);
                                    });
                            })
                            .then(function () {
                                resolve();
                            })
                            .catch(function (err) {
                                reject(err);
                            });
                    })
                    .then(function () {
                        resolve();
                    })
                    .catch(function (err) {
                        reject(err);
                    });

            }
        });
    },
    validateTempAccessToken: function (data) {
        return new Promise(function (resolve, reject) {
            if (!data.access_token) {
                reject({
                    "statusCode": 500,
                    "error": errors.access_token_not_found,
                    "message": errors.access_token_not_found_message
                })
            } else {
                var cert = fs.readFileSync('key/public.key'); // get public key
                var token = data.access_token.replace("tt", config.jwt_temp_algo);
                jwt.verify(token, cert, function (err, decoded) {
                    if (err) {
                        reject({
                            "statusCode": 500,
                            "error": errors.access_token_error,
                            "message": errors.access_token_error_message
                        })
                    } else {
                        resolve(decoded);
                    }
                });
            }
        });
    },
    validateAccessTokenWithoutVerify: function (data) {
        return new Promise(function (resolve, reject) {
            if (!data.access_token) {
                reject({
                    "statusCode": 500,
                    "error": errors.access_token_not_found,
                    "message": errors.access_token_not_found_message
                })
            } else {
                var token = data.access_token.replace("tt", config.jwt_temp_algo);
                var decoded = jwt.decode(token);
                resolve(decoded);
            }
        });
    },
    ValidAccessToken: function (data, req) {
        return new Promise(function (resolve, reject) {
            if (!data.access_token) {
                reject({
                    "statusCode": 500,
                    "error": errors.access_token_not_found,
                    "message": errors.access_token_not_found_message
                })
            } else {
                const secret = requestIp.getClientIp(req);
                var token = data.access_token.replace("lt", config.jwt_algo);
                jwt.verify(token, secret, function (err, decoded) {
                    if (err) {
                        reject({
                            "statusCode": 500,
                            "error": errors.access_token_error,
                            "message": errors.access_token_error_message
                        })
                    } else {
                        resolve(decoded);
                    }
                });
            }
        });
    },
    makeValidAccessToken: function (data, req) {
        const secret = requestIp.getClientIp(req);
        var token = jwt.sign(data, secret, {
            expiresIn: '365 days'
        });
        var header = token.substr(0, token.indexOf("."));
        var token = token.replace(header, "lt");
        return token;
    },
    makeValidTempAccessToken: function (data) {
        var privateKey = fs.readFileSync(`key/private.key`);
        var token = jwt.sign(data, privateKey, {
            algorithm: config.jwt_temp_algo_name,
            expiresIn: '1h'
        });
        var header = token.substr(0, token.indexOf("."));
        var token = token.replace(header, "tt");
        return token;
    },
    storeActivity: function (req) {
        const clinet = requestIp.getClientIp(req);
        var ip = clinet.substr(clinet.lastIndexOf(":") + 1);
        return `INSERT INTO public.user_activity(c_id, login_ip, activity,activity_datetime)VALUES ($1,'${ip}', $2,NOW());`;
    },
    sendMail: function (to, subject, message, path, token) {
        return new Promise(function (resolve, reject) {
            var transporter = nodemailer.createTransport({
                host: config.mail.host,
                port: config.mail.port,
                secure: true,
                auth: {
                    user: config.mail.username,
                    pass: config.mail.password
                }
            });

            var url = config.baseUrl + path + "?access_token=" + token;

            var mailOptions = {
                from: "no-reply@mapdatalab.com",
                to: to,
                subject: subject,
                text: url
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    reject({
                        "statusCode": 500,
                        "error": error,
                        "message": errors.email_no_send_message
                    })
                } else {
                    resolve();
                }
            });
        });
    }
};

function validateEmail(email) {
    return new Promise(function (resolve, reject) {
        if (typeof (email) !== 'string') {
            reject({
                "statusCode": 500,
                "error": errors.email_validate,
                "message": errors.email_validate_message
            })
        } else {
            var re = new RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
            if (re.test(email)) {
                resolve();
            } else {
                reject({
                    "statusCode": 500,
                    "error": errors.email_validate,
                    "message": errors.email_validate_message
                })
            }
        }
    });
}

function validatePassword(password, minCharacters) {
    return new Promise(function (resolve, reject) {
        if (typeof (password) !== 'string') {
            reject({
                "statusCode": 500,
                "error": errors.password_validate,
                "message": errors.password_validate_message
            })
        } else if (password.length < minCharacters) {
            reject({
                "statusCode": 500,
                "error": errors.password_validate,
                "message": errors.password_validate_message
            })
        } else {
            resolve();
        }
    });
}

function matchPassword(password, confirmPassword) {
    return new Promise(function (resolve, reject) {
        if (password !== confirmPassword) {
            reject({
                "statusCode": 500,
                "error": errors.password_match,
                "message": errors.password_match_message
            })
        } else {
            resolve();
        }
    });
}

function tcCheck(checkbox) {
    return new Promise(function (resolve, reject) {
        if (checkbox == 'false') {
            reject({
                "statusCode": 500,
                "error": errors.tc_not_checked,
                "message": errors.tc_not_checked_message
            })
        } else {
            resolve();
        }
    });
}
