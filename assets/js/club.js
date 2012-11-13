jQuery(function($) {

    var boinc_api = "http://lhcathome2.cern.ch/test4theory/show_user.php?userid=";
    var mcplots_user = "http://mcplots-dev.cern.ch/api.php?user=";

    var intervalID = 0;
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

    function update_loading_msg() {
        var item = Math.floor(Math.random()*loading_msg.length);
        pct = pct + 3;
        if (pct >= 70) {
            pct = pct + 2;
        }
        $("#facts").html(loading_msg[item]);
        $("#bar").css("width", pct + "%");
    }

    $("#loading").show();
    intervalID = setInterval(update_loading_msg, 3*1000);

    var mcplots_api = "http://mcplots-dev.cern.ch/api.php?achievement=n_events&value=1000000000";
    function getName(id) {
        var dfr = $.Deferred();
        $.ajax({
            url: boinc_api + id + "&format=xml",
            dataType: 'xml',
            success: dfr.resolve
        });
        return dfr.promise();
    }

    function getStats(id) {
        var dfr = $.Deferred();
        $.ajax({
            url: mcplots_user + id,
            dataType: 'json',
            success: dfr.resolve
        });
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


            $.map(users, function(u,index){
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
                var html = '<strong style="font-size:20px"> joined the Billionaires Club</strong> <i class="icon-group" style="font-size:24px; padding-left:5px;"></i><br/>';
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

            clearInterval(intervalID);
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
});
