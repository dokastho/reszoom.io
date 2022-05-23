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
      content: props.content,
    };
    // this.createNew = this.createNew.bind(this);
  }

  componentDidMount() {
    const { pagename, logname, content } = this.props;

    this.setState({ pagename, logname, content });
  }

  render() {
    const { pagename, logname, content } = this.state;
    return (
      <div>
        <h1><a href="/">home</a></h1>
        <h2>
          <a href={`/users/${logname}/`}>{logname}</a>
        </h2>
        <h1>{pagename}</h1>
        {
          // render extra content
          content.map((c) => (
            <div key={c.text}>
              {c.link === null ? <p>{c.text}</p> : <a href={c.link}>{c.text}</a>}
            </div>
          ))
        }
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
  content: PropTypes.instanceOf(Array),
};

export default Sidebar;
