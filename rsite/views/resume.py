"""
Site main resume content view.

URLs include:
/resume/
/resume/new/
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
def show_maker():
    """Render react content for new/edit resume page"""
    with rsite.app.app_context():
        context = show_username()
        return flask.render_template('make.html', **context)
