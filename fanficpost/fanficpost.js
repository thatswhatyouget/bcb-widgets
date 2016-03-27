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
            $("section.output").find('img').each(function() {
                var $img = $(this), width = $img.width(), height = $img.height(), ratio = width / height;
                if (height > width) {
                    height = 400;
                    width = height / ratio;
                }
                else {
                    width = 400;
                    height = width * ratio;
                }
                $img.width(width).height(height);
            });                
            var $output = $("section.output").clone();
            $output.find('h3').remove();
            $output.contents().filter(function() { return this.nodeType == Node.COMMENT_NODE; }).remove();
            $output.children().contents().filter(function() { return this.nodeType == Node.COMMENT_NODE; }).remove();
            $output.find('*').removeAttr('class').removeAttr('ng-repeat').removeAttr('ng-if');
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
    });

var findDesc = /\<meta\s*property=\"og:description\"\s*content=\"(.*?)\"\s*\/\>/ig;
var findImg = /\<meta\s*property=\"og:image\"\s*content=\"(.*?)\"\s*\/\>/ig;

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
        page = page.replace(/\n/g, '');
        try {
            var image = findImg.exec(page)[1];
            var caption = $("<div>").html(findDesc.exec(page)[1]).text();
        } catch (e) {
            console.log(page);
        }
        deferred.resolve(new Art(link, image, caption));
    }, function() {
        deferred.resolve(new Art(link));
    });
    setTimeout(function() { deferred.resolve(new Art(link)) }, 2000);
    return deferred.promise();
}