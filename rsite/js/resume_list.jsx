// view to contain list of resumes
import React from 'react';
import PropTypes from 'prop-types';

class ResumeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here
      resumes: props.resumes,
    };
  }

  render() {
    const { resumes } = this.state;
    return(
      <div>
        {
          resumes.map((r) => (
            <p>r.</p>
          ))
        }
      </div>
    )
  }
}

ResumeList.propTypes = {
  resumes: PropTypes.instanceOf(Array).isRequired,
};

export default ResumeList;
