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
  name VARCHAR(64) NOT NULL,
  typename BOOLEAN NOT NULL,
  -- snapshot VARCHAR(64) NOT NULL, todo add snapshot later
  FOREIGN KEY(owner) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE entries(
  entryid INTEGER PRIMARY KEY AUTOINCREMENT,
  priority INTEGER NOT NULL,
  frequency INTEGER NOT NULL,
  owner VARCHAR(20) NOT NULL,
  header VARCHAR(64) NOT NULL,
  content VARCHAR(256),
  FOREIGN KEY(owner) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE tags(
  tagid INTEGER PRIMARY KEY AUTOINCREMENT,
  tagname VARCHAR(20) NOT NULL
);

CREATE TABLE entry_to_tag(
  entryid INTEGER NOT NULL,
  tagid INTEGER NOT NULL,
  PRIMARY KEY(entryid, tagid),
  FOREIGN KEY(entryid) REFERENCES entries(entryid) ON DELETE CASCADE,
  FOREIGN KEY(tagid) REFERENCES tags(tagid) ON DELETE CASCADE
);

-- reserve pos 1 for swaps
CREATE TABLE resume_to_entry(
  resumeid INTEGER NOT NULL,
  pos INTEGER PRIMARY KEY AUTOINCREMENT,
  entryid INTEGER NOT NULL,
  owner VARCHAR(20) NOT NULL,
  -- PRIMARY KEY(resumeid, entryid),
  FOREIGN KEY(entryid) REFERENCES entries(entryid) ON DELETE CASCADE,
  FOREIGN KEY(resumeid) REFERENCES resumes(resumeid) ON DELETE CASCADE,
  FOREIGN KEY(owner) REFERENCES users(username) ON DELETE CASCADE
);

-- education and experience
-- todo should experience have entries? I think so... header for those would be experience
--    and I can load them based on resumeid
CREATE TABLE experience(
  owner VARCHAR(20) NOT NULL,
  location VARCHAR(64) NOT NULL,
  content VARCHAR(256) NOT NULL,
  typename BOOLEAN NOT NULL,
  begin INTEGER NOT NULL,
  end INTEGER NOT NULL,
  gpa INTEGER,
  FOREIGN KEY(owner) REFERENCES users(username) ON DELETE CASCADE
);
