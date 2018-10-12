import React, { Component } from 'react';
import Form from './pages/UploadForm';
import Game from './components/Game/Game';
import LoginSignup from "./pages/LoginSignup";
import NavTabs from "./components/Nav";
import {Container} from "./components/Grid";
import Footer from "./components/Footer"
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import ChooseGame from "./pages/ChooseGame/ChooseGame";
import Profile from "./pages/Profile";
import Community from "./pages/Community/Community";
import UserNexus from "./pages/UserNexus/UserNexus"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";


class App extends Component {
 
  render() {
    return (
      <Router>
      <div>
        <NavTabs />
        <Container>
          <Route exact path="/" component={Home} />
          <Route path="/all" component={ChooseGame} />
          <Route exact path="/upload" component={Form} />
          <Route exact path="/game" component={Game} />
          <Route exact path='/login_signup' component={LoginSignup} />
          <Route exact path='/community' component={Community} />
          <Route exact path='/UserNexus' component={UserNexus} />
          <Route exact path="/profile" component={Profile} />          
          <Route exact path="/about" component={About} />
        </Container>
        <Footer />
      </div>
    </Router>

    );
  }
}

export default App;

