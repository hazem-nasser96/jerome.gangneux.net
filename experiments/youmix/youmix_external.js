$(
    function() {

        swfobject.embedSWF(
            "http://www.youtube.com/v/5NV6Rdv1a3I?version=3&amp;enablejsapi=1&amp;playerapiid=1&amp;controls=0&amp;rel=0&amp;showinfo=0",
            "video1",
            "100%",
            "100%",
            "8",
            null,
            null,
            {allowScriptAccess: "always"},
            {id: "player1"}
        );

        swfobject.embedSWF(
            "http://www.youtube.com/v/vLHcHWDvgfQ?version=3&amp;enablejsapi=1&amp;playerapiid=2&amp;controls=0&amp;rel=0&amp;showinfo=0",
            "video2",
            "100%",
            "100%",
            "8",
            null,
            null,
            {allowScriptAccess: "always"},
            {id: "player2"}
        );

        window.onunload = window.opener.externalOff;
    }
);

var player1 = '';
var player2 = '';

function onYouTubePlayerReady(which) {
    player1 = $('#player1')[0];
    player2 = $('#player2')[0];
    window.opener['external' + which]();
}

function ofade(value) {
    var p2 = $('#fg');
    p2.css('opacity', value/100);
}
