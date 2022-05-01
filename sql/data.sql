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
VALUES ('tdokas', 'Thomas Dokas', 'dokastho@umich.edu', '.jpg', 'password');
-- add a resume to tdokas
INSERT INTO resumes(owner, typename, snapshot)
VALUES ('tdokas', 1, '.jpg');
-- add some entries for the resume
INSERT INTO entries(resumeid, header, content)
VALUES (1, 'project', 'Programmed a dynamic resume compilation site which saw lots and lots of users!');
INSERT INTO entries(resumeid, header, content)
VALUES (1, 'project', 'Built and managed my own server for remote development');