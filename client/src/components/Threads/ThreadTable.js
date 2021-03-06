import React from "react";
import "./Threads.css";
import ThreadRow from "./ThreadRow";
import API from "../../utils/API";

class ThreadTable extends React.Component{

  state = {
    threads: [],
    forumId: ''
  };

  componentDidMount(){
    API.getThreadList(this.props.forumId)
    .then((res) => {
      if(res.data){
        this.setState({
            threads: res.data,
            forumId: this.props.forumId
          })
      }
    })
  }
 
  render(){
    return (
      <table className="threadTable">
        <thead>
          <tr>
            <th>Thread</th>
            <th>Replies</th>
            <th>Last Post</th>
          </tr>
        </thead>
        <tbody>
          {this.state.threads.map(thread => {
            return(
              <ThreadRow 
                key={thread.id}
                thread={thread} 
                handleRowClick={this.props.handleRowClick}
              />
            )
          })}
        </tbody>
      </table>
    )
  }
}

export default ThreadTable;