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
    };
    // this.createNew = this.createNew.bind(this);
  }

  componentDidMount() {
    const { pagename, logname } = this.props;

    this.setState({ pagename, logname });
  }

  render() {
    const { pagename, logname } = this.state;
    return (
      <div>
        <h1><a href="/">home</a></h1>
        <h2>
          <a href={`/users/${logname}/`}>{logname}</a>
        </h2>
        <h1>{pagename}</h1>
        <form action="/resume/new">
          <input className="new-resume" type="submit" value="Create a new resume" />
        </form>
      </div>
    );
  }
}

Sidebar.propTypes = {
  pagename: PropTypes.string.isRequired,
  logname: PropTypes.string.isRequired,
};

export default Sidebar;
