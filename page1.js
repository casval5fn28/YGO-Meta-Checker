d3.csv("top_deck1.csv").then(data => {
  const months = [...new Set(data.map(d => d.Month))];
  const startMonthSelect = d3.select("#startMonth");
  const endMonthSelect = d3.select("#endMonth");
  const typeSelect = d3.select("#typeFilter");
  const infoDiv = d3.select("#info");
  let highlightedDeck = null; // 追蹤被高亮的 Deck
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

    if (selectedType !== "all") {
      if (selectedType !== "All") {
        filteredData = filteredData.filter(d => d.Type === selectedType);
      }
      else filteredData = data.filter(d => d.Month >= startMonth && d.Month <= endMonth);
    }

    const deckAmounts = {};
    const deckTactic = {}; // 用來存儲 Deck 的 Tactic

    filteredData.forEach(d => {
      const deck = d.Deck;
      const amount = parseFloat(d.Amount);
      const tactic = d.Tactic;
      if (deckAmounts[deck]) {
        deckAmounts[deck] += amount;
      } else {
        deckAmounts[deck] = amount;
        deckTactic[deck] = tactic; // 存儲 Deck 的 Tactic
      }
    });

    const amounts = Object.values(deckAmounts);
    createPieChart(amounts, Object.keys(deckAmounts));

    // 顯示 Deck 資訊
    showDeckInfo(deckAmounts, deckTactic);
  }

  function createPieChart(data, decks) {
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const pie = d3.pie()(data);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const svg = d3.select("#chart")
      .html("")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const arcs = svg.selectAll("arc")
      .data(pie)
      .enter()
      .append("g");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => color(i))
      .attr("class", (d, i) => `arc arc-${decks[i].replaceAll(" ", "-")}`);

    arcs.append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      //.text(d => d.data);
    
    // 為每個 Deck 添加按鈕點擊事件
    decks.forEach(deck => {
      d3.select(`.arc-${deck.replaceAll(" ", "-")}`).on("click", () => highlightDeck(deck));
    });
  }

  function showDeckInfo(deckAmounts, deckTactic) {
    const sortedDeckAmounts = Object.entries(deckAmounts)
      .sort((a, b) => b[1] - a[1]); // 按照 Amount 大小排序

    const info = sortedDeckAmounts.map(([deck, amount]) => {
      const tactic = deckTactic[deck];
      return `<h3>${deck}&nbsp;<button id="show-${deck.replaceAll(" ", "-")}">Show</button></h3><p>Tactic: ${tactic}</p><p>Total Amount: ${amount}</p>`;
    }).join("");

    infoDiv.html(info);

    // 為每個按鈕添加點擊事件
    Object.keys(deckAmounts).forEach(deck => {
      d3.select(`#show-${deck.replaceAll(" ", "-")}`).on("click", () => highlightDeck(deck));
    });
  }

  function highlightDeck(deck) {
    if (highlightedDeck === deck) {
      d3.selectAll(".arc").attr("opacity", 1); // 如果已經是高亮狀態，則恢復所有圓餅圖區域的顯示
      highlightedDeck = null;
    } else {
      d3.selectAll(".arc").attr("opacity", 0.3); // 先將所有圓餅圖區域設為低透明度
      d3.select(`.arc-${deck.replaceAll(" ", "-")}`).attr("opacity", 1); // 高亮特定 Deck 的圓餅圖區域
      highlightedDeck = deck;
    }
  }
});