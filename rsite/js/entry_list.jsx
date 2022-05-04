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
      // console.log(data);

      this.setState((prevState) => ({
        eids: prevState.eids.concat({
          entryid: data.entryid,
          resumeid,
        }),

        entries: prevState.entries.set(`${data.entryid}`, data.entry),
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
      // eslint-disable-next-line prefer-arrow-callback
      this.setState(function (prevState) {
        delete prevState[`${entryid}`];
        return {
          entries: prevState.entries.delete(`${entryid}`),
          eids: prevState.eids.filter((eid) => eid.entryid !== entryid),
        };
      });
      // const { entries } = this.state;
      // console.log(entries);
    })
      .catch((error) => console.log(error));
  }

  render() {
    const { header, eids, entries } = this.state;
    // console.log('render');
    // console.log(this);
    return (
      <div>
        <h1>{header}</h1>
        {
          eids.map((e) => (
            entries.get(`${e.entryid}`).header === header
              ? (
                <div key={e.entryid}>
                  {/* render content */}
                  {console.log(entries)}
                  <span>{entries.get(`${e.entryid}`).content}</span>
                  {/* render delete form */}
                  {/* <form onSubmit={() => this.deleteEntry(e.entryid)}>
                    <input type="submit" value="Delete" />
                </form> */}
                  <button type="button" onClick={this.deleteEntry.bind(this, e.entryid)}>Delete</button>
                </div>
              )
              : null
          ))
        }
        {/* render create form */}
        <form onSubmit={(event) => this.createEntry(header, 0, event)}>
          <input type="text" onChange={(event) => this.handleEntryChange(header, event)} />
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
