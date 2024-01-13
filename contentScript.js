(() => {
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        courses = document.getElementsByClassName("course-id");
        // console.log(courses[0].textContent)

        for(let i = 0; i < courses.length; i++) {
            const anchorElem = document.createElement("a");
            anchorElem.href = "https://planetterp.com/course/" + courses[i].textContent;
            anchorElem.target = "_blank";
            anchorElem.className = "reviews-btn";
            anchorElem.title = "View student reviews/details";

            const imgElem = document.createElement("img");
            imgElem.src = chrome.runtime.getURL("assets/logo.png");
            imgElem.alt = "PlanetTerp";
            imgElem.style.width = "40%";

            anchorElem.appendChild(imgElem);
            courses[i].appendChild(anchorElem);
        }
    });
})();