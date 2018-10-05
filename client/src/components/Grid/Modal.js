import React from "react"
import Login from "../../pages/Login/"

export const Modal = props => (
<div className="modal fade" id="modalContainer" aria-hidden="true">
  <div className="modal-dialog modal-dialog-centered" role="document">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title" id="modalTitle">{props.title}</h5>
        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div className="modal-body">
        {props.children}
      </div>
     
    </div>
  </div>
</div>
);
