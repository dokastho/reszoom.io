import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';

class Resumes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here

    };
  }

  fetchMoreData

  render() {
    return (<div>resume content 😊</div>);
  }
}

Resumes.propTypes = {
  resumes: PropTypes.instanceOf(Array).isRequired,
};

/**
 * History State Definition:
 * @property {array} resumes contains all acquired post results from /posts/ calls
 */


render(
  <ResumeBuilder />,
  document.getElementById('resume-start'),
)