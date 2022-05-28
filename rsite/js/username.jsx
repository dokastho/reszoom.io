import React from 'react';
import { render } from 'react-dom';
// import '../static/css/styles.css';

class Username extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here
      user: '',
      valid: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.validateUser = this.validateUser.bind(this);
  }

  componentDidMount() {
    this.validateUser('');
  }

  handleChange(event) {
    const user = event.target.value;
    this.validateUser(user);
  }

  validateUser(user) {
    // check that user does not exist in database
    fetch(`/api/v1/user/taken/?username=${user}`, { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState({ valid: data.valid, user });
      })
      .catch((error) => console.log(error));
  }

  render() {
    const { user, valid } = this.state;
    return (
      <div>
        <div className="pwordcheck">{valid ? null : 'Username is taken, please try another'}</div>
        <div className="in-line">
          Username
          <input type="text" name="username" required onChange={(e) => this.handleChange(e)} value={user} />
        </div>
      </div>
    );
  }
}

render(
  <div>
    <Username />
    <div id="username-check" />
  </div>,
  document.getElementById('username'),
);
