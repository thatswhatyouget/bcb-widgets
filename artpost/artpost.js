function Art(source, image, caption) {
    this.source = source;
    this.image = image;
    this.caption = caption;
}

angular.module('artApp', [])
    .controller('ArtPostController', function($scope) {
        var artPost = this;
        artPost.art = JSON.parse(localStorage.getItem("artPost.art") || '[]') || [];
        artPost.text = localStorage.getItem("artPost.text") || "Check out all of the absolutely amazing artwork on display tonight!";
        artPost.nextSource = "";
        artPost.outputHtml = function() {
            var $output = $("section.output").clone();
            $output.find('h3').remove();
            $output.contents().filter(function() { return this.nodeType == Node.COMMENT_NODE; }).remove();
            $output.children().contents().filter(function() { return this.nodeType == Node.COMMENT_NODE; }).remove();
            $output.children('div').first().after("<!--more-->");
            $output.find('*').removeAttr('class').removeAttr('ng-repeat').removeAttr('ng-if');
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