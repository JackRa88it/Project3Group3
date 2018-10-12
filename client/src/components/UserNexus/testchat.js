import React, { Component } from 'react';
import { Input, TextArea, FormBtn } from "../../components/Form";
import API from "../../utils/API";
import io from 'socket.io-client'
import {ActiveChat} from "../../components/Chat"

class Chatroom extends Component{
    state = {
        messages: [],
        newMessage: '',
    }
    socket = null
    name = null
    handleInputChange = event => {
        const { name, value } = event.target;
        this.setState({
            [name]: value
        });
    };

    handleFormSubmit = event => {
        event.preventDefault();
        if (this.state.newMessage) {
            console.log(this.socket)
            this.socket.emit('messagePost', this.state.newMessage, this.name)
        }
    }

    componentDidMount(){
        this.socket=io.connect("http://localhost:3001" + "/game/2")
        API.authenticate().then ((res)=> {
        this.name = res.data;
        console.log(this.name)})
        
        this.socket.on("messagePost", (msg, name)=>{
            this.setState({messages : [...this.state.messages, name+ ":" +msg]})
        })

    }

    render(){
        return(
            <div>
                {this.state.messages.map(message => (
                    (<div><p>{message}</p>
                    </div>)
                ))}
                <Input
                    value={this.state.title}
                    onChange={this.handleInputChange}
                    name="newMessage"
                />
                <FormBtn
                    disabled={!(this.state.newMessage)}
                    onClick={this.handleFormSubmit}>
                    Submit
                </FormBtn> 
            </div>
        )
    }
}
export default Chatroom;