import React from 'react';
import { render } from 'react-dom';
import PropTypes from 'prop-types';
// import '../static/css/styles.css';

class Password extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here
      pword: '',
      valid: false,
      output: [],
      edit: props.edit,
      verify: '',
      equalsString: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.checkSame = this.checkSame.bind(this);
    this.validatePass = this.validatePass.bind(this);
  }

  componentDidMount() {
    const { edit } = this.props;
    this.validatePass('');
    this.setState({ edit });
  }

  handleChange(event) {
    const pword = event.target.value;
    this.validatePass(pword);
  }

  checkSame(event) {
    const newPword = event.target.value;
    const { pword, valid } = this.state;

    let str = 'passwords must match ';

    let match = false;

    if (pword === newPword) {
      str = str.concat(' ✅');
      match = true;
    } else {
      str = str.concat(' ❌');
    }

    const isValid = valid && match;

    this.setState({ verify: newPword, equalsString: str, valid: isValid });
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
    const {
      pword,
      valid,
      output,
      edit,
      verify,
      equalsString,
    } = this.state;
    return (
      <div className="pwordcheck">
        <input type="password" name="password" required onChange={(e) => this.handleChange(e)} value={pword} />
        {
          // RENDER CHECKS
          output.map((item) => (
            <div key={item}>{item}</div>
          ))
        }
        {edit
          ? (
            <div>
              <input type="password" name="check_password" required onChange={(e) => this.checkSame(e)} value={verify} />
              <div>{equalsString}</div>
            </div>
          ) : null}
        {valid ? <div className="in-line"><input type="submit" name="signup" /></div> : null}
      </div>
    );
  }
}

Password.propTypes = {
  edit: PropTypes.bool.isRequired,
};

render(
  <div>
    <Password />
    <div id="password-check" />
  </div>,
  document.getElementById('password'),
);
