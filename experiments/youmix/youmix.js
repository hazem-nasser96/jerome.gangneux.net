var lastSearch = '';
var external   = '';
var player1 = '';
var player2 = '';
var external1 = function() {
    $('#player1').remove();
    player1 = external.player1;
};

var external2 = function() {
    $('#player2').remove();
    player2 = external.player2;
};

$(
    function() {

        $('#search1 button').bind('click', submit1);
        $('#search1 form').bind('submit', submit1);

        $('#search2 button').bind('click', submit2);
        $('#search2 form').bind('submit', submit2);

        $('#slider').slider(
            {
                value: 50,
                slide: function(event, ui) {
                    fade(ui.value);
                }
            }
        );

        $('#fullleft').bind('click', function() { fade(0); $('#slider').slider('value', 0); return false;});
        $('#fullright').bind('click', function() { fade(100); $('#slider').slider('value', 100); return false;});

        swfobject.embedSWF(
            "http://www.youtube.com/v/5NV6Rdv1a3I?version=3&amp;enablejsapi=1&amp;playerapiid=1",
            "video1",
            "100%",
            "480",
            "8",
            null,
            null,
            {allowScriptAccess: "always"},
            {id: "player1"}
        );

        swfobject.embedSWF(
            "http://www.youtube.com/v/vLHcHWDvgfQ?version=3&amp;enablejsapi=1&amp;playerapiid=2",
            "video2",
            "100%",
            "480",
            "8",
            null,
            null,
            {allowScriptAccess: "always"},
            {id: "player2"}
        );

        $('#info1 .play').bind(
            'click',
            function() {
                player1.playVideo();
                return false;
            }
        );

        $('#info2 .play').bind(
            'click',
            function() {
                player2.playVideo();
                return false;
            }
        );

        $('#info1 .pause').bind(
            'click',
            function() {
                player1.pauseVideo();
                return false;
            }
        );
        $('#info2 .pause').bind(
            'click',
            function() {
                player2.pauseVideo();
                return false;
            }
        );

        $('#extern').bind(
            'click',
            function() {
                external = window.open('youmix_external.html','external','menubar=no,status=no,scrollbars=no,menubar=no,width=640,height=480');
            }
        );
    }
);

function externalOff() {
    document.location.reload();
}

function submit1() { return submit(1); }
function submit2() { return submit(2); }

function submit(which) {

    $input = $('#search' + which + ' input');
    if ($input.val() === '') {
        return false;
    }

    var url = 'https://gdata.youtube.com/feeds/api/videos?max-results=10&v=2&alt=json-in-script';

    $.ajax(
        url,
        {
            data: {q: $input.val()},
            dataType: 'jsonp',
            jsonpCallback: 'results' + which
        }
    );

    lastSearch = $input.val();
    $input.val('');

    return false;
}

function actionElement(element, which) {
    var href = $(element).attr('href');

    window['player' + which].cueVideoByUrl(href);

    return false;
}

function fade(value) {
    // 0 - 50
    if (value <= 50) {
        player2.setVolume(value*2);
        player1.setVolume(100);
    } else { // 51 - 100
        player1.setVolume(200-value*2);
        player2.setVolume(100);
    }

    if (external) {
        external.ofade(value);
    }
}

function actionElement1() { return actionElement(this, 1); }
function actionElement2() { return actionElement(this, 2); }

function results(data, which) {

    var $container = $('#result' + which);
    for (var i = 0, max = data.feed.entry.length; i < max; i++) {

        try {
            var e = data.feed.entry[i];

            var src   = e.content.src;
            var title = e.title['$t'];

            var $element = $('<a href="' + src + '">' + title + '</a>');
            if (which == 1) {
                $element.bind('click', actionElement1);
            } else {
                $element.bind('click', actionElement2);
            }
            $container.prepend($element);
        } catch (ex) { }
    }

    $container.prepend($('<strong>' + lastSearch + '</strong>'));
}

function results1(data) { return results(data, 1); }
function results2(data) { return results(data, 2); }

function floatToTime(time) {
    var s = Math.floor(time%60);
    var m = Math.floor(time/60);
    if ((""+s).length == 1) s = '0' + s;
    if ((""+m).length == 1) m = '0' + m;
    return m + ':' + s;
}

var timer1 = '';
var timer2 = '';
function onYouTubePlayerReady(which) {
    window['player' + which] = $('#player' + which)[0];
    window['timer'  + which] = setInterval(
        function() {
            $('#info' + which + ' .time').html(
                floatToTime(window['player' + which].getCurrentTime())
            );
            var p = 
                Math.floor(window['player' + which].getVideoBytesLoaded() / window['player' + which].getVideoBytesTotal() * 100) || 0;
            $('#info' + which + ' .loaded').html(p + '%');
            $('#info' + which + ' .duration').html(
                floatToTime(window['player' + which].getDuration())
            );
        },
        1000
    );
}

window.onbeforeunload = function (e)
{
    e = e || window.event;
    var message = 'Are you sur you want to quit? Music will stop!';

    if (e) {
        e.returnValue = message;
    }

    return message;
};
