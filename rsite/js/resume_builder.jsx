import React from 'react';
import ReactDOM, { render } from 'react-dom';
import PropTypes from 'prop-types';

class ResumeBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here
      entries: props.entries,
      eids: props.eids,
      resumeid: '',
    };
    // this.createNew = this.createNew.bind(this);
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
      })
      .catch((error) => console.log(error));

    // render the resume itself
    const { resumeid } = this.state;
    fetch(`/api/v1/resume/load/?fetch=resume&id=${resumeid}}`, { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState({
          eids: data.eids,
        });

        const { entries, eids } = this.state;

        // render the resume
        const post = document.getElementById('resume-content');
        ReactDOM.render(
          <div>
            {
              eids.map((e) => (
                e.resumeid === resumeid
                  ? <p key={e.entryid}>{entries[e.entryid].content}</p>
                  : null
              ))
            }
          </div>,
          post.querySelector('.entries-list'),
        );
      })
      .catch((error) => console.log(error));
  }

  render() {
    return (
      <div id="resume-content" className="list">
        <div className="entries-list" />
        <div className="edit-form" />
        <p>resume content 😊</p>
        <p>this pg will load the content from resumeid and edit. redirects from new too</p>
      </div>
    );
  }
}

ResumeBuilder.propTypes = {};

render(
  <ResumeBuilder />,
  document.getElementById('make-resume'),
);

ResumeBuilder.propTypes = {
  entries: PropTypes.instanceOf(Map).isRequired,
  eids: PropTypes.instanceOf(Array).isRequired,
  resumeid: PropTypes.number.isRequired,
};

export default ResumeBuilder;
