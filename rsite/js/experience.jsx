import React from 'react';
// import { render } from 'react-dom';
import PropTypes from 'prop-types';

class Experience extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here
      isEducation: props.isEducation,
      exp: [],
      // location: '',
      // begin: 0,
      // end: 0,
      // gpa: 0.0,
      add: false,
      newExp: {},
    };
  }

  componentDidMount() {
    const { isEducation } = this.props;

    // fetch data from rest api
    fetch(`/api/v1/experience/?edu=${isEducation}`, {
      credentials: 'same-origin',
    }).then((response) => {
      if (!response.ok) throw Error(response.statusText);
    }).then((data) => {
      this.setState(() => {
        const { exp } = data;
        return {
          isEducation,
          exp,
        };
      });
    }).catch((error) => console.log(error));
  }

  render() {
    const {
      isEducation,
      exp,
      add,
    } = this.state;
    return (
      <div>
        {
          // render existing content
          exp.map((e) => (
            <span>
              <h4>{e.location}</h4>
              {isEducation ? <h4>{e.gpa}</h4> : null}
              <p>
                {e.begin}
                -
                {e.end}
              </p>
              {/* delete button */}
              <button type="button" onClick={null}>Delete</button>
            </span>
          ))
        }
        {/* button to render "add" form */}
        {
          add
            ? (
              <form onSubmit={this.addExperience}>
                <input type="text" placeholder={isEducation ? 'Institution' : 'Company'} onChange={null} />
                <input type="month" onChange={null} />
                <input type="month" onChange={null} />
                {isEducation ? <input type="text" placeholder="GPA" onChange={null} /> : null}
              </form>
            )
            : (
              <button type="button" onClick={null}>
                Add
                {isEducation ? ' Education' : ' Work experience'}
              </button>
            )
        }
      </div>
    );
  }
}

Experience.propTypes = {
  isEducation: PropTypes.number.isRequired,
};

export default Experience;
