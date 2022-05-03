"""
Site index (main) view.

URLs include:
/
"""
import flask
import rsite
from rsite.model import show_username


@rsite.app.route('/')
def show_index():
    """Serve index html for logged in user."""
    with rsite.app.app_context():
        # logname must exist in session
        context = show_username()

    return flask.render_template("index.html", **context)
