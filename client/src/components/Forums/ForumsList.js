import React from "react";
import "./ForumsList.css";
import Comment from "../Comment"
import {FormBtn} from '../Form'

const comments = [{name: 'Vincent', text: 'This game is totally rad! I could play it forever. You should make more of this. ' , userId: 1, score: 5},
{name: 'Hoff', text: 'I died on the first level.' , userId: 2, score: 10},
{name: 'Vincent', text: 'This is just like Dark Souls.' , userId: 1, score: 7},
{name: 'Aaron', text: 'Game of the century.', userId: 4, score: 20},
{name: 'Jack', text: "There are some things that only videogames can do. For me, Flood's predecessor Fill was emblematic of all of them. Where most games do their best to be something else – to tell a story like a novel, to impress with cinematic techniques like a film – Fill is pure game, a complete and darkly fascinating vision that makes no concessions to the modern conception of how games should be. Instead, it was an exploration of how games could be; how bleak, how twisted, how focused and – most famously – how challenging. Most developers take pains to protect you from failure. FROM Software turns it into an artform.", userId: 3, score: 150},
{name: 'Dinh', text: 'Overhyped.' , userId: 2, score: -24}]

class ForumsList extends React.Component{
 
  render(){
    return (
        <div className="skinny">
          <h3>Comments</h3>
          {/* <div className="border"> */}
                  <div className="form-group">
                    <textarea className="form-control" rows="4" />
                    <FormBtn>Submit</FormBtn>
                  </div>
                  {comments.map((comment,i) => {
                    return(<Comment name={comment.name} userId={comment.userId} pattern={i%2} score={comment.score}>{comment.text}</Comment>)
                  })}


          {/* </div> */}
          
        </div>
  )}
}

export default ForumsList;