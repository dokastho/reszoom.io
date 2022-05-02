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
    const navigate = useNavigate();
    return (
      <button
        type="button"
        onSubmit={() => { navigate('/resume/create'); }}>
        foo
      </button>
    );
  }
}

Sidebar.propTypes = {};

export default Sidebar;
