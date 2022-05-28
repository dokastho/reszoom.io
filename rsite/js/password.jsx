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
    };
    this.handleChange = this.handleChange.bind(this);
    this.validatePass = this.validatePass.bind(this);
  }

  componentDidMount() {
    this.validatePass('');
  }

  handleChange(event) {
    const pword = event.target.value;
    this.validatePass(pword);
  }

  validatePass(pword) {
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

    // record if password is valid
    const isValid = valid === reqsList.length;

    // set state
    this.setState({ valid: isValid, pword, output });
  }

  render() {
    const { pword, valid, output } = this.state;
    return (
      <div>
        <div className="in-line">
          New password
          <input type="password" name="password" required onChange={(e) => this.handleChange(e)} value={pword} />
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

Password.propTypes = {};

render(
  <div>
    <Password />
    <div id="password-check" />
  </div>,
  document.getElementById('password'),
);
