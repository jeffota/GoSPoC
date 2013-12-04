
var Record = function () {
    var getTokenUrl = GoSCommon.baseURL + "/skateboard/TokenProducer?access_token=";
    var uploadVideoUrl = "http://ecn10-skateproxy.nikedev.com/VideoUpload";
    var accessToken;
    var game = {};
    var currentGameID;
    var trickid;
    var videoToken;
    
    game.init = function () {
        currentGameID = GoSCommon.qs("gameid");
        trickid = GoSCommon.qs("trickid");
        accessToken = GoSCommon.qs("accesstoken");
        attachEvents();
        loadData();
    };

    var loadData = function () {
        $.ajax(
           {
               url: getTokenUrl + accessToken,
               type: "GET",
               dataType: "json",
               success: function (data) {
                   videoToken = data.token;
               },
               error: function (data, xhr, message) {
                   $("#errorDiv").text("error loading page " + url + " " + message);
               }
           });
    };

    var recordSuccess = function(e) {
        console.log("Video success");
        
        var video = this.result;
        $("#videoShow").html("Video Selected");
        $("#errorDiv").html("0");
        proxyUpload(video.blob);
    };

    var readFileAsString = function(file, onloadend) {
        var reader = new FileReader();

        reader.onloadend = function () { onloadend(reader.result); };

        try {
            reader.readAsBinaryString(file);
        } catch(err) {
            $("#errorDiv").html("ERROR: " + err);
            return;
        }
    };

    var proxyUpload = function (file) {
       /* readFileAsString(file, function(fileString) {
            var data = new FormData();
            data.append("token", accessToken);
            data.append("title", "FirefoxOSTest");
            data.append("uploadFile", fileString);
            try {
                $.ajax({
                    url: 'uploadVideoUrl',
                    data: data,
                    processData: false,
                    contentType: false,
                    type: 'POST',
                    success: function (rslt) {
                        $("#errorDiv").html("SUCCESS: " + rslt);
                    },
                    error: function (something, xhr, msg) {
                        $("#errorDiv").html("error");
                        var result = "\n\nSTATE CHANGE" + "<br>";
                        result += xhr.readyState + "<br>";
                        result += xhr.statusText + "<br>";
                        result += xhr.responseText + "<br>";
                        result += msg;
                        $("#errorDiv").html(result);
                    },
                    complete: function () {
                        //$("#errorDiv").html("complete");
                    }
                });
            } catch (err) {
                $("#errorDiv").html("ajax err" + err);
            }

        });*/
        
        readFileAsString(file, function(filestring) {
            /*var data = new FormData();
            data.append("token", accessToken);
            data.append("title", "FirefoxOSTest");
            data.append("uploadFile", filestring);
            xhr.setRequestHeader("Content-Length", data.length);*/
            var xhr = new XMLHttpRequest({ mozSystem: true });

            xhr.onreadystatechange = function (e) {
                var result = "\n\nSTATE CHANGE" + "<br>";
                result += xhr.readyState + "<br>";
                result += xhr.statusText + "<br>";
                result += xhr.responseText + "<br>";
                result += "--------------<br>";
                result += xhr.getAllResponseHeaders() + "<br>";
                $("#errorDiv").html(result);
            };

            xhr.open("POST", uploadVideoUrl, true);

            xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=\"f93dcbA3\"");

            var content = [
                "--f93dcbA3",
                "Content-Disposition: form-data; name='token'",
                accessToken,
                "--f93dcbA3",
                "Content-Disposition: form-data; name='title'",
                "firefoxOsTest",
                "--f93dcbA3",
                "Content-Type: video/3gpp",
                "Content-Transfer-Encoding: binary",
                filestring,
                "--f93dcbA3--"
            ];

            var data = content.join("\n");
            xhr.setRequestHeader("Content-Length", data.length);

            xhr.send(data);
        });


    };

    
    var recordVideo = function() {
        if (!videoToken) {
            alert("Error, could not get token to upload video.");
            return;
        }
        var activity = new MozActivity({
            name: "pick",

            // Provide the data required by the filters of the activity
            data: {
                type: "video/*"
            }
        });

        activity.onsuccess = recordSuccess;
        activity.onerror = function () {
            console.log("Error in activity");
            console.dir(this.error.name);
            console.log(this.error.type);
            alert("An error occured during recording.");
        };
    };

    var attachEvents = function () { 
        $("#recordButton").click(recordVideo);
    };

    var randomName = function(ext) {
        return (Math.random() * 1e8).toString(16) + (ext || "");
    };


    return game;
}();
$("document").ready(Record.init);

//demo video code
/*
var key = "AI39si7IuhI3ub6YnNfbfA3f3TukUtKRL_Tq8YqUfHRmwMR37MpzV3mGXYOldcrPPUyJLLHnfVtlh3v5Qq70zvOjvFyMFBn5Pw";
var button = document.getElementById("record");


function randomName(ext) {
    return (Math.random() * 1e8).toString(16) + (ext || "");
}

button.onclick = function () {
    var activity = new MozActivity({
        name: "pick",

        // Provide the data required by the filters of the activity
        data: {
            type: "video/*"
        }
    });

    activity.onsuccess = onSuccess;
    activity.onerror = function () {
        console.log("Error in activity");
        console.dir(this.error.name);
        console.log(this.error.type);
    };
};

function onSuccess(e) {
    console.log("Video success");
    var video = this.result;
    console.log(video.type);
    console.log(video.blob);

    uploadYoutube(video.blob);
}

function xmlString(title, description, keywords) {
    title = title || "test";
    description = description || "test";
    keywords = keywords || "skate";

    var content = [
		'<?xml version="1.0"?>',
		'<entry xmlns="http://www.w3.org/2005/Atom"',
		'  xmlns:media="http://search.yahoo.com/mrss/"',
		'  xmlns:yt="http://gdata.youtube.com/schemas/2007">',
		'  <media:group>',
		'    <media:title type="plain">' + title + '</media:title>',
		'    <media:description type="plain">',
			description,
		'    </media:description>',
		'    <media:category',
		'      scheme="http://gdata.youtube.com/schemas/2007/categories.cat">People',
		'    </media:category>',
		'    <media:keywords>' + keywords + '</media:keywords>',
		'  </media:group>',
		'</entry>'
    ];

    return content.join("\n");
}

function uploadYoutube(file) {
    var name = randomName(".3gp");
    var xhr = new XMLHttpRequest({ mozSystem: true });

    xhr.open("POST", "http://uploads.gdata.youtube.com/feeds/api/users/default/uploads", true);
    //xhr.setRequestHeader("Authorization", "Bearer "); TRY WITHOUT
    xhr.setRequestHeader("GData-Version", "2");
    xhr.setRequestHeader("X-GData-Key", "key=" + key);
    xhr.setRequestHeader("Slug", name);
    xhr.setRequestHeader("Content-Type", "multipart/related; boundary=\"f93dcbA3\"");

    var content = [
		"--f93dcbA3",
		"Content-Type: application/atom+xml; charset=UTF-8",
		xmlString(), //PUT XML 
		"--f93dcbA3",
		"Content-Type: video/3gpp",
		"Content-Transfer-Encoding: binary"
    ];

    var reader = new FileReader();

    reader.onloadend = function (bin) {
        console.log("Got BINARY");

        content.push(reader.result);
        content.push("--f93dcbA3");

        var data = content.join("\n");
        xhr.setRequestHeader("Content-Length", data.length);
        xhr.setRequestHeader("Connection", "close");

        console.log("\n\n\n\n\n\n\n");
        console.log(data);
        console.log("\n\n\n\n\n\n\n");

        xhr.send(data);
    };
    reader.readAsBinaryString(file);

    xhr.onreadystatechange = function (e) {
        console.log("\n\nSTATE CHANGE");
        console.log(xhr.readyState);
        console.log(xhr.statusText);
        console.log(xhr.responseText);
        console.log("--------------\n\n");
        var headers = xhr.getAllResponseHeaders();
        console.log(headers);
    };
}

   */