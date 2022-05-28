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
              <form action="/resume/new">
                <button type="submit" className="resume-link" background-color="white">
                  <div>
                    <h3>Create your first resume!</h3>
                  </div>
                </button>
              </form>
            ) : (
              <div>
                <div className="list-header">
                  <div>Name</div>
                  <div className="spacer" />
                  <div>Desc</div>
                  <div className="spacer" />
                  <div>Tags</div>
                  <div className="spacer" />
                  <div>Date</div>
                </div>
                <hr />
                {resumes.map((r) => (
                  <form action={`/resume/${r.resumeid}`} key={r.resumeid}>
                    <button type="submit" className="resume-link" background-color="white">
                      <div>
                        {r.name}
                      </div>
                      <div className="spacer" />
                      <div>
                        {r.description === null ? null
                          : <EllipsisText text={r.description} length={32} />}
                      </div>
                      <div className="spacer" />
                    </button>
                  </form>
                ))}
              </div>
            )
        }
      </div>
    );
  }
}

ResumeList.propTypes = {
  resumes: PropTypes.instanceOf(Array).isRequired,
};

export default ResumeList;
