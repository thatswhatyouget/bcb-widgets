function Category(name, color, selected, tagName) {
    if (!tagName && typeof (selected) === "string") {
        tagName = selected;
        selected = false;
    }
    this.name = name;
    this.color = color;
    this.selected = selected || false;
    this.tagName = tagName || name;
    this.cleanName = function () {
        return this.name.replace(/[^A-Z0-9]/ig, '');
    }
}

function Character(name, color, selected) {
    return new Category(name, color || "inherit", selected);
}

angular.module('fanficApp', [])
    .controller('FanficPostController', function ($scope) {
        var fanficPost = this;
        fanficPost.art = null;
        fanficPost.categories = [
            new Category("Adventure", "#45818e"),
            new Category("Comedy", "#f1c232"),
            new Category("Crossover", "#3d85c6"),
            new Category("Dark", "#cc0000", "Grimdark"),
            new Category("Random", "#674ea7"),
            new Category("Sad", "magenta"),
            new Category("Shipping", "orange"),
            new Category("Slice of Life", "#6aa84f")
        ];
        fanficPost.selectedCategories = function () { return fanficPost.categories.filter(function (c) { return c.selected; }); };
        fanficPost.description = '';
        fanficPost.complete = false;
        fanficPost.getDescription = function () {
            return fanficPost.description.replace('\n', '<br/>');
        }
        fanficPost.characters = [
            Character("Garnet"),
            Character("Amethyst"),
            Character("Pearl"),
            Character("Steven"),
            Character("Connie"),
            Character("Greg"),
            Character("Ruby"),
            Character("Sapphire"),
            Character("Rose Quartz"),
            Character("Peridot"),
            Character("Lapis Lazuli"),
            Character("Jasper"),
            Character("Yellow Diamond"),
            Character("Blue Diamond"),
            Character("Yellow Pearl"),
            Character("Blue Pearl"),
        ]
        fanficPost.otherCharacters = '';
        fanficPost.getCharacters = function () {
            return [].concat.apply(
                fanficPost.characters.filter(function (c) { return c.selected; }).map(function (c) { return c.name; }),
                fanficPost.otherCharacters.split(',').map(function (c) { return c.trim(); })
            );
        }
        fanficPost.getTags = function () {
            return [].concat.apply(
                ["Story", fanficPost.author ? "Author: " + fanficPost.author : "", fanficPost.complete ? "Complete" : "Incomplete", fanficPost.additionalTags.toLowerCase().indexOf("alternate universe") >= 0 ? "Alternate Universe" : ""],
                [].concat.apply(fanficPost.selectedCategories().map(function (c) {
                    return c.tagName;
                }), fanficPost.getCharacters())
            ).filter(function (t) {
                return !!t;
            }).join(', ');
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
            $output.find('*').removeAttr('class').removeAttr('ng-repeat').removeAttr('ng-if').removeAttr('bcb-sizing').removeAttr('ng-bind');
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
                    $page.find('dd.character.tags ul li').each(function () {
                        var character = $(this).text().split('(').shift().trim().toLowerCase();
                        fanficPost.characters.forEach(function (c) {
                            c.selected = c.selected || character.indexOf(c.name.toLowerCase()) >= 0;
                        });
                    });
                    var chapters = $page.find('dd.chapters').text().split('/').map(function (c) { return parseInt(c.trim()); });
                    fanficPost.complete = chapters.shift() === chapters.shift();
                }
                else if (/fanfiction\.net/i.test(fanficPost.url)) {
                    var $info = $page.find('#profile_top');
                    var extraInfo = $info.find('.xgray').text();
                    fanficPost.title = $info.children('b').first().text().trim();
                    fanficPost.author = $info.children('a').first().text().trim();
                    fanficPost.description = $info.children('div').last().text().trim();
                    fanficPost.art = fanficPost.art || new Art(fanficPost.url, 'https:' + $page.find('#img_large img').attr('data-original'), fanficPost.title);
                    fanficPost.complete = /Status: Complete/ig.test(extraInfo);
                    var extraInfoCI = extraInfo.toLowerCase();
                    fanficPost.characters.forEach(function (c) {
                        c.selected = c.selected || extraInfoCI.indexOf(c.name.toLowerCase()) >= 0;
                    });
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