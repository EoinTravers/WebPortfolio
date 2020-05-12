var citizenship_items = [                                                                                                                       
    "I believe the norms and values of my own culture are better than those of other cultures.",                                   // q 0 
    "Freedom of speech is less important to people in poor countries than it is to people in the UK.",                             // q 1 
    "In the UK, we are richer than people in poor countries because we organise things better.",                                   // q 2 
    "I prefer people from my own culture living next to me rather than people from a different culture.",                          // q 3 
    "I believe a child from a poor country having fewer opportunities than I have is unjust.",                                     // q 4 
    "I believe Islam is just as good or bad as Christianity.",                                                                     // q 5 
    "I believe that I should have a better chance of finding a job in the UK than a Polish citizen who is looking for work here.", // q 6
    
    "I can make a contribution to solving global problems through choices that I make in day-to-day life.",                        // q 7 
    "If the UK were to refuse entry to asylum seekers, the countries surrounding us would receive more asylum seekers.",           // q 8 
    "Rich countries benefit from solving poverty in poor countries.",                                                              // q 9
    "The UK do not need other countries in order to earn money.",                                                                  // q10
    "Some clothing in the UK is cheap because it is made in poor countries, by people earning a low wage.",                        // q11
    "The UK are not affected by unemployment in other countries.",                                                                 // q12
    "Protecting rain forests in Brazil, i.e. preventing them from being cut down, is good for the climate in the UK.",             // q13
    "The melting of the ice-caps at the North and South Poles does not affect us in the UK.",                                      // q14
    
    "The UK must help poor countries to solve their problems.",                                                                    // q15
    "People in poor countries must solve their poverty themselves.",                                                               // q16
    "The UK should not interfere with how other countries treat their natural environment.",                                       // q17
    "I feel responsible when I see other people in the world suffering in poverty.",                                               // q18
    "The British government should only focus on problems in the UK.",                                                             // q19
    "People have a joint responsibility to help victims of natural disasters across the globe.",                                   // q20
    "I believe the British government must hold other countries to account when they violate human rights."];                      // q21

var citizenship_responses = ["Totally disagree", "Disagree", "Don't know", "Agree", "Totally Agree"];

 
var citizenship_scales = {
    'Equality'              : [0, 1, 2, 3, 4, 5, 6],
    'Mutual dependency'     : [7, 8, 9, 10, 11, 12, 13, 14],
    'Shared responsibility' : [15, 16, 17, 18, 19, 20]
}

var citizenship_negative = [0, 1, 2, 3, 6, 10, 12, 14, 16, 17, 19]; // Negative scored items

function generateCitizenshipSequence(){
    return( clump(_.shuffle(_.range(citizenship_items.length)), 1) )
};

var citizenship_intructions="\
In this quiz, you will be shown a series of statements, <br>\
and asked to indicate to what extent you agree with them, <br>\
from \"Strongly Disagree\" to \"Strongly Agree\". <br>\
Afterwards, you will see your global citzenship scores, on a number of subscales.";

function ReadyCitizenshipQuestions(state){
    $('#home').show();
    $('#title').html('Global Citizenship');
    $('#content').html('')
        .append( $('<p>').addClass('box').html(citizenship_intructions) )
        .append( generateEnter('Tap to begin') );
    $('#enter').on('click', function(){AskCitizenshipQuestions(globstate)})
    $('#content').trigger('create');      
}

function AskCitizenshipQuestions(state){
    Show();
    var question_numbers = state.citizenship_to_ask[0]
    state.current_questions = question_numbers;
    state.citizenship_to_ask = _.tail(state.citizenship_to_ask)
    state['phase'] = 'citizenship';
    state['start_rt'] = Date.now();
    $('#content').html('')
    for(var i = 0; i < question_numbers.length; i++) {
        var n = question_numbers[i];
        var q  = generateChoice(citizenship_items[n], citizenship_responses, 'citizenship'+n)
        $('#content').append(q)
    }
    $('#content').trigger('create');
    $('.response-btn').on('click', function(e){
        var resp_btn = this;
        AnswerCitizenshipQuestions(state, resp_btn);
    });

    var q_done = Object.keys(state.citizenship_responses).length + 1;
    var q_tot = q_done + state.citizenship_to_ask.length;
    $('#progress').html('Q' + q_done + ' of ' + q_tot).attr('id', 'progress')
    $('#progress').show();    
};

function  AnswerCitizenshipQuestions(state, resp_btn){
    $('#progress').hide();
    $('.response-btn').off();    
    console.log('Answer')
    var j = state.current_questions;
    var response = {};
    response['citizenship'+j] = Number($(resp_btn).attr('i'));
    state['stop_rt'] = Date.now();
    LogCitizenshipResponses(state, response);
    state.citizenship_responses = $.extend(state.citizenship_responses, response)
    if( state.citizenship_to_ask.length > 0 ){
        state.trial_number += 1;
        Blank();
        setTimeout(function(){
            AskCitizenshipQuestions(state)
        }, blank_time);
    } else {
        CitizenshipFeedback(state);
    }
};

function LogCitizenshipResponses(state, last_response){
    var log = $.extend({}, last_response);
    var logvars = ['session', 'start_rt', 'stop_rt']
    for(var i = 0; i < logvars.length; i++) {
        var v  = logvars[i]
        log[v] = state[v]
    }
    console.log(log)
    localStorage['log'] += JSON.stringify(log) + '\n'
}

var citizenship_feedback_text = "You scored {}% on the global citizenship scale.";

function CitizenshipFeedback(state){
    var scores = GetCitizenshipScores(state)
    var raw_scores = Object.keys(scores).map(function (key) { return scores[key]; });
    var overall = Math.round(_.mean(raw_scores));
    var keys = Object.keys(scores);
    var d = $('<div>').addClass('box');
    d.append($('<h4>').html('Your Results'));
    for(var i = 0; i < keys.length; i++) {
        var k = keys[i]
        var s = scores[k]
        var h = $('<p>').html(k + ': ' + s + '%')
        d.append(h)
    };
    d.append( $('<h3>').html('Overall citizenship score: ' + overall + '%'));
    LogData(state);
    state.citizenship_responses = [];
    state.citizenship_to_ask = generateCitizenshipSequence();
    $('#content').html('')
    $('#content').append(d)
    $('#content').append(
        $('<button>').html('Back to Quiz').on('click', function(){ReadyCitizenshipQuestions(state)}))
        // $('<button>').html('Home').on('click', function(){Home(state)}))
    $('#content').trigger('create')    
};

function GetCitizenshipScores(state){
    var scores = {}
    var keys = Object.keys(citizenship_scales)
    for(var i = 0; i < keys.length; i++) {
        var k = keys[i]
        var qs = citizenship_scales[k]
        var score = _.sum( _.map(qs, function(q){
            var is_neg = citizenship_negative.indexOf(q) > -1
            var resp = state.citizenship_responses['citizenship'+q]
            if(typeof resp === "undefined"){
                return 0;
            }
            if(is_neg){
                return 4 - resp;
            } else {
                return resp;
            }
        }) );
        scores[k] = Math.round( 100 * (score / (qs.length*4) ) );
    }
    return(scores)
};
