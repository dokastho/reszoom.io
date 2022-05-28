// view to contain list of resumes
import React from 'react';
import PropTypes from 'prop-types';
import EllipsisText from 'react-ellipsis-text';
import Moment from 'moment';

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
                      <div className="header">
                        {r.name}
                      </div>
                      <div className="spacer" />
                      <div className="header">
                        {r.description === null ? null
                          : <EllipsisText text={r.description} length={32} />}
                      </div>
                      <div className="spacer" />
                      {
                        // RENDER TAGS
                        r.tags.map((t) => (
                          <div className="tag">{t}</div>
                        ))
                      }
                      <div className="spacer" />
                      <div className="header">
                        {Moment(r.created).format('d MMM yy')}
                      </div>
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
