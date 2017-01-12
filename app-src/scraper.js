var http = require('http');
exports.scrape = function (url) {
    return new Promise(function (resolve, reject) {
        var urlParts = url.split('/').filter(p=>!!p);
        urlParts.shift(); //pop off protocol
        var options = {
            host: urlParts.shift(),
            port: 80,
            path: '/' + urlParts.join('/')
        };
        http.get(options, function (response) {
            var data = "";
            response.on('data', function (chunk) {
                data += chunk;
            });
            response.on('end', function () {
                if (data) resolve(data);
                else reject("Response was empty");
            });
        }).on('error', function (e) {
            reject(e.message);
        });
    });
}