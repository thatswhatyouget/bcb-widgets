function scrape(link) {
    if (typeof appScraper === "function") {
        return appScraper(link);
    }
    return $.ajax({
        url: "http://crossorigin.me/" + link,
        type: "GET",
        dataType: "text",
        timeout: 5000
    }).then(function (r) { return r; }, function (e) {
        return $.ajax({
            url: "http://cors.io/?u=" + link,
            type: "GET",
            dataType: "text",
            timeout: 5000
        });
    });
}

var appScraper = null;
try {
    appScraper = require('electron').remote.require('./scraper.js').scrape;
}
catch (e) { }