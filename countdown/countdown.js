function bcbCountdown(element, config, theme) {
    var themes = 12;
    try {
        theme = theme == "0" ? 0 : parseInt(theme || '') || -1;
        var event = config.split("\n").map(function (line) {
            var parts = line.split('~');
            return { time: new Date(parts.pop()), title: parts.shift(), subtitle: parts.join('~') };
        }).filter(function (event) { return event.time.valueOf() > Date.now(); })[0];
        if (!event) return $(element).hide();
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
            $timeLeft.html("<span>" + [24, 60, 60, 1].map(function (num, base, segments) {
                for (var d = duration, i = base; i < segments.length; i++) d /= segments[i];
                if (base) d %= segments[base - 1];
                return Math.floor(d);
            }).join("</span>:<span>") + "</span>");
        }
        updateTime();
        var interval = setInterval(updateTime, 1000), pressed = [], unlocked = false;
        $(window).keydown(function (e) {
            pressed.push(String.fromCharCode(e.which).toUpperCase());
            if (pressed.length > 5) pressed.shift();
            if (pressed.join('') == "SUGAR") unlocked = true;
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
        if (typeof(debug) !== "undefined" && debug) {
            console.error(e);
        }
     }
}