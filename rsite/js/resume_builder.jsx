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
        const {
          entries,
          resumeid,
        } = this.state;

        console.log(entries);
        console.log(resumeid);

        const post = document.getElementById('resume-content');

        // render the editing options form
        ReactDOM.render(
          // delete first
          <form action="/resume/commit/?operation=delete&target=/resume" method="post" encType="multipart/form-data">
            <input type="hidden" name="id" value={resumeid} />
            <input type="submit" value="Delete Resume" />
          </form>,
          post.querySelector('.edit-form'),
        );
        // render the resume components
        this.renderResume();
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

        // RENDER THE RESUME
        // load the dom id's
        const about = document.getElementById('user-header');
        const edu = document.getElementById('education-entries');
        const exp = document.getElementById('experience-entries');
        const proj = document.getElementById('project-entries');

        // render about me
        this.renderUserInfo(about);
        // render education
        this.renderEntries(edu, '.entries-list', 'education');
        // render experience
        this.renderEntries(exp, '.entries-list', 'experience');
        // render project info
        this.renderEntries(proj, '.entries-list', 'project');
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
              ? <p key={e.entryid}>{entries[e.entryid].content}</p>
              : null
          ))
        }
        <form action={`/entry/?operation=create&target=/resume/${resumeid}`} method="post" encType="multipart/form-data">
          <input type="text" name="entrycontent" required />
          <input type="hidden" name="header" value={header} />
          <input type="hidden" name="resumeid" value={resumeid} />
          <input type="submit" name="addentry" value="Add an entry" />
        </form>
      </div>,
      post.querySelector(query),
    );
  }

  renderUserInfo(post) {
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

        const { fullname, username, email } = this.state;

        console.log(username);

        // render the user info
        ReactDOM.render(
          <div>
            <h1>{fullname}</h1>
            <h3>{email}</h3>
          </div>,
          post.querySelector('.about-me'),
        );
      })
      .catch((error) => console.log(error));
  }

  render() {
    return (
      <div id="resume-content">
        <div id="user-header"><div className="about-me" /></div>
        <div id="education-entries"><div className="entries-list" /></div>
        <div id="experience-entries"><div className="entries-list" /></div>
        <div id="project-entries"><div className="entries-list" /></div>
        <div className="entries-list" />
        <div className="edit-form" />
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
