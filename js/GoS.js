
var GoS = function() { 

    var loginUrl = GoSCommon.baseURL + "/nsl/v2.0/user/login/?client_id=a05e25088e9614d4892b76ed0df03197&app=com.nike.brand.ios.skate&client_secret=1a067304648e9f5a";
    var getOpenGamesURL = GoSCommon.baseURL + "/skateboard/skate_game/get_all_open_games?access_token=";
    var getCurrentGamesURL = GoSCommon.baseURL + "/skateboard/skate_game/get_all_games_for_user?access_token=";
    var getProfile = GoSCommon.baseURL + "/skateboard/profile/?access_token=";
    var myProfilePic;
    var accessToken;
    var myID;
    var gos = {};
    var currentGameID;
    var currentTrick;
    
    gos.init = function () {
        attachEvents();
        loadData();
    };

    gos.showGame = function (gameButton) {
        currentGameID = $(gameButton).data("gameid");
        var videoKey = $(gameButton).data("videokey");
        var trickID = $(gameButton).data("trickid");
        var url = "Game.html?gameid=" + encodeURIComponent(currentGameID)
            + "&videokey=" + encodeURIComponent(videoKey)
            + "&trickid=" + (trickID)
            + "&accesstoken=" + (accessToken);
        console.log(url);

        window.location = url;
    };
    
    gos.respond = function () {
        loadPage("Record.html");
    };
    
    gos.login = function() {
        var username = $('#username').val();
        var password = $('#password').val();
        var creds = { "email": username, "password": password };

        $.ajax(
            {
                url: loginUrl,
                type: "POST",
                headers: { "Accept": "application/json" },
                data: creds,
                success: function(data) {
                    if (data instanceof XMLDocument) {
                        $("#errorDiv").text("Invalid login.  Please try again.");
                    } else {
                        accessToken = data.access_token;
                        loadUserData();
                    }
                },
                error: function(data, xhr, message) {
                    $("#errorDiv").text("Error accessing login service: " + message);
                }
            });
    };
    
    var loadPage = function(url) {
        $.ajax(
             {
                 url: url,
                 type: "GET",
                 dataType: "text",
                 success: function (data) {
                     
                     $("body").html(data);
                    gos.init();
                },
                error: function(data, xhr, message) {
                    $("#errorDiv").text("error loading page " + url + " " + message);
                }
            });
    };

    var attachEvents = function () {
        var buttons = $("#loginButton").filter(filterInitialized);
        buttons.click(function () {
            GoS.login();
        });
        buttons.data("initialized", true);
        buttons = $(".gameButton").filter(filterInitialized);
        buttons.click(function () {
            GoS.showGame(this);
        });
        buttons.data("initialized", true);
    };


    var filterInitialized = function() {
        return $(this).data('initialized') != true;
    };

    var loadData = function() {
        var openGames = $("#openGames").filter(filterInitialized);
        if (openGames.length > 0) {
            loadOpenGames(openGames);
        }
        openGames.data("initialized", true);
        var currentGames = $("#currentGames").filter(filterInitialized);
        if (currentGames.length > 0)
            loadCurrentGames(currentGames);
        openGames.data("initialized", true);
    };

    var loadUserData = function() {
        $.ajax(
            {
                url: getProfile + accessToken,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    myID = data.message.user.id;
                    myProfilePic = data.message.user.profilePicUrl;
                    loadPage("/Home.html");
                },
                error: function (data, xhr, message) {
                    $("#errorDiv").text("error loading profile " + message);
                }
            });
    };

    var loadOpenGames = function (container) {
        $.ajax(
            {
                url: getOpenGamesURL + accessToken,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    var list = "<ul class='openGames'>";

                    for (var i = 0; i < data.message.length; i++) {
                        var msg = data.message[i];
                        list += "<li><image src='" + GoSCommon.fixForDev(msg.playerUser.profilePictUrl) + "'" + ">Join " + msg.playerUser.displayName + "'s game</li>";
                    }
                    list += "</ul>";
                    container.html(list);
                },
                error: function (data, xhr, message) {
                    $("#errorDiv").text("error loading open games " + message);
                }
            });
    };
    
    var loadCurrentGames = function (container) {
        $.ajax(
            {
                url: getCurrentGamesURL + accessToken,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    loadStats(data.message);
                    if (data.message.userGames.length > 0) {
                        var list = "<div class='currentGames'>";

                        for (var i = 0; i < data.message.userGames.length; i++) {
                            var game = data.message.userGames[i];
                            var me;
                            var opponent;
                            var myScore;
                            var oppScore;
                            var myTurn = game.lastTurn.userId != myID;
                            if (game.playerUser.userId == myID) {
                                myScore = game.playerScore;
                                oppScore = game.opponentScore;
                                me = game.playerUser;
                                opponent = game.opponentUser;
                            } else {
                                oppScore = game.playerScore;
                                myScore = game.opponentScore;
                                opponent = game.playerUser;
                                me = game.opponentUser;
                            }
                            list += "<div class='currentGame'><strong>Versus " + opponent.displayName + "</strong>";
                            list += "<div class='turnIndicator'>";
                            if (myTurn)
                                list += "<input type='button' class='gameButton' data-gameid='" + game.skateGameId + "' data-trickid='" + game.lastTurn.trickId + "' data-videokey='" + game.lastTurn.trickVideo.videoKey + "' value='Your Turn' />";
                            else {
                                list += "Waiting on " + opponent.displayName;
                            }
                            list += "</div>";
                            
                            list += addUserScore(me, myScore);
                            list += addUserScore(opponent, oppScore);

                            list += "</div><hr />";
                        }
                        list += "</div>";
                        container.html(list);
                        attachEvents();
                    } else {
                        container.html("<strong>No Current Games</strong>");
                    }
                },
                error: function (data, xhr, message) {
                    $("#errorDiv").text("error loading open games " + message);
                }
            });
    };

    var addUserScore = function(player, score) {

        var scoreHtml = "<div class='player'>";
        scoreHtml += "<image src='" + GoSCommon.fixForDev(player.profilePictUrl) + "' />";
        scoreHtml += "<div class='score'>";
        scoreHtml += getLetter("S", score <= 0);
        scoreHtml += getLetter("K", score <= 1);
        scoreHtml += getLetter("A", score <= 2);
        scoreHtml += getLetter("T", score <= 3);
        scoreHtml += getLetter("E", score <= 4);
        scoreHtml += "</div></div>";

        return scoreHtml;
    };

    var getLetter = function (letter, empty) {
        return "<img src='img/" + (empty ? "empty" : "filled") + letter + ".png' />";
    };

    var loadStats = function(message) {
        var statsContainer = $("stats");
        var stats = "<div class='allGames'>" + message.activeGamesWorldwideCount + "</div>";
        stats += "<div class='userStats'>All time record " + message.userSkateStats.SKATE_GAMES_WON + "/" + message.userSkateStats.SKATE_GAMES_LOST + "</div>";
        statsContainer.html(stats);
    };

    return gos;
}();

$("document").ready(GoS.init);