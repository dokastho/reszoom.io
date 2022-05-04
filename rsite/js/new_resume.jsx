/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { render } from 'react-dom';
// import '../static/css/styles.css';
// import PropTypes from 'prop-types';

class NewResume extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here
    };
  }

  render() {
    // TODO: get resumeid from rest api
    // TODO: check in real time if resume name available for user
    return (
      <div id="resume-content" className="list">
        <div className="create-form">
          <div>
            <form action="/resume/commit/" method="post" encType="multipart/form-data">
              <label htmlFor="typebox">Are you a student?</label>
              <input type="checkbox" name="type" id="typebox" />
              <input type="text" name="name" required placeholder="New Resume Name" />
              <input type="hidden" name="operation" value="create" />
            </form>
          </div>
        </div>
        <p>resume content 😊</p>
        <p>this pg will have options for filling out basic info, then fwd to resumeid pg</p>
      </div>
    );
  }
}

NewResume.propTypes = {};

render(
  <NewResume />,
  document.getElementById('make-resume'),
);

// NewResume.propTypes = {
//   entries: PropTypes.instanceOf(Map).isRequired,
// };
