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
