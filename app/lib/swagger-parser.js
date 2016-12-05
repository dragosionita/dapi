Utils = require('./utils');
let dataJSON = undefined;

let utils = {
    searchRoute: function (url, callback) {
        let keys = Object.keys(dataJSON.paths);
        let foundPath = undefined;

        keys.forEach(route => {
            var cleanedRoute = url.replace(dataJSON.basePath, "");

            if (route === cleanedRoute) foundPath = dataJSON.paths[route];
        });

        callback(foundPath);
    }
};

let swaggerParser = {

    setData: function (data) {
        dataJSON = data;
    },

    parse: function (req, res) {
        // send url without get params
        console.log('Not Found in API, find in swagger ...'.debug);
        utils.searchRoute(req.path, (r) => {

            if (!r) {
                res.status(404);
                res.end();
            }

            if (r && r.hasOwnProperty(req.method.toLowerCase())) {
                let responses = r[req.method.toLowerCase()].responses;

                if (responses.hasOwnProperty('200')) {

                    if (responses['200'].hasOwnProperty('examples')) {
                        let examples200 = responses['200']['examples'];

                        // Basically 'keys' should have only an element which is the content-type
                        let keys = Object.keys(examples200);
                        let contentType = keys[0];

                        let data = examples200[contentType];

                        Utils.log(req.url, req.method, '200', true);
                        console.log(`${req.method} 200 | ${req.url}`.warn);

                        res.set('Content-Type', contentType);
                        res.status(200);

                        res.send(data);
                    } else {
                        console.log('Route exist, response 200 exist but no examples'.debug);
                        Utils.log(req.url, req.method, '404', true);
                        res.status(404);
                        res.end();
                    }

                } else {
                    Utils.log(req.url, req.method, '404', true);
                    res.status(404);
                    res.end();
                }
            } else {
                console.log('Route exist, but no method'.debug);
                Utils.log(req.url, req.method, '404', true);
                res.status(404);
                res.end();
            }
        });
    }
};

module.exports = swaggerParser;