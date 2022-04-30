"""
Site index (main) view.

URLs include:
/
"""
import flask
import rsite as site


@site.app.route('/')
def show_index():
    """Serve index html for logged in user."""
    with site.app.app_context():
        # logname must exist in session
        logname = site.model.check_session()
        if not logname:
            return flask.redirect("/accounts/login/")

        context = {
            "logname": logname,
            "logname_link": f"/users/{logname}/"
        }

    return flask.render_template("index.html", **context)
