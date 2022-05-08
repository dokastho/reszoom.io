"""
Site resume rest api.

URLs include:
/api/v1/entry/
/api/v1/entry/eid/
/api/v1/entry/meta/
"""

from os import abort
import flask
import rsite
from rsite.model import delete_helper, rest_api_auth_user

###############################################################################
##### ENTRIES # ENTRIES # ENTRIES # ENTRIES # ENTRIES # ENTRIES # ENTRIES #####
###############################################################################


@rsite.app.route("/api/v1/entry/", methods=['POST'])
def post_entry():
    """Post an entry."""

    logname, _ = rest_api_auth_user()

    resumeid = flask.request.args.get("resumeid", type=int, default=0)
    entryid = flask.request.args.get("entryid", type=int, default=0)
    header = flask.request.args.get("header", type=str, default='')
    op = flask.request.args.get("operation", type=str, default='')
    entry_type = flask.request.args.get("type", type=str, default='')
    begin = flask.request.args.get("begin", type=str, default='')
    end = flask.request.args.get("end", type=str, default='')
    subheader = flask.request.args.get("subheader", type=int)
    gpa = flask.request.args.get("gpa", type=int)

    # entry must be in json format
    if not flask.request.is_json:
        flask.abort(400)    # incorrect body

    body = flask.request.get_json()

    if "text" not in body:
        flask.abort(400)    # insufficient arguments

    content = body['text']

    if len(content) == 0 or len(header) == 0 or len(op) == 0 or len(entry_type) == 0 or resumeid == 0:
        flask.abort(400)
    if op == "create":
        data = do_create(logname, resumeid, entryid, header, content, type=entry_type, begin=begin, end=end, gpa=gpa, subheader=subheader)
    elif op == "update":
        data = do_update(logname, resumeid, entryid, header, content)

    return flask.jsonify(data), 201


@rsite.app.route("/api/v1/entry/<int:parent_entryid>/", methods=["GET"])
def get_subentries(parent_entryid):
    """Return subentries (and corresponding eids) of an entry"""
    if parent_entryid == 0:
        flask.abort(404)
    
    resumeid = flask.request.args.get("resumeid", type=int, default=0)

    if resumeid == 0:
        flask.abort(404)

    logname, database = rest_api_auth_user()

    # fetch entries with this entry as a subheader
    cur = database.execute(
        "SELECT * "
        "FROM entries "
        "WHERE subheader == ? ",
        (parent_entryid, )
    )
    data = cur.fetchall()

    entries = {}
    eids = []
    # verify request and user authority
    for entry in data:
        if logname != entry['owner']:
            flask.abort(403)

        entryid = entry['entryid']
        entries[entryid] = {
            'frequency': entry['frequency'],
            'priority': entry['priority'],
            'owner': entry['owner'],
            'header': entry['header'],
            'subheader': entry['subheader'],
            'content': entry['content'],
            'type': entry['type'],
            'begin': entry['begin'],
            'end': entry['end'],
            'gpa': entry['gpa']
        }
        # fetch eid for the entry
        cur = database.execute(
            "SELECT * "
            "FROM resume_to_entry "
            "WHERE resumeid == ? "
            "AND entryid == ?",
            (resumeid, entryid, )
        )
        eid = cur.fetchone()
        eids.append(eid)

    data = {
        "entries": entries,
        "eids": eids
    }

    return flask.jsonify(data), 201


@ rsite.app.route("/api/v1/entry/<int:entryid>/", methods=['DELETE'])
def delete_entry(entryid):
    """Delete an entry."""
    if entryid == 0:
        flask.abort(404)

    logname, database = rest_api_auth_user()

    cur = database.execute(
        "SELECT * "
        "FROM entries "
        "WHERE entryid == ?",
        (entryid, )
    )
    entry = cur.fetchone()

    if logname != entry['owner']:
        flask.abort(403)

    delete_helper(entry['entryid'], entry['frequency'])

    return flask.Response(status=204)


@ rsite.app.route("/api/v1/entry/meta/", methods=['POST'])
def swap_entry():
    """Update the resume_to_entry db entry with the new positions."""

    pos1 = flask.request.args.get("pos1", type=int, default=0)
    pos2 = flask.request.args.get("pos2", type=int, default=0)

    if pos1 == 0 or pos2 == 0:
        flask.abort(404)

    logname, database = rest_api_auth_user()

    temp = 1

    # authenticate the user as owner
    cur = database.execute(
        "SELECT * "
        "FROM resume_to_entry "
        "WHERE pos == ? AND owner == ?",
        (pos1, logname, )
    )
    auth1 = cur.fetchone()
    cur = database.execute(
        "SELECT * "
        "FROM resume_to_entry "
        "WHERE pos == ? AND owner == ?",
        (pos2, logname, )
    )
    auth2 = cur.fetchone()

    if auth1 is None or auth2 is None:
        flask.abort(403)

    # update the entries
    # set pos1 to temp
    cur = database.execute(
        "UPDATE resume_to_entry "
        "SET pos = ? "
        "WHERE pos == ? ",
        (temp, pos1, )
    )
    val = cur.fetchone()
    # set pos2 to pos1
    cur = database.execute(
        "UPDATE resume_to_entry "
        "SET pos = ? "
        "WHERE pos == ? ",
        (pos1, pos2, )
    )
    val = cur.fetchone()
    # set pos1 to pos2
    cur = database.execute(
        "UPDATE resume_to_entry "
        "SET pos = ? "
        "WHERE pos == ? ",
        (pos2, temp, )
    )
    val = cur.fetchone()

    return flask.Response(status=204)


###############################################################################
##### HELPERS # HELPERS # HELPERS # HELPERS # HELPERS # HELPERS # HELPERS #####
###############################################################################


def do_create(logname, resumeid, entryid, header, content, type, begin, end, gpa, subheader, priority=1, pos=0):
    """Helper function for creating an entry."""
    database = rsite.model.get_db()

    freq = 1
    # entryid not supplied, so entry is new
    if entryid == 0:
        # insert new
        cur = database.execute(
            "INSERT INTO entries "
            "(frequency, priority, owner, header, content, type, begin, end, gpa, subheader) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (freq, priority, logname, header, content, type, begin, end, gpa, subheader, )
        )
        cur.fetchone()

        # get id
        # TODO: in a busy DB, getting the max like this will likely not work
        cur = database.execute(
            "SELECT MAX(entryid) "
            "AS id "
            "FROM entries"
        )
        data = cur.fetchone()
        newEntryid = data['id']

        # if pos is specified, then we want to update resume_to_entry
        if pos == 0:
            # insert id into resume_to_entry
            cur = database.execute(
                "INSERT INTO resume_to_entry "
                "(resumeid, entryid, owner) "
                "VALUES (?, ?, ?)",
                (resumeid, newEntryid, logname, )
            )
            cur.fetchone()

        else:
            # update pos
            cur = database.execute(
                "UPDATE resume_to_entry "
                "SET entryid=? "
                "WHERE pos == ?",
                (newEntryid, pos, )
            )
            cur.fetchone()

        entryid = newEntryid

    else:
        # entry already in db so increment freq
        cur = database.execute(
            "SELECT frequency "
            "FROM entries "
            "WHERE entryid == ?",
            (entryid, )
        )
        data = cur.fetchone()
        freq = data['frequency']
        freq += 1

        cur = database.execute(
            "UPDATE entries "
            "SET frequency = ?, priority = ? "
            "WHERE entryid == ?",
            (freq, freq, entryid, )
        )
        cur.fetchone()

    # get eid from resume_to_entry (including the pos autoincrement)
    cur = database.execute(
        "SELECT * "
        "FROM resume_to_entry "
        "WHERE resumeid == ? "
        "AND entryid == ? "
        "AND owner == ? ",
        (resumeid, entryid, logname, )
    )
    eid = cur.fetchone()
    return {
        "eid": eid,
        "entry":
        {
            "content": content,
            "frequency": freq,
            "priority": freq,
            "header": header,
            "owner": logname,
            "type": type,
            "begin": begin,
            "end": end,
            "gpa": gpa
        }
    }


def do_update(logname, resumeid, entryid, header, content):
    """Helper function for updating an entry"""
    database = rsite.model.get_db()

    # get the entry
    cur = database.execute(
        "SELECT * "
        "FROM entries "
        "WHERE entryid == ?",
        (entryid, )
    )
    oldentry = cur.fetchone()

    freq = oldentry['frequency']

    # entry must be valid
    if oldentry is None:
        flask.abort(400)

    # if freq is 1, just change content
    if freq == 1:
        cur = database.execute(
            "UPDATE entries "
            "SET content = ? "
            "WHERE entryid == ?",
            (content, entryid, )
        )
        cur.fetchone()

        # get eid from resume_to_entry (including the pos autoincrement)
        cur = database.execute(
            "SELECT * "
            "FROM resume_to_entry "
            "WHERE resumeid == ? "
            "AND entryid == ? "
            "AND owner == ? ",
            (resumeid, entryid, logname, )
        )
        eid = cur.fetchone()
        data = {
            "eid": eid,
            "entry":
            {
                "content": content,
                "frequency": freq,
                "priority": freq,
                "header": header,
                "owner": logname
            }
        }

    # else copy the attributes of the old entry
    else:
        # decrement freq
        priority = freq
        freq -= 1
        cur = database.execute(
            "UPDATE entries "
            "SET frequency = ? "
            "WHERE entryid == ?",
            (freq, entryid, )
        )
        cur.fetchone()
        # update entry in resume_to_entry
        pos = flask.request.args.get("pos", type=int, default=0)
        if pos == 0:
            flask.abort(502)
        # create new entry
        # id here is 0 so that it creates a new entry.
        # down the line I'd like to make it impossible to create two of the
        # same entries, so with that in mind I will want to change that.
        # priority here is duplicated with the old entry so that a newly edited
        # entry will not be poorly favored by the program
        #
        data = do_create(logname, resumeid, 0, header, content, priority, pos)

    return data
