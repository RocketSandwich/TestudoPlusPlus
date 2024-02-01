# Testudo++
A streamlined process for reviewing course details and professor evaluations integrated as a browser extension on https://app.testudo.umd.edu/soc/ using the [PlanetTerp](https://planetterp.com/api/) API.

## Preview
![](assets/demonstration.gif)

## Features
- Displays average course GPA
- Course link navigates you to the corresponding PlanetTerp course website
- Professor links
    - PlanetTerp link navigates you to the corresponding PlanetTerp professor page
    - RateMyProfessor link navigates you to the corresponding RateMyProfessor professor page
- Professor ratings show the average student ratings given to that professor
    - Intuitive matching color gradient to indicate positive/negative scale (red, yellow, green)
- Scrollable professor reviews window
    - Able to filter by professor
        - Organized by active/inactive instructor status
        - View by grouping
        - Sorted alphabetically 
    - Able to sort by 'Most Recent', 'Most Critical', and 'Most Favorable'
    - Additional information popup window

TODO
- *Add student count?
- *Random instances of "Extension context invalidated"
- Filter By is empty even for current professors (CMSC115) for unregistered course
    - I think this is fine, behavior is appropriate for situation
- Reviews container size adjustment?
    - Ask friends

TODO
- *Add student count?
- *Random instances of "Extension context invalidated"
- Filter By is empty even for current professors (CMSC115) for unregistered course
    - I think this is fine, behavior is appropriate for situation
- Reviews container size adjustment?
    - Ask friends