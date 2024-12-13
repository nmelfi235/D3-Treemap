import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const DATA_LINK =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

const WIDTH = 800;
const HEIGHT = 600;
const MARGIN = { TOP: 30, BOTTOM: 30, LEFT: 30, RIGHT: 30 };
const COLORS = d3.schemeCategory10;

const tooltip = d3
  .select("#app")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute");
const svg = d3
  .select("#app")
  .append("svg")
  .attr("height", HEIGHT)
  .attr("width", WIDTH)
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

// Fetch data
d3.json(DATA_LINK).then((DATA) => {
  console.log(DATA);

  // Create root node
  const root = d3
    .hierarchy(DATA)
    // Format node data
    .eachBefore(
      (d) =>
        (d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name)
    )
    // Bind value sum function
    .sum((d) => d.value)
    // Bind value sort function
    .sort((a, b) => b.height - a.height || b.value - a.value);

  // Treemap the root node
  d3.treemap().size([WIDTH, HEIGHT]).paddingInner(1)(root);

  console.log(root);

  // Create color scale
  // Do not need to declare a domain, it will automatically pick colors for new categories
  const colorScale = d3.scaleOrdinal().range(COLORS);

  // Use treemap to create tree tiles
  const cell = svg
    .selectAll("g")
    .data(root.leaves())
    .join("g")
    // Move tiles to correct position based on coordinates
    .attr("transform", (datum) => `translate(${datum.x0}, ${datum.y0})`);

  // Add tiles to group
  cell
    .append("rect")
    .classed("tile", true)
    .attr("data-name", (datum) => datum.data.name)
    .attr("data-category", (datum) => datum.data.category)
    .attr("data-value", (datum) => datum.data.value)
    // Size tiles based on coordinates
    .attr("width", (datum) => datum.x1 - datum.x0)
    .attr("height", (datum) => datum.y1 - datum.y0)
    // Color tiles based on category
    .attr("fill", (datum) => colorScale(datum.data.category))
    .on("mousemove", (event) => {
      tooltip
        .attr("data-value", d3.select(event.target).attr("data-value"))
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + 10 + "px")
        .style("opacity", 1)
        .html(
          d3.select(event.target).attr("data-name") +
            "<br>" +
            d3.select(event.target).attr("data-value") +
            " million sold"
        );
    })
    .on("mouseout", (event) => {
      tooltip.style("opacity", 0);
    });

  // Add text labels to each tile
  cell
    .append("text")
    .classed("tile-label", true)
    .selectAll("tspan")
    .data((datum) => datum.data.name.split(/(?=[A-Z][a-z])/g))
    .join("tspan")
    .attr("x", 4)
    // padding-top is 13px, i is text line and 10px is font size.
    .attr("y", (d, i) => 13 + i * (HEIGHT / 70))
    .text((datum) => datum);

  // Create legend based on category title and color
  const legend = d3.select("#app").append("svg").attr("id", "legend");

  // Following vars taken from example app
  const LEGEND_OFFSET = 10;
  const LEGEND_RECT_SIZE = 15;
  const LEGEND_H_SPACING = 150;
  const LEGEND_V_SPACING = 10;
  const LEGEND_TEXT_X_OFFSET = 3;
  const LEGEND_TEXT_Y_OFFSET = -2;
  var legendElemsPerRow = Math.floor(600 / LEGEND_H_SPACING);

  const categories = root
    .leaves()
    .map((datum) => datum.data.category)
    .filter((datum, index, self) => self.indexOf(datum) === index);

  const legendTiles = legend
    .selectAll("g")
    .data(categories)
    .join("g")
    .attr(
      "transform",
      (d, i) =>
        `translate(${LEGEND_H_SPACING * (i % legendElemsPerRow)}, ${
          Math.floor(i / legendElemsPerRow) * LEGEND_RECT_SIZE +
          LEGEND_V_SPACING * Math.floor(i / legendElemsPerRow)
        })`
    );
  legendTiles
    .append("rect")
    .classed("legend-item", true)
    .attr("width", LEGEND_RECT_SIZE)
    .attr("height", LEGEND_RECT_SIZE)
    .attr("fill", (datum) => colorScale(datum));
  legendTiles
    .append("text")
    .attr("x", LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
    .attr("y", LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
    .text((datum) => datum);
});
