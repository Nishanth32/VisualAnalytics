/// <reference path="../d3.js" />
var w = window.innerWidth * 0.95;
var h = Math.ceil(w * 0.7);
var oR = 0;
var nTop = 0;

// Clean Up data Object Data holder for JSON
var headJson = {
    "name": "Debris Analysis",
    "children": []
};

//Select the Main Container Element and set the height to 0.8 times the Window Height
var svgContainer = d3.select("#pageBuggle")
  .style("height", h*0.8 + "px");

// Append a SVG Element and set its width and height 
var svg = d3.select("#pageBuggle").append("svg")
     .attr("class", "pageBubbleSVG")
     .attr("width", w)
     .attr("height", 400)
     .attr("transform", "translate(" + 0 + ", 1)")
     .on("mouseleave", function () {
         //Reset bubbles on Mouse Leave Event Handler
         return resetBubbles();
     });

// Add Textboxes using text element to show Tooltip
var mainNote = svg.append("text")
 .attr("id", "bubbleItemNote")
 .attr("x", 10)
 .attr("y", w / 2 - 15)
 .attr("font-size", 20)
 .attr("dominant-baseline", "middle")
 .attr("alignment-baseline", "middle")
 .style("fill", "#888888")
 .text(function (d) { return "Visualization"; });

// Nest the data structure using Material Description attribute
var typeNest = d3.nest().key(function (d) { return d["Material Description"] || "Others"; });

// Create a nest structure object to group using List Name attribute
var nest = d3.nest()
    .key(function (d) { return d.ListName || "unknown"; });

// Call Chart function on Script Loads
chart("Aggregate.csv");

function chart(csvpath) {
  // Read the CSV Element relative to the script element
    d3.csv(csvpath, function (data) {
        // Group teh data using Material Description 
        var nestedData = nest.entries(data);
        // NOrmalize the data to use to cast the datatype as required
        nestedData = NormalizeProcessData(nestedData);
        

        var branchChildren = [];
        // For Each Group Element Build a Bubble Element
        nestedData.forEach(function (d) {
            var bub = BuildBubble(d);
            // Add a Child Bubble for Each group element
            branchChildren.push(bub);
        });

        headJson.children = branchChildren;
        // Build SVG element for the builded JSON File
        chartBubbleMe("no error", headJson);
    });
}

// Use the D3.jS Categry 10 Colors
var colVals = d3.scale.category10();
// Format the Input data string to  a valid date Object using Javascript
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

// Create Bubble JSON Object with Name , Description and Previous Identified Childrens
function CreateBubble(name, description, childen) {
    children = childen || [];
    if (name.length > 25) {
        name = name.substring(0, name.indexOf(" "));
    }

    return {
        "name": name,
        "description": description,
        "children": childen
    };
}

// Create a Bublbe Child JSON Element using Name, Address, Session Count, Child Collection and Debris Quantity
function CreateBubbleChild(name, address, sessionCount, collection, quantitySum) {
    return {
        "name": name,
        "address": address,
        "sessionCount": sessionCount,
        "collection": collection,
        "quantitySum": quantitySum
    };
}

// Main Bubble JSON build function to get the Final JSON BUild Object
function BuildBubble(inputGroupedData) {
    var groupKey = inputGroupedData.key;
    var groupLength = inputGroupedData.values.length;
    // Nest and Group data for Bubbles
    var typeNestedData = typeNest.entries(inputGroupedData.values);
    var leafChildren = [];
    typeNestedData.forEach(function (d) {
        var typeKey = d.key;
        var sessionCount = d.values.length;
        var contributionPercent = (sessionCount / groupLength) * 100;
        var quantitySum = d3.sum(d.values, function (e) { return e.Quantity; });
        leafChildren.push(CreateBubbleChild(typeKey, "", sessionCount, contributionPercent, quantitySum));
    });
    // Create Group BUbble
    return CreateBubble(groupKey, "", leafChildren);

}

// Normalize the data and remove Outliers to create an unifrom steam of data
function NormalizeProcessData(inputData) {

    try {
        // Get the Mean quantity for each record
        var mean = d3.mean(inputData, function (d) { return d.values.length; });

        var temp = { key: "Others", values: [] };
        var final = [];
        inputData.forEach(function (d) {
            if (d.values.length > mean) {
                final.push(d);
            } else {
                temp.values = d3.merge([d.values, temp.values]);
            }
        });
        final.push(temp);

        return final;
    } catch (e) {
        console.log(e.message);
    }

    return inputData;
}

//  Update Tooltip tiles
function UpdateTiles(dElement, color) {
    try {

        $("#itemName").text(dElement.name);
        $("#sessionCount").text(dElement.sessionCount);
        $("#debrisCollected").text(dElement.quantitySum);
        $("#collection").text(dElement.collection + "%");
        $("#itemName").css("background", color);

    } catch (e) {
        console.log(e.message);
    }
}


//Following Code is referenced from http://sunsp.net/demo/BubbleMenu/
// Build the Bubble Chart SVG Elements
function chartBubbleMe(error, root) {
    console.log(error);
    svg = svg.append("svg:g").attr("transform", "translate(" + 0 + ", 50)")
    var bubbleObj = svg.selectAll(".topBubble")
            .data(root.children)
        .enter().append("g")
            .attr("id", function (d, i) { return "topBubbleAndText_" + i });

    console.log(root);
    nTop = root.children.length;
    oR = w / (1 + 3 * nTop);

    h = Math.ceil(w / nTop * 2);
    svgContainer.style("height", h + "px");



    bubbleObj.append("circle")
        .attr("class", "topBubble")
        .attr("id", function (d, i) { return "topBubble" + i; })
        .attr("r", function (d) { return oR; })
        .attr("cx", function (d, i) { return oR * (3 * (1 + i) - 1); })
        .attr("cy", (h + oR) / 3)
        .style("fill", function (d, i) { return colVals(i); }) // #1f77b4
    .style("opacity", 0.4)
        .on("mouseover", function (d, i) { return activateBubble(d, i); });


    bubbleObj.append("text")
        .attr("class", "topBubbleText")
        .attr("x", function (d, i) { return oR * (3 * (1 + i) - 1); })
        .attr("y", (h + oR) / 3)
    .style("fill", function (d, i) { return colVals(i); }) // #1f77b4
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("alignment-baseline", "middle")
        .text(function (d) { return d.name })
        .on("mouseover", function (d, i) { return activateBubble(d, i); });


    for (var iB = 0; iB < nTop; iB++) {
        var childBubbles = svg.selectAll(".childBubble" + iB)
            .data(root.children[iB].children)
            .enter().append("g");

        childBubbles.append("circle")
            .attr("class", "childBubble" + iB)
            .attr("id", function (d, i) { return "childBubble_" + iB + "sub_" + i; })
            .attr("r", function (d) { return oR / 3.0; })
            .attr("cx", function (d, i) { return (oR * (3 * (iB + 1) - 1) + oR * 1.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926)); })
            .attr("cy", function (d, i) { return ((h + oR) / 3 + oR * 1.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926)); })
            .attr("cursor", "pointer")
            .style("opacity", 0.5)
            .style("fill", "#eee")
            .on("click", function (d, i) {
                window.open(d.address);
            })
        .on("mouseover", function (d, i) {           
            var noteText = "";
            if (d.note == null || d.note == "") {
                noteText = d.address;
            } else {
                noteText = d.note;
            }
            UpdateTiles(d, colVals(this.id.split("_")[1].substring(0, 1)));
            d3.select("#bubbleItemNote").text(noteText);
            setTimeout(UpdateGraph(d["name"]), 100);
        })
        .append("svg:title")
        .text(function (d) { return d.address; });

        childBubbles.append("text")
            .attr("class", "childBubbleText" + iB)
            .attr("x", function (d, i) { return (oR * (3 * (iB + 1) - 1) + oR * 1.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926)); })
            .attr("y", function (d, i) { return ((h + oR) / 3 + oR * 1.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926)); })
            .style("opacity", 0.5)
            .attr("text-anchor", "middle")
        .style("fill", function (d, i) { return colVals(iB); }) // #1f77b4
            .attr("font-size", 10)
            .attr("cursor", "pointer")
            .attr("dominant-baseline", "middle")
        .attr("alignment-baseline", "middle")
            .text(function (d) { return d.name })
            .on("click", function (d, i) {
                window.open(d.address);
            });

    }


}
// Rebuild the Bubble chart to adjust to user Mouse leave Events
resetBubbles = function () {
    w = window.innerWidth* 0.95;
    oR = w / (1 + 3 * nTop);

    h = Math.ceil(w / nTop * 2);
    //svgContainer.style("height", h + "px");

    mainNote.attr("y", h - 15);

   svg.attr("width", w);
  //  svg.attr("height", h);



    var t = svg.transition()
        .duration(650);

    t.selectAll(".topBubble")
        .attr("r", function (d) { return oR; })
        .attr("cx", function (d, i) { return oR * (3 * (1 + i) - 1); })
        .attr("cy", (h + oR) / 3);

    t.selectAll(".topBubbleText")
    .attr("font-size", 10)
        .attr("x", function (d, i) { return oR * (3 * (1 + i) - 1); })
        .attr("y", (h + oR) / 3);

    for (var k = 0; k < nTop; k++) {
        t.selectAll(".childBubbleText" + k)
                .attr("x", function (d, i) { return (oR * (3 * (k + 1) - 1) + oR * 1.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926)); })
                .attr("y", function (d, i) { return ((h + oR) / 3 + oR * 1.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926)); })
            .attr("font-size", 6)
                .style("opacity", 0.7);

        t.selectAll(".childBubble" + k)
                .attr("r", function (d) { return oR / 3.0; })
            .style("opacity", 0.7)
                .attr("cx", function (d, i) { return (oR * (3 * (k + 1) - 1) + oR * 1.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926)); })
                .attr("cy", function (d, i) { return ((h + oR) / 3 + oR * 1.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926)); });

    }
}
//Rebuild the Bubble chart to adjust to user Mouse Enter Events
function activateBubble(d, i) {
    // increase this bubble and decrease others
    var t = svg.transition()
        .duration(d3.event.altKey ? 7500 : 350);

    t.selectAll(".topBubble")
        .attr("cx", function (d, ii) {
            if (i == ii) {
                // Nothing to change
                return oR * (3 * (1 + ii) - 1) - 0.6 * oR * (ii - 1);
            } else {
                // Push away a little bit
                if (ii < i) {
                    // left side
                    return oR * 0.6 * (3 * (1 + ii) - 1);
                } else {
                    // right side
                    return oR * (nTop * 3 + 1) - oR * 0.6 * (3 * (nTop - ii) - 1);
                }
            }
        })
        .attr("r", function (d, ii) {
            if (i == ii)
                return oR * 1.8;
            else
                return oR * 0.8;
        });

    t.selectAll(".topBubbleText")
        .attr("x", function (d, ii) {
            if (i == ii) {
                // Nothing to change
                return oR * (3 * (1 + ii) - 1) - 0.6 * oR * (ii - 1);
            } else {
                // Push away a little bit
                if (ii < i) {
                    // left side
                    return oR * 0.6 * (3 * (1 + ii) - 1);
                } else {
                    // right side
                    return oR * (nTop * 3 + 1) - oR * 0.6 * (3 * (nTop - ii) - 1);
                }
            }
        })
        .attr("font-size", function (d, ii) {
            if (i == ii)
                return 10 * 1.5;
            else
                return 10 * 0.6;
        });

    var signSide = -1;
    for (var k = 0; k < nTop; k++) {
        signSide = 1;
        if (k < nTop / 2) signSide = 1;
        t.selectAll(".childBubbleText" + k)
            .attr("x", function (d, i) { return (oR * (3 * (k + 1) - 1) - 0.6 * oR * (k - 1) + signSide * oR * 2.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926)); })
            .attr("y", function (d, i) { return ((h + oR) / 3 + signSide * oR * 2.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926)); })
            .attr("font-size", function () {
                return (k == i) ? 12 : 6;
            })
            .style("opacity", function () {
                return (k == i) ? 1 : 0;
            });

        t.selectAll(".childBubble" + k)
            .attr("cx", function (d, i) { return (oR * (3 * (k + 1) - 1) - 0.6 * oR * (k - 1) + signSide * oR * 2.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926)); })
            .attr("cy", function (d, i) { return ((h + oR) / 3 + signSide * oR * 2.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926)); })
            .attr("r", function () {
                return (k == i) ? (oR * 0.55) : (oR / 3.0);
            })
            .style("opacity", function () {
                return (k == i) ? 1 : 0;
            });
    }
}
//Hook the User mouse event Handler
window.onresize = resetBubbles;
