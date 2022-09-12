import React from 'react';
import { render } from 'react-dom';

class TitleCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
      <div>
        <h1>reszoom to work</h1>
        <h2><a href="/resume/">get started &gt;</a></h2>
      </div>
    );
  }
}

render(
  <TitleCard />,
  document.getElementById('titlecard'),
);
