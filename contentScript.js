(() => {
    const isValidSlug = (prof, link) => {
        const baseUrl = 'https://planetterp.com/api/v1/' + link;

        const queryParams = {
            name: prof,
            reviews: true,
        };

        const queryString = new URLSearchParams(queryParams).toString();
        const urlWithParams = baseUrl + "?" + queryString;

        fetch(urlWithParams)
            .then(response => {
                if(!response.ok) {
                    console.error("HTTP error! Status: ${response.status}");
                    return false;
                }
                return response.json();
            })
            .then(data => {
                console.log('Professor data:', data);
                return true;
            })
            .catch(error => {
                console.error('Fetch error:', error);
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
        if(type == "course") {
            anchorElem.href = "https://planetterp.com/" + type + "/" + subdir.textContent;
        } else {
            anchorElem.href = "https://planetterp.com/" + type + "/" + swapWords(subdir.textContent);
        }

        anchorElem.target = "_blank";
        anchorElem.className = "reviews-btn";
        anchorElem.title = "View student reviews/details";
        console.log(anchorElem.href);

        const imgElem = document.createElement("img");
        imgElem.src = chrome.runtime.getURL("assets/logo.png");
        imgElem.alt = "PlanetTerp";
        (type == "course") ? (imgElem.style.width = "40%") : (imgElem.style.width = "7%", imgElem.style.paddingRight = "3px");

        // Adds listener to check for professor type #2 professor query


        anchorElem.appendChild(imgElem);
        (type == "course") ? (subdir.appendChild(anchorElem)) : (subdir.parentNode.insertBefore(anchorElem, subdir));
    };

    /* Insert professor links */
    const setProfLinks = (thisCourse) => {
        console.log(thisCourse);
        sectionProfs = document.getElementById(thisCourse).getElementsByClassName("section-instructor");
        console.log(sectionProfs.length);

        // Per instructor
        for(let j = 0; j < sectionProfs.length; j++) {
            console.log(sectionProfs[j].textContent);
            setLink(sectionProfs[j], "professor");
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
            sectionToggle = thisCourse.getElementsByClassName("toggle-sections-link")[0];
            notExpanded = (thisCourse.getElementsByClassName("section-instructor").length > 0) ? false : true;
            console.log(sectionToggle);
            if(sectionToggle && notExpanded) {
                (function(name) {
                    sectionToggle.addEventListener("click", () => {
                        console.log("Clicked section button!");
                        setTimeout(setProfLinks, 250, name);
                    }, {once: true});
                })(courseId.textContent);
            }

            // Initial instructor links (if already expanded)
            setProfLinks(courseId.textContent);
        }
    });
})();