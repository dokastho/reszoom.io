import React from 'react';
// import PropTypes from 'prop-types';
import ReactDOM, { render } from 'react-dom';
import ResumeList from './resume_list';
import Sidebar from './sidebar';
// import Sidebar from './resume_sidebar';

class ResumePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here
      logname: '',
    };
  }

  componentDidMount() {
    const post = document.querySelector('.resume-list');
    const sidebar = document.getElementById('floating-sidebar');

    // Call REST API to get the resume information for the user
    fetch('/api/v1/resume/load/?fetch=list', { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        console.log(data);
        this.setState({
          resumes: data.resumes,
          logname: data.logname,
        });

        // Get resume list object
        const {
          resumes,
          logname,
        } = this.state;
        // check

        // render the resumes
        ReactDOM.render(
          <ResumeList
            resumes={resumes}
          />,
          post,
        );
        // render the floating sidebar
        ReactDOM.render(
          <div>
            <Sidebar pagename="Your Resumes" logname={logname} />
            <form action="/resume/new">
              <input className="new-resume" type="submit" value="Create a new resume" />
            </form>
          </div>,
          sidebar,
        );
      })
      .catch((error) => console.log(error));

  }

  render() {
    // Render number of post image and post owner
    return (
      <div className="resume-list" />
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
