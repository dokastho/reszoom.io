- [x] creating resumes
- [x] deleting resumes
- [x] starting forms
- [x] make resumeid key type Number
- [x] remove the ? added by delete
- [x] starting form "regions" which each have their own class
- [x] data structure addition for entry edit form button
- [x] ordering and reordering of entries
- [x] edit button to load form entry *(get stuffed, twitter!)*
- [x] update entry rest api
- [x] education/experience content
- [x] make sure inputs aren't too long
- [x] fold experience into normal entries
- [x] brainstorm better way of editing without changing past resumes
- [x] add experience edit
- [x] get edit button function up to date with rest api
- [x] fix experience add onchange
- [x] fix experience add
- [x] fix experience entries showing up
- [x] fix experience edit
- [x] fix experience add subentry, delete experience
- [x] don't change entryid if no content changed on edit
- [x] implement using past entries ... will need to add an eid
- [x] suggest entries based on frequency
- [x] edit experience -> fork info entry -> propogate changes across subentries???
- [x] add "edit for all" button to maintain entries
- [x] change recommend to array of objects instead of an object
- [x] add location to info headings
- [ ] offer different templates (see ecrc)
- [ ] resume thumbnails
- [ ] prevent duplicate entries
- [ ] offer custom headings, optional headings (leadership experience)
  - [x] redesign builder.jsx render() method
- [x] tags for entries
  - [x] **use another system to run NLP and return tags. (sockets!! 😁) doing so with rest api would not conform with rest standards**
  - [x] create adds to entries_to_tags
  - [x] recommend based on matching tags, offer from all
  - [x] adding an entry will update tags based on the posts
  - [x] select tags on create
  - [x] edit updates tags
- [ ] *maybe* move all entry-related variables into the one entries fetch in the entry-list react code
- [x] make buttons appear on div click
- [x] **fix:** elements of div are squashed by the div click (buttons, subentries)
- [x] pretty up the resume list page
  - [x] **show tags for each**
  - [x] show description with ... if it gets too long
  - [x] add optional desc to resume schema
  - [x] display desc at top of resume page
  - [ ] **make desc editable**
  - [ ] make resume name editable
- [x] move all content to sidebar
  - [x] add rest api route that sends back logname
  - [x] remove stuff from templates
  - [x] then remove stuff from flask views
- [x] ~~add sidebar to server side dynamic pages? or something~~ *note: not using a sidebar for these pages*
- [x] ~~show up/down buttons on entry hover~~
- [x] show profile picture in sidebar
- [x] make sidebar not move from resume list to resume page change
- [ ] reset tokens
- [x] "try again" function for login and add entry attempt
- [x] make passwords strict
- [x] password page should be client-dynamic
- [ ] collapsible sidebar
- [x] fix change password view
- [x] add date created to resume
- [ ] search resume list
  - [ ] search by tag
- [ ] tag clickable, shows list of resumes matching that tag
- [x] fix resume tag remove using entry delete (iterate through entry tags to update list of resume tags)
- [ ] "are you sure?" prompt when deleting info header with childern
- [x] bug: editing info header without changes makes children disappear until reload
- [ ] reload page periodically to update tags
- [x] update tags in sidebar without refresh
- [ ] ~~issue: tags in sidebar overwritten by later loads~~
    * ~~fix: streamline how tags are handled by code. pass them as member to entries~~
      * ~~this reduces number of fetches greatly, and makes it easier to update sidebar~~
      * ~~will have to pretty comprehensively change up entry_list code~~
      * ~~maybe do the same with recommended if it's not like that already~~
- [ ] add print button for resume
- [ ] make resume list an hmtl table

- [ ] home page
  - [ ] add movement animation
  - [ ] add decoration
- [ ] add code for handling when tag server is down
- [ ] make tag server rpc more polished
- [ ] clean up the resume page UX
- [ ] add true test suite
- [ ] add deployment pipeline
- [x] account settings page
- [x] login page
- [x] testing! mark done when I feel like it

down the road...
- [x] animations

random ideas
- [x] ~~cache entries so that if you delete the last entry but want to undo before saving~~
- [ ] make resumes/entries/education/etc visible in the user profile
- [x] gpa display must be decimal format
- [ ] use await instead of subFetched
- [ ] callback entries in similar manner to recommended
- [x] ~~put links to all resumes in sidebar ~~
- [ ] Tag class in rest api with __init__ function that parses json

tag server
- [ ] sanitize & validate inputs
- [x] make tasks run both tag server and webserver