let keyframeIndex = 0;

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
        svgUpdate: () => highlightAllBarsByColour()
    },
    {
        activeVerse: 4,
        activeLines: [1],
        svgUpdate: makeRedBarHoverable
    },
    {
        activeVerse: 4,
        activeLines: [2],
        svgUpdate: drawRoseColours
    },
    {
        activeVerse: 4,
        activeLines: [3],
        svgUpdate: () => displaySortedRoseData()

    },
    {
        activeVerse: 4,
        activeLines: [4],
        svgUpdate: () => {initialiseSVG(); drawRoseColours();}
    },
    {
        activeVerse: 5,
        activeLines: [1],
        svgUpdate: drawPie
    },
    {
        activeVerse: 5,
        activeLines: [2],
        svgUpdate: drawRoseColours
    },
    {
        activeVerse: 5,
        activeLines: [3],
        svgUpdate: () => highlightColour("", "")
    },
    {
        activeVerse: 5,
        activeLines: [4],
        svgUpdate: () => highlightColour("", "")
    }
    
]
// TODO add svgUpdate fields to keyframes

// TODO write a function that highlights every bar in the colour it represents
function highlightAllBarsByColour() {
    svg.selectAll(".bar")
        .transition()
        .duration(500)
        .attr("fill", d => d.colour);
}


// TODO update keyframes for verse 4 to show each line one by one


// TODO write a function which will display the rose data sorted from highest to lowest
// HINT Be careful when sorting the data that you don't change the rosechartData variable itself, otherwise when you a user clicks back to the start it will always be sorted
// HINT If you have correctly implemented your updateBarchart function then you won't need to do anything extra to make sure it animates smoothly (just pass a sorted version of the data to updateBarchart) 
function displaySortedRoseData() {
    // Create a deep copy of the roseChartData so as not to modify the original
    let sortedData = JSON.parse(JSON.stringify(roseChartData));
    
    // Sort the data from highest to lowest based on count
    sortedData.sort((a, b) => b.count - a.count);
    
    // Update the bar chart with the sorted data
    updateBarChart(sortedData);
}



// TODO define global variables
let svg = d3.select("#svg");

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
    // TODO update it's fill colour
    svg.selectAll(".bar")
        .transition()
        .duration(500)
        .attr("fill", d => (d.colour === colourName ? highlightColour : "#999" ))

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
        .transition()
        .duration(1000)
        .attr("height", 0)
        .attr("y", chartHeight)
        .remove();

    // Now we want to move any bars that had values in the old dataset but now have new values or locations
    bars.transition()
        .duration(1000)
        .attr("x", d => xScale(d.colour))
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
    chart.transition()
        .duration(1000)
        .select(".x-axis")
        .call(d3.axisBottom(xScale));

    chart.transition()
        .duration(1000)
        .select(".y-axis")
        .call(d3.axisLeft(yScale));

    // And finally if a new title has been specified we will update the title too
    if (title.length > 0) {
        svg.select("#chart-title")
            .text(title);
    }
}


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
    d3.selectAll(".line").classed("active-line", false);
}

// TODO write a function to update the active verse
function updateActiveVerse(id) {

    // Reset the current active verse - in some scenarios you may want to have more than one active verse, but I will leave that as an exercise for you to figure out
    d3.selectAll(".verse").classed("active-verse", false);

    // Update the class list of the desired verse so that it now includes the class "active-verse"
    d3.select("#verse" + id).classed("active-verse", true);

    scrollLeftColumnToActiveVerse(id);
}

// TODO write a function to update the active line
function updateActiveLine(vid, lid) {
    // Select the correct verse
    let thisVerse = d3.select("#verse" + vid);
    // Update the class list of the relevant lines
    thisVerse.select("#line" + lid).classed("active-line", true);
}

// TODO write a function to scroll the left column to the right place
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
// TODO write a function to scroll the left column to the right place
// TODO select the div displaying the left column content
// TODO select the verse we want to display
// TODO calculate the bounding rectangles of both of these elements
// TODO calculate the desired scroll position
// TODO scroll to the desired position
// TODO call this function when updating the active verse


// TODO write a function to initialise the svg properly
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

// TODO write a function to make every instance of "red" and "purple" in the poem hoverable. When you hover the corresponding bar in the chart (if it exists) should be highlighted in its colour
function makeWordsHoverable() {
    d3.selectAll(".red-span")
        .on("mouseover", () => highlightColour("Red", "red"))
        .on("mouseout", () => highlightColour("Red", "#999"));
    
    d3.selectAll(".purple-span")
        .on("mouseover", () => highlightColour("Purple", "purple"))
        .on("mouseout", () => highlightColour("Purple", "#999"));
}

// HINT when you 'mouseout' of the word the bar should return to it's original colour
// HINT you will wamt to edit the html and css files to achieve this
// HINT this behaviour should be global at all times so make sure you call it when you intialise everything
// make red span click able
function makeRedSpanClickbale(){
    d3.select(".red-span").on("click", () => highlightColour("Red", "red"))
}

// make red bar hover able
function makeRedBarHoverable(){
    const redBar = chart.select(".bar").filter(d => d.colour === "Red");
    let isRed = true;
    redBar.on("click", () => {
        d3.selectAll(".red-span").classed("red-text", isRed);
        isRed = !isRed;
    })
    
}


// TODO write a function so that when you click on the red bar when verse 4 is displayed (and only when verse 4 is displayed) every instance of the word red in the poem are highlighted in red
// HINT you will need to update the keyframes to do this and ensure it isn't global behaviour
// HINT you will again have to edit the html and css


// TODO update the html to add a fifth verse
// TODO add keyframe(s) for your new fifth verse
// TODO the first keyframe should update the svg and display a pie chart of either the roses or violets dataset
function drawPieChart(data, title = "") {
    // Clear the SVG
    svg.selectAll("*").remove();
    
    // Pie and arc generators
    let pie = d3.pie().value(d => d.count);
    let outerRadius = Math.min(width, height) / 2 - 60; // Adjust this value as needed
    let arc = d3.arc().innerRadius(0).outerRadius(outerRadius);
    
    // percentage calculation
    let totalCount = d3.sum(data, d => d.count);

    // Color scale
    let color = d3.scaleOrdinal()
        .domain(data.map(d => d.colour))
        .range(d3.schemeCategory10);
    
    // Create pie chart arcs
    let arcs = pie(data);

    // Append arcs to the SVG
    svg.selectAll("path")
        .data(arcs)
        .enter().append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.colour))
        .attr("transform", `translate(${width / 2}, ${height / 2})`);
    
    // Append percentage text for each slice
    svg.selectAll("text.percentage")
        .data(arcs)
        .enter().append("text")
        .attr("class", "percentage")
        .attr("transform", d => {
            // centroid
            let [x, y] = arc.centroid(d);
            
            // Adjust the y position slightly to center 
            y = y + 3;  
            return `translate(${x + width / 2}, ${y + height / 2})`; 
        })
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .style("fill", "white")
        .text(d => `${((d.data.count / totalCount) * 100).toFixed(1)}%`);

    // Add title
    svg.append("text")
        .attr("id", "chart-title")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("fill", "white")
        .text(title);
}

function drawPie() {
    drawPieChart(roseChartData, "Pie Chart of Rose Colours");
}


async function initialise() {

    // TODO load the data
    await loadData();
    
    // TODO initalise the SVG
    initialiseSVG();

    // TODO draw the first keyframe
    drawKeyframe(keyframeIndex);

    // TODO make the word red clickable
    makeRedSpanClickbale();

    // make the words hoverable
    makeWordsHoverable();

}


initialise();

