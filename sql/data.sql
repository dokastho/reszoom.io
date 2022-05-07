PRAGMA foreign_keys = ON;

INSERT INTO users(username, fullname, email, filename, password)
VALUES ('awdeorio', 'Andrew DeOrio', 'awdeorio@umich.edu', 'e1a7c5c32973862ee15173b0259e3efdb6a391af.jpg', 'password');
INSERT INTO users(username, fullname, email, filename, password)
VALUES ('jflinn', 'Jason Flinn', 'jflinn@umich.edu', '505083b8b56c97429a728b68f31b0b2a089e5113.jpg', 'password');
INSERT INTO users(username, fullname, email, filename, password)
VALUES ('michjc', 'Michael Cafarella', 'michjc@umich.edu', '5ecde7677b83304132cb2871516ea50032ff7a4f.jpg', 'password');
INSERT INTO users(username, fullname, email, filename, password)
VALUES ('jag', 'H.V. Jagadish', 'jag@umich.edu', '73ab33bd357c3fd42292487b825880958c595655.jpg', 'password');
INSERT INTO users(username, fullname, email, filename, password)
VALUES ('tdokas', 'Thomas Dokas', 'dokastho@umich.edu', 'tdokaspic.png', 'password');
-- add a resume to tdokas
INSERT INTO resumes(owner, name, typename)
VALUES ('tdokas', 'resume 1', 1);
INSERT INTO resumes(owner, name, typename)
VALUES ('tdokas', 'resume 2', 0);
-- add some entries for the resume
INSERT INTO entries(frequency, priority, owner, header, content)
VALUES (1, 1, 'tdokas', 'project', 'Programmed a dynamic resume compilation site which saw lots and lots of users!');
INSERT INTO entries(frequency, priority, owner, header, content)
VALUES (1, 1, 'tdokas', 'experience', 'Worked at a lab and received a raise for my abilities');
INSERT INTO entries(frequency, priority, owner, header, content)
VALUES (2, 2, 'tdokas', 'project', 'Built and managed my own server for remote development');
INSERT INTO entries(frequency, priority, owner, header, content)
VALUES (1, 1, 'tdokas', 'project', 'Added some content for another resume');
INSERT INTO resume_to_entry(resumeid, entryid, pos, owner)
VALUES (1, 1, 2, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (1, 2, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (1, 3, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (2, 3, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (2, 4, 'tdokas');
INSERT INTO entries(owner, location, typename, begin, end, gpa)
VALUES ('tdokas', 'University of Michigan', 1, 'AUG 2020', 'MAY 2023', 3.4);
INSERT INTO entries(owner, location, typename, begin, end, gpa)
VALUES ('tdokas', 'Michigan State University', 1, 'AUG 2019', 'MAY 2020', 3.9);
INSERT INTO entries(owner, location, typename, begin, end)
VALUES ('tdokas', 'MBNI', 0, 'AUG 2020', 'MAY 2023');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (1, 5, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (1, 6, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (1, 7, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (2, 5, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (2, 6, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (2, 7, 'tdokas');
