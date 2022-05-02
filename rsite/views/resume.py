"""
Site main resume content view.

URLs include:
/resume/
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
