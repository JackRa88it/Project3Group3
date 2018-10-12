import React from 'react';
// import tabs
import Tabs from "../../components/UserNexus/Tabs"
// import editprofile
// import EditProfile from "../../components/UserNexus/EditProfile"
// import editgames
// import EditGame from "../../components/UserNexus/EditGame"
import { Input, TextArea, FormBtn } from "../../components/Form";
import { Row, Col, Container } from "../../components/Grid"
import API from "../../utils/API";

// Refer to this image for what edit profile looks like: https://i.imgur.com/iaBGqD1.jpg
class UserNexus extends React.Component {
  state = {
    location: "Profile"
  }
  handleTabClick = event => {
    console.log("============")
    console.log("Tab Clicked")
    console.log("============")
    const { name, value } = event.target
    this.setState({
      [name]: value
    })
    console.log(this.state.location);
  }
  render() {
    if (this.state.location === "Profile") {
      return (
        <div>
          <Tabs handleTabClick = {this.handleTabClick} state = {this.state}/>
          <h1>Profile</h1>
        </div>
      )
    }
    if (this.state.location === "Game") {
      return (
        <div>
          <Tabs onClick = {this.handleTabClick} state = {this.state}/>
          <h1>Game</h1>
        </div>
      )
    }
  }
}


export default UserNexus;
// export default UserNexusGames;
// export default UserNexusPosts


// <Row>
// {/* Left column */}
// <Col size="md-6">
//   <div className="mr-4">
//     <div>
//       <Input
//         name="Username"
//         placeholder="Current username text here"
//       />
//       <Input
//         name="banner"
//         placeholder="Current User Banner Text here"
//       />
//       <Input
//         name="bio"
//         placeholder="Current User Bio Text here"
//       />

//       <FormBtn>
//         Submit
// </FormBtn>
//       <h2 className="display-5 mb-4">Uploading Images</h2>
//       <FormBtn>
//         Upload avatar image
// </FormBtn>
//       <FormBtn>
//         Upload banner image
// </FormBtn>
//     </div>
//   </div>
// </Col>
// {/* Right column */}
// <Col size="md-6">
//   <div className="ml-5">
//   {/* Avatar image on this line */}
//   </div>
// </Col>
// </Row>
