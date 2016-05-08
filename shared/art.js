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
}

Art.findAt = function (link) {
    var deferred = $.Deferred();
    //get open graph tags
    $.ajax({
        url: "http://opengraph.io/api/1.0/site/" + encodeURI(link),
        type: "GET",
        dataType: "json",
        timeout: 1000
    }).then(function (data) {
        if (data.openGraph.type == "tumblr-feed:photoset") throw new Error("Photosets must be scraped manually to get all images");
        deferred.resolve(new Art(link, data.openGraph.image, data.openGraph.title || data.openGraph.description));
    }).fail(function () {
        //manually try to scrape open graph tags
        $.ajax({
            url: "http://crossorigin.me/" + encodeURI(link),
            type: "GET",
            dataType: "text",
            timeout: 1000
        }).then(function (r) { return r; }, function (e) {
            return $.ajax({
                url: "http://cors.io/?u=" + encodeURI(link),
                type: "GET",
                dataType: "text",
                timeout: 1000
            });
        }).then(function (page) {
            var doc = document.implementation.createHTMLDocument(), image = [], caption = '';
            doc.documentElement.innerHTML = page;
            [].concat.apply([], doc.getElementsByTagName("meta")).forEach(function (meta) {
                switch (meta.getAttribute("property")) {
                    case "og:image":
                        return image.push(meta.getAttribute("content"));
                    case "og:description":
                        return caption = $('<div>').html(meta.getAttribute("content")).text();
                }
            });
            deferred.resolve(new Art(link, image, caption));
        }, function () {
            deferred.resolve(new Art(link));
        });
    });
    setTimeout(function () { deferred.resolve(new Art(link)) }, 2000);
    return deferred.promise();
}