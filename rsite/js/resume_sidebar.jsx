// view to contain resume options:
// create
import React from 'react';
// import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here
    };
    // this.createNew = this.createNew.bind(this);
  }

  render() {
    return (

      <Link to="/resume/new/">
        <button type="button" onClick={() => window.location.reload()}>
          <p>Create a new resume</p>
        </button>
      </Link>
    );
  }
}

Sidebar.propTypes = {};

export default Sidebar;
