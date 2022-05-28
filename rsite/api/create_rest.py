"""
Site create page rest api.

URLs include:
/api/v1/create/
"""

import flask
import rsite
from rsite.model import rest_api_auth_user
from rsite.api.tag_rest import fetch_resume_tags


@rsite.app.route('/api/v1/create/', methods=['GET'])
def load_create():
    """Return logname & tags for a user."""
    
    logname, database = rest_api_auth_user()
    
    # fetch user profile picture
    cur = database.execute(
        "SELECT * "
        "FROM users "
        'WHERE username == ?',
        (logname, )
    )
    data = cur.fetchone()
    
    # fetch user resumes
    cur = database.execute(
        "SELECT resumeid "
        "FROM resumes "
        "WHERE owner == ?",
        (logname,)
    )
    resumeids = cur.fetchall()
    
    user_tags = set()
    
    # get all the tags from those resumes
    for resumeid in resumeids:
        user_tags.update(fetch_resume_tags(resumeid["resumeid"]))
    
    data["tags"] = list(user_tags)
    
    return flask.jsonify(data), 201
