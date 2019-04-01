function bcbCountdown(element, config, theme) {
    var themes = 12, pressed = [], unlocked = false;
    (function init() {
        try {
            theme = theme == "0" ? 0 : parseInt(theme || '') || -1;
            var event = (Array.isArray(config) ? config : config.split("\n")).map(function (line) {
                var parts = line.split('~');
                return { time: new Date(parts.pop()), title: parts.shift(), subtitle: parts.join('~') };
            }).filter(function (event) { return event.time.valueOf() > Date.now(); })[0];
            if (!event) return $(element).slideUp();
            var $timeLeft = $('<div>').addClass('timeLeft');
            if (theme < 0 || theme >= themes) theme = Math.floor(Math.random() * themes);
            $(element).addClass('bcbCountdown').append($('<div>').addClass('title').append($('<span>').text(event.title || "New Episode")))
                .append($('<div>').addClass('subtitle').append($('<span>').text(event.subtitle || "The Feels Awaken")))
                .append($timeLeft).addClass('theme' + theme);
            function updateTime() {
                var duration = (event.time.valueOf() - Date.now()) / 1000;
                if (duration < 0) {
                    clearInterval(interval);
                    $(element).find('.title, .subtitle, .timeLeft').hide();
                    return bcbCountdown(element, config);
                }
                var timeSpans = [{ i: 24, d: "Days" }, { i: 60, d: "Hours" }, { i: 60, d: "Minutes" }, { i: 1, d: "Seconds" }].map(function (num, base, segments) {
                    for (var d = duration, i = base; i < segments.length; i++) d /= segments[i].i;
                    if (base) d %= segments[base - 1].i;
                    return $("<span>").attr('data-label', num.d).html((d < 10 ? "0" : "") + Math.floor(d));
                });
                if ($timeLeft.find("span").length < timeSpans.length)
                    timeSpans.forEach(function (e, i) {
                        if (i) $timeLeft.append(":");
                        $timeLeft.append(e);
                    });
                else
                    $timeLeft.find("span").each(function (i) {
                        $(this).html($(timeSpans[i]).html());
                    });
            }
            updateTime();

            function squishToFit($span) {
                var fontSize = parseFloat($span.css('font-size'));
                if ($span.width() > $timeLeft.width()) {
                    fontSize *= .9;
                    $span.css({
                        'font-size': fontSize,
                        'vertical-align': 'top',
                    });
                    setTimeout(function () {
                        squishToFit($span);
                    }, 0);
                }
            }
            squishToFit($(element).find('.title span'));
            squishToFit($(element).find('.subtitle span'));

            var interval = setInterval(updateTime, 1000);

        }
        catch (e) {
            if (typeof (debug) !== "undefined" && debug) {
                console.error(e);
            }
        }
    })();

    $(window).keydown(function (e) {
        pressed.push(String.fromCharCode(e.which).toUpperCase());
        if (pressed.length > 5) pressed.shift();
        if (pressed.join('') == "SUGAR") unlocked = true;
        if (pressed.join('') == "RIDOT") sneaky(1);
        if (pressed.join('') == "BEARS") bears(1);
        if (pressed.join('').slice(1) == "OKKO") okko(1);
        if (pressed.join('') == "CREEK") creek(1);

        if (unlocked && [37, 39].indexOf(e.which) >= 0) {
            $(element).removeClass("theme" + theme);
            theme += e.which - 38;
            theme %= themes;
            while (theme < 0) theme += themes;
            $(element).addClass("theme" + theme);
        }
    });

    $('<a>').addClass('info').attr('title', "Inspired by Doafhat's countdown designs").attr('href', "https://doafhat.com/post/135588250298/all-the-edited-stevenbomb-4-countdowns-for-your").attr('target', '_blank').append($('<i>').addClass('fa fa-info-circle')).appendTo(element);

    var tkos = 0;
    function okko(skipNum) {
        if ((tkos += skipNum) >= 2)
            $(document.head).append("<link rel='stylesheet' href='//thatswhatyouget.github.io/bcb-widgets/eggs/okko.css'/>");
    }

    var numBears = 0;
    function bears(skipNum) {
        if ((numBears += skipNum) >= 3)
            $(document.head).append("<link rel='stylesheet' href='//thatswhatyouget.github.io/bcb-widgets/eggs/wbb.css'/>");
    }

    var gallons = 0;
    function creek(skipNum) {
        if ((gallons += skipNum) >= 3)
            $(document.head).append("<link rel='stylesheet' href='//thatswhatyouget.github.io/bcb-widgets/eggs/cotc.css'/>");
    }

    var peridinkles = 0;
    function sneaky(skipNum) {
        if ($('#nav-bar .peridot-egg, #nav-bar .peridot-peek').is('*')) return;
        if ((peridinkles += skipNum) < 3) return;
        peridinkles = 0;
        $('#nav-bar').addClass('egg');
        (function () {
            return $.when(
                (function () {
                    var d = $.Deferred();
                    $("<img>").attr('src', 'https://i.imgur.com/mN9KVNe.png').on('load', d.resolve);
                    return d;
                })(),
                (function () {
                    var d = $.Deferred();
                    $("<img>").attr('src', 'https://i.imgur.com/wvghkvg.png').on('load', d.resolve);
                    return d;
                })());
        })().then(function () {
            var $peek = $("<div class='peridot-peek'>").appendTo($("#nav-bar")).hide().slideDown(1000);
            function lookAway() {
                if ($(window).scrollTop() > 600) {
                    setTimeout(peridot, 0);
                    $peek.hide().remove();
                    $(window).unbind('scroll', lookAway);
                }
            }
            $(window).bind('scroll', lookAway);
        });
    }
    function peridot() {
        var $peridot = $('<div class="peridot-egg">').mousemove(function () {
            $peridot.unbind('mousemove');
            var i = 2;
            window.requestAnimationFrame = window.requestAnimationFrame || function (c) { setTimeout(c, 1000 / 60); };
            (function animate() {
                $peridot.css('background-position', '0 -' + Math.floor(i / 2) + "em");
                if (i / 2 == 4) $('html, body').animate({ scrollTop: $(document).height() }, $(document).height() / 10, "easeInCubic");
                if (i++ / 2 < 10) return requestAnimationFrame(animate);
                $peridot.fadeOut(function () { $peridot.remove(); });
            })();
        });
        $("#nav-bar").append($peridot);
    }
    jQuery.easing['easeInCubic'] = function (x, t, b, c, d) { return c * (t /= d) * t * t + b; };
    var d = new Date();
    if (d.getMonth() == 3 && d.getDate() == 1) {
        setTimeout(function () { sneaky(3); }, 60000 * Math.random());
    }
}
