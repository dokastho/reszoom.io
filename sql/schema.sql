PRAGMA foreign_keys = ON;

CREATE TABLE users(
  username VARCHAR(20) NOT NULL,
  fullname VARCHAR(40) NOT NULL,
  email VARCHAR(40) NOT NULL,
  filename VARCHAR(64) NOT NULL,
  password VARCHAR(256) NOT NULL,
  created DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(username)
);

CREATE TABLE resumes(
  resumeid INTEGER PRIMARY KEY AUTOINCREMENT,
  owner VARCHAR(20) NOT NULL,
  typename BOOLEAN NOT NULL,
  snapshot VARCHAR(64) NOT NULL,
  FOREIGN KEY(owner) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE entries(
  resumeid INTEGER NOT NULL,
  entryid INTEGER PRIMARY KEY AUTOINCREMENT,
  header VARCHAR(64) NOT NULL,
  content VARCHAR(256),
  FOREIGN KEY(resumeid) REFERENCES resumes(resumeid) ON DELETE CASCADE
);

CREATE TABLE tags(
  tagid INTEGER PRIMARY KEY AUTOINCREMENT,
  tagname VARCHAR(20) NOT NULL
);

CREATE TABLE entries_to_tags(
  entryid INTEGER NOT NULL,
  tagid INTEGER NOT NULL,
  PRIMARY KEY(entryid, tagid),
  FOREIGN KEY(entryid) REFERENCES entries(entryid) ON DELETE CASCADE,
  FOREIGN KEY(tagid) REFERENCES tags(tagid) ON DELETE CASCADE
);
-- todo education table