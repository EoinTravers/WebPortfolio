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

