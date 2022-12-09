/**
 * ADD OR EDIT LODGE
 */

$(document).ready(function () {
    // bills
    $("input[name='withBills']").click(function () {
        var fieldset = $("fieldset[name='bills']");
        if ($(fieldset).attr("disabled")) return $(fieldset).removeAttr("disabled").removeClass("opacity-50");
        $(fieldset).attr("disabled", true).addClass("opacity-50")
    });
    $('#add-bill').click(function (evt) {
        evt.preventDefault();
        $('.bill-template').first().clone().prepend('<div class="border-t my-3 border-gray-400"></div>').appendTo($('.bill-template').parent()).find("input").each(function () {
            $(this).val(null)
        });
        $('#remove-bill').show();
    });
    $('#remove-bill').click(function (evt) {
        evt.preventDefault();
        $('.bill-template').last().remove();
        if ($('.bill-template').length <= 1) return $('#remove-bill').hide();
    });

    // amenities
    $("input[name='withAmenities']").click(function () {
        var fieldset = $("fieldset[name='amenities']");
        if ($(fieldset).attr("disabled")) return $(fieldset).removeAttr("disabled").removeClass("opacity-50");
        $(fieldset).attr("disabled", true).addClass("opacity-50")
    });
    $('#add-amenity').click(function (evt) {
        evt.preventDefault();
        $('.amenity-template').first().clone().prepend('<div class="border-t my-3 border-gray-400"></div>').appendTo($('.amenity-template').parent()).find("input").each(function () {
            $(this).val(null)
        });
        $('#remove-amenity').show();
    });
    $('#remove-amenity').click(function (evt) {
        evt.preventDefault();
        $('.amenity-template').last().remove();
        if ($('.amenity-template').length <= 1) return $('#remove-amenity').hide();
    });

    // rules
    $("input[name='withRules']").click(function () {
        var fieldset = $("fieldset[name='rules']");
        if ($(fieldset).attr("disabled")) return $(fieldset).removeAttr("disabled").removeClass("opacity-50");
        $(fieldset).attr("disabled", true).addClass("opacity-50")
    });
    $('#add-rule').click(function (evt) {
        evt.preventDefault();
        $('.rule-template').first().clone().prepend('<div class="border-t my-3 border-gray-400"></div>').appendTo($('.rule-template').parent()).find("input").each(function () {
            $(this).val(null)
        });
        $('#remove-rule').show();
    });
    $('#remove-rule').click(function (evt) {
        evt.preventDefault();
        $('.rule-template').last().remove();
        if ($('.rule-template').length <= 1) return $('#remove-rule').hide();
    });
})



/**
 * ADD OR EDIT ROOM
 */
if($('.amenity-template select').length >= 3) {
    $('.remove-amenity').hide();
}

$(document).ready(function () {
    // amenities
    $('.add-amenity').click(function (evt) {
        evt.preventDefault();
        var amenityContainer = $(evt.target).parent().prev('.amenity-template');
        var amenity = $(amenityContainer).children('select').first().clone();

        $(amenity).appendTo($(amenityContainer));
        $(evt.target).next('.remove-amenity').show();
    });
    $('.remove-amenity').click(function (evt) {
        evt.preventDefault();
        var amenityContainer = $(evt.target).parent().prev('.amenity-template');
        var amenities = $(amenityContainer).children('select');

        $(amenities).last().remove();
        if ($(amenities).length <= 2) return $(evt.target).hide();
    });
});



/**
 * ROOM SETTINGS
 * Delete room modal toggle
 */
$('#modal-close.delete-room-modal').click(function (e) {
    e.preventDefault();
    $('#delete-room-modal').fadeToggle(100).css('display', '');
    $('body').css('overflow-y', 'auto');
});
$('button#delete-room-modal-trigger').click(function (e) {
    $('#delete-room-modal').fadeToggle(100).css('display', 'flex');
    $('body').css('overflow-y', 'hidden');
})