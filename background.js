chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.status === 'complete' && tab.url) {
        
        /* Specific Query:
         * https://app.testudo.umd.edu/soc/search?
         *      courseId=
         *      &sectionId=
         *      &termId=202401
         *      &_openSectionsOnly=on
         *      &creditCompare=
         *      &credits=
         *      &courseLevelFilter=ALL&instructor=
         *      &_facetoface=on
         *      &_blended=on
         *      &_online=on
         *      &courseStartCompare=
         *      &courseStartHour=
         *      &courseStartMin=
         *      &courseStartAM=
         *      &courseEndHour=
         *      &courseEndMin=
         *      &courseEndAM=
         *      &teachingCenter=ALL
         *      &_classDay1=on
         *      &_classDay2=on
         *      &_classDay3=on
         *      &_classDay4=on
         *      &_classDay5=on
         */
        if(tab.url.match(/testudo\.umd\.edu\/soc\/(?:gen-ed\/|core\/)?search/)) {
            // const queryParams = tab.url.split("?")[1];
            // const urlParams = new URLSearchParams(queryParams);
            chrome.tabs.sendMessage(tabId, {webpage: "testudo"});

        /* Browsing Gen-Eds:
         * https://app.testudo.umd.edu/soc/gen-ed/202401/FSAW ("gen-ed"/<semester>/<gen-ed type>)
         */
        } else if(tab.url.match(/testudo\.umd\.edu\/soc\/gen-ed\/(\d{6})\/([A-Z]{4})$/)) {
            chrome.tabs.sendMessage(tabId, {webpage: "testudo"});

        /* Browsing Core Courses:
         * https://app.testudo.umd.edu/soc/core/202401/IE ("core"/<semester>/<core type>)
         */
        } else if(tab.url.match(/testudo\.umd\.edu\/soc\/core\/(\d{6})\/([A-Z]{1,2})$/)) {
            chrome.tabs.sendMessage(tabId, {webpage: "testudo"});

        /* Browsing All Courses:
        /* https://app.testudo.umd.edu/soc/202401/AASP (<semester>/<prefix>)
         */
        } else if(tab.url.match(/testudo\.umd\.edu\/soc\/(\d{6})\/([A-Z]{4})$/)) {
            chrome.tabs.sendMessage(tabId, {webpage: "testudo"});

        // PT links
        } else if(tab.url.match(/planetterp.com\/professor/)) {
            if(tab.url.split("_")[0] !== tab.url) {
                const name = tab.url.split("_")[0].split("professor/")[1];
                chrome.tabs.sendMessage(tabId, {webpage: "planetterp", name: name});
            } else {
                console.log("Prevents infinite 404 requests");
            }

        // RMP links
        } else if(tab.url.match(/ratemyprofessors.com\/search\/professors\/1270/)) {
            console.log("Matched RMP link")
            chrome.tabs.sendMessage(tabId, {webpage: "ratemyprofessors"});
        }
    }
});