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
    var barProgress = $.Deferred();
    var steps = 0;
    var prevPct = 0;
    var totalSteps = 22;
    var loading_msg = [
        'Pre-cooling down to -193.2ºC the magnets with liquid nitrogen...',
        'Freezing the magnets down to -271.3ºC with liquid helium...',
        'Aligning 9300 magnets...',
        'Starting 600 million collisions per second...',
        'Creating an ultra high-vacuum cavity for particles to travel...',
        'Sampling 600 million collisions per second...',
        'Loading interesting <a href="http://public.web.cern.ch/public/en/lhc/Facts-en.html">CERN LHC facts</a>...',

    ];

    barProgress.progress(function(step){
        // Compute the completed pct
        //steps = steps + step;
        if (steps === totalSteps) {
            barProgress.resolve();
        }
        else {
            var pctComplete = (steps/totalSteps) * 100;
            // Pick a random fact
            var item = Math.floor(Math.random()*loading_msg.length);
            // Show random fact
            $("#facts").html(loading_msg[item]);
            if (prevPct < pctComplete.toFixed(0)) {
                // Update the progress bar
                $("#bar").css("width", pctComplete.toFixed(0) + "%");
                prevPct = pctComplete.toFixed(0);
            }
        }
    });

    barProgress.done(function(){
        $("#bar").css("width","100%");
        $("#facts").html("<strong>Data loaded!</strong>");
        $(".dataCharts").show();
        $("#loading").delay(2000).fadeOut(800);
    });

    $("#loading").show();

    //var url = encodeURI("http://mcplots-dev.cern.ch/api.php?");
    var url = encodeURI("http://mcplots-dev.cern.ch/fast/?id");
    var boinc_api = "http://lhcathome2.cern.ch/test4theory/show_user.php?userid=";
    var width = 700;
    var height = 430;
    var padding = 20;

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
        var xhr = $.ajax({
            url: url + "=top-users-20",
            dataType: 'json',
            })
        xhr.done(function(){
            barProgress.notify(steps++);
        });
        return xhr;
    }

    function getName(id) {
        var xhr = $.ajax({
            url: boinc_api + id + "&format=xml",
               dataType: 'xml',
        });
        xhr.done(function(){
            barProgress.notify(steps++);
        });
        return xhr;
    }

    function getTotals() {
        var xhr = $.ajax({
            url: url + "=totals",
            dataType: 'json',
            });
        xhr.done(function(){
            barProgress.notify(steps++);
        });
        return xhr;
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


              var comma = d3.format("2.3s");
              var comma_r = d3.format("2.2s");
              var rounded = d3.format(".2r");


              var x = d3.scale.linear()
                  .domain([0, d3.max(nEvents)])
                  .range([padding,width]);

              var y = d3.scale.ordinal()
                  .domain(nEvents)
                  .rangeBands([0, 20 * (length - 1)]);

              $("#bar").css("width","100%");
              $("#facts").html("<strong>Data loaded!</strong>");
              $(".dataCharts").show();
              $("#loading").delay(2000).fadeOut(800);
              chartNEvents.selectAll("rect")
                  .data(nEvents)
                  .enter().append("rect")
                  .style("stroke", "white")
                  .style("fill", function (d,i) {return colors(i);})
                  .attr("y", function(d,i) { return 40 +(i * 20);})
                  .attr("x", padding)
                  .attr("width", function(d){ return (x(d) - padding)})
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

              var i=0;
              var l=idEvent.length;
              var nameEvent = [];

              for(i=0;i<l;i++){
                 var promise = getName(idEvent[i]); 
                 var id = idEvent[i];

                 var yEvent = d3.scale.ordinal()
                     .domain(idEvent)
                     .rangeBands([0, 20 * (length - 1)]);

                 promise.success( function(user) { 

                     var n = $(user).find('name').text();
                     chartNEvents
                      .append("svg:a")
                      .attr("xlink:xlink:href", function(){ 
                          var url = boinc_api + $(user).find('id').text();
                          return url; })
                      .append("text")
                      .attr("y",function() { 
                          var id = parseInt( $(user).find('id').text());
                          return 40 +  yEvent(id) + yEvent.rangeBand()/2;})
                      .attr("dx", 3)
                      .attr("dy", ".35em")
                      .text(function() {
                          if ( n.length > 6 ) {
                              return n.substring(0,6) + "...";
                          }
                          else 
                            return n
                      })
                 });
              }

              chartNEvents.selectAll("line")
                  .data(x.ticks(5))
                  .enter().append("line")
                  .attr("x1", x )
                  .attr("x2", x )
                  .attr("y1", 0 + 40)
                  .attr("y2", 40 + 20 * (length -1))
                  .style("stroke", "#ccc");

              chartNEvents.selectAll(".rule")
                  .data(x.ticks(5))
                  .enter().append("text")
                  .attr("x", x)
                  .attr("y", 0)
                  //.attr("dx", -5)
                  .attr("dy", 38)
                  .attr("text-anchor", "middle")
                  .text(function(d){return comma_r(d);});

              chartNEvents.append("line")
                  .attr("x1", padding)
                  .attr("x2", padding)
                  .attr("y1", 40)
                  .attr("y2", 40 + (length -1) * 20)
                  .style("stroke", "#000");

              var x = d3.scale.linear()
                  .domain([0, d3.max(nGoodJobs)])
                  .range([padding,width]);

              var y = d3.scale.ordinal()
                  .domain(nGoodJobs)
                  .rangeBands([0, 20 * (length - 1)]);

              chartNGoodJobs.selectAll("rect")
                  .data(nGoodJobs)
                  .enter().append("rect")
                  .style("stroke", "white")
                  .style("fill", function (d,i) {return colors(i);})
                  .attr("y", function(d,i) { return 40 +(i * 20);})
                  .attr("x", padding)
                  .attr("width", function(d){ return (x(d) - padding)})
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


              var i=0;
              var l=idEvent.length;

              for(i=0;i<l;i++){
                 var promise = getName(idGoodJobs[i]); 

                 var yGoodJobs = d3.scale.ordinal()
                     .domain(idGoodJobs)
                     .rangeBands([0, 20 * (length - 1)]);

                 promise.success( function(user) { 

                     var n = $(user).find('name').text();
                     chartNGoodJobs
                      .append("svg:a")
                      .attr("xlink:xlink:href", function(){ 
                          var url = boinc_api + $(user).find('id').text();
                          return url; })
                      .append("text")
                      .attr("y",function() { 
                          var id = parseInt( $(user).find('id').text());
                          return 40 +  yGoodJobs(id) + yGoodJobs.rangeBand()/2;})
                      .attr("dx", 3)
                      .attr("dy", ".35em")
                      .text(function() {
                          if ( n.length > 6 ) {
                              return n.substring(0,6) + "...";
                          }
                          else 
                            return n
                      })
                 });
              }

              chartNGoodJobs.selectAll("line")
                  .data(x.ticks(5))
                  .enter().append("line")
                  .attr("x1", x )
                  .attr("x2", x )
                  .attr("y1", 0 + 40)
                  .attr("y2", 40 + 20 * (length -1))
                  .style("stroke", "#ccc");

              chartNGoodJobs.selectAll(".rule")
                  .data(x.ticks(5))
                  .enter().append("text")
                  .attr("x", x)
                  .attr("y", 0)
                  .attr("dy", 38)
                  .attr("text-anchor", "middle")
                  .text(function(d){return comma_r(d);});

              chartNGoodJobs.append("line")
                  .attr("x1", padding)
                  .attr("x2", padding)
                  .attr("y1", 40)
                  .attr("y2", 40 + (length -1) * 20)
                  .style("stroke", "#000");

              var x = d3.scale.linear()
                  .domain([0, d3.max(cpuTime)])
                  .range([padding, width]);

              var y = d3.scale.ordinal()
                  .domain(cpuTime)
                  .rangeBands([0, 20 * (length - 1)]);

              chartCpuTime.selectAll("rect")
                  .data(cpuTime)
                  .enter().append("rect")
                  .style("stroke", "white")
                  .style("fill", function (d,i) {return colors(i);})
                  .attr("y", function(d,i) { return 40 +(i * 20);})
                  .attr("x", padding)
                  .attr("width", function(d){ return (x(d) - padding)})
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
                  .text(function(d){ 
                      var years = 0;
                      years = d/(31536000);
                      return rounded(years)+"y";
                  });

              var i=0;
              var l=idEvent.length;

              for(i=0;i<l;i++){
                 var promise = getName(idCpuTime[i]); 

                 var yCpuTime = d3.scale.ordinal()
                     .domain(idCpuTime)
                     .rangeBands([0, 20 * (length - 1)]);

                 promise.success( function(user) { 

                     var n = $(user).find('name').text();
                     chartCpuTime
                      .append("svg:a")
                      .attr("xlink:xlink:href", function(){ 
                          var url = boinc_api + $(user).find('id').text();
                          return url; })
                      .append("text")
                      .attr("y",function() { 
                          var id = parseInt( $(user).find('id').text());
                          return 40 +  yCpuTime(id) + yCpuTime.rangeBand()/2;})
                      .attr("dx", 3)
                      .attr("dy", ".35em")
                      .text(function() {
                          if ( n.length > 6 ) {
                              return n.substring(0,6) + "...";
                          }
                          else 
                            return n
                      })
                 $("#loading").hide();
                 });
              }

              chartCpuTime.selectAll("line")
                  .data(x.ticks(5))
                  .enter().append("line")
                  .attr("x1", x )
                  .attr("x2", x )
                  .attr("y1", 0 + 40)
                  .attr("y2", 40 + 20 * (length -1))
                  .style("stroke", "#ccc");

              chartCpuTime.selectAll(".rule")
                  .data(x.ticks(5))
                  .enter().append("text")
                  .attr("x", x)
                  .attr("y", 0)
                  .attr("dy", 38)
                  .attr("text-anchor", "middle")
                  .text(function(d){
                      var months = 0;
                      months = d/(2628000);
                      return comma_r(months);
                      });

              chartCpuTime.append("line")
                  .attr("x1", padding)
                  .attr("x2", padding)
                  .attr("y1", 40)
                  .attr("y2", 40 + (length -1) * 20)
                  .style("stroke", "#000");

          });


}(window.top5 = window.top5 || {}, jQuery))
