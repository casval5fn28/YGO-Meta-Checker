d3.csv("banlist.csv").then(function(data) {
    const limitSelect = document.getElementById("selectlimit");
    const monthSelect = document.getElementById("selectmonth");
    const months = Array.from(new Set(data.map(d => d.Month)));
    months.forEach(function(month) {
      const option = document.createElement("option");
      option.value = month;
      option.textContent = month;
      monthSelect.appendChild(option);
    });

    // 當下拉選單變化時觸發事件
    limitSelect.addEventListener("change", filterCards);
    monthSelect.addEventListener("change", filterCards);

    // 篩選符合條件的Card Name
    function filterCards() {
      // 獲取當前所選的限制值和月份值
      const selectedLimit = limitSelect.value;
      const selectedMonth = monthSelect.value;

      // 過濾符合限制和月份的Card Name或顯示所有Card Name
      const filteredCards = data.filter(function(d) {
        return (selectedLimit === "All" || d["Banned Rare"] === selectedLimit) &&
              (selectedMonth === "All" || d.Month === selectedMonth);
      });

      // 清空原有的列表
      const cardList = document.querySelector("#filteredCards ul");
      cardList.innerHTML = "";

      // 將符合限制和月份的Card Name加入列表中
      filteredCards.forEach(function(card) {
        const listItem = document.createElement("li");
        listItem.textContent = card["Card Name"];
        cardList.appendChild(listItem);
      });
    }
  });