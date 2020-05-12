get_design = function(){

    var triads = [
        {"stim_id":"1",  "word":"active",         "target":"aerobics instructor", "foil1":"accountant",          "foil2":"lab technician",      "target_plural":"aerobics instructors", "foil1_plural":"accountants",          "foil2_plural":"lab technicians"},
        {"stim_id":"2",  "word":"ambitious",      "target":"businessman",         "foil1":"nanny",               "foil2":"fireman",             "target_plural":"businessmen",          "foil1_plural":"nannies",              "foil2_plural":"firemen"},
        {"stim_id":"3",  "word":"argumentative",  "target":"lawyer",              "foil1":"girl",                "foil2":"clown",               "target_plural":"lawyers",              "foil1_plural":"girls",                "foil2_plural":"clowns"},
        {"stim_id":"4",  "word":"arrogant",       "target":"rich person",         "foil1":"gardener",            "foil2":"paramedic",           "target_plural":"rich people",          "foil1_plural":"gardeners",            "foil2_plural":"paramedics"},
        {"stim_id":"5",  "word":"bossy",          "target":"executive manager",   "foil1":"poor person",         "foil2":"sixteen year old",    "target_plural":"executive managers",   "foil1_plural":"poor people",          "foil2_plural":"sixteen year olds"},
        {"stim_id":"6",  "word":"brave",          "target":"fireman",             "foil1":"businessman",         "foil2":"estate agent",        "target_plural":"firemen",              "foil1_plural":"businessmen",          "foil2_plural":"estate agents"},
        {"stim_id":"7",  "word":"careful",        "target":"dentist",             "foil1":"hippy",               "foil2":"clown",               "target_plural":"dentists",             "foil1_plural":"hippies",              "foil2_plural":"clowns"},
        {"stim_id":"8",  "word":"creative",       "target":"architect",           "foil1":"telemarketer",        "foil2":"poor person",         "target_plural":"architects",           "foil1_plural":"telemarketers",        "foil2_plural":"poor people"},
        {"stim_id":"9",  "word":"dishonest",      "target":"politician",          "foil1":"librarian",           "foil2":"lab technician",      "target_plural":"politicians",          "foil1_plural":"librarians",           "foil2_plural":"lab technicians"},
        {"stim_id":"10", "word":"disorganized",   "target":"poor person",         "foil1":"architect",           "foil2":"executive manager",   "target_plural":"poor people",          "foil1_plural":"architects",           "foil2_plural":"executive managers"},
        {"stim_id":"11", "word":"funny",          "target":"clown",               "foil1":"accountant",          "foil2":"dentist",             "target_plural":"clowns",               "foil1_plural":"accountants",          "foil2_plural":"dentists"},
        {"stim_id":"12", "word":"gentle",         "target":"gardener",            "foil1":"man",                 "foil2":"lawyer",              "target_plural":"gardeners",            "foil1_plural":"men",                  "foil2_plural":"lawyers"},
        {"stim_id":"13", "word":"helpful",        "target":"assistant",           "foil1":"scientist",           "foil2":"artist",              "target_plural":"assistants",           "foil1_plural":"scientists",           "foil2_plural":"artists"},
        {"stim_id":"14", "word":"immature",       "target":"boy",                 "foil1":"accountant",          "foil2":"surgeon",             "target_plural":"boys",                 "foil1_plural":"accountants",          "foil2_plural":"surgeons"},
        {"stim_id":"15", "word":"intelligent",    "target":"engineer",            "foil1":"hippy",               "foil2":"girl",                "target_plural":"engineers",            "foil1_plural":"hippies",              "foil2_plural":"girls"},
        {"stim_id":"16", "word":"kind",           "target":"flight attendant",    "foil1":"engineer",            "foil2":"scientist",           "target_plural":"flight attendants",    "foil1_plural":"engineers",            "foil2_plural":"scientists"},
        {"stim_id":"17", "word":"loud",           "target":"drummer",             "foil1":"woman",               "foil2":"secretary",           "target_plural":"drummers",             "foil1_plural":"women",                "foil2_plural":"secretaries"},
        {"stim_id":"18", "word":"nerdy",          "target":"computer programmer", "foil1":"hippy",               "foil2":"construction worker", "target_plural":"computer programmers", "foil1_plural":"hippies",              "foil2_plural":"construction workers"},
        {"stim_id":"19", "word":"organized",      "target":"accountant",          "foil1":"boy",                 "foil2":"aerobics instructor", "target_plural":"accountants",          "foil1_plural":"boys",                 "foil2_plural":"aerobics instructors"},
        {"stim_id":"20", "word":"persuasive",     "target":"estate agent",        "foil1":"poor person",         "foil2":"fireman",             "target_plural":"estate agents",        "foil1_plural":"poor people",          "foil2_plural":"firemen"},
        {"stim_id":"21", "word":"quiet",          "target":"librarian",           "foil1":"high school coach",   "foil2":"sixteen year old",    "target_plural":"librarians",           "foil1_plural":"high school coaches",  "foil2_plural":"sixteen year olds"},
        {"stim_id":"22", "word":"reliable",       "target":"paramedic",           "foil1":"rich person",         "foil2":"writer",              "target_plural":"paramedics",           "foil1_plural":"rich people",          "foil2_plural":"writers"},
        {"stim_id":"23", "word":"sensitive",      "target":"girl",                "foil1":"lawyer",              "foil2":"engineer",            "target_plural":"girls",                "foil1_plural":"lawyers",              "foil2_plural":"engineers"},
        {"stim_id":"24", "word":"strong",         "target":"boxer",               "foil1":"I.T. technician",     "foil2":"consultant",          "target_plural":"boxers",               "foil1_plural":"I.T. technicians",     "foil2_plural":"consultants"},
        {"stim_id":"25", "word":"unconventional", "target":"hippy",               "foil1":"computer programmer", "foil2":"dentist",             "target_plural":"hippies",              "foil1_plural":"computer programmers", "foil2_plural":"dentists"}
    ];

    var first_is_conflict = [].concat(Array(13).fill(0)).concat(Array(12).fill(1));
    first_is_conflict = _.shuffle(first_is_conflict);
    var design = [];
    _.range(0, 25).map(function(i){
        var tr = triads[i];
        var conflict_first = first_is_conflict[i];
        var trial1 = {stim_id: tr.stim_id, word: tr.word, target: tr.target, target_plural: tr.target_plural, foil: tr.foil1, foil_plural: tr.foil1_plural};
        var trial2 = {stim_id: tr.stim_id, word: tr.word, target: tr.target, target_plural: tr.target_plural, foil: tr.foil2, foil_plural: tr.foil2_plural};
        trial1['conflict'] = conflict_first;
        trial2['conflict'] = 1 - conflict_first;
        design.push(trial1);
        design.push(trial2);
    });

    var n = design.length;
    var Ns = _.range(990, 997);
    design = _.range(n).map(function(i){
        var d = design[i];
        d['n'] = _.sample(Ns);
        d['abc'] = _.sample(ABC);
        return(d);
    });
    design = _.shuffle(design);
    return(design);
};

demo_design = function(){
    var design = [
        { stim_id: "-2", word: "intelligent", target: "professor", target_plural: "professors", foil: "convict", foil_plural: "convicts", conflict: 0, n: 994, abc: "X" },
        { stim_id: "-1", word: "muscular", target: "athlete", target_plural: "athletes", foil: "politician", foil_plural: "politicians", conflict: 1, n: 994, abc: "W" },
    ];
    return(design);
};

// // Handle buttons
function Ready(){
    $('#loadingGIF').css('display', 'none');
    $('#loaded').css('display', 'inline');
    SetupTask();
};

function SetupTask(){
    ReadyBlock();
}

function ReadyBlock(){
    $('button').off();
    $('.instructions').hide();
    $('.response, #start').hide();
    $('.stim-text').hide();
    $('#prompt-text').html('Ready...').show();
    setTimeout(PrepareTrial, globals.ready_time);
}

function PrepareTrial(){
    $('.stim-text').hide();
    $('.response').hide();
    $('#description-text, #group-text').hide();
    $('#prompt-text').hide();
    $('#probe-text').hide();
    if(globals.catch_trial_numbers.includes(state.trial_nr)) {
        // Time for a catch trial!
        // PrepareTrial() get's called again, with the same trial number, afterwards.
        var ctn = globals.catch_trial_numbers;
        globals.catch_trial_numbers = ctn.slice(1, ctn.length);
        PrepareCatch();
    } else {
        var problem = globals.design[state.trial_nr];
        console.log(problem);
        state.stim_id = problem.stim_id;
        state.target = problem.target;
        state.foil = problem.foil;
        state.conflict = problem.conflict;
        state.abc = problem.abc;
        state.flip_br_order = flip();
        state.flip_resp_order = flip();
        var target_n = problem.n;
        var foil_n = 1000 - target_n;
        if (state.conflict){
            let tmp = target_n;
            target_n = foil_n;
            foil_n = tmp;
        }
        state.target_n = target_n;
        state.foil_n = foil_n;
        var target_group = _.capitalize(problem.target);
        var foil_group = _.capitalize(problem.foil);
        var target_plural = problem.target_plural;
        var foil_plural = problem.foil_plural;
        if(state.flip_br_order){
            $('#n1').html(foil_n);
            $('#n2').html(target_n);
            $('#g1a').html(_.capitalize(foil_plural));
            $('#g2a').html(_.capitalize(target_plural));
            $('#g1b').html(foil_plural);
            $('#g2b').html(target_plural);
        } else {
            $('#n1').html(target_n);
            $('#n2').html(foil_n);
            $('#g1a').html(_.capitalize(target_plural));
            $('#g2a').html(_.capitalize(foil_plural));
            $('#g1b').html(target_plural);
            $('#g2b').html(foil_plural);
        }
        if (state.flip_resp_order){
            $('#response-text1').html(foil_group);
            $('#response-text2').html(target_group);
        } else {
            $('#response-text1').html(target_group);
            $('#response-text2').html(foil_group);
        };
        var txt = "Person %1 is<br>'%2'."
            .replace('%1', problem.abc)
            .replace('%2', problem.word);
        $('#description-text').html(txt);
        var q = "Person %1 is<br>most likely a...".replace('%1', problem.abc);
        $('#probe-text').html(q);
        $('#start').html('Start').show().off().on('click', StartTrial);
    }
}

function StartTrial(){
    console.log('Trial ' + state.trial_nr);
    state.start_time = performance.now();
    $('#description-text, #group-text').show();
    $('#start').html('Next').off()
        .on('click', TrialStage2);
}


function TrialStage2(){
    state.next_time = performance.now();
    $('#start').hide().off().on('mouseleave', function(e){state.init_time = performance.now();});
    $('#probe-text').show();
    $('#baserate-text').show();
    $('.response').show().off().on('click', Response);
    globals.timeout = setTimeout(function(){
        $('#timeout-modal').modal('show');
        Response();
    }, globals.max_response_time);
    StartTracking();
}

function Response(e){
    // draw_last();
    StopTracking();
    clearTimeout(globals.timeout);
    state.response_time = performance.now();
    var clicked = $(this);
    state.response_i = clicked.attr('data-id');
    state.response = clicked.children().html();
    LogData();
}

function PrepareCatch(){
    var last_problem = globals.design[state.trial_nr-1];
    var catch_type = globals.catch_types.pop();
    state.trial_nr = state.trial_nr - 1;
    state.stim_id = -99;
    state.conflict = -1;
    state.abc = catch_type;
    state.flip_br_order = -1;
    state.flip_resp_order = flip();
    state.target_n = -1;
    state.foil_n = -1;
    if(catch_type=='desc'){
        var r_correct =   _.capitalize(last_problem.word);
        var r_incorrect = _.capitalize(globals.catch_descriptions.pop());
        $('#prompt-text').html('Which of these descriptions did you see in the previous round?');
        $('#probe-text').html('');
        if (state.flip_resp_order){
            $('#response-text1').html(r_incorrect);
            $('#response-text2').html(r_correct);
        } else {
            $('#response-text1').html(r_correct);
            $('#response-text2').html(r_incorrect);
        };
    } else {
        var older_problem = globals.design[state.trial_nr-4];
        var last_target = _.capitalize(last_problem.target_plural);
        var last_foil = _.capitalize(last_problem.foil_plural);
        var older_target = _.capitalize(older_problem.target_plural);
        var older_foil = _.capitalize(older_problem.foil_plural);
        var r_correct = last_target + '<br>' + last_foil;
        var r_incorrect = older_target + '<br>' + older_foil;
        $('#prompt-text').html('Which of these pairs of groups did you see in the previous round?');
        if (state.flip_resp_order){
            var tmp = r_correct;
            r_correct = r_incorrect;
            r_incorrect = tmp;
        };
        $('#probe-text').html('(A) ' + r_correct + '<br>(B) ' + r_incorrect);
        $('#response-text1').html('(A)');
        $('#response-text2').html('(B)');
    }
    $('#catch-header').show();
    $('#start').html('Start').show().off().on('click', StartCatch);
}


function StartCatch(){
    state.next_time = performance.now();
    $('#start').hide().off().on('mouseleave', function(e){state.init_time = performance.now();});
    $('#prompt-text').show();
    $('#probe-text').show();
    $('.response').show().off().on('click', Response);
    StartTracking();

}


function draw_last(){
    _.zipWith(globals.xList, globals.yList, function(x, y){
        var point = $('<div>')
            .addClass('dot')
            .css('left', x)
            .css('top', y);
        $('body').append(point);
    } );
    // http://stackoverflow.com/questions/3642035/jquerys-append-not-working-with-svg-element
}

function LogData(){
    state.focus = 1*(!document.hidden);
    console.log('Log data');
    console.log(state);
    // Arrays to strings
    state.xList = JSON.stringify(globals.xList);
    state.yList = JSON.stringify(globals.yList);
    state.tList = JSON.stringify(globals.tList);
    $.ajax({
        type: 'POST',
        data: JSON.stringify(state),
        contentType: 'application/json',
        url: './log.php',
        success: function(res) {
            // console.log('Data sent');
            console.log(JSON.stringify(res));
        }
    });
    EndTrial();
}

function EndTrial(){
    state.trial_nr += 1;
    if(state.trial_nr < globals.design.length){
        DrawLast();
        setTimeout(PrepareTrial, 2000);
        // PrepareTrial();
    } else {
        EndExperiment();
    }
};

function EndExperiment(){
    localStorage['trial_nr'] = state.trial_nr;
    setTimeout(function(){
        window.location = './feedback.html';
    }, 1000);
};


var W, H;
var subject_nr = localStorage['subject_nr'];
var url = new URL(window.location);
var GET = {
    is_demo : Number(url.searchParams.get('demo')) || 1
};

var globals = {
    ready_time         : 1000,
    sample_rate        :20,
    max_response_time  : 5000,
    timeout            : null,
    data_address       : 'log.php',
    feedback_time      : 1000,
    ITI                : 1000,
    trials_per_block   : 16,
    trials_per_section : 64,
    is_tracking        : false,
    xList              : [],
    yList              : [],
    tList              : [],
    mx                 : null,
    my                 : null,
    catch_types: _.shuffle(['desc', 'desc', 'group', 'group']),
    catch_descriptions: ['rude', 'shy'],
    // Random trial between 5-15, 15-25, 25-35, 35-45
    catch_trial_numbers: [5, 15, 25, 35].map(
        function(x){
            return(_.sample(_.range(x, x+10)));
        })
};

var state = {
    W               : W,
    H               : H,
    xList           : null,    // These will be the string representations
    yList           : null,
    tList           : null,
    practice        : 0,
    subject_nr      : subject_nr,
    stim_id         : null,
    trial_nr        : 0,
    conflict        : null,
    flip_br_order   : null,
    flip_resp_order : null,
    start_time      : null,
    next_time       : null,
    init_time       : null,
    response_time   : null,
    response        : null,
    response_i      : null,
    target          : null,
    foil            : null
};

// Mousetracking
function update_mouse(e){
    globals.mx = Math.round(e.pageX);
    globals.my = Math.round(e.pageY);
}
function StartTracking(){
    globals.xList = [];
    globals.yList = [];
    globals.tList = [];
    globals.is_tracking = true;
    // track_mouse(performance.now());
    window.requestAnimationFrame(track_mouse);
}
function StopTracking(){
    globals.is_tracking = false;
}
function track_mouse(t) {
    if(globals.is_tracking){
        globals.xList.push(globals.mx);
        globals.yList.push(globals.my);
        globals.tList.push(t);
        window.requestAnimationFrame(track_mouse);
    }
};

function DrawLast(){
    _.zipWith(globals.xList, globals.yList, function(x, y){
        var point = $('<div>')
            .addClass('dot')
            .css('left', x)
            .css('top', y);
        $('body').append(point);
    } );
    // http://stackoverflow.com/questions/3642035/jquerys-append-not-working-with-svg-element
}

function resize(){
    state.W = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    state.H = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    $('#boxed').css('left', .5*(state.W - (state.H*1.2)) );
    var button =  $('#theButton');
    var box = $('#boxed');
};

//// The following is included in experiment.html:
// $( document ).ready(function(){
//   $( window ).resize(_.debounce(resize, 100));
//   $(document).mousemove(update_mouse);
//   globals.design = get_design();
//   resize();
//   Ready();
// });


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

function flip(){
    return Math.floor(Math.random()*2)
};

function toin_coss(prob){
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

var ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');


function diff (a, d){ 
    if(typeof(d) === 'undefined') { var d = [] }
    if(a.length == 1) {
        return(d);
    } else {
        var an = a.slice(1, a.length);
        console.log(a.length);
        console.log(a);
        console.log(an);
        console.log(d);
        return [a[1] - a[0]].concat(diff(an, d));
    }
}


function Plot(x, y, flip_y){
    flip_y = flip_y | true;
    if(flip_y) {
        console.log('Flipping y axis');
        y = y.map( v => v * -1);
    }
    var plot_div = $('<div>')
        .css('position', 'absolute')
        .css('width', '80vh')
        .css('height', '80vh')
        .css('left', '50vw')
        .css('top', '50vh')
        .css('margin-right', 'auto')
        .css('background', 'white')
        .css('border', 'solid black')
        .css('transform', 'translate(-50%, -50%)')
        .css('z-index', '99');
    $('body').append(plot_div);
    function normalise(x){
        var min = _.min(x);
        var nx = x.map( val => val - min);
        var max = _.max(nx);
        nx = nx.map( val => val / max);
        return(nx);
    }
    var nx = normalise(x);
    var ny = normalise(y);
    var w = plot_div.width();
    var h = plot_div.height();
    _.zipWith(nx, ny, function(x, y){
        var point = $('<div>')
            .css('background-color', 'red')
            .css('width', '10px')
            .css('height', '10px')
            .css('position', 'absolute')
            .css('border-radius', '50%')
            .css('left', (.1*w) + x * .8 * w)
            .css('top',  (.1*h) + y * .8 * h)
            .css('transform', 'translate(-50%, -50%)');
        $(plot_div).append(point);
    } );
    $(plot_div).click(function(){
        $(plot_div).remove();
    });
}
