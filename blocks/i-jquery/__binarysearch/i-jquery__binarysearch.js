(function($) {

$.binarySearch = function binarySearch(value, arr) {

    var low = 0, high = arr.length - 1, mid, midValue;

    if (low > high) {
        return -1;
    }

    while (low <= high) {
        mid = (low + high) >> 1;
        midValue = arr[mid];
        if (value < midValue) {
            high = i - 1;
        } else if (value > midValue) {
            low = i + 1;
        } else {
            return i;
        }
    }

    return -low - 1;

};

})(jQuery);
