# Express PostgreSQL API
The Express PostgreSQL API is make a secure and reliable API use to Login, Registration and Verify USER.

## Getting started
###Requirements
- [Node](https://nodejs.org/en/ "Node")
- [PostgreSQL ](https://www.postgresql.org/ "PostgreSQL ")
- [OpenSSL](https://wiki.openssl.org/index.php/Binaries "OpenSSL")

### Create Database

First, You need to create a database in PostgreSQL. after that, you need to create 2 tables in that.

the query of tables are following.

##### 1. Client Table
This table stores information about users like Name, Email, Phone Number, etc.

```sql
CREATE TABLE public.clienttable
(
  c_id serial NOT NULL PRIMARY KEY,
  fname character varying(50) NOT NULL,
  lname character varying(50) NOT NULL,
  username character varying(50) NOT NULL,
  email character varying(355) NOT NULL,
  cnumber character varying(355) NOT NULL,
  varified boolean NOT NULL,
  created_on timestamp without time zone NOT NULL,
  last_login timestamp without time zone,
  tccheck boolean NOT NULL,
  password_expiry boolean,
  salt character varying NOT NULL,
  hash character varying NOT NULL
)
```
##### 2. User Activity
In this table is stored activity of the user when the user Login, make Registration, Change Password.

```sql
  CREATE TABLE public.user_activity
(
  a_id serial NOT NULL PRIMARY KEY,
  c_id integer NOT NULL,
  login_ip inet NOT NULL,
  activity character varying NOT NULL,
  activity_datetime timestamp without time zone NOT NULL,
  CONSTRAINT c_id
      FOREIGN KEY(c_id) 
	  REFERENCES clienttable(c_id)
  )
```

### Generating keys using OpenSSL

Now you need to create Private and Public Key to generate a Token.

1 .Generate an RSA private key, of size 2048, and output it to a file named private.key:
```shell
openssl genrsa -out key/private.key 2048
```

2 .Extract the public key from the key pair, which can be used in a certificate:
```shell
openssl rsa -in key/private.key -outform PEM -pubout -out key/public.key
```

Note: make sure both key `private.key` and `public.key` save in `key` folder.

### Install API

Now you need to install API. For Installation, you need to follow the below steps.

##### Step 1: get the goodies
Note: if you don't have git, you can download a zip file of the project instead.

```shell
git clone https://github.com/jsuyog2/express-postgresql-api.git api
cd api
npm install
```
##### Step 2: add your configuration

Add your Postgres connection information to config/index.json.txt and rename it index.json. Information on the config options can be found [here](https://github.com/jsuyog2/express-postgresql-api/blob/master/config/README.md "here").

##### Step 3: fire it up!
```shell
npm start
```

### URLs
URLs used for Login, Registration, and Verify USER in API.

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
**GET**: http://127.0.0.1:8000/userresponse?access_token=temp_access_token

**Params**:

```
access_token: String
```