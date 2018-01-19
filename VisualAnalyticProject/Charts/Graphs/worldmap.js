// Set the Map Width as the window width
var width = window.outerWidth;
// Set the Map height as the window Outer Height
var height = window.outerHeight;

// Get the Geo Mercator as the Map Projection
var projection = d3.geo.mercator();

// Append the main SVG Element
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
// Create the D3 Geo Path Structure and set its projection
var path = d3.geo.path()
    .projection(projection);
var g = svg.append("g").attr("width", width)
    .attr("height", height);;
// Read the JSON for Map marking records
d3.json("world.json", function (error, topology) {
    g.selectAll("path")
      .data(topojson.object(topology, topology.objects.countries)
          .geometries)
      .enter()
      .append("path")
      .attr("d", path)

    // load and display the cities
    // Read the text file for Map Labels
    d3.json("file.txt", function (error, data) {
        //Slice the array with top 2000 and convert to array
        var arr = Object.keys(data).map(function (key) { return data[key].slice(0, 2000); });
        // Get the column attributes
        var debrisTypes = Object.keys(data);
        // Define the color array
        colors = ["red", "blue", "DarkSalmon", "orange", "MediumVioletRed", "Orange", "violet", "DarkRed", "Red", "Yellow"]
        // Create svg element from the data using Enter selection
        g.selectAll('g')
          .data(arr)
          .enter()
          .append('g')
          .style("fill", (d, i) => colors[i])
            .selectAll('circle')
            .data(d => d)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return projection([d.Long, d.Lat])[0];
            })
            .attr("cy", function (d) {
                return projection([d.Long, d.Lat])[1];
            })
            .attr("r", 5);
        // Transform the Chart to desired position
        var rect = svg.append("rect").attr("transform", "translate(1080,30)").attr("width","200").attr("height","320").style("stroke","white").style("stroke-width","2px");
        // Position the Legend Element
        var legend = svg.append("g").attr("transform", "translate(1100,50)")            
            .selectAll("g")
            .data(arr)
            .enter().append("g")
            .attr("transform", function (d, i) { return "translate(0," + i * 30 + ")"; });
        // Create Circle Elements
        legend.append("circle")
          .attr("r", 9)
          .style("fill", function (d, i) { return colors[i]; });
        // Create Text Element for the Legend
        legend.append("text")
          .attr("x", 24)
          .attr("dy", ".35em").attr("fill","white")
          .text(function (d,i) { return debrisTypes[i]; });
    });

});
// Define the D3 Zoom Behavior function element and hook the event handler on zoom
var zoom = d3.behavior.zoom()
  .on("zoom", function () {
      g.attr("transform", "translate(" +
          d3.event.translate.join(",") + ")scale(" + d3.event.scale + ")");
      g.selectAll("path")
          .attr("d", path.projection(projection));
  });
// call the zoom on script load
svg.call(zoom)
