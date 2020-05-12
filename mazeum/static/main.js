function DragMethod1(){
  let drag_targets = _.range(1, 16).map( x =>
                                         document.getElementById('db'+x))
      .concat([document.getElementById('drag-source')]);
  dragula(drag_targets);
}

function find_closest_box(x, y){
  console.log(x + ' ' + y);
  let boxes = $('.dbox');
  let box_positions = boxes.get().map( x => $(x).offset());
  let deltas = box_positions.map( p => Math.sqrt( (x - p.left)**2 + (y - p.top)**2 ) );
  let closest = boxes[argmin(deltas)];
  // console.log(box_positions);
  // console.log(deltas);
  return(closest);
};

/  //  //  //  //  // /
// Start of  logic.js //
//  //  //  //  //  // /
"use strict";

function Ready(){
    // If you need to do any logic before begining, put it here.
    //console.log('F: Ready');
    preload_images();
    HideAll();
    $('body').show();
    setup_slider();
    AskWelcome();
    // StraightToDrag();
    //skipTheStart();
};

function setup_slider(){
    globals.slider = document.getElementById('slider');
    noUiSlider.create(globals.slider, {
        range: { min: 0, max: 100 },
        start: 50,
        behaviour: 'tap-drag',
        pips: {
            mode: 'values',
            values: [0, 100],
            density: 4
        }
    });
    $('.noUi-value-large')[0].innerHTML = 'Hate<br>it';
    $('.noUi-value-large')[1].innerHTML = 'Love<br>it';
};

function StraightToDrag(){
    let subj = state.subject_nr = default_subject//Number( $('#subject-nr').val() );
    state.role = $('input[name=subj-radio]:checked').attr('value');
    SetupMap(subj);
    state.painting = globals.painting_list.pop();
    PrepareDrag();
}

function SkipTheStart(){
    let subj = state.subject_nr = 1//Number( $('#subject-nr').val() );
    state.role = $('input[name=subj-radio]:checked').attr('value');
    SetupMap(subj);
    PrepareSeen();
}


function AskWelcome(){
    $('#welcome-div').show();
    $('#submit').off('click').on('click', HandleWelcome).html('Start');
    // TODO: Should wait until both subject number and role are defined
    // before allowing progress?
    $('#subject-nr').on('input', function(e){
        let s = Number( $('#subject-nr').val() );
        if(isNaN(s) | s == 0){ $('#submit').hide(); } else { $('#submit').show(); };
    });
}

function SetupMap(subject_nr){
    let condition = state.condition = ((subject_nr-1) % 4) + 1;
    let map_name = 'map' + condition;
    state.map = map_name;
    let map = globals.map = globals.images[map_name];
    $('#drag-map').attr('src', $(map).attr('src'));
    globals.correct_responses = generate_correct_responses(map_name);
    globals.correct_locations =_.invert(globals.correct_responses);
}

function ResizeMap(){
    if(state.map){
        globals.aspect_ratio = map_aspect_ratios[state.map];
        let ratio = globals.aspect_ratio;
        if(ratio < 1){
            let h = get_numbers($('#drag-map-wrapper').css('height'));
            $('#drag-map-wrapper').css('width', h * ratio);
        } else {
            let w = get_numbers($('#drag-map-wrapper').css('width'));
            $('#drag-map-wrapper').css('height', w / ratio);
        }
    }
}

function HandleWelcome(){
    openFullscreen();
    $('#welcome-div, #submit').hide();
    let subj = state.subject_nr = Number( $('#subject-nr').val() );
    state.role = $('input[name=subj-radio]:checked').attr('value');
    SetupMap(subj);
    // PrepareTrace();
    PrepareSeen();
}


function PrepareTrace(){
    globals.rep_vars.map( v => state[v] = null);
    $('#low-question').html(globals.questions.trace);
    TraceMethod2(then=AskTrace);
}

function AskTrace(){
    resize();
    $('#submit').off('click').on('click', HandleTrace).html('Submit');
    $('#trace-map, #low-question').show();
    resize();
    $('#reset').off('click').on('click', PrepareTrace).show();
}

function HandleTrace(){
    $('#trace-map, #submit, #reset, #low-question').hide();
    let trace_log = {};
    globals.key_vars.map( v => trace_log[v] = state[v]);
    ['X', 'Y', 'T'].map(  v => trace_log[v] = globals[v]);
    send_to_server(trace_log, 'trace');
    PrepareSeen();
}

function PrepareSeen(){
    $('body').children().hide();
    state.painting = globals.painting_list.pop();
    $('#painting').attr('src', 'imgs/' + state.painting + '.jpg');
    let progress = `# ${state.trial_nr+1}/15<br>`;
    $('#progress').html(progress);
    $('#question').html(globals.questions.seen);
    // $("input").prop("checked", false);
    setTimeout(AskSeen, 200);
}

function AskSeen(){
    state.t_q1 = Date.now();
    $('#painting, #question, #radio-div, #progress').show();
    $('#submit').off('click').on('click', HandleSeen).html('Next');
    $('#radio-div').on('click', function(e){
        $('#submit').show();
        $('#radio-div').off();
    });
    console.log([state.painting, globals.correct_locations[state.painting]]);
    // let correct = 1 + gallery_layouts[state.map].indexOf(art_delabel(state.painting));
    //console.log('Location: ' + correct);
}

function HandleSeen(){
    HideAll();
    state.t_r1 = Date.now();
    state.r1 = $('input[name=seen-radio]:checked').attr('value');
    // Reset buttons
    $('input[type=radio]').each(function(){ $(this).prop('checked', false)});
    $("input").prop("checked", false);
    $('#radio-div').find('label')
        .removeClass('active')
        .end()
        .find('[type="radio"]').prop('checked', false);
    if(state.r1 == 'Yes'){
        PrepareLiking();
        // PrepareDrag();
    } else {
        NextPainting();
    }
}

function PrepareLiking(){
    $('#question').html(globals.questions.liking);
    globals.slider.noUiSlider.set(50);
    setTimeout(AskLiking, 50);
}

function AskLiking(){
    state.t_q2 = Date.now();
    $('#painting, #question, #slider, #progress').show();
    $('#submit').off('click').on('click', HandleLiking);
    $('#slider').on('change touchend mouseup', '*', ShowSubmit);
}

function HandleLiking(){
    HideAll();
    state.t_r2 = Date.now();
    state.r2 = globals.slider.noUiSlider.get();
    $('#question, #slider, #submit, #painting').hide();
    PrepareDrag();
};

function PrepareDrag(){
    $('#mini-painting').attr('src', 'imgs/' + state.painting + '.jpg');
    $('#drag-source').prepend($('#mini-painting').detach());
    $('.dbox').addClass(state.map);
    $('#low-question').html(globals.questions.drag);
    let n_targets = (state.condition==0) ? 15 : 18;
    let drag_targets = _.range(1, n_targets+1).map( x => document.getElementById('db'+x))
        .concat([document.getElementById('drag-source')]);
    globals.dragula = dragula(drag_targets);
    setTimeout(AskDrag, 200);
}

function AskDrag(){
    state.t_q3 = Date.now();
    //_.range(20).map( i => $('#db' + i).html(i)) // For debugging
    $('#drag-wrapper, #low-question').show(); // No room for progress
    resize();
    $('#submit').off('click').on('click', HandleDrag);
    function place_painting(e){
        //console.log('Place painting');
        //console.log(e);
        // Get place where drag ends on mobile and desktop.
        // This doesn't work on Chrome when emulating android, but does on firefox?
        let pos = e;
        if (e.type=='touchend') {
            if(e.originalEvent.touches.length > 0){
                pos = e.originalEvent.touches[0];
            }
            if(e.changedTouches.length > 0){
                pos = e.changedTouches[0];
            }
        }
        let closest = find_closest_box(pos.pageX, pos.pageY);
        $(closest).prepend($('#mini-painting').detach());
        $(window).off();
        console.log($('#mini-painting').parent().attr('id'));
        ShowSubmit();
    }
    $('#mini-painting').on('mousedown touchstart', function(e){
        //console.log('On');
        ////console.log(e.type);
        if(e.type=='touchstart'){
            $('#drag-map, #mini-painting').off().on('touchend', place_painting);
        } else {
            $(window).off().on('mouseup touchend', place_painting);
        }
    });
}

function HandleDrag(){
    HideAll();
    state.t_r3 = Date.now();
    state.r3 = $('#mini-painting').parent().attr('id');
    globals.drag_responses[state.painting] = state.r3;
    NextPainting();
}

function NextPainting(){
    send_to_server(state, 'pictures');
    if(globals.painting_list.length > 0){
        state.trial_nr += 1;
        setTimeout(PrepareSeen, 50);
    } else {
        AskFavourite();
    }
}

function AskFavourite(){
    $('body').children().hide();
    let opts = _.shuffle(globals.full_painting_list);
    opts.map( function(option){
        let obj = $(generate_image_radio(option, 'fav'));
        $('#pick-options').append(obj);
        let id = `#lbl-fav-${option}`;
        $(id).css('background-image', `url(imgs/${option}.jpg`);
        //console.log(id);
        // $(id).html(option) //  For debugging
    });
    $('#submit').off().on('click', HandleFavourite);
    $('#pick-favourite').show();
    $('input[name=fav]').on('click', ShowSubmit);
}

function HandleFavourite(){
    $('body').children().hide();
    globals.favourite = $('input[name=fav]:checked').attr('value');
    AskDemographics();
}

function AskDemographics(){
    $('#demographics').show();
    $('#submit').off('click').on('click', HandleDemographics).html('Done').show();
};

function HandleDemographics(){
    $('#demographics, #submit').hide();
    let demographics = {
        age        : $('#subject-age').val(),
        gender     : $('#subject-gender option:selected').attr('value'),
        // hand     : $('#subject-hand option:selected').attr('value'),
        favourite: globals.favourite
    };
    globals.key_vars.map( v => demographics[v] = state[v]);
    send_to_server(demographics, 'demographics');
    ShowFeedback();
};


function get_duplicates(obj){
    let counts = {};
    _.forOwn(obj, (val, key) => {
        if(counts[val]) {

        }
    })
    let items = [];
    let dups = [];

}

function get_optimistic_responses(){
    let responses = globals.drag_responses; // art01 => db1
    let correct_responses = globals.correct_responses;
    let feedback = {};


}


function ShowFeedback(){
    _.range(1, 16).map( x => $('#db' + x).removeClass('correct incorrect').children().remove());
    $('#drag-wrapper').show();
    $('#drag-source').hide();
    $('.dbox').addClass(state.map);
    let responses = globals.drag_responses; // art01 => db1
    let correct_responses = globals.correct_responses;
    // // 'db1' => art01'
    // correct_responses = _.zipObject(_.range(1, 13).map(i => 'db'+i),
    //                                 correct_responses.map(a => 'art' + leftFillNum(a, 2)));
    // // Add duplicate final room
    // [10, 11, 12].map(i => correct_responses['db'+(i+3)] = correct_responses['db'+i]);
    let used = {};
    _.forOwn(responses, (resp, img) => {
        let correct_img = correct_responses[resp];
        let acc = img == correct_img;
        let db = $('#' + resp);
        let fb_img = $('<img>')
            .attr('src', 'imgs/' + img + '.jpg')
            .addClass('fb-img');
        if(!used[resp]){
            console.log('New item');
            // Box is empty
            db.append(fb_img);
            used[resp] = img;
        } else {
            // Replace if correct
            console.log('Replace?');
            if (acc){
                console.log('Yes!');
                db.children().remove();
                db.append(fb_img);
            }
        }
        // let border = acc ? 'correct' : 'incorrect';
        // db.addClass(border);
        console.log([img, resp, correct_img, acc]);
    });
    $('.fb-img').on('click', function(e){
        let db = $(e.currentTarget).parent();
        PopupImage(db);
    });
    let txt = "This map shows your responses. Tap a painting for a better view.";
    txt += `<br>[MAP #${get_numbers(state.map)}]`;
    $('#low-question').show().html(txt);
    $('#submit').off().on('click', End).html('Done').show();
}

function PopupImage(db){
    // Get the modal
    let modal = $('#img-modal');
    // Get the image and insert it inside the modal - use its "alt" text as a caption
    let img = db.children('img');
    $('#modal-img').attr('src', img.attr('src'));
    // let txt = db.hasClass('correct') ? 'You got this one right!' : 'You got this one wrong.';
    let txt = ''; // Disable feedback
    $('#caption').html('This painting was located here.<br>' + txt + '<br>Tap to close.');
    modal.modal('toggle');
    $('#modal-img').off().on('click', function(){$('#img-modal').modal('toggle'); } );
}

function End(){
    HideAll();
    $('#end').show();
}

function art_label(n){
    let nn = leftFillNum(n, 2);
    return('art' + nn);
}
function art_delabel(label){
    let n = Number(/[0-9]+/.exec(label));
    return(n);
}

function preload_images(){
    let image_paths = ['map1', 'map2', 'map3', 'map4']
        .concat(
            _.range(1, 16).map( function(n){
                return('art' + leftFillNum(n, 2));
            }));
    globals.images = {};
    image_paths.map( function(p){
        let img = new Image();
        img.src = 'imgs/' + p + '.jpg';
        globals.images[p] = img;
    });
}

function HideAll(){ $('body').children().hide(); };
function ShowSubmit(){ $('#submit').show(); };

const default_subject = 5;
//  //  //  //  //  ///
// Start of  main.js //
//  //  //  //  //  ///
"use strict";

const gallery_layouts = {
    // Image that goes in slot i-1;
    // E.G. gallary_layouts['map1'][0] -> art01;
    map1 : [12, 8 , 2 , 4 , 6 , 9 , 14, 5 , 15, 7 , 3 , 11],
    map2 : [1 , 7 , 14, 9 , 2 , 15, 6 , 11, 10, 13, 4 , 5] ,
    map3 : [5 , 13, 6 , 11, 14, 1 , 10, 15, 3 , 12, 9 , 8] ,
    map4 : [15, 10, 7 , 3 , 1 , 13, 8 , 14, 4 , 2 , 12, 5] ,
};

const map_aspect_ratios = {
    map1: 388/803,
    map2: 457/708,
    map3: 283/881,
    map4: 533/629,
};

const globals = {
  // Values that we'll need to access through the experiment, but don't wish to log.
  // painting_lists  : [
  //   ['art01', 'art02', 'art03', 'art04', 'art05', 'art06', 'art07'],
  //   ['art08', 'art09', 'art10', 'art11', 'art12', 'art13', 'art14']],
  full_painting_list : _.shuffle(_.range(1, 16).map(i => 'art' + leftFillNum(i, 2))),
  painting_list : _.shuffle(_.range(1, 16).map(i => 'art' + leftFillNum(i, 2))),
  // painting_list : _.range(1, 16).map(i => 'art' + leftFillNum(i, 2)),
  questions : {
    trace: 'Can you remember your route through the gallery? Use your finger to trace your path from the entrace to the exit. Tap Reset if you make a mistake.',
    seen : 'Did you see this painting during the task?',
    liking : 'How much do you like it?',
    drag: 'Where in the gallery did you see this painting? Drag it to one of the empty slots.'
  },
  framerate: 60,
  animation: null,
  key_vars: ['subject_nr', 'condition', 'role'],
  rep_vars: ['t_q1', 't_r1', 'r1', 't_q2', 't_r2', 'r2', 't_q3', 't_r3', 'r3'],
  feedback: true,
  drag_responses: {}
};


function generate_correct_responses(map){
    // Map: 'map1' or 'map2'
    console.log(map);
    layout = gallery_layouts[map];
    let n = map == 'map1' ? 16 : 19;
    // 'db1' => art01'
    let correct_responses = _.zipObject(_.range(1, n).map(i => 'db'+i),
                                    layout.map(a => 'art' + leftFillNum(a, 2)));
    // Add duplicate final room
    // [10, 11, 12].map(i => correct_responses['db'+(i+3)] = correct_responses['db'+i]);
    return correct_responses;
}


const state = {
  W          : null,
  H          : null,
  subject_nr : null,
  role       : null,
  condition  : null,
  map        : null,
  trial_nr   : 0,
  painting   : null,
  t_q1       : null,
  t_r1       : null,
  r1         : null,
  t_q2       : null,
  t_r2       : null,
  r2         : null,
  t_q3       : null,
  t_r3       : null,
  r3         : null
};


$( document ).ready(function(){
  $( window ).resize(_.debounce(resize, 50));
  resize();
  Ready();
});

function TraceMethod1(map, then){
  let canvas = $('#trace-map')[0];
  let ctx = canvas.getContext('2d');
  // let map = globals.map;
  let w = canvas.width = 600;
  let h = canvas.height = 600;
  ctx.drawImage(map, 0, 0, w, h);
  ctx.strokeStyle = "red";
  ctx.lineJoin = "round";
  ctx.lineWidth = 10;
  globals.clicking = false;
  globals.X = [];
  globals.Y = [];

  function draw_here(e){
    e.preventDefault();
    let x, y;
    let ot = e.handleObj.type;
    console.log('F: draw_here - ' + ot);
    if(ot == 'touchstart' | ot == 'touchmove'){
      x = e.originalEvent.touches[0].pageX;
      y = e.originalEvent.touches[0].pageY;
    } else {
      x = e.pageX;
      y = e.pageY;
    }
    console.log('Original: ' + x + ' ' + y);
    let ox = canvas.offsetLeft,
        oy = canvas.offsetTop;
    let sx = $('#trace-map').css('width').replace('px', '')/w,
        sy = $('#trace-map').css('height').replace('px', '')/h;
    x = (x-ox)/sx;
    y = (y-oy)/sy;
    console.log('Transformed: ' + x + ' ' + y);
    let X = globals.X,
        Y = globals.Y;
    let n = X.length;
    ctx.moveTo(X[n-1], Y[n-1]);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.stroke();
    globals.X.push(x);
    globals.Y.push(y);
  }
  draw_here = _.debounce(draw_here, 100);
  $('#trace-map').on('mousedown touchstart', function(e){
    globals.clicking = true;
    draw_here(e);
  });
  $('#trace-map').on('mouseup touchend', function(e){
    globals.clicking = false;
  });
  $('#trace-map').on('mousemove touchmove', function(e){
    if(globals.clicking) {
      draw_here(e);
    }
  });
  if(then){
    then();
  }
}


function TraceMethod2(then){
  // http://bencentra.com/code/2014/12/05/html5-canvas-touch-events.html
  let canvas = document.getElementById("trace-map");
  let ctx = canvas.getContext("2d");
  // ctx.strokeStyle = "red";
  // ctx.lineWith = 20;
  globals.clicking = false;
  globals.X = [];
  globals.Y = [];
  globals.T = [];
  let map = globals.map;
  let w = canvas.width = 736;
  let h = canvas.height = 1056;
  ctx.drawImage(map, 0, 0, w, h);

  let drawing = false;
  let mousePos = { x:0, y:0 };
  let lastPos = mousePos;
  canvas.addEventListener("mousedown", function (e) {
    console.log('mousedown');
    $('#submit').show();
    drawing = true;
    lastPos = getMousePos(canvas, e);
  }, false);
  canvas.addEventListener("mouseup", function (e) {
    drawing = false;
  }, false);
  canvas.addEventListener("mousemove", function (e) {
    mousePos = getMousePos(canvas, e);
  }, false);
  // Get the position of the mouse relative to the canvas
  function getMousePos(canvasDom, mouseEvent) {
    let rect = canvasDom.getBoundingClientRect();
    let x = (mouseEvent.clientX - rect.left) * (canvasDom.width / rect.width);
    let y = (mouseEvent.clientY - rect.top) * (canvasDom.height / rect.height);
    return {x: x, y: y};
  }

  // Set up touch events for mobile, etc
  canvas.addEventListener("touchstart", function (e) {
    mousePos = getTouchPos(canvas, e);
    let touch = e.touches[0];
    let mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  }, false);
  canvas.addEventListener("touchend", function (e) {
    let mouseEvent = new MouseEvent("mouseup", {});
    canvas.dispatchEvent(mouseEvent);
  }, false);
  canvas.addEventListener("touchmove", function (e) {
    let touch = e.touches[0];
    let mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  }, false);

  // Get the position of a touch relative to the canvas
  function getTouchPos(canvasDom, touchEvent) {
    let rect = canvasDom.getBoundingClientRect();
    let x = (touchEvent.touches[0].clientX - rect.left) * (canvasDom.width / rect.width);
    let y = (touchEvent.touches[0].clientY - rect.top) * (canvasDom.height / rect.height);
    return {x: x, y: y};
  }

  // Prevent scrolling when touching the canvas
  // This doesn't seem to work!
  // document.body.addEventListener("touchstart", function (e) {
  //   console.log('touch start');
  //   if (e.target == canvas) {
  //     e.preventDefault();
  //   }
  // }, false);
  // document.body.addEventListener("touchend", function (e) {
  //   if (e.target == canvas) {
  //     e.preventDefault();
  //   }
  // }, false);
  // document.body.addEventListener("touchmove", function (e) {
  //   if (e.target == canvas) {
  //     e.preventDefault();
  //   }
  // }, false);

  // Get a regular interval for drawing to the screen
  window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimaitonFrame ||
      function (callback) {
        window.setTimeout(callback, 1000/globals.framerate);
      };
  })();

  // Draw to the canvas
  function renderCanvas() {
    if (drawing) {
      if(!_.isEqual(mousePos, lastPos)){
        ctx.lineJoin = "round";
        ctx.lineWidth = 10;
        ctx.strokeStyle = "red";
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        globals.X.push(Math.round(mousePos.x));
        globals.Y.push(Math.round(mousePos.y));
        globals.T.push(Date.now() - globals.trace_t0);
      }
      lastPos = mousePos;
    }
  }

  // Allow for animation
  (function drawLoop () {
    globals.animation = requestAnimFrame(drawLoop);
    renderCanvas();
  })();
  resize();
  globals.trace_t0 = Date.now();
  globals.stop_animation = (x => window.cancelAnimationFrame(globals.animation));
  if(then){
    then();
  }
}

//  //  //  //  //  //  ///
// Start of utilities.js //
//  //  //  //  //  //  ///
"use strict";

function get_subject_nr(){
    let subject_nr = Math.round(Math.random()*1000000000);
    // var subject_nr = localStorage['subject_nr'];
    // subject_nr = (typeof subject_nr === 'undefined') ?
    //   Math.round(Math.random()*1000000000) : subject_nr;
    return subject_nr;
}


function resize(){
    // Call
    // $( window ).resize(_.debounce(resize, 100));
    // in your script to keep track of the size of the window.
    // NB: `state` variable must already exist.
    console.log('F: resize');
    let W, H;
    state.W = W = $( window ).width();
    state.H = H = $( window ).height();
    $('#trace-map').css('left', .5 * (W - $('#trace-map').width() ));
    $('#drag-map-wrapper').css('left', .5 * (W - $('#drag-map-wrapper').width() ));
    let tm = $('#trace-map:visible, #drag-map-wrapper:visible');
    if(tm.position()){
        $('#low-question').css('top', tm.position().top + tm.height()*1.05);  
    }
    ResizeMap();
};

function send_to_server(data, fp){
    console.log('Sending data');
    data['fp'] = fp;
    data['timestamp'] = Date.now();
    console.log(data);
    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: './log.php',
        success: function(data) {
            console.log('Result:');
            console.log(JSON.stringify(data));
        }
    });
}

function generate_random_list(length){
    return _.shuffle(_.range(length));
};

function flip(prob){
    prob = prob || .5;
    var r = Math.random();
    return (r < prob);
}
function fiftyfifty() {return coin_toss(.5);};

// Standard Normal variate using Box-Muller transform.
function random_normal(mu, sigma) {
    // Defaults to N(0, 1)
    mu = mu || 0;
    sigma  = sigma || 1;
    var u = 1 - Math.random(); // Subtraction to flip [0, 1) to (0, 1].
    var v = 1 - Math.random();
    return mu + sigma*Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function random_geometric(p) {
    // Note mean value is (1/p) - 1, not 1/p.
    var f = function(i, p){
        res = coin_toss(p) ? i : f(i+1, p);
        return(res);
    };
    return(f(0, p));
}

function random_exponential(rate) {
    // https://gist.github.com/nicolashery/5885280
    // http://en.wikipedia.org/wiki/Exponential_distribution#Generating_exponential_variates
    var u = Math.random();
    return -Math.log(u)/rate;
}

function fillArray(value, len) {
    if (len == 0) return [];
    var a = [value];
    while (a.length * 2 <= len) a = a.concat(a);
    if (a.length < len) a = a.concat(a.slice(0, len - a.length));
    return a;
}
function enumerate(lst, f){
    var z = _.zip(_.range(0, lst.length), lst);
    return _.map(z, function(x){
        return f(x[0], x[1]);
    });
};

function Pass(){
    console.log('Pass');
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



function count_values(x){
    var vals = _.uniq(x).sort();
    var counts = vals.map(v => _.sum(x.map(_x => _x==v)));
    return(_.zipObject(vals, counts)); 
}

function seconds_to_string(secs){
    // For showing clocks
    // e.g. second_to_string(75) => "01:15"
    var m = Math.floor(secs/60);
    var s = secs % 60;
    return String(m) + ':' + String(s).padStart(2, '0');
}

function pseudo_random_repeat(x, times_per_block, n_blocks){
    // Creates `n_blocks` sequences, each containing x repeated `times_per_block`, then shuffled.
    // All output is flattened to a single list.
    var do_block = i => _.chain(times_per_block).times( j => x).flatten().shuffle().value();
    var res =      _.chain(n_blocks).times(do_block).flatten().value();
    return res;
}


function check_is_mobile(){
    // Shoddy hack
    return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4));
}

function permute(permutation) {
    var length = permutation.length,
        result = [permutation.slice()],
        c = new Array(length).fill(0),
        i = 1, k, p;
    while (i < length) {
        if (c[i] < i) {
            k = i % 2 && c[i];
            p = permutation[i];
            permutation[i] = permutation[k];
            permutation[k] = p;
            ++c[i];
            i = 1;
            result.push(permutation.slice());
        } else {
            c[i] = 0;
            ++i;
        }
    }
    return result;
}

function argmin(x){
    let m = _.min(x);
    let i = x.findIndex( v => v == m);
    return(i);
}

// function preload_image(url) {
//     let img = new Image();
//     img.src = url;
// }

function leftFillNum(num, width){
    let x = num.toString();
    let n = x.length;
    return(x.padStart(width-n+1, 0));
}

function generate_image_radio(value, group_name){
    let template = `` +
        `<input name="${group_name}" id="${group_name}-${value}" type="radio" value="${value}" />` + 
        `<label class="fav-cc" for="${group_name}-${value}" id="lbl-${group_name}-${value}"></label>` +
        ``;
    return($(template));
}

function label_locations(){
    _.range(1, 19).map(function(i){
        let b = $('#db' + i);
        b.html(i);
    });
}

function get_numbers(x){
    return Number(x.match('[0-9]+'));
};

/* View in fullscreen */
function openFullscreen() {
    let elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
}
