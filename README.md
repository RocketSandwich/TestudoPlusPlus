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

1) Use courses API
    - Display average course gpa?
    - Concern: I don't want too many API calls, so I should consult PlanetTerp (let's say 50 fetches per webpage)
2) Fix ...

What is ajax?

- Bug: Professor(s) reviews link errs upon "Show All Sections" clicked