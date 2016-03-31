function Art(source, image, caption) {
    this.source = source;
    this.image = image;
    this.caption = caption;
}

function Category(name, color, selected) {
    this.name = name;
    this.color = color;
    this.selected = selected || false;
    this.cleanName = function() {
        return this.name.replace(/[^A-Z0-9]/ig, '');
    }
}

angular.module('fanficApp', [])
    .controller('FanficPostController', function($scope) {
        var fanficPost = this;
        fanficPost.art = null;
        fanficPost.categories = [
            new Category("Adventure", "#45818e"),
            new Category("Comedy", "#f1c232"),
            new Category("Crossover", "#3d85c6"),
            new Category("Dark", "#cc0000"),
            new Category("Random", "#674ea7"),
            new Category("Sad", "magenta"),
            new Category("Shipping", "orange"),
            new Category("Slice of Life", "#6aa84f")
        ];
        fanficPost.selectedCategories = function() { return fanficPost.categories.filter(function(c) { return c.selected; }).length; };
        fanficPost.description = '';
        fanficPost.getDescription = function() {
            return fanficPost.description.replace('\n', '<br/>');
        }
        fanficPost.author = '';
        fanficPost.title = '';
        fanficPost.url = '';
        fanficPost.additionalTags = '';
        fanficPost.newArt = '';
        this.outputHtml = function() {
            var $output = $("section.output").clone();
            $output.find('h3').remove();
            $output.contents().filter(function() { return this.nodeType == Node.COMMENT_NODE; }).remove();
            $output.children().contents().filter(function() { return this.nodeType == Node.COMMENT_NODE; }).remove();
            $output.find('*').removeAttr('class').removeAttr('ng-repeat').removeAttr('ng-if').removeAttr('bcb-sizing');
            return $output.html().trim();
        }
        this.AddArt = function() {
            if (!fanficPost.newArt) return;
            scrape(fanficPost.newArt).then(function(art) {
                fanficPost.art = art;
                $scope.$apply();
            });
            fanficPost.newArt = '';
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
        var doc = document.implementation.createHTMLDocument(), image = '', caption = '';
        doc.documentElement.innerHTML = page;
        [].concat.apply([], doc.getElementsByTagName("meta")).forEach(function(meta) {
            switch (meta.getAttribute("property")) {
                case "og:image":
                    return image = meta.getAttribute("content");
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