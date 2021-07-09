// Debug
//var console = {};
//console.log = function (log) {
//    log = JSON.stringify(log);
//    var iframe = document.createElement("IFRAME");
//    iframe.setAttribute("src", "ios-log:#iOS#" + log);
//    document.documentElement.appendChild(iframe);
//    iframe.parentNode.removeChild(iframe);
//    iframe = null;
//};

if (typeof NativeInterface === "undefined") {
    NativeInterface = false;
}

//console.debug = console.log;
//console.info = console.log;
//console.warn = console.log;
//console.error = console.log;

var game = (function () {
    // helpers
    function log(message) {
        //if (typeof console != "undefined") {
        //    console.log(message);
        //}
    }

    log('init');
    // var data = "";
    // var url  = "http://dev.gangneux.net/kids/memory/ajax.php";
    // $.ajax({
    //     dataType: "json",
    //     url: url,
    //     data: data,
    //     success: function (result) {
    //         console.log(result);
    //     }
    // });

    function rand(min, max) {
        if (typeof max == "undefined") {
            max = min;
            min = 0;
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/array/shuffle [v1.0]
    function shuffle(o) {
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }

    // Si nous sommes pas sur android < 4.4 on met le no flick
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("edu shell") == -1 || parseInt(ua.split('-')[1], 10) > 18) {
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
            if (typeof value === "undefined") {
                value = defaultValue;
            }
        }

        return value;
    }

    var screenWidth = $('html').width(),
        screenHeight = $('html').height();

    // Basic interaction
    var lock = false;
    $('.button').on('click, touchend', function (e) {
        sound('button');
        $this = $(this);
        $this.addClass('clicked');
        setTimeout(function () { $this.removeClass('clicked'); }, 200);
        setTimeout(function () { document.location = $this.attr('href'); }, 300);
        e.preventDefault();
        return false;
    });

    // Sound
    var on_or_off = getPreferences('sound');
    if (on_or_off == 'off') {
        $('.sound-on').addClass('sound-off').removeClass('sound-on');
    }
    else {
        on_or_off = 'on';
    }

    $('.sound-on, .sound-off').on('click, touchend', function (e) {
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

    // Background clouds
    var tier = 0;
    $('.cloud').each(function (i,v) {
        // position random
        var $this = $(this),
            top   = rand(0, screenHeight-(screenHeight*30/100)),
            right = rand(0, screenWidth);
        $this.css({
            'top': top + 'px',
            'right': right + 'px'
        });
        $clone = $this.clone();
        $clone.addClass('cloud-hidden').appendTo($('.background'));
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
        $('.time').text($('.time').attr('data-text') + padd0(minutes) + ":" + padd0(seconds));
        setTimeout(tick, 1000);
    }

    var tries = -1;
    function add_tries() {
        tries++;
        $('.tries').text($('.tries').attr('data-text') + tries);
    }

    function padd0(data) {
        if (data <= 9) {
            return "0" + data;
        }
        return "" + data;
    }

    function init_game(game_type) {
        tick();
        add_tries();
        // Game mechanism
        var tile_type   = ["01","02","03","04","05","06","07","08","09"];
        var tile_order  = [];
        var last_try    = "00";
        var last_tile   = 0;
        var nb_success  = 0;
        var win_success = game_type/2;

        if (game_type < 18) {
            do {
                tile_type.splice(rand(0, tile_type.length-1), 1);
            } while (tile_type.length > game_type/2);
        }

        tile_order = shuffle(tile_type.concat(tile_type));

        $('.tile-container').each(function (i,v) {
            $(this).attr('data-value', tile_order[i]);
            $(this).find('.animal').addClass('animal' + tile_order[i]);
        });

        $('.tile-container').on('click, touchend', function (e) {
            if (lock) return;
            if ($(this).hasClass('locked')) return;
            sound('swipe');
            $(this).addClass('clicked');
            var value = $(this).attr('data-value'),
                prev  = last_tile;
            last_tile = $(this).attr('data-id');
            if (prev == last_tile) return;
            if (last_try == "00") {
                // premier click
                last_try = value;
            }
            else if (value == last_try) {
                // good try
                sound('found', 300);
                add_tries();
                nb_success++;
                $('.tile-container[data-value=' + value + ']').addClass('locked');
                last_try = "00";
            }
            else {
                // bad try
                sound('wrong', 600);
                //sound('wrong', 700);
                sound('swipe', 1100);
                add_tries();
                lock = true;
                setTimeout(function () {
                    $('.clicked').removeClass('clicked');
                    lock = false;
                }, 1000);
                last_try = "00";
            }

            if (nb_success == win_success) {
                // win
                stop = true;
                setTimeout(function() {
                    sound('end');
                    $('.win').show();
                }, 1500);
            }

            e.preventDefault();
            return false;
        });
    }

    return {
        init: init_game
    };
})();