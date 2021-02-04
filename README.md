# Express PostgreSQL API
The Express PostgreSQL API is make a secure and reliable API use to Login, Registration and Verify USER.

## Getting started
### Requirements
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

For that first you need to create `Key` Folder in root

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

## Architecture

### Due credit

The real credit for this project goes to the great folks behind the following open source softwares and modules:

#### Softwares
- [PostgreSQL](https://www.postgresql.org/ "PostgreSQL")
- [OpenSSL](https://wiki.openssl.org/index.php/Binaries "OpenSSL")
- [Express](https://expressjs.com/ "Express")
- [JWT Token](https://jwt.io/ "JWT Token")

### How it works

The core of the project is [Express](https://expressjs.com/ "Express").

> Express.js, or simply Express, is a back end web application framework for Node.js, released as free and open-source software under the MIT License. It is designed for building web applications and APIs. It has been called the de facto standard server framework for Node.js.

All routes are stored in the `routes` folder and are automatically loaded on start. Check out the [routes readme](routes/README.md) for more information.

[OpenSSL](https://wiki.openssl.org/index.php/Binaries "OpenSSL") is used for the generation of private and public keys.

> OpenSSL is a software library for applications that secure communications over computer networks against eavesdropping or need to identify the party at the other end. It is widely used by Internet servers, including the majority of HTTPS websites.

OpenSSL is using to encrypt JWT Temporary Token. For generation of keys read documentation [Generating keys using OpenSSL](https://github.com/jsuyog2/express-postgresql-api#generating-keys-using-openssl "Generating keys using OpenSSL").

Data securely transmitting information using [JWT Token](https://jwt.io/ "JWT Token")

> JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed. JWTs can be signed using a secret (with the HMAC algorithm) or a public/private key pair using RSA or ECDSA.

Once the user is logged in, each subsequent request will include the JWT, allowing the user to access routes, services, and resources that are permitted with that token. JWT Token is secured using public/private key pairs.

#### Modules
- [pbkdf2-password](https://www.npmjs.com/package/pbkdf2-password "pbkdf2-password")
- [NODEMAILER](https://nodemailer.com/about/ "NODEMAILER")
- [request-ip](https://www.npmjs.com/package/request-ip "request-ip")

Password is secure and hashed using [pbkdf2-password](https://www.npmjs.com/package/pbkdf2-password "pbkdf2-password")

> Easy salt/password creation for Node.js.

Sends a mail to user for verification or change password using [NODEMAILER](https://nodemailer.com/about/ "NODEMAILER").

> Nodemailer is a module for Node.js applications to allow easy as cake email sending.

Retrieving IP address of user for encryption Login JWT Token using [request-ip](https://www.npmjs.com/package/request-ip "request-ip").

> A tiny Node.js module for retrieving a request's IP address.