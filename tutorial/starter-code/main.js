

let keyframes = [
    {
        activeVerse: 1,
        activeLines: [1, 2, 3, 4],
        svgUpdate: drawRoseColours
        
    },
    {
        activeVerse: 2,
        activeLines: [1, 2, 3, 4],
        svgUpdate: drawVioletColours
    },
    {
        activeVerse: 3,
        activeLines: [1],
        svgUpdate: drawRoseColours
    },
    {
        activeVerse: 3,
        activeLines: [2],
        svgUpdate: () => highlightColour("Red", "red")
    },
    {
        activeVerse: 3,
        activeLines: [3],
        svgUpdate: () => highlightColour("White", "white")
    },
    {
        activeVerse: 3,
        activeLines: [4],
        svgUpdate: () => highlightColour("","")
    },
    {
        activeVerse: 4,
        activeLines: [1, 2, 3, 4],
        svgUpdate: makeRedBarHoverable
    }
]
// TODO add svgUpdate fields to keyframes

// TODO define global variables
let svg = d3.select("#svg");
let keyframeIndex = 0;

const height = 300;
const width = 300;

let roseChartData;
let violetChartData;

let chart;
let chartWidth;
let chartHeight;

let xAxis;
let yAxis;

// TODO add event listeners to the buttons
document.getElementById("forward-button").addEventListener("click", forwardClicked);
document.getElementById("backward-button").addEventListener("click", backwardClicked);

// TODO write an asynchronous loadData function
async function loadData(){
    await d3.json("../../assets/data/rose_colours.json").then(data =>{
        roseChartData = data;
    })

    await d3.json("../../assets/data/violet_colours.json").then(data =>{
        violetChartData = data;
    })
}
// TODO call that in our initalise function

// TODO draw a bar chart from the rose dataset
function drawRoseColours() {
    updateBarChart(roseChartData, "Distribution of Rose Colours")
}

// TODO draw a bar chart from the violet dataset
function drawVioletColours() {
    updateBarChart(violetChartData, "Distribution of Violet Colours")
}

function highlightColour(colourName, highlightColour) {
    // TODO select bar that has the right value
    svg.selectAll(".bar")

        //.attr("fill", function(d){
        //    if(d.colour === colourName){
        //        return highlightColour;
        //    }else{
        //        return "#999"
        //    }
        //})
        .transition()
        .duration(500)
        .attr("fill", d => (d.colour === colourName ? highlightColour : "#999" ))

    
    // TODO update it's fill colour

    //TODO add a transition to make it smooth
    return
}


// As with the draw bar chart function we will pass the data we want to draw and the title of the graph
// There might be situations where we want to update the chart without updating the title
// To handle this we pass a default value to the title of an empty string
function updateBarChart(data, title = "") {
    //Update our scales so that they match the new data
    //As our svg is staying the same dimensions each time we only need to update the domains
    xScale.domain(data.map(d => d.colour));
    yScale.domain([0, d3.max(data, d => d.count)]).nice();

    // We want to make a selection of the existing bars in the chart
    // This line of code will bind the new data we have loaded to our bars
    const bars = chart.selectAll(".bar")
        .data(data, d => d.colour);

    // First we want to remove any bars that we no longer want to display
    // bars.exit() is a d3 selection that will return any bars that are not in the new selection.
    // when we call this function to initially draw the bar chart this won't return anything because their were no bars to begin with
    // when we call this to draw the violet bar chart when the rose one was being displayed the exit selection will be the bars that had values in the rose dataset but don't exist in the violet one
    // calling remove on this selection will remove all these bars from the graph
    bars.exit()
        .remove();

    // Now we want to move any bars that had values in the old dataset but now have new values or locations
    bars.attr("x", d => xScale(d.colour))
        .attr("y", d => yScale(d.count))
        .attr("height", d => chartHeight - yScale(d.count));

    // Finally we will add any bars that are new
    // To do that we will use the d3 built in function .enter() which provides a selection of any new values
    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.colour))
        .attr("y", chartHeight)
        .attr("height", 0)
        .attr("width", xScale.bandwidth())
        .attr("fill", "#999")
        .transition()
        .duration(1000)
        .attr("y", d => yScale(d.count))
        .attr("height", d => chartHeight - yScale(d.count));

    // Next let's update the axes so they are displayed correctly
    chart.select(".x-axis")
        .call(d3.axisBottom(xScale));

    chart.select(".y-axis")
        .call(d3.axisLeft(yScale));

    // And finally if a new title has been specified we will update the title too
    if (title.length > 0) {
        svg.select("#chart-title")
            .text(title);
    }
}

// TODO Write a new function updateBarchart so that it updates the existing svg rather than rewriting it
// TODO Update the xScale domain to match new order
// TODO Update the yScale domain for new values

// TODO select all the existing bars
// TODO remove any bars no longer in the dataset
// TODO move any bars that already existed to their correct spot
// TODO Add any new bars

// TODO update the x and y axis

// TODO update the title

// TODO add some animation to this

function forwardClicked() {

    // Make sure we don't let the keyframeIndex go out of range
    if (keyframeIndex < keyframes.length - 1) {
      keyframeIndex++;
      drawKeyframe(keyframeIndex);
    }
  }
  
  function backwardClicked() {
    if (keyframeIndex > 0) {
      keyframeIndex--;
      drawKeyframe(keyframeIndex);
    }
  }


function drawKeyframe(kfi) {
    // TODO get keyframe at index position
    let kf = keyframes[kfi];

    // TODO reset any active lines
    resetActiveLines();
    // TODO update the active verse
    updateActiveVerse(kf.activeVerse);
    // TODO update any active lines
    for (line of kf.activeLines){
        updateActiveLine(kf.activeVerse, line);
    }
    // TODO update the svg
    if(kf.svgUpdate){
        kf.svgUpdate();
    }
}

// TODO write a function to reset any active lines
function resetActiveLines() {
    // Reset the active-line class for all of the lines
    d3.selectAll(".line").classed("active-line", false);
  }
  
  function updateActiveVerse(id) {
    // Reset the current active verse - in some scenarios you may want to have more than one active verse, but I will leave that as an exercise for you to figure out
    d3.selectAll(".verse").classed("active-verse", false);
  
    // Update the class list of the desired verse so that it now includes the class "active-verse"
    d3.select("#verse" + id).classed("active-verse", true);

    scrollLeftColumnToActiveVerse(id);
  
  }
  
  function updateActiveLine(vid, lid) {
    // Select the correct verse
    let thisVerse = d3.select("#verse" + vid);
    // Update the class list of the relevant lines
    thisVerse.select("#line" + lid).classed("active-line", true);
  }


  function scrollLeftColumnToActiveVerse(id) {
    // First we want to select the div that is displaying our text content
    var leftColumn = document.querySelector(".left-column-content");

    // Now we select the actual verse we would like to be centred, this will be the <ul> element containing the verse
    var activeVerse = document.getElementById("verse" + id);

    // The getBoundingClientRect() is a built in function that will return an object indicating the exact position
    // Of the relevant element relative to the current viewport.
    // To see a full breakdown of this read the documentation here: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
    var verseRect = activeVerse.getBoundingClientRect();
    var leftColumnRect = leftColumn.getBoundingClientRect();

    // Now we calculate the exact location we would like to scroll to in order to centre the relevant verse
    // Take a moment to rationalise that this calculation does what you expect it to
    var desiredScrollTop = verseRect.top + leftColumn.scrollTop - leftColumnRect.top - (leftColumnRect.height - verseRect.height) / 2;

    // Finally we scroll to the right location using another built in function.
    // The 'smooth' value means that this is animated rather than happening instantly
    leftColumn.scrollTo({
        top: desiredScrollTop,
        behavior: 'smooth'
    })
}

function updateActiveVerse(id) {
    // Reset the current active verse - in some scenarios you may want to have more than one active verse, but I will leave that as an exercise for you to figure out
    d3.selectAll(".verse").classed("active-verse", false);

    // Update the class list of the desired verse so that it now includes the class "active-verse"
    d3.select("#verse" + id).classed("active-verse", true);

    // Scroll the column so the chosen verse is centred
    scrollLeftColumnToActiveVerse(id);
}


 // TODO write a function to scroll the left column to the right place
// TODO write a function to scroll the left column to the right place



// TODO write a function to initialise the svg properly
function initialiseSVG() {
    svg.attr("width", width);
    svg.attr("height", height);

    svg.selectAll("*").remove();

    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    chartWidth = width - margin.left - margin.right;
    chartHeight = height - margin.top - margin.bottom;

    chart = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xScale = d3.scaleBand()
        .domain([])
        .range([0, chartWidth])
        .padding(0.1);

    yScale = d3.scaleLinear()
        .domain([])
        .nice()
        .range([chartHeight, 0]);

    // Add x-axis
    chart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text");

    // Add y-axis
    chart.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale))
        .selectAll("text");

    // Add title
    svg.append("text")
        .attr("id", "chart-title")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("fill", "white")
        .text("");

}

// make red span click able
function makeRedSpanClickbale(){
    d3.select(".red-span").on("click", () => highlightColour("Red", "red"))
}

// make red bar hover able
function makeRedBarHoverable(){
    const redBar = chart.select(".bar").filter(d => d.colour === "Red");

    redBar.on("mouseover", () => {
        d3.selectAll(".red-span").classed("red-text", true);
    })
}
async function initialise() {

    await loadData();
    
    initialiseSVG();
    // TODO draw the first keyframe
    drawKeyframe(keyframeIndex);

    makeRedSpanClickbale();
    // TODO load the data

    // TODO initalise the SVG

    // TODO make the word red clickable
}


initialise();
