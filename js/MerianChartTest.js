var orignData = [],
    orignDataLen,
    getData = [],
    getLen = 7;

var btnW = $('#btnW'),
    btnM = $('#btnM'),
    btnTM = $('#btnTM'),
    btnSM = $('#btnSM')
    chartOuter = $('#content .chart');

function sendRequest(){
    var url = "js/MerianChartTestData.js",
        scriptTag = document.createElement("script");
    scriptTag.src = url;
    document.body.appendChild(scriptTag);
}

function callback(response){
    orignData = response;
    orignDataLen = orignData.length;
    for(i=0; i < orignDataLen; i++){
        orignData[i].dates = new Date(orignData[i].dates); // 字串轉時間格式
        orignData[i].val = parseFloat(orignData[i].val); // 字串轉一下數值
    };
    drawChart();
}

function drawChart(){
    getData = [];
    for(k=0; k < getLen; k++){
        if(k >= orignDataLen){break}
        getData.push(orignData[k]);
    };
    
// --- 宣告長寬變數 ---
    var w = $(".chart").width(),
        h = 250; // 定義繪製 SVG的長寬

// --- 定義繪製 SVG函式 ---
    var svgStart = d3.select("#content .chart") // d3.select()裡的選取方式跟JQ一樣
        .append("svg") // append()生出某個元素, 這邊我們append <svg>
        .attr({
            "width": w,
            "height": h
        }); //定義 append出的元素的屬性 d3可以用物件的寫法{"something": "some value",...}或直接 .attr("something","some value")

// --- 綁資料 定義 D3比例尺 ---
    var minX = d3.min(getData, function(d){return d.dates}),
        maxX = d3.max(getData, function(d){return d.dates}),
        minY = d3.min(getData, function(d){return d.val}),
        maxY = d3.max(getData, function(d){return d.val}), // min() max() 抓出資料的最大最小值
        minY = minY - minY*0.05,
        maxY = maxY + maxY*0.05; // 下面要定義資料範圍, 這邊把範圍最小值設定比資料最小值小一些, 最大值同理設大一些, 讓圖表畫面上看起來不那麼分散
    
    // 資料範圍
    var scaleX = d3.time.scale() // 先看下面, time.scale()跟下面那段的意思一樣, 大概是時間格式版本
        .domain([minX, maxX])
        .range([0,(w - 90)]);
    var scaleX2 = d3.time.scale() // 無視這個 <--- 調整畫面用的, 因為scaleX被我縮了一些, 要加另外一條線壓在底下補滿用的變數
        .domain([minX, maxX])
        .range([0,(w - 50)]);
    var scaleY = d3.scale.linear()
        .domain([minY, maxY]) // linear.domain([numbers]) 原始資料範圍
        .range([h,40]); // linear.range([values]) 將原始資料範圍 塞回某個範圍 <-- 高度h到高度40(上至下), 這邊用40是因為下面我把所有東西都向上平移了40, 不縮回來圖表會被切掉
 
// --- 套用定義出的比例尺 定義繪製 SVG線段 + 區域的布局(?) ---
    var line = d3.svg.line()
        .x(function(d) { return scaleX(d.dates); })
        .y(function(d) { return scaleY(d.val); }); // 套用 scale定義出的範圍, 資料即可根據 scale的定義做縮放
    var area = d3.svg.area()
        .x(function(d) { return scaleX(d.dates); })
        .y0(h)
        .y1(function(d) { return scaleY(d.val); });
 
// --- 定義D3座標軸 ---
    var winW = window.screen.width,
        xTickNum = 5,
        yTickNum = 5; // 定義圖表座標軸分段用的變數
    if(winW <= 600){xTickNum = 1;} // RWD改變坐標軸分段數

    var axisX = d3.svg.axis()
        .scale(scaleX) // axis.scale([scale]) 按照 scale的比例縮放 <-- 這邊也是塞之前定義好的 scale變數
        .orient("bottom")
        .tickFormat(d3.time.format("%Y.%m.%d")) // 改變底部座標軸顯示格式(Time Format) https://www.oxxostudio.tw/articles/201412/svg-d3-11-time.html
        .ticks(xTickNum); // axis.ticks 圖表座標軸分段, 運作原理: https://www.tangshuang.net/3270.html
    var axisX2 = d3.svg.axis() // 無視這個 <--- scaleX2塞這
        .scale(scaleX2)
        .orient("bottom")
        .tickFormat("")
        .ticks(0);
    var axisY = d3.svg.axis()
        .scale(scaleY)
        .orient("left")
        .tickFormat(function(d){return Math.round(d*10)/10;})
        .ticks(yTickNum);

// --- 定義D3座標格線 ---
    var axisXGrid = d3.svg.axis() 
        .scale(scaleX)
        .orient("bottom")
        .ticks(0)
        .tickFormat("")
        .tickSize(-h+30,0);
    var axisYGrid = d3.svg.axis() // 座標格線也是用 axis()
        .scale(scaleY)
        .orient("left")
        .ticks(yTickNum)
        .tickFormat("") // 承上, 所以我們把tickFormat()設空, 不然會有兩個座標軸文字
        .tickSize(-w+50,0); // tickSize() 是座標軸上刻度線條的尺寸，包含了內部線段和和最外邊的線段，共兩個數值 (我直接抄這邊的 https://www.oxxostudio.tw/articles/201411/svg-d3-04-axis.html)

// --- 定義 SVG漸層 ---
    // SVG漸層要先定義<defs> <linearGradient> <stop>, 之後再呼叫<linearGradient>的 id : https://www.oxxostudio.tw/articles/201409/svg-25-gradients-patterns.html
    var defs = svgStart.append("defs"); // 生一個 defs
    var linearGradient = defs.append("linearGradient") // 生一個 linearGradient
        .attr({
            "id":"linearColor", // 這是id 之後呼叫
            "x1":"0%",
            "x2":"0%",
            "y1":"0%",
            "y2":"100%" // 垂直方向
        });
    linearGradient.append("stop")
        .attr("offset","0%")
        .style("stop-color","rgba(22,90,74,.2)"); /*-*-* 始源之色 *-*-*/
    linearGradient.append("stop")
        .attr("offset","100%")
        .style("stop-color","rgba(205,226,113,.2)"); /*-*-* 終結之色 *-*-*/

// --- 定義 hover方塊 ---
    var tooltip = d3.select("body")
        .append("div")
        .attr("class","tooltip")
        .style({"opacity": 0,"z-index": -1}); // 先生出一個隱形的 div等待 hover, 其他樣式我寫在HTML

// ========== 使用函式 ==========
// --- 繪製座標 ---
    svgStart.append('g')
        .call(axisX)
        .attr({
            'fill':'none',
            'stroke':'#ddd',
            'transform':'translate(50,'+(h-30)+')' 
        })
        .selectAll('text')
        .attr({
            'fill':'#aaa',
            'stroke':'none',
            'transform':'translate(0,10)'
        })
        .style({
            'font-size':'12px',
            'letter-spacing': '1px'
        });
    svgStart.append('g')
        .call(axisX2)
        .attr({
            'fill':'none',
            'stroke':'#ddd',
            'transform':'translate(50,'+(h-30)+')' 
        })
    svgStart.append('g')
        .call(axisY)
        .attr({
            'fill':'none',
            'stroke':'#ddd',
            'transform':'translate(50,-30)'
        })
        .selectAll('text')
        .attr({
            'fill':'#000',
            'stroke':'none',
            'transform':'translate(-5,0)'
        })
        .style({
            'font-size':'12px',
            'letter-spacing': '1px'
        });

// --- 繪製格線 ---
    svgStart.append('g')
        .call(axisXGrid)
        .attr({
            'fill':'none',
            'stroke':'#ddd',
            'transform':'translate(50,'+(h-30)+')' 
        });
    svgStart.append('g')
        .call(axisYGrid)
        .attr({
            'fill':'none',
            'stroke':'#ddd',
            'stroke-dasharray':'5',
            'transform':'translate(50,-30)'
        });

// --- 繪製線段 + 漸層區塊 ---
    svgStart.append('path')
        .attr({
            'd':line(getData),
            'stroke':'#165A4A',
            'stroke-width': '2px',
            'fill':'none',
            'transform':'translate(50,-30)' 
        });
    svgStart.append('path')
        .attr({
            'd':area(getData),
            'fill':'url(#' + linearGradient.attr('id') + ')',
            'transform':'translate(50,-30)' 
        });

// --- 繪製線段上的點 + hover標籤 ---
    var _x = d3.time.format("%Y.%m.%d");
    var circle = svgStart.append('g')
        .selectAll('circle')
        .data(getData)
        .enter()
        .append('circle')
        .attr({
            'fill': '#165A4A',
            'opacity': .2,
            'transform':'translate(50,-30)',
            'r': 6
        })
        .attr("cx", function(d) {return scaleX(d.dates);})
        .attr("cy", function(d) {return scaleY(d.val);})

    circle.on("mouseover",function(d){
        tooltip.html( _x(d.dates) + "<br />" + "淨值 : " + d.val)
            .style({
                "left": (d3.event.pageX) + "px",
                "top": (d3.event.pageY + 20) + "px",
                "opacity": 1,
                "z-index": 1
            }); // hover標籤相關的
        $(this).attr({'opacity': 1}); // 圓點的透明度改為1
    });
    circle.on("mousemove",function(){
        tooltip.style({
            "left": (d3.event.pageX) + "px",
            "top": (d3.event.pageY + 20) + "px"
        });
    });
    circle.on("mouseout",function(){
        tooltip.style({
            "left": 0 + "px",
            "top": 0 + "px",
            "opacity": 0,
            "z-index": -1
        });
        $(this).attr({'opacity': .2});
    });
}

function reqDarw(e){
    getLen = e;
    chartOuter.empty();
    drawChart();
}

sendRequest();

btnW.on('click', function(){ reqDarw(7); });
btnM.on('click', function(){ reqDarw(30); });
btnTM.on('click', function(){ reqDarw(90); });
btnSM.on('click', function(){ reqDarw(180); });
