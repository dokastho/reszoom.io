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
      // array of actively editing entries
      newEntryText: new Map(),
    };
    this.createEntry = this.createEntry.bind(this);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.updateEntry = this.updateEntry.bind(this);
    this.editEntry = this.editEntry.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.moveEntry = this.moveEntry.bind(this);
    this.handleEntryChange = this.handleEntryChange.bind(this);
    this.handleNewEntryChange = this.handleNewEntryChange.bind(this);
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

  // update handler for a new entry
  handleNewEntryChange(event) {
    this.setState({ text: event.target.value });
  }

  // update handler for an existing entry
  handleEntryChange(event, entryid) {
    const { newEntryText } = this.state;
    newEntryText.set(`${entryid}`, event.target.value);
    this.setState({ newEntryText });
  }

  // create an entry
  createEntry(entryid, event) {
    event.preventDefault();

    const {
      resumeid,
      header,
      text,
      username,
    } = this.state;
    fetch(`/api/v1/entry/?resumeid=${resumeid}&entryid=${entryid}&header=${header}&operation=create`, {
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
        eids: prevState.eids.concat(data.eid),
        entries: prevState.entries.set(`${data.eid.entryid}`, data.entry),
        text: '',
      }));
    })
      .catch((error) => console.log(error));
    console.log(username);
  }

  // delete an entry
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

  // set the newentry to initiate the edit form
  editEntry(entryid) {
    const { newEntryText, entries } = this.state;
    newEntryText.set(`${entryid}`, entries.get(`${entryid}`).content);
    this.setState({ newEntryText });
  }

  // cancel an edit by clearing the edited content
  cancelEdit(entryid) {
    const { newEntryText } = this.state;
    newEntryText.delete(`${entryid}`);
    this.setState({ newEntryText });
  }

  // submit an edit to an entry
  updateEntry(event, entryid, idx) {
    event.preventDefault();

    const {
      eids,
      entries,
      resumeid,
      header,
      newEntryText,
    } = this.state;

    const text = newEntryText.get(`${entryid}`);

    fetch(`/api/v1/entry/?resumeid=${resumeid}&entryid=${entryid}&header=${header}&operation=update`, {
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
      newEntryText.delete(`${entryid}`);
      eids[idx] = data.eid;
      entries.set(`${entryid}`, data.entry);
      this.setState({
        eids,
        entries,
        newEntryText,
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
      newEntryText,
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
                  {newEntryText.has(`${e.entryid}`)
                    // render the edit button
                    ? (
                      <span>
                        <form onSubmit={(event) => this.updateEntry(event, e.entryid, idx)} encType="multipart/form-data">
                          <input type="text" onChange={(event) => this.handleEntryChange(event, e.entryid)} value={newEntryText.get(`${e.entryid}`)} />
                          {/* render up button for all entries not on first line */}
                          {idx === 0 ? null
                            : <button type="button" onClick={this.moveEntry.bind(this, idx, idx - 1)}>Up</button>}

                          {/* render down button for all entries not on last line */}
                          {idx === max ? null
                            : <button type="button" onClick={this.moveEntry.bind(this, idx, idx + 1)}>Down</button>}
                          <button type="button" onClick={this.cancelEdit.bind(this, e.entryid)}>Cancel</button>
                        </form>
                      </span>
                    )
                    // render the entry content and delete button
                    : (
                      <span>
                        {entries.get(`${e.entryid}`).content}
                        <button type="button" onClick={this.editEntry.bind(this, e.entryid)}>Edit</button>
                        <button type="button" onClick={this.deleteEntry.bind(this, e.entryid)}>Delete</button>
                        {/* render up button for all entries not on first line */}
                        {idx === 0 ? null
                          : <button type="button" onClick={this.moveEntry.bind(this, idx, idx - 1)}>Up</button>}

                        {/* render down button for all entries not on last line */}
                        {idx === max ? null
                          : <button type="button" onClick={this.moveEntry.bind(this, idx, idx + 1)}>Down</button>}
                      </span>
                    )}
                </div>
              )
              : null
          ))
        }
        {/* render create form */}
        <form onSubmit={(event) => this.createEntry(0, event)}>
          <input type="text" onChange={(event) => this.handleNewEntryChange(event)} value={text} />
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
