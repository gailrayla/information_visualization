console.log("hello world!") // You can see this in the browser console if you run the server correctly
// Don't edit skeleton code!!

d3.csv('data/owid-covid-data.csv')
    .then(data => {

        /*
        -------------------------------------------
        YOUR CODE STARTS HERE

        TASK 1 - Data Processing 

        TO-DO-LIST
        1. Exclude data which contain missing values on columns you need
        2. Exclude all data except the data where the continent is Asia 
        3. Calculate the rate of fully vaccinated people, partially vaccinated people, and total rate of vaccinated people
        4. Exclude data where total rate of vaccinated people is over 100%
        5. Exclude all data except the latest data for each country
        6. Sort the data with descending order by total rate of vaccinated people
        7. Extract Top 15 countries 
        -------------------------------------------
        */

        // 1. Exclude data which contain missing values on columns you need
        const filteredData = data.filter(d => d.people_fully_vaccinated !== "" && d.people_vaccinated !== "");

        // 2. Exclude all data except the data where the continent is Asia
        const asiaData = filteredData.filter(d => d.continent === "Asia");

        // 3. Calculate the rate of fully vaccinated people, partially vaccinated people, and total rate of vaccinated people
        asiaData.forEach(d => {
            d.fully_vaccinated_rate = +d.people_fully_vaccinated_per_hundred || 0;
            d.partially_vaccinated_rate = +d.people_vaccinated_per_hundred - d.fully_vaccinated_rate || 0;
            d.total_vaccinated_rate = +d.people_vaccinated_per_hundred || 0;
        });

        // 4. Exclude data where total rate of vaccinated people is over 100%
        const validAsiaData = asiaData.filter(d => d.total_vaccinated_rate <= 100);

        // 5. Exclude all data except the latest data for each country
        const latestData = {};
        validAsiaData.forEach(d => {
            const country = d.location;
            if (!latestData[country] || new Date(d.date) > new Date(latestData[country].date)) {
                latestData[country] = d;
            }
        });
        const latestAsiaData = Object.values(latestData);

        // 6. Sort the data with descending order by total rate of vaccinated people
        latestAsiaData.sort((a, b) => b.total_vaccinated_rate - a.total_vaccinated_rate);

        // 7. Extract Top 15 countries
        const top15Countries = latestAsiaData.slice(0, 15);

        /*
        -------------------------------------------
        YOUR CODE ENDS HERE
        -------------------------------------------
        */

        drawBarChart(top15Countries);

    })
    .catch(error => {
        console.error(error);
    });

    function drawBarChart(data) {

        // Define the screen
        const margin = { top: 5, right: 30, bottom: 50, left: 120 },
            width = 800 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;
    
        // Define the position of the chart 
        const svg = d3.select("#chart")
            .append("svg")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

    /*
    -------------------------------------------
    YOUR CODE STARTS HERE

    TASK 2 - Data processing 

    TO-DO-LIST
    1. Create a scale named xScale for x-axis
    2. Create a scale named yScale for y-axis
    3. Define a scale named cScale for color
    4. Process the data for a stacked bar chart 
    5. Draw Stacked bars
    6. Draw the labels for bars
    -------------------------------------------
    */

    // 1. Create a scale for x-axis
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total_vaccinated_rate)])
        .range([0, width]);

    // 2. Create a scale for y-axis
    const yScale = d3.scaleBand()
        .domain(data.map(d => d.location))
        .range([0, height])
        .padding(0.1);

    // 3. Define a scale for color
    const colorScale = d3.scaleOrdinal()
        .domain(['fully_vaccinated', 'partially_vaccinated'])
        .range(['#7bccc4', '#2b8cbe']);

    // 4. Process the data for a stacked bar chart
    const stack = d3.stack()
        .keys(['fully_vaccinated_rate', 'partially_vaccinated_rate'])
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    const stackedData = stack(data);

    // 5. Draw Stacked bars
    svg.selectAll(".bar-group")
        .data(stackedData)
        .enter().append("g")
        .attr("class", "bar-group")
        .attr("fill", d => colorScale(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
        .attr("x", d => xScale(d[0]))
        .attr("y", d => yScale(d.data.location))
        .attr("width", d => xScale(d[1]) - xScale(d[0]))
        .attr("height", yScale.bandwidth());

    // Draw the labels for left (fully vaccinated rate) bars
    svg.selectAll(".bar-label-left")
        .data(data)
        .enter().append("text")
        .attr("class", "bar-label-left")
        .attr("x", d => xScale(d.fully_vaccinated_rate) - 5) // Inside the left bar towards the edge
        .attr("y", d => yScale(d.location) + yScale.bandwidth() / 2)
        .text(d => `${d.fully_vaccinated_rate.toFixed(1)}%`)
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")


    // Draw the labels for right (total vaccinated rate) bars
    svg.selectAll(".bar-label-right")
        .data(data)
        .enter().append("text")
        .attr("class", "bar-label-right")
        .attr("x", d => xScale(d.fully_vaccinated_rate + d.partially_vaccinated_rate) + 5) // After the right bar
        .attr("y", d => yScale(d.location) + yScale.bandwidth() / 2)
        .text(d => `${(d.fully_vaccinated_rate + d.partially_vaccinated_rate).toFixed(1)}%`)
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "middle");

    /*
    -------------------------------------------
    YOUR CODE ENDS HERE
    -------------------------------------------
    */

     // Define the position of each axis
     const xAxis = d3.axisBottom(xScale);
     const yAxis = d3.axisLeft(yScale);
 
     // Draw axes 
     svg.append("g")
         .attr('class', 'x-axis')
         .attr('transform', `translate(0, ${height})`)
         .call(xAxis);
 
     svg.append("g")
         .attr('class', 'y-axis')
         .call(yAxis)
 
     // Indicate the x-axis label 
     svg.append("text")
         .attr("text-anchor", "end")
         .attr("x", width)
         .attr("y", height + 40)
         .attr("font-size", 17)
         .text("Share of people (%)");
 
     // Draw Legend
     const legend = d3.select("#legend")
         .append("svg")
         .attr('width', width)
         .attr('height', 70)
         .append("g")
         .attr("transform", `translate(${margin.left},${margin.top})`);
 
     legend.append("rect").attr('x', 0).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#7bccc4")
     legend.append("rect").attr('x', 0).attr('y', 36).attr('width', 12).attr('height', 12).style("fill", "#2b8cbe")
     legend.append("text").attr("x", 18).attr("y", 18).text("The rate of fully vaccinated people").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
     legend.append("text").attr("x", 18).attr("y", 36).text("The rate of partially vaccinated people").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
 
 }