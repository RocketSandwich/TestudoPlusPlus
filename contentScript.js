(() => {
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        courses = document.getElementsByClassName("course-id");

        for(let i = 0; i < courses.length; i++) {
            const reviewsBtn = document.createElement("img");
            reviewsBtn.src = chrome.runtime.getURL("assets/logo.png");
            reviewsBtn.className = "reviews-btn";
            reviewsBtn.title = "Click to view student reviews";
            reviewsBtn.style.width = "40%";

            courses[i].appendChild(reviewsBtn);
        }
    });
})();