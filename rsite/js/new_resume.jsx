import React from 'react';
import ReactDOM, { render } from 'react-dom';
import PropTypes from 'prop-types';

class NewResume extends React.Component {
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

        // render the resumes TODO: get resumeid from rest api
        ReactDOM.render(
          <div>
            <form action="/resume/?operation=create&target=/resume/" method="post" encType="multipart/form-data">
              <input type="checkbox" name="type" value="Are you a student?" />
              <input type="text" name="name" value="Resume name" />
              <input type="hidden" name="operation" value="create" />
            </form>
          </div>,
          post.querySelector('.create-form'),
        );
      })
      .catch((error) => console.log(error));
  }

  render() {
    return (
      <div id="resume-content" className="list">
        <div className="create-form" />
        <p>resume content 😊</p>
        <p>this pg will have options for filling out basic info, then fwd to resumeid pg</p>
      </div>
    );
  }
}

NewResume.propTypes = {};

render(
  <NewResume />,
  document.getElementById('make-resume'),
);

NewResume.propTypes = {
  entries: PropTypes.instanceOf(Array).isRequired,
};
