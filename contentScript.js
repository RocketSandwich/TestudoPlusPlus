(() => {
    function checkLinkValidity(link) {
        fetch(link, { method: 'HEAD' })
            .then(response => {
                if(response.ok) {
                    console.log(`Link ${link} is valid.`);
                    return true;
                } else {
                    console.error(`Link ${link} returned a ${response.status} status. This might be a 404 Page Not Found.`);
                    return false;
                }
            })
            .catch(error => {
                console.error(`Error checking link ${link}: ${error.message}`);
                // Note: Some professor queries are listed either with "last_first" or just "last"
                // (usually if 2+ profs have same first name, just uses last, but not always) 
                // 1st - Attempts "last_first"; 2nd - Attempts "last"
                return false;
            });
        }

    /* Rearranging instructor name for query */
    const swapWords = (professor) => {
        const words = professor.split(' ');
        [words[0], words[1]] = [words[1], words[0]];
        const resultString = words.join('_');
        console.log(resultString)
        return resultString;
    }

    /* Injects icon link */
    const setLink = (subdir, type) => {
        const anchorElem = document.createElement("a");
        (type == "course") ? (anchorElem.href = "https://planetterp.com/" + type + "/" + subdir.textContent) : (anchorElem.href = "https://planetterp.com/" + type + "/" + swapWords(subdir.textContent));
        anchorElem.target = "_blank";
        anchorElem.className = "reviews-btn";
        anchorElem.title = "View student reviews/details";
        console.log(anchorElem.href);

        const imgElem = document.createElement("img");
        imgElem.src = chrome.runtime.getURL("assets/logo.png");
        imgElem.alt = "PlanetTerp";
        (type == "course") ? (imgElem.style.width = "40%") : (imgElem.style.width = "7%", imgElem.style.paddingRight = "3px");

        anchorElem.appendChild(imgElem);
        (type == "course") ? (subdir.appendChild(anchorElem)) : (subdir.parentNode.insertBefore(anchorElem, subdir));

        // anchorElem.addEventListener("click", () => {
            // if(!checkLinkValidity(anchorElem.href) && type == "professor") {
                // anchorElem.href = "https://planetterp.com/" + type + "/" + subdir.textContent.split(" ")[1];
                // Open 2nd link
            // }
        // });
    };

    /* Insert professor links */
    const setProfLinks = (thisCourse) => {
        hasSections = thisCourse.getElementsByClassName("sections-displayed");
        if(hasSections.length > 0) {
            sectionProfs = thisCourse.getElementsByClassName("section-instructor");

            // Per instructor
            for(let j = 0; j < sectionProfs.length; j++) {
                setLink(sectionProfs[j], "professor");
            }
        }
    };

    /* Finds right place to inject content on page */
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        courses = document.getElementsByClassName("course");

        // Per course
        for(let i = 0; i < courses.length; i++) {
            thisCourse = courses[i];
            courseId = thisCourse.getElementsByClassName("course-id")[0];
            setLink(courseId, "course");

            // Establishing event listeners for section toggle
            // I feel like I over-complicated this; I could've just plain inserted it since its already hidden
            sectionToggle = thisCourse.getElementsByClassName("toggle-sections-link")[0];
            console.log(sectionToggle);
            sectionToggle.addEventListener("click", () => {
                setProfLinks(thisCourse);
            });

            // Initial instructor links
            setProfLinks(thisCourse);
        }
    });
})();