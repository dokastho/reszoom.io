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
          <h1>Your Resumes</h1>
        </div>
        <div>
          {
            resumes.length === 0
              ? (
                <a href="/resume/new">Create your first resume!</a>
              ) : (
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
