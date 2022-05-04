import React from 'react';
import ReactDOM, { render } from 'react-dom';

class ResumeBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here
      // cache entries so that if you delete the last entry but want to undo before saving
      entries: new Map(),
      eids: [],
      newEntries: new Map(),
      resumeid: '',
      username: '',
      email: '',
      fullname: '',
    };
    this.createEntry = this.createEntry.bind(this);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.handleEntryChange = this.handleEntryChange.bind(this);
    this.renderEntries = this.renderEntries.bind(this);
  }

  componentDidMount() {
    // get resume id from URL
    let str = window.location.href;
    str = str.substring(0, str.length - 1);
    str = str.substring(str.lastIndexOf('/') + 1);

    // Call REST API to get the user's past entries
    fetch(`/api/v1/resume/load/?fetch=userinfo&resumeid=${str}`, { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState({
          entries: data.entries,
          eids: data.eids,
          resumeid: str,
          username: data.username,
          email: data.email,
          fullname: data.fullname,
        });

        const { username } = this.state;

        console.log(username);
      })
      .catch((error) => console.log(error));
  }

  handleEntryChange(header, event) {
    const str = `.${header}`;
    this.setState({ newEntries: this.newEntries.set(str, event.target.value) });
  }

  createEntry(header, entryid, event) {
    event.preventDefault();

    const { resumeid, newEntries } = this.state;
    fetch(`/api/v1/entry/?resumeid=${resumeid}&entryid=${entryid}&header=${header}`, {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newEntries[header] }),
    }).then((response) => {
      if (!response.ok) throw Error(response.statusText);
      return response.json();
    }).then((data) => {
      // console.log(data);

      this.setState((prevState) => ({
        eids: prevState.eids.concat({
          entryid: data.eids.entryid,
          resumeid: data.eids.resumeid,
        }),

        entries: prevState.entries.set(entryid, data.entries[entryid]),
      }));
    });
  }

  deleteEntry(entryid) {
    fetch(`/api/v1/entry/${entryid}/`, {
      credentials: 'same-origin',
      method: 'DELETE',
    }).then((response) => {
      if (!response.ok) throw Error(response.statusText);
      this.setState((prevState) => (
        {
          entries: prevState.entries.filter((key) => key !== entryid),
        }
      ));
    });
  }

  // render entries for the header, as well as edit button and field to add another
  // todo: start suggestion stuff for recommending adding more/less items
  renderEntries(post, query, header) {
    const { eids, entries } = this.state;
    ReactDOM.render(
      <div>
        <h1>{header}</h1>
        {
          eids.map((e) => (
            entries[e.entryid].header === header
              ? (
                <div>
                  {/* render content */}
                  <p key={e.entryid}>{entries[e.entryid].content}</p>
                  {/* render delete form */}
                  <form onSubmit={() => this.deleteEntry(e.entryid)} method="post" encType="multipart/form-data">
                    <input type="submit" name="delete" value="Delete" />
                  </form>
                </div>
              )
              : null
          ))
        }
        {/* render create form */}
        <form onSubmit={() => this.createEntry(header)} method="post" encType="multipart/form-data">
          <input type="text" name="entrycontent" onChange={(event) => this.handleEntryChange(header, event)} required />
          <input type="submit" name="addentry" value="Add an entry" />
        </form>
      </div>,
      post.querySelector(query),
    );
  }

  render() {
    const { resumeid, fullname, email } = this.state;
    const edu = document.getElementById('education-entries');
    const exp = document.getElementById('experience-entries');
    const proj = document.getElementById('project-entries');
    return (
      <div id="resume-content">
        <div id="user-header">
          <div className="about-me">
            <h1>{fullname}</h1>
            <h3>{email}</h3>
          </div>
        </div>
        <div id="education-entries">
          <div className="entries-list">
            {this.renderEntries(edu, '.entries-list', 'education')}
          </div>
        </div>
        <div id="experience-entries">
          <div className="entries-list">
            {this.renderEntries(exp, '.entries-list', 'experience')}
          </div>
        </div>
        <div id="project-entries">
          <div className="entries-list">
            {this.renderEntries(proj, '.entries-list', 'project')}
          </div>
        </div>
        <div className="edit-form">
          <form action="/resume/commit/?target=/resume" method="post" encType="multipart/form-data">
            <input type="hidden" name="id" value={resumeid} />
            <input type="hidden" name="operation" value="delete" />
            <input type="submit" value="Delete Resume" />
          </form>
        </div>
        <p>resume content 😊</p>
        <p>this pg will load the content from resumeid and edit. redirects from new too</p>
      </div>
    );
  }
}

render(
  <ResumeBuilder />,
  document.getElementById('make-resume'),
);

export default ResumeBuilder;
