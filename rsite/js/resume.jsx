import React from 'react';
// import PropTypes from 'prop-types';
import { render, ReactDOM } from 'react-dom';
import ResumeList from './resume_list';

class resumePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here

    };
  }

  componentDidMount() {
    // Call REST API to get the resume information for the user
    fetch('/api/v1/resume/load/', { credentials: 'same-origin' })
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
      })
      .catch((error) => console.log(error));
  }

  render() {
    return (<div>resume content 😊</div>);
  }
}

/**
 * History State Definition:
 * @property {array} resumes contains all acquired post results from /posts/ calls
 */

render(
  <resumePage />,
  document.getElementById('resume-start'),
);
