"""
Site resume rest api.

URLs include:
/api/v1/resume/load/
/api/v1/resume/
"""
import flask
import rsite


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
            if len(entries) == 0:
                flask.abort(500)

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
            rid = flask.request.args.get("id", default=0, type=int)

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

            # construct the response
            res = {
                'eids': eids,
                'entries': data,
                'username': userinfo['username'],
                'fullname': userinfo['fullname'],
                'email': userinfo['email'],
            }
        else:
            flask.abort(403)
        return flask.jsonify(res), 201
