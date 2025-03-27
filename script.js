document.addEventListener("DOMContentLoaded", () => {
  const datasetSelect = document.getElementById("dataset-select");
  const container = d3.select("#container");
  const tooltip = d3.select("#tooltip");
  const legend = d3.select("#legend");
  const title = d3.select("#title");
  const description = d3.select("#description");

  const width = 1100;
  const height = 600;

  const colorArray = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
    "#aec7e8",
    "#ffbb78",
    "#98df8a",
    "#ff9896",
    "#c5b0d5",
    "#c49c94",
    "#f7b6d2",
    "#c7c7c7",
    "#dbdb8d",
    "#9edae5",
  ];

  let svg;

  function createTreeMap(datasetURL) {
    container.selectAll("*").remove();
    legend.selectAll("*").remove();
    svg = container.append("svg").attr("width", width).attr("height", height);

    d3.json(datasetURL).then((data) => {
      const root = d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value);

      d3
        .treemap()
        .size([width, height - 20])
        .paddingInner(1)(root);

      const categories = root.leaves().map((node) => node.data.category);
      const uniqueCategories = [...new Set(categories)];

      const categoryColorMap = {};
      uniqueCategories.forEach((category, index) => {
        categoryColorMap[category] = colorArray[index % colorArray.length];
      });

      const tiles = svg.selectAll("g").data(root.leaves()).enter().append("g");

      tiles
        .append("rect")
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .attr("class", "tile")
        .attr("fill", (d) => categoryColorMap[d.data.category])
        .attr("data-name", (d) => d.data.name)
        .attr("data-category", (d) => d.data.category)
        .attr("data-value", (d) => d.data.value)
        .on("mouseover", function (event, d) {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html("Nome: " + d.data.name + "<br>Categoria: " + d.data.category + "<br>Valore: " + d.data.value)
            .attr("data-value", d.data.value)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function (d) {
          tooltip.transition().duration(500).style("opacity", 0);
        });

      tiles
        .append("text")
        .attr("x", (d) => (d.x0 + d.x1) / 2)
        .attr("y", (d) => (d.y0 + d.y1) / 2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "0.7em")
        .attr("fill", "black")
        .text((d) => d.data.name)
        .each(wrap);

      // Legenda
      const legendItems = legend
        .selectAll(".legend-item-group")
        .data(uniqueCategories)
        .enter()
        .append("g")
        .attr("class", "legend-item-group")
        .attr("transform", (d, i) => `translate(0, ${i * 30})`);

      legendItems
        .append("rect")
        .attr("width", 30)
        .attr("height", 30)
        .attr("class", "legend-item")
        .style("background-color", (category) => categoryColorMap[category])
        .attr("fill", (category) => categoryColorMap[category]);

      legendItems
        .append("text")
        .attr("x", 25)
        .attr("y", 15)
        .attr("text-anchor", "start")
        .attr("class", "legend-label")
        .text((category) => category);
    });
  }

  function updateChartTitleDescription(datasetURL) {
    if (datasetURL.includes("video-game-sales-data")) {
      title.text("Video Game Sales Tree Map");
      description.text("Best-selling video games grouped by platform");
    } else if (datasetURL.includes("movie-data")) {
      title.text("Tree Map Movie Box Office");
      description.text("Film box office revenue grouped by genre");
    } else if (datasetURL.includes("kickstarter-funding-data")) {
      title.text("Tree Map Pledge Kickstarter");
      description.text("Kickstarter Pledges Grouped by Category");
    } else {
      title.text("Tree Map");
      description.text("Select a dataset from the drop-down menu");
    }
  }

  function wrap(d) {
    const self = d3.select(this),
      textLength = self.node().getComputedTextLength(),
      text = self.text();
    let x = self.attr("x"),
      y = self.attr("y"),
      width = d.x1 - d.x0,
      height = d.y1 - d.y0;
    let words = text.split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1,
      dy = 0,
      tspan = self
        .text(null)
        .append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", dy + "em");
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        lineNumber++;
        tspan = self
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", lineNumber * lineHeight + dy + "em")
          .text(word);
        if (lineNumber * lineHeight * parseFloat(getComputedStyle(tspan.node()).fontSize) > height) {
          self.text("...");
          return;
        }
      }
    }
  }

  let currentDatasetURL = datasetSelect.value;
  createTreeMap(currentDatasetURL);
  updateChartTitleDescription(currentDatasetURL);

  datasetSelect.addEventListener("change", (event) => {
    currentDatasetURL = event.target.value;
    createTreeMap(currentDatasetURL);
    updateChartTitleDescription(currentDatasetURL);
  });
});
