import { combineReducers } from "redux";
import { newServiceReducer, serviceDUReducer, servicesDetailsReducer, servicesReducer } from "./reducers/serviceReducers";
import { invoiceDUReducer, invoiceDetailsReducer, invoiceReducer, newInvoiceReducer } from "./reducers/invoicesReducers";
import { newUserReducer, userDUReducer, userDetailsReducer, userLoginReducer, userPasswordReducer, userReducer } from "./reducers/userReducer";
import { clientDUReducer, clientDetailsReducer, clientLoginReducer, clientReducer, newClientReducer } from "./reducers/clientReducers";
import {  newOrderReducer, orderDUReducer, orderReducer, ordersDetailsReducer } from "./reducers/orderReducers";
import {  newQuoteReducer, quoteDUReducer, quotesDetailsReducer, quotesReducer } from "./reducers/quoteReducers";
import { newTicketReducer, ticketDUReducer, ticketDetailsReducer, ticketReducer } from "./reducers/ticketReducers";
import { newTeamReducer, teamDUReducer, teamLoginReducer, teamsDetailsReducer, teamsReducer } from "./reducers/teamReducer";
import {combinedReducer, memberLoginReducer } from "./reducers/loginReducers";
import { configureStore } from "@reduxjs/toolkit";
import notificationReducer, { clearNotificationsReducer, createNotificationReducer, deleteNotificationReducer, getAllNotificationsReducer } from "./reducers/notificationReducer";
import { newTaskReducer, taskDUReducer, taskReducer, tasksDetailsReducer } from "./reducers/taskReducer";
import { attachmentReducer, commentReducer, createSubtaskReducer, emojiReactionReducer, newTaskComment_Reducer, subtaskReducer, taskComment_reducer, taskCommentDetailsReducer } from "./reducers/taskCommentReducers";

const rootReducer = combineReducers({

      logMember:memberLoginReducer,
      member:combinedReducer,


      services: servicesReducer,
      serviceDetails: servicesDetailsReducer,
      newService: newServiceReducer,
      serviceDU: serviceDUReducer,

      invoices:invoiceReducer,
      invoiceDetails:invoiceDetailsReducer,
      newInvoice:newInvoiceReducer,
      invoiceDU:invoiceDUReducer,

      users:userReducer,
      userDetails:userDetailsReducer,
      newUser:newUserReducer,
      userDU:userDUReducer,
      userlog:userLoginReducer,

      clients:clientReducer,
      clientDetails:clientDetailsReducer,
      clientDU:clientDUReducer,
      newClient: newClientReducer,
      clientLog:clientLoginReducer,

      orders:orderReducer,
      orderDetails:ordersDetailsReducer,
      newOrder:newOrderReducer,
      orderDU:orderDUReducer,

      quotes:quotesReducer,
      quoteDetails:quotesDetailsReducer,
      newQuote:newQuoteReducer,
      quoteDU:quoteDUReducer,

      tickets:ticketReducer,
      ticketDetails:ticketDetailsReducer,
      ticketDU:ticketDUReducer,
      newTicket:newTicketReducer,

      teams:teamsReducer,
      teamDetails:teamsDetailsReducer,
      teamDU:teamDUReducer,
      newTeam:newTeamReducer,
      teamlog:teamLoginReducer,

      tasks:taskReducer,
      newTask:newTaskReducer,
      taskDetails:tasksDetailsReducer,
      taskDU:taskDUReducer,

      taskComments: taskComment_reducer,
      newTaskComment: newTaskComment_Reducer,
      taskCommentDetails: taskCommentDetailsReducer,
      // taskCommentDU: taskComment_DUReducer,
      subtask: subtaskReducer,
      createSubtask: createSubtaskReducer,
      attachment: attachmentReducer,  // For attachment actions
      comment: commentReducer,  // For comment actions
      emojiReaction: emojiReactionReducer,  // For emoji reactions

      notifications: notificationReducer,
      getAllNotifications: getAllNotificationsReducer,
      createNotification: createNotificationReducer,
      deleteNotification: deleteNotificationReducer,
      clearNotifications: clearNotificationsReducer,

      forgotpassword:userPasswordReducer,
    },

  )

const store = configureStore({
    reducer: rootReducer,
  });

export { store };
