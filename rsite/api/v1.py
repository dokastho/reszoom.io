"""REST API for other routes."""
import flask
import rsite


@rsite.app.route('/api/v1/', methods=['GET'])
def get_routes():
    """Return all possible REST API routes."""
    return flask.jsonify({
        # TODO: establish some routes to service

        # "comments": "/api/v1/comments/",
        # "likes": "/api/v1/likes/",
        # "posts": "/api/v1/posts/",
        # "url": "/api/v1/"
    }), 200
