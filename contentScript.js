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
            console.error("Error during fetch:", error);
            throw error; 
        }
    };

    /* Adding content body elements */
    const addReviews = async () => {

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
                // courseReviewsFieldset.style.border = "1px solid #ddd";
                // courseReviewsFieldset.style.paddingLeft = "15px";
                // courseReviewsFieldset.style.paddingRight = "15px";
                // courseReviewsFieldset.style.padding = "13px";
                courseReviewsFieldset.style.marginLeft = "-15px";
                courseReviewsFieldset.style.borderRadius = "4px";
                courseReviewsFieldset.style.maxWidth = "823px";
                courseReviewsFieldset.style.transition = "padding-bottom 0.7s ease-in-out, padding-top 0.7s ease-in-out";
                courseReviewsFieldset.style.display = "contents";

                const legend = document.createElement("legend");
                legend.className = "course-reviews-header";
                legend.style.paddingRight = "4px";
                legend.style.paddingLeft = "3px";
                legend.style.marginLeft = "-2px";

                const courseReviewsToggleBtn = document.createElement("a");
                courseReviewsToggleBtn.className = "course-reviews-toggle-btn";
                courseReviewsToggleBtn.title = "View student reviews in-screen";
                courseReviewsToggleBtn.style.color = "#A81919";
                courseReviewsToggleBtn.style.cursor = "pointer";
                // courseReviewsToggleBtn.style.paddingBottom = "3px";
                courseReviewsToggleBtn.style.display = "block";
                courseReviewsToggleBtn.style.userSelect = "none";
                courseReviewsToggleBtn.style.maxWidth = "105px";

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

                // if(courseId.textContent === "CMSC131") {
                //     fetchReviewsData(courseId.textContent);
                // }
                const courseReviewsBody = document.createElement("div"); //fetchReviewsData();
                courseReviewsBody.className = "course-reviews-body";
                // courseReviewsBody.style.padding = "11px";
                // courseReviewsBody.style.paddingTop = "5px";
                // courseReviewsBody.style.paddingBottom = "5px";
                courseReviewsBody.style.border = "1px solid #eee";
                courseReviewsBody.style.borderRadius = "4px";
                courseReviewsBody.style.maxWidth = "auto";//"802px";
                courseReviewsBody.style.marginTop = "-9px";
                // courseReviewsBody.style.backgroundColor = "#eee";
                // courseReviewsBody.style.transition = "padding-top 0.7s ease-in-out, padding-bottom 0.7s ease-in-out";
                courseReviewsBody.style.display = "none";

                courseReviewsToggleBtn.appendChild(arrowIcon2);
                courseReviewsToggleBtn.appendChild(toggleText);
                legend.appendChild(courseReviewsToggleBtn);
                courseReviewsFieldset.appendChild(legend);
                courseReviewsFieldset.appendChild(courseReviewsBody);
                courseReviewsContainer.appendChild(courseReviewsFieldset);
                infoContainer.appendChild(courseReviewsContainer);

                // Toggle button event listener
                (function(courseName) {
                    courseReviewsToggleBtn.addEventListener('click', async () => {
                        if(!legend.classList.contains("fetched")) {
                            legend.classList.add("fetched");
                            data = await fetchReviewsData(courseName);
                            // console.log("In here!!!");
                            // console.log(data.reviews);
                            reviews = data.reviews;
                            matchingCourse = document.getElementById(courseName);
                            matchingCourseBody = matchingCourse.getElementsByClassName("course-reviews-body")[0];
                            // console.log(matchingCourse);
                            // console.log(matchingCourseBody);
                            for(let j = reviews.length - 1; j >= 0; j--) {
                                // console.log("Looping " + j);
                                const courseReviewsBodyContent = document.createElement("div");
                                courseReviewsBodyContent.className = "course-reviews-body-content";
                                if(j % 2 === 0) {
                                    courseReviewsBodyContent.style.backgroundColor = "#eee";
                                }
                                courseReviewsBodyContent.style.padding = "11px";
                                courseReviewsBodyContent.style.paddingTop = "5px";
                                courseReviewsBodyContent.style.paddingBottom = "5px";
                                courseReviewsBodyContent.textContent = reviews[j].review;
                                // console.log(courseReviewsBodyContent);
                                //"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Eget mauris pharetra et ultrices neque ornare aenean. Auctor eu augue ut lectus arcu bibendum at varius vel. Duis at consectetur lorem donec massa sapien faucibus. Mauris sit amet massa vitae tortor condimentum lacinia quis vel. Lobortis elementum nibh tellus molestie nunc. Fermentum odio eu feugiat pretium nibh. Cursus euismod quis viverra nibh cras pulvinar mattis nunc sed. Amet tellus cras adipiscing enim. Pellentesque habitant morbi tristique senectus et netus et malesuada fames. Laoreet sit amet cursus sit amet dictum sit amet. Lorem ipsum dolor sit amet consectetur adipiscing. Nibh praesent tristique magna sit amet. Lectus mauris ultrices eros in cursus turpis massa. Eu feugiat pretium nibh ipsum. Sit amet consectetur adipiscing elit ut aliquam purus sit amet. Tempor orci eu lobortis elementum nibh tellus molestie nunc. Risus in hendrerit gravida rutrum quisque non tellus orci ac. Elit pellentesque habitant morbi tristique senectus et netus.";
                                matchingCourseBody.appendChild(courseReviewsBodyContent);
                            }
                            console.log("in promise");
                            console.log(matchingCourseBody);

                            matchingCourse = document.getElementById(courseName);
                            matchingCourseBody = matchingCourse.getElementsByClassName("course-reviews-body")[0];
                            console.log("after promise section");
                            console.log(matchingCourseBody);
                        }

                        if(legend.classList.contains("active")) {
                            matchingCourse = document.getElementById(courseName);
                            matchingCourseBody = matchingCourse.getElementsByClassName("course-reviews-body")[0];
                            console.log("Active->Hidden scrollheight = " + matchingCourseBody.scrollHeight);
                            // setTimeout(5000);
                            courseReviewsBody.style.maxHeight = "0px";
                            legend.classList.toggle("active");
                            courseReviewsToggleBtn.replaceChild(arrowIcon2, arrowIcon1);
                            toggleText.textContent = "Show Reviews";
                            courseReviewsFieldset.style.transition = "padding-bottom 0.7s ease-in-out, padding-top 0.7s ease-in-out";
                            courseReviewsFieldset.style.paddingTop = "0px";
                            courseReviewsFieldset.style.paddingBottom = "0px";
                            courseReviewsBody.style.paddingTop = "0px";
                            courseReviewsBody.style.paddingBottom = "0px";
                            // console.log("maxHeight = " + courseReviewsBody.style.maxHeight);
                            // console.log("height = " + courseReviewsBody.style.height);
                            // courseReviewsFieldset.style.height = "10px";
                            // setTimeout(() => {
                            //     courseReviewsFieldset.style.padding = "0px";
                            //     courseReviewsFieldset.style.border = "none";
                            //     courseReviewsBody.style.display = "none";
                            //     courseReviewsFieldset.style.display = "contents";
                            // }, 700);
                        } else {
                            // matchingCourseBody.style.display = "block";
                            courseReviewsFieldset.style.display = "block";
                            courseReviewsFieldset.style.padding = "13px";
                            courseReviewsFieldset.style.border = "1px solid #ddd";
                            // courseReviewsBody.style.paddingTop = "5px";
                            // courseReviewsBody.style.paddingBottom = "5px";

                            matchingCourse = document.getElementById(courseName);
                            matchingCourseBody = matchingCourse.getElementsByClassName("course-reviews-body")[0];
                            console.log(matchingCourse);
                            console.log(matchingCourseBody);
                            console.log("scrollHeight = " + matchingCourseBody.scrollHeight);
                            matchingCourseBody.style.display = "block";
                            console.log("1) Hidden->Active scrollheight = " + matchingCourseBody.scrollHeight);
                            console.log("2) Hidden->Active scrollheight = " + courseReviewsBody.scrollHeight);
                            if(matchingCourseBody.scrollHeight < 450) {
                                console.log("< 450px");
                                matchingCourseBody.style.maxHeight = matchingCourseBody.scrollHeight + "px";
                            } else {
                                console.log("> 450px");
                                matchingCourseBody.style.maxHeight = "450px";
                            }
                            courseReviewsToggleBtn.replaceChild(arrowIcon1, arrowIcon2);
                            toggleText.textContent = "Hide Reviews";
                            legend.classList.toggle("active");
                        }
                        // legend.classList.toggle("active");
                        // console.log("courseReviewsFieldset height = " + courseReviewsFieldset.style.maxHeight);
                        matchingCourse2 = document.getElementById(courseName);
                        matchingCourseBody2 = matchingCourse2.getElementsByClassName("course-reviews-body")[0];
                        console.log(matchingCourseBody2);
                        console.log("scrollheight = " + matchingCourseBody2.scrollHeight);
                    });
                })(courseId.textContent);

                courseReviewsBody.addEventListener("transitionend", () => {
                    if(courseReviewsBody.style.maxHeight === "0px") {
                        // courseReviewsBody.style.display = "none";
                        // courseReviewsFieldset.style.transition = "padding-bottom 0.7s ease-in-out, height 0.7s ease-in-out";
                        // courseReviewsFieldset.style.transition = "padding 0.5s ease-in-out";
                        // courseReviewsFieldset.style.animation = "fadeOut 1s";
                        courseReviewsFieldset.style.padding = "0px";
                        courseReviewsFieldset.style.border = "none";
                        courseReviewsBody.style.display = "none";
                        courseReviewsFieldset.style.display = "contents";
                    }
                });

                // courseReviewsFieldset.addEventListener("animationend", () => {
                //     courseReviewsFieldset.style.padding = "0px";
                //     courseReviewsFieldset.style.border = "none";
                //     courseReviewsBody.style.display = "none";
                //     courseReviewsFieldset.style.display = "contents";
                // });
            }
        }
    });
})();