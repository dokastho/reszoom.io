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
INSERT INTO resumes(owner, name, typename, description)
VALUES ('tdokas', 'resume 1', 1, 'my first student resume.');
INSERT INTO resumes(owner, name, typename, description)
VALUES ('tdokas', 'resume 2', 0, '..........................................................end....this should only be viewable on the resume page.....................................................................................................................');
INSERT INTO resumes(owner, name, typename)
VALUES ('tdokas', 'resume 3', 1);
-- add some entries for the resume

-- experience
INSERT INTO entries(frequency, priority, owner, header, content, type, begin, end, gpa, location, title)
VALUES (2, 2, 'tdokas', 'education','University of Michigan', 0, '2020-08', '2023-05', 3.4, "Ann Arbor, MI", "Bachelor in Computer Science & Engineering");
INSERT INTO entries(frequency, priority, owner, header, content, type, begin, end, gpa, location, title)
VALUES (2, 2, 'tdokas', 'education','Michigan State University', 0, '2019-08', '2020-05', 3.9, "East Lansing, MI", "Bachelor in Computer Science & Engineering");
INSERT INTO entries(frequency, priority, owner, header, content, type, begin, end, location, title)
VALUES (2, 2, 'tdokas', 'experience','MBNI', 0, '2020-08', '2023-05', "Ann Arbor, MI", "Programming Assistant");
INSERT INTO resume_to_entry(resumeid, entryid, pos, owner)
VALUES (1, 1, 2, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (1, 2, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (1, 3, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (2, 1, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (2, 2, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (2, 3, 'tdokas');

-- entries
INSERT INTO entries(frequency, priority, owner, header, content, type)
VALUES (1, 1, 'tdokas', 'project', 'Programmed a dynamic resume compilation site which saw lots and lots of users!', 1);
INSERT INTO entries(frequency, priority, owner, header, parent, content, type)
VALUES (2, 2, 'tdokas', 'experience', 3, 'Worked at a lab and received a raise for my abilities', 1);
INSERT INTO entries(frequency, priority, owner, header, content, type)
VALUES (2, 2, 'tdokas', 'project', 'Built and managed my own server for remote development', 1);
INSERT INTO entries(frequency, priority, owner, header, content, type)
VALUES (1, 1, 'tdokas', 'project', 'Added some content for another resume', 1);
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (1, 4, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (1, 5, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (1, 6, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (2, 5, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (2, 6, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (2, 7, 'tdokas');

-- another education & experience to test recommending for resume 1
INSERT INTO entries(frequency, priority, owner, header, content, type, begin, end, gpa, location, title)
VALUES (1, 1, 'tdokas', 'education','test school', 0, '1970-01', '2023-05', 0.0, "foo", "bar");
INSERT INTO entries(frequency, priority, owner, header, content, type, begin, end, location, title)
VALUES (1, 1, 'tdokas', 'experience','test work', 0, '2020-08', '2023-05', "foo", "bar");
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (2, 8, 'tdokas');
INSERT INTO resume_to_entry(resumeid, entryid, owner)
VALUES (2, 9, 'tdokas');