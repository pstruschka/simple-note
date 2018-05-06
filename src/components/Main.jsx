import React, { Component } from 'react';
import { auth, db } from '../firebase';

import SortableComponent from './SortableComponent';

import { withStyles } from 'material-ui/styles';
import Grid  from "material-ui/Grid";
import Paper from "material-ui/Paper";
import TextField from "material-ui/TextField";
import Button from "material-ui/Button";

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'left',
    color: theme.palette.text.secondary,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
});

class Main extends Component {

  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      tmpNotes: [],
      notes: [],
      current : "",
      notesRef: null,
    };
  }

  updateNotes = (notesRef) => {
    notesRef.orderByChild('idx').limitToLast(100).once('value', snapshot => {
      // console.log("---------------");
      this.setState({count: 0});
      snapshot.forEach(childSnapshot => {
        // console.log(childSnapshot.key, childSnapshot.val());
        let note = {note: childSnapshot.val(), id: childSnapshot.key};
        // console.log("notes state:", this.state.tmpNotes);
        //let notes = this.state.notes.concat([note]);
        this.setState({
          count: this.state.count + 1,
          tmpNotes: this.state.tmpNotes.concat([note])
        });
        // notes.concat({note: childSnapshot.val(), id: childSnapshot.key})
      });
      // console.log("================");
    }).then(() => {
      this.setState({
        tmpNotes: [],
        notes: this.state.tmpNotes,
      });
      // console.log("complete promise");
    });
  };

  componentDidMount() {
    const uid = auth.currentUser.uid;
    let notesRef = db.ref('notes/' + uid);
    this.setState({notesRef: notesRef});
    this.updateNotes(notesRef);
  }

  componentWillUnmount() {
    this.state.notesRef.off();
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  addNote = event => {
    event.preventDefault();
    const uid = auth.currentUser.uid;

    db.ref('notes/' + uid).push({idx: this.state.count, note: this.state.current});
    this.setState({ current : "" });
    this.updateNotes(this.state.notesRef);
  };

  render() {
    const classes = this.props.classes;
    const {current, notes} = this.state;

    return (
      <Grid container className={classes.container}>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <p>Hello, { auth.currentUser.displayName || auth.currentUser.email }</p>

            <SortableComponent notes={notes} loadData={this.updateNotes}/>

            <form onSubmit={this.addNote} autoComplete="off">
              <TextField
                id="note"
                label="Enter new note"
                className={classes.textField}
                value={current}
                onChange={this.handleChange('current')}
                margin="normal"/>
              <br/>
              <Button variant="raised" color="primary" type="submit">Add</Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Main);
