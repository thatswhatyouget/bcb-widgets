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

angular.module('artApp', [])
    .controller('ArtPostController', function($scope) {
        var artPost = this;
        artPost.art = (JSON.parse(localStorage.getItem("artPost.art") || '[]') || []).map(function (art) {
            return new Art(art.source, art.image, art.caption);
        });
        artPost.text = localStorage.getItem("artPost.text") || "Check out all of the absolutely amazing artwork on display tonight!";
        artPost.nextSource = "";
        artPost.outputHtml = function() {
            var $output = $("section.output").clone();
            $output.find('h3').remove();
            $output.contents().filter(function() { return this.nodeType == Node.COMMENT_NODE; }).remove();
            $output.find('*').contents().filter(function() { return this.nodeType == Node.COMMENT_NODE; }).remove();
            $output.children('div').first().after("<!--more-->");
            $output.find('*').removeAttr('class').removeAttr('ng-repeat').removeAttr('ng-if').removeAttr('ng-init').removeAttr('ng-bind').removeAttr('bcb-sizing');
            return $output.html().trim();
        }
        artPost.Add = function() {
            if (!artPost.nextSource) return;
            scrape(artPost.nextSource).then(function(art) {
                artPost.art.push(art);
                $scope.$apply();
                Save();
            });
            artPost.nextSource = '';
        }
        artPost.Remove = function(index) {
            artPost.art.splice(index, 1);
            Save();
        }
        artPost.Clear = function() {
            artPost.art = [];
        }
        function Save() {
            localStorage.setItem("artPost.art", JSON.stringify(artPost.art));
            localStorage.setItem("artPost.text", artPost.text);
        }
    }).directive('bcbSizing', function() {
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
    });

function scrape(link) {
    var deferred = $.Deferred();
    $.ajax({
        url: "http://crossorigin.me/" + link,
        type: "GET",
        dataType: "text",
        timeout: 1000
    }).then(function(r) { return r; }, function(e) {
        return $.ajax({
            url: "http://cors.io/?u=" + link,
            type: "GET",
            dataType: "text",
            timeout: 1000
        });
    }).then(function(page) {
        var doc = document.implementation.createHTMLDocument(), image = [], caption = '';
        doc.documentElement.innerHTML = page;
        [].concat.apply([], doc.getElementsByTagName("meta")).forEach(function(meta) {
            switch (meta.getAttribute("property")) {
                case "og:image":
                    return image.push(meta.getAttribute("content"));
                case "og:description":
                    return caption = $('<div>').html(meta.getAttribute("content")).text();
            }
        });
        deferred.resolve(new Art(link, image, caption));
    }, function() {
        deferred.resolve(new Art(link));
    });
    setTimeout(function() { deferred.resolve(new Art(link)) }, 2000);
    return deferred.promise();
}