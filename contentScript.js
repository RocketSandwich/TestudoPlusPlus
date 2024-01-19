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
        PTLink.className = "reviews-btn";
        PTLink.title = "View student reviews/details";

        const imgElem = document.createElement("img");
        imgElem.src = chrome.runtime.getURL("assets/PT_logo.png");
        imgElem.alt = "PlanetTerp";
        (type == "course") ? (imgElem.style.width = "40%") : (imgElem.style.width = "7%", imgElem.style.paddingRight = "5px");

        PTLink.appendChild(imgElem);
        (type == "course") ? (subdir.appendChild(PTLink)) : (subdir.parentNode.insertBefore(PTLink, subdir));
    };

    /* Injects RMP link */
    const setRMPLink = (subdir) => {
        const name = subdir.textContent;
        const RMPLink = document.createElement("a");
        RMPLink.href = "https://www.ratemyprofessors.com/search/professors/1270?q=" + encodeURIComponent(name);
    
        RMPLink.target = "_blank";
        RMPLink.className = "reviews-btn";
        RMPLink.title = "View student reviews/details";

        const imgElem = document.createElement("img");
        imgElem.src = chrome.runtime.getURL("assets/RMP_logo.png");
        imgElem.alt = "ratemyprofessors";
        imgElem.style.width = "9%";
        imgElem.style.paddingRight = "5px";

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
         *   - ✓✓ load double webpage + html parse to find 404 err (plain-text dependency)
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

            // Per course
            for(let i = 0; i < courses.length; i++) {
                thisCourse = courses[i];
                courseId = thisCourse.getElementsByClassName("course-id")[0];
                setPTLink(courseId, "course");

                // Establishing event listeners for section toggle
                sectionToggle = thisCourse.getElementsByClassName("toggle-sections-link")[0];
                notExpanded = !(thisCourse.getElementsByClassName("section-instructor").length > 0);
                if(sectionToggle && notExpanded) {
                    (function(name) {
                        sectionToggle.addEventListener("click", () => {
                            // console.log("Clicked section button!");
                            setTimeout(setProfLinks, 500, name);
                        }, {once: true});
                    })(courseId.textContent);
                }

                // Initial instructor links (if already expanded)
                setProfLinks(courseId.textContent);
            }
        }
    });
})();