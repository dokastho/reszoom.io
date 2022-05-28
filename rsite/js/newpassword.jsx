import React from 'react';
import { render } from 'react-dom';
// import '../static/css/styles.css';

class Password extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here
      pword: '',
      valid: false,
      output: [],
      verify: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.validatePass = this.validatePass.bind(this);
  }

  componentDidMount() {
    this.validatePass('');
  }

  handleChange(event, v) {
    if (!v) {
      const pword = event.target.value;
      const { verify } = this.state;
      this.validatePass(pword, verify);
    } else {
      const verify = event.target.value;
      const { pword } = this.state;
      this.validatePass(pword, verify);
    }
  }

  validatePass(pword, verify) {
    // list: regex conditions
    const reqs = [
      /(?=.*[a-z])/,
      /(?=.*[A-Z])/,
      /(?=.*[0-9])/,
    ];

    // list: regex names
    const reqsList = [
      'lowercase letter',
      'uppercase letter',
      'number',
    ];

    // list: output to render
    const output = [];

    // counter to track if password is valid
    let valid = 0;

    // validate password
    reqs.forEach((expr, i) => {
      let str = 'password has a '.concat(reqsList[i]);
      if (expr.test(pword)) {
        valid += 1;
        str = str.concat(' ✅');
      } else {
        str = str.concat(' ❌');
      }

      // push password valid/invalid string
      output.push(str);
    });

    // check that verification matches
    let str = 'passwords must match ';

    let match = false;

    if (pword === verify) {
      str = str.concat(' ✅');
      match = true;
    } else {
      str = str.concat(' ❌');
    }

    output.push(str);

    // record if password is valid
    const isValid = valid === reqsList.length && match;

    // set state
    this.setState({
      valid: isValid,
      pword,
      verify,
      output,
    });
  }

  render() {
    const {
      pword,
      valid,
      output,
      verify,
    } = this.state;
    return (
      <div>
        <div className="in-line">
          New password
          <input type="password" name="password" required onChange={(e) => this.handleChange(e, 0)} value={pword} />
        </div>
        <div className="in-line">
          Verify new password
          <input type="password" name="check_password" required onChange={(e) => this.handleChange(e, 1)} value={verify} />
        </div>
        <div className="pwordcheck">
          {
            // RENDER CHECKS
            output.map((item) => (
              <div key={item}>{item}</div>
            ))
          }
        </div>
        {valid ? <div className="in-line"><input type="submit" /></div> : null}
      </div>
    );
  }
}

render(
  <div>
    <Password />
    <div id="password-check" />
  </div>,
  document.getElementById('password'),
);
