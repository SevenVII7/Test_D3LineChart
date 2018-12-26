## D3LineChartTest

案子要用的的圖表<br/>
整理起來做個筆記防忘記

https://sevenvii7.github.io/D3LineChartTest/

### index.html
毫無反應就是個HTML, 開新檔案很麻煩CSS也寫在裡面

### js/MerianChartTest.js
主要要跑的js<br/>
裡面大致分4部分

#### sendRequest(){...}
用來取得data的函式<br/>
先宣告路徑, 然後在HTML DOM上生出一個帶路徑的<script>標籤<br/>
這是一個jsonp的概念

#### callback(response){...}
使用data檔案定義好的callback把'所有資料'整理好塞進陣列

#### drawChart(){...}
主要的繪圖函式<br/>
最前面先將所有資料擷取出需要的部分, 做成一串新的陣列<br/>
再使用新的資料去綁定D3的功能, 然後繪圖

#### reqDarw(){...}
決定要顯示的資料長度
