function Art(source, image, caption) {
    var me = this;
    me.source = source;
    me.image = Array.isArray(image) ? image : [image];
    me.caption = caption;
    me.addImage = function () {
        me.image.push('');
    }
    me.removeImage = function (index) {
        if (index) me.image.splice(index, 1);
    }
    me.imageLetter = function (index) {
        if (me.image.length < 2) return '';
        return String.fromCharCode('a'.charCodeAt(0) + index);
    }
    if (!me.image.length) me.addImage();
}

Art.findAt = function (link) {
    var deferred = $.Deferred();
    function manualScrape() {
        //manually try to scrape open graph tags
        scrape(link).then(function (page) {
            var doc = document.implementation.createHTMLDocument(), image = [], caption = '';
            doc.documentElement.innerHTML = page;
            //console.log(page);
            var ogImageFound = false;
            [].concat.apply([], doc.getElementsByTagName("meta")).forEach(function (meta) {
                //console.log(meta);
                switch (meta.getAttribute("property") || meta.getAttribute("name")) {
                    case "og:image": //primary image source
                        if (!ogImageFound) image = [];
                        ogImageFound = true;
                        return image.push(meta.getAttribute("content"));
                    case "twitter:image": //fallback image source
                        if (ogImageFound) return;
                        return image.push(meta.getAttribute("content"));    
                    case "og:description":
                    case "description":
                    case "twitter:description":
                        return caption = $('<div>').html(meta.getAttribute("content")).text().trim();
                }
            });
            deferred.resolve(new Art(link, image, caption));
        }, function () {
            deferred.resolve(new Art(link));
        });
    }
    //get open graph tags
    if (typeof appScraper === "function") {
        manualScrape();
    }
    else {
        $.ajax({
            url: "http://opengraph.io/api/1.0/site/" + encodeURI(link),
            type: "GET",
            dataType: "json",
            timeout: 1000
        }).then(function (data) {
            try {
                if (data.openGraph.error) throw new Error(data.openGraph.error);
                if (data.openGraph.type == "tumblr-feed:photoset") throw new Error("Photosets must be scraped manually to get all images");
                if (data.openGraph.site_name == "Twitter") throw new Error("Twitter might contain a photoset.");
                if (data.openGraph.site_name == "Imgur") { //replace thumbnail image with correct image(s) detected on page
                    var validImage = /i\.imgur\.com/;
                    data.openGraph.image = data.htmlInferred.images.filter(function (i) { return validImage.test(i) });
                }
                deferred.resolve(new Art(link, data.openGraph.image, data.openGraph.title || data.openGraph.description));
            }
            catch (e) {
                var fail = $.Deferred();
                fail.reject(e);
                return fail;
            }
        }).fail(manualScrape);
    }
    setTimeout(function () { deferred.resolve(new Art(link)) }, 2000);
    return deferred.promise();
}

Art.bcbSizing = function () {
    function link(scope, element, attrs) {
        var dimension = attrs.bcbSizing || 400;
        var force = attrs.bcbSizingForce;
        var $img = $(element);
        function fixImage() {
            var width = $img[0].naturalWidth || $img.width(), height = $img[0].naturaHeight || $img.height(), ratio = width / height;
            if (height < dimension && width < dimension && !force);
            else if (height > width) {
                height = dimension;
                width = height * ratio;
            }
            else {
                width = dimension;
                height = width / ratio;
            }
            $img.attr("width", Math.floor(width));
        }
        $img.on('load', fixImage);
        if ($img[0].complete) fixImage();
    }

    return {
        link: link
    };
}

function scrape(link) {
    if (typeof appScraper === "function") {
        return appScraper(link);
    }
    return $.ajax({
        url: "http://crossorigin.me/" + link,
        type: "GET",
        dataType: "text",
        timeout: 1000
    }).then(function (r) { return r; }, function (e) {
        return $.ajax({
            url: "http://cors.io/?u=" + link,
            type: "GET",
            dataType: "text",
            timeout: 1000
        });
    });
}

var appScraper = null;
try {
    appScraper = require('electron').remote.require('./scraper.js').scrape;
}
catch (e) { }
