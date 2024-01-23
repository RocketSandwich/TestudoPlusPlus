chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.status === 'complete' && tab.url) {
        
        // Have to evaluate all up front to grab capture groups
        searchQuery = tab.url.match(/testudo\.umd\.edu\/soc\/(?:gen-ed\/|core\/)?search/);
        genEdQuery = tab.url.match(/testudo\.umd\.edu\/soc\/gen-ed\/(\d{6})\/([A-Z]{4})$/);
        coreQuery = tab.url.match(/testudo\.umd\.edu\/soc\/core\/(\d{6})\/([A-Z]{1,2})$/);
        allQuery = tab.url.match(/testudo\.umd\.edu\/soc\/(\d{6})\/([A-Z]{4})$/);
        ptLink = tab.url.match(/planetterp.com\/professor/);
        rmpLink = tab.url.match(/ratemyprofessors.com\/search\/professors\/1270/);

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
        if(searchQuery) {
            const queryParams = tab.url.split("?")[1];
            urlParams = JSON.parse('{"' + queryParams.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) });
            urlParams.webpage = "testudo";
            urlParams.groupType = searchQuery[1];
            console.log(urlParams);
            chrome.tabs.sendMessage(tabId, urlParams);

        /* Browsing Gen-Eds:
         * https://app.testudo.umd.edu/soc/gen-ed/202401/FSAW ("gen-ed"/<semester>/<gen-ed type>)
         */
        } else if(genEdQuery) {
            urlParams = {webpage: "testudo", groupType: "gen-ed"};
            urlParams.termId = genEdQuery[1];
            chrome.tabs.sendMessage(tabId, urlParams);

        /* Browsing Core Courses:
         * https://app.testudo.umd.edu/soc/core/202401/IE ("core"/<semester>/<core type>)
         */
        } else if(coreQuery) {
            urlParams = {webpage: "testudo", groupType: "core"};
            urlParams.termId = coreQuery[1];
            chrome.tabs.sendMessage(tabId, urlParams);

        /* Browsing All Courses:
        /* https://app.testudo.umd.edu/soc/202401/AASP (<semester>/<prefix>)
         */
        } else if(allQuery) {
            urlParams = {webpage: "testudo", groupType: undefined};
            urlParams.termId = allQuery[1];
            chrome.tabs.sendMessage(tabId, urlParams);

        // PT links
        } else if(ptLink) {
            if(tab.url.split("_")[0] !== tab.url) {
                const name = tab.url.split("_")[0].split("professor/")[1];
                chrome.tabs.sendMessage(tabId, {webpage: "planetterp", name: name});
            } else {
                console.log("Prevents infinite 404 requests");
            }

        // RMP links
        } else if(rmpLink) {
            console.log("Matched RMP link")
            chrome.tabs.sendMessage(tabId, {webpage: "ratemyprofessors"});
        }
    }
});