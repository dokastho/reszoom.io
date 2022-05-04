import React from 'react';
import ReactDOM, { render } from 'react-dom';
import PropTypes from 'prop-types';

class ResumeBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here
      // cache entries so that if you delete the last entry but want to undo before saving
      entries: props.entries,
      eids: props.eids,
      resumeid: '',
      username: '',
      email: '',
      fullname: '',
    };
    this.renderResume = this.renderResume.bind(this);
    this.renderEntries = this.renderEntries.bind(this);
    this.fetchUserInfo = this.fetchUserInfo.bind(this);
  }

  componentDidMount() {
    // get resume id from URL
    let str = window.location.href;
    str = str.substring(0, str.length - 1);
    str = str.substring(str.lastIndexOf('/') + 1);

    // Call REST API to get the user's past entries
    fetch('/api/v1/resume/load/?fetch=userinfo', { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState({
          entries: data,
          resumeid: str,
        });
        // const {
        //   entries,
        //   resumeid,
        // } = this.state;

        // console.log(entries);
        // console.log(resumeid);

        // const post = document.getElementById('resume-content');

        // render the editing options form
        // ReactDOM.render(
        //   // delete first
        //   <form action="/resume/commit/?target=/resume" method="post" encType="multipart/form-data">
        //     <input type="hidden" name="id" value={resumeid} />
        //     <input type="hidden" name="operation" value="delete" />
        //     <input type="submit" value="Delete Resume" />
        //   </form>,
        //   post.querySelector('.edit-form'),
        // );
        // render the resume components
        this.renderResume();
      })
      .catch((error) => console.log(error));
  }

  fetchUserInfo() {
    fetch('/api/v1/userinfo', { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState({
          username: data.username,
          email: data.email,
          fullname: data.fullname,
        });

        // const { fullname, username, email } = this.state;
        const { username } = this.state;

        console.log(username);

        // render the user info
        // ReactDOM.render(
        //   <div>
        //     <h1>{fullname}</h1>
        //     <h3>{email}</h3>
        //   </div>,
        //   post.querySelector('.about-me'),
        // );
      })
      .catch((error) => console.log(error));
  }

  renderResume() {
    // render the resume itself
    const { resumeid } = this.state;
    fetch(`/api/v1/resume/load/?fetch=resume&id=${resumeid}`, { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState({
          eids: data.eids,
        });
        this.fetchUserInfo();

        // RENDER THE RESUME
        // // load the dom id's
        // const about = document.getElementById('user-header');
        // const edu = document.getElementById('education-entries');
        // const exp = document.getElementById('experience-entries');
        // const proj = document.getElementById('project-entries');

        // // render about me
        // this.renderUserInfo(about);
        // // render education
        // this.renderEntries(edu, '.entries-list', 'education');
        // // render experience
        // this.renderEntries(exp, '.entries-list', 'experience');
        // // render project info
        // this.renderEntries(proj, '.entries-list', 'project');
      })
      .catch((error) => console.log(error));
  }

  // render entries for the header, as well as edit button and field to add another
  // todo: start suggestion stuff for recommending adding more/less items
  renderEntries(post, query, header) {
    const { eids, entries, resumeid } = this.state;
    ReactDOM.render(
      <div>
        <h1>{header}</h1>
        {
          eids.map((e) => (
            entries[e.entryid].header === header
              ? (
                <div>
                  <p key={e.entryid}>{entries[e.entryid].content}</p>
                  <form action={`/entry/?target=/resume/${resumeid}`} method="post" encType="multipart/form-data">
                    <input type="hidden" name="operation" value="delete" />
                    <input type="hidden" name="resumeid" value={resumeid} />
                    <input type="hidden" name="entryid" value={e.entryid} />
                    <input type="submit" name="delete" value="Delete" />
                  </form>
                </div>
              )
              : null
          ))
        }
        <form action={`/entry/?target=/resume/${resumeid}`} method="post" encType="multipart/form-data">
          <input type="text" name="entrycontent" required />
          <input type="hidden" name="operation" value="create" />
          <input type="hidden" name="header" value={header} />
          <input type="hidden" name="resumeid" value={resumeid} />
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
        <div className="entries-list" />
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

ResumeBuilder.propTypes = {
  entries: PropTypes.instanceOf(Map).isRequired,
  eids: PropTypes.instanceOf(Array).isRequired,
};

export default ResumeBuilder;
