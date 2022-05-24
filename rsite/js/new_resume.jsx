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
      logname: '',
    };
  }

  componentDidMount() {
    const sidebar = document.getElementById('floating-sidebar');

    // get the logname
    fetch('/api/v1/user/', {
      credentials: 'same-origin',
      method: 'GET',
    }).then((response) => {
      if (!response.ok) throw Error(response.statusText);
    }).then((data) => {
      this.setState({ logname: data.logname });
    })
      .catch((error) => console.log(error));

    const { logname } = this.state;

    // render sidebar
    ReactDOM.render(
      // render the floating sidebar
      <Sidebar pagename="New Resume" logname={logname} />,
      sidebar,
    );
  }

  render() {
    return (
      <div id="resume-content" className="list">
        <div className="create-form">
          <div>
            <form action="/resume/commit/" method="post" encType="multipart/form-data">
              <label htmlFor="typebox">Are you a student?</label>
              <input type="checkbox" name="type" id="typebox" />
              <input type="text" name="name" required placeholder="New Resume Name" />
              <input type="text" name="desc" placeholder="Add a description?" />
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
