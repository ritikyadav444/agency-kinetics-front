import React, { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom'
import { clearErrors, deleteTicket } from '../../actions/ticketAction';
import { DELETE_TICKET_RESET } from '../../constants/ticketConstants';

const TicketCard = ({ticket}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {error}= useSelector(state=>state.tickets)
  const {error: deleteError, isDeleted}= useSelector(state=>state.ticketDU)

  const deleteTicketHandler= (id)=>{
dispatch(deleteTicket(id));
  }

  
  useEffect(() => {
if(error){
  dispatch(clearErrors())
}
if (deleteError){
  dispatch(clearErrors());
}
if(isDeleted){
  toast.success("Ticket deleted Succeccfully")
 navigate("/tickets");
  dispatch({type:DELETE_TICKET_RESET})
}
  }, [dispatch, error, isDeleted, deleteError])
  return (

    <div>
    <Link className='ticketCard' to ={`/ticket/${ticket._id}`}>
       <p>{ticket.subject}</p></Link>
        <p>{ticket.orderId}</p>
                  <button>
 <Link to={`/ticket/update/${ticket._id}`}>
          Update
            </Link>
          </button>
            <button 
            onClick={()=>
            deleteTicketHandler(ticket._id)}>
              Delete 
            </button>
  <hr/>
    
    </div>
  )
}



export default TicketCard