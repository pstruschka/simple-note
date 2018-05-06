import React, { Component } from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import { auth, db } from '../firebase';

import { withStyles } from 'material-ui/styles';
import IconButton from "material-ui/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import { SortableContainer, SortableElement, SortableHandle, arrayMove, } from 'react-sortable-hoc';
import List, {ListItem, ListItemSecondaryAction, ListItemText} from "material-ui/List";

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  list: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    maxWidth: 360,
    maxHeight: 200,
    overflow: 'auto',
  },
});

const DragHandle = SortableHandle(() => <span><MenuIcon/></span>);

const SortableItem = SortableElement(({value}) => {
  return (
    <ListItem >
      <DragHandle />
      <ListItemText primary={(value.index + 1) + '. ' + value.text}/>
      <ListItemSecondaryAction>
        <IconButton aria-label="Delete" onClick={value.cb}>
          <DeleteIcon/>
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
});

const SortableList = SortableContainer(({items}) => {
  return (
    <List>
      {items.map((value, index) => (
        <SortableItem key={`item-${value.id}`} index={index} value={{index: index, text: value.text, cb: value.cb(value.id)}} />
      ))}
    </List>
  );
});

class SortableComponent extends Component {
  state = {
    loadDataCB: null,
    notes: [],
    items: [],
    db: {},
  };

  componentDidMount() {
    //console.log(this.props);
    this.setState({
      loadDataCB: this.props.loadData,
      notes: this.props.notes,
      items: this.props.notes.map(note => {return {text: note.note.note, id: note.id}}),
    })
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    // console.log("should: ", nextProps, nextState);
    if (this.props.notes !== nextProps.notes) {
      // console.log(this.props.notes);
      this.setState({
        notes: nextProps.notes,
        items: nextProps.notes.map(note => {return {text: note.note.note, id: note.id}}),
      });
      return false;
    }
    return this.state.items !== nextState.items
  }

  onSortEnd = ({oldIndex, newIndex}) => {
    const {items} = this.state;

    this.setState({
      items: arrayMove(items, oldIndex, newIndex),
    });
  };

  deleteNote = id => event => {
    event.preventDefault();
    const uid = auth.currentUser.uid;
    // console.log(id, uid, 'clicked');
    db.ref('notes/' + uid + '/' + id).remove()
      .then( () => {
        let ref = db.ref('notes/' + uid);
        this.state.loadDataCB(ref);
      }).catch( (error) => {
      console.log("remove error: " + error.message());
    })
  };

  checkList = () => {
    const {notes, items} = this.state;
    let update = {};
    items.forEach( (value, idx) => {
      if (value.text !== notes[idx].note.note) {
        update[value.id] = {idx: idx, note: value.text};
      }
    });
    const uid = auth.currentUser.uid;
    let ref = db.ref('notes/' + uid);

    if (Object.keys(update).length !== 0 && update.constructor === Object) {
      ref.update(update);
      this.state.loadDataCB(ref);
    }
  };

  render() {
    const {items} = this.state;
    this.checkList();

    return <SortableList items={items.map( v => {return {id: v.id, text: v.text, cb: this.deleteNote}})} onSortEnd={this.onSortEnd} useDragHandle={true} />;
  }
}

export default withStyles(styles)(SortableComponent);