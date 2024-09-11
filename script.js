const countyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
const educationURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

let countyData;
let educationData;

const legendWidth = 300;
const legendHeight = 20;
const legendPadding = 30;

const color = d3.scaleThreshold()
                .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
                .range(d3.schemeBlues[9])

const canvas = d3.select('#canvas')
                  .attr('width', 1000)
                  .attr('height', 600)

const legend = d3.select('#legend')
                 .attr('width', legendWidth + legendPadding)
                 .attr('height', legendHeight + legendPadding)
                 .append('g')
                 .attr('transform', `translate(${legendPadding / 2}, ${legendPadding / 2})`);

const drawMap = () => {
  const tooltip = d3.select('#tooltip')
  
  canvas.selectAll('path')
        .data(countyData)
        .enter()
        .append('path')
        .attr('d', d3.geoPath())
        .attr('class', 'county')
        .attr('fill', (item) => {
    let id = item.id
    let county = educationData.find((item) => {
      return item.fips === id
    })
    let percentage = county['bachelorsOrHigher']        
    return color(percentage)
  })
       .attr('data-fips', (item) => item.id)
       .attr('data-education', (item) => {
    let id = item.id
    let county = educationData.find((item) => {
      return item.fips === id;
    })
    return county.bachelorsOrHigher
  })
       .on('mouseover', function(event, item){
    let id = item.id
    let county = educationData.find((item) => {
      return item.fips === id;
    })
    tooltip.transition().duration(200).style('opacity', '0.8')
    tooltip.html(`${county.area_name}, ${county.state}: ${county.bachelorsOrHigher}%`)
           .attr('data-education', county.bachelorsOrHigher)
           .style('left', `${event.pageX + 10}px`)
           .style('top', `${event.pageY - 28}px`)
    d3.select(this)
      .style('stroke', 'black')
      .style('stroke-width', 1)
  })
       .on('mouseout', function() {
    tooltip.transition().duration(500).style('opacity', '0')
    d3.select(this)
      .style('stroke-width', 0)
  })
}

const drawLegend = () => {
  const legendScale = d3.scaleLinear()
    .domain([2.6, 75.1])  // Adjust the domain to match the scale used in the map
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(legendScale)
    .tickValues(color.domain())  // Use the color scale domain
    .tickFormat(d => Math.round(d) + '%')
    .tickSize(13);
  
  legend.selectAll('rect')
        .data(color.range().map(d => color.invertExtent(d)))
        .enter()
        .append('rect')
        .attr('x', d => legendScale(d[0]))
        .attr('y', 0)
        .attr('width', d => legendScale(d[1]) - legendScale(d[0]))
        .attr('height', 14)
        .attr('fill', d => color(d[0]));

  legend.append('g')
        .attr('transform', 'translate(0, 0)')
        .call(legendAxis)
        .select('.domain')
        .remove();
}
      
d3.json(countyURL).then((data, error) => {
  if(error){
    console.log(error)
  } else {
    countyData = topojson.feature(data, data.objects.counties).features;
    d3.json(educationURL).then((data, error) => {
       if(error){
         console.log(error)
       } else {
         educationData = data;
         console.log(educationData)
         drawMap()
         drawLegend()
       }
    })
  }
})
