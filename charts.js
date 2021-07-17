function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;

    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];

    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use .html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var sampleResults = data.samples;  // all data in the samples array

    // 4. Create a variable that filters the samples for the object with the desired sample number.
    // Samples array data for only the chosen ID
    var sampleTypes = sampleResults.filter(sampleObj => sampleObj.id ===sample);

    //  5. Create a variable that holds the first sample in the array.
    var typesResult = sampleTypes[0]; //there is only one object in the array
    console.log(typesResult);
    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otuIds = typesResult.otu_ids;

    var otuLabels = typesResult.otu_labels;

    var sampleValues = typesResult.sample_values;

    // 7. Create the yticks for the bar chart.
    // Looks like the sample array, for each object, has the data on the otu_ids, sample_values,
    // and otu_labels sorted by descending sample_values, so the top 10 would be the first 10. 
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
    // Hint from the challenge description: Chain the slice() method with the map() and reverse() 
    // functions to retrieve the top 10 otu_ids sorted in descending order??
    // yticks are "OTU " + otuIds

    var yticks = otuIds.slice(0,10).reverse().map(id => "OTU " + id);  

    // 8. Create the trace for the bar chart. 
    
    var xValues = sampleValues.slice(0,10).reverse();
    var yValues = otuIds.slice(0,10).reverse();
    var hoverLabels = otuLabels.slice(0,10).reverse();
 
    var barData = [{
      x : xValues,
      y : yticks,
      hoverinfo : 'text',
      hovertext : hoverLabels,
      mode : "markers",
      marker : {
        size : 12,
        color: "#0D80AA"
      },
      type : "bar",
      orientation : 'h'
    }]; 

    
    // 9. Create the layout for the bar chart. 
    var barLayout = {
      yaxis : {
        type: "category"
      },
      title: {
        text: "Top Ten Bacteria Cultures Found",
        font: {
          color: "#0D80AA",
          weight: "bold"
        }
      }
    };
    var config = {responsive: true}
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar",barData,barLayout, config);   

    // 1. Create the trace for the bubble chart.
    // hover text needs to combine otuId, sampleValue and otuLabel

    function createHoverText(a ,b, c) {
      var hoverTextArray = [];
        for (k = 0; k < a.length; k++) {
          ht = "(" + a[k] + ", " + b[k] + ")<br>" + c[k];
          hoverTextArray.push(ht);
        }
      return hoverTextArray;
    }
    var hoverText = createHoverText(otuIds, sampleValues, otuLabels);

    var bubbleSize = sampleValues.map(size => size * .75);
    
    var bubbleData = [{
      x : otuIds,
      y : sampleValues,
      mode : "markers",
      type : "scatter",
      // text : hoverText,
      hoverinfo : 'text',
      hovertext: hoverText,
      marker: {
        color: otuIds, //values to be used to choose the color
        colorscale: "Earth",
        cmin: 0,
        cmax: 3500,
        size: bubbleSize,
        //sizemode: 'area',
        showscale: false,
        colorbar: {
          thickness: 10,
          y: 0.5,
          ypad: 0,
          title: 'OTU ID',
          titleside: 'bottom',
          outlinewidth: 1,
          outlinecolor: 'black',
          tickfont: {
            family: 'Lato',
            size: 14,
            color: 'green'
          }
        }
      }
    
    }];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title : {
        text: "Bacteria Cultures Per Sample",
        font: {
          color: "#0D80AA"
        }
      },
      xaxis : {
        title: "OTU ID"
      }
    };
    var config = {responsive: true}
    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot('bubble', bubbleData, bubbleLayout, config); 
  });

  // Create the Guage Chart
  // 3. Create a variable that holds the washing frequency.
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;

    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    var wfreq = result.wfreq;

    // 4. Create the trace for the gauge chart.
    var gaugeData = [
      {
        domain : {x : [0,1], y : [0,1]},
        value : wfreq,
        title : {
          text : "Belly Button Washing Frequency<br>Scrubs per Week",
          font: {
            color: "#0D80AA"
          }
        },
        mode : "gauge+number",
        type: "indicator",
        gauge : {
          axis : {
            range : [null, 10],
            tick0 : 0,
            dtick : 2
          },
          bar : {color : "black"},
          steps : [
            {range : [0,2], color : "red"},
            {range : [2,4], color : "orange"},
            {range : [4,6], color : "yellow"},
            {range : [6,8], color : "lightgreen"},
            {range : [8,10], color : "green"}
          ],
        }
      }
    ];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = {};
    var config = {responsive: true}
    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout,config);

  });

};