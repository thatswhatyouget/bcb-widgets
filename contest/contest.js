$(document).ready(function () {
    DropLink(function (link) {
        $('.participants').val(link);
        $('.doit').click();
    });
    $('.doit').click(function () {
        var numWinners = parseInt($('.numWinners').val()) || 1;
        var participants = $('.participants').val().split('\n').map(function (p) { return p.trim(); }).filter(function (p) { return !!p; });
        //shuffle
        var i = participants.length, temp, rand;
        while (i) {
            rand = Math.floor(Math.random() * i);
            i--;
            temp = participants[i];
            participants[i] = participants[rand];
            participants[rand] = temp;
        }
        $('.winnersCircle').html(participants.slice(0, numWinners).map(function (p) {
            return $('<h4>').text(p);
        }));
    });
});