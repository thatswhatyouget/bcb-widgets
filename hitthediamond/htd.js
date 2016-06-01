function HitTheDiamond(selector) {
    var $game = $(selector).addClass('bcb-hit-the-diamond').attr('data-useragent', navigator.userAgent);

    var stars = 10;

    var score = 0, highscore = parseInt(window.localStorage.getItem('htd-highscore') || '0'), fails = 0;

    var audible = false, currentSecond = 0, audio = $("<audio preload='auto'>").append([
        { src: "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/snd/gems.ogg", type: "audio/ogg" },
        { src: "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/snd/gems.mp4", type: "audio/mp4" },
        { src: "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/snd/gems.mp3", type: "audio/mp3" }
    ].map(function (snd) {
        return $("<source>").attr(snd);
    })).on('timeupdate', function () {
        if (Math.floor(audio.currentTime) > Math.floor(currentSecond)) {
            audio.pause();
        }
    }).on('canplaythrough', function () {
        if ($game.find('.muteButton').is('*')) return;
        audible = window.localStorage.getItem("htd-muted") == "unmuted";
        $game.toggleClass('unmuted', audible);
        $("<div class='muteButton'>").click(function () {
            audible = !audible;
            $game.toggleClass('unmuted', audible);
            window.localStorage.setItem("htd-muted", audible ? "unmuted" : "muted");
        }).appendTo($game);
    }).appendTo($game).get()[0];

    function playSound(soundIndex) {
        setTimeout(function () {
            try {
                if (audio && audible) {
                    currentSecond = audio.currentTime = soundIndex * 2;
                    if (currentSecond > 0) audio.currentTime -= .05;
                    setTimeout(function () { audio.play() }, 10);
                }
            }
            catch (e) {
                console.error(e);
            }
        }, 10);
    }

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

    function Gem(name, score, img, hitImg, soundIndex) {
        img = img || score;
        score = parseInt(score) || 0;
        var safename = name.replace(/[^A-Z0-9]/ig, '');
        this.name = name;
        this.img = img;
        this.hitImg = hitImg || img;
        this.score = score;
        this.toString = function () { return safename; };
        this.hits = 0;
        this.playSound = function () {
            return playSound(soundIndex || 0);
        }
    }
    var gems = [
        new Gem('Yellow Diamond', 11, "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/yellow-diamond.png", "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/yellow-diamond-hit.png", 7),
        new Gem('Jasper', 7, "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/jasper.png", "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/jasper-hit.png", 2),
        new Gem('Yellow Pearl', 5, "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/yellow-pearl.png", "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/yellow-pearl-hit.png", 8),
        new Gem('Mad-Eye Ruby', 3, "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/mad-eye.png", "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/mad-eye-hit.png", 6),
        new Gem('Garnet', 0, "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/garnet.png", "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/garnet.png", 1),
        new Gem('Amethyst', 0, "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/amethyst.png", "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/amethyst-hit.png", 0),
        new Gem('Pearl', 0, "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/pearl.png", "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/pearl-hit.png", 4),
        new Gem('Peridot', 0, "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/peridot.png", "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/peridot-hit.png", 5),
        new Gem('Lapis Lazuli', 0, "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/lapis.png", "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gems/lapis-hit.png", 3),
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
            $dialog.addClass('offscreen');
            setTimeout(function () { $dialog.hide().remove(); }, 1000);
        });
        $game.append($dialog);
        $dialog.addClass('offscreen').css('opacity');
        setTimeout(function () { $dialog.removeClass('offscreen'); }, 10);
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
                        gem.playSound();
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
        $game.addClass("running").find('.gems').addClass('init').find('.gem').removeClass('popped hit');
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
                $pop.parents('.gems').removeClass('init').find('.gem').removeClass('popped');
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

    var introtext = "The Roaming Eyes have landed! Nobody knows what lurks inside, but the Crystal Gems have gone in to investigate. Your mission: without endangering the Crystal Gems, keep whatever gems that arrived inside the Roaming Eyes from escaping. That's right, it's time to <i>Hit The Diamond!</i>";
    var instructions = $("<span>").text("Gems will pop out of the doors. If they're not Garnet, Amethyst, Pearl, Peridot, or Lapis Lazuli, click on them to knock them back down. If you hit a Crystal Gem, it'll cost you a star. The game ends when all the stars are gone. Good luck!");
    instructions.append($("<ul class='instructions'>").append(gems.filter(function (g) { return g.score > 0 }).sort(function (a, b) { return b.score - a.score; }).map(gemIconMaker())));
    var gameovertext = "You scored %S points. %H Here's the damage:";
    var credits = $("<span>").text("Credits").append($("<ul>").addClass("credits").append([
        { credit: "Design, Programming", by: "Dave", link: "http://www.beachcitybugle.com/" },
        { credit: "Art, Sound", by: "Steven Universe", link: "http://www.cartoonnetwork.com/video/steven-universe/" },
        { credit: "Testing", by: "Emerald", link: "https://twitter.com/gaygemgoddess" },
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
    })).concat("https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/eyepod.png", "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/eyepod-fore.png", "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/hammerdot.png", "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/hammerdown.png", "https://thatswhatyouget.github.io/bcb-widgets/hitthediamond/img/gameover.png").map(function (img) {
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
        var text = $('<span>').text(gameovertext.replace('%S', score).replace('%H', highscore == score ? "That's a new personal record!" : score < 1 ? "Traitor!" : score < 100 ? "Thanks for playing." : "Nice work!"))
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

//quick shims for oldnbusted browsers
Array.prototype.map = Array.prototype.map || function (func) {
    var output = [];
    for (var i = 0; i < this.length; i++) {
        output.push(func(this[i], i, this));
    }
    return output;
};
Array.prototype.filter = Array.prototype.filter || function (func) {
    var output = [];
    for (var i = 0; i < this.length; i++) {
        if (func(this[i], i, this))
            output.push(this[i]);
    }
    return output;
};
Array.prototype.forEach = Array.prototype.forEach || function (func) {
    this.map(func);
};
Array.prototype.sort = Array.prototype.sort || function () { return this; };