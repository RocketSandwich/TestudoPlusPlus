(() => {
    /* Rearranging instructor name for query */
    const swapWords = (professor) => {
        const words = professor.split(' ');
        [words[0], words[1]] = [words[1], words[0]];
        const resultString = words.join('_');
        return resultString;
    }

    /* Injects icon link */
    const setLink = (subdir, type) => {
        const name = subdir.textContent;
        const anchorElem = document.createElement("a");
        if(type == "course") {
            anchorElem.href = "https://planetterp.com/" + type + "/" + name;
        } else {
            anchorElem.href = "https://planetterp.com/" + type + "/" + swapWords(name);
        }

        anchorElem.target = "_blank";
        anchorElem.className = "reviews-btn";
        anchorElem.title = "View student reviews/details";

        const imgElem = document.createElement("img");
        imgElem.src = chrome.runtime.getURL("assets/logo.png");
        imgElem.alt = "PlanetTerp";
        (type == "course") ? (imgElem.style.width = "40%") : (imgElem.style.width = "7%", imgElem.style.paddingRight = "3px");

        anchorElem.appendChild(imgElem);
        (type == "course") ? (subdir.appendChild(anchorElem)) : (subdir.parentNode.insertBefore(anchorElem, subdir));
    };

    /* Insert professor links */
    const setProfLinks = (thisCourse) => {
        sectionProfs = document.getElementById(thisCourse).getElementsByClassName("section-instructor");

        // Per instructor
        for(let j = 0; j < sectionProfs.length; j++) {
            setLink(sectionProfs[j], "professor");
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
        } else {
            courses = document.getElementsByClassName("course");

            // Per course
            for(let i = 0; i < courses.length; i++) {
                thisCourse = courses[i];
                courseId = thisCourse.getElementsByClassName("course-id")[0];
                setLink(courseId, "course");

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