// view to contain resume options:
// create
import PropTypes from 'prop-types';
import React from 'react';
// import PropTypes from 'prop-types';

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here
      pagename: props.pagename,
      logname: props.logname,
      img: props.img,
      content: props.content,
      tags: props.tags,
    };
    // this.createNew = this.createNew.bind(this);
  }

  componentDidMount() {
    const {
      pagename,
      logname,
      content,
      tags,
    } = this.props;

    this.setState({
      pagename,
      logname,
      content,
      tags,
    });
  }

  componentDidUpdate(prevState) {
    const { tags } = this.state;
    if (prevState.tags !== tags) {
      this.render();
    }
  }

  render() {
    const {
      pagename,
      logname,
      content,
      tags,
      img,
    } = this.state;
    return (
      <div>
        <div className="sidebar">
          <h1><a href="/">{'< home'}</a></h1>
          <div className="resume-name"><h1>{pagename}</h1></div>
          <div className="header">
            {
              // render tags
              tags.map((t) => (
                <div className="tag" key={t}>{t}</div>
              ))
            }
          </div>
          {
            // render extra content
            content.map((c) => (
              <div key={c.text}>
                {'link' in c ? <a href={c.link}>{c.text}</a> : <p>{c.text}</p>}
              </div>
            ))
          }
          <div className="new" />
          <br />
          <hr />
          <br />
          <div className="sidebar-profile">
            <a className="plain" href={`/users/${logname}/`}>
              <img className="profile" src={`/uploads/${img}`} alt="" />
            </a>
            <h2><a href={`/users/${logname}/`}>{logname}</a></h2>
          </div>
          <br />
        </div>
      </div>
    );
  }
}

Sidebar.defaultProps = {
  content: [],
  tags: [],
};

Sidebar.propTypes = {
  pagename: PropTypes.string.isRequired,
  logname: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  content: PropTypes.instanceOf(Array),
  tags: PropTypes.instanceOf(Array),
};

// function collapse() {
//   document.getElementById('floating-sidebar').style.width = '250px';
//   document.getElementById('make-resume').style.marginLeft = '250px';
// }

// function expand() {
//   document.getElementById('floating-sidebar').style.width = '0px';
//   document.getElementById('make-resume').style.marginLeft = '0px';
// }

export default Sidebar;
