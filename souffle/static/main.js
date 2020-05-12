//// logic.js
// Handle buttons
function KeypressFunction(e){
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
}
var KeypressFunction = _.debounce(KeypressFunction, 250, { 'leading': true });

// Handle clicks
function ClickFunction(e){
  if( check_is_mobile()) {
    // Only on mobile
    globals.action();
  };
};
var ClickFunction = _.debounce(ClickFunction, 250, { 'leading': true });

function Ready(){
  $('body').show();
  ReadyBlock();
};

// function SetupTask(res){
//   ReadyBlock();
//   // globals.action = ReadyBlock;
//   // globals.condition_list = _.times(1000, fiftyfifty);
// }

function ReadyBlock(){
  state.condition = constants.condition_order_vec[state.block_nr];
  state.oven = constants.condition_colours[state.condition];
  $('#oven').attr('src', 'static/oven_$1.jpg'.replace('$1', state.oven));
  globals.wait_times = generate_wait_times(state.condition);
  state.t_start_block = Date.now();
  globals.action = Null;
  // $('#stimulus-wrapper').hide();
  var txt = constants.start_prompt.replace('$1', state.oven);
  $('#prompt').html(txt).css('color', 'black');
  $('#souffle').hide();
  $('#fix').hide();
  globals.action = function(){
    PrepareTrial();
    StartClock(globals.seconds_per_block);
  };
}


function StartClock(seconds){
  state.t_start_task = Date.now();
  globals.clock_start = seconds;
  $('#clock').css('color', 'black');
  UpdateClock();
  globals.tick = setInterval(UpdateClock, 1000);
}

function UpdateClock(){
  var dt = (Date.now() - state.t_start_task)/1000;
  var time_to_show = globals.clock_start - dt;
  time_to_show = Math.round(time_to_show, 0);
  if(time_to_show < 0){
    clearInterval(globals.tick);
    $('#clock').css('color', 'red');
  } else {
    $('#clock').html(seconds_to_string(time_to_show));
  }
}

function PrepareTrial(){
  $('#stimulus-wrapper, .instructions').hide();
  $('#prompt').html(constants.early_prompt).hide();
  $('#prompt').css('color', 'black');
  var event_times = generate_wait_time(state.condition);
  globals.t_ready = event_times['ready']; // These are the planned times
  globals.t_burn = event_times['burn'];
  state.stim = 'flat_souffle.png';
  $('#souffle')
    .attr('src', 'static/'+state.stim)
    .css('width', '0%')
    .css('height', '0%')
    .css('left', '50%')
    .css('top', '50%')
    .show();
  $('#oven').css('width', '80%').css('height', '80%')
    .css('left', '10%').css('top', '10%')
    .addClass('wobbling');
  ToggleSpin('running');
  $('#fix').html(constants.fix_txt).show();
  setTimeout(StartTrial, constants.ITI);
}

function StartTrial(){
  console.log('Trial ' + state.trial_nr + ' w = ' + globals.t_ready);
  state.t_start = Date.now();
  state.response = 'early';
  state.t_action = -1;
  state.t_ready = -1;
  state.t_burn = -1;
  $('#current-score').html(state.score);
  $('#change-score').hide();
  $('#score, #prompt, #stimulus-wrapper, .option').show();
  globals.waiting = true;
  globals.action = OpenOven;
  $('#fix').hide();
  $('#stimulus-wrapper').show();
  $('#prompt').show();
  StartTimers();
};

function StartTimers(){
  globals.timer1 = setTimeout(SouffleIsReady, globals.t_ready * 1000);
  globals.timer2 = setTimeout(SouffleIsBurned, globals.t_burn * 1000);
}

function ResetTimer(){
  clearTimeout(globals.timer1);
  clearTimeout(globals.timer2);
}

function SouffleIsReady(){
  console.log('SouffleIsReady');
  state.t_ready = Date.now();
  state.response = 'ready';
  state.stim = 'souffle.png';
  $('#souffle').attr('src', 'static/'+state.stim);
}


function SouffleIsBurned(){
  console.log('SouffleIsBurned');
  state.t_burn = Date.now();
  state.response = 'late';
  state.stim = 'burned_souffle.png';
  $('#souffle').attr('src', 'static/'+state.stim);
}


function Pass(){
  console.log('Pass');
}

function ToggleSpin(what){
  var what = what || 'toggle';
  var playState = '-webkit-animation-play-state';
  $('#oven').css(playState, function(i, v){
    if (what == 'toggle'){
      return v === 'paused' ? 'running' : 'paused';
    } else {
      return what;
    };
  });
}

function OpenOven(){
  globals.action = Pass;
  state.t_action = Date.now();
  console.log('OpenOven: t = ' + (state.t_action - state.t_start)/1000);
  ToggleSpin('paused');
  $('#souffle').css('width', '100%').css('height', '100%').css('left', '0%').css('top', '0%');
  DoFeedback();
}

function DoFeedback(){
  console.log('FB')
  ResetTimer();
  $('#prompt').hide();
  console.log(state);
  var txt    = constants.feedback_prompts[state.response];
  var x      = constants.prizes[state.response];
  var colour = (x > 0) ? 'green' : 'red';
  $('#prompt')
    .html(txt)
    .css('color', colour)
    .show();
  state.outcome = x;
  state.score = state.score + x;
  $('#current-score').html(state.score);
  LogData();
}

function LogData(proceed){
  state.focus = 1*(!document.hidden);
  proceed = (typeof proceed === "undefined" || proceed === null) ? true : proceed;
  globals.action = Pass;
  console.log('Log data');
  console.log(state);
  $.ajax({
    type: 'POST',
    data: JSON.stringify(state),
    contentType: 'application/json',
    url: constants.datapath,
    success: function(data) {
      console.log(JSON.stringify(data));
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
  var t = (Date.now() - state.t_start_block)/1000;
  if (t < globals.seconds_per_block) {
    PrepareTrial();
  } else {
    state.block_nr += 1;
    if(state.block_nr + 1 <= globals.n_blocks){
      ReadyBlock();
    } else {
      EndExperiment();
    }
  }
};

function EndExperiment(){
  localStorage['score'] = state.score;
  setTimeout(function(){
    window.location = './feedback.html';
  }, 500);
};

/// main.js
var W, H;
var subject_nr = localStorage['subject_nr'];
subject_nr = (typeof subject_nr === 'undefined') ?
  Math.round(Math.random()*1000000000) : subject_nr;

function generate_souffle_paths(){
  var ns = [0,90,180,270];
  var abcs = ['A', 'B', 'C', 'D'];
  var paths = [];
  for(var i=0; i<ns.length; i++){
    for(var j=0; j<abcs.length; j++){
      // var x = 'souffle'  + abcs[i] + '_' + ns[j] + '.png';
      // paths.push(x);
      paths.push('souffle.png');
    }
  }
  return(paths);
}

var globals = {
  lose               : 10,
  paused             : false,
  idle               : false,
  waiting            : true,
  punish             : false,
  wait_times         : null,
  ready_window       : 9999999, // Very long window - things won't burn!
  n_practice_trials  : 10,
  start_score        : 0,
  seconds_per_block  : 60 * 5,
  n_blocks : 3,
  // task_time          : 60 * 20,
  condition_list     : null,
  action             : null,
  timer              : null,
  task_start_time    : null
};

// R(Skip) = 1 pt / 2 secs = .5
// R(Wait) = 5 pt / (2 + E[Wait])
// Wait ~ Exponential(lamba = .125)
// -> E[Wait] = 1 / .125 = 8
// -> R(Wait) = 5 pt / 10 secs = .5
var constants = {
  feedback_time      : 2000,
  ITI                : 1000,
  start_prompt       : "For the next few rounds, you'll be using the $1 oven.<br>" +
    "Remember, different ovens take different amounts of time to bake a soufflé, " +
    "and some ovens are more consistent than others.<br>" +
    "Press SPACE to begin!",
  early_prompt       : 'Baking...<br>Press SPACE to open the oven.',
  break_prompt       : 'Time for a break.<br>You\'ve completed #1 of #2 rounds.<br>Click to go on.',
  fix_txt            : 'Putting the dough in the oven...',
  condition_colours  : ['red', 'green', 'blue'],
  condition_orders   : [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0] ],
  datapath           : './log.php',
  feedback_prompts   : {
    'early' : "Too soon! It's ruined!",
    'ready' : 'A perfect bake!<br>Have 10 points.',
    'late'  : "Too late! It\'s burned to a crisp!"
  },
  prizes            : {
    'early' : 0,
    'ready': 10,
    'late' : 0
  }

};

var state = {
  W             : W,
  H             : H,
  subject_nr    : subject_nr,
  practice      : 0,
  trial_nr      : 0,
  t_start_task  : null,
  t_start_block : null,
  block_nr      : 0,
  condition     : null, // Per trial.
  oven          : null, // A colour
  stim          : null,
  outcome       : null,
  t_start       : null,
  t_ready       : null,
  t_burn     : null,
  t_action      : null,
  score         : globals.start_score,
  focus         : 1,
  will_burn     : 0
};

function generate_wait_time(condition){
  // 0 = Normal(3, 1), 1 = Normal(6, 1), 2 = Binary(.1 | 999)
  var ready, burn;
  if(condition == 2) {
    var r = _.sample([0,1]);
    if(r==0){
      ready = 99999;
      burn  = 99999;
    }
    if(r==1){
      ready = .01;
      burn  = 99999;
    }
    // if (r==2){
    //   ready = .01;
    //   burn  = .02;
    // }
  } else {
    ready =
      (condition == 0) ? random_normal(3, 1) :
      (condition == 1) ? random_normal(6, 1) : null;
    burn  = ready + globals['ready_window'];
  }
  return({'ready':ready, 'burn': burn});
}

function generate_wait_times(condition){
  var waits = _.times(500, x => generate_wait_time(condition));
  return waits;
}

$( document ).ready(function(){
  $( window ).resize(_.debounce(resize, 100));
  document.onkeydown = KeypressFunction;
  $(window).on('click', ClickFunction);
  // $('#souffle').on('click', ClickFunction);
  // $('#oven').on('click', ClickFunction);
  resize();
  state.condition_order = _.sample(_.range(constants.condition_orders.length));
  constants.condition_order_vec = constants.condition_orders[state.condition_order];
  Ready();
});

//// utilities.js
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


function coin_toss(prob){
  var prob = prob || .5;
  var r = Math.random();
  return (r < prob);
}
function flip(prob) {return coin_toss(prob)};
function fiftyfifty() {return coin_toss(.5)};

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


function random_geometric(p) {
  // Formerly referred to as exponential. Discrete values.
  // Note mean value is (1/p) - 1, not 1/p.
  var f = function(i, p){
    res = coin_toss(p) ? i : f(i+1, p);
    return(res);
  };
  return(f(0, p));
}

// https://gist.github.com/nicolashery/5885280
function random_exponential(rate) {
  // http://en.wikipedia.org/wiki/Exponential_distribution#Generating_exponential_variates
  var u = Math.random();
  return -Math.log(u)/rate;
}
  

function count_values(x){
  var vals = _.uniq(x).sort();
  var counts = vals.map(v => _.sum(x.map(_x => _x==v)));
  return(_.zipObject(vals, counts)); 
}

function seconds_to_string(secs){
  var m = Math.floor(secs/60);
  var s = secs % 60;
  return String(m) + ':' + String(s).padStart(2, '0');
}

function pseudo_random_repeat(x, times_per_block, n_blocks){
  // Creates `n_blocks` sequences, each containing x repeated `times_per_block`, then shuffled.
  // All output is flattened to a single list.
  var do_block = i => _.chain(times_per_block).times( j => x).flatten().shuffle().value();
  var res =      _.chain(n_blocks).times(do_block).flatten().value();
  return res;
  // _.flatten(_.times(n_blocks, i => _.shuffle(_.flatten(_.times(times_per_block, jQuery => x)))));
}

function check_is_mobile(){
  // Shoddy hack
  return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4));
}
