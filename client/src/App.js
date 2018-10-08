import React, { Component } from 'react';
import Form from './pages/UploadForm';
import Game from './components/Game/Game';
import LoginSignup from "./pages/LoginSignup";
import NavTabs from "./components/Nav";
import {Container} from "./components/Grid";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import ChooseGame from "./pages/ChooseGame/ChooseGame";
import Community from "./pages/Community/Community";
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
          <Route exact path="/about" component={About} />
          <Route path="/all" component={ChooseGame} />
          <Route exact path="/upload" component={Form} />
          <Route exact path="/game" component={Game} />
          <Route exact path='/login_signup' component={LoginSignup} />
          <Route exact path='/community' component={Community} />
        </Container>
      </div>
    </Router>

    );
  }
}

export default App;

