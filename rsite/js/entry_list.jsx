import React from 'react';
// import { render } from 'react-dom';
import PropTypes from 'prop-types';

class Entries extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // state attributes go here
      entries: props.entries,
      eids: props.eids,
      text: '',
      header: props.header,
      resumeid: props.resumeid,
      username: props.username,
    };
    this.createEntry = this.createEntry.bind(this);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.moveEntry = this.moveEntry.bind(this);
    this.handleEntryChange = this.handleEntryChange.bind(this);
  }

  componentDidMount() {
    const {
      entries,
      eids,
      header,
      resumeid,
      username,
    } = this.props;
    this.setState({
      entries,
      eids,
      header,
      resumeid,
      username,
    });
    console.log('mount');
    console.log(this);
  }

  handleEntryChange(event) {
    this.setState({ text: event.target.value });
  }

  createEntry(entryid, event) {
    event.preventDefault();

    const {
      resumeid,
      header,
      text,
      username,
    } = this.state;
    fetch(`/api/v1/entry/?resumeid=${resumeid}&entryid=${entryid}&header=${header}`, {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    }).then((response) => {
      if (!response.ok) throw Error(response.statusText);
      return response.json();
    }).then((data) => {
      this.setState((prevState) => ({
        eids: prevState.eids.concat({
          entryid: data.entryid,
          pos: data.pos,
          owner: username,
          resumeid,
        }),
        entries: prevState.entries.set(`${data.entryid}`, data.entry),
        text: '',
      }));
    })
      .catch((error) => console.log(error));
  }

  deleteEntry(entryid) {
    fetch(`/api/v1/entry/${entryid}/`, {
      credentials: 'same-origin',
      method: 'DELETE',
    }).then((response) => {
      if (!response.ok) throw Error(response.statusText);
      this.setState((prevState) => {
        prevState.entries.delete(`${entryid}`);
        const neweids = prevState.eids.filter((eid) => eid.entryid !== entryid);
        return {
          entries: prevState.entries,
          eids: neweids,
        };
      });
    })
      .catch((error) => console.log(error));
  }

  // move an entry up or down a place
  moveEntry(idx, other) {
    const { eids } = this.state;
    const oldPos = eids[idx].pos;
    const newPos = eids[other].pos;
    const tempEid = eids[idx];

    // swap the pos member of each eid
    eids[idx].pos = newPos;
    eids[other].pos = oldPos;

    // swap the eids themselves
    eids[idx] = eids[other];
    eids[other] = tempEid;

    // set the state
    this.setState({ eids });

    // update the db
    fetch(`/api/v1/entry/meta/?pos1=${oldPos}&pos2=${newPos}`, {
      credentials: 'same-origin',
      method: 'POST',
    }).then((response) => {
      if (!response.ok) throw Error(response.statusText);
    })
      .catch((error) => console.log(error));
  }

  render() {
    const {
      header,
      eids,
      entries,
      text,
    } = this.state;
    const max = Object.keys(eids).length - 1;
    return (
      <div>
        <h1>{header}</h1>
        {
          eids.map((e, idx) => (
            entries.get(`${e.entryid}`).header === header
              ? (
                <div key={e.entryid}>
                  {/* render content */}
                  <span>{entries.get(`${e.entryid}`).content}</span>
                  {/* render delete form */}
                  <button type="button" onClick={this.deleteEntry.bind(this, e.entryid)}>Delete</button>

                  {/* render up button for all entries not on first line */}
                  {idx === 0 ? null
                    : <button type="button" onClick={this.moveEntry.bind(this, idx, idx - 1)}>Up</button>}

                  {/* render down button for all entries not on last line */}
                  {idx === max ? null
                    : <button type="button" onClick={this.moveEntry.bind(this, idx, idx + 1)}>Down</button>}
                </div>
              )
              : null
          ))
        }
        {/* render create form */}
        <form onSubmit={(event) => this.createEntry(0, event)}>
          <input type="text" onChange={(event) => this.handleEntryChange(event)} value={text} />
          <input type="submit" />
        </form>
      </div>
    );
  }
}

Entries.propTypes = {
  entries: PropTypes.instanceOf(Map).isRequired,
  eids: PropTypes.instanceOf(Array).isRequired,
  header: PropTypes.string.isRequired,
  resumeid: PropTypes.number.isRequired,
  username: PropTypes.string.isRequired,
};

export default Entries;
