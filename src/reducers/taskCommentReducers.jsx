import {
    ALL_TASK_COMMENT_FAIL,
    ALL_TASK_COMMENT_REQUEST,
    ALL_TASK_COMMENT_SUCCESS,
    TASK_COMMENT_DETAILS_FAIL,
    TASK_COMMENT_DETAILS_SUCCESS,
    TASK_COMMENT_DETAILS_REQUEST,
    NEW_TASK_COMMENT_REQUEST,
    NEW_TASK_COMMENT_RESET,
    NEW_TASK_COMMENT_SUCCESS,
    NEW_TASK_COMMENT_FAIL,
    ADMIN_TASK_COMMENT_REQUEST,
    ADMIN_TASK_COMMENT_SUCCESS,
    ADMIN_TASK_COMMENT_FAIL,
    DELETE_SUBTASK_REQUEST,
  DELETE_SUBTASK_SUCCESS,
  DELETE_SUBTASK_FAIL,
  DELETE_SUBTASK_RESET,

  DELETE_ATTACHMENT_REQUEST,
  DELETE_ATTACHMENT_SUCCESS,
  DELETE_ATTACHMENT_FAIL,
  DELETE_ATTACHMENT_RESET,

  DELETE_COMMENT_REQUEST,
  DELETE_COMMENT_SUCCESS,
  DELETE_COMMENT_FAIL,
  DELETE_COMMENT_RESET,

  UPDATE_SUBTASK_REQUEST,
  UPDATE_SUBTASK_SUCCESS,
  UPDATE_SUBTASK_FAIL,
  UPDATE_SUBTASK_RESET,

  UPDATE_ATTACHMENT_REQUEST,
  UPDATE_ATTACHMENT_SUCCESS,
  UPDATE_ATTACHMENT_FAIL,
  UPDATE_ATTACHMENT_RESET,

  UPDATE_COMMENT_REQUEST,
  UPDATE_COMMENT_SUCCESS,
  UPDATE_COMMENT_FAIL,
  UPDATE_COMMENT_RESET,

  ADD_EMOJI_REACTION_FAIL,
  ADD_EMOJI_REACTION_SUCCESS,
  ADD_EMOJI_REACTION_REQUEST,
  ADD_EMOJI_REACTION_RESET,
  CREATE_SUBTASK_REQUEST,
  CREATE_SUBTASK_SUCCESS,
  CREATE_SUBTASK_FAIL,
  CLEAR_ERRORS,
  } from "../constants/taskCommentConstants";

const applyEmojiOptimistic = (comments, { commentId, emojiName, emojiSrc, userId }) =>
  (comments || []).map(c => {
    if (c._id !== commentId) return c;
    const reactions = c.reactions || [];
    const exists = reactions.find(r => r.emojiName === emojiName);
    return {
      ...c,
      reactions: exists
        ? reactions.map(r => r.emojiName === emojiName
            ? { ...r, count: r.count + 1, users: [...(r.users || []), userId] }
            : r)
        : [...reactions, { emojiName, emojiSrc, count: 1, users: [userId] }],
    };
  });
  

  const initialTaskCommentState = {
    taskComment: {},
    loading: false,
    error: null,
  };
  
  //get all
  export const taskComment_reducer = (state = { initialTaskCommentState}, action) => {
    switch (action.type) {
      // case RESET_STATE:
      //   return initialTaskCommentState
        
      case ALL_TASK_COMMENT_REQUEST:
      case ADMIN_TASK_COMMENT_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case ALL_TASK_COMMENT_SUCCESS:
        return {
          loading: false,
          taskComment: action.payload.taskComment,
        };
      case ADMIN_TASK_COMMENT_SUCCESS:
        return {
          loading: false,
          taskComment: action.payload,
        };
  
      case ALL_TASK_COMMENT_FAIL:
      case ADMIN_TASK_COMMENT_FAIL:
  
        return {
          loading: false,
          error: action.payload,
          taskComment: {}
        };
  
      case ADD_EMOJI_REACTION_REQUEST:
        return {
          ...state,
          taskComment: {
            ...state.taskComment,
            comments: applyEmojiOptimistic(state.taskComment?.comments, action.payload),
          },
        };
      case NEW_TASK_COMMENT_SUCCESS:
        return {
          ...state,
          taskComment: {
            ...state.taskComment,
            comments: [...(state.taskComment?.comments || []), action.payload],
          },
        };
      case DELETE_COMMENT_SUCCESS:
        return {
          ...state,
          taskComment: {
            ...state.taskComment,
            comments: (state.taskComment?.comments || []).filter(c => c._id !== action.payload.commentId),
          },
        };
      case DELETE_ATTACHMENT_SUCCESS:
        return {
          ...state,
          taskComment: {
            ...state.taskComment,
            attachments: (state.taskComment?.attachments || []).filter(a => a._id !== action.payload.attachmentId),
          },
        };
      case DELETE_SUBTASK_SUCCESS:
        return {
          ...state,
          taskComment: {
            ...state.taskComment,
            subtasks: (state.taskComment?.subtasks || []).filter(s => s._id !== action.payload.subtaskId),
          },
        };
      case UPDATE_SUBTASK_REQUEST:
      case UPDATE_SUBTASK_SUCCESS:
        return {
          ...state,
          taskComment: {
            ...state.taskComment,
            subtasks: (state.taskComment?.subtasks || []).map(s =>
              s._id === action.payload.subtaskId
                ? { ...s, ...(action.payload.newStatus && { status: action.payload.newStatus }), ...(action.payload.newName && { subtask_name: action.payload.newName }) }
                : s
            ),
          },
        };
      case CREATE_SUBTASK_REQUEST:
        return {
          ...state,
          taskComment: {
            ...state.taskComment,
            subtasks: [...(state.taskComment?.subtasks || []), { _id: `optimistic-${Date.now()}`, subtask_name: action.payload.subtask_name, status: 'In Progress' }],
          },
        };
      case CREATE_SUBTASK_SUCCESS:
        return {
          ...state,
          taskComment: {
            ...state.taskComment,
            subtasks: [...(state.taskComment?.subtasks || []).filter(s => !String(s._id).startsWith('optimistic-')), action.payload],
          },
        };
      case CREATE_SUBTASK_FAIL:
        return {
          ...state,
          taskComment: {
            ...state.taskComment,
            subtasks: (state.taskComment?.subtasks || []).filter(s => !String(s._id).startsWith('optimistic-')),
          },
        };
      case CLEAR_ERRORS:
        return {
          ...state,
          error: null,
        };
      default:
        return state;
    }
  };


  //get one
  export const taskCommentDetailsReducer = (state = { TASK_COMMENT: {} }, action) => {
    switch (action.type) {
      case TASK_COMMENT_DETAILS_REQUEST:
        return {
          loading: true,
          ...state,
  
            };
      case TASK_COMMENT_DETAILS_SUCCESS:
        return {
          loading: false,
         comment: action.payload,
        };
  
  
      case TASK_COMMENT_DETAILS_FAIL:
        return {
          loading: false,
          error: action.payload,
        };
  
      case CLEAR_ERRORS:
        return {
          ...state,
          error: null,
        };
      default:
        return state;
    }
  };
  
  
  //create
  export const newTaskComment_Reducer = (state = { comment: {}, success:false, loading:false, error:null }, action) => {
    switch (action.type) {
      case NEW_TASK_COMMENT_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case NEW_TASK_COMMENT_SUCCESS:
        // console.log(action.payload,action.success)
        return {
          loading: false,
          success: action.success,
          comment: action.payload,
        };
      case NEW_TASK_COMMENT_FAIL:
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      case NEW_TASK_COMMENT_RESET:
        return {
          ...state,
          success: false,
        };
      case CLEAR_ERRORS:
        return {
          ...state,
          error: null,
        };
      default:
        return state;
    }
  };
  

  export const subtaskReducer = (state = { isSubtaskDeleted: false, isSubtaskUpdated: false, errorSubtask: null }, action) => {
    switch (action.type) {
      case DELETE_SUBTASK_REQUEST:
      case UPDATE_SUBTASK_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case DELETE_SUBTASK_SUCCESS:
        return {
          ...state,
          loading: false,
          isSubtaskDeleted: action.payload.success,
        };
      case UPDATE_SUBTASK_SUCCESS:
        return {
          ...state,
          loading: false,
          isSubtaskUpdated: action.payload.success,
        };
      case DELETE_SUBTASK_FAIL:
      case UPDATE_SUBTASK_FAIL:
        return {
          ...state,
          loading: false,
          errorSubtask: action.payload,
        };
      case DELETE_SUBTASK_RESET:
        return {
          ...state,
          isSubtaskDeleted: false,
        };
      case UPDATE_SUBTASK_RESET:
        return {
          ...state,
          isSubtaskUpdated: false,
        };
      default:
        return state;
    }
  };

  export const attachmentReducer = (state = { isAttachmentDeleted: false, isAttachmentUpdated: false, errorAttachment: null }, action) => {
    switch (action.type) {
      case DELETE_ATTACHMENT_REQUEST:
      case UPDATE_ATTACHMENT_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case DELETE_ATTACHMENT_SUCCESS:
        return {
          ...state,
          loading: false,
          isAttachmentDeleted: action.payload.success,
        };
      case UPDATE_ATTACHMENT_SUCCESS:
        return {
          ...state,
          loading: false,
          isAttachmentUpdated: action.payload,
        };
      case DELETE_ATTACHMENT_FAIL:
      case UPDATE_ATTACHMENT_FAIL:
        return {
          ...state,
          loading: false,
          errorAttachment: action.payload,
        };
      case DELETE_ATTACHMENT_RESET:
        return {
          ...state,
          isAttachmentDeleted: false,
        };
      case UPDATE_ATTACHMENT_RESET:
        return {
          ...state,
          isAttachmentUpdated: false,
        };
      default:
        return state;
    }
  };

  export const commentReducer = (state = { isCommentDeleted: false, isCommentUpdated: false, errorComment: null }, action) => {
    switch (action.type) {
      case DELETE_COMMENT_REQUEST:
      case UPDATE_COMMENT_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case DELETE_COMMENT_SUCCESS:
        return {
          ...state,
          loading: false,
          isCommentDeleted: action.payload.success,
        };
      case UPDATE_COMMENT_SUCCESS:
        return {
          ...state,
          loading: false,
          isCommentUpdated: action.payload,
        };
      case DELETE_COMMENT_FAIL:
      case UPDATE_COMMENT_FAIL:
        return {
          ...state,
          loading: false,
          errorComment: action.payload,
        };
      case DELETE_COMMENT_RESET:
        return {
          ...state,
          isCommentDeleted: false,
        };
      case UPDATE_COMMENT_RESET:
        return {
          ...state,
          isCommentUpdated: false,
        };
      default:
        return state;
    }
  };

  export const emojiReactionReducer = (state = { isEmojiReactionAdded: false, errorEmoji: null }, action) => {
    switch (action.type) {
      case ADD_EMOJI_REACTION_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case ADD_EMOJI_REACTION_SUCCESS:
        return {
          ...state,
          loading: false,
          isEmojiReactionAdded: action.payload.success,
        };
      case ADD_EMOJI_REACTION_FAIL:
        return {
          ...state,
          loading: false,
          errorEmoji: action.payload,
        };
      case ADD_EMOJI_REACTION_RESET:
        return {
          ...state,
          isEmojiReactionAdded: false,
        };
      default:
        return state;
    }
  };

  export const createSubtaskReducer = (state = { loading: false, error: null }, action) => {
    switch (action.type) {
      case CREATE_SUBTASK_REQUEST:
        return { ...state, loading: true, error: null };
      case CREATE_SUBTASK_SUCCESS:
        return { ...state, loading: false };
      case CREATE_SUBTASK_FAIL:
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };

