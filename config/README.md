# Configuration Options

```json
{
    "db": "postgres://username:port@hostname/dbname",
    "cache": 3600,
    "port": 8000,
    "jwt_algo":"",
    "jwt_temp_algo_name":"",
    "jwt_temp_algo": "",
    "baseUrl":"http://127.0.0.1:8000/",
    "mail": {
        "host": "smtp.gmail.com",
        "port": 465,
        "username": "",
        "password": ""
    }
}
```

### db

`db` is the database connection string for Postgres.

### cache

`cache` sets the expiration length of the server response, in seconds.

### port

`port` sets the port number the server runs on.

### jwt_algo

`jwt_algo` is the header of a token. this JSON is Base64Url encoded to form the first part of the JWT.

For example:
`eyJhbGciOiJQUzI1NiIsInR5cCI6IkpXVCJ9`

### jwt_temp_algo_name

`jwt_temp_algo_name` is the algorithm name that use to make a temporary token. such as HMAC SHA256 or RSA.

### jwt_temp_algo

`jwt_temp_algo` is the header of a temporary token. this JSON is Base64Url encoded to form the first part of the JWT.

For example:
`eyJhbGciOiJQUzI1NiIsInR5cCI6IkpXVCJ9`

### baseUrl
`baseUrl` The server will bind to the `host` name or IP address that is supplied.

### mail
`mail`  is a service to Send e-mail from Node.js. for that you need to configure a mail service.

#### host
`host` Set this to true if SMTP host requires authentication to send email

#### port
`port` TCP port to connect to

#### username
`username` SMTP username

#### password
`password` SMTP password