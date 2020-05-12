
$(window).on('load', BeginExperiment);

var subject_nr = localStorage['tate_subject_nr'] || 0;
subject_nr++;
localStorage['tate_subject_nr'] = subject_nr;


var state = {
    subject_nr: subject_nr,
    start_time: Date.now(),
    run: null,
    perfume_nr: 0,
    question_nr: 0,
    question: null,
    response: null,
    reverse: null,
    t0: null,
    rt: null
};

var global = {
    questions : [['Rough', 'Smooth'],
                 ['Thick', 'Thick'],
                 ['Light', 'Heavy'],
                 ['Supple', 'Rigid']],
    question_order: null
};
var n_questions = 4;
var n_perfumes = 3;

function BeginExperiment(){
    $('#subject-id').html(state.subject_nr);
    $('.screen').hide();
    $('#stimuli-div').show();
    var question_order = [1,2,3,4];
    global.question_order = shuffle(question_order);
    $('#stimuli-div').show();
    $('input[name="which-run"]').change(function(){
        $('#run-btn')
            .show()
            .click(StartRun);
    });
};

function StartRun(){
    $('#stimuli-div').hide();
    $('#prompt-div').show();
    state.run = $('input[name="which-run"]:checked').attr('response');
    $('#set-id').html(state.run);
    $('.perfume-id').html(state.perfume_nr + 1);
    $('#start-btn').off().click(AskQuestions);
};

function AskQuestions(){
    $('#prompt-div').hide();
    $('#response-div').show();
    $('#response-slider').val('50').slider('refresh');
    var qn = global.question_order[state.question_nr];
    state.question = qn;
    var q = global.questions[qn-1];
    state.reverse = flip();
    if(state.reverse){
        var q2 = q[0], q1 = q[1];
    } else {
        var q1 = q[0], q2 = q[1];
    }
    $('#lab1').html(q1);
    $('#lab2').html(q2);
    $('#enter-btn').off().click(NextQuestion);
    state.t0 = Date.now();
};

function NextQuestion(){
    $('#response-div').hide();
    state.rt = Date.now() - state.t0;
    state.response = $('#response-slider').val();
    SendData('http://eointravers.com/experiments/save_everything.php', state);
    if(state.question_nr < n_questions-1){
        state.question_nr++;
        setTimeout(AskQuestions, 500);
    } else {
        NextPerfume();
    }
};

function NextPerfume(){
    if(state.perfume_nr < n_perfumes-1){
        state.perfume_nr++;
        state.question_nr = 0;
        setTimeout(StartRun, 500);
    } else {
        End();
    }
};

function End(){
    $('.screen').hide();
    $('#end-div').show();
};


////////////////////////////////////////////
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function flip(){
    return Math.random() > .5;
}


function SendData(url, data){
    data['t'] = Date.now();
    console.log(data);
    var res =  $.ajax({
        type: 'POST',
        url: url,
        data: data,
        success: function(res) { loggit(res); }
    });
    console.log(res);
}

function loggit(x){
    console.log(x);
}
