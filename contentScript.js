(() => {
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const reviewsBtn = document.createElement("reviews");
        reviewsBtn.src = chrome.runtime.getURL("assets/logo.png");
        reviewsBtn.className = "reviews-btn";
        reviewsBtn.title = "Click to view student reviews";

        courses = document.getElementsByClassName("course-id");
    });
})();