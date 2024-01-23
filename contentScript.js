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
        imgElem.className = "pt-img";
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
        imgElem.className = "rmp-img";
        imgElem.alt = "ratemyprofessors";

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
    const fetchReviewsData = async (courseName) => {
        try {
            const response = await fetch("https://planetterp.com/api/v1/course?name=" + courseName + "&reviews=true");
    
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
    
            const data = await response.json();
            console.log(data); 
            return data;
        } catch (error) {
            console.log("Error during fetch:", error);
            return undefined;
            // throw error; 
        }
    };

    /* Get Instructor Name Width */
    const getWidth = (event) => {

        // Super janky way of dynamically adjusting drop-down box size
        span = document.createElement('span');
        span.style.visibility = 'hidden';
        span.style.position = 'absolute';
        document.body.appendChild(span);
        span.textContent = event.value;
        w = Math.ceil(getComputedStyle(span).width.split("px")[0]) + 30;
        document.body.removeChild(span);

        return w;
    };

    /* Testing fetch native */
    const fetchSections = async (courseName, urlParams) => {
        try {
            // course = document.getElementById(courseName);
            // sectionsLink = course.getElementsByClassName("toggle-sections-link")[0];
            // ^^ Weirdly, sometimes the sections href link doesn't work, so going to manually fetch search query
            const response = await fetch("/soc/search?courseId=" + courseName + "&sectionId=&termId=" + urlParams.termId + "&_openSectionsOnly=on&creditCompare=&credits=&genEdCode=ALL&courseLevelFilter=ALL&instructor=&_facetoface=on&_blended=on&_online=on&courseStartCompare=&courseStartHour=&courseStartMin=&courseStartAM=&courseEndHour=&courseEndMin=&courseEndAM=&teachingCenter=ALL&_classDay1=on&_classDay2=on&_classDay3=on&_classDay4=on&_classDay5=on");
             
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
    
            const htmlString = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');
            const prof = doc.getElementsByClassName("section-instructor");
            thisCourseProfs = new Set();
            for(let i = 0; i < prof.length; i++) {
                console.log(prof[i].textContent);
                thisCourseProfs.add(prof[i].textContent);
            }

            return thisCourseProfs;
        } catch (error) {
            console.log("Error during fetch:", error);
            return undefined;
            // throw error; 
        }
    };

    /* Sort By button behavior */
    const sortByClicked = (event) => {
        // course = document.getElementById(courseName);
        // btn = course.getElementsByClassName("course-reviews-sort-button interaction");
        btn = event.target;
        console.log(btn);
        btnValue = parseInt(btn.value, 10);
        console.log(btnValue);
        switch(btnValue % 3) {
            case 0:
                btn.textContent = "Most Critical";
                break;
            case 1:
                btn.textContent = "Most Favorable";
                break;
            case 2:
                btn.textContent = "Most Recent";
                break;
        }
        btnValue++;
        btn.value = btnValue;
        console.log(btn.value);
        // Honestly not going to account for overflow
    };

    /* Establishes native course reviews */
    const setNativeReviews = (courseId, infoContainer, urlParams) => {

        // Creating containers
        const courseReviewsContainer = document.createElement("div");
        courseReviewsContainer.className = "course-reviews-container";
        
        const courseReviewsFieldset = document.createElement("fieldset");
        courseReviewsFieldset.className = "course-reviews-fieldset";
        
        const legend = document.createElement("legend");
        legend.className = "course-reviews-header";

        const reviewsCriteria = document.createElement("div");
        reviewsCriteria.className = "reviews-criteria";

        const filterHeader = document.createElement("div");
        filterHeader.className = "course-reviews-filter-header label";
        filterHeader.textContent = "Filter By: ";

        const filterBy = document.createElement("select");
        filterBy.className = "course-reviews-filter-dropdown-menu interaction";

        const sortHeader = document.createElement("div");
        sortHeader.className = "course-reviews-sort-header label";
        sortHeader.textContent = "Sort By: ";

        const sortBy = document.createElement("button");
        sortBy.className = "course-reviews-sort-button interaction";
        sortBy.textContent = "Most Recent";
        sortBy.value = 0;
        sortBy.onclick = sortByClicked;

        const courseReviewsToggleBtn = document.createElement("a");
        courseReviewsToggleBtn.className = "course-reviews-toggle-btn";
        courseReviewsToggleBtn.title = "View student reviews in-screen";

        const arrowIcon2 = document.createElement("img");
        arrowIcon2.src = chrome.runtime.getURL("assets/dropdown_triangle_icon2.png");
        arrowIcon2.className = "right-arrow";
        const arrowIcon1 = document.createElement("img");
        arrowIcon1.src = chrome.runtime.getURL("assets/dropdown_triangle_icon1.png");
        arrowIcon1.className = "left-arrow";

        const toggleText = document.createElement("span");
        toggleText.textContent = "Show Reviews";

        // Add drop-down-menu here
        //   - Compares profs listed in curr sections and compares w/ profs listed in API resp
        //   - 2 Groups: "Current Instructors" & "Previous Instructors"
        //   - Get rid of duplicates
        //   - When professor is selected, filter by their reviews
        //   - + Make the 2 groups selectable to filter by "all current" & "all previous" instructors 

        const courseReviewsBody = document.createElement("div");
        courseReviewsBody.className = "course-reviews-body";

        // Joining containers appropriately
        courseReviewsToggleBtn.appendChild(arrowIcon2);
        courseReviewsToggleBtn.appendChild(toggleText);
        reviewsCriteria.appendChild(filterHeader);
        reviewsCriteria.appendChild(filterBy);
        reviewsCriteria.appendChild(sortHeader);
        reviewsCriteria.appendChild(sortBy);
        legend.appendChild(courseReviewsToggleBtn);
        legend.appendChild(reviewsCriteria);
        courseReviewsFieldset.appendChild(legend);
        courseReviewsFieldset.appendChild(courseReviewsBody);
        courseReviewsContainer.appendChild(courseReviewsFieldset);
        infoContainer.appendChild(courseReviewsContainer);

        // Immediately-invoked func expr (IIFE) used to retain "memory" link between correct button & course
        (function(courseName) {
            courseReviewsToggleBtn.addEventListener('click', async (event) => {

                const thisCourseProfs = await fetchSections(courseName, urlParams);

                // Prevents redundant PT API calls
                if(!legend.classList.contains("fetched")) {
                    legend.classList.add("fetched");

                    // "Loading" visual
                    const loading = document.createElement("img");
                    loading.src = chrome.runtime.getURL("assets/ajax-loader.gif");
                    loading.id = "loading";
                    loading.alt = "loading...";
                    event.target.parentNode.parentNode.appendChild(loading);

                    data = await fetchReviewsData(courseName);
                    matchingCourse = document.getElementById(courseName);
                    matchingCourseBody = matchingCourse.getElementsByClassName("course-reviews-body")[0];

                    if(data) {
                        reviews = data.reviews;
                        professors = new Set(data.professors);
                        // console.log(professors);

                        // Event listener for drop-down box
                        filterBy.addEventListener("input", (event) => {
                            event.target.style.maxWidth = getWidth(event.target) + "px";

                            // Edit reviews box to display only the requested professor(s)
                        });

                        // Adding professors to drop-down box
                        if(professors.size == 0) {
                            const profOption = document.createElement("option");
                            profOption.className = "professor-option";
                            profOption.textContent = "No professor reviews yet.";
                            profOption.disabled = true;
                            filterBy.appendChild(profOption);
                        } else {
                            const optGroup = document.createElement("optgroup");
                            optGroup.label = "Groups";

                            const allOptions = document.createElement("option");
                            allOptions.className = "professor-option";
                            allOptions.textContent = "All Instructors";
                            allOptions.value = "All Instructors";
                            allOptions.selected = true;

                            const currentOptions = document.createElement("option");
                            currentOptions.className = "professor-option";
                            currentOptions.textContent = "All Current Instructors";
                            currentOptions.value = "All Current Instructors";

                            const pastOptions = document.createElement("option");
                            pastOptions.className = "professor-option";
                            pastOptions.textContent = "All Past Instructors";
                            pastOptions.value = "All Past Instructors";

                            optGroup.appendChild(allOptions);
                            optGroup.appendChild(currentOptions);
                            optGroup.appendChild(pastOptions);

                            const optCurrent = document.createElement("optgroup");
                            optCurrent.label = "Current Instructors";

                            const optPast = document.createElement("optgroup");
                            optPast.label = "Past Instructors";

                            thisCourseProfs.forEach((value) => {
                                const profOption = document.createElement("option");
                                profOption.className = "professor-option";
                                profOption.textContent = value;
                                profOption.value = value;

                                optCurrent.appendChild(profOption);
                            });
                            
                            professors.forEach((value) => {
                                const profOption = document.createElement("option");
                                profOption.className = "professor-option";
                                profOption.textContent = value;
                                profOption.value = value;

                                if(!thisCourseProfs.has(value)) {
                                    optPast.appendChild(profOption);
                                }
                            });
                            
                            filterBy.appendChild(optGroup);
                            filterBy.appendChild(optCurrent);
                            filterBy.appendChild(optPast);
                        }

                        // Adding reviews to container body
                        if(reviews.length == 0) {
                            const courseReviewsBodyContent = document.createElement("div");
                            courseReviewsBodyContent.className = "course-reviews-body-content";
                            courseReviewsBodyContent.style.backgroundColor = "#eee";
                            courseReviewsBodyContent.textContent = "No course reviews yet. :(";
                            matchingCourseBody.appendChild(courseReviewsBodyContent);
                        } else {
                            for(let j = reviews.length - 1, k = 0; j >= 0; j--, k++) {
                                const courseReviewsBodyContent = document.createElement("div");
                                courseReviewsBodyContent.className = "course-reviews-body-content";
                                if(k % 2 == 0) {
                                    courseReviewsBodyContent.style.backgroundColor = "#eee";
                                }

                                const review = reviews[j];
                                const date = new Date(review.created);
                                const options = {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short'};
                                const readableDateString = date.toLocaleDateString('en-US', options);
                                grade = "";
                                (review.expected_grade == "") ? (grade = "?") : (grade = review.expected_grade);
                                const bodyContentHeader = document.createElement("div");
                                bodyContentHeader.className = "body-content-header";
                                bodyContentHeader.textContent = review.professor + " " + "★".repeat(review.rating) + "☆".repeat(5 - review.rating) + " | Expecting " + grade + " | " + readableDateString;
                                
                                const bodyContentBody = document.createElement("span");
                                bodyContentBody.textContent = review.review;

                                courseReviewsBodyContent.appendChild(bodyContentHeader);
                                courseReviewsBodyContent.appendChild(bodyContentBody);

                                /* Test Content */
                                // Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                // Eget mauris pharetra et ultrices neque ornare aenean. Auctor eu augue ut lectus arcu bibendum at varius vel. Duis at consectetur lorem donec massa sapien faucibus.
                                // Mauris sit amet massa vitae tortor condimentum lacinia quis vel. Lobortis elementum nibh tellus molestie nunc. Fermentum odio eu feugiat pretium nibh.
                                // Cursus euismod quis viverra nibh cras pulvinar mattis nunc sed. Amet tellus cras adipiscing enim. Pellentesque habitant morbi tristique senectus et netus et malesuada fames.
                                // Laoreet sit amet cursus sit amet dictum sit amet. Lorem ipsum dolor sit amet consectetur adipiscing. Nibh praesent tristique magna sit amet.
                                // Lectus mauris ultrices eros in cursus turpis massa. Eu feugiat pretium nibh ipsum. Sit amet consectetur adipiscing elit ut aliquam purus sit amet.
                                // Tempor orci eu lobortis elementum nibh tellus molestie nunc. Risus in hendrerit gravida rutrum quisque non tellus orci ac. Elit pellentesque habitant morbi tristique senectus et netus.
                                matchingCourseBody.appendChild(courseReviewsBodyContent);
                            }
                        }
                    } else {
                        const courseReviewsBodyContent = document.createElement("div");
                        courseReviewsBodyContent.className = "course-reviews-body-content";
                        courseReviewsBodyContent.style.backgroundColor = "#eee";
                        courseReviewsBodyContent.style.whiteSpace = "pre";
                        courseReviewsBodyContent.textContent = "No course reviews yet. :(\r\nPlanetTerp doesn't even have " + courseName + " registered.";
                        matchingCourseBody.appendChild(courseReviewsBodyContent);
                    }

                    matchingCourse = document.getElementById(courseName);
                    matchingCourseBody = matchingCourse.getElementsByClassName("course-reviews-body")[0];
                }

                childElements = reviewsCriteria.children;

                // Shrinking review box
                if(legend.classList.contains("active")) {
                    matchingCourse = document.getElementById(courseName);
                    matchingCourseBody = matchingCourse.getElementsByClassName("course-reviews-body")[0];

                    // reviewsCriteria.style.maxWidth = "0px";
                    for(let i = 0; i < childElements.length; i++) {
                        // childElements[i].style.display = "inline-block";
                        childElements[i].style.maxWidth = "0px";
                    }
                    
                    // for(let i = 0; i < childElements.length; i++) {
                    //     childElements[i].style.display = "none";
                    // }
                    courseReviewsBody.style.maxHeight = "0px";
                    legend.classList.toggle("active");
                    courseReviewsToggleBtn.replaceChild(arrowIcon2, arrowIcon1);
                    toggleText.textContent = "Show Reviews";
                    courseReviewsFieldset.style.transition = "padding-bottom 0.7s ease-in-out, padding-top 0.7s ease-in-out";
                    courseReviewsFieldset.style.paddingTop = "0px";
                    courseReviewsFieldset.style.paddingBottom = "0px";
                    courseReviewsBody.style.paddingTop = "0px";
                    courseReviewsBody.style.paddingBottom = "0px";
                // Expanding review box
                } else {
                    courseReviewsFieldset.style.display = "block";
                    courseReviewsFieldset.style.padding = "13px";
                    courseReviewsFieldset.style.border = "1px solid #ddd";
                    // reviewsCriteria.style.width = "200px";
                    // reviewsCriteria.children.style.width = "200px";
                    for(let i = 0; i < childElements.length; i++) {
                        console.log(childElements[i]);
                        if(childElements[i].className === "course-reviews-filter-dropdown-menu interaction") {
                            console.log(childElements[i].className);
                            childElements[i].style.maxWidth = getWidth(childElements[i]) + "px";
                        } else {
                            childElements[i].style.maxWidth = "120px";
                        }
                    }
                    // for(let i = 0; i < childElements.length; i++) {
                    //     childElements[i].style.display = "inline-flex";
                    // }

                    matchingCourse = document.getElementById(courseName);
                    matchingCourseBody = matchingCourse.getElementsByClassName("course-reviews-body")[0];
                    matchingCourseBody.style.display = "block";
                    filterBy.style.display = "inline-flex";
                    sortBy.style.display = "inline-flex";

                    if(matchingCourseBody.scrollHeight < 450) {
                        matchingCourseBody.style.maxHeight = matchingCourseBody.scrollHeight + "px";
                    } else {
                        matchingCourseBody.style.maxHeight = "450px";
                    }
                    courseReviewsToggleBtn.replaceChild(arrowIcon1, arrowIcon2);
                    toggleText.textContent = "Hide Reviews";
                    legend.classList.toggle("active");
                }
            });
        })(courseId.textContent);

        courseReviewsBody.addEventListener("transitionstart", () => {
            loading = document.getElementById("loading");
            if(loading) {
                loading.remove();
            }
        });

        courseReviewsBody.addEventListener("transitionend", () => {
            if(courseReviewsBody.style.maxHeight === "0px") {
                courseReviewsFieldset.style.padding = "0px";
                courseReviewsFieldset.style.border = "none";
                courseReviewsBody.style.display = "none";
                courseReviewsFieldset.style.display = "contents";
            }
        });

        filterHeader.addEventListener("transitionend", () => {
            if(filterHeader.style.maxWidth === "0px") {
                filterBy.style.display = "none";
                sortBy.style.display = "none";
            } else {
                filterBy.style.display = "inline-flex";
                sortBy.style.display = "inline-flex";
            }
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

                    // IIFE used to retain "memory" link between correct button & course
                    (function(name) {
                        hasSections.addEventListener("click", () => {
                            console.log("Clicked section button!");
                            
                            // Redundant !hasLinks check is necessary b/c link status may have changed
                            // within interval of when eventListener was established and when it is triggered 
                            hasLinks2 = document.getElementById(name).getElementsByClassName("rmpreviews-btn").length > 0;
                            if(!hasLinks2) {
                                setTimeout(setProfLinks, 500, name, obj);
                            }
                        }, {once: true});
                    })(courseId.textContent);
                }

                setNativeReviews(courseId, infoContainer, obj);
            }
        }
    });
})();