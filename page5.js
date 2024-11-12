d3.csv("price_simple.csv").then(function(data) {
  // 将数据按 Deck 分组
  const groupedData = d3.group(data, d => d.Deck);
  const deckNames = Array.from(groupedData.keys());
  // 将所有 Deck 名称添加到下拉选单
  const select = d3.select("#deckSelect");
  select.selectAll("option")
    .data(["All", ...deckNames]) // 添加 All 选项
    .enter().append("option")
    .text(d => d);

  // 计算每个 Deck 中每笔 Price 的累加值
  groupedData.forEach(deckData => {
    let cumulativePrice = 0;
    deckData.forEach(item => {
      item.CumulativePrice = cumulativePrice;
      cumulativePrice += +item.Price;
    });
    deckData.totalPrice = cumulativePrice; // 添加 Price 總和屬性
  });

  // 设置图表的宽度和高度
  const width = 2000;
  const height = deckNames.length * 60; // 考虑额外空间放置 Deck 名称

  // 使用 D3.js 创建 SVG 元素
  const svg = d3.select("#stackedBarChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // 创建一个颜色比例尺，每个 Price 对应一种颜色
  const colorScale = d3.scaleSequential()
    .domain([0, d3.max(data, d => +d.Price)])
    .interpolator(d3.interpolateRainbow);

  // 更新图表的函数
  function updateChart(selectedDeck, sortOrder = "ascending") {
    // 根据选择的 Deck 过滤数据
    const filteredData = selectedDeck === "All" ? data : groupedData.get(selectedDeck).flat();

    // 依照排序方式重新排序資料
    filteredData.sort((a, b) => {
      const totalA = groupedData.get(a.Deck).reduce((acc, cur) => acc + parseFloat(cur.Price), 0);
      const totalB = groupedData.get(b.Deck).reduce((acc, cur) => acc + parseFloat(cur.Price), 0);
      return sortOrder === "ascending" ? totalA - totalB : totalB - totalA;
    });

    // 创建堆叠长条图和 Deck 名称
    svg.selectAll("g").remove(); // 移除之前的图表

    svg.selectAll("g")
      .data(d3.group(filteredData, d => d.Deck))
      .enter().append("g")
      .attr("transform", (d, i) => `translate(0, ${i * 60})`)
      .each(function(d) {
        const deckName = d[0]; // 获取 Deck 名称
        d3.select(this).append("text")
          .attr("x", 5)
          .attr("y", 20)
          .style("fill", "#edeff2")
          .text(d => `${deckName}  --Total Price: ${d3.sum(d[1], e => +e.Price)}`)// 在每个 Deck 的图表上方显示 Deck 名称

        d3.select(this).selectAll("rect")
          .data(d[1])
          .enter().append("rect")
          .attr("x", d => d.CumulativePrice * 1.5)
          .attr("y", 30)
          .attr("width", d => +d.Price * 1.5)
          .attr("height", 20)
          .attr("fill", d => colorScale(+d.Price))
          // 添加鼠标移入和移出事件
          .on("mouseover", function(e, d) {
            const tooltip = d3.select("#tooltip");
            tooltip.style("opacity", 1)
              .html(`<strong>Name:</strong> ${d.Name}<br><strong>Price:</strong> ${d.Price}`)
              .style("left", (e.pageX + 10) + "px")
              .style("top", (e.pageY - 20) + "px");
          })
          .on("mouseout", function() {
            d3.select("#tooltip")
              .style("opacity", 0);
          });
      });
  }

  // 初始化图表
  updateChart("All");

  // 监听下拉选单变更事件
  select.on("change", function() {
    const selectedDeck = this.value;
    updateChart(selectedDeck);
  });
  d3.select("#sortSelect").on("change", function() {
    const sortValue = this.value;
    const selectedDeck = d3.select("#deckSelect").property("value");
    updateChart(selectedDeck, sortValue);
  });
});
