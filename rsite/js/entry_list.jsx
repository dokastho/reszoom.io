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
      isEntries: props.isEntries,
      // array of actively editing entries
      newEntryText: {},
      // state attributes for type info
      add: false,
      subEntries: {},
      subEids: [],
    };
    this.createEntry = this.createEntry.bind(this);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.updateEntry = this.updateEntry.bind(this);
    this.editEntry = this.editEntry.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.moveEntry = this.moveEntry.bind(this);
    this.setAddTrue = this.setAddTrue.bind(this);
    this.setAddFalse = this.setAddFalse.bind(this);
    this.handleInfoChange = this.handleInfoChange.bind(this);
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
      isEntries,
    } = this.props;

    let {
      subEntries,
      subEids,
    } = this.state;

    if (!isEntries) {
      // fetch subentries
      const { entryid } = eids[0];
      fetch(`${entryid}`, { credentials: 'same-origin' })
        .then((response) => {
          if (!response.ok) throw Error(response.statusText);
          return response.json();
        })
        .then((data) => {
          subEntries = data.entries;
          subEids = data.eids;
        })
        .catch((error) => console.log(error));
    }

    this.setState({
      entries,
      eids,
      header,
      resumeid,
      username,
      isEntries,
      add: false,
      subEntries,
      subEids,
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
    newEntryText[entryid] = event.target.value;
    this.setState({ newEntryText });
  }

  handleInfoChange(event, attr) {
    const { newEntryText } = this.state;
    newEntryText[attr] = event.target.value;
    this.setState({ newEntryText });
  }

  setAddTrue() {
    this.setState({ add: true });
  }

  setAddFalse() {
    this.setState({
      newEntryText: {},
      add: false,
    });
  }

  // create an entry
  createEntry(entryid, event) {
    event.preventDefault();

    const {
      resumeid,
      header,
      text,
      entries,
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
      this.setState((prevState) => {
        entries[data.eid.entryid] = data.entry;
        return {
          eids: prevState.eids.concat(data.eid),
          entries,
          text: '',
          add: false,
        };
      });
    })
      .catch((error) => console.log(error));
    console.log(username);
  }

  // delete an entry
  deleteEntry(entryid) {
    const { resumeid } = this.state;

    fetch(`/api/v1/entry/${entryid}/?resumeid=${resumeid}`, {
      credentials: 'same-origin',
      method: 'DELETE',
    }).then((response) => {
      if (!response.ok) throw Error(response.statusText);
      this.setState((prevState) => {
        const newEntries = prevState.entries;
        delete newEntries[entryid];
        const neweids = prevState.eids.filter((eid) => eid.entryid !== entryid);
        return {
          entries: newEntries,
          eids: neweids,
        };
      });
    })
      .catch((error) => console.log(error));
  }

  // set the newentry to initiate the edit form
  editEntry(entryid) {
    const { newEntryText, entries } = this.state;
    newEntryText[entryid] = entries[entryid].content;
    this.setState({ newEntryText });
  }

  // cancel an edit by clearing the edited content
  cancelEdit(entryid) {
    const { newEntryText } = this.state;
    delete newEntryText[entryid];
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

    const text = newEntryText[entryid];
    const { pos } = eids[idx];

    fetch(`/api/v1/entry/?resumeid=${resumeid}&entryid=${entryid}&header=${header}&operation=update&pos=${pos}`, {
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
      delete newEntryText[entryid];
      eids[idx] = data.eid;
      entries[entryid] = data.entry;
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
      resumeid,
      username,
      eids,
      entries,
      text,
      newEntryText,
      isEntries,
      add,
      subEntries,
      subEids,
    } = this.state;
    const isEducation = header === 'education';
    const max = Object.keys(eids).length - 1;
    return (
      <div>
        {
          eids.map((e, idx) => (
            // TODO: I think this is unnecessary
            entries[e.entryid].header === header
              ? (
                <div key={e.entryid}>
                  {e.entryid in newEntryText
                    // render the edit button but only for entry type
                    ? (
                      <span>
                        <form onSubmit={(event) => this.updateEntry(event, e.entryid, idx)} encType="multipart/form-data">
                          {
                            // render edit form
                            isEntries ? (<input type="text" onChange={(event) => this.handleEntryChange(event, e.entryid)} value={newEntryText[e.entryid]} />) : null
                          }
                        </form>
                      </span>
                    )
                    // render the entry content and delete button
                    : (
                      <div>
                        <span>
                          {
                            isEntries ? (
                              <div>
                                {entries[e.entryid].content}
                                <button type="button" onClick={this.editEntry.bind(this, e.entryid)}>Edit</button>
                                <button type="button" onClick={this.deleteEntry.bind(this, e.entryid)}>Delete</button>
                              </div>
                            ) : (
                              <span key={e.entryid}>
                                <h4>{entries[e.entryid].content}</h4>
                                {isEducation ? <h4>{entries[e.entryid].gpa}</h4> : null}
                                <p>
                                  {entries[e.entryid].begin}
                                  -
                                  {entries[e.entryid].end}
                                </p>
                                {/* delete button */}
                                <button type="button" onClick={this.deleteEntry.bind(this, e.entryid)}>Delete</button>
                                {/* render subentries */}
                                <Entries
                                  entries={subEntries}
                                  eids={subEids}
                                  resumeid={resumeid}
                                  header={header}
                                  username={username}
                                  isEntries={isEntries}
                                />
                              </span>
                            )
                          }

                        </span>
                        {/* render up button for all entries not on first line */}
                        {idx === 0 ? null
                          : <button type="button" onClick={this.moveEntry.bind(this, idx, idx - 1)}>Up</button>}

                        {/* render down button for all entries not on last line */}
                        {idx === max ? null
                          : <button type="button" onClick={this.moveEntry.bind(this, idx, idx + 1)}>Down</button>}
                      </div>
                    )}
                </div>
              )
              : null
          ))
        }
        {/* render create form */}
        {
          // eslint-disable-next-line no-nested-ternary
          isEntries
            ? (
              <form onSubmit={(event) => this.createEntry(0, event)}>
                <input type="text" onChange={(event) => this.handleNewEntryChange(event)} value={text} />
                <input type="submit" />
              </form>
            )
            : (
              add
                ? (
                  <form onSubmit={(e) => this.createEntry(0, e)}>
                    <input type="text" placeholder={isEducation ? 'Institution' : 'Company'} onChange={(e) => this.handleChange(e, 'location')} />
                    <input type="month" onChange={(e) => this.handleChange(e, 'begin')} />
                    <input type="month" onChange={(e) => this.handleChange(e, 'end')} />
                    {isEducation ? <input type="number" step="0.01" placeholder="GPA" onChange={(e) => this.handleChange(e, 'gpa')} /> : null}
                    <input type="submit" />
                    <button type="button" onClick={this.setAddFalse}>Cancel</button>
                  </form>
                )
                : (
                  <button type="button" onClick={this.setAddTrue}>
                    Add
                    {isEducation ? ' education' : ' work experience'}
                  </button>
                )
            )
        }

      </div>
    );
  }
}

Entries.propTypes = {
  entries: PropTypes.instanceOf(Object).isRequired,
  eids: PropTypes.instanceOf(Array).isRequired,
  header: PropTypes.string.isRequired,
  resumeid: PropTypes.number.isRequired,
  username: PropTypes.string.isRequired,
  isEntries: PropTypes.number.isRequired,
};

export default Entries;
