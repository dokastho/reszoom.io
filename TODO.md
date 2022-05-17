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
- [ ] add location to info headings
- [ ] front end design
- [ ] offer different templates (see ecrc)
- [ ] resume thumbnails
- [ ] prevent duplicate entries
- [ ] offer custom headings, optional headings (leadership experience)
  - [ ] redesign builder.jsx render() method

down the road...
- [ ] animations
- [ ] tags for entries
  - [ ] **use another system to run NLP and return tags. (sockets!! 😁) doing so with rest api would not conform with rest standards**
  - [ ] create adds to entries_to_tags
  - [ ] recommend based on matching tags, offer from all
  - [ ] adding an entry will update tags based on the posts
  - [ ] select tags on create
  - [ ] edit updates tags 

random ideas
- [ ] cache entries so that if you delete the last entry but want to undo before saving
- [ ] "try again" function for login and add entry attempt
- [ ] make passwords strict
- [ ] make resumes/entries/education/etc visible in the user profile
- [ ] gpa display must be decimal format
- [ ] use await instead of subFetched
- [ ] callback entries in similar manner to recommended

tag server
- [ ] sanitize & validate inputs