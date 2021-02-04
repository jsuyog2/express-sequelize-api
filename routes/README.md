# Routes
The routes folder contains all of the routes. They are loaded automatically at run time; drop a new route in the routes folder, declare in `route/index.js`, fire up, and the new route is loaded.

## Initalize new Route

### Step 1: Initalize in index.js
First, you need to initialize a route path in `route/index.js`.

For POST method

```createPostRoute(path);```

For example, If you want to initialize route for `login` route using `POST` method

```createPostRoute('login');```


For GET method

```createGetRoute(path);```

For example, If you want to initialize route for `user response` route using `GET` method

```createGetRoute('userresponse');```

### Step 2: Create route file

Now you need to create a file in `route` folder. The FIle name is the same as you mention path in `route/index.js` and the extension is js.

For example, you want to create a route file for the `user response` route then the file name should be `userresponse.js`;

### Step 3: Add Route Contents

Now in the route file, you need to add some content is mentioned below in route design.


## Route design
Each route contains three sections: Header,sql, and the route itself.

##### Header
```
const errors = require('../config/errors.json');
const fun = require('../modules/functions');
```

This two modules is required in every route for [errors](https://github.com/jsuyog2/MapDataLABAPI/blob/master/config/README.md "errors") and some [functions](https://github.com/jsuyog2/MapDataLABAPI/blob/master/modules/README.md "functions").

##### SQL
```
const sql = () => {
    return `SELECT data FROM public.tablename where email ilike $1`;
}
```

The `sql` function returns SQL for execution by the Postgres server. you will make multiple like that using same syntax. We are using parameterized queries from node-postgres.

for more information can be found [here](https://node-postgres.com/features/queries#parameterized-query "here").

##### Route
```
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
                                "error": errors.user_not_found,
                                "message": errors.user_not_found_message
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
```

Routing refers to how an application’s endpoints (URIs) respond to client requests. Depending on the route you're building, you may want to customize the reply based on your results. This example from the `userresponse` route sends a `500` status code if user not found and sends a `data` if user found.

In this example

`userresponse` is File Name without extension.

## Already written Routes

##### Register:

**POST**: http://127.0.0.1:8000/register

**Body**:

```
email: String
password: String
cpassword: String
fname: String
lname: String
username: String
contactNo: String
tcCheck: Boolean
```

##### Login:

**POST**: http://127.0.0.1:8000/login

**Body**:

```
email: String
password: String
```

##### Verification:

**GET**: http://127.0.0.1:8000/verify?access_token=temp_access_token

**Params**:

```
access_token: String
```
##### ReVerification:

**GET**: http://127.0.0.1:8000/reverify?access_token=temp_access_token

**Params**:

```
access_token: String
```

##### Forgot Password:

**POST**: http://127.0.0.1:8000/forgotpassword

**Body**:

```
email: String
```
##### Change Password:
**POST**: http://127.0.0.1:8000/changepassword?access_token=temp_access_token

**Params**:

``` access_token: String ```

**Body**:
```
password: String
cpassword: String
```

##### User Response:
**GET**: http://127.0.0.1:8000/userresponse?access_token=login_access_token

**Params**:

```
access_token: String
```