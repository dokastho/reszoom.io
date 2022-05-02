// view to contain resume options:
// create
import React from 'react';
// import PropTypes from 'prop-types';

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
      <button type="button">
        <a href="/resume/new">Create a new resume</a>
      </button>
    );
  }
}

Sidebar.propTypes = {};

export default Sidebar;
