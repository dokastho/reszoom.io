// view to contain resume options:
// create
import React from 'react';
// import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'semantic-ui-react';

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

      // <Link to="/resume/new/">
        // <Button>
        //   <p>Create a new resume</p>
        // </Button>
      // </Link>
      <Button onClick={() => useNavigate('/resume/new')}>
        <p>Create a new resume</p>
      </Button>
    );
  }
}

Sidebar.propTypes = {};

export default Sidebar;
