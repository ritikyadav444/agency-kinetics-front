import axios from "axios";
import { baseURL, getConfig } from '../http';
import {
  ALL_TASK_FAIL,
  ALL_TASK_REQUEST,
  ALL_TASK_SUCCESS,
  TASK_DETAILS_FAIL,
  TASK_DETAILS_REQUEST,
  TASK_DETAILS_SUCCESS,
  NEW_TASK_REQUEST,
  NEW_TASK_SUCCESS,
  NEW_TASK_FAIL,
  DELETE_TASK_REQUEST,
  DELETE_TASK_SUCCESS,
  DELETE_TASK_FAIL,
  ADMIN_TASK_REQUEST,
  ADMIN_TASK_SUCCESS,
  ADMIN_TASK_FAIL,
  UPDATE_TASK_REQUEST,
  UPDATE_TASK_SUCCESS,
  UPDATE_TASK_FAIL,
  CLEAR_ERRORS,
} from "../constants/taskConstants";



//get Order
export const getTasks = (orderId) => async(dispatch)=>{
  try {
      const config = getConfig()
      dispatch({ type: ALL_TASK_REQUEST });
      // console.log(copiedTasksData)
        const {data} = await axios.get(`${baseURL}/api/v1/task/order/${orderId}`, config);
        // console.log(data)
        dispatch({
            type:ALL_TASK_SUCCESS,
            payload:data,
        })
        return data

    } catch (error) {
        dispatch({
            type:ALL_TASK_FAIL,
            payload:error.response?.data || {
              success: false,
              message: 'Error fetching tasks.',
              tasks: [],
          }
        })
    }
};



//get one Order
export const getTaskDetails = (id)=> async(dispatch)=>{
    try {
      const config = getConfig()

      // const {data: copiedTasksData} = await axios.get(`${baseURL}/api/v1/task/order/${orderId}`, config);
      // const copiedTasks = copiedTasksData.tasks || [];
      dispatch({
        type: TASK_DETAILS_REQUEST,
        // payload: copiedTasks, 
      });
        const {data} = await axios.get(`${baseURL}/api/v1/task/${id}`, config);
        dispatch({
            type:  TASK_DETAILS_SUCCESS,
            payload:data.task
        })
        // console.log("ord", data)
    } catch (error) {
        dispatch({
            type:TASK_DETAILS_FAIL,
            payload:error.response?.data,
        })
    }
};

//create
  export const createTask = (taskData, orderId) => async (dispatch) => {
    try {
      const config = getConfig()
      dispatch({ type: NEW_TASK_REQUEST });
      const { data } = await axios.post(`${baseURL}/api/v1/order/${orderId}/task/new`, taskData, config);
      dispatch({
        type: NEW_TASK_SUCCESS,
        payload: data,
      });
      return data;
    } catch (error) {
      dispatch({
        type: NEW_TASK_FAIL,
        payload: error.response?.data,
      });
    }
  };


  //update
  export const updateTask = (id , orderId, taskData) => async (dispatch)=>{
  try{
    const config = getConfig()
    dispatch({ type: UPDATE_TASK_REQUEST });

    const {data} =await axios.put(`${baseURL}/api/v1/order/${orderId}/task/update/${id}`,
    taskData,
      config
    );
    dispatch({
      type: UPDATE_TASK_SUCCESS,
      payload: data.success,
    });
    return data;
  } catch (error){
dispatch({
  type: UPDATE_TASK_FAIL,
  payload: error.response?.data,
});
  }
  };

  //delete
  export const deleteTask= (id, orderId) => async (dispatch) => {
    try {
      const config = getConfig()
      dispatch({ type: DELETE_TASK_REQUEST });
      const { data } = await axios.delete(`${baseURL}/api/v1/order/${orderId}/task/delete/${id}`, config);
  
      dispatch({
        type: DELETE_TASK_SUCCESS,
        payload: data.success,
      });
    } catch (error) {
      dispatch({
        type: DELETE_TASK_FAIL,
        payload: error.response?.data,
      });
    }
  };

export const clearErrors = () => async(dispatch)=>{
    dispatch({type:CLEAR_ERRORS});
};
