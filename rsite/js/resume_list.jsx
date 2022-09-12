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
                  <th>Name</th>
                  <th>Desc</th>
                  <th>Tags</th>
                  <th>Date</th>
                </tr>
                {resumes.map((r, id) => (
                  // <form action={`/resume/${r.resumeid}`} key={r.resumeid}>
                  // eslint-disable-next-line react/no-array-index-key
                  <tr key={id}>
                    {/* <div role="button" tabIndex={0} className="entry-wrapper"> */}
                    <td>
                      <a href={`/resume/${r.resumeid}`}>{r.name}</a>
                    </td>
                    <td>
                      {r.description === null ? null
                        : <EllipsisText text={r.description} length={32} />}
                    </td>
                    <td>
                      {
                        // RENDER TAGS
                        r.tags.map((t) => (
                          <div className="tag" key={t}>{t}</div>
                        ))
                      }
                    </td>
                    <td>
                      {Moment(r.created).format('d MMM yy')}
                    </td>
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
