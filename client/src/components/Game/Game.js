import React, { Component } from 'react';
import CommentList from "../CommentList"

import './Game.css'
class Game extends Component{
    render(){
        console.log(this.props)
        return(
            <div>
                <h1 className="text-center">Game {this.props.match.url.split("/").pop()}</h1>
                <p>
                    Developer: User_12314
                </p>
                <div className='px-auto'>
                  <iframe title="gamewindow"
                          scrolling="no"
                          id="gameView"
                          height="500"
                          src={'/'+this.props.match.params.id}
                          allowFullScreen></iframe>
                  </div>
                <CommentList />
            </div>
        )
    }
}

export default Game;
