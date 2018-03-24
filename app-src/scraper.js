var request = require('cloudscraper').get;
exports.scrape = function (url) {
    return new Promise(function (resolve, reject) {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200 && body) {
                resolve(body);
            }
            else {
                console.error(error);
                reject(response.statusCode + ": " + response.statusMessage);
            }
        })
    });
}