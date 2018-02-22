window.onload = init();

function init()
{
    loadApp = new Radio();
    loadApp.boot();
}

function Radio()
{
    var self = this;

    self.boot = function()
    {

        function loadBlocks()
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
            let allEntries = Array.from(xml.getElementsByTagName("entry"))
                .filter(singleEntry => {
                    const availability = singleEntry.querySelector("broadcast");
                    var startTime = new Date(availability.getAttribute("start")).getTime() + tz;
                    var endTime = new Date(availability.getAttribute("end")).getTime() + tz;
                    return startTime < currentTime && endTime > currentTime;
                });
            
            const entry = allEntries[1] ? allEntries[1] : allEntries[0];

            const upcomingEntry = entry.nextElementSibling.nextElementSibling;

            var upcomingTitle = document.querySelector(".upcoming-title"),
                upcomingDesc = document.querySelector(".upcoming-desc"),
                programmeTitle = document.querySelector(".programme-title"),
                programmeDesc = document.querySelector(".programme-desc"),
                lastUpdated = new Date(xml.querySelector("schedule").getAttribute("updated")).getTime();

            const remainingMs = (new Date(upcomingEntry.querySelector("broadcast").getAttribute("start")).getTime() + tz) - (new Date().getTime() + tz);
            const diffMins = Math.round(((remainingMs % 86400000 % 3600000)) / 60000);

            function interimModal()
            {
                var modal = document.querySelector(".interim-modal").classList.add("show");
                document.querySelectorAll(".info-container, .upcoming-sidebar")
                .forEach(function(element)
                {
                    element.classList.add("hide");
                });
            }

            if (diffMins <= 1) interimModal();

            if ( (lastUpdated + 1000 * 60 * 60 * 24 * 7) + tz < new Date() )
            {
                upcomingTitle.innerText = "N/A";
                upcomingDesc.innerText = "N/A";
                programmeTitle.innerText = "N/A";
                programmeDesc.innerText = "N/A";
                return;
            }

            upcomingTitle.innerText =
                upcomingEntry
                    ? upcomingEntry.querySelector("title").childNodes[0].nodeValue
                    : "No information on the upcoming broadcast";

            if (upcomingTitle.innerText.length >= 33) upcomingTitle.classList.add("title-long");


            upcomingDesc.innerText =
                upcomingEntry
                    ? upcomingEntry.querySelector("synopsis").childNodes[0].nodeValue
                    : "The upcoming broadcast has no description.";
 
            if (diffMins > 1)
            {
                var upcomingTime = document.createElement("p");
                var strongTags = document.createElement("strong");
                strongTags.innerText = "This programme will air in " + diffMins + " minutes";
                upcomingTime.setAttribute("class", "upcoming-time");
                upcomingTime.appendChild(strongTags);
                upcomingDesc.parentNode.insertBefore(upcomingTime, upcomingDesc.nextSibling);
            }

            programmeTitle.innerText =
                entry
                    ? entry.querySelector("title").childNodes[0].nodeValue
                    : "No information on the current broadcast";


            programmeDesc.innerText =
                entry
                    ? entry.querySelector("synopsis").childNodes[0].nodeValue
                    : "This broadcast has no description.";


            if (entry && entry.querySelector("images > image"))
            {
                var programmeThumb = entry.querySelector("images > image").textContent;
                if (programmeThumb.includes("http") && !programmeThumb.includes("https"))
                {
                    programmeThumb = programmeThumb.replace("http", "https");
                }
                var featuredImgContainer = document.createElement("div");
                featuredImgContainer.setAttribute("class", "featured-img");
                var featuredImg = document.createElement("img");
                featuredImg.setAttribute("src", programmeThumb);
                programmeTitle.parentNode.insertBefore(featuredImgContainer, programmeTitle);
                featuredImgContainer.appendChild(featuredImg);
            }
            if (upcomingEntry && upcomingEntry.querySelector("images > image"))
            {
                var programmeThumb = upcomingEntry.querySelector("images > image").textContent;
                if (programmeThumb.includes("http") && !programmeThumb.includes("https"))
                {
                    programeThumb = programmeThumb.replace("http", "https");
                }
                var featuredImgContainer = document.createElement("div");
                featuredImgContainer.setAttribute("class", "featured-img");
                var featuredImg = document.createElement("img");
                featuredImg.setAttribute("src", programmeThumb);
                upcomingTitle.parentNode.insertBefore(featuredImgContainer, upcomingTitle);
                featuredImgContainer.appendChild(featuredImg);
            }

        }

        function matchTitleHeights()
        {
            var titleHeights = [];
            
            document.querySelectorAll(".programme-title, .upcoming-title")
                .forEach(function(element)
                {
                    titleHeights.push(window.getComputedStyle(element, false).getPropertyValue("height"));
                });

            var i = 0, titleArray = titleHeights.length;

            for (i = 0; i < titleArray; i++) {
                titleHeights[i] = titleHeights[i].replace("px", "");
            }

            var maxTitleHeight = (Math.max.apply(Math, titleHeights)) + "px";

            document.querySelectorAll(".programme-title, .upcoming-title")
                .forEach(function(element)
                {
                    element.style["height"] = maxTitleHeight;
                });

        }


            loadBlocks();
            matchTitleHeights();
            window.addEventListener("resize", matchTitleHeights);
    }
}
