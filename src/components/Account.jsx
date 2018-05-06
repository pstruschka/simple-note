import React, { Component } from 'react';
import firebase, { auth } from '../firebase';

import {withStyles} from 'material-ui/styles';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import Grid  from "material-ui/Grid";
import Paper from "material-ui/Paper";
import {CircularProgress} from "material-ui";

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

class Account extends Component {
  state = {
    user: auth.currentUser,
    email: auth.currentUser.email,
    displayName: auth.currentUser.displayName || "",
    providersPromise: null,
    authPromise: null,
    provider: "",
    loading: true,
    origPassword: "",
    password: "",
    confirmPassword: "",
    message: "",
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  submitName = (event) => {
    event.preventDefault();
    const {user, displayName} = this.state;
    if (user.displayName !== displayName) {
      user.updateProfile({displayName: displayName, photoURL: null})
      .then( () => {
        this.setState({
          user: auth.currentUser,
          displayName: auth.currentUser.displayName,
          message: "Display name changed",
        });
        this.props.cb();
      })
      .catch( (error) => {
        this.setState({message: error.message });
      })
    } else {
      this.setState({message: "Display name unchanged"})
    }
  };

  submitPassword = (event) => {
    event.preventDefault();
    const {user, origPassword, password, confirmPassword} = this.state;
    if (password === confirmPassword) {
      let credential = firebase.auth.EmailAuthProvider.credential(user.email, origPassword);
      console.log("cred", credential);
      const authPromise = user.reauthenticateWithCredential(credential);
      this.setState({authPromise: authPromise});
      authPromise.then(() => {
        user.updatePassword(password).then( () => {
          this.setState({message: "Password updated"});
        }).catch( error => {
          console.log(error);
          this.setState({message: error.message})
        });
      }).catch(error => {
        const errorStr = error.code === "auth/wrong-password" ? "Current password incorrect" : error.message;
        this.setState({message: errorStr});
        console.log(error);
      });
    } else {
      this.setState({message: "Passwords do not match"})
    }
  };

  componentDidMount() {
    const {user} = this.state;
    const providersPromise = auth.fetchProvidersForEmail(user.email);

    this.setState({providersPromise: providersPromise});
    providersPromise.then( (providers) => {
      this.setState({provider: providers[0], loading: false});
      // console.log(providers[0]);
    }).catch( error => {
      console.log("Failed to get providers: " + error.message);
    })
  }

  componentWillUnmount() {
    if (this.state.providersPromise) {
      this.state.providersPromise.cancel();
    }
    if (this.state.authPromise) {
      this.state.authPromise.cancel();
    }
  }

  render() {
    const classes = this.props.classes;
    const {email, displayName, origPassword, password, confirmPassword, provider, loading, message} = this.state;
    const passwordLogin = (provider === 'password');
    const providerString = (!passwordLogin) ? (provider === "google.com") ? "Google": (provider === "facebook.com") ? "Facebook" : "" : "";

    const content = loading ? (
      <div align="center">
        <CircularProgress size={80} thickness={5}/>
      </div>
    ) : ( passwordLogin ?
        <form onSubmit={this.submitPassword} autoComplete="off">
          <TextField
            id="oldPassword"
            label="Current Password"
            value={origPassword}
            onChange={this.handleChange('origPassword')}
            margin="normal"
            type="password"
          />
          <br/>
          <TextField
            id="password"
            label="Password"
            value={password}
            onChange={this.handleChange('password')}
            margin="normal"
            type="password"
          />
          <br/>
          <TextField
            id="confirm-password"
            label="Confirm password"
            value={confirmPassword}
            onChange={this.handleChange('confirmPassword')}
            margin="normal"
            type="password"
          />
          <br/>
          <Button variant="raised" color="primary" type="submit">Change password</Button>
        </form> : <Typography variant="subheading"> Logged in with: {providerString} </Typography>);

    return (
      <Grid container className={classes.container}>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <form onSubmit={this.submitName} autoComplete="off">
              <TextField
                id="name"
                label="Name"
                value={displayName}
                onChange={this.handleChange('displayName')}
                margin="normal"
                type="text"
              />
              <Button variant="raised" color="primary" type="submit">Set Name</Button>
            </form>
            <br/>
            <form autoComplete="off">
              <br/>
              <TextField
                id="email"
                label="Email"
                value={email}
                onChange={this.handleChange('email')}
                margin="normal"
                type="email"
                disabled={true}
              />
            </form>
            <br/>
            {content}
            <br/>
            <Typography>
              {message}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    )
  };
}

export default withStyles(styles)(Account);