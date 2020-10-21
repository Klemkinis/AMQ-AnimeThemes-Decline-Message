// ==UserScript==
// @name         AnimeThemes Decline Message
// @version      0.2
// @match        https://animemusicquiz.com/admin/approveVideos
// @match        https://animemusicquiz.com/admin/approveVideos?skipMp3=true
// @run-at: document-end
// ==/UserScript==

var declineMessageEndpoint
setup()

function setup() {
    declineMessageEndpoint = getDeclineMessageEndpoint()
    if (declineMessageEndpoint == null) {
        throw "Missing endpoint configuration!"
    }

    var songLink = getSongLink()
    if (isVideoLinkFromAnimeThemes(songLink) || isVideoLinkFromOpeningsMoe(songLink)) {
        checkPreviousDeclineMessage(songLink)
    }
}

function getDeclineMessageEndpoint() {
    var cookieKey = "declineMessageEndpoint"
    var cookieList = document.cookie.split(";")
    var cookie = cookieList.find(function(cookie) {
        return cookie.includes(cookieKey)
    })

    if (cookie == null) {
        return null
    }

    var cookieValue = cookie.substring(cookieKey.length + 2)
    return cookieValue
}

function checkPreviousDeclineMessage(songLink) {
    var request = new XMLHttpRequest()
    request.onreadystatechange = function() {
        if (this.readyState != 4 || this.status != 200) {
            throw "Could not retrieve decline message for the link!"
            return
        }

        if (this.responseText == "") {
            // link was not declined / has no decline message
            return
        }

        displayPreviousDeclineMessage(this.responseText)
    }

    request.open("GET", declineMessageEndpoint + "?link=" + songLink, true)
    request.send()
}

function displayPreviousDeclineMessage(declineMessage) {
    var songInfoTable = getSongInfoTable()
    var declineReasonRow = songInfoTable.insertRow(5)
    declineReasonRow.insertCell(0).innerHTML = "Declined for"
	declineReasonRow.insertCell(1).innerHTML = declineMessage
    declineReasonRow.style.backgroundColor = "darkred"
}

// Unwrapping helpers
function getSongLink() {
	var videoPlayer = getVideoPlayer()
    return videoPlayer.src
}

function getSongInfoTable() {
    var songInfoTable = document.getElementsByClassName('table')[0]
    if (songInfoTable == null) {
        throw "Song info table is missing!"
    }
    return songInfoTable
}

function getVideoPlayer() {
    var videoPlayer = document.getElementById("avVideo")
    if (videoPlayer == null) {
        throw "Video player is missing or not loaded"
    }
    return videoPlayer
}

function isVideoLinkFromAnimeThemes(videoLink) {
    return (videoLink.indexOf("animethemes") != -1)
}

function isVideoLinkFromOpeningsMoe(videoLink) {
    return (videoLink.indexOf("openings") != -1)
}
