
// Altruism.js

var altruism_items = [                                                                                                  //
    "If possible, I would return lost money to the rightful owner.",                                                    // q0
    "I would avoid aiding someone in a medical emergency if I could.",                                                  // q1 (-)
    "Helping friends and family is one of the great joys in life.",                                                     // q2
    "I try to offer my help with any activities my community or school groups are carrying out.",                       // q3
    "Volunteering to help someone is very rewarding.",                                                                  // q4
    "I rarely contribute money to a worthy cause.",                                                                     // q5 (-)
    "Doing volunteer work makes me feel happy.",                                                                        // q6
    "Unless they are part of my family, helping the elderly isn't my responsibility.",                                  // q7 (-)
    "When given the opportunity, I enjoy aiding others who are in need.",                                               // q8
    "Children should be taught about the importance of helping others.",                                                // q9
    "I dislike giving directions to strangers who are lost.",                                                           // q10 (-)
    "One should donate time or money to charities every month.",                                                        // q11
    "I plan to donate my organs when I die with the hope that they will help someone else live.",                       // q12
    "Helping others is usually a waste of time.",                                                                       // q13 (-)
    "I feel at peace with myself when I have helped others.",                                                           // q14
    "If the person in front of me in the check-out line at a store was a few pence short, I would pay the difference.", // q15
    "I feel proud when I know that my generosity has benefited a needy person.",                                        // q16
    "Helping people does more harm than good because they come to rely on others and not themselves.",                  // q17 (-)
    "It feels wonderful to assist others in need.",                                                                     // q18
    "Giving aid to the poor is the right thing to do."];                                                                 // q19

var altruism_negative = [1, 5, 7, 10, 13, 17];

var altruism_responses = [
    "Strongly Disagree",
    "Disagree",
    "Undecided",
    "Agree",
    "Strongly Agree"];

var n_altruism_to_ask = 10;
function generateAltruismSequence(){
    return clump(_.shuffle(_.range(altruism_items.length)), 1).slice(0, n_altruism_to_ask);
}

var altruism_intructions="\
In this quiz, you will be shown a series of statements, <br>\
and asked to indicate to what extent you agree with them, <br>\
from \"Strongly Disagree\" to \"Strongly Agree\". <br>\
Afterwards, you will see your overall score on the altruism scale.";

function ReadyAltruismQuestions(state){
    $('#home').show();
    $('#title').html('Altruism');
    $('#content').html('')
        .append( $('<p>').addClass('box').html(altruism_intructions) )
        .append( generateEnter('Tap to begin') );
    $('#enter').on('click', function(){AskAltruismQuestions(globstate)})
    $('#content').trigger('create');      
}

function AskAltruismQuestions(state){
    Show();
    var question_numbers = state.altruism_to_ask[0]
    state.current_questions = question_numbers;
    state.altruism_to_ask = _.tail(state.altruism_to_ask)
    state['phase'] = 'altruism';
    state['start_rt'] = Date.now();
    $('#content').html('')
    for(var i = 0; i < question_numbers.length; i++) {
        var n = question_numbers[i];
        var q  = generateChoice(altruism_items[n], altruism_responses, 'altruism'+n)
        $('#content').append(q)
    }
    $('#content').trigger('create');
    $('.response-btn').on('click', function(e){
        var resp_btn = this;
        AnswerAltruismQuestions(state, resp_btn);
    });

    var q_done = Object.keys(state.altruism_responses).length + 1;
    var q_tot = q_done + state.altruism_to_ask.length;
    $('#progress').html('Q' + q_done + ' of ' + q_tot).attr('id', 'progress')
    $('#progress').show();
};

function  AnswerAltruismQuestions(state, resp_btn){
    $('#progress').hide();
    $('.response-btn').off();    
    console.log('Answer')
    var j = state.current_questions;
    var response = {};
    response['altruism'+j] = Number($(resp_btn).attr('i'));
    state['stop_rt'] = Date.now();
    LogAltruismResponses(state, response);
    state.altruism_responses = $.extend(state.altruism_responses, response)
    if( state.altruism_to_ask.length > 0 ){
        state.trial_number += 1;
        Blank();
        setTimeout(function(){
            AskAltruismQuestions(state)
        }, blank_time);
    } else {
        AltruismFeedback(state);
    }
};

function LogAltruismResponses(state, last_response){
    var log = $.extend({}, last_response);
    var logvars = ['session', 'start_rt', 'stop_rt']
    for(var i = 0; i < logvars.length; i++) {
        var v  = logvars[i]
        log[v] = state[v]
    }
    console.log(log)
    localStorage['log'] += JSON.stringify(log) + '\n'
}

var altruism_feedback_text = "You scored {}%  on the altruism scale.";

function AltruismFeedback(state){
    var score = GetAltruismScores(state);//_.sum(Object.values(state.altruism_responses));
    var max = n_altruism_to_ask * 4;
    var pcnt = Math.round(100*(score/max));
    var d = $('<div>').addClass('box');
    d.append($('<h4>').html('Your Results'));
    d.append(
        $('<p>').html(altruism_feedback_text.replace('{}', pcnt)));
    LogData(state);
    state.altruism_responses = [];
    state.altruism_to_ask = generateAltruismSequence();
    $('#content').html('')
    $('#content').append(d)
    $('#content').append(
        $('<button>').html('Back to Quiz').on('click', function(){ReadyAltruismQuestions(state)}))
        // $('<button>').html('Home').on('click', function(){Home(state)}))
    $('#content').trigger('create')
};

function GetAltruismScores(state){
    var qs = _.range(0, altruism_items.length);
    var score = _.sum( _.map(qs, function(q){
        var is_neg = altruism_negative.indexOf(q) > -1
        var resp = state.altruism_responses['altruism'+q]
        if(typeof resp === "undefined"){
            return 0;
        }
        if(is_neg){
            return 4 - resp;
        } else {
            return resp;
        }
    }) );
    return score
};
