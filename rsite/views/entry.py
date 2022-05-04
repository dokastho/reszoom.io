"""
Site main entry content view.

URLs include:
/entry/
"""
import flask
import rsite
from rsite.model import show_username


@rsite.app.route("/entry/", methods=['POST'])
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
        entryid = flask.request.form.get('entryid', type=int)
        content = flask.request.form.get('entrycontent')
        header = flask.request.form.get('header')
        
        if len(content) == 0 or len(header) == 0 or resumeid == 0:
            flask.abort(400)

        # entryid not supplied, so entry is new
        if entryid == None:
            # insert new
            cur = database.execute(
            "INSERT INTO entries "
            "(frequency, owner, header, content) "
            "VALUES (?, ?, ?, ?)",
            (1, logname, header, content, )
            )
            cur.fetchone()

            # get id
            cur = database.execute(
                "SELECT MAX(entryid) "
                "AS id "
                "FROM entries"
            )
            data = cur.fetchone()
            entryid = data['id']

            # insert id into resume_to_entry
            cur = database.execute(
                "INSERT INTO resume_to_entry "
                "(resumeid, entryid) "
                "VALUES (?, ?)",
                (resumeid, entryid, )
            )
            cur.fetchone()
        
        else:
            # entry already in db so increment freq
            cur = database.execute(
                "SELECT frequency "
                "FROM entries "
                "WHERE entryid == ?",
                (entryid, )
            )
            data = cur.fetchone()
            freq = data['frequency']
            freq += 1

            cur = database.execute(
                "UPDATE entries "
                "SET frequency = ? "
                "WHERE entryid == ?",
                (freq, entryid, )
            )
            cur.fetchone()

    elif op == "delete":
        pass

    elif op == "save":
        pass

    
    target = rsite.model.get_target()

    return flask.redirect(target)
