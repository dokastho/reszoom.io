import React from 'react';
import ReactDOM, { render } from 'react-dom';
import Cookies from 'js-cookie';
import Entries from './entry_list';
import Experience from './experience';

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

function getExperienceByHeader(experience, type) {
  // same as above but for experience entries
  // console.log(experience, type);
  const keys = Object.keys(experience);
  const sectionExp = {};
  keys.forEach((k) => {
    const exp = experience[k];
    if (exp.typename === type) {
      sectionExp[k] = exp;
    }
  });
  return sectionExp;
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
        this.setState({
          entries: data.entries,
          experience: data.experience,
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
          experience,
        } = this.state;

        // render entries

        const fields = ['education', 'experience', 'project'];

        fields.forEach((f) => {
          const post = document.getElementById(f);
          const { sectionEntries, sectionEids } = getEntriesByHeader(entries, eids, f);
          ReactDOM.render(
            <Entries
              entries={sectionEntries}
              eids={sectionEids}
              resumeid={resumeid}
              header={f}
              username={username}
            />,
            post.querySelector('.entries'),
          );
        });

        fields.pop('project');
        fields.forEach((f) => {
          const post = document.getElementById(f);
          const type = Number(f === 'education');
          const { sectionInfo } = getExperienceByHeader(experience, type);
          // render the info for experience and education
          ReactDOM.render(
            <Experience isEducation={type} exp={sectionInfo} />,
            post.querySelector('.info'),
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
        {
          // render education-experience based on type
          resumetype
            ? (
              <div>
                <div id="education">
                  <h1>Education</h1>
                  <div className="info" />
                  <div className="entries" />
                </div>
                <div id="experience">
                  <h1>Experience</h1>
                  <div className="info" />
                  <div className="entries" />
                </div>
              </div>
            )
            : (
              <div>
                <div id="experience">
                  <h1>Experience</h1>
                  <div className="info" />
                  <div className="entries" />
                </div>
                <div id="education">
                  <h1>Education</h1>
                  <div className="info" />
                  <div className="entries" />
                </div>
              </div>
            )
        }
        <div id="project">
          <h1>Project</h1>
          <div className="info" />
          <div className="entries" />
        </div>
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
