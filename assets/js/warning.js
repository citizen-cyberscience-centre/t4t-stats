(function ( warning, $, undefined ) {

    // Check if the welcome message has been displayed before
    // If this is the first time, show it and create a cookie 
    // that will expire after 7 days so the user will see it again
    // one week later
    if ($.cookie('show_warning') == null) {
        $('#welcome').modal('show');
        $.cookie('show_warning', '1', { expires: 7 });
    }

}(window.warning = window.warning || {}, jQuery))
