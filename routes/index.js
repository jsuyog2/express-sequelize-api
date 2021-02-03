const routes = require('express').Router();

createPostRoute('login');
createPostRoute('register');
createPostRoute('changepassword');
createPostRoute('forgotpassword');

createGetRoute('verify');
createGetRoute('reverify');
createGetRoute('userresponse');

routes.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome To API'
    });
});

module.exports = routes;

function createPostRoute(path) {
    var getPath = require('./' + path);
    routes.route('/' + path).post(getPath[path]);
}
function createGetRoute(path) {
    var getPath = require('./' + path);
    routes.route('/' + path).get(getPath[path]);
}
