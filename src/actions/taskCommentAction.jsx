import axios from "axios";
import {
  ALL_TASK_COMMENT_FAIL,
  ALL_TASK_COMMENT_REQUEST,
  ALL_TASK_COMMENT_SUCCESS,
  TASK_COMMENT_DETAILS_FAIL,
  TASK_COMMENT_DETAILS_SUCCESS,
  TASK_COMMENT_DETAILS_REQUEST,
  NEW_TASK_COMMENT_REQUEST,
  NEW_TASK_COMMENT_SUCCESS,
  NEW_TASK_COMMENT_FAIL,
  UPDATE_TASK_COMMENT_REQUEST,
  UPDATE_TASK_COMMENT_SUCCESS,
  UPDATE_TASK_COMMENT_FAIL,
  CLEAR_ERRORS,
  DELETE_SUBTASK_REQUEST,
  DELETE_SUBTASK_SUCCESS,
  DELETE_SUBTASK_FAIL,
  DELETE_ATTACHMENT_REQUEST,
  DELETE_ATTACHMENT_SUCCESS,
  DELETE_ATTACHMENT_FAIL,
  DELETE_COMMENT_REQUEST,
  DELETE_COMMENT_SUCCESS,
  DELETE_COMMENT_FAIL,
  UPDATE_SUBTASK_REQUEST,
  UPDATE_SUBTASK_SUCCESS,
  UPDATE_SUBTASK_FAIL,
  UPDATE_SUBTASK_RESET,
  ADD_EMOJI_REACTION_FAIL,
  ADD_EMOJI_REACTION_REQUEST,
  ADD_EMOJI_REACTION_SUCCESS,
  CREATE_SUBTASK_REQUEST,
  CREATE_SUBTASK_SUCCESS,
  CREATE_SUBTASK_FAIL,
} from "../constants/taskCommentConstants";
import { baseURL, getConfig } from '../http';

// Helper function to get config with JWT token


// Get all comments
export const getTask_Comment = (id) => async (dispatch) => {
  try {
    dispatch({ type: ALL_TASK_COMMENT_REQUEST });
    const config = getConfig();
    const { data } = await axios.get(`${baseURL}/api/v1/comment/task/${id}`, config);
    // console.log(data);
    dispatch({
      type: ALL_TASK_COMMENT_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: ALL_TASK_COMMENT_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Get comments details
export const getTaskComment_Details = (id) => async (dispatch) => {
  try {
    dispatch({ type: TASK_COMMENT_DETAILS_REQUEST });
    const config = getConfig();
    const { data } = await axios.get(`${baseURL}/api/v1/get/comment/${id}`, config);
    // console.log(data)
    dispatch({
      type: TASK_COMMENT_DETAILS_SUCCESS,
      payload: data.comment,
    });
  } catch (error) {
    dispatch({
      type: TASK_COMMENT_DETAILS_FAIL,
      payload: error.response.data.message,
    });
  }
};

// Create TASK_COMMENT
export const createTask_comment = (taskCommentData) => async (dispatch) => {
  try {
    const config = getConfig();
    dispatch({ type: NEW_TASK_COMMENT_REQUEST });
    const { data } = await axios.post(`${baseURL}/api/v1/new/comment`, taskCommentData, config);
    // console.log("TCD", data);
    dispatch({
      type: NEW_TASK_COMMENT_SUCCESS,
      success: data.success,
      payload: data.comment
    });
    return data;
  } catch (error) {
    dispatch({
      type: NEW_TASK_COMMENT_FAIL,
      payload: error.response.data.message,
    });
  }
};

// Update TASK_COMMENT
export const updateTask_Comment = (id, taskCommentData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_TASK_COMMENT_REQUEST });
    const config = getConfig();
    // console.log("TC", taskCommentData);

    const { data } = await axios.put(`${baseURL}/api/v1/comment/update/${id}`, taskCommentData, config);
    dispatch({
      type: UPDATE_TASK_COMMENT_SUCCESS,
      payload: data.success,
    });
    
  } catch (error) {
    dispatch({
      type: UPDATE_TASK_COMMENT_FAIL,
      payload: error.response.data.message,
    });
  }
};



// Delete Subtask Action
export const deleteSubtask = (taskId, subtaskId) => async (dispatch) => {
  try {
    // console.log(taskId, subtaskId)
    dispatch({ type: DELETE_SUBTASK_REQUEST });
    const config = getConfig();
    const { data } = await axios.delete(`${baseURL}/api/v1/comment/delete/${taskId}/subtasks/${subtaskId}`, config);
    // console.log(data)
    
    dispatch({
      type: DELETE_SUBTASK_SUCCESS,
      payload: { success: data.success, subtaskId },
    });
  } catch (error) {
    dispatch({
      type: DELETE_SUBTASK_FAIL,
      payload: error.response.data.message,
    });
  }
};

// Delete Attachment Action
export const deleteAttachment = (taskId, attachmentId) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_ATTACHMENT_REQUEST });
    const config = getConfig();
    const { data } = await axios.delete(`${baseURL}/api/v1/comment/delete/${taskId}/attachments/${attachmentId}`, config);
    dispatch({
      type: DELETE_ATTACHMENT_SUCCESS,
      payload: { success: data.success, attachmentId },
    });
  } catch (error) {
    dispatch({
      type: DELETE_ATTACHMENT_FAIL,
      payload: error.response.data.message,
    });
  }
};

// Delete Comment Action
export const deleteComment = (taskId, commentId) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_COMMENT_REQUEST });
    const config = getConfig();
    const { data } = await axios.delete(`${baseURL}/api/v1/comment/delete/${taskId}/comments/${commentId}`, config);
    dispatch({
      type: DELETE_COMMENT_SUCCESS,
      payload: { success: data.success, commentId },
    });
  } catch (error) {
    dispatch({
      type: DELETE_COMMENT_FAIL,
      payload: error.response.data.message,
    });
  }
};

export const updateSubtask = (taskId, subtaskId, newStatus) => async (dispatch) => {
  dispatch({ type: UPDATE_SUBTASK_REQUEST, payload: { subtaskId, newStatus: newStatus.status, newName: newStatus.subtask_name } });
  try {
    const config = getConfig();
    const { data } = await axios.put(`${baseURL}/api/v1/comment/update/${taskId}/subtasks/${subtaskId}`, newStatus, config);
    dispatch({
      type: UPDATE_SUBTASK_SUCCESS,
      payload: { ...data, subtaskId, newStatus: newStatus.status, newName: newStatus.subtask_name },
    });
  } catch (error) {
    dispatch({ type: UPDATE_SUBTASK_FAIL, payload: error.response?.data?.message || error.message });
  }
};

export const createSubtask = (taskId, subtask_name) => async (dispatch) => {
  dispatch({ type: CREATE_SUBTASK_REQUEST, payload: { subtask_name } });
  try {
    const config = getConfig();
    const { data } = await axios.post(`${baseURL}/api/v1/new/comment`, { taskId, subtask_name }, config);
    const newSubtask = data.comment.subtasks[data.comment.subtasks.length - 1];
    dispatch({ type: CREATE_SUBTASK_SUCCESS, payload: newSubtask });
  } catch (error) {
    dispatch({ type: CREATE_SUBTASK_FAIL, payload: error.response?.data?.message || error.message });
  }
};

// Add Emoji Reaction Action
export const addEmojiReaction = (commentId, name, src, userId) => async (dispatch) => {
  dispatch({ type: ADD_EMOJI_REACTION_REQUEST, payload: { commentId, emojiName: name, emojiSrc: src, userId } });
  try {
    const config = getConfig();
    const { data } = await axios.post(`${baseURL}/api/v1/comments/${commentId}/reactions`, { emojiName:name, emojiSrc:src }, config);
    dispatch({ type: ADD_EMOJI_REACTION_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ADD_EMOJI_REACTION_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Clear errors
export const clearErrors = () => async (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};


