"""
Site resume rest api.

URLs include:
/api/v1/resume/load/
/api/v1/resume/
"""
import flask
import rsite
from rsite.model import delete_helper


@rsite.app.route('/api/v1/resume/load/', methods=['GET'])
def load_resumes():
    """Return resumes from database matching logname."""
    with rsite.app.app_context():
        logname = rsite.model.get_logname()
        if not logname:
            flask.abort(403)

        op = flask.request.args.get("fetch", default="resume", type=str)

        database = rsite.model.get_db()

        if op == "list":
            cur = database.execute(
                "SELECT * "
                "FROM resumes "
                "WHERE owner == ?",
                (logname, )
            )
            resumes = cur.fetchall()
            res = {'resumes': resumes}
        elif op == "userinfo":
            # load all entries for a specific user
            cur = database.execute(
                "SELECT * "
                "FROM entries "
                "WHERE owner == ?",
                (logname, )
            )
            entries = cur.fetchall()

            # construct entries map
            data = {}
            for entry in entries:
                data[entry['entryid']] = {
                    'frequency': entry['frequency'],
                    'owner': entry['owner'],
                    'header': entry['header'],
                    'content': entry['content']
                }

            # get eids for the resume id
            rid = flask.request.args.get("resumeid", default=0, type=int)

            if rid == 0:
                flask.abort(404)
            cur = database.execute(
                "SELECT * "
                "FROM resume_to_entry "
                "WHERE resumeid == ?",
                (rid, )
            )
            eids = cur.fetchall()

            # get the userinfo
            cur = database.execute(
                "SELECT * "
                "FROM users "
                "WHERE username == ?",
                (logname, )
            )
            userinfo = cur.fetchone()

            # get the resume info
            cur = database.execute(
                "SELECT * "
                "FROM resumes "
                "WHERE resumeid == ?",
                (rid, )
            )
            resumeinfo = cur.fetchone()

            # construct the response
            res = {
                'eids': eids,
                'entries': data,
                'username': userinfo['username'],
                'fullname': userinfo['fullname'],
                'email': userinfo['email'],
                'resumename': resumeinfo['name'],
                'resumetype': resumeinfo['typename']
            }
        else:
            flask.abort(403)
        return flask.jsonify(res), 201

###############################################################################
##### ENTRIES # ENTRIES # ENTRIES # ENTRIES # ENTRIES # ENTRIES # ENTRIES #####
###############################################################################

@rsite.app.route("/api/v1/entry/", methods=['POST'])
def create_entry():
    """Post an entry."""
    database = rsite.model.get_db()

    logname = rsite.model.get_logname()
    if not logname:
        flask.abort(403)

    resumeid = flask.request.args.get("resumeid", type=int, default=0)
    entryid = flask.request.args.get("entryid", type=int, default=0)
    header = flask.request.args.get("header", type=str, default='')

    # entry must be in json format
    if not flask.request.is_json:
        flask.abort(400)    # incorrect body

    body = flask.request.get_json()

    if "text" not in body:
        flask.abort(400)    # insufficient arguments

    content = body['text']    

    if len(content) == 0 or len(header) == 0 or resumeid == 0:
        flask.abort(400)

    freq = 1
    # entryid not supplied, so entry is new
    if entryid == 0:
        # insert new
        cur = database.execute(
            "INSERT INTO entries "
            "(frequency, owner, header, content) "
            "VALUES (?, ?, ?, ?)",
            (freq, logname, header, content, )
        )
        cur.fetchone()

        # get id
        cur = database.execute(
            "SELECT MAX(entryid) "
            "AS id "
            "FROM entries"
        )
        data = cur.fetchone()
        entryid = data['id']

        # insert id into resume_to_entry
        cur = database.execute(
            "INSERT INTO resume_to_entry "
            "(resumeid, entryid, owner) "
            "VALUES (?, ?, ?)",
            (resumeid, entryid, logname, )
        )
        cur.fetchone()

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
            "SET frequency = ? "
            "WHERE entryid == ?",
            (freq, entryid, )
        )
        cur.fetchone()

    return flask.jsonify({
        "entryid": entryid,
        "resumeid": resumeid,
        "entry":
        {
            "content": content,
            "frequency": freq,
            "header": header,
            "owner": logname
        }
    }), 201

@rsite.app.route("/api/v1/entry/<int:entryid>/", methods=['DELETE'])
def delete_entry(entryid):
    """Delete an entry."""
    if entryid == 0:
            flask.abort(404)
    
    database = rsite.model.get_db()

    logname = rsite.model.get_logname()
    if not logname:
        flask.abort(403)

    cur = database.execute(
        "SELECT * "
        "FROM entries "
        "WHERE entryid == ?",
        (entryid, )
    )
    entry = cur.fetchone()

    if logname != entry['owner']:
        flask.abort(403)
        
    delete_helper(entry)

    return flask.Response(status=204)


@rsite.app.route("/api/v1/entry/meta/<int:posid>/", methods=['POST'])
def move_entry(posid):
    """Update the resume_to_entry db entry with the new positions."""
    
    new_pos = flask.request.args.get("newPos", type=int, default=0)

    if posid == 0 or new_pos == 0:
        flask.abort(404)
    
    logname = rsite.model.get_logname()
    if not logname:
        flask.abort(403)
    
    database = rsite.model.get_db()
    # authenticate the user as owner
    cur = database.execute(
        "SELECT * "
        "FROM resume_to_entry "
        "WHERE pos == ? AND owner == ?",
        (posid, logname, )
    )
    auth = cur.fetchone()
    
    if auth is None:
        flask.abort(403)
    
    # update the entries
    cur = database.execute(
        "UPDATE resume_to_entry "
        "SET pos = ? "
        "WHERE pos == ? ",
        (posid, posid, )
    )
    cur.fetchone()

    return flask.Response(status=204)
    