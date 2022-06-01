"""
Site resume rest api.

URLs include:
/api/v1/resume/load/
# /api/v1/resume/
"""
import flask
import rsite
from rsite.model import rest_api_auth_user
from rsite.api.tag_rest import fetch_resume_tags


@rsite.app.route('/api/v1/resume/load/', methods=['GET'])
def load_resumes():
    """Return resumes from database matching logname."""
    with rsite.app.app_context():
        logname, database = rest_api_auth_user()

        op = flask.request.args.get("fetch", default="resume", type=str)

        if op == "list":
            cur = database.execute(
                "SELECT * "
                "FROM resumes "
                "WHERE owner == ?",
                (logname, )
            )
            resumes = cur.fetchall()
            
            # get the tags for each resume
            for resume in resumes:
                resume["tags"] = fetch_resume_tags(resume["resumeid"])
            res = {
                'resumes': resumes
            }
        elif op == "userinfo":
            rid = flask.request.args.get("resumeid", default=0, type=int)
            if rid == 0:
                flask.abort(404)

            # load all entries for a specific user
            cur = database.execute(
                "SELECT * "
                "FROM entries "
                "WHERE owner == ?",
                (logname, )
            )
            data = cur.fetchall()

            # construct entries map
            entries = {}
            for entry in data:
                entryid = entry['entryid']
                # remove entryid from entry
                del entry['entryid']
                entries[entryid] = entry

            # get eids for the resume id
            cur = database.execute(
                "SELECT * "
                "FROM resume_to_entry "
                "WHERE resumeid == ?",
                (rid, )
            )
            eids = cur.fetchall()

            # get the userinfo
            cur = database.execute(
                "SELECT * "
                "FROM users "
                "WHERE username == ?",
                (logname, )
            )
            userinfo = cur.fetchone()

            # get the resume info
            cur = database.execute(
                "SELECT * "
                "FROM resumes "
                "WHERE resumeid == ?",
                (rid, )
            )
            resumeinfo = cur.fetchone()

            # construct the response
            res = {
                'eids': eids,
                'entries': entries,
                'username': userinfo['username'],
                'fullname': userinfo['fullname'],
                'filename': userinfo['filename'],
                'email': userinfo['email'],
                'resumename': resumeinfo['name'],
                'resumetype': resumeinfo['typename'],
                'description': resumeinfo['description'],
                'created': resumeinfo['created'],
                'tags': fetch_resume_tags(rid),
            }
        else:
            flask.abort(403)
        return flask.jsonify(res), 201
