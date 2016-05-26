angular.module('videoApp', [])
    .controller('VideoPostController', ['$scope', '$sce', function ($scope, $sce) {
        var videoPost = this;
        videoPost.text = '';
        videoPost.url = '';
        videoPost.thumbnailQuality = 'maxres';
        videoPost.getYoutubeId = function () {
            return /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/.exec(videoPost.url)[7]
        }
        videoPost.getEmbedUrl = function () {
            return $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + videoPost.getYoutubeId());
        }
        videoPost.getLinkUrl = function () {
            return $sce.trustAsUrl('https://youtu.be/' + videoPost.getYoutubeId());
        }
        videoPost.getThumbnailUrl = function () {
            return $sce.trustAsUrl('http://i3.ytimg.com/vi/' + videoPost.getYoutubeId() + '/');
        }
        videoPost.videoHeight = function () {
            return videoPost.thumbnailQuality == 'sd' ? 480 : 360;
        }
        this.outputHtml = function () {
            var $output = $("section.output").clone();
            $output.find('h3').remove();
            $output.contents().filter(function () { return this.nodeType == Node.COMMENT_NODE; }).remove();
            $output.children().contents().filter(function () { return this.nodeType == Node.COMMENT_NODE; }).remove();
            $output.find('*').removeAttr('class').removeAttr('ng-repeat').removeAttr('ng-if').removeAttr('bcb-sizing').removeAttr('ng-bind');
            $output.find('hr').first().before("<!--more-->");
            return $output.html().trim();
        }
        DropLink(function (link) {
            videoPost.url = link;
            $scope.$apply();
        });
    }]).directive('bcbSizing', Art.bcbSizing);