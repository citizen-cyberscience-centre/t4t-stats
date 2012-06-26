// Test4Theory Leaderboard
// Copyright (C) 2012 Citizen Cyberscience Centre
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

(function ( top5, $, undefined ) {
    var url = encodeURI("http://mcplots-dev.cern.ch/api.php?");
    var width = 720;
    var height = 430;
    var padding = 10;

    var chartCpuTime = d3.select("#cputime")
        .append("svg")
        .attr("class", "chartCpuTime")
        .attr("width", width + padding)
        .attr("height", height + padding)
        .append("g")
            .attr("transform", "translate(10,15)");

    var chartNEvents = d3.select("#nevents")
        .append("svg")
        .attr("class", "chartCpuTime")
        .attr("width", width + padding)
        .attr("height", height + padding)
        .append("g")
            .attr("transform", "translate(10,15)");

    var chartNGoodJobs = d3.select("#ngoodjobs")
        .append("svg")
        .attr("class", "chartCpuTime")
        .attr("width", width + padding)
        .attr("height", height + padding)
        .append("g")
            .attr("transform", "translate(10,15)");

    var colors = d3.scale.category20();

    // Private methods
    function getTopUsers() {
        return $.ajax({
            url: url + "top_users=20",
            dataType: 'json',
            })
    }

    function getTotals() {
        return $.ajax({
            url: url + "totals",
            dataType: 'json',
            })
    }

    function ascending(a, b) {
        return a[0] - b[0];
    }

    $.when(
            getTopUsers(), getTotals()
          ).done( function(topUsers, totals){
              topUsers = topUsers[0];
              totals = totals[0];

              var i = 0;
              var length = topUsers.length;

              // Pair of values
              var ci   = [];
              var ei   = [];
              var gji = [];

              // Sorted IDs for each type
              var idEvent = [];
              var idCpuTime = [];
              var idGoodJobs = [];

              // Sorted values for each type
              var cpuTime   = [];
              var nEvents   = [];
              var nGoodJobs = [];
              
              for (i=0; i< length; i++) {
                  if (( topUsers[i].user_id != null ) && ( topUsers[i].user_id != 0 )) {
                      ci.push([ topUsers[i].cpu_time, topUsers[i].user_id ]);
                      ei.push([ topUsers[i].n_events, topUsers[i].user_id ]);
                      gji.push([ topUsers[i].n_good_jobs, topUsers[i].user_id ]);
                  }
              
              }
              ci.sort( ascending ).reverse();
              ei.sort( ascending ).reverse();
              gji.sort( ascending ).reverse();

              var l = ci.length;
              for(i=0;i<l;i++) {
                  idEvent.push(ei[i][1]);
                  nEvents.push(ei[i][0]);

                  idCpuTime.push(ci[i][1]);
                  cpuTime.push(ci[i][0]);

                  idGoodJobs.push(gji[i][1]);
                  nGoodJobs.push(gji[i][0]);
              }

              var padding = 65;


              var comma = d3.format(",s");


              var x = d3.scale.linear()
                  .domain([0, d3.max(nEvents)])
                  .range([padding,width]);

              var y = d3.scale.ordinal()
                  .domain(nEvents)
                  .rangeBands([0, 20 * (length - 2)]);

              chartNEvents.selectAll("rect")
                  .data(nEvents)
                  .enter().append("rect")
                  .style("stroke", "white")
                  .style("fill", function (d,i) {return colors(i);})
                  .attr("y", function(d,i) { return 40 +(i * 20);})
                  .attr("x", padding)
                  .attr("width", x)
                  .attr("height", y.rangeBand())

              chartNEvents.selectAll("text")
                  .data(nEvents)
                  .enter().append("text")
                  .attr("x", x)
                  .attr("y", function(d) { return 40 +  y(d) + y.rangeBand()/2;})
                  .attr("dx", -3)
                  .attr("dy", ".35em")
                  .attr("text-anchor", "end")
                  .style("fill", "white")
                  .text(function(d){ return comma(d);});

              chartNEvents.selectAll(".xlabel")
                  .data(idEvent)
                  .enter().append("text")
                  .attr("y",function(d) { return 40 +  y(d) + y.rangeBand()/2;})
                  .attr("dx", 3)
                  .attr("dy", ".35em")
                  .text(function(d){ return "ID: " + d})

              chartNEvents.selectAll("line")
                  .data(x.ticks(5))
                  .enter().append("line")
                  .attr("x1", x )
                  .attr("x2", x )
                  .attr("y1", 0 + 40)
                  .attr("y2", 40 + 20 * (length -2))
                  .style("stroke", "#ccc");

              chartNEvents.selectAll(".rule")
                  .data(x.ticks(5))
                  .enter().append("text")
                  .attr("x", x)
                  .attr("y", 0)
                  .attr("dy", 38)
                  .attr("text-anchor", "middle")
                  .text(function(d){return comma(d);});

              chartNEvents.append("line")
                  .attr("x1", padding)
                  .attr("x2", padding)
                  .attr("y1", 40)
                  .attr("y2", 40 + (length -2) * 20)
                  .style("stroke", "#000");

              var x = d3.scale.linear()
                  .domain([0, d3.max(nGoodJobs)])
                  .range([padding,width]);

              var y = d3.scale.ordinal()
                  .domain(nGoodJobs)
                  .rangeBands([0, 20 * (length - 2)]);

              chartNGoodJobs.selectAll("rect")
                  .data(nGoodJobs)
                  .enter().append("rect")
                  .style("stroke", "white")
                  .style("fill", function (d,i) {return colors(i);})
                  .attr("y", function(d,i) { return 40 +(i * 20);})
                  .attr("x", padding)
                  .attr("width", x)
                  .attr("height", y.rangeBand())

              chartNGoodJobs.selectAll("text")
                  .data(nGoodJobs)
                  .enter().append("text")
                  .attr("x", x)
                  .attr("y", function(d) { return 40 +  y(d) + y.rangeBand()/2;})
                  .attr("dx", -3)
                  .attr("dy", ".35em")
                  .attr("text-anchor", "end")
                  .style("fill", "white")
                  .text(function(d){return comma(d);});

              chartNGoodJobs.selectAll(".xlabel")
                  .data(idGoodJobs)
                  .enter().append("text")
                  .attr("y",function(d) { return 40 +  y(d) + y.rangeBand()/2;})
                  .attr("dx", 3)
                  .attr("dy", ".35em")
                  .text(function(d){ return "ID: " + d})

              chartNGoodJobs.selectAll("line")
                  .data(x.ticks(5))
                  .enter().append("line")
                  .attr("x1", x )
                  .attr("x2", x )
                  .attr("y1", 0 + 40)
                  .attr("y2", 40 + 20 * (length -2))
                  .style("stroke", "#ccc");

              chartNGoodJobs.selectAll(".rule")
                  .data(x.ticks(5))
                  .enter().append("text")
                  .attr("x", x)
                  .attr("y", 0)
                  .attr("dy", 38)
                  .attr("text-anchor", "middle")
                  .text(function(d){return comma(d);});

              chartNGoodJobs.append("line")
                  .attr("x1", padding)
                  .attr("x2", padding)
                  .attr("y1", 40)
                  .attr("y2", 40 + (length -2) * 20)
                  .style("stroke", "#000");

              var x = d3.scale.linear()
                  .domain([0, d3.max(cpuTime)])
                  .range([padding, width]);

              var y = d3.scale.ordinal()
                  .domain(cpuTime)
                  .rangeBands([0, 20 * (length - 2)]);


              chartCpuTime.selectAll("rect")
                  .data(cpuTime)
                  .enter().append("rect")
                  .style("stroke", "white")
                  .style("fill", function (d,i) {return colors(i);})
                  .attr("y", function(d,i) { return 40 +(i * 20);})
                  .attr("x", padding)
                  .attr("width", x)
                  .attr("height", y.rangeBand())

              chartCpuTime.selectAll("text")
                  .data(cpuTime)
                  .enter().append("text")
                  //.attr("x", function(d) { return x(d)+padding;})
                  .attr("x", x)
                  .attr("y", function(d) { return 40 + y(d) + y.rangeBand()/2;})
                  .attr("dx", -3)
                  .attr("dy", ".35em")
                  .attr("text-anchor", "end")
                  .style("fill", "white")
                  .text(function(d){ return comma(d);});

              chartCpuTime.selectAll(".xlabel")
                  .data(idCpuTime)
                  .enter().append("text")
                  .attr("y",function(d) { return 40 +  y(d) + y.rangeBand()/2;})
                  .attr("dx", 3)
                  .attr("dy", ".35em")
                  .text(function(d){ return "ID: " + d})

              chartCpuTime.selectAll("line")
                  .data(x.ticks(5))
                  .enter().append("line")
                  .attr("x1", x )
                  .attr("x2", x )
                  .attr("y1", 0 + 40)
                  .attr("y2", 40 + 20 * (length -2))
                  .style("stroke", "#ccc");

              chartCpuTime.selectAll(".rule")
                  .data(x.ticks(5))
                  .enter().append("text")
                  .attr("x", x)
                  .attr("y", 0)
                  .attr("dy", 38)
                  .attr("text-anchor", "middle")
                  .text(function(d){return comma(d);});

              chartCpuTime.append("line")
                  .attr("x1", padding)
                  .attr("x2", padding)
                  .attr("y1", 40)
                  .attr("y2", 40 + (length -2) * 20)
                  .style("stroke", "#000");


          });


}(window.top5 = window.top5 || {}, jQuery))
