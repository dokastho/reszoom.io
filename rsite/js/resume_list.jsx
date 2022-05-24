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
          resumes.length === 0
            ? (
              <h3><a href="/resume/new">Create your first resume!</a></h3>
            ) : (
              resumes.map((r) => (
                <div className="entry-wrapper" key={r.resumeid}>
                  <div className="" href={`/resume/${r.resumeid}`}>
                    {r.name}
                    {r.description === null ? null
                      : <EllipsisText text={r.description} length={64} />}
                  </div>
                  <hr />
                </div>
              )))
        }
      </div>
    );
  }
}

ResumeList.propTypes = {
  resumes: PropTypes.instanceOf(Array).isRequired,
};

export default ResumeList;
