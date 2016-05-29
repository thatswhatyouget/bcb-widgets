function HitTheDiamond(selector) {
    var $game = $(selector).addClass('bcb-hit-the-diamond');

    var score = 0, highscore = parseInt(window.localStorage.getItem('htd-highscore') || '0');
    
    function addScore(points) {
        score += points;
        if (score > highscore) {
            highscore = score;
            window.localStorage.setItem("htd-highscore", highscore);
        }
        $game.attr('data-highscore', highscore).attr('data-score', score)
    }

    addScore(0);

    $game.mousedown(function () {
        $game.css('cursor', 'cell');
    }).mouseup(function () {
        $game.css('cursor', 'crosshair');
    }).mouseleave(function () {
        $game.mouseup();
    }).contextmenu(function (e) {
        e.preventDefault();
    }).mouseup();

    function Gem(name, score, img) {
        img = img || score;
        score = parseInt(score) || -5;
        var safename = name.replace(/[^A-Z0-9]/ig, '');
        this.name = name;
        this.img = img;
        this.hitImg = img;
        this.score = score;
        this.toString = function () { return safename; };
    }
    var gems = [
        new Gem('Yellow Diamond', 20, "https://vignette2.wikia.nocookie.net/steven-universe/images/9/90/Yellow_Diamond_by_Lenhi.png/revision/latest"),
        new Gem('Jasper', 16, "https://vignette3.wikia.nocookie.net/steven-universe/images/9/96/Jasper_Regular.png/revision/latest"),
        new Gem('Mad-Eye Ruby', 11, "hitthediamond/img/gems/mad-eye.png"),
        new Gem('Garnet', "http://vignette1.wikia.nocookie.net/steven-universe/images/1/16/GarnetByKmes.png/revision/latest"),
        new Gem('Pearl', "http://vignette2.wikia.nocookie.net/p__/images/7/75/Pearl_New.png/revision/latest?cb=20150109194724&path-prefix=protagonist"),
        new Gem('Amethyst', "http://vignette4.wikia.nocookie.net/stevenuniverse-fanon/images/3/36/Amethyst_(Debut).png/revision/latest"),
        new Gem('Peridot', "https://vignette1.wikia.nocookie.net/steven-universe/images/0/03/Smol_Peridot_by_Lenhi.png/revision/latest"),
        new Gem('Lapis Lazuli', "http://vignette2.wikia.nocookie.net/villains/images/6/6c/Lapis(1).png/revision/latest")
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

    function StartGame() {
        $game.addClass("running");
        for (var i = 0; i < 9; i++) {
            var $eyepod = $("<div class='eyepod'>"), $gems = $('<div class="gems">').appendTo($eyepod);
            gems.forEach(function (gem) {
                var $pod = $gems
                setTimeout(function () {
                    $pod.append($("<div class='gem'>").addClass(gem.toString()).mousedown(function () {
                        if ($(this).is(".hit")) return;
                        $(this).removeClass('popped').addClass('.hit');
                        addScore(gem.score);
                    }).append($("<img>").attr('src', gem.img)).append($("<img>").attr('src', gem.hitImg)));
                }, 1);
            });
            $game.append($eyepod);
        }
        setTimeout(function () { pop(1000); }, 10);
    }

    var popnums = [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4];

    function pop(interval) {
        var popnum = rando(popnums), popgems = [];
        for (var i = 0; i < popnum; i++) {
            do {
                var currentGem = rando(gems);
            } while (popgems.indexOf(currentGem) >= 0);
            popgems.push(currentGem);
        }
        if (!popgems.length) {
            $(rando($('.gem.popped'))).removeClass('popped');
        }
        else {
            popgems.forEach(function (gem) {
                var $pop = $(rando($('.gem.' + gem.toString()).removeClass('popped')));
                $pop.parents('.gems').find('.gem').removeClass('popped');
                $pop.addClass('popped').removeClass('hit');
            });
        }
        interval = interval > 100 ? interval - 5 : interval;
        setTimeout(function () { pop(interval); }, interval);
    }    

    var introtext = "The Roaming Eyes have landed! We don't know what gems are in there. It could be anybody! The Crystal Gems, including Peridot and Lapis, are ok with us. But if a Homeworld Gem or even Yellow Diamond herself shows up, smack them back down as hard as you can!";
    var instructions = $("<span>").html("Gems will pop out of the pods. If they're hostile, click them to whack them.");
    instructions.append($("<ul>").append(gems.map(function (gem) {
        return $('<li>').text(gem.name + ": " + gem.score + " points");
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

    Dialog(introtext, "Start Game", "Instructions", preLoad).then(function (s) {
        return s;
    }, function (f) {
        return Dialog(instructions, "Start Game", preLoad);
    }).then(StartGame);

}