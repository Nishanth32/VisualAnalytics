/// <reference path="../../d3.js" />
var plasticSvg = d3.select(".areaChart").select("svg"),
    margin = { top: 20, right: 20, bottom: 40, left: 50 },
    width = window.innerWidth - margin.left - margin.right,
    height = (window.innerHeight/2) - margin.top - margin.bottom,
    g = plasticSvg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

plasticSvg = plasticSvg.attr("width", width).attr("height", height+margin.top+margin.bottom);
    //.attr("height", height + margin.top + margin.bottom + 10);

var x = d3.scaleTime()
    .rangeRound([width,0]);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var area = d3.area()
    .x(function (d) { return x(d.date); })
    .y1(function (d) { return y(d.count); });

var areaNest = d3.nest().key(function (d) { return d.date; });

var areaProcessedData = [];

d3.csv("Aggregate.csv", function (areaData) {
    
    areaData.forEach(function (d) {
        d.date = FormatTimeStamp(d.Timestamp);
    });    

    areaProcessedData = areaNest.entries(areaData);

    areaProcessedData.forEach(function (d) {
        d.date = d.values[0].date;
        d.count = d.values.length;
    });

    areaProcessedData.sort(function (a, b) { return b.date - a.date; })

    DrawGraph(areaProcessedData);
});

function FormatTimeStamp(inputDate) {
    if (inputDate == null) return (new Date());
    inputDate = Number(inputDate).toString()
    var year = inputDate.substring(0, 4);
    var month = inputDate.substring(4, 6);
    var day = inputDate.substring(6, 8);
    var hour = inputDate.substring(8, 10);
    var minutes = inputDate.substring(10, 12);
    var seconds = inputDate.substring(12, 14);
    
    return (new Date(year, month, day, hour, minutes, seconds, 0));

}

function DrawGraph(data) {

    x.domain([new Date(data[0].date),new Date(data[data.length-1].date)]);
    y.domain([0, d3.max(data, function (d) { return d.count; })]);
    area.y0(y(0));

    g.append("path")
        .datum(data).attr("class","area").transition().delay(2000)
        .attr("fill", "steelblue")
        .attr("d", area);

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    g.append("g")
        .call(d3.axisLeft(y))
      .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Cleanup Frequency");

}


function UpdateGraph(attributeName){

    try {
        var tempDatum = [];

        for (var cout = 0; cout < areaProcessedData.length; cout++) {
            var model = { "key": "", "values": [] };
            model.key = areaProcessedData[cout].key;
            model.date = areaProcessedData[cout].date;

            areaProcessedData[cout].values.forEach(function (d) {
                if (d["Material Description"] == attributeName) {
                    model.values.push(d);
                }

            });
            model.count = model.values.length;
            tempDatum.push(model);
        }

        y.domain([0, d3.max(tempDatum, function (d) { return d.count; })]);
        var area1 = d3.area()
        .x(function (d) { return x(d.date); })
        .y1(function (d) { return y(d.count); });
        area1.y0(y(0));

        // g.select("path").remove();
        g.select("path")
        .datum(tempDatum).transition().delay(1000).attr("class", "area")
        .attr("fill", "steelblue")
        .attr("d", area1);
    } catch (e) {

    } 
}
