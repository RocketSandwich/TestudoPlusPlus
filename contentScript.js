(() => {
    /* Rearranging instructor name for query */
    const swapWords = (professor) => {
        const words = professor.split(' ');
        [words[0], words[1]] = [words[1], words[0]];
        const resultString = words.join('_');
        return resultString;
    }

    /* Injects PT link */
    const setPTLink = (subdir, type) => {
        const name = subdir.textContent;
        const PTLink = document.createElement("a");
        if(type == "course") {
            PTLink.href = "https://planetterp.com/" + type + "/" + name;
        } else {
            PTLink.href = "https://planetterp.com/" + type + "/" + swapWords(name);
        }

        PTLink.target = "_blank";
        PTLink.className = "ptreviews-btn";
        PTLink.title = "PlanetTerp Reviews";

        const imgElem = document.createElement("img");
        imgElem.src = chrome.runtime.getURL("assets/PT_logo.png");
        imgElem.alt = "PlanetTerp";
        (type == "course") ? (imgElem.style.width = "40%") : (imgElem.style.width = "7%", imgElem.style.paddingRight = "5px");

        PTLink.addEventListener('mouseover', () => {imgElem.style.filter = 'grayscale(50%)'});
        PTLink.addEventListener('mouseout', () => {imgElem.style.filter = 'grayscale(0%)'});
        PTLink.appendChild(imgElem);
        (type == "course") ? (subdir.appendChild(PTLink)) : (subdir.parentNode.insertBefore(PTLink, subdir));
    };

    /* Injects RMP link */
    const setRMPLink = (subdir) => {
        const name = subdir.textContent;
        const RMPLink = document.createElement("a");
        RMPLink.href = "https://www.ratemyprofessors.com/search/professors/1270?q=" + encodeURIComponent(name);
    
        RMPLink.target = "_blank";
        RMPLink.className = "rmpreviews-btn";
        RMPLink.title = "RateMyProfessor Reviews";

        const imgElem = document.createElement("img");
        imgElem.src = chrome.runtime.getURL("assets/RMP_logo.png");
        imgElem.alt = "ratemyprofessors";
        imgElem.style.width = "9%";
        imgElem.style.paddingRight = "5px";

        RMPLink.addEventListener('mouseover', () => {imgElem.style.filter = 'grayscale(65%)'});
        RMPLink.addEventListener('mouseout', () => {imgElem.style.filter = 'grayscale(0%)'});
        RMPLink.appendChild(imgElem);
        subdir.parentNode.insertBefore(RMPLink, subdir);
    };

    /* Injects break tag */
    const setBreak = (elem) => {
        const RMPLink = document.createElement("br");
        elem.parentNode.insertBefore(RMPLink, elem);
    };

    /* Insert professor links */
    const setProfLinks = (thisCourse) => {
        // Gets *updated* element
        sections = document.getElementById(thisCourse).getElementsByClassName("section-instructors");

        // Per section
        for(let i = 0; i < sections.length; i++) {
            sectionProfs = sections[i].getElementsByClassName("section-instructor");

            // Per section professor (co-teaching)
            for(let j = 0; j < sectionProfs.length; j++) {
                if(j > 0) {
                    setBreak(sectionProfs[j]);
                }
                setPTLink(sectionProfs[j], "professor");
                setRMPLink(sectionProfs[j]);
            }
        }
    };

    /* User clicks "show all sections" button */
    const allSectionsExpandBtn = (courses) => {

        fn = (crses) => {
            // Per course
            for(let i = 0; i < crses.length; i++) {
                thisCourse = crses[i];
                courseId = thisCourse.getElementsByClassName("course-id")[0];
                hasLinks = thisCourse.getElementsByClassName("rmpreviews-btn").length > 0;
                if(!hasLinks) {
                    setProfLinks(courseId.textContent);
                }
            }
        };
        
        sectionsBtn = document.getElementById("show-all-sections-button");
        sectionsBtn.addEventListener("click", () => {
            setTimeout(fn, 600, courses);
        }, {once: true});
    };

    /* Fetches data for corresponding course */
    const fetchReviewsData = (courseName) => {
        fetch("https://planetterp.com/api/v1/course?name=" + courseName + "&reviews=true")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error("Error during fetch operation:", error);
        });
    };

    /* Finds right place to inject content on page */
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        /*
         * Due to the inconsistent nature of the planetterp professor queries, 2 URL's must be tested
         *   - The general rule is usually 'lastName_firstName'
         *   - If there are 2+ profs w/ same first name, then only query by 'lastName' (but this is still not 100% consistent)
         * If the former returns w/ 404 err, then use the other
         *   - CORS policy prevents cross-domain calls unfortunately, so we're unable to fetch response (security; XSS prevention)
         *   - Even w/ mode: 'no-cors', status response msgs are rejected by the server and we're unable to detect err resp status'
         * Solutions
         *   - YQL bot? (extra yahoo dependency)
         *   - ✓✓ html parse to find 404 err + load double webpage (DOM dependency)
         */
        if(obj.webpage === 'planetterp') {
            fourZeroFour = (document.getElementById("content").getElementsByClassName("py-4").length > 0);
            if(fourZeroFour) {
                window.open('https://planetterp.com/professor/' + obj.name, "_self");
            }
        } else if(obj.webpage === 'ratemyprofessors') {
            teachers = document.getElementsByClassName("TeacherCard__StyledTeacherCard-syjs0d-0");
            if(teachers.length == 1 && teachers[0].getElementsByClassName("CardSchool__School-sc-19lmz2k-1")[0].textContent === "University of Maryland") {
                window.open(teachers[0].href, "_self");
            }
        } else if(obj.webpage === 'testudo') {
            courses = document.getElementsByClassName("course");
            allSectionsExpandBtn(courses);

            // Per course
            for(let i = 0; i < courses.length; i++) {
                thisCourse = courses[i];
                infoContainer = thisCourse.getElementsByClassName("course-info-container")[0];
                courseId = thisCourse.getElementsByClassName("course-id")[0];
                expanded = thisCourse.getElementsByClassName("section-instructor").length > 0;
                
                // Establishing course links
                setPTLink(courseId, "course");

                // Establishing initial instructor links
                if(expanded) {
                    setProfLinks(courseId.textContent);
                }

                // Establishing event listeners for section toggle
                hasSections = thisCourse.getElementsByClassName("toggle-sections-link")[0];
                hasLinks = thisCourse.getElementsByClassName("rmpreviews-btn").length > 0;
                if(hasSections && !hasLinks) {
                    (function(name) {
                        hasSections.addEventListener("click", () => {
                            console.log("Clicked section button!");
                            /*
                             * Redundant !hasLinks check is necessary b/c link status may have changed
                             * within interval of when eventListener was established and when it is triggered 
                             */
                            hasLinks2 = document.getElementById(name).getElementsByClassName("rmpreviews-btn").length > 0;
                            if(!hasLinks2) {
                                setTimeout(setProfLinks, 500, name);
                            }
                        }, {once: true});
                    })(courseId.textContent);
                }

                // Establishing in-screen reviews
                // setReviews(thisCourse);
                const courseReviewsContainer = document.createElement("div");
                courseReviewsContainer.className = "course-reviews-container";
                courseReviewsContainer.style.paddingTop = "5px";
                // courseReviewsContainer.style.border = "1px solid lightgrey";
                // courseReviewsContainer.style.borderRadius = "4px";

                const courseReviewsFieldset = document.createElement("fieldset");
                courseReviewsFieldset.className = "course-reviews-fieldset";
                courseReviewsFieldset.style.border = "1px solid #ddd";
                // courseReviewsFieldset.style.paddingLeft = "15px";
                // courseReviewsFieldset.style.paddingRight = "15px";
                courseReviewsFieldset.style.padding = "13px";
                courseReviewsFieldset.style.marginLeft = "-15px";
                courseReviewsFieldset.style.borderRadius = "4px";
                courseReviewsFieldset.style.maxWidth = "823px";

                const legend = document.createElement("legend");
                legend.style.paddingRight = "4px";
                legend.style.paddingLeft = "3px";

                const courseReviewsToggleBtn = document.createElement("a");
                courseReviewsToggleBtn.className = "course-reviews-toggle-btn";
                courseReviewsToggleBtn.title = "View student reviews in-screen";
                courseReviewsToggleBtn.style.color = "#A81919";
                courseReviewsToggleBtn.style.cursor = "pointer";
                // courseReviewsToggleBtn.style.paddingBottom = "3px";
                courseReviewsToggleBtn.style.display = "block";
                courseReviewsToggleBtn.style.userSelect = "none";

                const arrowIcon2 = document.createElement("img");
                arrowIcon2.src = chrome.runtime.getURL("assets/dropdown_triangle_icon2.png");
                arrowIcon2.style.width = "6px";
                arrowIcon2.style.height = "9px";
                arrowIcon2.style.paddingRight = "4px";
                // arrowIcon2.style.paddingLeft = "1px";
                const arrowIcon1 = document.createElement("img");
                arrowIcon1.src = chrome.runtime.getURL("assets/dropdown_triangle_icon1.png");
                arrowIcon1.width = 9;
                arrowIcon1.style.paddingRight = "3px";
                arrowIcon1.style.paddingBottom = "2px";

                const toggleText = document.createElement("span");
                toggleText.textContent = "Show Reviews";
                courseReviewsToggleBtn.addEventListener('click', () => {
                    if(toggleText.textContent === "Show Reviews") {
                        courseReviewsToggleBtn.replaceChild(arrowIcon1, arrowIcon2);
                        toggleText.textContent = "Hide Reviews";
                    } else {
                        courseReviewsToggleBtn.replaceChild(arrowIcon2, arrowIcon1);
                        toggleText.textContent = "Show Reviews";
                    }
                });

                // if(courseId.textContent === "CMSC131") {
                //     fetchReviewsData(courseId.textContent);
                // }
                const courseReviewsBody = document.createElement("div"); //fetchReviewsData();
                courseReviewsBody.className = "course-reviews-body";
                courseReviewsBody.style.padding = "9px";
                courseReviewsBody.style.paddingTop = "5px";
                courseReviewsBody.style.paddingBottom = "5px";
                courseReviewsBody.style.border = "1px solid #eee";
                courseReviewsBody.style.borderRadius = "4px";
                courseReviewsBody.style.maxWidth = "auto";//"802px";
                courseReviewsBody.style.marginTop = "-9px";

                const courseReviewsBodyContent = document.createElement("div");
                courseReviewsBodyContent.className = "course-reviews-body-content";
                courseReviewsBodyContent.textContent = "Reviews, reviews, and more reviews";

                courseReviewsBody.appendChild(courseReviewsBodyContent);
                courseReviewsToggleBtn.appendChild(arrowIcon2);
                courseReviewsToggleBtn.appendChild(toggleText);
                legend.appendChild(courseReviewsToggleBtn);
                courseReviewsFieldset.appendChild(legend);
                courseReviewsFieldset.appendChild(courseReviewsBody);
                courseReviewsContainer.appendChild(courseReviewsFieldset);
                infoContainer.appendChild(courseReviewsContainer);
            }
        }
    });
})();