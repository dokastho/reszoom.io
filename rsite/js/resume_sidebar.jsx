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

  createNew() {
    console.log(this);
  }

  render() {
    return (
      <div className="floating-sidebar">
        <button type="button" onSubmit={this.createNew}>Comppile a new resume</button>
      </div>
    );
  }
}

Sidebar.propTypes = {};

export default Sidebar;
