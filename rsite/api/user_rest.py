"""
Site user rest api.

URLs include:
/api/v1/userinfo/
"""
import flask
import rsite

@rsite.app.route("/api/v1/userinfo")
def get_userinfo():
    """Get user info for logged in user."""
    with rsite.app.app_context():
        logname = rsite.model.get_logname()
        if not logname:
            flask.abort(403)
        
        database = rsite.model.get_db()
        cur = database.execute(
            "SELECT * "
            "FROM users "
            "WHERE username == ?",
            (logname, )
        )
        userinfo = cur.fetchone()
        return flask.jsonify(userinfo)
