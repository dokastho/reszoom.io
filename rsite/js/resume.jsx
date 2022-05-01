import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';

class ResumeBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here

    };
  }

  render()
  {
    return( <div>render some more resume content 😊</div> );
  }
}

render(
  <ResumeBuilder>resume content 😊</ResumeBuilder>
)