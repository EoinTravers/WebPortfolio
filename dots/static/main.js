function SetupAnimation(){
    globals.pause = true;
    var rnorm = d3.randomNormal(0, 1);
    var runif = d3.randomUniform(0, 1);

    var width = 500,
        height = 500,
        radius = cfg.aperatureSize;

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("margin-left", "50vw")
        .style("margin-top", "50vh")
        .style("transform", "translate(-50%,-50%)")
        .style("background", "lightgrey ")
        .append("g")
        .attr("transform", "translate(" + [width / 2, height / 2] + ")");

    var radius_domain = _.range(0, radius, radius/cfg.nDots)
    var angle_domain = _.range(0, 2*Math.PI, (2*Math.PI)/cfg.nDots)
    var data = _.zip(_.shuffle(radius_domain),
                     _.shuffle(angle_domain),
                     _.shuffle(angle_domain)
                    )
        .map(function(rad_theta_theta0){
            var rad =  rad_theta_theta0[0]
            var theta = rad_theta_theta0[1]
            var theta0 = rad_theta_theta0[2] // Starting angle (different from movement)
            var x = Math.cos(theta0)*rad;
            var y = Math.sin(theta0)*rad;
            return { x:x, y:y, theta: theta }
        });

    var fix = svg.selectAll("text")
        .data([0])
        .enter()
        .append("text")
        .attr("fill", "white")
        .attr("fill", "white")
        .attr("x", 0)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "hanging")
        .text("+")
        .attr("font-family", "sans-serif")
        .attr("font-size", "30px")    

    function draw_fixation(){
        var circles = svg.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("r", cfg.size)
            .attr("fill", function(d, i){
                var f = (i >(cfg.nDots - cfg.nCoherent)) ? cfg.color2 : cfg.color1
                return f
            })
            .attr("fill-opacity", 1);
    }
    draw_fixation();

    function moveX(datax, t){
        return cfg.aperatureSize * Math.sin(datax*3 + (t));
    }
    function moveY(datay, t){
        return cfg.aperatureSize * Math.cos(datay*2 + (t));
    }

    function updateDots(t)  {
        if(!globals.pause){
            if(globals.waiting){
                if(t > globals.wait_time){
                    // Start movement
                    globals.waiting = false;
                    globals.partial_response = false;
                }
                var nRandom = cfg.nDots
            } else {
                if(t > globals.wait_time + cfg.max_response_time){
                    Timeout();
                } else {
                    var nRandom = cfg.nDots - cfg.nCoherent;
                    var cohTheta = globals.cohTheta*Math.PI;
                    var coh_dx = cfg.speed * Math.cos(cohTheta);
                    var coh_dy = cfg.speed * Math.sin(cohTheta);
                }
            }
            for(var i = 0; i < nRandom; i++) {
                var theta = data[i].theta;
                // S=o/h, C=a/h
                new_x = data[i].x + cfg.speed * Math.cos(theta);
                new_y = data[i].y + cfg.speed * Math.sin(theta);
                data[i].x = new_x;
                data[i].y = new_y;
                var rad = pythag(new_x, new_y);
                if(rad > radius){
                    var new_theta = data[i].theta + Math.PI + rnorm()*.01 ;
                } else {
                    var new_theta = data[i].theta + rnorm()*.1 ;
                }
                // new_theta = Math.abs(new_theta % (2*Math.PI));
                data[i].theta = new_theta % (2*Math.PI);
            }
            // Coherent motion
            for(var i = nRandom; i < cfg.nDots; i++) {
                var new_x = data[i].x + coh_dx;
                var new_y = data[i].y + coh_dy;
                // !! TODO: Reset when it leaves the screen!
                var rad = pythag(new_x, new_y);
                if(rad > radius){
                    new_x = new_x * -.99
                    new_y = new_y * -.99
                }
                data[i].x = new_x;
                data[i].y = new_y;
            }
            var dot_I = _.range(0, cfg.nDots);
            if(cfg.nErratic < 1){
                var nErratic = 1*(runif() < cfg.nErratic)
            } else {
                var nErratic = cfg.nErratic
            }
            _.sampleSize(dot_I, nErratic)
                .map(function(i){
                    var r = _.sample(radius_domain);
                    var a = _.sample(angle_domain);
                    data[i].x = Math.cos(a)*r;
                    data[i].y = Math.sin(a)*r;
                });
            circles = svg.selectAll("circle")
                .data(data)
                .attr('cx', function(d){
                    return(d.x) })
                .attr('cy', function(d){ return(d.y) });
        }
    }
    globals.updateDots = updateDots;
    // timers.update = d3.interval(updateDots, cfg.rate);
    $('circle').hide();
}


// function UpdateClock(seconds){
//     var mins = Math.floor(seconds/60);
//     var secs = seconds % 60;
//     if (secs < 10){
//         secs = '0' + secs
//     };
//     $('#time').html( mins + ':' + secs);
//     timers.countdown = setTimeout(
//         function(){
//             UpdateClock(seconds-1)
//         }, 1000)
// }



function StartClock(seconds){
    timers.countdown = setInterval(UpdateClock, 1000)
}


function UpdateClock(){
    var remaining = Math.round(
        cfg.total_time - (Date.now() - globals.exp_start_time)/1000)
    var mins = Math.floor(remaining/60);
    var secs = remaining % 60;
    if (secs < 10){
        secs = '0' + secs
    };
    $('#time').html( mins + ':' + secs);
    if(remaining < 0){
        clearInterval(timers.countdown);
        EndExperiment()
    }
}

var cfg = {};
cfg.nDots = 70;                               // Total number of dots
cfg.nCoherent = 50;                           // Number moving coherntly
cfg.nErratic = 1;                            // Number of dots 'teleporting' per frame. (Or probability, if < 1
cfg.size = 4;                                 // Size of dots (pixels)
cfg.rate = 20;
cfg.speed = 3;  // coords / frame
cfg.deg = _.range(1, 2*Math.PI, Math.PI/180);
cfg.rad = _.range(1, 2, 1/7);
cfg.aperatureSize = 100;
cfg.color1 = 'black';           //  Coherent dots
cfg.color2 = 'black'; // Incoherent dots
// cfg.color2 = 'grey'; // Incoherent dots
// Scores
cfg.correct_points = 10;
cfg.incorrect_points = -20;
cfg.skip_points = 2;
cfg.timeout_points = -30;
// Timings
cfg.max_response_time = 3000;
cfg.max_async_time = 20;        // How close together must a 'f' and 'j' be to count as a skip?
cfg.correct_ITI = 1000;
cfg.incorrect_ITI = 1000;
cfg.skip_ITI = 1000;
cfg.timeout_ITI = 1000;
cfg.total_time = 5*60;

var globals = {
    exp_running: false,
    score: 0,
    mid_trial: false,
    pause: false,
    waiting: true,
    movementStarted: false,
    // time_remaining: cfg.total_time;
    exp_start_time: null,
    t: null,
    cohTheta: null,
    wait_time: 5000,
    start_time: null,
    partial_response: false,
    response_time: null,
    response: null
};
var timers = {};

document.onkeydown = function(e){
    var k = e.key.toLowerCase();
    console.log(k)
    if(globals.exp_running){
        if(k=='x'){
            if (globals.pause) {
                globals.pause=false
            } else {
                globals.pause=true
            }
        }
        if(globals.mid_trial){
            if( (k=='f') | (k=='j') ){
                if (!globals.partial_response){
                    globals.partial_response = k;
                    timers.respondTimer = setTimeout(function(){
                        Respond(k)
                    }, cfg.max_async_time);
                } else {
                    if (k != globals.partial_response){
                        clearTimeout(timers.respondTimer);
                        Respond('skip');
                    }
                }
            }
        }
    } else {
        // Waiting to start experiment
        if( (k=='f') | (k=='j') ){
            if (!globals.partial_response){
                globals.partial_response = k;
            } else {
                if (k != globals.partial_response){
                    Begin();                    
                }
            }
        }
    }
};

var wait_times = _.shuffle(repeat([6000, 5000,4000,3000,2000,1000], 5));
var mvmnt_angles = _.shuffle(repeat(_.range(-.8, -.2, .6/5), 5));
var stimuli = _.zip(wait_times, mvmnt_angles)
    .map(function(wa){
        var w = wa[0]
        var a = wa[1]
        return {
            wait_time: w,
            angle: a
        }
    })

function PrepareExperiment(){
    SetupAnimation();
    $('#correct_points').html( cfg.correct_points );
    $('#incorrect_points').html( Math.abs(cfg.incorrect_points) );
    $('#skip_points').html( cfg.skip_points );
    setTimeout(function(){
        $('#instructions').show()
        $('#score').hide();
        $('text').hide();
    }, 500);
}
window.onload = PrepareExperiment;

function Begin(){
    globals.exp_running = true;
    globals.exp_start_time = Date.now();
    $('#instructions').hide();
    StartClock();
    // UpdateClock(61*5);
    $('#score').show();
    StartTrial();
}

function Stop() {
    $('circle').hide();
    timers.update.stop();    
    globals.pause = true;
    globals.waiting = true;
}
function StartTrial(){
    $('#fb').hide();
    $('text').show();
    var trial = stimuli.pop()
    globals.wait_time = trial.wait_time;
    globals.cohTheta = trial.angle;
    $('circle').show()
    if(timers.update!=undefined){
        timers.update.stop();
    }
    timers.update = d3.interval(globals.updateDots, cfg.rate);
    globals.pause = false;
    globals.mid_trial = true;
    globals.start_time = Date.now()
}

function Timeout(){
    globals.response_time = Date.now();
    globals.response = 'timeout';
    Stop()
    globals.mid_trial = false;
    console.log('TIMEOUT')
    $('#fb')
        .html('Too Slow<br>' + cfg.timeout_points)
        .addClass('bad-news')
        .show();
    $('text').hide()
    globals.score += cfg.correct_points;
    globals.score += cfg.timeout_points;
    $('#sc').html(globals.score);
    setTimeout(StartTrial, cfg.timeout_ITI);
}

function Respond(resp){
    globals.partial_response = false;
    var end_trial = false;
    if(globals.waiting){
        if (resp=='skip'){
            $('#fb')
                .html('Skip<br>+' + cfg.skip_points)
                .removeClass('bad-news')
                .show()
            $('text').hide()
            globals.score += cfg.skip_points;
            end_trial = true;
            var ITI = cfg.skip_ITI;
        }
    } else {
        if (resp=='f'|resp=='j'){
            end_trial = true
            var acc = (globals.cohTheta < -.5) ? (resp=='f') : (resp=='j');
            if(acc) {
                $('#fb')
                    .html('Correct<br>+' + cfg.correct_points)
                    .removeClass('bad-news')
                    .show();
                $('text').hide()
                globals.score += cfg.correct_points;
                var ITI = cfg.correct_ITI;
            } else {
                $('#fb')
                    .html('Incorrect<br>' + cfg.incorrect_points)
                    .addClass('bad-news')
                    .show();
                $('text').hide()
                globals.score += cfg.incorrect_points;
                var ITI = cfg.incorrect_ITI;
            }
        }
    }
    if (end_trial){
        globals.response_time = Date.now();
        globals.response = resp;
        Stop()
        globals.mid_trial = false;
        console.log('Response: ' + resp)
        $('#sc').html(globals.score);
        setTimeout(StartTrial, ITI);
    }
}

function EndExperiment(){
    alert('End of Experiment');
};


function randomSample(arr, n) {
    // With replacement
    var res = _.range(n).map(function(n){
        var i = Math.floor(Math.random()*arr.length);
        return arr[i]
    });
    return res
};

function pythag(x, y){
    return Math.sqrt(x**2 + y**2)
}

function repeat(array, len) {
    if (len == 0) return [];
    var a = [array];
    while (a.length * 2 <= len) a = a.concat(a);
    if (a.length < len) a = a.concat(a.slice(0, len - a.length));
    return _.flatten(a);
}


function randomSample(arr, n) {
    // With replacement
    var res = _.range(n).map(function(n){
        var i = Math.floor(Math.random()*arr.length);
        return arr[i]
    });
    return res
};

function pythag(x, y){
    return Math.sqrt(x**2 + y**2)
}

function repeat(array, len) {
    if (len == 0) return [];
    var a = [array];
    while (a.length * 2 <= len) a = a.concat(a);
    if (a.length < len) a = a.concat(a.slice(0, len - a.length));
    return _.flatten(a);
}
