/**
 * Created by Iaroslav Zhbankov on 01.02.2017.
 */
var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json', false);
xhr.send();
if (xhr.status != 200) {
    alert(xhr.status + ': ' + xhr.statusText);
} else {
    var response = JSON.parse(xhr.responseText).features;
}

var maxMass = 0;
data = response.map(function(item){
    if(item.geometry) {
        item.lat = item.geometry.coordinates[1];
        item.lon = item.geometry.coordinates[0];
        item.fall = item.properties.fall;
        item.mass = item.properties.mass;
        item.name = item.properties.name;
        item.nametype = item.properties.nametype;
        item.recclass = item.properties.recclass;
        item.year = item.properties.year;
    }
    return item;
}).filter(function(item){return item.lat});

data.forEach(function(item){
    if (Number(item.mass) > maxMass){
        maxMass = Number(item.mass);
    }
});

var width = 960,
    height = 500;

var projection = d3.geo.mercator()
    .center([0, 0 ])
    .scale(300)
    .rotate([0,0]);

var svg = d3.select(".graph").append("svg")
    .attr("width", width)
    .attr("height", height);

var tooltip = d3.select(".graph").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var path = d3.geo.path()
    .projection(projection);

var g = svg.append("g");

// load and display the World
d3.json("js/world-110m2.json", function(error, topology) {
    g.selectAll("path")
        .data(topojson.object(topology, topology.objects.countries)
            .geometries)
        .enter()
        .append("path")
        .attr("d", path);

    g.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class","point")
        .attr("cx", function(d) {
            return projection([d.lon, d.lat])[0];
        })
        .attr("cy", function(d) {
            return projection([d.lon, d.lat])[1];
        })
        .attr("stroke","white")
        .attr("stroke-width",1)

        .attr("r", function(d){
            if( (50* d.mass/ maxMass)<1){return 2;
        } else if ((50* d.mass/ maxMass)<2){return 10;
        } else if ((50* d.mass/ maxMass)<3){return 20;
        } else if ((50* d.mass/ maxMass)<4){return 30;
        } else {return 40;
        }})
        .style("fill", "red")
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<div><div>Fall: "+ d.fall+"</div>" +
                "<div>Mass: "+ d.mass+"</div>" +
                "<div>Name: "+ d.name+"</div>" +
                "<div>Nametype: "+ d.nametype+"</div>" +
                "<div>Recclass: "+ d.recclass+"</div>" +
                "<div>Date: "+ d.year+"</div></div>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + 40 + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

});



var zoom = d3.behavior.zoom()
    .on("zoom",function() {
        g.attr("transform","translate("+
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
        g.selectAll("path")
            .attr("d", path.projection(projection));
    });

svg.call(zoom);