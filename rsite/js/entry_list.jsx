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
      newEntries: new Map(),
      header: props.header,
      resumeid: props.resumeid,
    };
    this.createEntry = this.createEntry.bind(this);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.handleEntryChange = this.handleEntryChange.bind(this);
  }

  componentDidMount() {
    const {
      entries,
      eids,
      header,
      resumeid,
    } = this.props;
    this.setState({
      entries,
      eids,
      header,
      resumeid,
    });
    console.log('mount');
    console.log(this);
  }

  handleEntryChange(header, event) {
    const str = `.${header}`;
    const { newEntries } = this.state;
    newEntries.set(str, event.target.value);
    this.setState({ newEntries });
  }

  createEntry(header, entryid, event) {
    event.preventDefault();

    const { resumeid, newEntries } = this.state;
    const str = `.${header}`;
    fetch(`/api/v1/entry/?resumeid=${resumeid}&entryid=${entryid}&header=${header}`, {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newEntries.get(str) }),
    }).then((response) => {
      if (!response.ok) throw Error(response.statusText);
      return response.json();
    }).then((data) => {
      this.setState((prevState) => {
        newEntries[header] = '';
        return {
          eids: prevState.eids.concat({
            entryid: data.entryid,
            resumeid,
          }),
          entries: prevState.entries.set(`${data.entryid}`, data.entry),
          newEntries,
        };
      });
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

  render() {
    const { header, eids, entries, newEntries } = this.state;
    return (
      <div>
        <h1>{header}</h1>
        {
          eids.map((e) => (
            entries.get(`${e.entryid}`).header === header
              ? (
                <div key={e.entryid}>
                  {/* render content */}
                  <span>{entries.get(`${e.entryid}`).content}</span>
                  {/* render delete form */}
                  <button type="button" onClick={this.deleteEntry.bind(this, e.entryid)}>Delete</button>
                </div>
              )
              : null
          ))
        }
        {/* render create form */}
        <form onSubmit={(event) => this.createEntry(header, 0, event)}>
          <input type="text" onChange={(event) => this.handleEntryChange(header, event)} value={newEntries[header]} />
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
};

export default Entries;
