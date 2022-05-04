import React from 'react';
import { render } from 'react-dom';
import Cookies from 'js-cookie';

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
    const rid = Number(Cookies.get('resumeid'));

    // Call REST API to get the user's past entries
    fetch(`/api/v1/resume/load/?fetch=userinfo&resumeid=${rid}`, { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState({
          // entries: data.entries,
          entries: new Map(Object.entries(data.entries)),
          eids: data.eids,
          resumeid: rid,
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
    const { newEntries } = this.state;
    newEntries.set(str, event.target.value);
    this.setState({ newEntries });
  }

  createEntry(header, entryid, event) {
    event.preventDefault();

    const { resumeid, newEntries } = this.state;
    const str = `.${header}`;
    fetch(`/api/v1/entry/?resumeid=${resumeid}&entryid=${entryid}&header=${header}`, {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newEntries.get(str) }),
    }).then((response) => {
      if (!response.ok) throw Error(response.statusText);
      return response.json();
    }).then((data) => {
      // console.log(data);

      this.setState((prevState) => ({
        eids: prevState.eids.concat({
          entryid: data.entryid,
          resumeid,
        }),

        entries: prevState.entries.set(`${data.entryid}`, data.entry),
      }));
    })
      .catch((error) => console.log(error));
  }

  deleteEntry(entryid) {
    fetch(`/api/v1/entry/${entryid}/`, {
      credentials: 'same-origin',
      method: 'DELETE',
    }).then((response) => {
      if (!response.ok) throw Error(response.statusText);
      this.setState((prevState) => (
        {
          entries: prevState.entries.delete(`${entryid}`),
        }
      ));
      // const { entries } = this.state;
      // console.log(entries);
    })
      .catch((error) => console.log(error));
  }

  // render entries for the header, as well as edit button and field to add another
  // todo: start suggestion stuff for recommending adding more/less items
  renderEntries(header) {
    const { eids, entries } = this.state;
    // console.log(entries);
    return (
      <div>
        <h1>{header}</h1>
        {
          eids.map((e) => (
            entries.get(`${e.entryid}`).header === header
              ? (
                <div key={e.entryid}>
                  {/* render content */}
                  {console.log(entries)}
                  <span>{entries.get(`${e.entryid}`).content}</span>
                  {/* render delete form */}
                  {/* <form onSubmit={() => this.deleteEntry(e.entryid)}>
                    <input type="submit" value="Delete" />
                  </form> */}
                  <button type="button" onClick={this.deleteEntry.bind(this, e.entryid)}>Delete</button>
                </div>
              )
              : null
          ))
        }
        {/* render create form */}
        <form onSubmit={(event) => this.createEntry(header, 0, event)}>
          <input type="text" onChange={(event) => this.handleEntryChange(header, event)} />
          <input type="submit" />
        </form>
      </div>
    );
  }

  render() {
    const { resumeid, fullname, email } = this.state;
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
            {this.renderEntries('education')}
          </div>
        </div>
        <div id="experience-entries">
          <div className="entries-list">
            {this.renderEntries('experience')}
          </div>
        </div>
        <div id="project-entries">
          <div className="entries-list">
            {this.renderEntries('project')}
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
