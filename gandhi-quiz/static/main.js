
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


var gandhi_items = [
    {"question": "Who first called Gandhi, \"Father of the Nation\"?",
     "responses": ["Rabindranath Tagore", " Jawaharlal Nehru", " Subhash Chandra Bose"]},
    {"question": "What was Gandhi's middle name?",
     "responses": ["Karamchand", " Mohandas", " Karandas"]},
    {"question": "In what year was Gandhi named Time Magazine Man of the Year?",
     "responses": ["1936", " 1942", " 1930"]},
    {"question": "How many times was Gandhi nominated for the Nobel Prize?",
     "responses": ["5", " 4", " 3"]},
    {"question": "Which country issued a stamp in his honour in 1969?",
     "responses": ["Germany", " France", " Great Britain"]},
    {"question": "In 1931, Gandhi exchanged letters with whom?",
     "responses": ["King George V", " Albert Einstein", " Winston Churchill"]},
    {"question": "At school, how was Gandhi rated by teachers?",
     "responses": ["Good in English, Good in Geography",
                   "Weak in English, Weak in Geography",
                   "Good in English, Weak in Geography"]},
    {"question": "In which station in South Africa was he thrown off the train?" ,
     "responses": ["Pietermaritzburg", " Durban", " Johannesburg"]},
    {"question": "When he appeared as a lawyer in court in Durban, he…",
     "responses": ["Refused to call the judge, Your Honour", " Refused to take off his turban", " Insisted on wearing sandals"]},
    {"question": "What age was Gandhi when he first went to South Africa?",
     "responses": ["27", " 24", " 29"]},
    {"question": "The cost of the Parliament Square Gandhi statue was...",
     "responses": ["£500,000", " £250,000", " £1000,000"]},
    {"question": "The height of the Parliament Square Gandhi Statue is...",
     "responses": ["9 feet", " 12 feet", " 7 feet"]},
    {"question": "Gandhi returned to India from South Africa in...",
     "responses": ["1915", " 1912", " 1921"]},
    {"question": "How many Oscars did the film Gandhi win?",
     "responses": ["10", " 6", " 8"]},
    {"question": "In the South African Boer war, Gandhi served as...",
     "responses": ["A legal advisor", " A stretcher-bearer", " A telegraph operator"]},
    {"question": "Gandhi's famous salt march took place in...",
     "responses": ["1935", " 1930", " 1932"]},
    {"question": "For the film Gandhi, how many 'extras' were employed in the funeral scene?",
     "responses": ["100,000", " 200,000", " 300,000"]},
    {"question": "Gandhi was the...",
     "responses": ["Youngest of four children", " Eldest of three children", " The middle child of five children"]},
    {"question": "The term Mahatma used to call Gandhi was coined by...",
     "responses": ["Jawaharlal Nehru", " Rabindranath Tagore", " Albert Einstein"]},
    {"question": "In July 1939, Gandhi wrote a letter to...",
     "responses": ["King George VI", " Winston Churchill", " Adolf Hitler"]},
    {"question": "What is the most common misspelling of Gandhi's name?",
     "responses": ["Ghandi", " Gahndi", " Ghandhi"]
    }
];


var gandhi_correct = [2, 0, 2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 0, 2, 1, 1, 2, 0, 1, 2, 0];


var n_gandhi_to_ask = 10;
function generateGandhiSequence(){
    return clump(_.shuffle(_.range(gandhi_items.length)), 1).slice(0, n_gandhi_to_ask)
};



var gandhi_intructions="\
This quiz is all about Gandhi and his life,\
and consists of a number of multiple choice questions.<br>\
Afterwards, you will see your \"Gandhi IQ\"."

function ReadyGandhiQuestions(state){
    $('#home').show();
    $('#title').html('Gandhi Quiz');
    $('#content').html('')
        .append( $('<p>').addClass('box').html(gandhi_intructions) )
        .append( generateEnter('Tap to begin') );
    $('#enter').on('click', function(){AskGandhiQuestions(globstate)})
    $('#content').trigger('create');      
}

function AskGandhiQuestions(state){
    Show();
    var question_numbers = state.gandhi_to_ask[0];
    state.current_questions = question_numbers;
    state.gandhi_to_ask = _.tail(state.gandhi_to_ask);
    state['phase'] = 'gandhi';
    state['start_rt'] = Date.now();
    $('#content').html('');
    for(var i = 0; i < question_numbers.length; i++) {
        var n = question_numbers[i];
        var q  = generateChoice(gandhi_items[n]['question'],
                                gandhi_items[n]['responses'],
                                'gandhi'+n,
                                'vertical')
        $('#content').append(q)
    }
    $('#content').trigger('create')
    $('.response-btn').on('click', function(e){
        var resp_btn = this;
        AnswerGandhiQuestions_part1(state, resp_btn)
    });

    var q_done = Object.keys(state.gandhi_responses).length + 1;
    var q_tot = q_done + state.gandhi_to_ask.length;
    $('#progress').html('Q' + q_done + ' of ' + q_tot).attr('id', 'progress')
    $('#progress').show();    
}

function AnswerGandhiQuestions_part1(state, resp_btn){
    $('#progress').hide();
    $('.response-btn').off();
    console.log('Answer')
    var j = state.current_questions;
    var response = {};
    var r = Number($(resp_btn).attr('i'));
    response['gandhi'+j] = r;
    state['stop_rt'] = Date.now();
    LogGandhiResponses(state, response);
    state.gandhi_responses = $.extend(state.gandhi_responses, response);
    // Do feedback
    var correct = gandhi_correct[j];
    var tick = $('<span>').addClass('tick').html('&#10004;')
    $('button[i="' + correct + '"]').append(tick)
    if(r != correct) {
        var cross = $('<span>').addClass('cross').html('&#10060;')
        $('button[i="' + r + '"]').append(cross)
        var fb = "Incorrect.";
        soundWrong.play();
    } else {
        var fb = "Correct!"
        soundRight.play();
    };
    $('#content')
        .append($('<p>').attr('id', 'gandhi-fb').html(fb))
        .append(generateEnter('Next'));
    $('#enter').on('click', function(){
        AnswerGandhiQuestions_part2(state)
    });
    $('#content').trigger('create')
    console.log(state);
};

function  AnswerGandhiQuestions_part2(state){
    if( state.gandhi_to_ask.length > 0 ){
        state.trial_number += 1;
        AskGandhiQuestions(state);
    } else {
        GandhiFeedback(state);
    }
};

function GetGandhiAnswers(indices){
    var these_responses = {}
    for(var i = 0; i < indices.length; i++) {
        var j = indices[i];
        var q = 'gandhi'+j;
        var resp = $("input[type='radio'][name='radio-" + q + "']:checked");
        if (resp.length == 0){
            return(0)
        }
        console.log(resp)
        var txt = resp.siblings().attr('i');
        these_responses[q] = txt;//gandhi_responses.indexOf(txt);
    };
    return(these_responses);
};

function LogGandhiResponses(state, last_response){
    // var log = $.extend({}, state.gandhi_responses);
    var log = $.extend({}, last_response);
    var logvars = ['session', 'start_rt', 'stop_rt']
    for(var i = 0; i < logvars.length; i++) {
        var v  = logvars[i]
        log[v] = state[v]
    }
    console.log(log)
    localStorage['log'] += JSON.stringify(log) + '\n'
}

var gandhi_feedback_text = "You scored {1} out of " +
    n_gandhi_to_ask +".<br>" +
    "Your Gandhi IQ is {2}%.<br>Well done!";

function GandhiFeedback(state){
    var score = GetGandhiScores(state);
    var d = $('<div>');
    d.append($('<h4>').html('Your Results'));
    d.append(
        $('<p>').html(
            gandhi_feedback_text
                .replace('{1}', score)
                .replace('{2}', Math.round(100*(score/n_gandhi_to_ask)))
        )
    );
    LogData(state);
    state.gandhi_responses = [];
    state.gandhi_to_ask = generateGandhiSequence();
    $('#content').html('')
    $('#content').append(d)
    $('#content').append(
        $('<button>').html('Back to Quiz').on('click', function(){ReadyGandhiQuestions(state)}))
    $('#content').trigger('create')
};

function GetGandhiScores(state){
    return _.sum(
        enumerate(gandhi_correct,
                  function(i, corr){
                      return(Number(state.gandhi_responses['gandhi'+i]==corr))
                  })
    );
}

// // // // // 
// Main.js
// // // // // 

// Global declarations
// var socket,
//     globstate,
//     current_state;
// var choice_older_solo,
//     choice_difference_solo,
//     choice_older_duo,
//     choice_difference_duo;
// var max_response_time = 60 * 2;

var blank_time = 100;
// var fb_time = 2000;

var logging_vars = ['session', 'device'];
function LogData(state){
    var log_data = {
        session:state.session,
        device:state.device,
        phase:state.phase,
        responses:state[state.phase+'_responses']
    }
    console.log(log_data);
    $.post('save.php', log_data);
};
                    

function ReadyFunction(){
    var device = localStorage.device || Math.round(Math.random()*10e7);
    var state = {
        device: device,
        session: Number(localStorage.session) || 0,
        moral_to_ask: generateMoralSequence(),
        altruism_to_ask: generateAltruismSequence(),
        citizenship_to_ask: generateCitizenshipSequence(),
        gandhi_to_ask: generateGandhiSequence(),
        moral_responses: {},
        altruism_responses: {},
        citizenship_responses: {},
        gandhi_responses: {},
        trial_number: 1
    };
    globstate = state;
    Home(state)
    $('#home').on('click', function(){
        $('#menupanel').panel('open')
    });
    $('#menuHome').on('click', function(){
        $('#menupanel').panel('close')
        ReadyFunction()
    });
    $('#menuFS').on('click', toggleFullScreen);
    $('#menuResume').on('click', function(){
        $('#menupanel').panel('close');
    });
};

function Home(state){
    $('#progress').hide();
    state.session = state.session + 1;
    localStorage.session = state.session;
    $('#title').html('Gandhi Day');
    $('#content').html('')
    var b1 = $('<button>').html('Moral Judgements').on('click', function(){ReadyMoralQuestions(state)});
    $('#content').append(b1)
    var b2 = $('<button>').html('Altruism').on('click', function(){ReadyAltruismQuestions(state)});
    $('#content').append(b2)
    var b3 = $('<button>').html('Global Citizenship').on('click', function(){ReadyCitizenshipQuestions(state)});
    $('#content').append(b3)
    var b4 = $('<button>').html('Gandhi Quiz').on('click', function(){ReadyGandhiQuestions(state)});
    $('#content').append(b4)
    $('#content').trigger('create')    
}

function Quit(){
    ReadyFunction();
}

function Blank(){
    $('#content').hide();
};

function Show(){
    $('#content').show();
};

$(document).ready(ReadyFunction);


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

// Templates

function generateChoiceTemplate(question, options, ask_conf) {
    if (typeof ask_conf == 'undefined') {
        var ask_conf = true;
    }    
    var div = $('<div>')
        .addClass('choiceDiv')
    var fset = generateChoice(question, options);
    div.append(fset)
    if(ask_conf){
        var confidence = generateConfidenceSlider('How confident are you?')
        confidence.css('display', 'none');
        div.append(confidence);
    }
    var enter = generateEnter('Enter')
    div.append(enter);
    return (div)
};

function generateEnter(text){
    var text = text || 'Enter'
    var enter = $('<fieldset>').
        attr('id', 'enter-field')
        .addClass('enterField')
        .append(
            $('<button>').html(text).attr('id', 'enter')
        )
    return enter;
};

function generateChoice(question, options, name, datatype){
    var name = name || 'choice';
    var datatype = datatype || 'horizontal';
    var fset_label = 'question-text';
    var legend_class = 'question-legend';
    if(datatype=='horizontal'){
        fset_label = 'big-' + fset_label;
        legend_class = 'big-' + legend_class;
    }
    var fset = $('<fieldset>')
    // .attr('class', 'choiceField')
        .attr('data-role', 'controlgroup')
        .attr('data-type', datatype)
        .attr('id', name)
        .addClass(legend_class)
    fset.append(
        $('<legend>').addClass('box').append(
            $('<div>').html(question).attr('id', fset_label)
        )
    );
    // Breaking the functional rules
    enumerate(options,
              function(i, o) {
                  var btn = $('<button>')
                  // .addClass('two-opt')
                      .addClass('btn')
                      .addClass('response-btn')
                      // .attr('onclick', 'alert("Response ' + i + '")')
                      .attr('i', i)
                      .html(o)
                  fset.append(btn)
              })
    // enumerate(options,
    //           function(i, o) {
    //               var inp = $('<input>')
    //               // .addClass('two-opt')
    //                   .attr('name', 'radio-' + name)
    //                   .attr('id', 'radio-' + name + +i)
    //                   .attr('type', 'radio')
    //               var lab =  $('<label>')
    //                   .attr('for', 'radio-' + name + +i)
    //                   .attr('i', i)
    //                   .html(o)
    //               fset.append(inp)
    //               fset.append(lab)
    //           })
    return (fset);
}

var soundRight = new Audio('imgs/right.mp3');
var soundWrong = new Audio('imgs/wrong.mp3');

// function generateConfidenceSlider(question){
//     var nm = 'confidence-slider'
//     var div = $('<div>')
//         .addClass('confidenceDiv')
//         .attr('id', 'confidence')    
//     div.append(
//         $('<label>').
//             attr('for', nm)
//             .attr('id', 'confidence-legend')
//             .html(question));
//     var inner_div = $('<div>')
//     var hud = $('<span>')
//         .attr('id', 'confidence-slider-hud');
//     hud.append(
//         $('<span>').attr('id', 'confidence-slider-val').html('75'));
//     hud.append('%');
//     inner_div.append(hud)
//     var slider = $('<input>')
//         .attr('type', 'range').attr('name', nm).attr('id', nm)
//         .attr('value', '75').attr('min', '50').attr('max', '100')
//         .attr('data-highlight', 'true')
//     inner_div.append(slider)
//     div.append(inner_div)
//     return (div);
// }


// Utils.js

function enumerate(lst, f){
    var z = _.zip(_.range(0, lst.length),
                  lst)
    return _.map(z, function(x){
        return f(x[0], x[1])
    })
};

function clump(list, n){
    if(list.length==0) {
        return list
    }
    else {
        var head = list.slice(0, n)
        var tail = list.slice(n, list.length)
        return [head].concat(clump(tail, n))
    }
}

function toggleFullScreen() {
    if (!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

// function object_to_array(obj){
//     var the_obj = objl
//     Object.keys(obj).map(function (key) { return the_obj[key]; });
// }
