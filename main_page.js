const svg = d3.select("svg").attr("width", "1500px").attr("height", "49950px");
const w = parseInt(getComputedStyle(document.querySelector(':root'))
    .getPropertyValue('--width'));
const h = parseInt(getComputedStyle(document.querySelector(':root'))
    .getPropertyValue('--height'));
const margin = { top: 80, right: 80, bottom: 300, left: 80};
let sort1 =  0;
let sort2 = 1;

const criterion = [
    "scores_overall",
    "scores_teaching",
    "scores_research",
    "scores_citations",
    "scores_industry_income",
    "scores_international_outlook"
];

const bar_colors = {
    "scores_overall": "#3c14f6",
    "scores_teaching": "#621896",
    "scores_research": "#0f1475",
    "scores_citations": "#149099",
    "scores_industry_income": "	#0c5c17",
    "scores_international_outlook": "#bdb415"
};

const select_menu = {
    //ascending
    1: function(a, b) { 
        return parseFloat(a["scores_teaching"]) - parseFloat(b["scores_teaching"]) +
               parseFloat(a["scores_research"]) - parseFloat(b["scores_research"]) +
               parseFloat(a["scores_citations"]) - parseFloat(b["scores_citations"]) +
               parseFloat(a["scores_industry_income"]) - parseFloat(b["scores_industry_income"]) +
               parseFloat(a["scores_international_outlook"]) - parseFloat(b["scores_international_outlook"]);},
    3: function(a, b) { return parseFloat(a["scores_teaching"]) - parseFloat(b["scores_teaching"]);},
    5: function(a, b) { return parseFloat(a["scores_research"]) - parseFloat(b["scores_research"]);},
    7: function(a, b) { return parseFloat(a["scores_citations"]) - parseFloat(b["scores_citations"]);},
    9: function(a, b) { return parseFloat(a["scores_industry_income"]) - parseFloat(b["scores_industry_income"]);},
    11: function(a, b) { return parseFloat(a["scores_international_outlook"]) - parseFloat(b["scores_international_outlook"]);},
    //descending
    2: function(b, a) { 
        return parseFloat(a["scores_teaching"]) - parseFloat(b["scores_teaching"]) +
               parseFloat(a["scores_research"]) - parseFloat(b["scores_research"]) +
               parseFloat(a["scores_citations"]) - parseFloat(b["scores_citations"]) +
               parseFloat(a["scores_industry_income"]) - parseFloat(b["scores_industry_income"]) +
               parseFloat(a["scores_international_outlook"]) - parseFloat(b["scores_international_outlook"]);},
    6: function(b, a) { return parseFloat(a["scores_teaching"]) - parseFloat(b["scores_teaching"]);},
    10: function(b, a) { return parseFloat(a["scores_research"]) - parseFloat(b["scores_research"]);},
    14: function(b, a) { return parseFloat(a["scores_citations"]) - parseFloat(b["scores_citations"]);},
    18: function(b, a) { return parseFloat(a["scores_industry_income"]) - parseFloat(b["scores_industry_income"]);},
    22: function(b, a) { return parseFloat(a["scores_international_outlook"]) - parseFloat(b["scores_international_outlook"]);},
}

display();

// clear the useless names and bars when changes sorting method
function clear_bar() {
    svg.selectAll(".axis").remove();
    svg.selectAll(".rect").remove();
}

function criterion_sort() {
    sort1 = d3.select("#select_menu").property("value");
}

function ascending_sort() {
    sort2 = d3.select("#input_a").property("value");
}

function descending_sort() {
    sort2 = d3.select("#input_d").property("value");
}

function emphasize(num, parentNode) {;      
    if (isFocused[num]) {
        isFocused[num] = false;
        d3.selectAll(".rect").style("opacity", 0.2);
        d3.selectAll(`.${criterion}`).style("opacity", 1);
    }
    else {
        isFocused[num] = true;
        d3.selectAll(".rect").style("opacity", 1)
    }
}

const bar_value = d3.select("body").append("div").attr("id", "barvalue").attr("class", "tooltip");

const go_on = function (d) {
    bar_value.style("opacity", 0)
    d3.select(this)
        .style("opacity", 0.5).style("stroke", "#cf190c").style("stroke-width", 2);}
            
const move = function (e, d) {
    bar_value.html((d[1] - d[0]).toFixed(1))
        .style("top", e.pageY - 10 + "px")
        .style("left", e.pageX + 10 + "px");}
            
const leave = function (d) {
    bar_value.style("opacity", 0)
    d3.select(this)
        .style("opacity", 1).style("stroke", "#cf190c").style("stroke-width", 0);}    

function display() {
    d3.csv("http://vis.lab.djosix.com:2023/data/TIMES_WorldUniversityRankings_2024.csv").then(function (data) {
        clear_bar()
        if (sort1) {
            let sort = 0;
            sort = sort1 * sort2
            data.sort(select_menu[sort]);
        }
        const do_stack = d3.stack().keys(criterion.slice(1));
        const Datas = do_stack(data);
        const names = data.map(function (d) { return d["name"] });
        const x_axis = d3.scaleLinear()
            .range([margin.top + margin.bottom, w - margin.right]).domain([0, 500]);
        const y_axis = d3.scaleBand()
            .range([margin.left, h - margin.top]).domain(names).padding(0.2);
        svg.append("g").attr("class", "axis")
            .attr("transform", `translate(0, ${margin.right})`)
            .call(d3.axisTop(x_axis));
        svg.append("g").attr("class", "axis")
            .attr("transform", `translate(${margin.left + margin.bottom}, 0)`)
            .call(d3.axisLeft(y_axis));
        let isclick = 0;
        svg.append("g").selectAll("g").data(Datas)
            .join("g")
            .attr("fill", function (d) { return bar_colors[d.key]; })
            .attr("class", function (d) { return `rect ${d.key}`; })
            .selectAll("rect")
            .data(function (d) { return d; })
            .join("rect")
            .attr("height", 15)
            .attr("width", function (d) { return x_axis(d[1]) - x_axis(d[0]) })
            .attr("x", function (d) { return x_axis(d[0]); })
            .attr("y", function (d) { return y_axis(d.data["name"]); })
            .attr("fill", function (d) { return bar_colors[d.data["name"]]; })
            .on("mouseover", go_on)
            .on("mousemove", move)
            .on("mouseleave", leave)
            .on("click", function (d) { 
                var a = 0;
                a = document.querySelector('.tooltip');
                alert(a.innerText +" points") 
            })
    });
}