
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
