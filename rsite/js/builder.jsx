/* eslint-disable react/jsx-no-comment-textnodes */
import React from 'react';
import ReactDOM, { render } from 'react-dom';
import Cookies from 'js-cookie';
import Entries from './entry_list';
import Sidebar from './sidebar';

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
      desc: '',
      tags: [],

      // user-specific attributes
      username: '',
      email: '',
      fullname: '',
      filename: '',
    };

    this.renderSidebar = this.renderSidebar.bind(this);
    this.uniqueTags = this.uniqueTags.bind(this);
  }

  componentDidMount() {
    const rid = Number(Cookies.get('resumeid'));
    // ReactDOM.render(
    //   <a href="/resume/">Go back to resumes</a>,
    //   sidebar,
    // );

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
          desc: data.description,
          filename: data.filename,
          tags: data.tags,
        });

        const {
          entries,
          eids,
          resumeid,
          username,
          tags,
        } = this.state;

        // render sidebar
        this.renderSidebar(tags);

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
                renderSidebar={this.renderSidebar}
              />
              {/* {
                // render the divs for each entry
                Object.keys(sectionEntries).map((entryid) => (
                  <div key={entryid} className={`header${entryid}`} />
                ))
              } */}

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
                renderSidebar={this.renderSidebar}
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

  uniqueTags() {
    const { entries } = this.state;
    const tagSet = [];
    Object.keys(entries).forEach((entryid) => {
      const entrytags = entries[entryid].tags;
      if ('tags' in entries[entryid]) {
        // tags only in the entry type
        entrytags.forEach((tag) => {
          if (!(tag in tagSet)) {
            tagSet.push(tag);
          }
        });
      }
    });
    return tagSet;
  }

  renderSidebar() {
    const {
      resumetype,
      resumename,
      desc,
      username,
      filename,
    } = this.state;

    const tags = this.uniqueTags();
    const sidebar = document.getElementById('floating-sidebar');

    // construct the custom sidebar content
    const sidebarContent = [];
    if (resumetype) {
      sidebarContent.push({
        text: 'Student Resume',
      });
    } else {
      sidebarContent.push({
        text: 'Employee Resume',
      });
    }
    sidebarContent.push({ text: desc });
    sidebarContent.push({
      text: 'Go back to resumes',
      link: '/resume/',
    });

    ReactDOM.render(
      // render the floating sidebar
      <Sidebar
        pagename={resumename}
        logname={username}
        content={sidebarContent}
        tags={tags}
        img={filename}
      />,
      sidebar,
    );
    this.setState({ tags });
  }

  render() {
    const {
      resumeid,
      resumetype,
      fullname,
      email,
    } = this.state;
    return (
      <div>
        <div className="resume-content">
          <div className="about-me">
            <div className="name"><h1>{fullname}</h1></div>
            <div className="email"><h3>{email}</h3></div>
          </div>
          {
            // render education-experience based on type
            resumetype
              ? (
                <div>
                  <div id="education">
                    <h1>Education</h1>
                    <hr />
                    <div className="info" />
                  </div>
                  <div id="experience">
                    <h1>Experience</h1>
                    <hr />
                    <div className="info" />
                  </div>
                </div>
              )
              : (
                <div>
                  <div id="experience">
                    <h1>Experience</h1>
                    <hr />
                    <div className="info" />
                  </div>
                  <div id="education">
                    <h1>Education</h1>
                    <hr />
                    <div className="info" />
                  </div>
                </div>
              )
          }
          <div id="project">
            <h1>Project</h1>
            <hr />
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
        </div>
      </div>
    );
  }
}

render(
  <ResumeBuilder />,
  document.getElementById('make-resume'),
);
