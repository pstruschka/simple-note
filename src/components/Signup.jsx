import React, {Component} from 'react';
import {auth} from '../firebase';
import { Link } from 'react-router-dom';

import {withStyles} from 'material-ui/styles';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
});

class Signup extends Component {

  state = {
    email: "",
    password: "",
    confirmPassword: "",
    message: "",
  };

  onSubmit = (event) => {
    event.preventDefault();
    const {email, password, confirmPassword} = this.state;
    if (password !== confirmPassword) {
      //alert("Passwords do not match");
      this.setState({
        password: "",
        confirmPassword: "",
        message: "Passwords do not match",
      });
    } else {
      auth.createUserWithEmailAndPassword(email, password)
        .then(authUser => {
          console.log(authUser);
          authUser.sendEmailVerification().then( () => {
            this.props.history.push("/");
          }).catch( (error) => {
            this.setState({
              message: error.message
            })
          });
          auth.signOut();
        })
        .catch(authError => {
          this.setState({
            message: authError.message,
          });
          //alert(authError);
        });
    }
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  render() {
    const {email, password, confirmPassword, message} = this.state;
    const classes = this.props.classes;
    return (
      <div>
        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <h1>Sign up</h1>
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
                <TextField
                  id="confirm-password"
                  label="Confirm password"
                  className={classes.textField}
                  value={confirmPassword}
                  onChange={this.handleChange('confirmPassword')}
                  margin="normal"
                  type="password"
                />
                <br/>
                <Button variant="raised" color="primary" type="submit">Sign up</Button>
              </form>
              { message && (
                <Typography>
                  {message}
                </Typography>
              )}
              <p>Already have an account? <Link to="/">Log in here</Link></p>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(Signup);
