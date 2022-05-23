// view to contain list of resumes
import React from 'react';
import PropTypes from 'prop-types';
import EllipsisText from 'react-ellipsis-text';

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
    return (
      <div>
        {
          resumes.map((r) => (
            <div className="resume-link" key={r.resumeid}>
              <p>
                <a href={`/resume/${r.resumeid}`}>
                  {r.name}
                  {'description' in r ? <EllipsisText text={r.description} length={10} /> : null}
                </a>
              </p>
            </div>
          ))
        }
      </div>
    );
  }
}

ResumeList.propTypes = {
  resumes: PropTypes.instanceOf(Array).isRequired,
};

export default ResumeList;
