"""
Site main resume content view.

URLs include:
/resume/
/resume/new/
/resume/<id>/
"""
import flask
import rsite
from rsite.model import show_username


@rsite.app.route('/resume/')
def show_resume():
    """Render react content for main resume page"""
    with rsite.app.app_context():
        context = show_username()
        return flask.render_template('resume.html', **context)


@rsite.app.route('/resume/new/')
def show_new():
    """Render react content for new resume page"""
    with rsite.app.app_context():
        context = show_username()
        return flask.render_template('new.html', **context)


@rsite.app.route('/resume/<int:resumeid>/')
def show_saved(resumeid):
    """Render react content for view/edit resume page"""
    with rsite.app.app_context():
        context = show_username()

        logname = context['logname']
        if logname == "Sign In":
            flask.abort(403)

        database = rsite.model.get_db()
        cur = database.execute(
            "SELECT * "
            "FROM resumes "
            "WHERE resumeid == ?",
            (resumeid, )
        )
        resume = cur.fetchone()

        if resume['owner'] != logname:
            flask.abort(403)

        return flask.render_template('view_edit.html', **context)
