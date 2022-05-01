"""
Site index (main) view.

URLs include:
/
"""
import flask
import rsite


@rsite.app.route('/')
def show_index():
    """Serve index html for logged in user."""
    with rsite.app.app_context():
        # logname must exist in session
        logname = rsite.model.get_logname()
        if not logname:
            return flask.redirect("/accounts/login/")

        context = {
            "logname": logname,
            "logname_link": f"/users/{logname}/"
        }

    return flask.render_template("index.html", **context)
