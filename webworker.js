/* Fetching grades data from PT API */
const fetchGrades = async (course, prof) => {
    try {
        const response = await fetch("https://planetterp.com/api/v1/grades?course=" + course + "&professor=" + prof);

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

onmessage = async (e) => {
    totalCount = 0;
    for(let i = 0; i < e.data.professors.length; i++) {
        const gradesData = await fetchGrades(e.data.courseName, e.data.professors[i]);
        if(gradesData) {
            for(let j = 0; j < gradesData.length; j++) {
                distribution = gradesData[j];
                totalCount += (distribution["A+"] + distribution["A"] + distribution["A-"] 
                + distribution["B+"] + distribution["B"] + distribution["B-"] 
                + distribution["C+"] + distribution["C"] + distribution["C-"] 
                + distribution["D+"] + distribution["D"] + distribution["D-"] 
                + distribution["F"]);
            }
        }
    }
    postMessage(totalCount);
};