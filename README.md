# Testudo++
A streamlined process for reviewing course and professor evaluations integrated as a browser extension on https://testudo.umd.edu/. Further aims to resolve some consistent student concerns about resource availability during maintenence hours.

Future Implementations:
- Review criteria (Filter By, Sort By)
- Extension window interface
- Phase out DOM-timer delay? (bug with occasionally unloaded links)
- Maintenance hours access
- Window size adjustment (too extra?)
- Minor pixel alignments
- Set link screen to invisible
- BAD PLANETTERP API BOOOOOOOOO :( MUST MANUALLY FIX MYSELF :(
    - Prof review present but not listed - manually parse reviews and add them
- Fix Button overflow visual bug
- More bad API data
    - Reviews are not in chronological order
- Minor bug when sorting by most favorable

1) Use MutationObserver
    - Section professor links
2) Use professor API
    - Retrieve correct 'slug'
    - Display average rating
3) Use courses API
    - Display average course gpa

- Err on CMSC100? (nullptr)