import React from 'react';
// import PropTypes from 'prop-types';
import ReactDOM, { render } from 'react-dom';
import ResumeList from './resume_list';
import Sidebar from './resume_sidebar';
// import Sidebar from './resume_sidebar';

class ResumePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here

    };
  }

  componentDidMount() {
    // Call REST API to get the resume information for the user
    fetch('/api/v1/resume/load/?fetch=resume', { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        console.log(data);
        this.setState({
          resumes: data.resumes,
        });

        // Get resume list object
        const {
          resumes,
        } = this.state;
        const post = document.getElementById('resume-content'); // check

        // render the resumes
        ReactDOM.render(
          <ResumeList
            resumes={resumes}
          />,
          post.querySelector('.resume-list'),
        );
        // render the floating sidebar
        ReactDOM.render(
          <Sidebar />,
          post.querySelector('.sidebar'),
        );
      })
      .catch((error) => console.log(error));
  }

  render() {
    // Render number of post image and post owner
    return (
      <div id="resume-content" className="list">
        <div className="resume-list" />
        <div className="sidebar" />
        <p>resume content 😊</p>
      </div>
    );
  }
}

/**
 * History State Definition:
 * @property {array} resumes contains all acquired post results from /posts/ calls
 */

render(
  <ResumePage />,
  document.getElementById('resume-start'),
);
