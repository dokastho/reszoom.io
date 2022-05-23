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
        <div className="resume-name">
          Your Resumes
        </div>
        <div>
          {
            resumes.length === 0 ? 'you have no resumes, create one'
              : (
                resumes.map((r) => (
                  <div className="resume-link" key={r.resumeid}>
                    <p>
                      <a href={`/resume/${r.resumeid}`}>
                        {r.name}
                        {r.description === null ? null
                          : <EllipsisText text={r.description} length={64} />}
                      </a>
                    </p>
                  </div>
                )))
          }
        </div>
      </div>
    );
  }
}

ResumeList.propTypes = {
  resumes: PropTypes.instanceOf(Array).isRequired,
};

export default ResumeList;
