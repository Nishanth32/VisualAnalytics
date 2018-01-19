/// <reference path="../d3.js" />
/// <reference path="../d3.legend.js" />

// Global Varaibles for storing the previous state data
var pro = "";
var datearray = [];
var colorrange = [];
var cacheArray = [];

// Generate Random Numbers
var random = Math.floor((Math.random() * 3));
// Use the Random color for each chart refresh
var colorrange = chartFuncToArray(random);
strokecolor = colorrange[0];

// Define the Margin
var margin = { top: 20, right: 60, bottom: 30, left: 60 };
//Assign the Width
var width = document.body.clientWidth - margin.left - margin.right;
//Assign the Width
var height = window.innerHeight - margin.top - margin.bottom - 70;
// VCreate Tooltip element with alert classes
var tooltip = d3.select("body")
    .select("div.alert")
    .style("position", "absolute")
    .style("z-index", "20")
    .style("visibility", "hidden")

// Define the X Scale
var x = d3.time.scale()
    .range([0, width]);
var xAxis = d3.svg.axis()
.scale(x)
.orient("bottom")
.ticks(d3.time.years);
//Define the Y Scales
var y = d3.scale.linear().range([height - 10, 0]);
// Build Y Axis Left
var yAxis = d3.svg.axis().scale(y);
// Build the Y Axis Right
var yAxisr = d3.svg.axis().scale(y);
// Build the Z Scale
var z = d3.scale.ordinal()
    .range(colorrange);
// Get the Stack Layout Element with silhoutte Offset
var stack = d3.layout.stack()
    .offset("silhoutte")
    .values(function (d) {
        return d.values;
    })
    .x(function (d) {
        return d.date;
    })
    .y(function (d) {
        return d.value;
    });

// Nest Strucute using the Data key Attribute
var nest = d3.nest()
    .key(function (d) {
        return d.key;
    });
// Get the Area Interpolated structure with cardinal as parameters
var area = d3.svg.area()
    .interpolate("cardinal")
    .x(function (d) {
        return x(d.date);
    })
    .y0(function (d) {
        return y(d.y0);
    })
    .y1(function (d) {
        return y(d.y0 + d.y);
    });

// Toggle Shart Visibility on script load
$(".chart").fadeToggle("fast");
// Following code is referenced from http://bl.ocks.org/WillTurman/4631136
// Main Draw Chart function to process the data
function drawChart(processArray) {
    // Empty the main div chart element
    $(".chart").html('');
    var svg = d3.select(".chart").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var data = [];
    cacheArray = processArray;
    //Process each record with data to synchronize with the template
    processArray.forEach(function (d) {

        var materialDes = d["Material Description"];
        var objKeys = Object.keys(d);
        for (counter = 0; counter < objKeys.length; counter++) {
            var newObject = {};
            if (objKeys[counter] != "Material Description") {
                newObject["key"] = materialDes;
                newObject["value"] = Number(d[objKeys[counter]]);
                newObject["date"] = FormatTimeStamp(objKeys[counter]);
                data.push(newObject);
            }

        }

    });
    // Group the data using key attribtue
    var nestedData = nest.entries(data);
    // Stack the data to build the each steam
    var layers = stack(nestedData);
    // Get the Y max
    var ymax = d3.max(data, function (d) {
        return d.y0 + d.y;
    });
    // Set the X domain using the date extent
    x.domain(d3.extent(data, function (d) {
        return d.date;
    }));
    // Set the Y domain
    y.domain([0, ymax]);

    svg.selectAll(".layer")
        .data(layers)
      .enter().append("path")
        .attr("class", "layer")
        .attr("d", function (d) {
            return area([]);
        }).transition()
           .duration(1500)
    .attr("d", function (d) {
        return area(d.values);
    }).style("fill", function (d, i) { return z(i); });
    // Create the Legent for chart
    var legend = svg.append("g").attr("transform", "translate(50,0)")
                  .selectAll("g")
                  .data(layers)
                  .enter().append("g")
                  .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function (d, i) { return z(i); });

    legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text(function (d) { return d.key; });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis).append("text")
        .attr("fill", "#000")
        .attr("x", width    )
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Date");;

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + ", 0)")
        .call(yAxisr.orient("right"))

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis.orient("left")).append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Cleanup Frequency");;

    svg.selectAll(".layer")
      .attr("opacity", 1)
      .on("mouseover", function (d, i) {
          svg.selectAll(".layer").transition()
          .duration(250)
          .attr("opacity", function (d, j) {
              return j != i ? 0.6 : 1;
          })
      })

      .on("mousemove", function (d, i) {
          mousex = d3.mouse(this);
          mousex = mousex[0];
          var invertedx = x.invert(mousex);
          invertedx = invertedx.getMonth() + invertedx.getDate();
          var selected = (d.values);
          for (var k = 0; k < selected.length; k++) {
              datearray[k] = selected[k].date
              datearray[k] = datearray[k].getMonth() + datearray[k].getDate();
          }

          mousedate = datearray.indexOf(invertedx);
          if (d.values[mousedate] == undefined) return;
          pro = d.values[mousedate].value;

          d3.select(this)
          .classed("hover", true)
          .attr("stroke", strokecolor)
          .attr("stroke-width", "0.5px"),
          tooltip.html("<p> Material Description :" + d.key + "<br> Debris Count :" + pro + "</p>").style("visibility", "visible");

      })
      .on("mouseout", function (d, i) {
          svg.selectAll(".layer")
           .transition()
           .duration(250)
           .attr("opacity", "1");
          d3.select(this)
          .classed("hover", false)
          .attr("stroke-width", "0px"), tooltip.html("<p>" + d.key + "<br>" + pro + "</p>").style("visibility", "hidden");
      })

    var vertical = d3.select(".chart")
          .append("div")
          .attr("class", "remove")
          .style("position", "absolute")
          .style("z-index", "19")
          .style("width", "1px")
          .style("height", "380px")
          .style("top", "10px")
          .style("bottom", "30px")
          .style("left", "0px")
          .style("background", "#fff");

    d3.select(".chart")
        .on("mousemove", function () {
            mousex = d3.mouse(this);
            mousex = mousex[0] + 5;
            vertical.style("left", mousex + "px")
        })
        .on("mouseover", function () {
            mousex = d3.mouse(this);
            mousex = mousex[0] + 5;
            vertical.style("left", mousex + "px")
        });
    $(".chart").fadeToggle("slow", "linear");
};

// Return each function call with differnt color array
function chartFuncToArray(randomColor) {
    var colorrange = null;
    if (randomColor == 0) {
        colorrange = d3.scale.category20();
    }
    else if (randomColor == 1) {
        colorrange = d3.scale.category20b();
    }
    else if (randomColor == 2) {
        colorrange = d3.scale.category20c();
    }

    var out = [];
    for (i = 0; i < 20; i++) {
        out.push(colorrange(i));
    }
    return out;
}

// Format the date time string  to date timestamp
function FormatTimeStamp(inputDate) {
    if (inputDate == null) return (new Date());
    inputDate = Number(inputDate).toString()
    var year = inputDate.substring(0, 4);
    var month = inputDate.substring(4, 6);

    return (new Date(year, month, 0));

}

// Function with wrapper
function chart(csvpath) {

    var graph = d3.csv(csvpath, drawChart);
}

// Call the chart function on script load
chart("Grouped.csv");

// Document ready self calling function for Date Picker Initialization
$(function () {
    $("#dialog").dialog(

        {
            width: 300,
            height: 180
        });
    $("#txtDate").datepicker({ minDate: -1, maxDate: "+10Y +10D" });
});

// Function to open dialog
function showDialog() {
    $("#dialog").dialog("open");
}

// Function to update the latest prediction to the chart
function UpdatePredictions() {
    try {
        // Get the date text for the date picker
        var dateText = $("#txtDate").datepicker('getDate');
        if (dateText == null || dateText == undefined || dateText == "") return;
        // Get the Month Element
        var month = dateText.getMonth();
        if (dateText.getMonth().toString().length == 1) { month = "0" + month; }
        var formattedDate = dateText.getFullYear() + "" + month;
        // Ajax call payload with cross domain as true
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://usableprivacysecurity.azurewebsites.net/api/data",
            "method": "POST",
            "headers": {
                "content-type": "application/json",
            },
            "processData": false,
            "data": "{\n  \"Inputs\": {\n    \"input1\": {\n      \"ColumnNames\": [\n        \"Date\",\n        \"CLOTH\",\n        \"COMMON LITTER\",\n        \"FISHING GEAR\",\n        \"GLASS\",\n        \"METAL\",\n        \"OTHER ITEMS\",\n        \"PAPER & LUMBER\",\n        \"PLASTIC\",\n        \"RUBBER\",\n        \"URBAN LITTER\",\n        \"Total\"\n      ],\n      \"Values\": [\n        [\n          \"" + formattedDate + "\",\n          \"0\",\n          \"0\",\n          \"0\",\n          \"0\",\n          \"0\",\n          \"0\",\n          \"0\",\n          \"0\",\n          \"0\",\n          \"0\",\n          \"0\"\n        ]\n      ]\n    }\n  },\n  \"GlobalParameters\": {}\n}"
        }
        // Make an ajax Request and parse the response
        $.ajax(settings).done(function (response) {
            var parsedDaa = JSON.parse(response);
            var responseValue = parsedDaa.Results.output1.value.Values[0][0];
            if (responseValue == null || responseValue == 0) return;
            if (cacheArray == null || cacheArray.length <= 0) return;
            responseValue = responseValue / 10;
            cacheArray.forEach(function (record) {
                // Get by date
                record[formattedDate] = responseValue;

            });
            // Redraw the chart
            drawChart(cacheArray);

        });
    } catch (e) {

    }finally
    {
        // Toggle the visibility of the chart element
        $(".chart").fadeToggle("slow", "linear");
    }


}
