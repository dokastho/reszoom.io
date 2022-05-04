import React from 'react';
import { render } from 'react-dom';
import Cookies from 'js-cookie';
import Entries from './entry_list';

class ResumeBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here
      // cache entries so that if you delete the last entry but want to undo before saving
      entries: new Map(),
      eids: [],
      resumeid: '',
      username: '',
      email: '',
      fullname: '',
    };
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

  render() {
    const {
      resumeid,
      fullname,
      email,
      entries,
      eids,
    } = this.state;
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
            <Entries entries={entries} eids={eids} header="education" />
          </div>
        </div>
        <div id="experience-entries">
          <div className="entries-list">
            <Entries entries={entries} eids={eids} header="experience" />
          </div>
        </div>
        <div id="project-entries">
          <div className="entries-list">
            <Entries entries={entries} eids={eids} header="project" />
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
