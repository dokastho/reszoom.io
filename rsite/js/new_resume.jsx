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
      tags: [],
    };
  }

  componentDidMount() {
    const sidebar = document.getElementById('floating-sidebar');

    // get the logname
    fetch('/api/v1/create/', { credentials: 'same-origin', method: 'GET' })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        const { tags, username, filename } = data;
        // render sidebar
        ReactDOM.render(
          // render the floating sidebar
          <Sidebar pagename="New Resume" logname={username} img={filename} />,
          sidebar,
        );

        this.setState({ tags });
      })
      .catch((error) => console.log(error));
  }

  render() {
    const { tags } = this.state;
    return (
      <div className="resume-content">
        <div className="create-form">
          <div>
            <form action="/resume/commit/" method="post" encType="multipart/form-data">
              <div>
                <b>New Resume Name</b>
                <br />
                <input type="text" className="plain" name="name" required />
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
                <label htmlFor="typebox">
                  <b>Description </b>
                  (Optional)
                </label>
                <br />
                <textarea name="desc" rows={4} cols={64} />
              </div>
              {
                // RENDER TAG TOGGLES
                tags.length === 0 ? 'Tags will be generated from your resume content & will appear here'
                  : (
                    tags.map((t) => (
                      <div>
                        <label htmlFor="typebox">{t}</label>
                        <input type="checkbox" name={`tag_${t}`} id="typebox" key={t} />
                      </div>
                    ))
                  )
              }
              <input type="hidden" name="operation" value="create" />
              <input type="submit" />
              <a className="plain" href="/resume/"><button type="button">Cancel</button></a>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

render(
  <NewResume />,
  document.getElementById('make-resume'),
);
