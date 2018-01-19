// Create the Google Map…
var map = new google.maps.Map(d3.select("#map").node(), {
    zoom: 14,
    center: new google.maps.LatLng(37.76487, -122.41948),
    gestureHandling: 'none',
    streetViewControl: false,
    zoomControl: false

});

// Load the station data. When the data comes back, create an overlay.
var lastElement = 100;
var mapdata = [];
var marker = null;
var projection = null;
// Load the CSV data from the aggregate dataset
d3.csv("../Aggregate.csv", function (error, data1) {
    if (error) throw error;
    // Last element for the reecent select Material ID
    for (i = 0; i < data1.length; i++) {
        if (lastElement != data1[i]["Material ID"]) {
            lastElement = data1[i]["Material ID"]; break;
        }
    }
   // Clean the data to get all records with valid latitude
    for (i = 0; i < 1000; i++) {
      
        if (data1[i]["Latitude"] != undefined) {
            mapdata.push(data1[i * 10]);
        }

    }


    // Get the Map overlay
    var overlay = new google.maps.OverlayView();

    // Add the container when the overlay is added to the map.
    overlay.onAdd = function () {
        var layer = d3.select(this.getPanes().overlayLayer).append("div")
            .attr("class", "stations");

        // Draw each marker as a separate SVG element.
        // We could use a single SVG, but what size would it have?
        overlay.draw = function () {
            projection = this.getProjection(),
                padding = 18;

            marker = layer.selectAll("svg")
                .data(d3.entries(mapdata))
                .each(transform) // update existing markers
              .enter().append("svg")
                .each(transform)
                .attr("class", "marker");

            // Add a circle.
            marker.append("circle")
                .attr("r", 4.5)
                .attr("cx", padding)
                .attr("cy", padding);

            // Add a label.
            marker.append("text").attr("x", padding + 7).attr("y", padding).attr("dy", ".81em").text(function (d) { return d.value["Material Description"]; }).style("opacity",0);


            // Convert the Map pixels to google Map latitude and longitude
            function transform(d) {
                d = new google.maps.LatLng(d.value["Latitude"], d.value["Longitude"]);
                d = projection.fromLatLngToDivPixel(d);
                return d3.select(this)
                    .style("left", (d.x - padding) + "px")
                    .style("top", (d.y - padding) + "px");
            }
        };
    };

    // Bind our overlay to the map…
    overlay.setMap(map);

    // Animate the map zoom using set timeout function
    setTimeout(zoompan, 3000);
    
});

// Function to zoom the map
function zoompan() {
    try {
        if (znumber > 1000) { znumber = 0; }
        znumber = znumber + 50;
        var valmarker = mapdata[znumber];

        var ele = new google.maps.LatLng(valmarker["Latitude"], valmarker["Longitude"]);

        d3.select("div.stations").selectAll("cirlce").attr("r", 4.5);

        var filtered  = d3.select("div.stations").selectAll("svg.marker").filter(function (d) {
            if (d.value["Latitude"] == valmarker["Latitude"] && d.value["Longitude"] == valmarker["Longitude"]) {
                return true;
            } else return false;
        });
        filtered.select("circle").transition().delay(1000).attr("r", 12).style("fill", "red");
        filtered.select("text").transition().delay(2000).style("opacity",1);

        // Pan to the random selected Element
        map.panTo(ele);
        
    } catch (e) {

    }

    setTimeout(zoompan, 10000);
}


var znumber = 0;