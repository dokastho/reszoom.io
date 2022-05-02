import React from 'react';
import ReactDOM, { render } from 'react-dom';
import PropTypes from 'prop-types';

class ResumeBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here
      entries: props.entries,
    };
    // this.createNew = this.createNew.bind(this);
  }

  componentDidMount() {
    // Call REST API to get the user's past entries
    fetch('/api/v1/resume/load/?fetch=userinfo', { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState({
          entries: data.entries,
        });
        const {
          entries,
        } = this.state;

        console.log(entries);

        const post = document.getElementById('resume-content'); // check

        // render the resumes
        ReactDOM.render(
          <div>
            {
              entries.map((e) => (
                <p key={e.resumeid}>{e}</p>
              ))
            }
          </div>,
          post.querySelector('.entries-list'),
        );
      })
      .catch((error) => console.log(error));
  }

  render() {
    return (
      <div id="resume-content" className="list">
        <div className="entries-list" />
        <p>resume content 😊</p>
      </div>
    );
  }
}

ResumeBuilder.propTypes = {};

render(
  <ResumeBuilder />,
  document.getElementById('make-resume'),
);

ResumeBuilder.propTypes = {
  entries: PropTypes.instanceOf(Array).isRequired,
};

export default ResumeBuilder;
