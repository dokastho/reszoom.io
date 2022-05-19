"""
Site resume rest api.

URLs include:
/api/v1/entry/
/api/v1/entry/eid/
/api/v1/entry/meta/
"""

import flask
import rsite
from rsite.model import delete_helper, get_db, rest_api_auth_user, print_log
from threading import Thread
import socket

###############################################################################
##### ENTRIES # ENTRIES # ENTRIES # ENTRIES # ENTRIES # ENTRIES # ENTRIES #####
###############################################################################


@rsite.app.route("/api/v1/entry/", methods=['POST'])
def post_entry():
    """Post an entry."""

    # just check user credentials
    rest_api_auth_user()

    op = flask.request.args.get("operation", type=str, default='')

    # entry must be in json format
    if not flask.request.is_json:
        flask.abort(400)    # incorrect body

    body = load_body()

    if len(body['content']) == 0 or len(body['header']) == 0 or len(op) == 0 or body['resumeid'] == 0:
        flask.abort(400)
    if op == "create":
        data = do_create(body)
    elif op == "update":
        data = do_update(body)

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

    # fetch entries with this entry as a parent
    cur = database.execute(
        "SELECT * "
        "FROM entries "
        "WHERE parent == ? ",
        (parent_entryid, )
    )
    data = cur.fetchall()

    entries = {}
    eids = []
    # verify request and user authority
    entry: dict
    for entry in data:
        if logname != entry['owner']:
            flask.abort(403)

        entryid = entry['entryid']
        # fetch eid for the entry
        cur = database.execute(
            "SELECT * "
            "FROM resume_to_entry "
            "WHERE resumeid == ? "
            "AND entryid == ?",
            (resumeid, entryid, )
        )
        eid = cur.fetchone()
        # want to continue if the eid does not correspond to both resume and entry
        if eid is None:
            continue
        eids.append(eid)

        # remove from reply
        del entry['entryid']
        entries[entryid] = entry

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

    # delete any subentries
    cur = database.execute(
        "SELECT * "
        "FROM entries "
        "WHERE parent == ?",
        (entryid, )
    )
    subentries = cur.fetchall()

    for entry in subentries:
        if logname != entry['owner']:
            flask.abort(403)

        delete_helper(entry['entryid'], entry['frequency'])

    return flask.Response(status=204)


@ rsite.app.route("/api/v1/entry/<string:header>/", methods=['POST'])
def get_recommended(header):
    """Get the other entries owned by this user for a given header."""
    """Send: array of recommended entries"""
    # TODO: recommend the entries matching tags
    if header == '':
        flask.abort(404)

    logname, database = rest_api_auth_user()

    # get list of id's to not return from body
    body = flask.request.get_json()
    if "entries" not in body:
        flask.abort(400)  # insufficient data

    # get type from request
    type = flask.request.args.get("type", type=str, default='')
    if type == '':
        flask.abort(400)  # insufficient data

    existing_entries = [int(x) for x in body['entries']]

    cur = database.execute(
        "SELECT * "
        "FROM entries "
        "WHERE header == ? "
        "AND owner == ?"
        "AND type == ?",
        (header, logname, type, )
    )
    entries = cur.fetchall()

    # construct response
    data = []
    for entry in entries:
        entryid = entry['entryid']
        # ignore those entries that are already in the resume
        if entryid in existing_entries:
            continue
        data.append(entry)

    # sort data by priority
    sortedData = sorted(data, key=lambda d: d['priority'], reverse=True)

    return flask.jsonify({'recommended': sortedData}), 201


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
    cur.fetchone()
    # set pos1 to pos2
    cur = database.execute(
        "UPDATE resume_to_entry "
        "SET pos = ? "
        "WHERE pos == ? ",
        (pos2, temp, )
    )
    cur.fetchone()

    return flask.Response(status=204)


###############################################################################
##### HELPERS # HELPERS # HELPERS # HELPERS # HELPERS # HELPERS # HELPERS #####
###############################################################################


def do_create(body):
    """Helper function for creating an entry."""
    logname, database = rest_api_auth_user()

    # set default values for creating
    if 'priority' not in body:
        body['priority'] = 1

    if 'pos' not in body:
        body['pos'] = 0

    freq = 1

    entryid = body['entryid']

    # entryid not supplied, so entry is new
    if entryid == 0:
        # insert new
        cur = database.execute(
            "INSERT INTO entries "
            "(frequency, priority, owner, header, content, type, begin, end, gpa, parent, title, location) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (freq, body['priority'], logname, body['header'], body['content'],
             body['type'], body['begin'], body['end'], body['gpa'], body['parent'],
             body['title'], body['location'])
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
        if body['pos'] == 0:
            # insert id into resume_to_entry
            cur = database.execute(
                "INSERT INTO resume_to_entry "
                "(resumeid, entryid, owner) "
                "VALUES (?, ?, ?)",
                (body['resumeid'], newEntryid, logname, )
            )
            cur.fetchone()

        else:
            # update pos
            cur = database.execute(
                "UPDATE resume_to_entry "
                "SET entryid=? "
                "WHERE pos == ?",
                (newEntryid, body['pos'], )
            )
            cur.fetchone()

        entryid = newEntryid
        
        # set tags
        # only necessary for new tags that are type entry
        if body['type']:
            t = Thread(target=set_tags, args=(entryid, body['content'],))
            t.start()

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

        # insert id into resume_to_entry
        cur = database.execute(
            "INSERT INTO resume_to_entry "
            "(resumeid, entryid, owner) "
            "VALUES (?, ?, ?)",
            (body['resumeid'], entryid, logname, )
        )
        cur.fetchone()

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
        (body['resumeid'], entryid, logname, )
    )
    eid = cur.fetchone()

    # construct entry
    return {
        "eid": eid,
        "entry":
        {
            "content": body['content'],
            "frequency": freq,
            "priority": freq,
            "header": body['header'],
            "owner": logname,
            "type": body['type'],
            "begin": body['begin'],
            "end": body['end'],
            "gpa": body['gpa'],
            "title": body['title'],
            "location": body['location']
        }
    }


# def do_update(logname, resumeid, entryid, header, content, type, begin, end, gpa, parent, update_all):
def do_update(body: dict):
    """Helper function for updating an entry"""
    logname, database = rest_api_auth_user()

    entryid = body['entryid']

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

    # if freq is 1, just change content, or if we want to update the entry across all entries
    if freq == 1 or body['all']:
        # delete all tags with this entryid
        cur = database.execute(
            "DELETE FROM entry_to_tag "
            "WHERE entryid == ? ",
            (entryid, )
        )
        cur.fetchone()
        
        if body['type']:
            # set new tags
            t = Thread(target=set_tags, args=(entryid, body['content'],))
            t.start()
        
        cur = database.execute(
            "UPDATE entries "
            "SET content = ?, "
            "begin = ?, "
            "end = ?, "
            "gpa = ?, "
            "title = ?, "
            "location = ? "
            "WHERE entryid == ?",
            (body['content'], body['begin'], body['end'],
             body['gpa'], body['title'], body['location'], entryid, )
        )
        cur.fetchone()

        # get eid from resume_to_entry (including the pos autoincrement)
        cur = database.execute(
            "SELECT * "
            "FROM resume_to_entry "
            "WHERE resumeid == ? "
            "AND entryid == ? "
            "AND owner == ? ",
            (body['resumeid'], entryid, logname, )
        )
        eid = cur.fetchone()
        data = {
            "eid": eid,
            "entry":
            {
                "content": body['content'],
                "begin": body['begin'],
                "end": body['end'],
                "gpa": body['gpa'],
                "frequency": freq,
                "priority": freq,
                "header": body['header'],
                "type": body['type'],
                "parent": body['parent'],
                "owner": logname,
                "title": body['title'],
                "location": body['location']
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
        body['priority'] = priority
        body['pos'] = pos
        body['entryid'] = 0
        data = do_create(body)

    return data


def load_body():
    """Load and set default values for a body json."""
    body = flask.request.get_json()

    if "content" not in body or "resumeid" not in body or \
            "entryid" not in body or "header" not in body or \
            "type" not in body or "begin" not in body or \
            "end" not in body or "all" not in body or \
            "location" not in body or "title" not in body:
        flask.abort(400)    # insufficient arguments

    if "gpa" not in body:
        body['gpa'] = None
    if "begin" not in body:
        body['begin'] = None
    if "end" not in body:
        body['end'] = None
    if "parent" not in body:
        body['parent'] = None

    return body


def set_tags(entryid, content: str):
    """target function of a thread to send data to tags server & set db entries on reply."""
    host = "localhost"
    port = 0

    server_host = "localhost"
    server_port = 8888

    MSG_SIZE = 264

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as listen_sock:
        # bind worker socket to its server
        listen_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

        listen_sock.bind((host, port))
        port = listen_sock.getsockname()[1]
        
        msg = "@@@" + str(port) + content + '\0'*(MSG_SIZE - len(content))

        listen_sock.listen()
        # send msg
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as send_sock:

            # attempt to establish connection with tag server
            try:
                send_sock.connect((server_host, server_port))
            except:
                print_log("Failed to connect to tag server", "ERROR")
                return

            # register with manager
            send_sock.sendall(msg.encode('utf-8'),)

        while True:
            try:
                clientsocket, address = listen_sock.accept()
            except socket.timeout:
                continue
            # debug info
            print_log("Connection from " + address[0], "OK")
            with clientsocket:
                message_chunks = []
                while True:
                    try:
                        data = clientsocket.recv(4096)
                    except socket.timeout:
                        continue
                    if not data:
                        break
                    message_chunks.append(data)
            # Decode list-of-byte-strings to UTF8 and parse JSON data
            message_bytes = b''.join(message_chunks)
            message_decode = message_bytes.decode("utf-8")
            
            # remove trailing empty portion of message
            message_str = message_decode.replace("\x00", "")

            msg_tags = message_str.split()
            break
    with rsite.app.app_context():
        # handle tags
        database = get_db()
        cur = database.execute(
            "SELECT * "
            "FROM tags "
        )
        db_tags = cur.fetchall()

        # construct db tags dict
        db_tags_dict = {}
        for tag in db_tags:
            db_tags_dict[tag['tagname']] = tag['tagid']

        # insert tags if necessary
        for tag in msg_tags:
            if tag not in db_tags_dict.keys():
                # insert tag into db
                cur = database.execute(
                    "INSERT INTO tags "
                    "(tagname) "
                    "VALUES(?)",
                    (tag, )
                )
                cur.fetchone()
                cur = database.execute(
                    "SELECT MAX(tagid) "
                    "AS id "
                    "FROM tags"
                )
                data = cur.fetchone()
                tagid = int(data['id'])

            else:
                tagid = int(db_tags_dict[tag])

            # insert tagid
            cur = database.execute(
                "INSERT INTO entry_to_tag "
                "(entryid, tagid) "
                "VALUES(?, ?)",
                (entryid, tagid, )
            )
            cur.fetchone()
            print_log(f'{entryid}: added tag "{tag}"', "OK")
