import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Typography, Divider } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { clearErrors, getTaskDetails } from '../../actions/taskAction';
import { getTask_Comment } from '../../actions/taskCommentAction';

import { ADD_EMOJI_REACTION_RESET, DELETE_ATTACHMENT_RESET, UPDATE_ATTACHMENT_RESET } from '../../constants/taskCommentConstants';
import DOMPurify from 'dompurify';
import MetaData from '../layout/MetaData';
import TaskDetails from './TaskDetails';
import FilesSection from './FilesInTaskComment';
import CommentsSection from './CommentsInTaskComment';
import './Tasks.css'
import { baseURL } from '../../http';

const TaskComment = ({ match }) => {
  const combined = useSelector((state) => state.logMember.combined);
  const { id } = useParams();
  const taskId = id;
  const { task, error: taskDetailError } = useSelector(state => state.taskDetails);
  const { taskComment } = useSelector(state => state.taskComments);
  const comments = taskComment?.comments
  const attachments = taskComment?.attachments
  const subtasks = taskComment?.subtasks
  const { errorAttachment, isAttachmentDeleted, isAttachmentUpdated } = useSelector((state) => state.attachment);
  const dispatch = useDispatch();

  const superAdminId = combined?.superAdminId;

  const [assignedToNamesMap, setassignedToNamesMap] = useState({});
  
  useEffect(() => {
    const controller = new AbortController();
    const fetchAssigneeData = async () => {
        try {
            const response = await fetch(`${baseURL}/api/v1/getAllExceptClient`, {
                credentials: 'include',
                signal: controller.signal,
              });
            if (!response.ok) {
                throw new Error(`Failed to fetch assignee: ${response.status}`);
            }
            const data = await response.json();
            // console.log('Assigned To data:', data);

            const assignedToMap = {};
            for (const combined of data.combined) {
                const assignedTo = {
                    name: combined.fname + ' ' + combined.lname,
                };
                if (combined.profile_img) {
                    const url = combined.profile_img
                    assignedTo.profile_img = url;
                }
                assignedToMap[combined._id] = assignedTo;

            }
            setassignedToNamesMap(assignedToMap);
            // console.log(assignedToMap)

        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Error fetching clients:', error.message);
        }
    };

    fetchAssigneeData();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (taskDetailError) {
      alert(taskDetailError);
      dispatch(clearErrors());
    }

    dispatch(getTaskDetails(taskId));
    dispatch(getTask_Comment(taskId));
  }, [dispatch, taskId, taskDetailError]);


  //For attachment
  useEffect(() => {
    if (errorAttachment) {
      alert(errorAttachment);
      dispatch(clearErrors());
    }
    
    if (isAttachmentDeleted || isAttachmentUpdated) {
      dispatch({ type: UPDATE_ATTACHMENT_RESET });
      dispatch({ type: DELETE_ATTACHMENT_RESET });
    }
  }, [dispatch, isAttachmentDeleted, isAttachmentUpdated, errorAttachment, taskId]);


  //For emoji
  const { errorEmoji, isEmojiReactionAdded } = useSelector((state) => state.emojiReaction);

  useEffect(() => {
    if (errorEmoji) {
      alert(errorEmoji);
      dispatch(clearErrors());
    }
    
    if (isEmojiReactionAdded) {
      dispatch({ type: ADD_EMOJI_REACTION_RESET });
    }
  }, [dispatch, errorEmoji, isEmojiReactionAdded, taskId]);

    
  // const handleBreadcrumbClick = () => {
  //   history.push(`/task/order/${selectedOrderId}`);
  // };

  // useEffect(() => {
  
  //   socket.on("connect", () => {
  //     console.log("Successfully connected to Socket.io server");
  //   });
  //   socket.on('commentMsgReceived', (msg) => {
  //     console.log('messgae', msg);
  //       // dispatch(getTask_Comment(taskId));
  //   })
  // }, [taskId, socket]);


  return (
    <div>
  <MetaData title="Task" />
    {/* <div className='taskbtn'>
    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
              <Button onClick={handleBreadcrumbClick} style={{ background: 'none', boxShadow: 'none', textTransform: 'none' }}>
              Tasks
              </Button>
              <Typography style={{color:"rgb(127, 86, 217)"}}>Task Details</Typography>
            </Breadcrumbs>
    </div> */}
  {/* <form className="createTaskForm" encType="multipart/form-data" onSubmit={createTaskCommentSubmitHandler}> */}
    <Grid container spacing={3} style={{ height:'650px', paddingTop: '40px', marginBottom: '0px', marginLeft: '10px', marginRight: '10px', maxHeight: '92vh' }}>
    <Grid
            item
            xs={8}
            style={{
              borderRadius: 15,
              backgroundColor: 'transparent',
              maxHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            <Typography fontWeight={'bold'} fontSize={'1.5rem'}>{task.task_name}</Typography>
            <Typography marginLeft={'10px'} marginBottom={'10px'} style={{color:'#4d5871'}}><span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(task.description) }} /></Typography>

            <FilesSection
              attachments={attachments}
              taskId={taskId}
            />
          
            <CommentsSection
              task={task}
              comments={comments}
              superAdminId={superAdminId}
              assignedToNamesMap={assignedToNamesMap}
            />


          </Grid>

      <Divider />

        <Grid item xs={3} style={{ marginRight:'10px', maxHeight:'100%'}}>
          <TaskDetails
          task={task}
          assignedToNamesMap={assignedToNamesMap}
          subtasks={subtasks}
          taskId={taskId}
        />    
        </Grid>


    </Grid>
  {/* </form> */}
</div>

  );
};

export default TaskComment;
