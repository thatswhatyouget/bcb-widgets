function scrape(link) {
    if (typeof appScraper === "function") {
        if (/deviantart\.com/ig.test(link))
            return insecureDeviantArtScraper(link);
        return appScraper(link);
    }
    return $.ajax({
        url: "https://crossorigin.me/" + link,
        type: "GET",
        dataType: "text",
        timeout: 5000
    }).then(function (r) { return r; }, function (e) {
        return $.ajax({
            url: "https://cors.io/?u=" + link,
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

let $deviantFrameCollection;

function insecureDeviantArtScraper(link) {
    const $deferred = $.Deferred();
    $deviantFrameCollection = $deviantFrameCollection || $('<div>').appendTo(document.body).css({ position: "fixed", left: 0, top: 0, right: 0, height: 0, overflow: "visible" });
    const $deviantFrame = $('<iframe sandbox="">').attr('src', link).appendTo($deviantFrameCollection).css({ display: "inline-block", width: "100px", height: "100px" });
    function dumpFrame() {
        if ($deviantFrame.is(':visible')) {
            if (($deviantFrame.contents().find('body').attr('id') || '').indexOf('deviantART') >= 0) {
                const html = `<html>${$deviantFrame.contents().find("html").html()}</html>`;
                $deferred.resolve(html);
                hideFrame();
            }
        }    
    }
    function hideFrame() {
        if ($deviantFrame.is(':visible')) {
            $deviantFrame.hide();
            //$deviantFrame.attr('src', 'about:blank').on('load', () => $deviantFrame.hide());
        }    
    }
    for (let i = 1; i < 30; i++) {
        setTimeout(dumpFrame, i * 1000); //attempt to read from the iframe every second
    }
    setTimeout(() => {
        $deferred.reject("You took too long. Now your candy's gone.");
        hideFrame();  
    }, 30000);
    $deviantFrame.on('load', dumpFrame);
    return $deferred.promise();
}