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
            data = {'resumes': resumes}
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
            data = {'entries': entries}
        elif op == "resume":
            # load entries for a specific resume (and implicitly, user)
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

            data = {'entries': []}

            for eid in eids:
                cur = database.execute(
                    "SELECT * "
                    "FROM entries "
                    "WHERE owner == ?"
                    "AND entryid == ?",
                    (logname, eid['entryid'], )
                )
                entry = cur.fetchone()
                data['entries'].append(entry)
            
        else:
            flask.abort(403)
        return flask.jsonify(data), 201
