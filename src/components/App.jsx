import React, {Component} from 'react';
import {Route, withRouter, Link} from 'react-router-dom';
import {auth} from '../firebase';

import {MuiThemeProvider, createMuiTheme} from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import {CircularProgress} from 'material-ui/Progress';
import IconButton from 'material-ui/IconButton';
import Menu, {MenuItem} from 'material-ui/Menu';
import MenuIcon from '@material-ui/icons/Menu';

import AccountCircle from '@material-ui/icons/AccountCircle';

import PrivateRoute from './PrivateRoute';
import Main from './Main';
import Login from './Login';
import Signup from './Signup';
import Account from './Account';
import Forgot from "./Forgot";

import {withStyles} from "material-ui";

const theme = createMuiTheme();

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

class App extends Component {
  // constructor(props) {
  //   super(props);
  //   auth.onAuthStateChanged((user) => {
  //     if (user) {
  //       this.setState({
  //           authenticated: true,
  //           currentUser: user,
  //           loading: false,
  //         }, () => {
  //           this.props.history.push('/')
  //         }
  //       );
  //     } else {
  //       this.setState({
  //         authenticated: false,
  //         currentUser: null,
  //         loading: false,
  //       });
  //     }
  //   });
  // }

  state = {
    loading: true,
    authenticated: false,
    currentUser: null,
    anchorEl: null,
  };

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      //if (user === null)
      //  return null;
      if (user) {
        // console.log(user);
        auth.fetchProvidersForEmail(user.email).then( (l) => {
          if (l.includes('facebook.com')) {
            this.setState({
                authenticated: true,
                currentUser: user,
                loading: false,
              }, () => {
                this.props.history.push('/')
              }
            );
          }
        }).catch( error => {
          console.log("error: " + error.message);
        });
        if (user.emailVerified) {
          this.setState({
              authenticated: user.emailVerified,
              currentUser: user,
              loading: false,
            }, () => {
              this.props.history.push('/')
            }
          );
          return;
        }
      }
      this.setState({
        authenticated: false,
        currentUser: null,
        loading: false,
      });
    });
  }

  handleMenu = event => {
    this.setState({anchorEl: event.currentTarget});
  };

  handleClose = () => {
    this.setState({anchorEl: null});
  };

  handleLogoutMenuItem = () => {
    this.handleClose();
    auth.signOut();
  };

  updateUser = () => {
    this.setState({
      user: auth.currentUser,
    });
  };

  render() {
    const {classes} = this.props;
    const {authenticated, loading, anchorEl} = this.state;
    const open = Boolean(anchorEl);
    const user = auth.currentUser;
    const content = loading ? (
      <div align="center">
        <CircularProgress size={80} thickness={5}/>
      </div>
    ) : (
      <div>
        <PrivateRoute
          exact
          path="/"
          component={Main}
          authenticated={authenticated}/>
        <PrivateRoute
          exact
          path="/account"
          component={Account}
          cb={this.updateUser}
          authenticated={authenticated}/>
        <Route exact path="/login" component={Login}/>
        <Route exact path="/signup" component={Signup}/>
        <Route exact path="/forgot" component={Forgot}/>
      </div>
    );
    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.root}>
          <AppBar position="static">
            <Toolbar>
              <IconButton component={Link}
                          to="/"
                          className={classes.menuButton}
                          color="inherit"
                          aria-label="Menu">
                <MenuIcon />
              </IconButton>
              <Typography variant="title" color="inherit">
                Simple Note
              </Typography><ul/>
              {authenticated &&
                <Typography variant="subheading" color="inherit" className={classes.flex}>
                  Hi, {user.displayName || user.email}
                </Typography>
              }
              {authenticated && (
                <div>

                  <IconButton
                    aria-owns={open ? 'menu-appBar' : null}
                    aria-haspopup="true"
                    onClick={this.handleMenu}
                    color="inherit"
                  >
                    <AccountCircle/>
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={open}
                    onClose={this.handleClose}
                  >
                    <MenuItem
                      component={Link}
                      to="/account"
                      onClick={this.handleClose}
                    >
                      My Account
                    </MenuItem>
                    <MenuItem onClick={this.handleLogoutMenuItem}>
                      Sign out
                    </MenuItem>
                  </Menu>
                </div>
              )}
            </Toolbar>
          </AppBar>
          {content}
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(withRouter(App));
