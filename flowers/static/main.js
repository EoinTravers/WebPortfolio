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
  // console.log(e);
  globals.action();
}
var ClickFunction = _.debounce(ClickFunction, 250, { 'leading': true });

function Ready(){
  SetupTask();
};

function SetupTask(res){
  $('body').show();
  $('#prompt').hide();
  ReadyBlock();
}

function ReadyBlock(){
  globals.task_start_time = Date.now();
  globals.action = Null;
  $('.instructions').hide();
  $('#stimulus-wrapper').hide();
  // $('#prompt').html('Get ready...').show();
  setTimeout(PrepareTrial, constants.ready_time);
}

function PrepareTrial(){
  $('#stimulus-wrapper, .instructions').hide();
  $('#prompt').html(constants.early_prompt);
  $('#prompt').removeClass('red');
  state.stim = _.sample(constants.flower_paths);
  $('#flower').attr('src', 'static/'+state.stim);
  // $('petal').css('background', 'green');
  // $('petal').hide();
  // PlacePetals(7, 1);
  $('#seed').css('width', '30%').css('height', '70%')
    .css('left', '35%').css('top', '15%')
    // .removeClass('spinning')
    .addClass('spinning_slow');

  $('#flower').css('width', '0%').css('left', '50%').css('top', '50%');
  state.wait = globals.wait_times.pop();
  // state.wait = globals.wait_times[state.trial_nr];
  $('#fix').html(constants.fix_txt).hide();
  // if(globals.pause){
  //   globals.idle = true;
  //   $('#prompt').html(constants.pause_prompt);
  // } else {
  // ...
  // }
  setTimeout(function(){
    $('#fix').show();
  }, constants.ITI*.5);
  setTimeout(StartTrial, constants.ITI);
}

function StartTrial(){
  console.log('Trial ' + state.trial_nr + ' w: ' + state.wait);
  state.t_start = Date.now();
  state.response = 0;           // 0/1/2 => None/Early/Late
  state.t_action = -1;
  state.t_ripe = -1;
  $('#current-score').html(state.score);
  $('#change-score').hide();
  $('#score, #prompt, #stimulus-wrapper, .option').show();
  globals.waiting = true;
  globals.action = EarlyHarvest;
  $('#fix').hide();
  $('#stimulus-wrapper').show();
  $('#prompt').show();
  StartTimer(state.wait);
};

function StartTimer(t){
  globals.timer = setTimeout(RipenCrop, t*1000);
}

function ResetTimer(){
  clearTimeout(globals.timer);
}


function EarlyHarvest(){
  console.log('EarlyHarvest');
  state.t_action = Date.now();
  state.response = 1;
  // console.log(state.t_action)
  Win(globals.small_prize);
}

function RipenCrop(){
  console.log('RipenCrop');
  // $('petal').css('background', 'yellow');
  // $('petal').show();
  $('#seed')
    .css('width', '0%')
  // .css('height', '0%')
  // .css('top', '50%')
    .css('left', '50%')
    // .removeClass('spinning_slow')
    // .addClass('spinning');
  $('#flower').css('width', '100%').css('left', '0%').css('top', '0%');
  // PlacePetals(7, 90);
  $('#prompt').html(constants.late_prompt);
  state.t_ripe = Date.now();
  globals.action = LateHarvest;
}

function LateHarvest(){
  console.log('LateHarvest');
  state.t_action = Date.now();
  state.response = 2;
  Win(globals.big_prize);
}

function Win(x){
  // console.log('Take: ' + x);
  ResetTimer();
  $('#stimulus-wrapper').hide();
  $('#prompt').hide();
  $('#fix')
    .html('+' + x)
    .show();
  state.outcome = x;
  state.score = state.score + x;
  $('#current-score').html(state.score);
  LogData();
}

function LogData(proceed){
  state.focus = 1*(!document.hidden);
  proceed = (typeof proceed === "undefined" || proceed === null) ? true : proceed;
  globals.action = Null;
  console.log('Log data');
  // console.log(state);
  $.ajax({
    type: 'POST',
    data: JSON.stringify(state),
    contentType: 'application/json',
    url: constants.datapath,
    success: function(data) {
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
  var t = (Date.now() - globals.task_start_time)/1000;
  if (t < globals.task_time) {
    PrepareTrial();
  } else {
    EndExperiment();
  }
};

function EndExperiment(){
  localStorage['score'] = state.score;
  window.location = './feedback.php';
};


function PlacePetals(npetals, offset){
  $('petal').css('transform', '');
  npetals = (typeof npetals === 'undefined') ? 7 : npetals;
  offset = (typeof offset === 'undefined') ? 90 : offset;
  if (npetals > 7){
    alert('Need to add more than 7 petals to html!');
  }
  var angles = _.range(0, .001 + Math.PI*2, Math.PI*2/npetals);
  angles.map(function(theta, i) {
    var x = Math.cos(theta);
    var y = Math.sin(theta);
    var css = 'translate(#1%, #2%)'
          .replace('#1', x*offset)
          .replace('#2', y*offset);
    $('#petal-' + i).css('transform', css);
  });
}


var W, H;
var subject_nr = localStorage['subject_nr'];
subject_nr = (typeof subject_nr === 'undefined') ?
  Math.round(Math.random()*1000000000) : subject_nr;


function generate_flower_paths(){
  var ns = [0,90,180,270];
  var abcs = ['A', 'B', 'C', 'D'];
  var paths = [];
  for(var i=0; i<ns.length; i++){
    for(var j=0; j<abcs.length; j++){
      var x = 'flower'  + abcs[i] + '_' + ns[j] + '.png';
      paths.push(x);
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
  // p_ripen         : .5,
  // p_ripen         : 1/14,
  // p_ripen         : 1/8,
  small_prize        : 1,
  big_prize          : 5,
  n_practice_trials  : 10,
  start_score        : 0,
  task_time          : 60 * 8,
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
  feedback_time      : 1500,
  ITI                : 2000,
  start_prompt       : 'Press SPACE to begin!',
  early_prompt       : 'Click to harvest early (for %1 pt) or wait for the flower to grow, and then harvest it (for %2 pts).'.replace('%1', globals.small_prize).replace('%2', globals.big_prize),
  late_prompt        : 'Click to harvest now for 5 pts!',
  break_prompt       : 'Time for a break.<br>You\'ve completed #1 of #2 rounds.<br>Click to go on.',
  fix_txt            : 'Planting...',
  // trials_per_block   : 16,
  // trials_per_section : 64,
  flower_paths       : generate_flower_paths(),
  datapath           : './log.php'
};

var state = {
  W                  : W,
  H                  : H,
  subject_nr         : subject_nr,
  practice           : 0,
  //// 0 = Exponential(1/8), 1 = Normal(8, 2), 2 = Bimodal[N(6,2) + N(14,2)]
  condition          : _.sample([0,1,2]),
  trial_nr           : 0,
  stim               : null,
  outcome            : null,
  t_start            : null,
  t_ripe             : null,
  t_action           : null,
  score              : globals.start_score,
  focus              : 1
};

function generate_wait_times(condition){
  // 0 = Exponential(1/8), 1 = Normal(8, 2), 2 = Bimodal[.75xN(6,2) + .25xN(14,2)]
  var kappa = 2/3;
  var wait_times;
  var sigma_wait = (condition==200) ? 0.25 : 2.0;
  var blooms = _.range(0, 1000 * kappa).map(
    function(){ return random_normal(6, sigma_wait); });
  var non_blooms = _.range(0, 1000 * (1-kappa)).map(
    function(){ return 99999999999; });
  wait_times = blooms.concat(non_blooms);
  wait_times = _.shuffle(wait_times);
  return wait_times;
}


$( document ).ready(function(){
  $( window ).resize(_.debounce(resize, 100));
  document.onkeydown = KeypressFunction;
  $('#flower').on('click', ClickFunction);
  $('#seed').on('click', ClickFunction);
  resize();
  // Get condition
  $.ajax({
    type: 'POST',
    url: './cb.php',
    data: {subject_nr: subject_nr},
    success: function(res) {
      var res = JSON.parse(res);
      console.log(res);
      // Condition numbers for this experiment are 200 and 201
      state.condition = 200 + res['next'];
      globals.wait_times = generate_wait_times(state.condition);
      Ready();
    },
    error: function(err){
      console.log(err);
      state.condition = _.sample([0, 1, 2]);
      globals.wait_times = generate_wait_times(state.condition);
      Ready();
    }
  });
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

function coin_toss(prob){
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


function random_exponential(p) {
  var f = function(i, p){
    res = coin_toss(p) ? i : f(i+1, p);
    return(res);
  };
  return(f(0, p));
}

function count_values(x){
  var vals = _.uniq(x).sort();
  var counts = vals.map(v => _.sum(x.map(_x => _x==v)));
  return(_.zipObject(vals, counts)); 
}
