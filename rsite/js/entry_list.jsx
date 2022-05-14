import React from 'react';
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
      // entries or info
      isEntries: props.isEntries,
      // entryid of parent entry, if one exists
      parent: props.parent,
      // array of actively editing entries
      stagedEntries: {
        0: {
          add: false,
          isChanged: false,
          content: '',
          begin: '',
          end: '',
          gpa: '',
        },
      },
      // state attributes for type info
      // key: current entryid val: subentries belonging to this entry
      subEntries: {},
      // key: current entryid val: array of eids belonging to subentries of this entry
      subEids: {},
      // key: current entryid val: boolean of if subentries have been fetched
      subFetched: {},
      // recommended entries
      // key: entryid val: CONTENTS & PRIORITY of entry
      // note that on submit we create an eid
      recommended: {},
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
    this.displayTop = this.displayTop.bind(this);
    this.fetchRecommended = this.fetchRecommended.bind(this);
  }

  componentDidMount() {
    const {
      eids,
      resumeid,
      isEntries,
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

    this.fetchRecommended();

    console.log('mount');
    console.log(this);
  }

  // update handler for an existing entry
  handleEntryChange(event, entryid, key) {
    const { stagedEntries } = this.state;
    stagedEntries[entryid][key] = event.target.value;
    stagedEntries[entryid].isChanged = true;
    this.setState({ stagedEntries });
  }

  setAddTrue(entryid) {
    // set add to true and display the recommended entries
    const { stagedEntries } = this.state;
    stagedEntries[entryid].add = true;
    this.setState({ stagedEntries });
  }

  setAddFalse(entryid) {
    const { stagedEntries } = this.state;
    stagedEntries[entryid].add = false;
    this.setState({ stagedEntries });
  }

  fetchRecommended() {
    const {
      entries,
      header,
      username,
      parent,
      isEntries,
      eids,
      resumeid,
    } = this.state;
    // fetch recommended entries
    fetch(`/api/v1/entry/${header}/?type=${isEntries}`, {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entries: Object.keys(entries),
      }),
    })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState({ recommended: data });
      })
      .catch((error) => console.log(error));

    this.setState({
      entries,
      eids,
      header,
      resumeid,
      username,
      isEntries,
      parent,
    });
  }

  // create an entry
  createEntry(event, entryid) {
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
      subFetched,
      isEntries,
    } = this.state;

    // load items from stagedEntries
    const {
      begin,
      end,
      gpa,
      content,
    } = stagedEntries[entryid];
    const all = '';
    // abort empty messages
    if (!(stagedEntries[entryid].isChanged)) {
      // clear staged entry
      stagedEntries[entryid] = {
        add: false,
        isChanged: false,
        content: '',
        begin: '',
        end: '',
        gpa: '',
      };
      this.setState({ stagedEntries });
      return;
    }
    fetch('/api/v1/entry/?operation=create', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeid,
        entryid,
        header,
        type: isEntries,
        begin,
        end,
        gpa,
        parent,
        content,
        all,
      }),
    }).then((response) => {
      if (!response.ok) throw Error(response.statusText);
      return response.json();
    }).then((data) => {
      if (!isEntries) {
        subEntries[data.eid.entryid] = {};
        subEids[data.eid.entryid] = [];
        subFetched[data.eid.entryid] = true;
      }
      entries[data.eid.entryid] = data.entry;
      // clear staged content
      stagedEntries[entryid] = {
        add: false,
        isChanged: false,
        content: '',
        begin: '',
        end: '',
        gpa: '',
      };
      // also clear stagedEntries[0] to fix form render
      stagedEntries[0] = {
        add: false,
        isChanged: false,
        content: '',
        begin: '',
        end: '',
        gpa: '',
      };
      this.setState((prevState) => ({
        eids: prevState.eids.concat(data.eid),
        entries,
        subEntries,
        subEids,
        stagedEntries,
        subFetched,
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
        // TODO: delete staged entry?
        const newEntries = prevState.entries;
        delete newEntries[entryid];
        const neweids = prevState.eids.filter((eid) => eid.entryid !== entryid);

        // update recommended
        this.fetchRecommended();
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
    stagedEntries[entryid] = entries[entryid];
    stagedEntries[entryid].add = true;
    stagedEntries[entryid].isChanged = false;
    this.setState({ stagedEntries });
  }

  // cancel an edit by clearing the edited content
  cancelEdit(entryid) {
    const { stagedEntries } = this.state;
    stagedEntries[entryid] = {
      add: false,
      isChanged: false,
      content: '',
      begin: '',
      end: '',
      gpa: '',
    };
    this.setState({ stagedEntries });
  }

  // submit an edit to an entry
  updateEntry(event, entryid, idx, type, all) {
    event.preventDefault();

    const {
      eids,
      entries,
      resumeid,
      parent,
      header,
      stagedEntries,
      subFetched,
      isEntries,
    } = this.state;

    const {
      content,
      begin,
      end,
      gpa,
    } = stagedEntries[entryid];
    const { pos } = eids[idx];

    // abort unchanged entries
    if (!(stagedEntries[entryid].isChanged)) {
      // clear staged entry
      stagedEntries[entryid] = {
        add: false,
        isChanged: false,
        content: '',
        begin: '',
        end: '',
        gpa: '',
      };
      this.setState({ stagedEntries });
      return;
    }

    fetch(`/api/v1/entry/?operation=update&pos=${pos}`, {
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
        content,
        all,
      }),
    }).then((response) => {
      if (!response.ok) throw Error(response.statusText);
      return response.json();
    }).then((data) => {
      if (!isEntries) {
        subFetched[data.eid.entryid] = true;
      }
      // clear staged content
      stagedEntries[entryid] = {
        add: false,
        isChanged: false,
        content: '',
        begin: '',
        end: '',
        gpa: '',
      };
      // delete old entry in case the entryid has changed (ie when a duplicated entry is edited)
      delete entries[entryid];
      eids[idx] = data.eid;
      entries[data.eid.entryid] = data.entry;
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

  // display the top n recommended entries
  displayTop(count = 3) {
    const { recommended, stagedEntries } = this.state;

    // // sort recommended by priority
    // const sortable = Object.fromEntries(
    //   // DEBUG HERE
    //   Object.entries(recommended).sort(([, a], [, b]) => a - b),
    // );
    const sortable = recommended;

    // display top n entries
    const topn = [];
    for (let index = 0; index < Math.min(count, Object.keys(sortable).length); index += 1) {
      const entryid = Object.keys(sortable)[index];
      const element = sortable[entryid];
      topn[index] = element;

      // update stagedEntries for create
      stagedEntries[entryid] = element;
      stagedEntries[entryid].isChanged = true;
      stagedEntries[entryid].add = true;
    }
    return topn;
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
              {e.entryid in stagedEntries && stagedEntries[e.entryid].add
                ? (
                  <span>

                    {
                      // EDIT FORM
                      isEntries ? (
                        // entry type
                        <form onSubmit={(event) => this.updateEntry(event, e.entryid, idx, isEntries, 0)} encType="multipart/form-data">
                          <input type="text" onChange={(event) => this.handleEntryChange(event, e.entryid, 'content')} value={stagedEntries[e.entryid].content} />
                          <button type="button" onClick={this.cancelEdit.bind(this, e.entryid)}>Cancel</button>
                          <input type="submit" />
                        </form>
                      ) : (
                        // info type
                        <form encType="multipart/form-data">
                          <input type="text" onChange={(event) => this.handleEntryChange(event, e.entryid, 'content')} value={stagedEntries[e.entryid].content} maxLength="256" />
                          <input type="month" onChange={(event) => this.handleEntryChange(event, e.entryid, 'begin')} value={stagedEntries[e.entryid].begin} />
                          <input type="month" onChange={(event) => this.handleEntryChange(event, e.entryid, 'end')} value={stagedEntries[e.entryid].end} />
                          {isEducation ? <input type="number" step="0.01" onChange={(event) => this.handleEntryChange(event, e.entryid, 'gpa')} value={stagedEntries[e.entryid].gpa} min="0.0" max="4.0" /> : null}
                          <input type="button" onClick={(event) => this.updateEntry(event, e.entryid, idx, isEntries, 0)} value="Submit edit for this resume" />
                          {entries[e.entryid].frequency > 1 ? <input type="button" onClick={(event) => this.updateEntry(event, e.entryid, idx, isEntries, 1)} value="Submit edit for all resumes" /> : null}
                          <button type="button" onClick={this.cancelEdit.bind(this, e.entryid)}>Cancel</button>
                        </form>
                      )
                    }
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
                            {/* these buttons are identical to above */}
                            <button type="button" onClick={this.editEntry.bind(this, e.entryid)}>Edit</button>
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
              // ENTRY TYPE
              stagedEntries[0].add
                ? (
                  <span>
                    <form onSubmit={(event) => this.createEntry(event, 0)}>
                      <input type="text" onChange={(event) => this.handleEntryChange(event, 0, 'content')} value={stagedEntries[0].content} />
                      <button type="button" onClick={this.setAddFalse.bind(this, 0)}>Cancel</button>
                      <input type="submit" />
                    </form>
                    {
                      this.displayTop(3).map((e) => (
                        <button key={e.entryid} type="button" onClick={(event) => this.createEntry(event, e.entryid)}>{e.content}</button>
                      ))
                    }
                  </span>
                ) : (
                  <button type="button" onClick={this.setAddTrue.bind(this, 0)}>Add entry</button>
                )
            )
            : (
              // INFO TYPE
              stagedEntries[0].add
                ? (
                  <span>
                    <form onSubmit={(e) => this.createEntry(e, 0)}>
                      <input type="text" placeholder={isEducation ? 'Institution' : 'Company'} onChange={(e) => this.handleEntryChange(e, 0, 'content')} />
                      <input type="month" onChange={(e) => this.handleEntryChange(e, 0, 'begin')} />
                      <input type="month" onChange={(e) => this.handleEntryChange(e, 0, 'end')} />
                      {isEducation ? <input type="number" step="0.01" placeholder="GPA" onChange={(e) => this.handleEntryChange(e, 0, 'gpa')} /> : null}
                      <input type="submit" />
                      <button type="button" onClick={this.setAddFalse.bind(this, 0)}>Cancel</button>
                    </form>
                    {
                      this.displayTop(3).map((e) => (
                        <button key={e.entryid} type="button" onClick={(event) => this.createEntry(event, e.entryid)}>{e.content}</button>
                      ))
                    }
                  </span>
                )
                : (
                  <button type="button" onClick={this.setAddTrue.bind(this, 0)}>
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
  parent: undefined,
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
