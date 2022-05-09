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
      header: props.header,
      resumeid: props.resumeid,
      username: props.username,
      isEntries: props.isEntries,
      parent: props.parent,
      // array of actively editing entries
      stagedEntries: {
        0: {
          text: '',
          begin: '',
          end: '',
          gpa: null,
        },
      },
      // state attributes for type info
      add: false,
      // key: current entryid val: subentries belonging to this entry
      subEntries: {},
      // key: current entryid val: array of eids belonging to subentries of this entry
      subEids: {},
      // key: current entryid val: boolean of if subentries have been fetched
      subFetched: {},
    };
    this.createEntry = this.createEntry.bind(this);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.updateEntry = this.updateEntry.bind(this);
    this.editEntry = this.editEntry.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.moveEntry = this.moveEntry.bind(this);
    this.setAddTrue = this.setAddTrue.bind(this);
    this.setAddFalse = this.setAddFalse.bind(this);
    this.handleEntryChange = this.handleEntryChange.bind(this);
  }

  componentDidMount() {
    const {
      entries,
      eids,
      header,
      resumeid,
      username,
      isEntries,
      parent,
    } = this.props;

    if (!isEntries && eids.length > 0) {
      // fetch subentries. one fetch per entryid in the info entries
      // for example, there could be two entries in the experience header
      // in such a case, it is necessary to fetch subentries of each, thus two fetches
      eids.forEach((e) => {
        const { entryid } = e;
        fetch(`/api/v1/entry/${entryid}/?resumeid=${resumeid}`, { credentials: 'same-origin' })
          .then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
          })
          .then((data) => {
            const { subEntries, subEids, subFetched } = this.state;
            subEntries[entryid] = data.entries;
            subEids[entryid] = data.eids;
            subFetched[entryid] = true;
            this.setState({
              subEntries,
              subEids,
              subFetched,
            });
          })
          .catch((error) => console.log(error));
      });
    }

    this.setState({
      entries,
      eids,
      header,
      resumeid,
      username,
      isEntries,
      add: false,
      parent,
    });
    console.log('mount');
    console.log(this);
  }

  // update handler for an existing entry
  handleEntryChange(event, entryid, key) {
    const { stagedEntries } = this.state;
    stagedEntries[entryid][key] = event.target.value;
    this.setState({ stagedEntries });
  }

  setAddTrue() {
    this.setState({ add: true });
  }

  setAddFalse() {
    this.setState({
      stagedEntries: {},
      add: false,
    });
  }

  // create an entry
  createEntry(entryid, type, event) {
    event.preventDefault();

    const {
      resumeid,
      header,
      entries,
      username,
      stagedEntries,
      parent,
      subEntries,
      subEids,
      isEntries,
    } = this.state;

    // load items from stagedEntries
    const {
      begin,
      end,
      gpa,
      text,
    } = stagedEntries[0];
    fetch('/api/v1/entry/?&operation=create', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeid,
        entryid,
        header,
        type,
        begin,
        end,
        gpa,
        parent,
        text,
      }),
    }).then((response) => {
      if (!response.ok) throw Error(response.statusText);
      return response.json();
    }).then((data) => {
      if (!isEntries) {
        subEntries[data.eid.entryid] = {};
        subEids[data.eid.entryid] = [];
      }
      entries[data.eid.entryid] = data.entry;
      stagedEntries[0].text = '';
      this.setState((prevState) => ({
        eids: prevState.eids.concat(data.eid),
        entries,
        add: false,
        subEntries,
        subEids,
        stagedEntries,
      }));
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
    const { stagedEntries, entries } = this.state;
    stagedEntries[entryid] = entries[entryid].content;
    this.setState({ stagedEntries });
  }

  // cancel an edit by clearing the edited content
  cancelEdit(entryid) {
    const { stagedEntries } = this.state;
    delete stagedEntries[entryid];
    this.setState({ stagedEntries });
  }

  // submit an edit to an entry
  updateEntry(event, entryid, idx) {
    event.preventDefault();

    const {
      eids,
      entries,
      resumeid,
      header,
      stagedEntries,
    } = this.state;

    const {
      text,
      type,
      begin,
      end,
      gpa,
      parent,
    } = stagedEntries[entryid];
    const { pos } = eids[idx];

    fetch(`/api/v1/entry/?operation=create&pos=${pos}`, {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeid,
        entryid,
        header,
        type,
        begin,
        end,
        gpa,
        parent,
        text,
      }),
    }).then((response) => {
      if (!response.ok) throw Error(response.statusText);
      return response.json();
    }).then((data) => {
      delete stagedEntries[entryid];
      eids[idx] = data.eid;
      entries[entryid] = data.entry;
      this.setState({
        eids,
        entries,
        stagedEntries,
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
      stagedEntries,
      isEntries,
      add,
      subEntries,
      subEids,
      subFetched,
    } = this.state;
    const isEducation = header === 'education';
    const max = Object.keys(eids).length - 1;
    return (
      <div>
        {
          eids.map((e, idx) => (
            <div key={e.entryid}>
              {e.entryid in stagedEntries
                // render the edit button but only for entry type
                ? (
                  <span>
                    <form onSubmit={(event) => this.updateEntry(event, e.entryid, idx)} encType="multipart/form-data">
                      {
                        // render edit form
                        isEntries ? (
                          <div>
                            <input type="text" onChange={(event) => this.handleEntryChange(event, e.entryid, 'text')} value={stagedEntries[e.entryid]} />
                            <button type="button" onClick={this.cancelEdit.bind(this, e.entryid)}>Cancel</button>
                          </div>
                        ) : null
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
                            {
                              subFetched[e.entryid]
                                ? (
                                  <Entries
                                    entries={subEntries[e.entryid]}
                                    eids={subEids[e.entryid]}
                                    resumeid={resumeid}
                                    header={header}
                                    username={username}
                                    isEntries={1}
                                    parent={e.entryid}
                                  />
                                ) : null
                            }
                          </span>
                        )
                      }
                    </span>
                  </div>
                )}
              {/* render up button for all entries not on first line */}
              {idx === 0 ? null
                : <button type="button" onClick={this.moveEntry.bind(this, idx, idx - 1)}>Up</button>}

              {/* render down button for all entries not on last line */}
              {idx === max ? null
                : <button type="button" onClick={this.moveEntry.bind(this, idx, idx + 1)}>Down</button>}
            </div>
          ))
        }
        {/* render create form */}
        {
          // eslint-disable-next-line no-nested-ternary
          isEntries
            ? (
              <form onSubmit={(event) => this.createEntry(0, 1, event)}>
                <input type="text" onChange={(event) => this.handleEntryChange(event, 0, 'text')} value={stagedEntries['.text']} />
                <input type="submit" />
              </form>
            )
            : (
              add
                ? (
                  <form onSubmit={(e) => this.createEntry(0, 0, e)}>
                    <input type="text" placeholder={isEducation ? 'Institution' : 'Company'} onChange={(e) => this.handleEntryChange(e, 0, 'text')} />
                    <input type="month" onChange={(e) => this.handleEntryChange(e, 0, 'begin')} />
                    <input type="month" onChange={(e) => this.handleEntryChange(e, 0, 'end')} />
                    {isEducation ? <input type="number" step="0.01" placeholder="GPA" onChange={(e) => this.handleEntryChange(e, 0, 'gpa')} /> : null}
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

Entries.defaultProps = {
  entries: {},
  eids: [],
  parent: null,
};

Entries.propTypes = {
  entries: PropTypes.instanceOf(Object),
  eids: PropTypes.instanceOf(Array),
  header: PropTypes.string.isRequired,
  resumeid: PropTypes.number.isRequired,
  username: PropTypes.string.isRequired,
  isEntries: PropTypes.number.isRequired,
  parent: PropTypes.number,
};

export default Entries;
