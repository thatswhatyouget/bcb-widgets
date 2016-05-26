function bcbCountdown(element, config, theme) {
    var themes = 12;
    try {
        theme = theme == "0" ? 0 : parseInt(theme || '') || -1;
        var event = (Array.isArray(config) ? config : config.split("\n")).map(function(line) {
            var parts = line.split('~');
            return { time: new Date(parts.pop()), title: parts.shift(), subtitle: parts.join('~') };
        }).filter(function(event) { return event.time.valueOf() > Date.now(); })[0];
        if (!event) return $(element).slideUp();
        var $timeLeft = $('<div>').addClass('timeLeft');
        if (theme < 0 || theme >= themes) theme = Math.floor(Math.random() * themes);
        $(element).addClass('bcbCountdown').append($('<div>').addClass('title').text(event.title || "New Episode"))
            .append($('<div>').addClass('subtitle').text(event.subtitle || "The Feels Awaken"))
            .append($timeLeft).addClass('theme' + theme);
        function updateTime() {
            var duration = (event.time.valueOf() - Date.now()) / 1000;
            if (duration < 0) {
                clearInterval(interval);
                $(element).find('.title, .subtitle, .timeLeft').hide();
                return bcbCountdown(element, config);
            }
            var timeSpans = [{ i: 24, d: "Days" }, { i: 60, d: "Hours" }, { i: 60, d: "Minutes" }, { i: 1, d: "Seconds" }].map(function(num, base, segments) {
                for (var d = duration, i = base; i < segments.length; i++) d /= segments[i].i;
                if (base) d %= segments[base - 1].i;
                return $("<span>").attr('data-label', num.d).html((d < 10 ? "0" : "") + Math.floor(d));
            });
            if ($timeLeft.find("span").length < timeSpans.length)
                timeSpans.forEach(function(e, i) {
                    if (i) $timeLeft.append(":");
                    $timeLeft.append(e);
                });
            else
                $timeLeft.find("span").each(function(i) {
                    $(this).html($(timeSpans[i]).html());
                });
        }
        updateTime();
        var interval = setInterval(updateTime, 1000), pressed = [], unlocked = false;
        $(window).keydown(function(e) {
            pressed.push(String.fromCharCode(e.which).toUpperCase());
            if (pressed.length > 5) pressed.shift();
            if (pressed.join('') == "SUGAR") unlocked = true;
            if (pressed.join('') == "RIDOT") sneaky();
            if (unlocked && [37, 39].indexOf(e.which) >= 0) {
                $(element).removeClass("theme" + theme);
                theme += e.which - 38;
                theme %= themes;
                while (theme < 0) theme += themes;
                $(element).addClass("theme" + theme);
            }
        });
    }
    catch (e) {
        if (typeof (debug) !== "undefined" && debug) {
            console.error(e);
        }
    }

    $('<a>').addClass('info').attr('title',"Inspired by Doafhat's countdown designs").attr('href', "http://doafhat.com/post/135588250298/all-the-edited-stevenbomb-4-countdowns-for-your").attr('target', '_blank').append($('<i>').addClass('fa fa-info-circle')).appendTo(element);

    var peridinkles = 0;    
    function sneaky() {
        if ($('#nav-bar .peridot-egg, #nav-bar .peridot-peek').is('*')) return;
        if (++peridinkles < 3) return;
        peridinkles = 0;
        $('#nav-bar').addClass('egg');
        (function() {
            return $.when(
                (function() {
                    var d = $.Deferred();
                    $("<img>").attr('src', 'http://i.imgur.com/mN9KVNe.png').on('load', d.resolve);
                    return d;
                })(),
                (function() {
                    var d = $.Deferred();
                    $("<img>").attr('src', 'http://i.imgur.com/wvghkvg.png').on('load', d.resolve);
                    return d;
                })());
        })().then(function() {
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
        var $peridot = $('<div class="peridot-egg">').mousemove(function() {
            $peridot.unbind('mousemove');
            var i = 2;
            window.requestAnimationFrame = window.requestAnimationFrame || function(c) { setTimeout(c, 1000 / 60); };
            (function animate() {
                $peridot.css('background-position', '0 -' + Math.floor(i / 2) + "em");
                if (i / 2 == 4) $('html, body').animate({ scrollTop: $(document).height() }, $(document).height() / 10, "easeInCubic");
                if (i++ / 2 < 10) return requestAnimationFrame(animate);
                $peridot.fadeOut(function() { $peridot.remove(); });
            })();
        });
        $("#nav-bar").append($peridot);
    }
    jQuery.easing['easeInCubic'] = function(x, t, b, c, d) { return c * (t /= d) * t * t + b; };
    var d = new Date();
    if (d.getMonth() == 3 && d.getDate() == 1) setTimeout(sneaky, 60000 * Math.random());
}
