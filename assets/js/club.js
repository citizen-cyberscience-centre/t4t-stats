    function createTimeLine(type) {
        Number.prototype.pad = function(size) {
              var s = String(this);
              if(typeof(size) !== "number"){size = 2;}
        
              while (s.length < size) {s = "0" + s;}
              return s;
            }

        var barProgress = $.Deferred();
        var steps = 0;
        var prevPct = 0;
        var totalSteps = 200;

        var boinc_api = "http://lhcathome2.cern.ch/vLHCathome/show_user.php?userid=";
        var mcplots_user = "http://mcplots-dev.cern.ch/api.php?user=";

        var loading_msg = [
            'Pre-cooling down to -193.2ºC the magnets with liquid nitrogen...',
            'Freezing the magnets down to -271.3ºC with liquid helium...',
            'Aligning 9300 magnets...',
            'Starting 600 million collisions per second...',
            'Creating an ultra high-vacuum cavity for particles to travel...',
            'Sampling 600 million collisions per second...',
            'Loading interesting <a href="http://public.web.cern.ch/public/en/lhc/Facts-en.html">CERN LHC facts</a>...',

        ];

        var pct = 0;

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

        var value = "billionairs";
        var label = "Billionares";
        if (type == "10giga") {
            value = "super-billionairs"; 
            label = "Super Billionares";
        }
        var mcplots_api = "http://mcplots-dev.cern.ch/api.php?achievement=n_events&value=" + value.toString();
        var mcplots_api = "http://mcplots-dev.cern.ch/fast/?id=" + value;
        function getName(id) {
            var dfr = $.Deferred();
            var xhr = $.ajax({
                url: boinc_api + id + "&format=xml",
                dataType: 'xml',
                success: dfr.resolve
            });
            xhr.done(function(){
                barProgress.notify(steps++);
            })
            return dfr.promise();
        }

        function getStats(id) {
            var dfr = $.Deferred();
            var xhr = $.ajax({
                url: mcplots_user + id,
                dataType: 'json',
                success: dfr.resolve
            });

            xhr.done(function(){
                barProgress.notify(steps++);
            })

            return dfr.promise();
        }

        function getBillionaires(){
            var dfr = $.Deferred();
            $.ajax({
                url: mcplots_api,
                dataType: 'json',
                success: dfr.resolve
            });
            return dfr.promise();
        }

        stats = {};
        names = {};
        getBillionaires().done(function(users){
            var i=0;
            var l=users.length;
            totalSteps = l + 1;
            console.log("New totalSteps")
            console.log(totalSteps);
            barProgress.notify(steps++);
            users = users.splice(1,l-1);
            var l=users.length;
            var promises = [];
            for(i=0;i<l;i++) {
                promises.push(getName(users[i].user_id))
                promises[i].done(function(data){
                    names[$(data).find('id').text()]=$(data).find('name').text();
                });
            }

            var pr = [];
            for(i=0;i<l;i++) {
                pr.push(getStats(users[i].user_id))
                pr[i].done(function(data){
                    stats[data.user_id]=data;
                });
            }

            var all_promises = promises.concat(pr);

            $.when.apply(null,all_promises).then(function(){
                $.map(users, function(u){
                    return u['name']=names[u.user_id];
                });


                var dates = [];
                $.map(users, function(u,index){
                    if (dates.indexOf(u.date) != -1) {
                        console.log("Duplicate");
                        console.log(u.date);
                        var date = u.date.split("-");
                        for(i=parseInt(date[2], 10); i<30; i++) {
                            var new_date = date[0] + "-" + date[1] + "-" + i.pad();
                            if (dates.indexOf(new_date) == -1) {
                                u.date = new_date;
                                console.log(u.date);
                                dates.push(u.date);
                                break;
                            }
                        }
                        
                    }
                    else {
                        dates.push(u.date);
                    }
                    var date = u.date.split("-");
                    return u['date']= date[0] + ',' + date[1] + ',' + date[2] + ' 00:01';
                });

                $.map(users, function(u){
                    return u['title'] = u['name'];
                });
                var comma = d3.format("2.3s");
                var rounded = d3.format(",s.2g");
                $.map(users, function(u){
                    return u['stats']=stats[u.user_id];
                });

                $.map(users, function(u){
                    var html = '<strong style="font-size:20px"> joined the ' + label + ' Club</strong> <i class="icon-group" style="font-size:24px; padding-left:5px;"></i><br/>';
                    html += '<br/>';
                    html += '<i class="icon-dashboard" style="font-size:18px"></i>   <strong style="font-size:18px; padding-left:5px;"> Current Contributions</strong><br/>';
                    html += "<strong>Number of Events: </strong>" + comma(u.n_events) + "<br/>";
                    html += "<strong>Total Number of Processed jobs: </strong> " + comma(u.stats.n_jobs)+ "<br/>";
                    html += "<strong>Number of hosts: </strong> " + u.stats.hosts.length + "<br/>";
                    //var months = 0;
                    //months = u.stats.cpu_time/(2628000);
                    //html += "<strong>Nominal CPU Time: </strong> " + comma(months) + " months";

                    return u['description'] = html;
                });

                $("#bar").css("width","100%");
                $("#facts").html("<strong>Data loaded!</strong>");
                $("#loading").delay(2000).fadeOut(800, function(){
                    var dataset = new recline.Model.Dataset({records:users});
                    var $el = $('#timeline');
                    var grid = new recline.View.SlickGrid({
                        model: dataset,
                        el: $el
                    });
                    var timeline = new recline.View.Timeline({
                        model: dataset,
                        el: $el
                    });

                    timeline.visible = true;
                });
            });
        });
    }
