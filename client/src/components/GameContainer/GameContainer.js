
import React from 'react'
import './GameContainer.css'

class GameContainer extends React.Component{
    render(){
        return(
            <div class='gamesContainer'>
                <div className='categoryHeader'>{this.props.header}</div>
                {this.props.games.map((game)=>{
                return(
                    <div className='gameBox'>
                    <img src={'/assets/gameThumbnails/' + game.id}></img>
                    </div>
                )
                })}
            </div>
        )
    }
}

export default GameContainer