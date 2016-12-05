var Express = require('express'),
    Cors = require('cors'),
    BodyParser = require('body-parser'),
    Request = require('request'),
    Config = require('../config'),
    Fs = require('fs'),
    App = Express(),
    YAML = require('yamljs'),
    FormData = require('form-data'),
    Utils = require('./lib/utils'),
    SwaggerParser = require('./lib/swagger-parser'),
    Colors = require('colors');

Colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

let defaultsCors = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: true,
    optionsSuccessStatus: 204
};


YAML.load(__dirname + '/../swagger.yaml', function(result) {
    if (result) {
        SwaggerParser.setData(result);
        console.log('> Swagger file was loaded ...'.info);
    } else {
        console.log('> Swagger file not found'.error);
    }
});


App.use(BodyParser.json());
App.set('view engine', 'jade');
App.set('views', __dirname + '/../views');
App.use('/static', Express.static('public'))

App.use(BodyParser.urlencoded({
    extended: true
}));

App.use(Cors(defaultsCors));

App.get('/dapilive', function (req, res, next) {

    let uptime = Utils.getUptime();
    let logs = Utils.getLogs();
    let serverInfo = Utils.getServerInfo();

    res.send({'uptime': uptime, 'logs': logs, 'server_info': serverInfo});
});

App.get('/dapiconf', function(req, res, next) {
    Fs.readFile(__dirname + '/../swagger.yaml', 'utf8', function (err, data) {
        if (err) {
            res.render('config');
            return console.log(err);
        }
        res.render('config', {swaggerFile: data});
    });
});

const multiparty = require('multiparty');

App.use(function (req, res, next) {

    let method = req.method;
    let payload = req.body;

    let api = Config.api.domain + req.url;
    res.setHeader('X-Powered-By', 'dAPI');

    let requestOptions = {
        method: 'GET',
        uri: api,
        headers: {}
    };

    if (req.get('authorization')) requestOptions.headers['Authorization'] = req.get('authorization');

    if (Config.api.auth.overwrite_authentication === true) {
        requestOptions.auth = {};
        requestOptions.auth[Config.api.auth.type] = Config.api.auth.token;
    }

    if (method == 'POST') {
        requestOptions.method = 'POST';
        requestOptions.json = true;
    } else if (method == 'PUT') {
        requestOptions.method = 'PUT';
        requestOptions.json = true;
    } else if (method == 'PATCH') {
        requestOptions.method = 'PATCH';
        requestOptions.json = true;
    }


    let requestCallback = function (error, response, body) {
        if (error) {
            console.log(`Request error: ${error}`.error);
            res.json({'error': error, 'body': body, 'response': response});
        } else {


            res.header('Content-Type', response.headers['content-type']);
            res.header('Access-Control-Allow-Origin', req.get('origin'));
            res.header('Access-Control-Allow-Credentials', true);

            if (response.statusCode == 404) {
                if (method == 'OPTIONS') {
                    res.status(204);
                    res.end();
                } else {
                    SwaggerParser.parse(req, res);
                }
            } else {
                if (method == 'OPTIONS') {
                    res.status(204);
                    res.end();
                } else {
                    console.log(`${method} ${response.statusCode} | ${req.url}`.input);
                    Utils.log(req.url, req.method, response.statusCode, false);

                    res.status(response.statusCode);
                    res.send(body);
                }
            }
        }
    };


    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {

        let form = new multiparty.Form();
        let formData = new FormData();

        form.on("part", part => {

            if (part.filename) {
                formData.append("file[]", part, {
                    filename: part.filename,
                    contentType: part.headers["content-type"],
                    knownLength: part.byteCount
                });
            }
        });

        form.on('close', function() {
            //console.log('Form Close');
        });

        form.on("progress", (bReceived, bExpected) => {
            //console.log('Progress: ', bReceived + "--" + bExpected);
            if (bReceived === bExpected) {
                console.log('All files are uploaded.'.info);

                let R = Request(requestOptions, requestCallback);
                R._form = formData;
            }
        });

        form.on("error", err => {
            console.log(`Multiplart error: ${err}`.error);
        });


        if (req.get('content-type').search("form-data") != -1) {
            form.parse(req);
        } else {
            requestOptions.body = payload;
            Request(requestOptions, requestCallback);
        }


    } else {
        Request(requestOptions, requestCallback);
    }

});

App.listen(Config.server.port, function() {
    console.log('dAPI'.bold.red);
    console.log(`> Started on localhost:${Config.server.port}`.info);
});