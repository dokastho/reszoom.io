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
    };
    // this.createNew = this.createNew.bind(this);
  }

  componentDidMount() {
    const { pagename, logname, content } = this.props;

    this.setState({ pagename, logname, content });
  }

  render() {
    const {
      pagename,
      logname,
      content,
      img,
    } = this.state;
    return (
      <div>
        <div className="sidebar">
          <h1><a href="/">home</a></h1>
          <div className="resume-name"><h1>{pagename}</h1></div>
          {
            // render extra content
            content.map((c) => (
              <div key={c.text}>
                {'link' in c ? <a href={c.link}>{c.text}</a> : <p>{c.text}</p>}
              </div>
            ))
          }
          <div className="new" />
          <hr />
          <div className="sidebar-profile">
            <a className="plain" href={`/users/${logname}/`}>
              <img className="profile" src={`/uploads/${img}`} alt="" />
            </a>
            <h2><a href={`/users/${logname}/`}>{logname}</a></h2>
          </div>
        </div>
      </div>
    );
  }
}

Sidebar.defaultProps = {
  content: [],
};

Sidebar.propTypes = {
  pagename: PropTypes.string.isRequired,
  logname: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  content: PropTypes.instanceOf(Array),
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
