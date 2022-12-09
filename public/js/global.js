/**
 * Global code snippets for components
 */

// close flash messages
$('#flash-close').click(function () {
    $(this).parent().fadeOut(100, function () {
        $(this).remove();
    });
});

// toggle tooltips
$(document).ready(function () {
    //tooltips
    $('.tooltip-toggle').click(function(){
        var tooltip = '#' + $(this).attr('data-toggle');
        $(tooltip).toggle();
        setTimeout(function(){
            $(tooltip).hide();
        }, 5000)
    });
});