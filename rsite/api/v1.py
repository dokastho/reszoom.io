"""REST API for other routes."""
import flask
import rsite


@rsite.app.route('/api/v1/', methods=['GET'])
def get_routes():
    """Return all possible REST API routes."""
    return flask.jsonify({
        "resume": '/api/v1/resume/'
    }), 200
