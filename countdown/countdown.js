function bcbCountdown(element, config) {
    var styles = 11;
    try {
        var event = config.split("\n").map(function (line) {
            var parts = line.split('~');
            return { time: new Date(parts.pop()), title: parts.shift(), subtitle: parts.join('~') };
        }).filter(function (event) { return event.time.valueOf() > Date.now(); })[0];
        if (!event) return;
        var $timeLeft = $('<div>').addClass('timeLeft');
        $(element).addClass('bcbCountdown').append($('<div>').addClass('title').text(event.title || "New Episode"))
            .append($('<div>').addClass('subtitle').text(event.subtitle || "The Feels Awaken"))
            .append($timeLeft).addClass('style' + Math.floor(Math.random() * styles));
        function updateTime() {
            var duration = (event.time.valueOf() - Date.now()) / 1000;
            $timeLeft.html("<span>" + [24, 60, 60, 1].map(function (num, base, segments) {
                for (var d = duration, i = base; i < segments.length; i++) d /= segments[i];
                if (base) d %= segments[base - 1];
                return Math.floor(d);
            }).join("</span>:<span>") + "</span>");
        }
        updateTime();
        setInterval(updateTime, 1000);
    }
    catch (e) {
        if (typeof(debug) !== "undefined" && debug) {
            console.error(e);
        }
     }
}