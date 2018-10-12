import React, { Component } from "react";
import { Link } from "react-router-dom";
import Authenticator from '../../utils/Authenticator';
import "./Nav.css";

class NavTabs extends Component {
  state = {
    authenticated: false,
    username: "Anonymous",
    user: undefined
  }
  logoutHandler = (event) => {
    event.preventDefault()
    Authenticator.signout(() => {
      // this.setState({ authenticated: false })
      window.location.assign('/')
    })
  }

  componentDidMount() {
    Authenticator.authenticate(() => {
      this.setState({
        authenticated: true,
        username: Authenticator.username,
        user: Authenticator.user
      })
    })
  }
  render() {
    return (
      <nav className="p-0 mb-3 navbar navbar-expand-lg w-100">
        <ul className="nav nav-tabs ">
          <li className="nav-item">
            <Link to="/" >
              <img src="/assets/controller_logo_white_red_AB.png" alt="controllerLogo" id="controllerLogo" className="ml-2" />
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/" >
              <img src="/assets/VG-NEXUS-logo_400x120.png" alt="VGNLogo" id="VGNLogo" className="mx-2" />
            </Link>
          </li>
        </ul>
        <ul className="nav nav-tabs navbar-collapse">

         
          <li className="nav-item dropdown">
            <button className="nav-link special" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Games
            </button>
            <div className="dropdown-menu" aria-labelledby="navbarDropdown">
              <Link
                to="/all"
                className={
                  window.location.pathname === "/all"
                    ? "nav-link active"
                    : "nav-link"
                }
              >
                <div className="dropdown-item" href="#">Browse</div>
              </Link>
              <Link to="/all" className={
                window.location.pathname === "/all"
                  ? "nav-link active"
                  : "nav-link"
              }                                                                                                                                                        >
                <div className="dropdown-item" href="#">Play</div>
              </Link>
            </div>
          </li>

          <li className="nav-item">
            <Link
              to="/upload"
              className={
                window.location.pathname === "/upload"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Upload
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/community"
              className={
                window.location.pathname === "/community"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Community
          </Link>
          </li>
        </ul>
        {/* user */}
        <ul className="nav nav-tabs">
          <li className="nav-item">
            {!this.state.authenticated ? (
              <div className='d-inline-flex'>
                <Link to="/login_signup" className="nav-link">Sign In</Link>
              </div>
            ) : (
                <div className="nav-item dropdown dropdownMenu">
                  <div className="nav-link special dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {/* Img here  */}
                    <input type="image" src={"/assets/userThumbnails/" + this.state.user.id} />
                  </div>
                  <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                    <Link
                      to="/logout"
                      onClick={this.logoutHandler}>
                      <div className="dropdown-item" href="#">
                       Logout
                       <i className="fas fa-sign-out-alt"></i>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
          </li>

        </ul>
      </nav>
    )
  };
}

export default NavTabs;