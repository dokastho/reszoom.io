import React from 'react';
import ReactDOM, { render } from 'react-dom';
import Cookies from 'js-cookie';
import Entries from './entry_list';

function getEntriesByHeaderType(entries, eids, header, type) {
  // iterate over eids and add entry, eid to return data if they match the header
  const sectionEntries = {};
  let sectionEids = [];
  eids.forEach((e) => {
    const entry = entries[e.entryid];
    if (entry.header === header && entry.type === type) {
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
        this.setState({
          entries: data.entries,
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

        // render entries

        // 1. render the education and experience info
        let fields = ['education', 'experience'];

        fields.forEach((f) => {
          const post = document.getElementById(f);
          const isEntries = 0;
          const {
            sectionEntries,
            sectionEids,
          } = getEntriesByHeaderType(entries, eids, f, isEntries);
          // render the info for experience and education
          ReactDOM.render(
            <div className="entries">
              <Entries
                entries={sectionEntries}
                eids={sectionEids}
                resumeid={resumeid}
                header={f}
                username={username}
                isEntries={isEntries}
              />
              {
                // render the divs for each entry
                Object.keys(sectionEntries).map((entryid) => (
                  <div key={entryid} className={`header${entryid}`} />
                ))
              }

            </div>,
            post.querySelector('.info'),
          );
        });

        fields = fields.concat('project');

        // 2. render the entries for each header
        //      split the entries of education & experience by their parent subheaders

        fields.forEach((f) => {
          const post = document.getElementById(f);
          const isEntries = 1;
          const {
            sectionEntries,
            sectionEids,
          } = getEntriesByHeaderType(entries, eids, f, isEntries);
          if (f === 'project') {
            ReactDOM.render(
              <Entries
                entries={sectionEntries}
                eids={sectionEids}
                resumeid={resumeid}
                header={f}
                username={username}
                isEntries={isEntries}
              />,
              post.querySelector('.entries'),
            );
          } else {
            // do nothing. placeholder for if there are more fields added
          }
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
                </div>
                <div id="experience">
                  <h1>Experience</h1>
                  <div className="info" />
                </div>
              </div>
            )
            : (
              <div>
                <div id="experience">
                  <h1>Experience</h1>
                  <div className="info" />
                </div>
                <div id="education">
                  <h1>Education</h1>
                  <div className="info" />
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
        <a href="/resume/">Go back to resumes</a>
        <p>resume content 😊</p>
      </div>
    );
  }
}

render(
  <ResumeBuilder />,
  document.getElementById('make-resume'),
);
