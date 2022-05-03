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
                "WHERE owner == ?"
                "AND resumeid == ?",
                (logname, rid, )
            )
            entries = cur.fetchall()
            data = {'entries': entries}
        else:
            flask.abort(403)
        return flask.jsonify(data), 201


@rsite.app.route('/api/v1/resume/', methods=['POST'])
def load_resumes():
    """Resolve post requests for the resume."""

    op = flask.request.args.get("operation", default=None, type=str)
    rid = flask.request.args.get("id", default=0, type=int)

    if rid == 0 or op is None:
        flask.abort(404)

    if op == "create":
        pass
    elif op == "delete":
        database = rsite.model.get_db()
        cur = database.execute(
            "SELECT * "
            "FROM entries "
            "WHERE resumeid == ?",
            (rid, )
        )
        entries = cur.fetchall()
    elif op == "save":
        pass


@rsite.app.route('/api/v1/resume/save/', methods=['DELETE'])
def load_resumes():
    """Remove resume from db if the credentials match."""
