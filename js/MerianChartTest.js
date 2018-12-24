function sendRequest(){
    var url = "MerianChartTestData.js",
        scriptTag = document.createElement("script");
    scriptTag.src = url;
    document.body.appendChild(scriptTag);
}

var mydata2 = [];
function callback(response){
    mydata2 = response;
    for(i=0; i<mydata2.length; i++){
        mydata2[i].dates = new Date(mydata2[i].dates);
        mydata2[i].val = mydata2[i].val;
    };

    // -------------------------------------

    var w = $(".chart").width();
    var h = 250;
    var svgStart = d3.select("#content .chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    var minX = d3.min(mydata2, function(d){return d.dates});
    var maxX = d3.max(mydata2, function(d){return d.dates});
    var minY = d3.min(mydata2, function(d){return  parseInt(d.val) - 1});
    var maxY = d3.max(mydata2, function(d){return  parseInt(d.val) + 1});
    
    var scaleX = d3.time.scale()
        .range([0,(w - 40)])
        .domain([minX,maxX]);

    var scaleY = d3.scale.linear()
        .range([h,40])
        .domain([minY,maxY]);
    
    var line = d3.svg.line()
        .x(function(d) { return scaleX(d.dates); })
        .y(function(d) { return scaleY(d.val); });
    
    var axisX = d3.svg.axis()
        .scale(scaleX)
        .orient("bottom")
        .tickFormat(d3.time.format("%x"))
        .ticks(6);

    var axisY = d3.svg.axis()
        .scale(scaleY)
        .orient("left")
        .ticks(5);

    var axisXGrid = d3.svg.axis()
        .scale(scaleX)
        .orient("bottom")
        .ticks(0)
        .tickFormat("")
        .tickSize(-h+30,0);

    var axisYGrid = d3.svg.axis()
        .scale(scaleY)
        .orient("left")
        .ticks(5)
        .tickFormat("")
        .tickSize(-w+40,0);

    svgStart.append('g')
        .call(axisX)
        .attr({
            'fill':'none',
            'stroke':'#ddd',
            'transform':'translate(40,'+(h-30)+')' 
        })
        .selectAll('text')
        .attr({
            'fill':'#aaa',
            'stroke':'none',
            'transform':'translate(0,10)'
        })
        .style({
            'font-size':'12px'
        });
    svgStart.append('g')
        .call(axisY)
        .attr({
            'fill':'none',
            'stroke':'#ddd',
            'transform':'translate(40,-30)'
        })
        .selectAll('text')
        .attr({
            'fill':'#000',
            'stroke':'none',
            'transform':'translate(-10,0)'
        })
        .style({
            'font-size':'12px'
        });
    svgStart.append('g')
        .call(axisXGrid)
        .attr({
            'fill':'none',
            'stroke':'#ddd',
            'transform':'translate(40,'+(h-30)+')' 
        });
    svgStart.append('g')
        .call(axisYGrid)
        .attr({
            'fill':'none',
            'stroke':'#ddd',
            'stroke-dasharray':'5',
            'transform':'translate(40,-30)'
        });
    svgStart.append('path')
        .attr({
            'd':line(mydata2),
            'stroke':'#165A4A',
            'stroke-width': '2px',
            'fill':'none',
            'transform':'translate(40,-30)' 
        });
}
sendRequest();