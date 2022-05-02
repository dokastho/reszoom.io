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
      <form action="/resume/new">
        <input type="submit" value="Create a new resume" />
      </form>
    );
  }
}

Sidebar.propTypes = {};

export default Sidebar;
