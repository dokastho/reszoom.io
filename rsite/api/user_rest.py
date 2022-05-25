"""
Site user rest api.

URLs include:
/api/v1/user/
"""

import flask
import rsite
from rsite.model import rest_api_auth_user

@rsite.app.route("/api/v1/user/", methods=['GET'])
def current_user():
    """Return the logname of the current user."""

    logname, database = rest_api_auth_user()
    
    cur = database.execute(
        "SELECT * "
        "FROM users "
        'WHERE username == ?',
        (logname, )
    )
    
    data = cur.fetchone()

    if data is None:
        flask.abort(500)
    
    return flask.jsonify(data), 201