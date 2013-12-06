
var Game = function() {

    var accessToken;
    var game = {};
    var currentGameID;
    var trickid;
    var videokey;
    
    game.init = function () {
        currentGameID = GoSCommon.qs("gameid");
        trickid = GoSCommon.qs("trickid");
        videokey = GoSCommon.qs("videokey");
        accessToken = GoSCommon.qs("accesstoken");
        attachEvents();
        loadData();
    };

    var loadData = function () {
        if (videokey == "TRICK_FAIL") {
            $("#videoContent").hide();
        }
        else {
            $("#selectATrick").hide();
            $("#videoFrame").attr("src", "https://www.youtube.com/embed/" + videokey + "?enablejsapi=1");
        }
    };
    
    var attachEvents = function () { 
        $("#yesButton").click(function () {
            gotoRecord();
        });
        $("#noButton").click(function () {
            alert("dispute!");
        });
        $("#recordButton").click(function () {
            gotoRecord();
        });
    };

    var gotoRecord = function() {
        var url = "Record.html?gameid=" + encodeURIComponent(currentGameID)
            + "&trickid=" + (trickid)
            + "&accesstoken=" + (accessToken);
        console.log(url);

        window.location = url;
    };

    return game;
}();
$("document").ready(Game.init);
