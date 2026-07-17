import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Avatar, Typography, Box, IconButton } from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { OutlinedInput, Button, Divider, InputAdornment, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import Picker from "emoji-picker-react";
import { addEmojiReaction, clearErrors, getTask_Comment, deleteAttachment, deleteComment, createTask_comment } from '../../actions/taskCommentAction';
import { getTaskDetails } from '../../actions/taskAction';
import { DELETE_COMMENT_RESET, NEW_TASK_COMMENT_RESET, UPDATE_COMMENT_RESET } from '../../constants/taskCommentConstants';
import { createNotification, getAllNotifications } from '../../actions/notificationAction';
import { CLEAR_ERRORS } from '../../constants/taskConstants';
import { baseURL } from '../../http';

const CommentsSection = ({task, comments, superAdminId, assignedToNamesMap}) => {
    const [commentText, setCommentText] = useState('');
    const { taskComment } = useSelector(state => state.taskComments);
    const { errorComment, isCommentDeleted, isCommentUpdated } = useSelector((state) => state.comment);
    const { error, success } = useSelector((state) => state.newTaskComment);
    
    const dispatch = useDispatch()
    const taskId = task._id
    const combined = useSelector((state) => state.logMember.combined);
    const [taggedUsers, setTaggedUsers] = useState([]);
   
    const [selectedOrderName, setselectedOrderName] = useState('')
    const [selectedOrderId, setselectedOrderId] = useState('')
    const [selectedClientFromOrder, setselectedClientFromOrder] = useState('')
    const [selectedClientIdFromOrder, setselectedClientIdFromOrder] = useState('')
    const [selectedClientImgFromOrder, setselectedClientImgFromOrder] = useState('')
    const [mentionDropdownVisible, setMentionDropdownVisible] = useState(false);
    const [mentionAnchorEl, setMentionAnchorEl] = useState(null);
    const [emojiPickerOpenFor, setEmojiPickerOpenFor] = useState(null);
    const [emojiPickerPos, setEmojiPickerPos] = useState({ top: 0, left: 0 });
    const [hoveredComment, setHoveredComment] = useState(null);

    const onEmojiClick = (event, emojiObject, commentId) => {
        if (!emojiObject) return;
        
        const emojiName = emojiObject.srcElement.alt; 
        const emojiSrc = emojiObject.srcElement.src;  
        dispatch(addEmojiReaction(commentId, emojiName, emojiSrc, combined.user._id));
        setEmojiPickerOpenFor(null); // Close the emoji picker after selection
    };
    
    const handleEmojiClick = (commentId, e) => {
        if (emojiPickerOpenFor === commentId) {
            setEmojiPickerOpenFor(null);
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const pickerH = 420;
        const pickerW = 300;
        const top = rect.bottom + 8 + pickerH > window.innerHeight
            ? rect.top - pickerH - 8
            : rect.bottom + 8;
        const left = Math.min(rect.left, window.innerWidth - pickerW - 8);
        setEmojiPickerPos({ top, left });
        setEmojiPickerOpenFor(commentId);
    };

    const emojiPickerRef = useRef(null);  

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setEmojiPickerOpenFor(null);  
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const commentRefs = useRef({});

    const scrollToComment = (id) => {
      const commentElement = commentRefs.current[id];
      if (commentElement) {
        commentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };


  const [replyTo, setReplyTo] = useState(null);

  const handleReplyClick = (comment) => {
    setReplyTo(comment);
  };

  //For Comment
  const [open, setOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const handleClickOpen = (comment) => {
    setCommentToDelete(comment);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCommentToDelete(null);
  };
  const handleDeleteConfirm = () => {
    if (commentToDelete) {
      dispatch(deleteComment(taskId, commentToDelete._id));
      handleClose();
    }
  };

  //For comment
  useEffect(() => {
    if (errorComment) {
      alert(errorComment);
      dispatch(clearErrors());
    }
    
    if (isCommentDeleted || isCommentUpdated) {
      dispatch({ type: UPDATE_COMMENT_RESET });
      dispatch({ type: DELETE_COMMENT_RESET });
    }
  }, [dispatch, isCommentDeleted, isCommentUpdated, errorComment, taskId]);
  

  const chatContainerRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const [showNewMessage, setShowNewMessage] = useState(false);

  const handleScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    if (isAtBottomRef.current) setShowNewMessage(false);
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      setShowNewMessage(false);
    }
  };

  useEffect(() => {
    if (!comments?.length) return;
    if (isAtBottomRef.current) {
      scrollToBottom();
    } else {
      setShowNewMessage(true);
    }
  }, [comments]);

  const createTaskCommentSubmitHandler = (e) => {
    e.preventDefault();

    const taggedUsersArray = Array.isArray(taggedUsers) ? taggedUsers : [];

    const data = {
        commentText: commentText,
        taskId: taskId,
        taggedUsers: taggedUsersArray,
        parentCommentId: replyTo ? replyTo._id : null
    };
    // socket.emit('commentMsg', commentText)
    dispatch(createTask_comment(data));
  };

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setCommentText(value);

    if (value.endsWith('@')) {
      setMentionDropdownVisible(true);
      setMentionAnchorEl(e.currentTarget);
    } else {
      setMentionDropdownVisible(false);
    }
  }, [setCommentText]);

  const handleUserSelect = (user) => {
    // Find the last occurrence of '@' in the commentText
    const atSymbolIndex = commentText.lastIndexOf('@');
    // Replace the '@' with the selected user's name
    const newText = commentText.substring(0, atSymbolIndex) + `@${user.name} ` ;
  
    setCommentText(newText);
    setMentionDropdownVisible(false);
    setTaggedUsers((prev) => [...prev, user._id]);
  };

  const getName = async (orderId) => {
    // console.log(orderId)
    try {
      const response = await fetch(`${baseURL}/api/v1/order/${orderId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }
      const data = await response.json();
    //   console.log('Orders data:', data);
      setselectedOrderName(data.order.orderId)
      setselectedOrderId(data.order._id)

    //   console.log(selectedClientFromOrder)
      const nameResponse = await fetch(`${baseURL}/api/v1/get/team/${data.order.clientId}`, {
        credentials: 'include'
      });
      if (!nameResponse.ok) {
        throw new Error(`Failed to fetch client name: ${nameResponse.status}`);
      }
      const clientData = await nameResponse.json();
    //   console.log(clientData)
      setselectedClientIdFromOrder(clientData.combined._id)
      setselectedClientFromOrder(clientData.combined.fname + " " + clientData.combined.lname)
      setselectedClientImgFromOrder(clientData.combined.profile_img)

    } catch (error) {
      console.error('Error fetching orders:', error.message);
    }
  };
  useEffect(() => {
    if (task.orderId) getName(task.orderId);
  }, [task.orderId]);

  useEffect(() => {
    const handleNotificationsAndComments = async () => {
      if (error) {
        alert(error);
        setTaggedUsers([]); // Clear tagged users
        dispatch({ type: CLEAR_ERRORS });
      }
  
      if (success) {
        dispatch({ type: NEW_TASK_COMMENT_RESET });
        setCommentText('');
        setReplyTo(null);
  
        // const routeLink = `http://dashboard.agencykinetics.com/task/${taskId}`;
        const routeLink = `http://app.agencykinetics.com/task/${taskId}`;
  
        try {
          // Wait for all notifications to be created
          await Promise.all(
            taggedUsers.map(id => 
              dispatch(createNotification(id, `You have a notification from ${combined.user.fname} ${combined.user.lname} in Task: ${task.task_name}`, routeLink))
            )
          );
  
          setTaggedUsers([]);
  
          await dispatch(getAllNotifications(combined.user._id));
        } catch (error) {
          console.error('Error creating notifications or fetching comments:', error);
        }
      }
    };
  
    if (success || error) {
      handleNotificationsAndComments();
    }
  
  }, [dispatch, error, success, taskId, taggedUsers, combined, task.task_name]);
  

    return (
        <>
            <div style={{ position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {showNewMessage && (
                <button
                    onClick={scrollToBottom}
                    style={{
                        position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
                        zIndex: 10, background: 'rgb(127, 86, 217)', color: 'white', border: 'none',
                        borderRadius: '20px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px',
                        display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                >
                    <KeyboardArrowDownIcon fontSize="small" /> New message
                </button>
            )}
            <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                style={{
                    overflowY: 'auto',
                    padding: '10px',
                    flexGrow: 1,
                    marginBottom: '20px',
                }}
            >
                {comments &&
                    comments.map((comment, index) => {
                        const userDetails = comment.createdBy || {};
                        const isOwn = comment.createdBy?._id?.toString() === combined.user._id?.toString();

                        // Check if the comment is a reply
                        const parentComment = comment.parentComment
                            ? comments.find((c) => c._id.toString() === comment.parentComment.toString())
                            : null;

                        const parentUserDetails = parentComment ? parentComment.createdBy || {} : null;

                        return (
                            <div key={index} style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                                <div style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', width: '100%' }}
                                    ref={(el) => (commentRefs.current[comment._id] = el)}
                                    >
                                    <div style={{ display: 'flex', alignItems: 'center', flexDirection: isOwn ? 'row-reverse' : 'row' }}>
                                        {/* Profile Image */}
                                        <Avatar
                                            alt={`${userDetails.role || 'User Avatar'}`}
                                            src={userDetails.profile_img || ''}
                                            style={{ width: '30px', height: '30px', [isOwn ? 'marginLeft' : 'marginRight']: '10px', backgroundColor: '#cfcfcf' }}
                                        />
                                        {/* User Name */}
                                        <Typography variant="body1" style={{ fontWeight: 'bold', color: '#000' }}>
                                        {userDetails && userDetails.fname && userDetails.lname
                                            ? `${userDetails.fname} ${userDetails.lname}`
                                            : ''}
                                        </Typography>

                                    </div>
                                </div>
                                
                                {/* Comment Box */}
                                <Box
                                    onMouseEnter={() => setHoveredComment(comment._id)}
                                    onMouseLeave={() => setHoveredComment(null)}
                                    sx={{ display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row', flexGrow: 1, position: 'relative' }}
                                >
                                    <div
                                        style={{
                                            maxWidth: '100%',
                                            width:'500px',
                                            [isOwn ? 'marginRight' : 'marginLeft']: '30px',
                                            borderRadius: '10px',
                                            backgroundColor: 'none',
                                            background:'none',
                                            position: 'relative',
                                        }}
                                    >
                                        {/* Parent Comment Section */}
                                        {parentComment && (
                                            <div
                                                onClick={() => scrollToComment(parentComment._id)}
                                                style={{
                                                    padding: '5px',
                                                    backgroundColor: '#e8eaf6',
                                                    borderTopLeftRadius: '10px',
                                                    borderTopRightRadius: '10px',
                                                    borderBottom: '1px solid #ddd',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <Typography variant="caption" style={{ color: '#4d5871', wordBreak: 'break-word', whiteSpace: 'pre-line', fontWeight:'bold', fontSize:'1rem' }}>
                                                    {parentComment.text}
                                                </Typography>
                                            </div>
                                        )}

                                        {/* Replied Comment Section */}
                                        <div
                                            style={{
                                                padding: '10px',
                                                borderRadius: parentComment ? '0 0 10px 10px' : '10px',
                                                backgroundColor: isOwn ? 'rgb(127, 86, 217)' : '#F5E9FF',
                                                width: '500px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'stretch',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    flexGrow: 1,
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    style={{ color: isOwn ? '#fff' : '#4d5871', wordBreak: 'break-word', whiteSpace: 'pre-line', fontWeight: 'bold', fontSize: '1rem' }}
                                                >
                                                    {comment.text}
                                                </Typography>
                                            </Box>
                                            {/* Bottom row: emojis left (scrollable) + time right */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '6px', width: '100%', gap: '6px' }}>
                                                {/* Emoji pills — scrollable, takes remaining space */}
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        flexWrap: 'nowrap',
                                                        gap: '4px',
                                                        overflowX: 'auto',
                                                        flex: 1,
                                                        minWidth: 0,
                                                        paddingBottom: '2px',
                                                        '&::-webkit-scrollbar': { height: '3px' },
                                                        '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.2)', borderRadius: '2px' },
                                                    }}
                                                >
                                                    {comment.reactions && comment.reactions.map((reaction, index) => (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                flexShrink: 0,
                                                                backgroundColor: 'white',
                                                                padding: '2px 6px',
                                                                borderRadius: '12px',
                                                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                                height: '22px',
                                                            }}
                                                        >
                                                            {reaction.emojiSrc ? (
                                                                <img src={reaction.emojiSrc} alt={reaction.emojiName} style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                                                            ) : (
                                                                <span style={{ fontSize: '14px' }}>{reaction.emojiName}</span>
                                                            )}
                                                            <span style={{ marginLeft: '3px', fontSize: '11px', color: '#666' }}>{reaction.count}</span>
                                                        </Box>
                                                    ))}
                                                </Box>
                                                {/* Time — always visible, pinned right */}
                                                <Typography
                                                    variant="caption"
                                                    style={{ color: isOwn ? 'rgba(255,255,255,0.7)' : '#999', flexShrink: 0, whiteSpace: 'nowrap' }}
                                                >
                                                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                            </Box>
                                        </div>

                                        

                                
                                    </div>

                                    {/* Hover action icons */}
                                    {hoveredComment === comment._id && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '-32px',
                                                [isOwn ? 'left' : 'right']: '0',
                                                display: 'flex',
                                                flexDirection: 'row',
                                                gap: '2px',
                                                background: 'white',
                                                borderRadius: '8px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                padding: '2px 4px',
                                                zIndex: 10,
                                            }}
                                        >
                                            <IconButton size="small" title="Reply" onClick={() => handleReplyClick(comment)}>
                                                <ReplyIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" title="React" onClick={(e) => handleEmojiClick(comment._id, e)}>
                                                <EmojiEmotionsIcon fontSize="small" />
                                            </IconButton>
                                            {isOwn && (
                                                <IconButton size="small" title="Delete" onClick={() => handleClickOpen(comment)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                                
                            </div>
                        );
                    })}
            </div>
            </div>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle align='center' id="alert-dialog-title" style={{ color: 'rgb(127, 86, 217)'}}>{"Delete Comment"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this comment?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="error">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} style={{ backgroundColor: 'rgb(127, 86, 217)', color: 'white' }} autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <div style={{ display:'flex', marginLeft:'40px' }}>
            {replyTo && (
                <div style={{ padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '10px', width:'500px', justifyContent:'space-between', display:'flex', backgroundColor: '#e8eaf6' }}>
                                                    
                    <Typography variant="body2" style={{ color: '#4a4a4a', wordBreak: 'break-word' }}>
                        {replyTo.text}
                    </Typography>
                    <IconButton size="small" onClick={() => setReplyTo(null)}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </div>
            )}
            </div>


            <div style={{ display: 'flex', alignItems: 'center', }}>
                {/* Profile Image */}
                <Avatar
                    alt={`${combined.user.role || 'User Avatar'}`}
                    src={combined.user.profile_img || ''}
                    style={{ width: '30px', height: '30px', marginRight: '10px', backgroundColor: '#cfcfcf' }}
                />

                <OutlinedInput
                    size="small"
                    multiline
                    minRows={1}
                    maxRows={5}
                    fullWidth
                    placeholder={replyTo ? `Reply to ${replyTo.createdBy?.fname ?? 'them'}` : "Add a comment"}
                    value={commentText}
                    onChange={handleInputChange}
                    style={{
                        borderRadius: '10px',
                        backgroundColor: '#f0f0f0',
                        color: 'black',
                        fontSize: '16px',
                        lineHeight: '1.5',
                        resize: 'none',
                        width: '500px',
                        padding: '10px',
                        boxSizing: 'border-box',
                    }}
                    inputProps={{
                        style: {
                            padding: '0px',
                        },
                    }}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                id="createTaskBtn"
                                type="submit"
                                color="primary"
                                onClick={createTaskCommentSubmitHandler}
                                style={{ backgroundColor: 'rgb(105, 56, 239)', color: 'white', borderRadius: '50%' }}
                            >
                                <SendIcon />
                            </IconButton>
                        </InputAdornment>
                    }
                />


            <Menu
                anchorEl={mentionAnchorEl}
                open={mentionDropdownVisible}
                onClose={() => setMentionDropdownVisible(false)}
                MenuListProps={{ style: { maxHeight: '150px' } }}
            >
                {superAdminId && (
                    <MenuItem
                        key={superAdminId}
                        onClick={() => handleUserSelect({ _id: superAdminId?._id, name: `${superAdminId?.fname} ${superAdminId?.lname}` })}
                    >
                        <Avatar src={superAdminId.profile_img} alt="Super Admin" /> {/* You may not have a profile image for Super Admin */}
                        <Typography variant="body2" style={{ marginLeft: '8px' }}>{`${superAdminId.fname} ${superAdminId.lname}`}</Typography>
                    </MenuItem>
                )}
                
                {/* Include Assignee */}
                {task.assigneeId && assignedToNamesMap[task.assigneeId] && (
                    <MenuItem
                        key={task.assigneeId}
                        onClick={() => handleUserSelect({ _id: task.assigneeId, name: assignedToNamesMap[task.assigneeId].name })}
                    >
                        <Avatar src={assignedToNamesMap[task.assigneeId].profile_img || ''} alt={assignedToNamesMap[task.assigneeId].name} />
                        <Typography variant="body2" style={{ marginLeft: '8px' }}>{assignedToNamesMap[task.assigneeId].name}</Typography>
                    </MenuItem>
                )}

                {/* Include Client */}
                {selectedClientFromOrder && (
                    <MenuItem
                        key={selectedClientIdFromOrder}
                        onClick={() => handleUserSelect({ _id: selectedClientIdFromOrder, name: selectedClientFromOrder })}
                    >
                        <Avatar src={selectedClientImgFromOrder} alt="Client" /> {/* You may not have a profile image for Client */}
                        <Typography variant="body2" style={{ marginLeft: '8px' }}>{selectedClientFromOrder}</Typography>
                    </MenuItem>
                )}
            </Menu>
            </div>

            {emojiPickerOpenFor && ReactDOM.createPortal(
                <Box
                    ref={emojiPickerRef}
                    sx={{ position: 'fixed', top: emojiPickerPos.top, left: emojiPickerPos.left, zIndex: 9999 }}
                >
                    <Picker
                        width={300}
                        onEmojiClick={(event, emojiObject) => onEmojiClick(event, emojiObject, emojiPickerOpenFor)}
                    />
                </Box>,
                document.body
            )}

        </>
    );
}

export default React.memo(CommentsSection);

