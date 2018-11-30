window.onload = init();

function init()
{
    loadApp = new Radio();
    loadApp.boot();
}

function Radio()
{
    var self = this;

	Element.prototype.remove = function()
	{
		this.parentElement.removeChild(this);
	};

    self.getStyle = function(elem, prop)
    {
        var elemStyles = window.getComputedStyle(elem);
        return elemStyles.getPropertyValue(prop) || false;
    };

    self.boot = function()
    {

        function loadBlocks()
        {
            var date = new Date();
            var tz = date.getTimezoneOffset() * 1000;
            var currentTime = date.getTime();
            var currentDay = date.getDay();
            var xhr = new XMLHttpRequest();
            var shouldContinue = true;

            xhr.onload = function () {
                if (this.status === 404)
                {
                    var currentSidebar = document.querySelector(".info-container"),
                        upcomingSidebar = document.querySelector(".upcoming-sidebar"),
                        upcomingList = document.querySelector(".list-upcoming"),
                        serviceDownModal = document.querySelector("#service-down-modal");

                    currentSidebar.style.display = "none";
                    upcomingSidebar.style.display = "none";
                    upcomingList.style.display = "none";

                    serviceDownModal.classList.add("show");

                    shouldContinue = false;
                }
            };

            xhr.overrideMimeType("text/html");
            xhr.open("GET", "https://www.bbc.co.uk/schedules/p00fzl7j", false);
            xhr.setRequestHeader("Cache-Control", "private, " + (60 * 60 * 24));
            xhr.send(null);

            if (!shouldContinue)
            {
                return;            
            }

            const response = xhr.responseText,
                  parser = new DOMParser();

            const html = parser.parseFromString(response, "text/html");

            const entries = html.querySelectorAll('.highlight-box-wrapper li');

            if (Array.from(entries).length < 1)
            {
                return;
            }

            const activeProgrammes = Array.from(entries).filter((entry, index) => {
                const entryTimeElem = entry.querySelector('.broadcast__time');
                const entryDate = new Date(entryTimeElem.getAttribute('content'));
                const entryTime = entryDate.getTime();
                const programmeDay = entryDate.getDay();
                const nextEntry = entries[index + 1];

                if (typeof nextEntry === 'undefined')
                {
                    return false;
                }

                const nextEntryTimeElem = nextEntry.querySelector('.broadcast__time');
                const endTime = new Date(nextEntryTimeElem.getAttribute('content')).getTime();

                return currentDay === programmeDay && endTime > currentTime;
            });
            
            const currentEntry = activeProgrammes[0];

            const upcomingEntry = activeProgrammes[1]; 

            var upcomingTitle = document.querySelector(".upcoming-title"),
                upcomingDesc = document.querySelector(".upcoming-desc"),
                programmeTitle = document.querySelector(".programme-title"),
                programmeDesc = document.querySelector(".programme-desc");

            const remainingMs = (new Date(upcomingEntry.querySelector(".broadcast__time").getAttribute("content")).getTime() + tz) - (new Date().getTime() + tz);
            const diffMins = Math.round(((remainingMs % 86400000 % 3600000)) / 60000);

            function interimModal()
            {
                var modal = document.querySelector("#interim-modal").classList.add("show");
                document.querySelectorAll(".info-container, .upcoming-sidebar, .list-upcoming")
                .forEach(function(element)
                {
                    element.classList.add("hide");
                });
            }

            function setListHeight()
            {
				var upcomingList = document.getElementsByClassName('list-upcoming')[0],
					upcomingTime = document.getElementsByClassName('upcoming-time')[0],
					listHeight = (document.getElementsByClassName('info-container')[0]).offsetHeight,
					listMarginTop = self.getStyle(document.getElementsByClassName('info-container')[0], 'margin-top'),
					upcomingTimeMarginTop = self.getStyle(upcomingTime, 'margin-top');

                upcomingList.style['marginTop'] = parseInt(listHeight) + parseInt(listMarginTop.replace('px', '')) + 'px';
				(upcomingList.querySelector('p')).style['marginTop'] = upcomingTimeMarginTop;

				if (window.innerHeight < 595)
				{
					upcomingListPara = upcomingList.querySelector('p');
					upcomingListPara.style.removeProperty('margin-top');
					upcomingList.style['marginTop'] = ( parseInt( upcomingList.style['marginTop'].replace('px', '') ) - 30 ) + 'px';
				}

                upcomingList.style['marginLeft'] = self.getStyle(document.getElementsByClassName('info-container')[0], 'margin-left');
            }

            setListHeight();
            window.addEventListener("resize", setListHeight);

            function populateListContent(activeProgrammes)
            {
                const availability = upcomingEntry.querySelector(".broadcast__time").getAttribute("content");
                var startTime = new Date(availability).getTime() + tz;

                let futureProgrammes = activeProgrammes.filter(activeProgramme => {
                    let programmeStartTime = new Date(activeProgramme.querySelector(".broadcast__time").getAttribute("content"));
                    return (programmeStartTime.getTime() + tz) > startTime && programmeStartTime.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0);
                });

                if (!futureProgrammes.length) return;

                let futureProgrammesList = "<ul>\n";

                futureProgrammes.forEach(function(element)
                {
					let futureItem = "<li><ul>\n";
					let broadcastTime = element.querySelector(".broadcast__time").getAttribute("content");
                    var programmeTitle = element.querySelector(".programme__titles").textContent;

                    if (element.querySelector(".programme__subtitle"))
                    {
                        programmeTitle += ("<br />" + element.querySelector(".programme__subtitle").innerText);
                    }

                    futureItem += ("<li>" + programmeTitle + "<br />" + element.querySelector(".programme__synopsis").innerText + "</li>\n");
					futureItem += ("<li>Broadcast Time: " + new Date(broadcastTime) + "</li>\n");
					futureItem += "</ul></li>\n";
                    futureProgrammesList += futureItem;
                });

                futureProgrammesList += "</ul>";

                document.querySelector("#scheduled-list-modal .modal-inner").innerHTML += futureProgrammesList;

            }

            populateListContent(activeProgrammes);

			function removeListDuplicates()
			{
				var modalList = document.querySelector("#scheduled-list-modal .modal-inner ul"),
					nestedList = modalList.querySelectorAll("ul");
					duplicates = [];

				Array.from(nestedList).forEach(function(listItem, index)
				{
					var listItem = listItem.querySelectorAll("li");

					Array.from(listItem).forEach(function(nestedItem)
					{
						if ( duplicates.indexOf(nestedItem.textContent) > -1 )
						{
							nestedList[index].removeChild(nestedItem);
						}

						else
						{
							duplicates.push(nestedItem.textContent);
						}

					});


				});

			}

            //removeListDuplicates();

            if (diffMins <= 1) interimModal();

            if (upcomingEntry.querySelector('.programme__titles').textContent && typeof upcomingEntry.querySelector('.programme__subtitle') !== undefined) {
                upcomingTitle.innerText = `${upcomingEntry.querySelector('.programme__titles').textContent}\n${upcomingEntry.querySelector('.programme__subtitle').innerText}`;
            } else if (upcomingEntry.querySelector('.programme__titles').textContent) {
                upcomingTitle.innerText = `${upcomingEntry.querySelector('.programme__titles').textContent}`;
            } else {
                upcomingTitle.innerText = 'No information on the upcoming broadcast';
            }

            if (upcomingTitle.innerText.length >= 63)
            {
                upcomingTitle.classList.add("title-long")
                upcomingTitle.setAttribute("title", upcomingTitle.innerText);
            };

            upcomingDesc.innerText =
                upcomingEntry
                    ? upcomingEntry.querySelector(".programme__synopsis").innerText
                    : "The upcoming broadcast has no description.";
 
            if (diffMins > 1)
            {
                var upcomingTime = document.querySelector("p.upcoming-time");
                var strongTags = document.createElement("strong");
                strongTags.innerText = "This programme will air in " + diffMins + " minutes";
                upcomingTime.appendChild(strongTags);
            }

            if (currentEntry.querySelector('.programme__titles').textContent && currentEntry.querySelector('.programme__subtitle') !== null) {
                programmeTitle.innerText = `${currentEntry.querySelector('.programme__titles').textContent}\n${currentEntry.querySelector('.programme__subtitle').textContent}`;
            } else if (currentEntry.querySelector('.programme__titles').textContent) {
                programmeTitle.innerText = `${currentEntry.querySelector('.programme__titles').textContent}`;
            } else {
                programmeTitle.innerText = 'No information on the current broadcast';
            }

            if (programmeTitle.innerText.length >= 43)
            {
                programmeTitle.classList.add("title-long")
                programmeTitle.setAttribute("title", programmeTitle.innerText);
            };


            programmeDesc.innerText =
                currentEntry
                    ? currentEntry.querySelector(".programme__synopsis").innerText
                    : "This broadcast has no description.";

			if (programmeDesc.innerText.length >= 87)
			{
				programmeDesc.classList.add('title-long');
				programmeDesc.setAttribute('title', programmeDesc.innerText);
			}

            if (currentEntry && currentEntry.querySelector(".programme__img"))
            {
                var currentProgrammeImg;

                if (currentEntry.querySelector(".programme__img > img") !== null) {
                    currentProgrammeImg = currentEntry.querySelector(".programme__img > img");    
                } else if (currentEntry.querySelector(".programme__img img") !== null) {
                    currentProgrammeImg = currentEntry.querySelector(".programme__img img");    
                } else {
                    return;
                }

                var programmeThumbSrcset = currentProgrammeImg.dataset.srcset.split(",");
                var programmeThumb = programmeThumbSrcset.slice(-1)[0];
                programmeThumb = String(programmeThumb).trim();
                programmeThumb = programmeThumb.match(/http(s)?:[/]{2,}(.*)\.jpg/g);

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
            if (upcomingEntry && upcomingEntry.querySelector(".programme__img"))
            {
                var upcomingProgrammeImg;

                if (upcomingEntry.querySelector(".programme__img > img") !== null) {
                    upcomingProgrammeImg = upcomingEntry.querySelector(".programme__img > img");    
                } else if (upcomingEntry.querySelector(".programme__img img") !== null) {
                    upcomingProgrammeImg = upcomingEntry.querySelector(".programme__img img");    
                } else {
                    return;
                }

                var programmeThumbSrcset = upcomingProgrammeImg.dataset.srcset.split(",");
                var programmeThumb = programmeThumbSrcset.slice(-1)[0];
                programmeThumb = String(programmeThumb).trim();
                programmeThumb = programmeThumb.match(/http(s)?:[/]{2,}(.*)\.jpg/g);

                if (programmeThumb.includes("http") && !programmeThumb.includes("https"))
                {
                    programmeThumb = programmeThumb.replace("http", "https");
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
					element.style.removeProperty('height');
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

        function upcomingModal(event)
        {
            event.preventDefault();
            let modalID = this.dataset.modal;
            let upcomingModal = document.getElementById(modalID);
            if (!upcomingModal.classList.contains("show"))
            {
                upcomingModal.classList.add("show");
            }
        }


            loadBlocks();
            matchTitleHeights();
            window.addEventListener("resize", matchTitleHeights);
            let modalBtn = document.querySelector(".modal-btn");
            modalBtn.addEventListener("click", upcomingModal);
			let modalClose = document.querySelector(".modal-close");
			modalClose.addEventListener("click", function(){
				if (!this.parentNode.classList.contains("modal-inner")) return;
				let modalInner = this.parentNode;
				if (!modalInner.parentNode.classList.contains("base-modal")) return;
				let parentModal = modalInner.parentNode;
				if (parentModal.classList.contains("show"))
				{
					parentModal.classList.remove("show");
				}
			});

            
    }
}
