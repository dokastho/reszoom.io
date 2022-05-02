"""
Site resume rest api.

URLs include:
/resume/load/
/resume/new/
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

        database = rsite.model.get_db()
        cur = database.execute(
            "SELECT * "
            "FROM resumes "
            "WHERE owner == ?",
            (logname, )
        )
        resumes = cur.fetchall()
        if len(resumes) == 0:
            flask.abort(500)
        data = {'resumes': []}
        for res in resumes:
            data['resumes'].append(
                {
                    "resumeid": res['resumeid'],
                    "owner": logname,
                    "type": res['typename'],
                    "img": res['snapshot']
                }
            )
        return flask.jsonify(data), 201
