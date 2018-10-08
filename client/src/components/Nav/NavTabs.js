import React, {Component} from "react";
import { Link } from "react-router-dom";
import Authenticator from '../../utils/Authenticator';
import "./Nav.css";

class NavTabs extends Component{
  state = {
    authenticated: false
  }
  logoutHandler=(event)=>{
    event.preventDefault()
    Authenticator.signout(()=>{
      this.setState({authenticated: false})
    })
  }

  componentDidMount(){
    Authenticator.authenticate(()=>{
      this.setState({authenticated: true})
    })
  }
  render(){
    return(
    <nav className="p-0 mb-3 navbar navbar-expand-lg w-100">
    {/* separate elements in nav bar with margin */}
      <ul className="nav nav-tabs"> 
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
        <li className="nav-item">
          <Link
            to="/about"
            className={
              window.location.pathname === "/about" ? "nav-link active" : "nav-link"
            }
          >
            About
          </Link>
        </li>
        <li class="nav-item dropdown">
            <a class="nav-link" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Games
        </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
            <Link
              to="/all"
              className={
                window.location.pathname === "/all"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <a class="dropdown-item" href="#">Browse</a>
          </Link>              
          <Link
              to="/all"
              className={
                window.location.pathname === "/all"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <a className="dropdown-item" href="#">Play</a>
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
      <ul className="nav nav-tabs">
      <li className="nav-item">
        {!this.state.authenticated ? (
          <div className='d-inline-flex'>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/login_signup" className="nav-link">[test both]</Link>
          <Link to="/signup" className="nav-link">Sign Up</Link>
          </div>
          ) : (
          <Link
            to="/logout"
            className={
              window.location.pathname === "/logout"
                ? "nav-link active"
                : "nav-link"
            }
            onClick = {this.logoutHandler}
          >
            Logout
          </Link>  
          )}
      </li>

      </ul>
    </nav>
  )};
}
  
export default NavTabs;