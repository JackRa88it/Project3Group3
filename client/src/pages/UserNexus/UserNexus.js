import React from 'react';
import Tabs from "../../components/UserNexus/Tabs"
import Posts from "../../components/UserNexus/Posts"
import { Input, TextArea, FormBtn } from "../../components/Form";
import { Row, Col, Container } from "../../components/Grid"
import GameList from '../../components/GameList';
import API from "../../utils/API";
import Authenticator from '../../utils/Authenticator';

// Refer to this image for what edit profile looks like: https://i.imgur.com/iaBGqD1.jpg
class UserNexus extends React.Component {
  state = {
    location: "Edit Profile",
    Username: "",
    Banner: "",
    Bio: "",
    Games: []
  };


  formPopulate = ()=>{
    if(Authenticator.isAuthenticated){
      API.getUser(Authenticator.user.id)
      .then(res => {
        console.log(res)
        this.setState({
          Username: res.data.username,
          Banner: res.data.postBanner,
          Bio: res.data.bio
        })
      })
    }
  }

  deleteHandler = (gameId) => {
    API.deleteGame(gameId)
    .then((res)=>{
      this.getUserGames(Authenticator.user.id)
    })
  }

  getUserGames() {
    API.getUserGames(Authenticator.user.id)
      .then(res => {
        this.setState({ Games: res.data });
      });
  }

  handleTabClick = (event) => {
    const name = (event.target.getAttribute("name"))
    const value = (event.target.getAttribute("value"))
    console.log(name)
    console.log(value)

    this.setState({
      [name]: value
    })
    if(value == 'Game'){
      this.getUserGames();
    }
    console.log(this.state.location);
  };

  handleSubmitEditProfile = (event) =>{
    if(Authenticator.isAuthenticated){    
      let editedUser = {}
      editedUser.id = Authenticator.user.id
      editedUser.Username = this.state.Username
      editedUser.Banner = this.state.Banner
      editedUser.Bio = this.state.Bio
      API.editUser(editedUser)
      .then(res => {
        console.log(res)
        window.location.assign("/profile/"+Authenticator.user.id)
      })
      .catch(err => {
        console.log(err)
      })

  };
  }
  handleInputChange = event => {
    const value = event.target.value;
    const name = event.target.name;
    this.setState({
      [name]: value
    });
  };



  componentDidMount(){
    this.formPopulate()
  }

  render() {

    if (this.state.location === "Edit Profile") {
      return (
        <div>
          <Tabs handleTabClick={this.handleTabClick} />
          <h1>Edit Profile</h1>
          <Row>
            {/* Left column */}
            <Col size="md-6">
              <div className="mr-4">
                <div>
                  <Input
                    name="Username"
                    value={this.state.Username}
                    onChange = {this.handleInputChange}
                  />
                  <Input
                    name="Banner"
                    value={this.state.Banner}
                    onChange = {this.handleInputChange}
                  />
                  <Input
                    name="Bio"
                    value={this.state.Bio}
                    onChange = {this.handleInputChange}
                  />

                  <FormBtn onClick ={this.handleSubmitEditProfile}>
                    Submit
                  </FormBtn>
                  <h2 className="display-5 mb-4">Uploading Images</h2>
                  <FormBtn>
                    Upload avatar image
                  </FormBtn>
                  <FormBtn>
                    Upload banner image
              </FormBtn>
                </div>
              </div>
            </Col>
            {/* Right column */}
            <Col size="md-6">
              <div className="ml-5">
                {/* Avatar image on this line */}
              </div>
            </Col>
          </Row>
        </div>
      )
    }
    else if (this.state.location === "Game") {
      return (
        <div>
          <Tabs handleTabClick={this.handleTabClick} />
          <h1>Game</h1>
          <GameList games = {this.state.Games} owner={true} deleteHandler={this.deleteHandler}/>
        </div>
      )
    }
    else if (this.state.location === "Posts") {
      return (
        <div>
          <Tabs handleTabClick={this.handleTabClick} />
          <h1>Posts</h1>
          <Posts/>
        </div>
      )
    }
  };
};


export default UserNexus;
// export default UserNexusGames;
// export default UserNexusPosts



