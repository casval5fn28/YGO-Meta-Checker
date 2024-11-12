d3.csv("top_deck.csv").then(function(data) {
    var select = d3.select("#decks");
    select
      .selectAll("option")
      .data(data)
      .enter()
      .append("option")
      .text(function(d) { return d.Deck; })
      .attr("value", function(d) { return d.Deck; });
  
    select.on("change", function() {
      var selectedDeck = d3.select(this).property("value");
      filterCards(selectedDeck);
    });
  });
  
  function filterCards(selectedDeck) {
    d3.csv("card.csv").then(function(cardData) {
      var filteredCards = cardData.filter(function(card) {
        return card.archetype === selectedDeck;
      });
  
      displayCards(filteredCards);
    });
  }
  
  function displayCards(cards) {
    var cardList = d3.select("#cardList");
  
    cardList.selectAll("p").remove(); // 清空之前的内容
  
    cardList
      .selectAll("p")
      .data(cards)
      .enter()
      .append("p")
      .text(function(d) { return d.name; });
  }
  