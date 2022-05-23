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
    return (
      <div id="resume-content" className="list">
        <div className="create-form">
          <div>
            <form action="/resume/commit/" method="post" encType="multipart/form-data">
              <label htmlFor="typebox">Are you a student?</label>
              <input type="checkbox" name="type" id="typebox" />
              <input type="text" name="name" required placeholder="New Resume Name" />
              <input type="text" name="desc" placeholder="Add a description?" />
              <input type="hidden" name="operation" value="create" />
              <input type="submit" />
            </form>
          </div>
        </div>
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
