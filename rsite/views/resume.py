"""
Site main resume content view.

URLs include:
/resume/
/resume/load/
/resume/new/
"""
import flask
import rsite


@rsite.app.route('/resume/')
def show_resume():
    """Render react content for main resume page"""
    with rsite.app.app_context():
        logname = rsite.model.get_logname()
        context = {}
        if not logname:
            context["logname"] = "Sign In"
            context["logname_link"] = "/accounts/login/"
        else:
            context["logname"] = logname
            context["logname_link"] = f"/accounts/{logname}/"

    return flask.render_template('resume.html', **context)

@rsite.app.route('/resume/load/')
def load_resumes():
    """Return resumes from database matching logname."""
    with rsite.app.app_context():
        logname = rsite.model.get_logname()
        if not logname:
            flask.abort(403)

        database = rsite.model.get_db()
        cur = database.execute(
            "SELECT * "
            "FROM reumes "
            "WHERE owner == ?",
            (logname, )
        )
        resumes = cur.fetchall()
        data = {'resumes': []}
        for res in resumes:
            data['resumes'].append(
                {
                    "resumeid": res['resumeid'],
                    "owner": logname,
                    "content": res['content'],
                    "img": res['snapshot']
                }
            )
        return flask.jsonify(data), 201
