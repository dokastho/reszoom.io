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

        if op == "resume":
            cur = database.execute(
                "SELECT * "
                "FROM resumes "
                "WHERE owner == ?",
                (logname, )
            )
            resumes = cur.fetchall()
            if len(resumes) == 0:
                flask.abort(500)
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
        return flask.jsonify(data), 201


@rsite.app.route('/api/v1/resume/new/', methods=['GET'])
def load_resumes():
    """Return data for a new resume, if they exist."""
    with rsite.app.app_context():
        logname = rsite.model.get_logname()
        if not logname:
            flask.abort(403)

        database = rsite.model.get_db()
        cur = database.execute(
            "SELECT * "
            "FROM entries "
            "WHERE owner == ?",
            (logname, )
        )
        resumes = cur.fetchall()
        if len(resumes) == 0:
            flask.abort(500)
        data = {'resumes': resumes}
        return flask.jsonify(data), 201
