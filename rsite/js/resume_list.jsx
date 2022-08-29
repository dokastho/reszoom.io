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
              // TODO: table is a wip
              <table>
                <tr>
                  <thead>Name</thead>
                  <thead>Desc</thead>
                  <thead>Tags</thead>
                  <thead>Date</thead>
                </tr>
                {resumes.map((r, id) => (
                  // <form action={`/resume/${r.resumeid}`} key={r.resumeid}>
                  <tr key={id}>
                    {/* <div role="button" tabIndex={0} className="entry-wrapper"> */}
                    <tbody className="header">
                      {r.name}
                    </tbody>
                    <tbody className="header">
                      {r.description === null ? null
                        : <EllipsisText text={r.description} length={32} />}
                    </tbody>
                    <tbody className="header">
                      {
                        // RENDER TAGS
                        r.tags.map((t) => (
                          <div className="tag" key={t}>{t}</div>
                        ))
                      }
                    </tbody>
                    <tbody className="header">
                      {Moment(r.created).format('d MMM yy')}
                    </tbody>
                    {/* </div> */}
                  </tr>
                  // </form>
                ))}
              </table>
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
