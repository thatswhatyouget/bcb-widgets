var ytReg = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;

function Song(url, $scope, $sce) {
    var me = this;
    me.url = url;
    me.title = '';
    me.type = '';
    me.freeType = '';
    me.getCat = function () {
        return me.type == "Other" ? me.freeType : me.type;
    }
    me.generateEmbed = function () {
        if (ytReg.test(url)) {
            me.embedHtml = $sce.trustAsHtml('<iframe allowfullscreen="" frameborder="0" height="400" src="' + 'https://www.youtube.com/embed/' + ytReg.exec(me.url)[7] + '" width="640"></iframe>');
        }
        else if (/soundcloud\.com/i.test(url)) {
            $.get('https://soundcloud.com/oembed?format=json&url=' + encodeURI(me.url)).then(function (data) {
                me.embedHtml = $sce.trustAsHtml(data.html);
                me.title = data.title;
                $scope.$apply();
            });
        }
    }
    me.generateEmbed();
}

angular.module('musicApp', [])
    .controller('MusicPostController', ['$scope', '$sce', function ($scope, $sce) {
        var musicPost = this;
        musicPost.art = null;
        musicPost.newArt = '';
        musicPost.text = '';
        musicPost.url = '';
        musicPost.songs = [];
        this.outputHtml = function () {
            var $output = $("section.output").clone();
            $output.find('h3').remove();
            $output.contents().filter(function () { return this.nodeType == Node.COMMENT_NODE; }).remove();
            $output.children().contents().filter(function () { return this.nodeType == Node.COMMENT_NODE; }).remove();
            $output.find('*').removeAttr('class').removeAttr('ng-repeat').removeAttr('ng-if').removeAttr('bcb-sizing').removeAttr('ng-bind-html').removeAttr('ng-bind');
            $output.find('hr').first().before("<!--more-->");
            return $output.html().trim();
        }
        this.AddArt = function () {
            if (!musicPost.newArt) return;
            Art.findAt(musicPost.newArt).then(function (art) {
                musicPost.art = art;
                $scope.$apply();
            });
            musicPost.newArt = '';
        }
        this.AddSong = function () {
            if (!musicPost.url) return;
            musicPost.songs.push(new Song(musicPost.url, $scope, $sce));
            musicPost.url = '';
        }
        this.RemoveSong = function (index) {
            musicPost.songs.splice(index, 1);
        }
        DropLink(function (link) {
            if (/soundcloud\.com/i.test(link) || ytReg.test(link)) {
                musicPost.url = link;
            }
            else {
                musicPost.newArt = link;
            }
            $scope.$apply();
        });
    }]).directive('bcbSizing', Art.bcbSizing);