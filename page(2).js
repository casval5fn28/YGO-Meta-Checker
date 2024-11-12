d3.csv("top_deck1.csv").then(data => {
  const startMonthSelect = d3.select("#startMonth");
  const endMonthSelect = d3.select("#endMonth");
  const typeSelect = d3.select("#typeFilter");
  //const lineChartDiv = d3.select("#lineChart");
  let highlighteddot = null; // 追蹤被高亮的 dot
  //let highlightedline = null; // 追蹤被高亮的 line

  const months = [...new Set(data.map(d => d.Month))];
  months.forEach(month => {
    startMonthSelect.append("option").text(month).attr("value", month);
    endMonthSelect.append("option").text(month).attr("value", month);
  });

  startMonthSelect.on("change", updateChart);
  endMonthSelect.on("change", updateChart);
  typeSelect.on("change", updateChart);

  updateChart();

  function updateChart() {
    const startMonth = startMonthSelect.node().value;
    const endMonth = endMonthSelect.node().value;
    const selectedType = typeSelect.node().value;

    let filteredData = data.filter(d => d.Month >= startMonth && d.Month <= endMonth);

    if (selectedType !== "All") {
      filteredData = filteredData.filter(d => d.Type === selectedType);
    }

    const decks = [...new Set(filteredData.map(d => d.Deck))];
    const decksData = decks.map(deck => {
      const deckEntries = filteredData.filter(d => d.Deck === deck);
      const deckAmounts = {};
      deckEntries.forEach(entry => {
        const month = entry.Month;
        if (deckAmounts[month]) {
          deckAmounts[month] += parseInt(entry.Amount);
        } else {
          deckAmounts[month] = parseInt(entry.Amount);
        }
      });
      return { deck, data: deckAmounts };
    });

    drawLineChart(decksData);
  }

  function drawLineChart(data) {
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const x = d3.scaleBand()
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const xAxis = d3.axisBottom().scale(x);
    const yAxis = d3.axisLeft().scale(y);

    const lineChartDiv = d3.select("#lineChart");
    lineChartDiv.html("");

    const svg = lineChartDiv.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const allMonths = [...new Set(data.flatMap(d => Object.keys(d.data)))];
    x.domain(allMonths);
    y.domain([0, d3.max(data, d => d3.max(Object.values(d.data)))]);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    const line = d3.line()
      .x(d => x(d[0]))
      .y(d => y(d[1]));

    data.forEach((deckData, i) => {
      const deckEntries = Object.entries(deckData.data);
      const lineClass = `line-${deckData.deck.replaceAll(" ", "-")}`;

      svg.append("path")
        .datum(deckEntries)
        .attr("class", `line ${lineClass}`)
        .attr("d", line)
        .style("stroke", () => color(i))
        .style("fill", "none");

      svg.selectAll(`.dot-${deckData.deck.replaceAll(" ", "-")}`)
        .data(deckEntries)
        .enter().append("circle")
        .attr("class", `dot dot-${deckData.deck.replaceAll(" ", "-")}`)
        .attr("cx", d => x(d[0]))
        .attr("cy", d => y(d[1]))
        .attr("r", 3)
        .style("fill", color(i));
    });

    const lineChartInfoDiv = d3.select("#lineChartInfo");
    const info = data.map((deckData, i) => {
      const deckEntries = Object.entries(deckData.data);
      const totalAmount = deckEntries.reduce((acc, [_, value]) => acc + value, 0);
      return `<h3>${deckData.deck}</h3><p>Total Amount: ${totalAmount}</p><button id="show-${deckData.deck.replaceAll(" ", "-")}">Show</button>`;
    }).join("");

    lineChartInfoDiv.html(info);

    // 添加按鈕點擊事件
    data.forEach(deckData => {
      const buttonId = `#show-${deckData.deck.replaceAll(" ", "-")}`;
      const lineClass = `.line-${deckData.deck.replaceAll(" ", "-")}`;
      const dotClass = `.dot-${deckData.deck.replaceAll(" ", "-")}`;

      d3.select(buttonId).on("click", () => highlightDeck(lineClass, dotClass));
    });
  }

  function highlightDeck(lineClass, dotClass) {
    if (highlighteddot === dotClass) {
      d3.selectAll(".line").attr("opacity", 1); // 將所有折線設為低透明度
      d3.selectAll(".dot").attr("opacity", 1); // 如果已經是高亮狀態，則恢復所有圓餅圖區域的顯示
      highlighteddot = null;
    } else {
      d3.selectAll(".line").attr("opacity", 0.3); // 將所有折線設為低透明度
      d3.selectAll(".dot").attr("opacity", 0); // 將所有點設為隱藏

      d3.selectAll(lineClass).attr("opacity", 1); // 高亮特定折線
      d3.selectAll(dotClass).attr("opacity", 1); // 顯示特定點
      highlighteddot = dotClass;
    }
  }
});
