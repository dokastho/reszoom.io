"""
Site user rest api.

URLs include:
/api/v1/user/
"""

import flask
import rsite
from rsite.model import rest_api_auth_user

@rsite.app.route('/api/v1/user/', methods=['GET'])
def current_user():
    """Return the logname of the current user."""

    logname, _ = rest_api_auth_user()
    
    return flask.jsonify({'logname': logname}), 201