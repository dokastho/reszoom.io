/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import ReactDOM, { render } from 'react-dom';
// import '../static/css/styles.css';
import Sidebar from './sidebar';

class NewResume extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here
    };
  }

  componentDidMount() {
    const sidebar = document.getElementById('floating-sidebar');

    // get the logname
    fetch('/api/v1/user/', { credentials: 'same-origin', method: 'GET' })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        const { logname } = data;
        // render sidebar
        ReactDOM.render(
          // render the floating sidebar
          <Sidebar pagename="New Resume" logname={logname} />,
          sidebar,
        );
      })
      .catch((error) => console.log(error));
  }

  render() {
    return (
      <div className="resume-content">
        <div className="create-form">
          <div>
            <form action="/resume/commit/" method="post" encType="multipart/form-data">
              <div>
                <b>New Resume Name</b>
                <br />
                <textarea name="name" required rows={1} cols={50} />
              </div>
              <br />
              <br />
              <div>
                <span>
                  <label htmlFor="typebox"><b>Are you a student?</b></label>
                  <input type="checkbox" name="type" id="typebox" />
                </span>
                <p htmlFor="typebox">This will prioritize your education over experience.</p>
              </div>
              <br />
              <div>
                <p>
                  <b>Description </b>
                  (Optional)
                </p>
                <input type="text" name="desc" />
              </div>
              <input type="hidden" name="operation" value="create" />
              <input type="submit" />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

NewResume.propTypes = {};

render(
  <NewResume />,
  document.getElementById('make-resume'),
);

// NewResume.propTypes = {
// };
