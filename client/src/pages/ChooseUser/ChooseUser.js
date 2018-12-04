import React from "react";
import { Route } from "react-router-dom";
import Profile from "../Profile";

const ChooseUser = props => (
  <div>
    <Route path={`${props.match.url}/:id`} component={Profile}/>
  </div>
);

export default ChooseUser;
