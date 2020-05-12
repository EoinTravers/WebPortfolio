
var moral_items = [                                                                                
   "You see a teenage boy chuckling at an amputee he passes by while walking down the road.",    // q0
   "You see a runner taking a shortcut on the course during the marathon in order to win .",     // q1
   "You see a girl repeatedly interrupting her teacher as he explains a new concept.",           // q2
   "You see a coach celebrating with the opposing team's players who just won the game.",        // q3
   "You see a woman offering sex to anyone who buys her a drink.",                               // q4
   "You see a man telling his fiance&#769 that she has to switch to his political party.",       // q5
   "You see a girl laughing at another student forgetting her lines at a school play.",          // q6
   "You see a teenage football player pretending to be seriously fouled by an opposing player.", // q7
   "You see a teenage girl coming home late and ignoring her parent's strict curfew.",           // q8
   "You see the UK ambassador joking the USA about the stupidity of the British.",               // q9
   "You see an employee at a mortuary eating his pepperoni pizza off the top of a dead body.",   // q10
    "You see father requiring his son to become an airline pilot just like him",                 // q11
    "You see a man quickly cancelling a blind date as soon as he sees a woman.",                 // q12
    "You see someone cheating in a card game while playing with a group of strangers.",          // q13
    "You see a player publically swearing at his football coach during a cup final game.",       // q14
    "You see a teacher publicly saying she hopes another school wins a maths competition.",      // q15
    "You see a man searching through rubbish to find women's discarded underwear.",              // q16
    "You see a man telling his girlfriend that she must convert to his religion.",               // q17
    "You see a boy telling a woman that she looks just like her overweight bulldog.",            // q18
    "You see a professor giving a bad grade to a student just because he dislikes him.",         // q19
    "You see a group of women having a long and loud conversation during a church sermon.",      // q20
    "You see a man secretly voting against his wife in a local beauty pageant.",                 // q21
    "You see two first cousins getting married to each other in an elaborate wedding.",          // q22
    "You see a mother telling her son that she is going to choose all his friends.",             // q23
    "You see a man giggling as he passes by a cancer patient with a bald head.",                 // q24
    "You see an employee lying about the number of holidays she worked during the week.",        // q25
    "You see a student stating that her professor is a fool during an afternoon class.",         // q26
    "You see a Briton telling foreigners that the UK is an evil force in the world.",            // q27
    "You see a single man ordering an inflatable sex doll that looks like his secretary.",       // q28
    "You see a man forbidding his wife to wear clothing that he has not first approved."         // q29
]        

var moral_responses = [
    "Not Wrong",
    "Mildly wrong",
    "Quite Wrong",
    "Extremely Wrong"]
 
var moral_scales = {
    'Compassion' : [0, 6, 12, 18, 24  ],
    'Fairness'   : [1, 7, 13, 19, 25  ],
    'Authority'  : [2, 8, 14, 20, 26  ],
    'Loyalty'    : [3, 9, 15, 21, 27  ],
    'Sanctity'   : [4, 10, 16, 22, 28 ],
    'Liberty'    : [5, 11, 17, 23, 29 ]
}


var n_moral_to_ask_per_scale = 3;
function generateMoralSequence(){
    var items = _.map(moral_scales,
                      function(s){
                          return _.shuffle(s).slice(0, n_moral_to_ask_per_scale)
                      });
    return clump(_.flatten(items), 1)    
};

// GLOSSARY
// A. 0, 6, 12, 18, 24  – Compassion
// B. 1, 7, 13, 19, 25  – Fairness  
// C. 2, 8, 14, 20, 26  – Authority
// D. 3, 9, 15, 21, 27  – Loyalty
// E. 4, 10, 16, 22, 28 – Sanctity
// F. 5, 11, 17, 23, 29 – Liberty    


var moral_intructions="\
In this quiz, you will be shown a series of scenarios, <br>\
and asked to indicate to what extent you believe them to be morally wrong. <br>\
from \"Not Wrong\" to \"Extremely Wrong\". <br>\
Afterwards, you will see your moral score on a number of scales."

function ReadyMoralQuestions(state){
    $('#home').show();
    $('#title').html('Moral judgement');
    $('#content').html('')
        .append( $('<p>').addClass('box').html(moral_intructions) )
        .append( generateEnter('Tap to begin') );
    $('#enter').on('click', function(){AskMoralQuestions(globstate)})
    $('#content').trigger('create');      
}

function AskMoralQuestions(state){
    Show();
    var question_numbers = state.moral_to_ask[0]
    state.current_questions = question_numbers;
    state.moral_to_ask = _.tail(state.moral_to_ask)
    state['phase'] = 'moral';
    state['start_rt'] = Date.now();
    $('#content').html('')
    for(var i = 0; i < question_numbers.length; i++) {
        var n = question_numbers[i];
        var q  = generateChoice(moral_items[n], moral_responses, 'moral'+n)
        $('#content').append(q)
    }
    $('#content').trigger('create');
    $('.response-btn').on('click', function(e){
        var resp_btn = this;
        AnswerMoralQuestions(state, resp_btn);
    });
    var q_done = Object.keys(state.moral_responses).length + 1;
    var q_tot = q_done + state.moral_to_ask.length;
    $('#progress').html('Q' + q_done + ' of ' + q_tot).attr('id', 'progress')
    $('#progress').show();    
};
    

function  AnswerMoralQuestions(state, resp_btn){
    $('#progress').hide();
    $('.response-btn').off();    
    console.log('Answer')
    var j = state.current_questions;
    var response = {};
    response['moral'+j] = Number($(resp_btn).attr('i'));
    state['stop_rt'] = Date.now();
    LogMoralResponses(state, response);
    state.moral_responses = $.extend(state.moral_responses, response)
    if( state.moral_to_ask.length > 0 ){
        state.trial_number += 1;
        Blank();
        setTimeout(function(){
            AskMoralQuestions(state)
        }, blank_time);
    } else {
        MoralFeedback(state);
    }
};

function LogMoralResponses(state, last_response){
    var log = $.extend({}, last_response);
    var logvars = ['session', 'start_rt', 'stop_rt']
    for(var i = 0; i < logvars.length; i++) {
        var v  = logvars[i]
        log[v] = state[v]
    }
    console.log(log)
    localStorage['log'] += JSON.stringify(log) + '\n'
}

function MoralFeedback(state){
    var scores = GetMoralScores(state)
    var keys = Object.keys(scores)
    var d = $('<div>').addClass('box');
    d.append($('<h4>').html('Your Results'));
    for(var i = 0; i < keys.length; i++) {
        var k = keys[i]
        var s = scores[k]
        var denom = n_moral_to_ask_per_scale * 3; // 5 questions, max score of 3 on each;
        var h = $('<h5>').html(k + ': ' + Math.round(100*(s/denom) ) + '%');
        d.append(h)
    };
    LogData(state);
    state.moral_responses = [];
    state.moral_to_ask = generateMoralSequence();
    $('#content').html('')
    $('#content').append(d)
    $('#content').append(
        $('<button>').html('Back to Quiz').on('click', function(){ReadyMoralQuestions(state)}))
        // $('<button>').html('Home').on('click', function(){Home(state)}))
    $('#content').trigger('create')    
};


function GetMoralScores(state){
  var scores = {}
  var ks = Object.keys(moral_scales);
  for(var i = 0; i < ks.length; i++) {
    var k = ks[i]
    var qs = moral_scales[k]
    var score = _.sum( _.map(qs, function(q) {return(state.moral_responses['moral'+q])}) )
    scores[k] = score;
  }
  return(scores)
}
