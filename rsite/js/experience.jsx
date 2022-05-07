import React from 'react';
// import { render } from 'react-dom';
import PropTypes from 'prop-types';

class Experience extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here
      isEducation: props.isEducation,
      exp: {},
      // expid
      // location
      // begin
      // end
      // gpa
      add: false,
      newExp: {},
    };
    this.setAddTrue = this.setAddTrue.bind(this);
    this.setAddFalse = this.setAddFalse.bind(this);
    this.addExperience = this.addExperience.bind(this);
    this.deleteExperience = this.deleteExperience.bind(this);
    this.handleChange = this.handleChange.bind(this);
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

  // update the "new" experience entry
  handleChange(event, attr) {
    const { newExp } = this.state;
    newExp[attr] = event;
    this.setState({ newExp });
  }

  setAddTrue() {
    this.setState({ add: true });
  }

  setAddFalse() {
    this.setState({
      newExp: {},
      add: false,
    });
  }

  // fetch rest api to POST new exp
  addExperience() {
    // load entry data from state
    const { add, isEducation } = this.state;
    const {
      location,
      begin,
      end,
      gpa,
    } = add;

    // fetch api
    fetch('/api/v1/experience/', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // post the data for new entry
      body: JSON.stringify({
        type: isEducation,
        location,
        begin,
        end,
        gpa,
      }),
    }).then((response) => {
      if (!response.ok) throw Error(response.statusText);
      return response.json();

      // add data to state
    }).then((data) => {
      this.setState(() => {
        const { exp } = this.state;
        exp[data.expid] = data.data;
        return {
          newExp: {},
          add: false,
          exp,
        };
      });
    })
      .catch((error) => console.log(error));
  }

  // fetch rest api to DELETE exp
  deleteExperience(expid) {
    fetch(`/api/v1/experience/${expid}/`, {
      credentials: 'same-origin',
      method: 'DELETE',
    }).then((response) => {
      if (!response.ok) throw Error(response.statusText);
      return response.json();

    // no response necessary, just remove from state
    }).then(() => {
      this.setState(() => {
        const { exp } = this.state;
        delete exp[expid];
        return {
          exp,
        };
      });
    })
      .catch((error) => console.log(error));
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
          Object.keys(exp).map(([expid, o]) => (
            <span>
              <h4>{o.location}</h4>
              {isEducation ? <h4>{o.gpa}</h4> : null}
              <p>
                {o.begin}
                -
                {o.end}
              </p>
              {/* delete button */}
              <button type="button" onClick={this.deleteExperience(expid)}>Delete</button>
            </span>
          ))
        }
        {
          // button to render "add" form
          add
            ? (
              <form onSubmit={this.addExperience}>
                <input type="text" placeholder={isEducation ? 'Institution' : 'Company'} onChange={(e) => this.handleChange(e)} />
                <input type="month" onChange={(e) => this.handleChange(e)} />
                <input type="month" onChange={(e) => this.handleChange(e)} />
                {isEducation ? <input type="text" placeholder="GPA" onChange={(e) => this.handleChange(e)} /> : null}
                <button type="button" onClick={this.setAddFalse}>Cancel</button>
              </form>
            )
            : (
              <button type="button" onClick={this.setAddTrue}>
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
