"""
Site resume rest api.

URLs include:
/resume/load/
/resume/save/
/resume/delete/
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
            rid = flask.request.args.get("id", default=0, type=int)

            if rid == 0:
                flask.abort(500)
            
            cur = database.execute(
                "SELECT * "
                "FROM entries "
                "WHERE owner == ?",
                "AND resumeid == ?",
                (logname, rid, )
            )
            entries = cur.fetchall()
            data = {'entries': entries}
        else:
            flask.abort(403)
        return flask.jsonify(data), 201

