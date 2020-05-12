// Define chart dimensions and axes
var margin = {top: 20, right: 20, bottom: 30, left: 50},
width = 600 - margin.left - margin.right,
height = 480 - margin.top - margin.bottom;

var x = d3.scaleLinear()
    .domain([0, 60])
    .range([0, width]);

var y = d3.scaleLinear()
// var y = d3.scale.pow().exponent(Math.E) //
    .domain([0, 1])
    .range([height, 0]);

var xAxis = d3.axisBottom()
    .scale(x);

var yAxis = d3.axisLeft()
    .scale(y);

// Creat the chart, and axes
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    // .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("");


// Functions for drawing the chart itself


// function draw() {
//     updateLines();
//     x.domain([minX, maxX])
//     svg.selectAll(".line")
//         .data(yvals)
//         .enter().append("path")
//         .attr("class", "line")
//         .attr("d", line)
//         .attr("data-legend", function(d, i) { return conditions[i]})
//         .style("stroke", function(d, i) { return colorScale(conditions[i])})
// }

var mu = 10;
var sigma = 5;
var plotx = _.range(0, 30, .1);
var ploty = plotx.map( function(x){
    return(1 / ((mu - x)**2))
})
var plot_data = _.zip(plotx, ploty);

var line = d3.line()
    .x(function(d, i){ return x(plotx[i]) })
    .y(function(d){ return y(d) })


// var line = d3.line()
//     .interpolate("basis")
//     .x(function(d, i) { return x(plotx[i]); })
//     .y(y);

// svg.selectAll(".line")
//     .data(ploty)
//     .enter().append("path")
//     .attr("class", "line")
//     .attr("d", line)
//     .style("stroke", "black")

// var circles = svg.selectAll("circle")
//     .data(plot_data)
//     .enter()
//     .append("circle")
//     .attr("r", 5)
//     .attr("fill", "blue")
//     .attr("fill-opacity", 1)
//     .attr('cx', function(d){
//         return(d[0]*10)
//     })
//     .attr('cy', function(d){
//         return(d[1]*100)
//     });
