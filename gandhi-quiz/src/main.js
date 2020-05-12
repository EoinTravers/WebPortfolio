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
