
var GoSCommon = function() {

    var gos = {};
    
    /// ENVIRONMENT VARs
    gos.isDev = true;
    gos.baseURL = "https://mspbeta:Nik3Pr0tected@ecn47-api.nikedev.com";

    
    gos.fixForDev = function(url) {
        if (gos.isDev) {
            return url.replace("https://", "http://mspbeta:Nik3Pr0tected@");
        }
        return url;
    };

    gos.qs = function(key) {
        key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
        var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
        return match && decodeURIComponent(match[1].replace(/\+/g, " "));
    };


    return gos;
}();

$.ajaxSetup({
    xhr: function () { return new window.XMLHttpRequest({ mozSystem: true }); }
});