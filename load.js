window.onload = init();

function init()
{
    var date = new Date();
    var tz = date.getTimezoneOffset() * 1000;
    var currentTime = date.getTime();
    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType("text/xml");
    xhr.open("GET", "http://www.bbc.co.uk/radio/aod/availability/radio4.xml", false);
    xhr.setRequestHeader("Cache-Control", "private, " + (60 * 60 * 24));
    xhr.send(null);
    var xml = xhr.responseXML;
    const entry = Array.from(xml.getElementsByTagName("entry"))
        .find(entry => {
            const availability = entry.querySelector("broadcast");
            var startTime = new Date(availability.getAttribute("start")).getTime() + tz;
            var endTime = new Date(availability.getAttribute("end")).getTime() + tz;
            return startTime < currentTime && endTime > currentTime;
        });

    var programmeTitle = document.getElementsByClassName("programme-title")[0];

    programmeTitle.innerText =
        entry
            ? entry.querySelector("title").childNodes[0].nodeValue
            : "No information on the current broadcast";

    var programmeDesc = document.getElementsByClassName("programme-desc")[0];

    programmeDesc.innerText =
        entry
            ? entry.querySelector("synopsis").childNodes[0].nodeValue
            : "This broadcast has no description.";

    if (entry && entry.querySelector("images > image"))
    {
        var featuredImg = document.createElement("img");
        featuredImg.setAttribute("src", entry.querySelector("images > image").textContent);
        programmeTitle.parentNode.insertBefore(featuredImg, programmeTitle);
    }
}
