function HitTheDiamond(selector) {
    var $game = $(selector).addClass('bcb-hit-the-diamond');

    var stars = 10;

    var score = 0, highscore = parseInt(window.localStorage.getItem('htd-highscore') || '0'), fails = 0;

    function addScore(points) {
        score += points;
        $game.attr('data-score', score);
        if (score < 0) GameOver();
    }

    function addFail() {
        fails++;
        $game.find('.stars span:not(.used)').first().addClass('used');
        if (fails > stars) GameOver();
    }

    $game.mousedown(function () {
        $game.addClass('mouseDown');
    }).mouseup(function () {
        $game.removeClass('mouseDown');
    }).mouseleave(function () {
        $game.mouseup();
    }).contextmenu(function (e) {
        e.preventDefault();
    });

    function Gem(name, score, img, hitImg) {
        img = img || score;
        score = parseInt(score) || 0;
        var safename = name.replace(/[^A-Z0-9]/ig, '');
        this.name = name;
        this.img = img;
        this.hitImg = hitImg || img;
        this.score = score;
        this.toString = function () { return safename; };
        this.hits = 0;
    }
    var gems = [
        new Gem('Yellow Diamond', 11, "hitthediamond/img/gems/yellow-diamond.png", "hitthediamond/img/gems/yellow-diamond-hit.png"),
        new Gem('Jasper', 7, "hitthediamond/img/gems/jasper.png", "hitthediamond/img/gems/jasper-hit.png"),
        new Gem('Yellow Pearl', 5, "hitthediamond/img/gems/yellow-pearl.png", "hitthediamond/img/gems/yellow-pearl-hit.png"),
        new Gem('Mad-Eye Ruby', 3, "hitthediamond/img/gems/mad-eye.png", "hitthediamond/img/gems/mad-eye-hit.png"),
        new Gem('Garnet', 0, "hitthediamond/img/gems/garnet.png", "hitthediamond/img/gems/garnet.png"),
        new Gem('Pearl', 0, "hitthediamond/img/gems/pearl.png", "hitthediamond/img/gems/pearl-hit.png"),
        new Gem('Amethyst', 0, "hitthediamond/img/gems/amethyst.png", "hitthediamond/img/gems/amethyst-hit.png"),
        new Gem('Peridot', 0, "hitthediamond/img/gems/peridot.png", "hitthediamond/img/gems/peridot-hit.png"),
        new Gem('Lapis Lazuli', 0, "hitthediamond/img/gems/lapis.png", "hitthediamond/img/gems/lapis-hit.png"),
    ];

    function Dialog(text, yesText, noText, waitForPromise) {
        if (noText && noText.then) {
            waitForPromise = noText;
            noText = null;
        }
        waitForPromise = waitForPromise || $.when(true);
        var deferred = $.Deferred(), $dialog = $('<div class="dialog">');
        $dialog.append($('<div>').html(text));
        if (yesText) {
            var $loading = $('<button type="button">').addClass("loading").append($("<i class='fa fa-spinner fa-spin'>")).append($("<span>").text("Loading..."));
            $dialog.append($loading);
            waitForPromise.then(function () {
                $loading.replaceWith($('<button type="button">').addClass("yes").html(yesText).click(function () {
                    deferred.resolve(yesText);
                }));
            });
        }
        if (noText) {
            $dialog.append($('<button type="button">').addClass("no").html(noText).click(function () {
                deferred.reject(noText);
            }));
        }
        var promise = deferred.promise();
        promise.always(function () {
            $dialog.hide().remove();
        });
        $game.append($dialog);
        return promise;
    }

    function rando(a) {
        return a[Math.floor(Math.random() * a.length)];
    }

    function Setup() {
        if (!$game.find('.stars').is('*')) {
            var $stars = $('<div class="stars">').appendTo($game);
            for (var i = 0; i < stars; i++) {
                $stars.append('<span>');
            }
        }
        if ($game.find('.eyepod').is('*')) return $.when(true);
        var eyepods = [];
        for (var i = 0; i < 9; i++) {
            eyepods.push($('<div class="gems">').appendTo($("<div class='eyepod'>").appendTo($game)));
        }
        return $.when.apply($, eyepods.map(function ($pod) {
            return $.when.apply($, gems.map(function (gem) {
                var deferred = $.Deferred();
                setTimeout(function () {
                    $pod.append($("<div class='gem'>").addClass(gem.toString()).mousedown(function () {
                        if ($(this).is(".hit")) return;
                        $(this).removeClass('popped').addClass('hit');
                        gem.hits++;
                        if (gem.score > 0) addScore(gem.score);
                        else addFail();
                    }).append($("<img>").attr('src', gem.img)).append($("<img>").attr('src', gem.hitImg)));
                    deferred.resolve();
                }, 1);
                return deferred.promise();
            }));
        }));
    }

    function StartGame() {
        addScore(score = 0);
        fails = 0;
        gems.forEach(function (gem) { gem.hits = 0; });
        $game.addClass("running").find('.gem').removeClass('popped hit');
        $game.find('.stars .used').removeClass('used');
        setTimeout(function () { pop(1500); }, 1000);
    }

    var popnums = [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4];

    function pop(interval) {
        if (!$game.is('.running')) return;
        var popnum = rando(popnums), popgems = [];
        for (var i = 0; i < popnum; i++) {
            do {
                var currentGem = rando(gems);
            } while (popgems.indexOf(currentGem) >= 0);
            popgems.push(currentGem);
        }
        if (!popgems.length) {
            $(rando($game.find('.gem.popped'))).removeClass('popped');
        }
        else {
            popgems.forEach(function (gem) {
                var $pop = $(rando($game.find('.gem.' + gem.toString()).removeClass('popped')));
                $pop.parents('.gems').find('.gem').removeClass('popped');
                $pop.addClass('popped').removeClass('hit');
            });
        }
        interval = interval > 100 ? interval - 5 : interval;
        setTimeout(function () { pop(interval); }, interval);
    }

    function gemIconMaker(imgProp, infoFunc) {
        imgProp = imgProp || "img";
        infoFunc = infoFunc || function (gem) { return gem.score + " points"; };
        return function (gem) {
            return $('<li>').append($('<div class="icon">').addClass(gem.toString()).addClass(imgProp).css('background-image', 'url("' + (gem[imgProp] || gem.img) + '")')).append($('<div>').text(gem.name)).append($('<div>').text(infoFunc(gem)));
        }
    }

    var introtext = "The Roaming Eyes have landed! Nobody knows what lurks inside, but the Crystal Gems have gone in to investigate. Your mission: without endangering the Crystal Gems, keep whatever gems that arrived inside the Roaming Eyes from escaping! That's right, it's time to <i>Hit The Diamond!</i>";
    var instructions = $("<span>").text("Gems will pop out of the doors. If they're not Garnet, Amethyst, Pearl, Peridot, or Lapis Lazuli, click on them to knock them back down. If you hit a Crystal Gem, it'll cost you a star. The game ends when all the stars are gone. Good luck!");
    instructions.append($("<ul class='instructions'>").append(gems.filter(function (g) { return g.score > 0 }).sort(function (a, b) { return b.score - a.score; }).map(gemIconMaker())));
    var gameovertext = "You scored %S points. %H Here's the damage:";
    var credits = $("<span>").text("Credits").append($("<ul>").addClass("credits").append([
        { credit: "Design, Programming", by: "Dave", link: "http://www.beachcitybugle.com/" },
        { credit: "Art", by: "Steven Universe", link: "http://www.cartoonnetwork.com/video/steven-universe/" },
        { credit: "Crewniverse Font", by: "MaxiGamer", link: "http://fav.me/d8xkpe8" },
        { credit: "Yellow Pearl Vector", by: "Deco-kun", link: "http://steven-universe.wikia.com/wiki/User:Deco-kun" },
        { credit: "Special Thanks", by: "Steven Universe Wiki", link: "http://steven-universe.wikia.com/" }
    ].map(function (c) {
        return $("<li>").append($("<span>").text(c.credit)).append($(c.link ? "<a target='_blank' href='" + c.link + "'>" : "<span>").text(c.by));
    })));

    var preLoad = $.when.apply($, [].concat.apply(gems.map(function (gem) {
        return gem.img;
    }), gems.map(function (gem) {
        return gem.hitImg;
    })).concat("hitthediamond/img/eyepod.png", "hitthediamond/img/eyepod-fore.png").map(function (img) {
        var deferred = $.Deferred();
        $('<img>').on('load', function () { deferred.resolve(); }).attr('src', img);
        return deferred.promise();
    }));

    function GameOver() {
        if (score > highscore) {
            highscore = score;
            window.localStorage.setItem("htd-highscore", highscore);
        }
        $game.addClass('over').removeClass('running').find('.gem').removeClass('popped');
        var text = $('<span>').text(gameovertext.replace('%S', score).replace('%H', highscore == score ? "That's a new personal record!" : "Nice work."))
            .append($('<ul class="instructions">').append(gems.filter(function (g) {
                return g.hits > 0;
            }).sort(function (a, b) {
                return b.hits - a.hits;
            }).map(gemIconMaker("hitImg", function (gem) {
                return gem.hits + " hit" + (gem.hits > 1 ? "s" : "");
            }))));
        Dialog(text, "Play Again", "Credits").then(function (s) { return s; }, function (f) {
            return Dialog(credits, "Play Again");
        }).then(Intro);
    }

    function Intro() {
        $game.removeClass('over').attr('data-highscore', highscore);
        Dialog(introtext, "Start Game", "Instructions", preLoad).then(function (s) { return s; }, function (f) {
            return Dialog(instructions, "Start Game", preLoad);
        }).then(Setup).then(StartGame);
    }

    if (typeof (requestAnimationFrame) === "function") {
        Intro();
    }
    else {
        Dialog("Sorry, it looks like this game might not support your web browser. If at all possible, please consider <a href='https://browser-update.org/update.html' target='_blank'>updating</a> your browser.", "Try to Play Anyway", "Dismiss").then(Intro);
    }
}