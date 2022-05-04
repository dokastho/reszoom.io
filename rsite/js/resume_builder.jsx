import React from 'react';
import ReactDOM, { render } from 'react-dom';
import Cookies from 'js-cookie';
import Entries from './entry_list';

function getEntriesByHeader(entries, eids, header) {
  // iterate over eids and add entry, eid to return data if they match the header
  const sectionEntries = new Map();
  let sectionEids = [];
  eids.forEach((e) => {
    const key = `${e.entryid}`;
    const entry = entries.get(key);
    if (entry.header === header) {
      sectionEntries.set(key, entry);
      sectionEids = sectionEids.concat(e);
    }
  });
  return { sectionEntries, sectionEids };
}

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

        const {
          entries,
          eids,
          resumeid,
          username,
        } = this.state;

        const fields = ['education', 'experience', 'project'];

        fields.forEach((f) => {
          const post = document.getElementById(`${f}-entries`);
          const { sectionEntries, sectionEids } = getEntriesByHeader(entries, eids, f);
          ReactDOM.render(
            <Entries
              entries={sectionEntries}
              eids={sectionEids}
              resumeid={resumeid}
              header={f}
            />,
            post,
          );
        });
        console.log(username);
      })
      .catch((error) => console.log(error));
  }

  render() {
    const {
      resumeid,
      fullname,
      email,
    } = this.state;
    return (
      <div id="resume-content">
        <div id="user-header">
          <div className="about-me">
            <h1>{fullname}</h1>
            <h3>{email}</h3>
          </div>
        </div>
        <div id="education-entries" />
        <div id="experience-entries" />
        <div id="project-entries" />
        {/* render the resume options */}
        <div className="edit-form">
          <form action="/resume/commit/?target=/resume" method="post" encType="multipart/form-data">
            <input type="hidden" name="id" value={resumeid} />
            <input type="hidden" name="operation" value="delete" />
            <input type="submit" value="Delete Resume" />
          </form>
        </div>
        <p>resume content 😊</p>
      </div>
    );
  }
}

render(
  <ResumeBuilder />,
  document.getElementById('make-resume'),
);
