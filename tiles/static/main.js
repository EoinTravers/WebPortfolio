"use strict";
// discrete.js
// Sample from discrete distributions.
// https://github.com/jacobmenick/sampling
var SJS;
var Sampling = SJS = (function(){

    // Utility functions
    function _sum(a, b) {
    return a + b;
    };
    function _fillArrayWithNumber(size, num) {
    // thanks be to stackOverflow... this is a beautiful one-liner
    return Array.apply(null, Array(size)).map(Number.prototype.valueOf, num);
    };
    function _rangeFunc(upper) {
    var i = 0, out = [];
    while (i < upper) out.push(i++);
    return out;
    };
    // Prototype function
    function _samplerFunction(size) {
    if (!Number.isInteger(size) || size < 0) {
      throw new Error ("Number of samples must be a non-negative integer.");
    }
    if (!this.draw) {
        throw new Error ("Distribution must specify a draw function.");
    }
    var result = [];
    while (size--) {
        result.push(this.draw());
    }
    return result;
    };
    // Prototype for discrete distributions
    var _samplerPrototype = {
    sample: _samplerFunction
    };

    function Bernoulli(p) {

    var result = Object.create(_samplerPrototype);

    result.draw = function() {
        return (Math.random() < p) ? 1 : 0;
    };

    result.toString = function() {
        return "Bernoulli( " + p + " )";
    };

    return result;
    }

    function Binomial(n, p) {

    var result = Object.create(_samplerPrototype),
    bern = Sampling.Bernoulli(p);

    result.draw = function() {
        return bern.sample(n).reduce(_sum, 0); // less space efficient than adding a bunch of draws, but cleaner :)
    }

    result.toString = function() {
        return "Binom( " +
        [n, p].join(", ") +
        " )";
    }

    return result;
    }

    function Discrete(probs) { // probs should be an array of probabilities. (they get normalized automagically) //

    var result = Object.create(_samplerPrototype),
    k = probs.length;

    result.draw = function() {
        var i, p;
        for (i = 0; i < k; i++) {
        p = probs[i] / probs.slice(i).reduce(_sum, 0); // this is the (normalized) head of a slice of probs
        if (Bernoulli(p).draw()) return i;             // using the truthiness of a Bernoulli draw
        }
        return k - 1;
    };

    result.sampleNoReplace = function(size) {
        if (size>probs.length) {
        throw new Error("Sampling without replacement, and the sample size exceeds vector size.")
        }
        var disc, index, sum, samp = [];
        var currentProbs = probs;
        var live = _rangeFunc(probs.length);
        while (size--) {
        sum = currentProbs.reduce(_sum, 0);
        currentProbs = currentProbs.map(function(x) {return x/sum; });
        disc = SJS.Discrete(currentProbs);
        index = disc.draw();
        samp.push(live[index]);
        live.splice(index, 1);
        currentProbs.splice(index, 1);
        sum = currentProbs.reduce(_sum, 0);
        currentProbs = currentProbs.map(function(x) {return x/sum; });
        }
        currentProbs = probs;
        live = _rangeFunc(probs.length);
        return samp;
    }

    result.toString = function() {
        return "Dicrete( [" +
        probs.join(", ") +
        "] )";
    };

    return result;
    }

    function Multinomial(n, probs) {

    var result = Object.create(_samplerPrototype),
    k = probs.length,
    disc = Discrete(probs);

    result.draw = function() {
        var draw_result = _fillArrayWithNumber(k, 0),
        i = n;
        while (i--) {
        draw_result[disc.draw()] += 1;
        }
        return draw_result;
    };

    result.toString = function() {
        return "Multinom( " +
        n +
        ", [" + probs.join(", ") +
        "] )";
    };

    return result;
    }

    function NegBinomial(r, p) {
    var result = Object.create(_samplerPrototype);

    result.draw = function() {
        var draw_result = 0, failures = r;
        while (failures) {
        Bernoulli(p).draw() ? draw_result++ : failures--;
        }
        return draw_result;
    };

    result.toString = function() {
        return "NegBinomial( " +  r +
        ", " + p + " )";
    };

    return result;
    }

    function Poisson(lambda) {
    var result = Object.create(_samplerPrototype);

    result.draw = function() {
        var draw_result, L = Math.exp(- lambda), k = 0, p = 1;

        do {
        k++;
        p = p * Math.random()
        } while (p > L);
        return k-1;
    }

    result.toString = function() {
        return "Poisson( " + lambda + " )";
    }

    return result;
    }

    return {
    _fillArrayWithNumber: _fillArrayWithNumber, // REMOVE EVENTUALLY - this is just so the Array.prototype mod can work
    _rangeFunc: _rangeFunc,
    Bernoulli: Bernoulli,
    Binomial: Binomial,
    Discrete: Discrete,
    Multinomial: Multinomial,
    NegBinomial: NegBinomial,
    Poisson: Poisson
    };
})();

//*** Sampling from arrays ***//
// Eventually merge into SJS ???
function sample_from_array(array, numSamples, withReplacement) {
    var n = numSamples || 1,
    result = [],
    copy,
    disc,
    index;

    if (!withReplacement && numSamples > array.length) {
    throw new Error("Sampling without replacement, and the sample size exceeds vector size.")
    }

    if (withReplacement) {
    while(numSamples--) {
        disc = SJS.Discrete(SJS._fillArrayWithNumber(array.length, 1));
        result.push(array[disc.draw()]);
    }
    } else {
    // instead of splicing, consider sampling from an array of possible indices? meh?
    copy = array.slice(0);
    while (numSamples--) {
        disc = SJS.Discrete(SJS._fillArrayWithNumber(copy.length, 1));
        index = disc.draw();
        result.push(copy[index]);
        copy.splice(index, 1);
        console.log("array: "+copy);
    }
    }
    return result;
}

"use strict";
// logic.js

function CreateStimuli(n_stim){
  function make_square(x, y){
    return $('<div>').addClass('square').css('left', x).css('top', y);
  }
  function add_square(x, y, parent){
    var sq = make_square(x, y);
    parent.append(sq);
    return sq;
  };
  var r = _.range(0, 100, 100/n_stim);
  var squares = r.map(x => r.map(y => add_square(x + '%', y + '%', $('#stimuli'))));
  squares = _.flatten(squares);
  return squares;
};

function Setup(){
  console.log('Setup');
  state.t_start_experiment = Date.now();
  globals.squares = CreateStimuli(state.n_squares);
  $('#stimuli, #reminder').hide();
  $('#prompt').html('+').show();
  setTimeout(PrepareTrial, globals.ITI);
};

function PrepareTrial(){
  console.log('PrepareTrial');
  var probs = sample_constrained_beta(state.grey_alpha, state.grey_beta,
                                      state.black_alpha, state.black_beta);
  state.k = _.sample(globals.dispersal_range);
  console.log('Probabilities:');
  console.log(probs);
  console.log(`k = ${state.k}`);
   _.map(constants.bgw, c => state['p_' + c] = probs[c]);
  $('#stimuli, #reminder').hide();
  BeginTrial();
};

function BeginTrial(){
  console.log('BeginTrial');
  state.evidence = sample_evidence(state.p_black, state.p_grey, state.p_white, state.k);
  state.t_start = Date.now();
  state.frame = 0;
  globals.action = L1Response;
  $('#stimuli, #reminder').show();
  $('#prompt').hide();
  UpdateEvidence();
  globals.interval = setInterval(UpdateEvidence, state.ISI);
};

function UpdateEvidence(){
  _.zipWith(globals.squares, state.evidence,
            (s, x) => $(s).css('background-color', float2grey(x)) );
  state.evidence_list.push(state.evidence);
  state.evidence = sample_evidence(state.p_black, state.p_grey, state.p_white, state.k);
  state.frame = state.frame + 1;
  // Forget very old frames (if we're not timing out)
  var mf = globals.max_frames_to_store;
  var nf = state.evidence_list.length;
  if(nf > mf){
    state.evidence_list = state.evidence_list.slice(nf-mf, nf);
  }
  // if(state.frame >= state.max_frames){
  //   Timeout();
  // }
};

function Timeout(){
  state.response = -1;
  state.t_response = -1;
  $('#stimuli, #reminder').hide();
  $('#prompt').html(constants.timeout_prompt).show();
  clearInterval(globals.interval);
  globals.action = function(e){
    var k = (typeof e.which == "number") ? e.which : e.keyCode;
    if(k == 32){
      LogData();
    }
  };
}

function L1Response(e){
  // F: 70, J: 74, 1-4: 49-52
  var k = (typeof e.which == "number") ? e.which : e.keyCode;
  var resp =
      (k == 70) ? 0 :
      (k == 74) ? 1 : null;
  if(resp != null){
    state.t_response = Date.now();
    state.response = resp;
    console.log(`Response: ${resp}`);
    AskConfidence();
  }
};

function AskConfidence(){
  clearInterval(globals.interval);
  $('#stimuli, #reminder').hide();
  $('#prompt').html(constants.confidence_prompt).show();
  globals.action = L2Response;
};

function L2Response(e){
  // F: 70, J: 74, 1-9: 49-57
  var k = (typeof e.which == "number") ? e.which : e.keyCode;
  console.log(k);
  if (k > 48 & k < 58){
    var conf = k - 48;
    state.t_confidence = Date.now();
    state.confidence = conf;
    console.log(`Confidence: ${conf}`);
    LogData();
  }
};

function LogData(){
  globals.action = Null;
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
  EndTrial();
}

function EndTrial(){
  var t_elapsed = Date.now() - state.t_start_experiment;
  if(t_elapsed < globals.experiment_length){
    $('#prompt').html('+').show();
    state.trial_nr += 1;
    setTimeout(PrepareTrial, globals.ITI);
  } else {
    setTimeout(EndExperiment, globals.ITI);
  }
}

function FeedbackPause(){
  // TO DO
}

function EndExperiment(){
  // localStorage['score'] = state.score;
  setTimeout(function(){
    console.log('END!!!');
    window.location = './feedback.html';
  }, 500);
};

"use strict";
// Main.js
console.log('Begin');

var state = {
  // All of these values are logged at the end of each trial
  subject_nr    : localStorage['subject_nr'] || Math.round(Math.random()*1000000000),
  trial_nr      : 0,
  n_squares     : 8,
  p_black       : null,
  p_grey        : null,
  p_white       : null,
  k             : null,
  grey_alpha    : 1,
  grey_beta     : 2,
  black_alpha   : 50,
  black_beta    : 50,
  evidence      : null,
  evidence_list : [],
  ISI           : 2000,
  max_frames    : Infinity//10
};

var globals = {
  // These values are accessed across functions, but not logged.
  ITI: 1000,
  max_frames_to_store: 30,
  experiment_length: 10 * 60 * 1000,
  n_squares_tot : state.n_squares**2,
  // drp: 2,//4, // Disperal range power, From 2^-n to 2^n
  action: Null
};
// globals['dispersal_range'] = _.range(-globals.drp, globals.drp+1).map(x => 2**x);
globals['dispersal_range'] = [1/4, 1, 4];

var constants = {
  // These are global variables which don't change.
  datapath: './log.php',
  bgw: ['black', 'grey', 'white'],
  confidence_prompt : "How sure are you in your response?<br />Press a key from 1 to 9.",
  timeout_prompt: "You ran out of time!<br/>" +
    "Please respond within 10 frames.<br/>Press SPACE to continue."
};

$( document ).ready(function(){
  $( window ).resize(_.debounce(resize, 100));
  document.onkeydown = function(e){ globals.action(e);};
  resize();
  Setup();
});

"use strict";
// Some handy plotting functions

function plot_setup(){
  var box = $('<div>')
      .attr('id', 'plot')
      .css('position', 'absolute')
      .css('width', '25vw')
      .css('height', '25vw')
      .css('left', '50vw')
      .css('top', '50vh')
      .css('transform', 'translate(-50%, -50%)')
      .css('border', 'solid black')
      .css('background-color', 'white');
  $('body').append(box);
  return box;
}

function normalise_points(X, edge){
  edge = edge || .1;
  var lo = _.min(X) - edge;
  var hi = _.max(X) + edge;
  var range = hi - lo;
  return X.map(x => (x - lo)/range);
}

function plot_points(x, y, box){
  x = normalise_points(x);
  y = normalise_points(y);
  _.zipWith(x, y, function(a,b){
    var p = $('<div>')
        .css('position', 'absolute')
        .css('width', '6pt')
        .css('height', '6pt')
        .css('left', 100*a +'%')
        .css('top',  100*b + '%')
        .css('transform', 'translate(-50%, -50%)')
        .css('border-radius', '50%')
        .css('background-color', 'red');
    box.append(p);
  });
};

function plot(x, y){
  var box = plot_setup();
  plot_points(x, y, box);
  return box;
}

function plot_clear(){
  $('#plot').remove();
}

function test_plot(){
  var x = _.times(1000, i => random_normal(0, 1));
  var y = _.times(1000, i => random_normal(0, 1));
  plot(x, y);
}

"use strict";
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
    state.W = $( window ).width();
    state.H = $( window ).height();
};


function coin_toss(prob){
  prob = prob || .5;
  var r = Math.random();
  return (r < prob);
}
function flip(prob) {return coin_toss(prob);};
function fiftyfifty() {return coin_toss(.5);};

// Standard Normal variate using Box-Muller transform.
function random_normal(mu, sigma) {
    mu = mu || 0;
    sigma  = sigma || 1;
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

function repeat_list(vals, reps){
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


function float2grey(x){
  // X value from 0 (black) to 1 (white);
  return `rgb(${x*255}, ${x*255}, ${x*255})`;
}


function sample_constrained_beta(grey_alpha, grey_beta, black_alpha, black_beta){
  // TODO: Verify this.
  var p_grey = jStat.beta.sample(grey_alpha, grey_beta);
  var balance_black = jStat.beta.sample(black_alpha, black_beta);
  var p_black = (1 - p_grey) * balance_black;
  var p_white = (1 - p_grey) * (1 - balance_black);
  return {black: p_black, grey:p_grey, white:p_white};
};

function zip_repeat(ns, xs, shuffle){
  shuffle =  shuffle | false;
  var list_of_vals =_.zipWith(ns, xs, (n, x) => repeat_array(x, n));
  var vals = _.flatten(list_of_vals);
  if(shuffle){
    return _.shuffle(vals);
  } else {
    return vals;
  }
}

function sample_multinomial(n, options, pvals){
  var ns = Sampling.Multinomial(n, pvals).draw();
  return zip_repeat(ns, options, shuffle=true);
}

function sample_evidence(p_black, p_grey, p_white, dispersion){
  // console.log('Dispersion ignored for now');
  // return sample_multinomial(n=globals.n_squares_tot,
  //                           options=[0, .5, 1],
  //                           pvals=[p_black, p_grey, p_white]);
  return sample_dispersed_multinomial(globals.n_squares_tot,
                                      [0, .5, 1],
                                      [p_black, p_grey, p_white],
                                      dispersion);
};


function sample_dispersed_multinomial(n, options, pvals, k){
  // Higher values of k are UNDER DISPERSED!
  var ns_initial = Sampling.Multinomial(n * k, pvals).draw();
  var ns_adj = ns_initial.map(x => Math.floor(x / k));
  // Correct rounding errors if k > 1
  while (_.sum(ns_adj) < n){
    var i = _.sample(_.range(pvals.length));
    ns_adj[i] += 1;
  }
  if(_.sum(ns_adj) != n){
    throw "Something went wrong in sampling funcition.";
  }
  return zip_repeat(ns_adj, options, shuffle=true);
};

// function test_dispersed_multinomial(k){
//   var P1 = _.range(0, 1, .1);
//   var Xs = P1.map(function(p1){
//     var pvals = [p1, .5*(1-p1), .5*(1-p1)];
//     var x = sample_dispersed_multinomial(64, [0,1,2], pvals, k);
//     var n = _.sum(x.map(v => v==1));
//     return n;
//   });
//   plot(P1, Xs);
// }

// stringify(data){
//   if(typeof(data)=='object'){
//   }
//   var type = typeof(data);
//   if(type == 'number' | type == '')
//     if(typeof(data)==)
//       _.map(Object.keys(state), k => typeof(state[k]))
// }

function save_screenshot(){
  // https://stackoverflow.com/a/24619118/1717077
  html2canvas(document.querySelector("#stimuli")).then(
    function(canvas) {
    // document.body.appendChild(canvas)      
      theCanvas = canvas;
      canvas.toBlob(function(blob) {
        saveAs(blob, "squares.png"); 
      });
    }
  );
};

function start_screenshotting(){
  $('#stimuli').addClass('screenshotable');
  setInterval(save_screenshot, state.ISI);
  
}
