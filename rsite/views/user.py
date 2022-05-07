"""
rsite user view.

URLs include:
/users/<uname>/
"""
import flask
import rsite


@rsite.app.route('/users/<uname>/')
def show_user(uname):
    """Show base profile page for uname."""
    with rsite.app.app_context():
        # logname must exist in session
        logname = rsite.model.get_logname()
        if not logname:
            return flask.redirect("/accounts/login/")

        database = rsite.model.get_db()
        cur = database.execute(
            "SELECT * "
            "FROM users "
            "WHERE username == ?",
            (uname, )
        )
        data = cur.fetchone()

        context = {
            "logname": logname,
            "username": uname,
            "fullname": data['fullname'],
            "profilepic": data['filename']
        }
    return flask.render_template("user.html", **context)
