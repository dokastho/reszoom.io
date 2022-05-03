"""
Site main entry content view.

URLs include:
/entry/
"""
import flask
import rsite
from rsite.model import show_username


@rsite.app.route("/entry/")
def commit_entry():
    """Post an entry."""
    database = rsite.model.get_db()

    logname = rsite.model.get_logname()
    if not logname:
        flask.abort(403)

    op = flask.request.args.get("operation", default=None, type=str)

    if op is None:
        flask.abort(404)

    if op == "create":
        # get name and type of resume
        resumeid = flask.request.form.get('resumeid', type=int)
        content = flask.request.form.get('entrycontent')
        header = flask.request.form.get('header')
        
        if len(content) == 0 or len(header) == 0:
            flask.abort(400)

        cur = database.execute(
            "SELECT AUTO_INCREMENT "
            "FROM entries"
        )
        entryid = cur.fetchone()
        
        cur = database.execute(
            "INSERT INTO entries "
            "(frequency, owner, header, content) "
            "VALUES (?, ?, ?, ?)",
            (1, logname, header, content, )
        )
        cur.fetchone()

        cur = database.execute(
            "INSERT INTO resume_to_entry "
            "(resumeid, entryid) "
            "VALUES (?, ?)",
            (resumeid, entryid)
        )
        cur.fetchone()

    elif op == "delete":
        pass

    elif op == "save":
        pass

    
    target = rsite.model.get_target()

    return flask.redirect(target)
