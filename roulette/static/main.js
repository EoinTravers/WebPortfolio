// Handle buttons
function keypress(e){
    // Left: 37; Right: 39; Space: 32; p: 80
    // console.log(e);
    var k = (typeof e.which == "number") ? e.which : e.keyCode;
    if (k==80){
        if (!globals.pause){
            globals.pause = true;
        }
        if(globals.idle){
            globals.pause = false;
            StartTrial();
        }
    };
    if (k==32){
        globals.action();
    };
    if(state.condition==2){ // Forced choice
        if(k==37 | k==39){
            ForcedChoice(k);
        }
    };
}
var keypress = _.debounce(keypress, 250, { 'leading': true });
document.onkeydown = keypress;

function Ready(){
    $('#prompt').html(constants.start_prompt);
    // var cb =  $.ajax({
    //   type: 'POST',
    //   url: './cb.php',
    //   data: {subject_nr: subject_nr},
    //   success: function(res) { SetupTask(res); }
    // });
    SetupTask(JSON.stringify({'next':0}));
};

function SetupTask(res){
    var res = JSON.parse(res);
    state.cb = res['next'];
    console.log('CB: ' + state.cb);
    state.condition = state.cb;
    constants.pause_prompt = constants['pause_prompt' + state.condition];
    constants.active_prompt = constants['active_prompt' + state.condition];
    globals.hand_left_start = ['43', '57', '50'][state.condition];
    globals.hand_rot_start = [-30, 30, 0][state.condition];
    $('body').show();
    ShowInstructionsA();
}

var instr_vars = {
    flash_words: [
        'This is what each round will look like.',
        'The wheel shows how much you can win, and what the odds are.',
        'This is how much you can win.<br>\
The larger the green area, the more likely you are to win.',
        'This shows how much you might lose. It\s always set to 10 points.<br>\
The larger the red area, the more likely you are to lose.',
        'This is your score. It will be updated after every round.',
        'If you gamble and win, the wheel will look like this.',
        'If you gamble and lose, it will look like this.'
    ],
    flash_things: [
        '',
        '#gambleWrapper',
        '#win',
        '#lose',
        '#score',
        '',
        '',
    ]
};

// Instructions
function ShowInstructionsA(){
    $('.stim').hide();
    $('#gambleWrapper').hide();
    $('#instrA').show();
    globals.action = ShowInstructionsB;
}

function ShowInstructionsB(){
    $('#gambleWrapper, #prompt, #score').show();
    $('#instrA').hide();
    $('#win').html('+'+15);
    $('#lose').html(-10);
    PaintWheel(.7);
    function F(i){
        $('#prompt').html(instr_vars.flash_words[i] + '<br>Press [SPACE].');
        $(instr_vars.flash_things[i]).addClass('flash');
        $(instr_vars.flash_things[i-1]).removeClass('flash');
        if(i==5){
            PaintWheel(.7, dead='lose');
        }
        if(i==6){
            PaintWheel(.7, dead='win');
            globals.action = ShowInstructionsC;
        } else {
            globals.action = function(){F(i+1)};
        }
    }
    F(0);
}

function ShowInstructionsC(){
    $('#instrC' + state.condition).show();
    $('#gambleWrapper, #prompt, #score').hide();
    $('.option, #hand').show();
    $('#hand')
        .css('left', globals.hand_left_start + 'vw')
        .css('transform', 'translateX(-50%) rotate(' +
             globals.hand_rot_start + 'deg)');
    globals.action = ShowInstructionsD;
}

function ShowInstructionsD(){
    $('.option, #hand').hide();
    $('#instrC' + state.condition).hide();
    $('#instrD').show();
    globals.action = ShowInstructionsE;
}

function ShowInstructionsE(){
    $('#instrD').hide();
    $('#instrE').show();
    globals.action = ReadyBlock;
}

function EndPractice(){
    state.trial_nr = 0;
    globals.gambles = _.shuffle(globals.gambles);
    $('.stim, #gambleWrapper').hide();
    state.practice = 0;
    state.score = globals.start_score;
    $('#current_score').html(state.score);
    $('#prompt')
        .html("OK, you've finished the practice rounds.<br>It's time to start for real.<br>Press [SPACE] to begin.")
        .show();
    globals.action = ReadyBlock;
}

function ReadyBlock(){
    globals.action = Null;
    $('.instructions').hide();
    $('#gambleWrapper').hide();
    $('#prompt').html('Get ready...').show();
    setTimeout(PrepareTrial, constants.ready_time);
}

function PrepareTrial(){
    $('#gambleWrapper').hide();
    $('.instructions').hide();
    ResetTimer();
    $('#prompt').html(constants.active_prompt);
    $('#prompt').removeClass('red');
    $('.option').show();
    $('#hand')
        .css('left', globals.hand_left_start + 'vw')
        .css('transform', 'translateX(-50%) rotate(' +
             globals.hand_rot_start + 'deg)');
    var gamble = globals.gambles[state.trial_nr];
    state.prob = gamble.prob;
    state.win = gamble.win;
    globals.punish = false;
    if(globals.pause){
        globals.idle = true;
        $('#prompt').html(constants.pause_prompt);
    } else {
        setTimeout(StartTrial, constants.ITI);
    }
}

function StartTrial(){
    globals.idle = false;
    state.t0 = Date.now();
    state.rt = -1;
    state.bet = null;
    $('.quant').show();
    $('#current_score').html(state.score);
    $('#change_score').hide();
    $('#score, #prompt, #hand, #gambleWrapper, .option').show();
    // If not in condition 2, trigger action on spacebar.
    // Otherwise, we're going to rely on the Forced[Stay/Swap] funcs.
    globals.action = (state.condition < 2) ? Act : Null;
    globals.waiting = true;
    $('#win').html('+'+state.win);
    $('#lose').html(state.lose);
    PaintWheel(state.prob);
    StartTimer(state.decision_time);
}


function StartTimer(t){
    setTimeout(EndWait, t*1000);
    if(state.practice){
        $('#gambleWrapper').addClass('blink');
    }
}

function ResetTimer(){
    // $('#gambleTimer')
    //   .css('transition', 'none')
    //   .css('transform', 'scale(1)');
}

function Act(){
    state.rt = Date.now() - state.t0;
    globals.action = Null;
    globals.waiting = false;
    if(state.condition==0){
        Bet();
    } else if (state.condition==1) {
        Pass();
    }
};

function Bet(){
    state.bet = true;
    $('#hand')
        .css('left', '57vw')
        .css('transform', 'translateX(-50%) rotate(+30deg)');
}

function Pass(){
    state.bet = false;
    $('#hand')
        .css('left', '43vw')
        .css('transform', 'translateX(-50%) rotate(-30deg)');
}

function ForcedChoice(k){
    if(globals.waiting){
        globals.waiting = false;
        state.rt = Date.now() - state.t0;
        var is_bet = (k==39);
        if(is_bet) {
            Bet();
        } else {
            Pass();
        }
    }
};

function EndWait(){
    // console.log('End wait');
    $('#gambleWrapper').removeClass('blink');
    globals.action = Null;
    state.outcome = toin_coss(state.prob);
    if(state.condition == 2){
        if(globals.waiting){
            state.bet = false;
            globals.punish = true;
            Punish();
        }
    } else {
        if(globals.waiting){
            // If still waiting in condition 0, Pass. If condition 1, bet.
            state.bet = (state.condition==0) ? false : true;
        }
    }
    if (!globals.punish){
        if(state.bet){
            if(state.outcome){
                state.take = state.win;
            } else {
                state.take = state.lose;
            }
            Win(state.take);
        } else {
            ShowPass();
        }
    }
}


function Win(x){
    // console.log('Take: ' + x);
    ResetTimer();
    var bit_to_hide = (x>0) ? 'lose' : 'win';
    var txt = pretty_value(x);
    PaintWheel(state.prob, dead=bit_to_hide);
    $('#' + bit_to_hide).hide();
    $('#pass').hide();
    $('#change_score')
        .html(txt)
        .show();
    state.score = state.score + x;
    LogData();
}

function ShowPass(){
    $('#bet').hide();
    $('#gambleWrapper').hide();
    LogData();
}

function Punish(){
    var p = constants.timeout_punishment;
    $('#prompt')
        .addClass('red')
        .html('Please respond before the timer runs out.<br>' +
              p + ' has been taken from your bonus.<br>' +
              'Press [SPACE] to go on.');
    ResetTimer();
    $('#change_score')
        .html(p)
        .show();
    state.score = state.score + p;
    LogData(false);
}


function LogData(proceed){
    state.focus = 1*(!document.hidden);
    if (typeof proceed === "undefined" || proceed === null) {
        proceed = true;
    }
    globals.action = Null;
    // console.log('Log data');
    $.ajax({
        type: 'POST',
        data: JSON.stringify(state),
        contentType: 'application/json',
        url: './log.php',
        success: function(data) {
            console.log('Data sent');
            // console.log(JSON.stringify(data));
        }
    });
    if(proceed){
        setTimeout(function(){EndTrial();}, constants.feedback_time);
    } else {
        globals.action = EndTrial;
    }
}

function EndTrial(){
    state.trial_nr += 1;
    var tpb = constants.trials_per_block;
    var tr = state.trial_nr;
    if(state.practice) {
        if(tr >= globals.n_practice_trials){
            EndPractice();
        } else {
            // Just go on to next trial
            PrepareTrial();
        }
    } else{
        // End of task?
        if(state.trial_nr >= globals.gambles.length){
            setTimeout(EndExperiment, 200);
        } else if(tr % tpb == 0) {
            // End of block
            state.block_nr += 1;
            TakeABreak();
        } else {
            // Just go on to next trial
            PrepareTrial();
        }
    }
};

function TakeABreak(){
    $('.stim, #gambleWrapper').hide();
    var txt = constants.break_prompt
        .replace('#1', state.trial_nr)
        .replace('#2', globals.gambles.length);
    $('#prompt').html(txt).show();
    globals.action = PrepareTrial;
}

function EndExperiment(){
    localStorage['score'] = state.score;
    window.location = './feedback.html';
};





function PaintWheel(probWin, dead=null){
    var theta, bgCol, fillCol, a1, a2, gradDefault;
    var winCol = 'green';
    var loseCol = 'red';
    if (dead != null){
        if (dead=='win'){winCol = 'lightgrey';}
        if (dead=='lose'){loseCol = 'lightgrey';}
    }
    if (probWin == .5){
        bgCol = winCol;
        fillCol = loseCol;
        gradDefault = 'linear-gradient(0deg, {0} 50%, transparent 50%)'.format(fillCol);
    } else {
        if (probWin < .5){
            theta = probWin * 360;
            bgCol = winCol;
            fillCol = loseCol;
            a1 = .5*(180-theta);
            a2 = -a1;
        } else if (probWin > .5){
            theta = (1-probWin) * 360;
            bgCol = loseCol;
            fillCol = winCol;
            a1 = 180 - .5*(180-theta);
            a2 = 180 + .5*(180-theta);
        }
        // console.log('{0} {1}'.format(a1, a2));
        gradDefault =
            'linear-gradient({0}deg, {1} 50%, transparent 50%), '.format(a1, fillCol) +
            'linear-gradient({0}deg, {1} 50%, transparent 50%)'.format(a2, fillCol);
    }
    $('pie').css('background-color', bgCol);
    $('pie').css('background-image', gradDefault);
}


var W, H;
// var subject_nr = Math.round(Math.random()*1000000000);
// localStorage['subject_nr'] = subject_nr;
var subject_nr = localStorage['subject_nr'];

var globals = {
    lose: 10,
    wins : [2, 4, 6, 8, 10, 10, 12, 14, 16, 18], // Note - 10 twice
    probs : [.2, .3, .4, .5, .6, .7, .8],//_.range(.2, .801, .1),
    paused          : false,
    idle            : false,
    waiting         : true,
    punish : false,
    n_practice_trials: 10,
    // n_practice_trials: 1,
    start_score: 100,
    action: Null
};

(function(){
    var gambles = [];
    globals.wins.forEach(function(w){
        globals.probs.forEach(function(p){
            gambles.push({win:w, prob:p});
        });
    });
    gambles = repeat_array(gambles, 3);  // 63 * 3 = 189
    gambles = _.shuffle(gambles);
    globals.gambles = gambles;
    // globals.gambles = gambles.slice(0, 2);
})();

var constants = {
    trial_time      : 3000,
    feedback_time   : 1000,
    ready_time      : 2000,
    ITI             : 400,
    start_prompt     : 'Press [SPACE] to begin!',
    active_prompt    : null,
    pause_prompt     : null,
    active_prompt0    : 'Bet: [SPACE]<br>Pause: [P]',
    pause_prompt0     : 'Bet: [SPACE]<br>Resume: [P]',
    active_prompt1    : 'Pass: [SPACE]<br>Pause: [P]',
    pause_prompt1     : 'Pass: [SPACE]<br>Resume: [P]',
    active_prompt2   : 'Pass: [LEFT]<br>Bet: [RIGHT]<br>Pause: [P]',
    pause_prompt2    : 'Pass: [LEFT]<br>Bet: [RIGHT]<br>Resume: [P]',
    break_prompt : 'Time for a break.<br>You\'ve completed #1 of #2 rounds.<br>Press [SPACE] to go on.',
    trials_per_block : 20,
    // trials_per_block : 1,
    timeout_punishment : -20
};

var state = {
    W          : W,
    H          : H,
    subject_nr : subject_nr,
    decision_time: 5,
    practice: 1,
    cb         : null,
    condition  : 0, // 0 = Active swap, 1 = Passive swap, 2 = Forced choice
    block_nr      : 0,
    trial_nr   : 0,
    lose : -10,
    win : null,
    prob : null,
    outcome: null,
    bet: null,
    take: null,
    t0: null,
    rt: null,
    score: globals.start_score,
    focus: 1
};

$( document ).ready(function(){
    $( window ).resize(_.debounce(resize, 100));
    resize();
    Ready();
});


function shuffle(array){ //Shuffle an array
    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/array/shuffle [v1.0]
    for(var j, x, i = array.length; i; j = Math.floor(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
    return array;
};

function range(start, end) {
    // Creates range of numbers from start to end (similar to Python)
    var ar = [];
    for (var i = start; i < end; i++) {
        ar.push(i);
    };
    return ar;
};

function generate_random_list(length){
    return shuffle(range(0, length));
};


var bg_left, bg_right;
function resize(){
    state.W = W = $( window ).width();
    state.H = H = $( window ).height();
};

function flip(){
    return Math.floor(Math.random()*2)
};

function toin_coss(prob){
    var r = Math.random();
    return (r < prob);
}

// Standard Normal variate using Box-Muller transform.
function random_normal(mu, sigma) {
    var mu = mu || 0;
    var sigma  = sigma || 1;
    var u = 1 - Math.random(); // Subtraction to flip [0, 1) to (0, 1].
    var v = 1 - Math.random();
    return mu + sigma*Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function npdf(x, mu, s2){
    var m = Math.sqrt(2 * Math.PI * s2);
    var e = Math.exp(-Math.pow(x - mu, 2) / (2 * s2));
    return e / m;
};

function fillArray(value, len) {
    if (len == 0) return [];
    var a = [value];
    while (a.length * 2 <= len) a = a.concat(a);
    if (a.length < len) a = a.concat(a.slice(0, len - a.length));
    return a;
}
function enumerate(lst, f){
    var z = _.zip(_.range(0, lst.length),
                  lst)
    return _.map(z, function(x){
        return f(x[0], x[1])
    })
};

function repeated_list(vals, reps){
    return _(_.zip(vals, reps))
        .map(function(x){return fillArray(x[0], x[1]);})
        .flatten()
        .value();
}

function Null(){
    // Does nothing
}

if (!String.prototype.format) {
    // https://stackoverflow.com/a/4673436/1717077
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
            ;
        });
    };
}

function pretty_value(val){
    if (val < 0){
        txt = val;
    } else if (val > 0) {
        txt = '+' +  val;
    } else {
        txt = '±0';
    }
    return(txt);
}


function ajax_test(url, data){
    $.ajax({
        type: 'POST',
        url: url,
        data: data,
        success: function(res) { console.log(res); }
    });
}

function repeat_array(array, n){
    return _.flatten(_.times(n, _.constant(array)));
}
