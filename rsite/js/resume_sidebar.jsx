// view to contain resume options:
// create
import React from 'react';
// import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

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
      <button type="button" onClick={() => useNavigate('/resume/new/')}>Create a new resume</button>
    );
  }
}

Sidebar.propTypes = {};

export default Sidebar;
