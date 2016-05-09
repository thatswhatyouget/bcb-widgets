function Category(name, color, selected) {
    this.name = name;
    this.color = color;
    this.selected = selected || false;
    this.cleanName = function () {
        return this.name.replace(/[^A-Z0-9]/ig, '');
    }
}

angular.module('fanficApp', [])
    .controller('FanficPostController', function ($scope) {
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
        fanficPost.selectedCategories = function () { return fanficPost.categories.filter(function (c) { return c.selected; }).length; };
        fanficPost.description = '';
        fanficPost.getDescription = function () {
            return fanficPost.description.replace('\n', '<br/>');
        }
        fanficPost.author = '';
        fanficPost.title = '';
        fanficPost.url = '';
        fanficPost.additionalTags = '';
        fanficPost.newArt = '';
        this.outputHtml = function () {
            var $output = $("section.output").clone();
            $output.find('h3').remove();
            $output.contents().filter(function () { return this.nodeType == Node.COMMENT_NODE; }).remove();
            $output.children().contents().filter(function () { return this.nodeType == Node.COMMENT_NODE; }).remove();
            $output.find('*').removeAttr('class').removeAttr('ng-repeat').removeAttr('ng-if').removeAttr('bcb-sizing');
            return $output.html().trim();
        }
        this.AddArt = function () {
            if (!fanficPost.newArt) return;
            Art.findAt(fanficPost.newArt).then(function (art) {
                fanficPost.art = art;
                $scope.$apply();
            });
            fanficPost.newArt = '';
        }
        this.AddFic = function () {
            if (!fanficPost.url) return;
            scrape(fanficPost.url).then(function (page) {
                var $page = $(page.replace(/src=/g, 'crs='));
                if (/archiveofourown\.org/i.test(fanficPost.url)) {
                    fanficPost.title = $page.find('.title.heading').text().trim();
                    fanficPost.author = $page.find('.byline.heading').text().trim();
                    fanficPost.description = $page.find('.summary.module blockquote').text().trim();
                }
                else if (/fanfiction\.net/i.test(fanficPost.url)) {
                    var $info = $page.find('#profile_top');
                    fanficPost.title = $info.children('b').first().text().trim();
                    fanficPost.author = $info.children('a').first().text().trim();
                    fanficPost.description = $info.children('div').last().text().trim();
                    fanficPost.art = fanficPost.art || new Art(fanficPost.url, 'https:' + $page.find('#img_large img').attr('data-original'), fanficPost.title);
                }
                $scope.$apply();
            });
        }
        DropLink(function (link) {
            if (/archiveofourown\.org/i.test(link) || /fanfiction\.net/i.test(link)) {
                fanficPost.url = link;
                fanficPost.AddFic();
            }
            else {
                fanficPost.newArt = link;
                fanficPost.AddArt();
            }
        });
    }).directive('bcbSizing', Art.bcbSizing);

function scrape(link) {
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