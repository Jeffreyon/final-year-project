function toggle_owlcarousel() {
    var owl = $(".owl-carousel").owlCarousel({
        margin: 10,
        items: 1,
    });
    $("#prev").click(function (e) {
        e.preventDefault();
        owl.trigger("prev.owl.carousel");
    });
    $("#next").click(function (e) {
        e.preventDefault();
        owl.trigger("next.owl.carousel");
    });
}

document.addEventListener("DOMContentLoaded", function (e) {
    toggle_owlcarousel();
});
