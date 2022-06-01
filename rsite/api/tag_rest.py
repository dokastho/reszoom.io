
"""
Site resume rest api.

URLs include:
/api/v1/<entryid>/tags
"""

import flask
import rsite
import socket
from rsite.model import rest_api_auth_user, get_db, print_log


@rsite.app.route("/api/v1/<int:resumeid>/tags/", methods=['GET'])
def get_resume_tags(resumeid):
    """Return tags for a resume."""

    if resumeid == 0:
        flask.abort(400)

    data = {
        "tags": fetch_resume_tags(resumeid)
    }

    return flask.jsonify(data), 201


def get_most_popular_entry(tag) -> dict:
    # get tagid
    database = get_db()
    cur = database.execute(
        "SELECT tagid "
        "FROM tags "
        "WHERE tagname == ?",
        (tag,)
    )
    tagid = cur.fetchone()["tagid"]

    # get entries matching tagname
    cur = database.execute(
        "SELECT entryid "
        "FROM entry_to_tag "
        "WHERE tagid == ?",
        (tagid,)
    )
    entryids = cur.fetchall()

    the_max = {'frequency': 0}
    for entryid in entryids:
        entryid = entryid['entryid']
        cur = database.execute(
            "SELECT * "
            "FROM entries "
            "WHERE entryid == ?",
            (entryid,)
        )
        entry = cur.fetchone()
        if entry["frequency"] > the_max["frequency"]:
            the_max = entry
    return the_max


def set_tags(resumeid, entryid, content: str):
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

    # SET TAGS
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
            # insert tag into tag db
            if tag not in db_tags_dict.keys():
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
                "(entryid, resumeid, tagid) "
                "VALUES(?, ?, ?)",
                (entryid, resumeid, tagid, )
            )
            cur.fetchone()

            print_log(f'{entryid}: added tag "{tag}"', "OK")


def fetch_resume_tags(resumeid) -> list:
    """Return a list of tags that this resume has."""

    database = get_db()

    # fetch the tag ids this resume has
    cur = database.execute(
        "SELECT tagid "
        "FROM entry_to_tag "
        "WHERE resumeid == ?",
        (resumeid,)
    )
    tagids = cur.fetchall()

    tagnames = set()

    # construct list of tagnames
    for tagid in tagids:
        # fetch tagname
        tagid = tagid['tagid']
        cur = database.execute(
            "SELECT tagname "
            "FROM tags "
            "WHERE tagid == ?",
            (tagid,)
        )
        tagnames.add(cur.fetchone()['tagname'])

    return list(tagnames)


def fetch_entry_tags(resumeid, entryid) -> list:
    """Get the other entries owned by this user for a given header."""
    """Send: array of recommended entries"""

    if entryid is None:
        flask.abort(404)

    _, database = rest_api_auth_user()

    # get tagids
    cur = database.execute(
        "SELECT * "
        "FROM entry_to_tag "
        "WHERE entryid == ? "
        "AND resumeid == ?",
        (entryid, resumeid,)
    )
    tagids = cur.fetchall()

    # construct response
    # entryid: array of tag name/id pairs
    tags = []
    for tagid in tagids:
        tagid = tagid['tagid']
        cur = database.execute(
            "SELECT * "
            "FROM tags "
            "WHERE tagid == ? ",
            (tagid,)
        )
        t = cur.fetchone()
        tags.append(t["tagname"])

    return tags