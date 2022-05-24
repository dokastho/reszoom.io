"""REST Api route for the dummy rest api, until I can use the real thing."""

import flask
import rsite
from rsite.model import delete_helper, get_db, rest_api_auth_user, print_log

@rsite.app.route('/api/v1/ford/', methods=['POST'])
def echo():
    """Return the message posted to the API."""
    
    if not flask.request.is_json:
        flask.abort(400)    # incorrect body
        
    body = flask.request.get_json()

    return flask.jsonify(body), 201