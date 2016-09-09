
angular.module('artApp', [])
    .controller('ArtPostController', function ($scope) {
        var artPost = this;
        artPost.art = (JSON.parse(localStorage.getItem("artPost.art") || '[]') || []).map(function (art) {
            return new Art(art.source, art.image, art.caption);
        });
        artPost.text = localStorage.getItem("artPost.text") || "Check out all of the absolutely amazing artwork on display tonight!";
        artPost.nextSource = "";
        artPost.outputHtml = function () {
            var $output = $("section.output").clone();
            $output.find('h3').remove();
            $output.contents().filter(function () { return this.nodeType == Node.COMMENT_NODE; }).remove();
            $output.find('*').contents().filter(function () { return this.nodeType == Node.COMMENT_NODE; }).remove();
            $output.children('div').first().after("<!--more-->");
            $output.find('*').removeAttr('class').removeAttr('ng-repeat').removeAttr('ng-if').removeAttr('ng-init').removeAttr('ng-bind').removeAttr('bcb-sizing');
            return $output.html().trim();
        }
        artPost.Rescan = function (i) {
            if (!artPost.art[i]) return;
            Art.findAt(artPost.art[i].source).then(function (art) {
                artPost.art[i] = art;
                $scope.$apply();
                Save();
            });
        }
        artPost.Add = function () {
            if (!artPost.nextSource) return;
            artPost.nextSource.split('\n').forEach(function (artSrc) {
                Art.findAt(artSrc).then(function (art) {
                    artPost.art.push(art);
                    $scope.$apply();
                    Save();
                });
            });    
            artPost.nextSource = '';
        }
        artPost.Remove = function (index) {
            artPost.art.splice(index, 1);
            Save();
        }
        artPost.Clear = function () {
            artPost.art = [];
        }
        function Save() {
            localStorage.setItem("artPost.art", JSON.stringify(artPost.art));
            localStorage.setItem("artPost.text", artPost.text);
        }
        DropLink(function (link) {
            artPost.nextSource = link;
            artPost.Add();
        });
    }).directive('bcbSizing', Art.bcbSizing);