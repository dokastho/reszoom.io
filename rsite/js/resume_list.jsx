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
              <table>
                <th>
                  <div>Name</div>
                  <div className="spacer" />
                  <div>Desc</div>
                  <div className="spacer" />
                  <div>Tags</div>
                  <div className="spacer" />
                  <div>Date</div>
                </th>
                {resumes.map((r) => (
                  <tr>
                    <form action={`/resume/${r.resumeid}`} key={r.resumeid}>
                      <button type="submit" className="resume-link" background-color="white">
                        <td className="header">
                          {r.name}
                        </td>
                        <td className="header">
                          {r.description === null ? null
                            : <EllipsisText text={r.description} length={32} />}
                        </td>
                        <td className="header">
                          {
                            // RENDER TAGS
                            r.tags.map((t) => (
                              <div className="tag" key={t}>{t}</div>
                            ))
                          }
                        </td>
                        <td className="header">
                          {Moment(r.created).format('d MMM yy')}
                        </td>
                      </button>
                    </form>
                  </tr>
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
