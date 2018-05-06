import React, { Component } from 'react';
import firebase, { auth } from '../firebase';
import {Link} from "react-router-dom";

import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import GooglePlusBoxIcon from 'mdi-react/GooglePlusBoxIcon';
import FacebookBoxIcon from 'mdi-react/FacebookBoxIcon';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  button: {
    margin: theme.spacing.unit,
  },
});

class Login extends Component {

  state = {
    email: "",
    password: "",
    message: ""
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  onSubmit = event => {
    event.preventDefault();
    const { email, password } = this.state;
    auth.signInWithEmailAndPassword(email, password)
      .then(authUser => {
        if (!authUser.emailVerified) {
          this.setState({
            message: "Email not verified"
          });
          auth.signOut();
        }
      })
      .catch(authError => {
        this.setState({message: authError.message})
      });
  };

  handleGoogleLogin = event => {
    event.preventDefault();
    console.log("Login with Google");
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then( () => {
        console.log("logged in with Google");
      }).catch( error => {
        this.setState({message: error.message})
    });
  };

  handleFacebookLogin = event => {
    event.preventDefault();
    console.log("Login with Facebook");
    const provider = new firebase.auth.FacebookAuthProvider();
    provider.setCustomParameters({
      'display': 'popup',
    });
    auth.signInWithPopup(provider)
      .then( () => {
        console.log("logged in with Facebook");
      }).catch( error => {
        this.setState({message: error.message})
    })
  };

  render() {
    const { email, password, message } = this.state;
    const classes = this.props.classes;
    return (
      <Grid container>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <h1>Log in</h1>
            <form onSubmit={this.onSubmit} autoComplete="off">
              <TextField
                id="email"
                label="Email"
                className={classes.textField}
                value={email}
                onChange={this.handleChange('email')}
                margin="normal"
                type="email"
              />
              <br/>
              <TextField
                id="password"
                label="Password"
                className={classes.textField}
                value={password}
                onChange={this.handleChange('password')}
                margin="normal"
                type="password"
              />
              <br/>
              <Button variant="raised" color="primary" type="submit">
                Log in
              </Button>
            </form>
            { message && (
              <Typography>
                {message}
              </Typography>
            )}
            <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
            <p>Forgot your password? <Link to="/forgot">Recover password</Link></p>
            <br/>
            <IconButton className={classes.button} aria-label="Login with Google" onClick={this.handleGoogleLogin}><GooglePlusBoxIcon size={36} color="#E74C3C"/></IconButton>
            <IconButton className={classes.button} aria-label="Login with Facebook" onClick={this.handleFacebookLogin}><FacebookBoxIcon size={36} color="#3B5998"/></IconButton>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Login);
