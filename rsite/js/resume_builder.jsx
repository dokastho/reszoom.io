import React from 'react';
import ReactDOM, { render } from 'react-dom';
import Cookies from 'js-cookie';
import Entries from './entry_list';

function getEntriesByHeader(entries, eids, header) {
  // iterate over eids and add entry, eid to return data if they match the header
  const sectionEntries = {};
  let sectionEids = [];
  eids.forEach((e) => {
    const entry = entries[e.entryid];
    if (entry.header === header) {
      sectionEntries[e.entryid] = entry;
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
      entries: new Map(),
      eids: [],

      // resume-specific attributes
      resumeid: '',
      resumename: '',
      resumetype: false,

      // user-specific attributes
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
        // const obj = Object.entries(data.entries);
        // const m = new Map();
        // obj.map((o) => (
        //   m[o[0]] = o[1]
        // ));
        this.setState({
          entries: data.entries,
          // entries: new Map(),
          eids: data.eids,
          resumeid: rid,
          resumename: data.resumename,
          resumetype: data.resumetype,
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
              username={username}
            />,
            post,
          );
        });
      })
      .catch((error) => console.log(error));
  }

  render() {
    const {
      resumeid,
      resumename,
      resumetype,
      fullname,
      email,
    } = this.state;
    return (
      <div id="resume-content">
        <h1>{resumename}</h1>
        <h3>{resumetype ? 'Student Resume' : 'Employee Resume'}</h3>
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
