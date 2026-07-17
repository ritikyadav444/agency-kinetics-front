import React, { useState } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import { createTask_comment, deleteAttachment } from '../../actions/taskCommentAction';

const FilesSection = ({ attachments, taskId}) => {
  const [isClickDisabled, setIsClickDisabled] = useState(false);
// console.log(attachments, typeof(attachments))
  const handleFileInputClick = () => {
    if (!isClickDisabled) {
      setIsClickDisabled(true);
      document.getElementById('fileInput').click();
      setTimeout(() => setIsClickDisabled(false), 500); // Debounce time to avoid double-clicking
    }
  };
  const [files, setFiles] = useState([])
  const dispatch = useDispatch()
  const handleFileChange = (e) => {
    e.preventDefault();
    const selectedFiles = e.target.files;
    const filesArray = [];
  
    Array.from(selectedFiles).forEach(file => {
      const reader = new FileReader();
  
      reader.onloadend = () => {
        filesArray.push({
          url: reader.result,
          name: file.name,
          type: file.type
        });
  
        // If you want to trigger an action once all files are processed
        if (filesArray.length === selectedFiles.length) {
          setFiles(filesArray); // Store the files in the state

          const data = {
            taskId: taskId,
            attachments: filesArray
          };
          
        dispatch(createTask_comment(data));
      
        }
      };
  
      reader.readAsDataURL(file); // Convert file to base64 string
    });
  };

  return (
        <div style={{ marginBottom: '10px' }}>
          <Typography fontWeight={'bold'} fontSize={'1.3rem'}>Files</Typography>
          <input
            style={{ display: 'none' }}
            id="fileInput"
            type="file"
            multiple
            accept=".pdf,.docx,image/*"
            onChange={handleFileChange}
          />
          <Button
            variant="outlined"
            onClick={handleFileInputClick}
            startIcon={<AddIcon style={{color:'grey'}} />}
            size='small'
            style={{
              color: 'rgb(127, 86, 217)',
              border:'none',
              textTransform: 'none'
            }}
          >
            Add Files
          </Button>
          
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: attachments && attachments.length > 0 ? '#f8f9fa' : 'transparent',
              padding: 2,
              borderRadius: 2,
              maxHeight: 180, // Adjust this based on your design preference
              overflowY: 'auto', // Vertical scrolling in case of overflow
            }}
          >
            <Box
              sx={{
                display: 'flex',
                overflowX: 'auto', // Enable horizontal scrolling if items overflow
                '&::-webkit-scrollbar': {
                  display: 'none', // Hide scrollbar in WebKit-based browsers
                },
                scrollbarWidth: 'none', // Hide scrollbar in Firefox
                msOverflowStyle: 'none', // Hide scrollbar in IE/Edge
              }}
            >
              {attachments && [...attachments].reverse().map((file, index) => {
                const isImage = file.type.startsWith('image/');
                const isDocument = file.type.startsWith('application/');
                return (
                  <Box
                    key={index}
                    sx={{
                      flex: '0 0 auto', // Ensure that the inner boxes stay side by side
                      width: 120, // Fixed width for inner boxes
                      height: 100, // Fixed height for inner boxes
                      mr: 2,
                      backgroundColor: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1,
                      overflow: 'hidden',
                      position: 'relative',
                      textOverflow: 'ellipsis', // Handle text overflow
                      whiteSpace: 'nowrap', // Prevent text wrapping
                    }}
                  >
                    {isImage ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        title={file.name}
                      />
                    ) : isDocument ? (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          overflow: 'hidden', // Hide overflow
                          textOverflow: 'ellipsis', // Handle text overflow
                          whiteSpace: 'nowrap', // Prevent text wrapping
                        }}
                      >
                        <Typography variant="body2" style={{ fontSize: '14px' }}>
                          📄
                        </Typography>
                        <Typography 
                          variant="body2" 
                          style={{ 
                            marginTop: '5px', 
                            fontSize: '10px',
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '80px',
                            position: 'relative',
                            display: 'inline-block',
                          }}
                          title={file.name} 
                        >
                          {file.name}
                        </Typography>
    
                        <a
                          href={file.url}
                          download={file.name}
                          style={{
                            position: 'absolute',
                            bottom: 5,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '12px',
                            color: '#007bff',
                            textDecoration: 'none',
                          }}
                        >
                          Download
                        </a>
                      </Box>
                    ) : (
                      <Typography variant="body2" align="center">
                        {file.name}
                      </Typography>
                    )}
    
                    <IconButton
                      onClick={() => dispatch(deleteAttachment(taskId, file._id))}
                      sx={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        backgroundColor: 'rgba(255, 0, 0, 0.6)',
                        color: '#fff',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 0, 0, 0.8)',
                        },
                        width: '20px',
                        height: '20px'
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </div>
      );
};

export default React.memo(FilesSection);
