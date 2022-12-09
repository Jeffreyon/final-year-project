function toggle_nouislider() {
    var priceSlider = document.getElementById("price-slider");
    var maxPrice = document.getElementById("maxPrice");
    var minPrice = document.getElementById("minPrice");

    var filterOptions = window.filterOptions;
    var slider_start = 110000,
        slider_end = 290000;

    if (filterOptions) {
        // in search page
        filterOptions.area
            ? $("#area").val(filterOptions.area)
            : $("#area > option").first().attr("selected", "true");
        filterOptions.roomType
            ? $("#roomType").val(filterOptions.roomType)
            : $("#roomType > option").first().attr("selected", "true");

        slider_start = filterOptions.price.minPrice;
        slider_end = filterOptions.price.maxPrice;
    }

    noUiSlider.create(priceSlider, {
        start: [slider_start, slider_end],
        connect: true,
        step: 1000,
        margin: 50000,
        format: wNumb({
            decimals: 0,
        }),
        range: {
            min: 100000,
            max: 300000,
        },
    });

    priceSlider.noUiSlider.on("update", function (values, handle) {
        let value = values[handle];
        if (handle) {
            maxPrice.value = value;
        } else {
            minPrice.value = value;
        }
    });
}

document.addEventListener("DOMContentLoaded", function (e) {
    toggle_nouislider();
});
