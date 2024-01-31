// 'onMessage.addListener' is located at the eof; Start there

(() => {
    profSet = {};

    /* Rearranging instructor name for query */
    const swapWords = (professor) => {
        const words = professor.split(' ');
        [words[0], words[1]] = [words[1], words[0]];
        const resultString = words.join('_');
        return resultString;
    };

    /* Fetching professor data from PT API */
    const fetchProf = async (name) => {
        try {
            const response = await fetch("https://planetterp.com/api/v1/professor?name=" + name);
    
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

    /* Fetching course data from PT API */
    const fetchCourse = async (name) => {
        try {
            const response = await fetch("https://planetterp.com/api/v1/course?name=" + name);
    
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

    /* Inject corresponding links & rating next to professor */
    const injectData = (professor, index) => {
        if(index > 0) {
            setBreak(professor);
        }
        
        const linkContainer = document.createElement("div");
        linkContainer.className = "link-container";
        professor.parentNode.insertBefore(linkContainer, professor);
        
        const innerLinkContainer = document.createElement("div");
        innerLinkContainer.className = "inner-link-container";
        linkContainer.appendChild(innerLinkContainer);

        setPTLink(professor, "professor", innerLinkContainer);
        setRMPLink(professor, innerLinkContainer);
        setProfessorRating(professor);
    };

    /* Simple realignment to structure injected data */
    const alignmentShift = (section) => {
        const courseId = section.getElementsByClassName("section-id-container")[0];
        const computedStyle = window.getComputedStyle(courseId);
        courseId.style.width = parseInt(computedStyle.width, 10) - 49 + "px";
        
        const instructorsContainer = section.getElementsByClassName("section-instructors-container")[0];
        const instructorsComputedStyle = window.getComputedStyle(instructorsContainer);
        instructorsContainer.style.width = parseInt(instructorsComputedStyle.width, 10) + 49 + "px";
    };

    /* Stores important fetched data to prevent redundant API calls */
    const fillGlobalMap = async (profName) => {
        if(!(profName in profSet)) {
            const data = await fetchProf(encodeURI(profName));
            if(data) {
                rating = "";
                if(data.average_rating == null) {
                    rating = "n/a";
                } else {
                    rating = data.average_rating.toFixed(2);
                }
                profSet[profName] = {profSlug: data.slug, profRating: rating};
            } else {
                profSet[profName] = {profSlug: swapWords(profName), profRating: "n/a"};
            }
        }
    };

    /* Fetches, reads, processes, & injects data in appropriate place */
    const processData = async (courses) => {

        // Course iteration
        for(let i = 0; i < courses.length; i++) {
            const sections = courses[i].getElementsByClassName("section");

            // Section iteration
            for(let j = 0; j < sections.length; j++) {
                alignmentShift(sections[j]);
                const professors = sections[j].getElementsByClassName("section-instructor");

                // Professor iteration
                for(let k = 0; k < professors.length; k++) {
                    const professor = professors[k];
                    const profName = professor.textContent;
            
                    await fillGlobalMap(profName);
                    injectData(professor, k);
                }
            }
            slideTransition(courses[i]);
        }
    };

    /* Injects PT link */
    const setPTLink = async (sectionInstructor, type, linkContainer) => {
        
        const PTLink = document.createElement("a");
        if(type == "course") {
            PTLink.href = "https://planetterp.com/" + type + "/" + sectionInstructor.textContent; // sectionInstructor is really 'courseId'
        } else {
            PTLink.href = "https://planetterp.com/" + type + "/" + profSet[sectionInstructor.textContent].profSlug;
        }

        PTLink.target = "_blank";
        PTLink.className = "ptreviews-btn";
        PTLink.title = "PlanetTerp Reviews";

        const imgElem = document.createElement("img");
        imgElem.src = chrome.runtime.getURL("assets/PT_logo.png");
        imgElem.className = "pt-img";
        imgElem.alt = "PlanetTerp";
        if(type == "course") {
            imgElem.style.width = "40%";
        } else {
            imgElem.className = "pt-img professor";
        }

        PTLink.addEventListener('mouseover', () => {imgElem.style.filter = 'grayscale(50%)'});
        PTLink.addEventListener('mouseout', () => {imgElem.style.filter = 'grayscale(0%)'});
        PTLink.appendChild(imgElem);
        if(type == "course") {
            sectionInstructor.parentNode.appendChild(PTLink);
            // const data = await fetchCourse(sectionInstructor.textContent);
            // const avgGPA = document.createElement("div");
            // avgGPA.className = "average-course-gpa";
            // if(data) {
            //     avgGPA.textContent = "Average GPA of " + data.average_gpa.toFixed(2);// + " between " + num + " students";
            // } else {
            //     avgGPA.textContent = "Average GPA of ?";
            // }
            // const courseDetails = sectionInstructor.parentNode.parentNode.getElementsByClassName("course-basic-info-container")[0];
            // courseDetails.appendChild(avgGPA)
        } else {
            linkContainer.appendChild(PTLink);
        }
    };

    /* Injects RMP link */
    const setRMPLink = (sectionInstructor, linkContainer) => {
        const name = sectionInstructor.textContent;
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
        linkContainer.appendChild(RMPLink);
    };

    /* Injects break tag */
    const setBreak = (elem) => {
        const RMPLink = document.createElement("br");
        elem.parentNode.insertBefore(RMPLink, elem);
    };

    /* Establishes color gradient based on rating (Red[1.0] -> Yellow[3.0] -> Green[5.0]) */
    const getColor = (value) => {
        const ratio = (value - 1.0) / (5.0 - 1.0);
        var hue=(ratio*120).toString(10);
        return ["hsl(",hue,",60%,50%)"].join("");
    }

    /* Injects average professor rating */
    const setProfessorRating = (sectionInstructor) => {
        const rating = profSet[sectionInstructor.textContent].profRating;
        const numericalValue = parseFloat(rating);
        const interpolatedColor = getColor(numericalValue)
        
        const profRating = document.createElement("div");
        profRating.className = "professor-rating";
        
        const profRatingInner = document.createElement("div");
        profRatingInner.className = "professor-rating-inner";
        profRatingInner.textContent = rating;
        if(rating == "n/a") {
            profRatingInner.style.backgroundColor = "lightslategray";
        } else {
            profRatingInner.style.backgroundColor = interpolatedColor;
        }
        profRating.appendChild(profRatingInner);
        sectionInstructor.parentNode.insertBefore(profRating, sectionInstructor.nextSibling);
    };

    /* Starts the slide animation for links & rating containers */
    const slideTransition = (addedNode) => {
        const linksTransition = addedNode.getElementsByClassName("inner-link-container");
        const ratingContainerTransition = addedNode.getElementsByClassName("professor-rating");
        const ratingTransition = addedNode.getElementsByClassName("professor-rating-inner");

        for(let i = 0; i < linksTransition.length; i++) {
            setTimeout(() => {
                ratingContainerTransition[i].style.paddingLeft = "5px";
                linksTransition[i].style.marginLeft = "0px";
                ratingTransition[i].style.marginLeft = "0px";
            }, 500);
        }
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

    /* Used to get active course professors w/o having to expand sections container (Experiment w/ ajax calls?) */
    const fetchSections = async (courseName, urlParams) => {
        try {
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
                thisCourseProfs.add(prof[i].textContent);
            }

            return thisCourseProfs;
        } catch (error) {
            console.log("Error during fetch:", error);
            return undefined;
            // throw error; 
        }
    };

    /* Sorts reviews in chronological order */
    const sortChrono = (reviewsBody) => {
        rvws = reviewsBody.querySelectorAll('[data-datetime]');
        const reviewsArr = Array.from(rvws);
        
        const sortedReviews = reviewsArr.sort((a, b) => {
            const dateA = new Date(a.dataset.datetime);
            const dateB = new Date(b.dataset.datetime);
            return dateB - dateA;
        });
        
        sortedReviews.forEach((element) => reviewsBody.appendChild(element));
        rvws = reviewsBody.querySelectorAll('[data-datetime]');

        for(let i = 0, j = 0; i < rvws.length; i++) {
            if(rvws[i].style.display === "block") {
                if(j % 2 == 0) {
                    rvws[i].style.backgroundColor = "#eee";
                } else {
                    rvws[i].style.backgroundColor = "transparent";
                }
                j++;
            }
        }
    };

    /* Sort By button behavior */
    const sortByClicked = (event) => {
        btn = event.target;
        btnValue = parseInt(btn.value, 10);
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

        /* Recent -> Critical -> Favorable -> (repeat) */
        // Elements should store 'data-stars' & 'data-datetime' (sort parameters)
        const reviewsBody = btn.parentNode.parentNode.parentNode.getElementsByClassName("course-reviews-body")[0];
        reviews = reviewsBody.getElementsByClassName("course-reviews-body-content");
        
        // Recent -> Critical
        // - Can run in O(5*n) with only 5 loops b/c only 5 stars & already sorted by time
        // - 1st loop: In order, find all 1-star reviews & move to top
        // - 2nd loop: Start at index 'j = # of 1-star reviews' & in order, find all 2-star reviews & move to 'i'
        // - 3rd, 4th, 5th loop: (repeat)
        if(btn.textContent === "Most Critical") {
            for(let i = 0, j = 1; i < 5; i++) {
                for(let k = 0; k < reviews.length; k++) {
                    const thisReview = reviews[k];
                    const stars = thisReview.getAttribute("data-stars");
                    const datetime = thisReview.getAttribute("data-datetime");
                    if(stars && datetime) {
                        if(stars == i) {
                            reviewsBody.insertBefore(thisReview, reviews[j]);
                            j++;
                        }
                    }
                }
            }

            for(let i = 0, j = 0; i < reviews.length; i++) {
                if(reviews[i].style.display === "block") {
                    if(j % 2 == 0) {
                        reviews[i].style.backgroundColor = "#eee";
                    } else {
                        reviews[i].style.backgroundColor = "transparent";
                    }
                    j++;
                }
            }
        }

        // Critical -> Favorable
        // - Possibly O(4*n) since we have them as sorted chunk data
        // - Move 1-star reviews chunk as end chunk
        // - Move 2-star reviews chunk to end-1 chunk
        // - (3-star chunk will stay in same place)
        // - Move 4-star reviews chunk to front+1 chunk
        // - Move 5-star reviews chunk as front chunk
        else if(btn.textContent === "Most Favorable") {
            i = 1;
            while(i < reviews.length && reviews[1].getAttribute("data-stars") == 1) {
                reviewsBody.appendChild(reviews[1]);
                i++;
            }
            
            j = 1;
            while(j < reviews.length && reviews[1].getAttribute("data-stars") == 2) {
                reviewsBody.insertBefore(reviews[1], reviews[reviews.length - i + 1]);
                j++;
            }
            
            k = 1;
            while(k < reviews.length && reviews[k].getAttribute("data-stars") == 3) {
                k++;
            }

            l = 1;
            while(l < reviews.length && k < reviews.length && reviews[k].getAttribute("data-stars") == 4) {
                reviewsBody.insertBefore(reviews[k], reviews[l]);
                k++;
                l++;
            }

            m = 1;
            while(k < reviews.length && m < reviews.length && reviews[k].getAttribute("data-stars") == 5) {
                reviewsBody.insertBefore(reviews[k], reviews[m]);
                k++;
                m++;
            }

            for(let i = 0, j = 0; i < reviews.length; i++) {
                if(reviews[i].style.display === "block") {
                    if(j % 2 == 0) {
                        reviews[i].style.backgroundColor = "#eee";
                    } else {
                        reviews[i].style.backgroundColor = "transparent";
                    }
                    j++;
                }
            }
        }
        
        // Favorable -> Recent
        // - Since goal parameter (datetime) is scattered, there is no prior assumption we can make to accelerate this sorting alg
        // - Use standard sorting alg/function
        else if(btn.textContent === "Most Recent") {
            sortChrono(reviewsBody);
        }
    };
    
    /* A substring command for single native professor review */
    const getProfName = (review) => {
        const indexOfEmptyStar = review.indexOf("☆");
        const indexOfStar = review.indexOf("★");
        const firstIndex = Math.min(indexOfEmptyStar !== -1 ? indexOfEmptyStar : Infinity, indexOfStar !== -1 ? indexOfStar : Infinity);
        return review.substring(0, firstIndex - 1);
    };

    /* Establishes native course reviews */
    /* Honestly, this function is a monstrousity rn, but I'm too exhausted to refactor it thoroughly :( (Works though!) */
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

                        // Event listener for drop-down box
                        filterBy.addEventListener("input", (event) => {
                            event.target.style.maxWidth = getWidth(event.target) + "px";

                            // Edit reviews box to display only the requested professor(s)
                            const greatGrandpa = event.target.parentNode.parentNode.parentNode;
                            const reviews = greatGrandpa.getElementsByClassName("body-content-header");
                            const emptySlide = greatGrandpa.querySelector("#empty-review");
                            emptySlide.style.display = "none";
                            
                            for(let i = 0, j = 0; i < reviews.length; i++) { //★☆
                                const profName = getProfName(reviews[i].textContent);

                                if(event.target.value === "All Instructors") {
                                    if(j % 2 == 0) {
                                        reviews[i].parentNode.style.backgroundColor = "#eee";
                                    } else {
                                        reviews[i].parentNode.style.backgroundColor = "transparent";
                                    }
                                    j++;
                                    reviews[i].parentNode.style.display = "block";
                                } else if(event.target.value === "All Current Instructors") {
                                    if(thisCourseProfs.has(profName)) {
                                        if(j % 2 == 0) {
                                            reviews[i].parentNode.style.backgroundColor = "#eee";
                                        } else {
                                            reviews[i].parentNode.style.backgroundColor = "transparent";
                                        }
                                        j++;
                                        reviews[i].parentNode.style.display = "block";
                                    } else {
                                        reviews[i].parentNode.style.display = "none";
                                    }
                                } else if(event.target.value === "All Past Instructors") {
                                    if(!thisCourseProfs.has(profName)) {
                                        if(j % 2 == 0) {
                                            reviews[i].parentNode.style.backgroundColor = "#eee";
                                        } else {
                                            reviews[i].parentNode.style.backgroundColor = "transparent";
                                        }
                                        j++;
                                        reviews[i].parentNode.style.display = "block";
                                    } else {
                                        reviews[i].parentNode.style.display = "none";
                                    }
                                } else {
                                    if(event.target.value === profName) {
                                        if(j % 2 == 0) {
                                            reviews[i].parentNode.style.backgroundColor = "#eee";
                                        } else {
                                            reviews[i].parentNode.style.backgroundColor = "transparent";
                                        }
                                        j++;
                                        reviews[i].parentNode.style.display = "block";
                                    } else {
                                        reviews[i].parentNode.style.display = "none";
                                    }
                                }
                            }
                            
                            // If all are hidden, display text
                            allHidden = true;
                            const allReviews = greatGrandpa.querySelectorAll('.course-reviews-body-content');
                            const contentBody = allReviews[0].parentNode;
                            for(let i = 0; i < allReviews.length; i++) {
                                if(allReviews[i].style.display !== "none") {
                                    allHidden = false;
                                    break;
                                }
                            }

                            if(allHidden) {
                                emptySlide.style.display = "block";
                            }

                            if(contentBody.scrollHeight < 450) {
                                contentBody.style.maxHeight = contentBody.scrollHeight + "px";
                            } else {
                                contentBody.style.maxHeight = "450px";
                            }
                        });

                        // Adding reviews to container body
                        const hiddenCourseReviewsBodyContent = document.createElement("div");
                        hiddenCourseReviewsBodyContent.id = "empty-review";
                        hiddenCourseReviewsBodyContent.className = "course-reviews-body-content";
                        hiddenCourseReviewsBodyContent.textContent = "No course reviews yet. :(";
                        hiddenCourseReviewsBodyContent.style.backgroundColor = "#eee";
                        hiddenCourseReviewsBodyContent.style.display = "none";
                        matchingCourseBody.appendChild(hiddenCourseReviewsBodyContent);

                        if(reviews.length == 0) {
                            hiddenCourseReviewsBodyContent.style.display = "block";
                        } else {
                            for(let j = reviews.length - 1, k = 0; j >= 0; j--, k++) {
                                const courseReviewsBodyContent = document.createElement("div");
                                courseReviewsBodyContent.className = "course-reviews-body-content";
                                courseReviewsBodyContent.style.display = "block";
                                if(k % 2 == 0) {
                                    courseReviewsBodyContent.style.backgroundColor = "#eee";
                                }
                                
                                const review = reviews[j];
                                courseReviewsBodyContent.setAttribute("data-stars", review.rating);
                                courseReviewsBodyContent.setAttribute("data-datetime", review.created);
                                const date = new Date(review.created);
                                const options = {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short'};
                                const readableDateString = date.toLocaleDateString('en-US', options);
                                grade = "";
                                (review.expected_grade == "") ? (grade = "?") : (grade = review.expected_grade);
                                const bodyContentHeader = document.createElement("div");
                                bodyContentHeader.className = "body-content-header";
                                bodyContentHeader.textContent = review.professor + " " + "★".repeat(review.rating) + "☆".repeat(5 - review.rating) + " | Expecting " + grade + " | " + readableDateString;
                                professors.add(review.professor);

                                const bodyContentBody = document.createElement("span");
                                bodyContentBody.textContent = review.review;

                                courseReviewsBodyContent.appendChild(bodyContentHeader);
                                courseReviewsBodyContent.appendChild(bodyContentBody);

                                /* Test Content */
                                // Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                // Eget mauris pharetra et ultrices neque ornare aenean. Auctor eu augue ut lectus arcu bibendum at varius vel. 
                                // Duis at consectetur lorem donec massa sapien faucibus. Mauris sit amet massa vitae tortor condimentum lacinia quis vel.
                                // Lobortis elementum nibh tellus molestie nunc. Fermentum odio eu feugiat pretium nibh.
                                matchingCourseBody.appendChild(courseReviewsBodyContent);
                            }

                            sortChrono(matchingCourseBody);
                        }

                        // Adding professors to drop-down box
                        if(professors.size == 0) {
                            const profOption = document.createElement("option");
                            profOption.className = "professor-option";
                            profOption.textContent = "No professor reviews yet.";
                            profOption.disabled = true;
                            filterBy.appendChild(profOption);
                        } else {
                            const optGroup = document.createElement("optgroup");
                            optGroup.className = "groups";
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
                            optCurrent.className = "current-professors";
                            optCurrent.label = "Current Instructors";

                            const optPast = document.createElement("optgroup");
                            optPast.className = "past-professors";
                            optPast.label = "Past Instructors";

                            const sortedProfs = Array.from(thisCourseProfs).sort();
                            sortedProfs.forEach((value) => {
                                const profOption = document.createElement("option");
                                profOption.className = "professor-option";
                                profOption.textContent = value;
                                profOption.value = value;

                                optCurrent.appendChild(profOption);
                            });
                            
                            const moreSortedProfs = Array.from(professors).sort();
                            moreSortedProfs.forEach((value) => {
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

                    for(let i = 0; i < childElements.length; i++) {
                        childElements[i].style.maxWidth = "0px";
                    }
                    
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

                    for(let i = 0; i < childElements.length; i++) {
                        if(childElements[i].className === "course-reviews-filter-dropdown-menu interaction") {
                            childElements[i].style.maxWidth = getWidth(childElements[i]) + "px";
                        } else {
                            childElements[i].style.maxWidth = "120px";
                        }
                    }

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

    /* Inserting average GPA for designated course */
    const setAvgGPA = async (courseId) => {
        const data = await fetchCourse(courseId.textContent);
        const avgGPA = document.createElement("div");
        avgGPA.className = "average-course-gpa";
        if(data && data.average_gpa) {
            avgGPA.textContent = "Avg GPA: " + data.average_gpa.toFixed(2);// + " between " + num + " students";
        } else {
            avgGPA.textContent = "Avg GPA: (not listed)";
        }
        const courseDetails = courseId.parentNode.parentNode.getElementsByClassName("course-basic-info-container")[0];
        courseDetails.appendChild(avgGPA);
    };

    chrome.runtime.onMessage.addListener(async (obj, sender, response) => {

        // RMP took down their old API and replaced to GraphQL
        // Currently, we just redirect user to correct site after finding professor ID from initial link
        // However, somebody seems to have appropriately handled it in this repo: https://github.com/Jeong-Min-Cho/Rate-My-GMU-Professors?tab=readme-ov-file 
        if(obj.webpage === 'ratemyprofessors') {
            teachers = document.getElementsByClassName("TeacherCard__StyledTeacherCard-syjs0d-0");
            if(teachers.length == 1 && teachers[0].getElementsByClassName("CardSchool__School-sc-19lmz2k-1")[0].textContent === "University of Maryland") {
                window.open(teachers[0].href, "_self");
            }
        } else if(obj.webpage === 'testudo') {
            
            // Establish DOM listener for section expansion
            const observer = new MutationObserver(async (mutationList, observer) => {
                for (const mutation of mutationList) {
                    if(mutation.type === "childList") {
                        const newData = mutation.addedNodes;
                        await processData(newData);
                    }
                }
            });
            
            // Course Iteration
            courses = document.getElementsByClassName("course");
            for(let i = 0; i < courses.length; i++) {
                thisCourse = courses[i];
                courseId = thisCourse.getElementsByClassName("course-id")[0];
                infoContainer = thisCourse.getElementsByClassName("course-info-container")[0];
                sectionsData = thisCourse.getElementsByClassName("sections-container");
                hasExpandedSections = sectionsData.length > 0;
                
                setAvgGPA(courseId);
                setPTLink(courseId, "course", undefined);
                setNativeReviews(courseId, infoContainer, obj);
                
                if(hasExpandedSections) {
                    await processData(sectionsData);
                } else {
                    hasSections = thisCourse.getElementsByClassName("toggle-sections-link-container").length > 0;
                    if(hasSections) {
                        const closedSections = document.getElementById(courseId.textContent).getElementsByClassName("sections-fieldset")[0];
                        observer.observe(closedSections, {childList: true});
                    }
                }
            }
        }
    });
})();