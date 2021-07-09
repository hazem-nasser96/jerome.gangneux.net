// Debug
//var console = {};
//console.log = function (log) {
//    log = JSON.stringify(log);
//    var iframe = document.createElement('IFRAME');
//    iframe.setAttribute('src', 'ios-log:#iOS#' + log);
//    document.documentElement.appendChild(iframe);
//    iframe.parentNode.removeChild(iframe);
//    iframe = null;
//};

var console_log = {};
console_log.log = function (message) {
    message = JSON.stringify(message);
    $('#console_log').prepend('<div>' + message + '</div>');
};
$('#console_log').on(event_type, function () {
    $('#console_log').toggleClass('console_small');
});

var tab = true;
var dev = false;
var event_type;
if (tab) {
    event_type = 'touchend';
    console = console_log;
}
else {
    event_type = 'click';
}

if (typeof NativeInterface === 'undefined') {
    NativeInterface = false;
}

console.debug = console.log;
console.info  = console.log;
console.warn  = console.log;
console.error = console.log;

var game = (function () {
    // helpers
    function log(message) {
        if (dev && typeof console != 'undefined') {
            console.log(message);
        }
    }

    log('init');
    // var data = ';
    // var url  = '/kids/memory/ajax.php';
    // $.ajax({
    //     dataType: 'json',
    //     url: url,
    //     data: data,
    //     success: function (result) {
    //         console.log(result);
    //     }
    // });
    
    function fullscreen() {
        $(document).on(event_type, function() {
            var el  = document.documentElement,
                rfs = el.requestFullScreen || el.webkitRequestFullScreen;
            rfs.call(el);
        });
    }

    function rand(min, max) {
        if (typeof max == 'undefined') {
            max = min;
            min = 0;
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/array/shuffle [v1.0]
    function shuffle(o) {
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }

    // Si nous sommes pas sur android < 4.4 on met le no flick
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('edu shell') == -1 || parseInt(ua.split('-')[1], 10) > 18) {
        $('body').addClass('please-dont-flick');
    }

    function sound(name, time) {
        if (!NativeInterface) {
            var audio = new Audio('./audio/' + name + '.wav');
        }

        if (on_or_off == 'on') {
            if (!time) time = 0;
            setTimeout(function () {
                if (NativeInterface) {
                    NativeInterface.playAudio('/data/data/com.citroon.memory/files/' + name + '.wav');
                }
                else {
                    audio.play();
                }
            }, time);
        }
    }

    function setPreferences(key, value) {
        if (NativeInterface) {
            NativeInterface.setPreferences(key, value);
        }
        else {
            $.cookie(key, value, { expires: 700 });
        }
    }

    function getPreferences(key, defaultValue) {
        var value;
        if (NativeInterface) {
            value = NativeInterface.getPreferences(key);
            if (value.length === 0) {
                value = defaultValue;
            }
        }
        else {
            value = $.cookie(key);
            if (typeof value === 'undefined') {
                value = defaultValue;
            }
        }

        return value;
    }

    var screenWidth = $('html').width(),
        screenHeight = $('html').height();

    $('.button').on(event_type, function (e) {
        sound('button');
        var $this = $(this),
            href  = $this.attr('href');
        $this.addClass('clicked');
        setTimeout(function () { $this.removeClass('clicked'); }, 200);
        if (href && href != '#') {
            setTimeout(function () { document.location = href; }, 300);
            e.preventDefault();
            return false;
        }
    });

    var start = Math.round(new Date().getTime()/1000);
    var stop  = false;
    function tick () {
        if (stop) return;
        var string = "";
        var now = Math.round(new Date().getTime()/1000);
        var delta = now - start;
        var seconds = delta % 60;
        var minutes = Math.floor(delta / 60);
        $time = $('.time');
        var text = $time.attr('data-text') || '';
        $time.text(text + padd0(minutes) + ":" + padd0(seconds));
        setTimeout(tick, 1000);
    }

    // Sound
    var on_or_off = getPreferences('sound');
    if (on_or_off == 'off') {
        $('.sound-on').addClass('sound-off').removeClass('sound-on');
    }
    else {
        on_or_off = 'on';
    }

    $('.sound-on, .sound-off').on(event_type, function (e) {
        $this = $(this);
        //var on_or_off = getPreferences('sound');
        if (!on_or_off || on_or_off == 'on') {
            on_or_off = 'off';
        }
        else {
            on_or_off = 'on';
        }

        setPreferences('sound', on_or_off);
        $this.toggleClass('sound-off').toggleClass('sound-on');
        e.preventDefault();
        return false;
    });

    var tries = 0;
    function add_tries() {
        tries++;
        var $tries = $('.tries'),
            text = $tries.attr('data-text') || '';
        $tries.text(text + tries);
    }

    var rounds = 0;
    function add_rounds() {
        log(rounds);
        rounds++;
        var $rounds = $('.rounds'),
            text = $rounds.attr('data-text') || '';
        $rounds.text(text + rounds);
    }

    function padd0(data) {
        if (data <= 9) {
            return '0' + data;
        }
        return '' + data;
    }

    var lock = false;

    String.prototype.replaceAll = function(search, replace) {
        return this.replace(new RegExp(search, 'g'), replace);
    };

    function tpl(template, values) { // TODO
        for (var i = 0, max = values.length; i < max; i++) {
            template = template.replace();
        }
    }

    /* templating */
    var letter_tpl = $('.letter_tpl').html();
    var placeholder_tpl = $('.placeholder_tpl').html();

    var words, play, word, position, letters, choices;
    var MAX_LETTER = 10;

    function init_round() {
        lock = false;
        position = 1;
        word = shuffle(words)[0].split('');
        words = words.slice(1, words.length);
        play = [word[0]];
        choices = word.slice(1, word.length);
        choices = choices.concat(shuffle(letters));
        choices = choices.slice(0, MAX_LETTER);
        choices = shuffle(choices);
        var w = word.join('');
        log("will play with " + w);
        log(choices);

        if (rounds + 1 > 10) {
            finish();
            return;
        }

        add_rounds();

        if (word.length > 5) {
            $('.play').addClass('small');
        } else {
            $('.play').removeClass('small');
        }
        $('.propal').css('backgroundImage', 'url(images/propal/' + w + '.png)');
        play_tpl(play);
        choices_tpl(choices);
    }

    function display_letters(data, place) {
        var $place = $(place);
        $place.empty();
        for (var i = 0, max = data.length; i < max; i++) {
            var result = letter_tpl;
            var l = data[i];
            result = result.replaceAll('%letter%', l);
            result = $(result.replaceAll('%position%', ''+i));
            if (l === '') {
                result.addClass('empty');
            }
            $place.append(result);
        }
    }

    function choices_tpl(data) {
        display_letters(data, '.choices');
    }

    function play_tpl(data) {
        display_letters(data, '.play');
        var ph = word.length - data.length;
        $play = $('.play');
        for (var i = 0; i < ph; i++) {
            $play.append(placeholder_tpl);
        }
    }

    function init_game(game_type) {
        //fullscreen();
        start = Math.round(new Date().getTime()/1000);
        stop = false;
        lock = false;
        rounds = 0;
        tries = 0;

        words = ["ant","astronaut","banana","bat","bear","bee","bird","boat","bread","butter","car","cat","cheese","chicken","cloud","cow","crocodile","diamond","diver","dolphin","eggs","farmer","fireman","fish","fisher","flamingo","flour","flower","glasses","hive","honey","horse","igloo","island","milk","mill","mountain","mouse","penguin","plane","potato","rain","rainbow","salt","shellfish","snowman","sun","sunflower","tree"];
        position = 1;
        letters = "azertyuiopmlkjhgfdsqwxcvbn".split(''); // array of letters


        $(document).on(event_type, '.choices .letter', function (e) {
            if (lock) return;

            var $this = $(this);
            var l = $this.attr('data-letter');
            var p = $this.attr('data-position');
            if (l === '') return;

            if (l == word[position]) {
                position++;
                choices[p] = '';
                choices_tpl(choices);
                play.push(l);
                play_tpl(play);
            }
            else {
                $this.removeClass('blue').addClass('red');
                setTimeout(function () {
                    $this.removeClass('red').addClass('blue');
                }, 300);
            }
            
            add_tries();

            if (position == word.length) {
                win();
            }
        });
        init_round();
        tick();
    }

    function win() {
        lock = true;
        var time = 200;
        var last = 0;
        $('.play .letter').each(function (index, element) {
            last = index;
            setTimeout(function () {
                $(element).removeClass('blue').addClass('green');
            }, index * time);
        });
        setTimeout(function () {
            if (stop) return;
            $('.propal').removeClass('in').addClass('out');
            setTimeout(function () {
                init_round();
                $('.propal').removeClass('out').addClass('in');
            }, 1000);
        }, ++last * time);
    }

    function finish() {
        stop = true;
        $('#win').show();
        log('finish');
    }

    function init_interface() {
        $(document).on(event_type, '.start', function (e) {
            setTimeout(function() {
                $('#menu').hide();
                $('#game').show();
                $('#win').hide();
                init_game();
            }, 300);
        });

        $(document).on(event_type, '.back', function (e) {
            $('#game').hide();
            $('#menu').show();
        });
    }

    return {
        init_game: init_game,
        init: init_interface
    };
})();