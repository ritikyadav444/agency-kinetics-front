import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import {
  Drawer,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  SvgIcon,
} from "@mui/material";
import {
  Inbox as InboxIcon,
} from "@mui/icons-material";
import { Link } from 'react-router-dom';
import { useSelector } from "react-redux";
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import { useLocation } from "react-router-dom";
import {ReactComponent as TeamIcon} from "../../../Images/teamIcon.svg"
import agencyKineticsLogo from '../../../Images/agencyKineticsLogo.svg'
const useStyles = makeStyles(() => ({
  drawer: {},
  drawerPaper: {
    width: 200
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: ".5em",
    height: "100px",
  },
  drawerBrandingText: {
    fontSize: "1.25em",
    fontWeight: 600,
    userSelect: "none",
    "&:hover": {}
  },
  drawerListItem: {
    userSelect: "none",
    cursor: "pointer",
  },
  listSubheader: {
    marginTop: "1em"
  },
  selectedIcon: {
    color: 'rgb(127, 86, 217)',
  },

  selectedText: {
    color: 'rgb(127, 86, 217)',
  },
}));


export default function AppDrawer() {
  const classes = useStyles();
  const [selectedItem, setSelectedItem] = useState('Dashboard');
  const workspace_name = useSelector((state) => state.logMember.workspace_name);

  const userRole = useSelector((state) => state.logMember.userRole);
  
  const location = useLocation()
  // console.log(location)
  useEffect(() => {
    if (location.pathname.includes("quotes") || location.pathname.includes("quote")) {
      setSelectedItem("Proposals");
    } else if (location.pathname.includes("clients") || location.pathname.includes("client")) {
      setSelectedItem("Clients");
    } 
    else if (location.pathname.includes("orders") || location.pathname.includes("order")) {
      setSelectedItem("Orders");
    } 
    else if (location.pathname.includes("services") || location.pathname.includes("service")) {
      setSelectedItem("Services");
    } 
    else if (location.pathname.includes("invoices") || location.pathname.includes("invoice")) {
      setSelectedItem("Invoices");
    } 
    else if (location.pathname.includes("tickets") || location.pathname.includes("ticket")) {
      setSelectedItem("Tickets");
    } 
    else if (location.pathname.includes("teams") || location.pathname.includes("team")) {
      setSelectedItem("Teams");
    } 
    else if (location.pathname.includes("tasks") || location.pathname.includes("task")) {
      setSelectedItem("Orders");
    } 
    else if (location.pathname.includes("payments-and-invoices-details")) {
      setSelectedItem("");
    } 
    else {
      if(userRole === 'ASSIGNEE' || userRole === 'PROJECTMANAGER') {
        setSelectedItem("Services");
      }
      else{
        setSelectedItem("Dashboard");

      }
    }
  }, [location.pathname]);
  


  const renderDashboard = (
    <React.Fragment>
      <ListItem
        className={classes.drawerListItem}
        button
        component={Link}
        to="/dashboard"
        // onClick={() => handleItemClick('Dashboard')}
      >
        <ListItemIcon className={selectedItem === 'Dashboard' ? classes.selectedIcon : ''}>
          <SpaceDashboardIcon />
        </ListItemIcon>
        <ListItemText
          primary="Dashboard"
          className={selectedItem === 'Dashboard' ? classes.selectedText : ''}
        />
      </ListItem>
    </React.Fragment>
  );

  const renderOrders = (
    <React.Fragment>
      <ListItem
        className={classes.drawerListItem}
        button
        component={Link}
        to="/orders"
        // onClick={() => handleItemClick('Orders')}
      >
        <ListItemIcon
          className={selectedItem === 'Orders' ? classes.selectedIcon : ''}
        >
          <InboxIcon />
        </ListItemIcon>
        <ListItemText
          primary="Orders"
          className={selectedItem === 'Orders' ? classes.selectedText : ''}
        />
      </ListItem>
    </React.Fragment>
  );
  

  const renderClients = (
    <React.Fragment>
      <ListItem
        className={classes.drawerListItem}
        button
        component={Link}
        to="/clients"
        // onClick={() => handleItemClick('Clients')}
      >
        <ListItemIcon
          className={selectedItem === 'Clients' ? classes.selectedIcon : ''}
        >
          <SvgIcon width="1em" height="1em" viewBox="0 0 28 28">
          <path d="M15.114 25.719A7.48 7.48 0 0 1 13 20.5c0-1.688.558-3.247 1.5-4.5H5a3 3 0 0 0-3 3v.715C2 23.433 6.21 26 12 26a17 17 0 0 0 3.114-.281M18 8A6 6 0 1 0 6 8a6 6 0 0 0 12 0m2.5 19a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13m0-11a.5.5 0 0 1 .5.5V20h3.5a.5.5 0 0 1 0 1H21v3.5a.5.5 0 0 1-1 0V21h-3.5a.5.5 0 0 1 0-1H20v-3.5a.5.5 0 0 1 .5-.5"></path>
          </SvgIcon>
        </ListItemIcon>
        <ListItemText
          primary="Clients"
          className={selectedItem === 'Clients' ? classes.selectedText : ''}
        />
      </ListItem>
    </React.Fragment>
  );

  const renderServices = (
    <React.Fragment>
      <ListItem
        className={classes.drawerListItem}
        button
        component={Link}
        to="/services"
        // onClick={() => handleItemClick('Services')}
      >
        <ListItemIcon
          className={selectedItem === 'Services' ? classes.selectedIcon : ''}
        >
          <SvgIcon width="1em" height="1em" viewBox="0 0 48 48">
          <defs><mask id="ipSMallBag0"><g fill="none" strokeLinejoin="round" strokeWidth="4"><path fill="#fff" stroke="#fff" d="M6 12.6V41a2 2 0 0 0 2 2h32a2 2 0 0 0 2-2V12.6z"/><path stroke="#fff" strokeLinecap="round" d="M42 12.6L36.333 5H11.667L6 12.6v0"/><path stroke="#000" strokeLinecap="round" d="M31.555 19.2c0 4.198-3.382 7.6-7.555 7.6s-7.556-3.402-7.556-7.6"/></g></mask></defs><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipSMallBag0)"/>
          </SvgIcon>
        </ListItemIcon>
        <ListItemText
          primary="Services"
          className={selectedItem === 'Services' ? classes.selectedText : ''}
        />
      </ListItem>
    </React.Fragment>
  );
  
  // const renderServices = (
  //   <React.Fragment>
  //     <ListItem
  //       className={classes.drawerListItem}
        // onClick={() => {setUserMenu(!userMenu);
  //       handleItemClick('Services')}}
  //     >
  //       <ListItemIcon className={selectedItem === 'Services' ? classes.selectedIcon : ''}>
  //         <InboxIcon />
  //       </ListItemIcon>
  //       <ListItemText primary="Services" className={selectedItem === 'Services' ? classes.selectedText : ''}/>
  //       {userMenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
  //     </ListItem>
  //     <Collapse in={userMenu} timeout="auto" unmountOnExit collapsedSize="auto">
  //       <List
  //         component="nav"
  //         aria-labelledby="nested-list-staff-subheader"
  //         disablePadding
  //       >
  //         {menuItems.map((item) => (
  //           <ListItem
  //             button
  //             style={{ textAlign: 'center' }}
  //             component={Link}
  //             to={item === 'All Services' ? '/services' : '/forms'}
  //             key={item}
              
  //           >
  //             <ListItemText key={item} primary={item} className={selectedItem === item ? classes.selectedText : ''}/>
  //           </ListItem>
  //         ))}
  //       </List>
  //     </Collapse>
  //   </React.Fragment>
  // );

  const renderProposals = (
    <React.Fragment>
      <ListItem
        className={classes.drawerListItem}
        button
        component={Link}
        to="/quotes"
        // onClick={() => handleItemClick('Quotes')}
      >
        <ListItemIcon
          className={selectedItem === 'Proposals' ? classes.selectedIcon : ''}
        >
          <SvgIcon width="1em" height="1em" viewBox="0 0 24 24">
                    <g fill="none"><path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M17 3a3 3 0 0 1 2.995 2.824L20 6v4.35l.594-.264c.614-.273 1.322.15 1.4.798L22 11v8a2 2 0 0 1-1.85 1.995L20 21H4a2 2 0 0 1-1.995-1.85L2 19v-8c0-.672.675-1.147 1.297-.955l.11.041l.593.264V6a3 3 0 0 1 2.824-2.995L7 3zm0 2H7a1 1 0 0 0-1 1v5.239l6 2.667l6-2.667V6a1 1 0 0 0-1-1m-5 3a1 1 0 0 1 .117 1.993L12 10h-2a1 1 0 0 1-.117-1.993L10 8z"></path></g>
          </SvgIcon>
        </ListItemIcon>
        <ListItemText
          primary="Proposals"
          className={selectedItem === 'Proposals' ? classes.selectedText : ''}
        />
      </ListItem>
    </React.Fragment>
  );

  const renderInvoices = (
    <React.Fragment>
      <ListItem
        className={classes.drawerListItem}
        button
        component={Link}
        to="/invoices"
        // onClick={() => handleItemClick('Invoices')}
      >
        <ListItemIcon
          className={selectedItem === 'Invoices' ? classes.selectedIcon : ''}
        >
          <SvgIcon width="384" height="512" viewBox="0 0 384 512">
          <g clipPath="url(#clip0_699_6)">
            <path d="M377 105L279.1 7C274.6 2.5 268.5 0 262.1 0H256V128H384V121.9C384 115.6 381.5 109.5 377 105ZM224 136V0H24C10.7 0 0 10.7 0 24V488C0 501.3 10.7 512 24 512H360C373.3 512 384 501.3 384 488V160H248C234.8 160 224 149.2 224 136ZM64 72C64 67.58 67.58 64 72 64H152C156.42 64 160 67.58 160 72V88C160 92.42 156.42 96 152 96H72C67.58 96 64 92.42 64 88V72ZM64 152V136C64 131.58 67.58 128 72 128H152C156.42 128 160 131.58 160 136V152C160 156.42 156.42 160 152 160H72C67.58 160 64 156.42 64 152ZM208 415.88V440C208 444.42 204.42 448 200 448H184C179.58 448 176 444.42 176 440V415.71C164.71 415.13 153.73 411.19 144.63 404.36C140.73 401.43 140.53 395.59 144.06 392.22L155.81 381.01C158.58 378.37 162.7 378.25 165.94 380.28C169.81 382.7 174.2 384 178.76 384H206.87C213.37 384 218.67 378.08 218.67 370.81C218.67 364.86 215.06 359.62 209.9 358.08L164.9 344.58C146.31 339 133.32 321.16 133.32 301.19C133.32 276.67 152.37 256.75 175.99 256.12V232C175.99 227.58 179.57 224 183.99 224H199.99C204.41 224 207.99 227.58 207.99 232V256.29C219.28 256.87 230.26 260.8 239.36 267.64C243.26 270.57 243.46 276.41 239.93 279.78L228.18 290.99C225.41 293.63 221.29 293.75 218.05 291.72C214.18 289.29 209.79 288 205.23 288H177.12C170.62 288 165.32 293.92 165.32 301.19C165.32 307.14 168.93 312.38 174.09 313.92L219.09 327.42C237.68 333 250.67 350.84 250.67 370.81C250.67 395.34 231.62 415.25 208 415.88Z"/>
            </g>
            <defs>
            <clipPath id="clip0_699_6">
            <rect width="384" height="512" fill="white"/>
            </clipPath>
            </defs>
          </SvgIcon>
        </ListItemIcon>
        <ListItemText
          primary="Invoices"
          className={selectedItem === 'Invoices' ? classes.selectedText : ''}
        />
      </ListItem>
    </React.Fragment>
  );
  
  const renderTickets = (
    <React.Fragment>
      <ListItem
        className={classes.drawerListItem}
        button
        component={Link}
        to="/tickets"
        // onClick={() => handleItemClick('Tickets')}
      >
        <ListItemIcon
          className={selectedItem === 'Tickets' ? classes.selectedIcon : ''}
        >
          <SvgIcon width="1em" height="1em" viewBox="0 0 256 256">
        <path d="M240 52H16A12 12 0 0 0 4 64v128a12 12 0 0 0 12 12h224a12 12 0 0 0 12-12V64a12 12 0 0 0-12-12m-58.79 128H74.79A60.18 60.18 0 0 0 28 133.21v-10.42A60.18 60.18 0 0 0 74.79 76h106.42A60.18 60.18 0 0 0 228 122.79v10.42A60.18 60.18 0 0 0 181.21 180M228 97.94A36.23 36.23 0 0 1 206.06 76H228ZM49.94 76A36.23 36.23 0 0 1 28 97.94V76ZM28 158.06A36.23 36.23 0 0 1 49.94 180H28ZM206.06 180A36.23 36.23 0 0 1 228 158.06V180ZM128 88a40 40 0 1 0 40 40a40 40 0 0 0-40-40m0 56a16 16 0 1 1 16-16a16 16 0 0 1-16 16"/>
          </SvgIcon>
        </ListItemIcon>
        
        <ListItemText
          primary="Tickets"
          className={selectedItem === 'Tickets' ? classes.selectedText : ''}
        />
      </ListItem>
    </React.Fragment>
  );
  
  const renderTeams = (
    <React.Fragment>
      <ListItem
        className={classes.drawerListItem}
        button
        component={Link}
        to="/teams"
      >
        
        <ListItemIcon className={selectedItem === 'Teams' ? classes.selectedIcon : ''}>
        <SvgIcon viewBox="0 0 20 20" width="20" height="20" >
          <path d="M12.5 4.5C12.5 5.16304 12.2366 5.79893 11.7678 6.26777C11.2989 6.73661 10.663 7 10 7C9.33696 7 8.70107 6.73661 8.23223 6.26777C7.76339 5.79893 7.5 5.16304 7.5 4.5C7.5 3.83696 7.76339 3.20107 8.23223 2.73223C8.70107 2.26339 9.33696 2 10 2C10.663 2 11.2989 2.26339 11.7678 2.73223C12.2366 3.20107 12.5 3.83696 12.5 4.5ZM17.5 5C17.5 5.53043 17.2893 6.03914 16.9142 6.41421C16.5391 6.78929 16.0304 7 15.5 7C14.9696 7 14.4609 6.78929 14.0858 6.41421C13.7107 6.03914 13.5 5.53043 13.5 5C13.5 4.46957 13.7107 3.96086 14.0858 3.58579C14.4609 3.21071 14.9696 3 15.5 3C16.0304 3 16.5391 3.21071 16.9142 3.58579C17.2893 3.96086 17.5 4.46957 17.5 5ZM4.5 7C5.03043 7 5.53914 6.78929 5.91421 6.41421C6.28929 6.03914 6.5 5.53043 6.5 5C6.5 4.46957 6.28929 3.96086 5.91421 3.58579C5.53914 3.21071 5.03043 3 4.5 3C3.96957 3 3.46086 3.21071 3.08579 3.58579C2.71071 3.96086 2.5 4.46957 2.5 5C2.5 5.53043 2.71071 6.03914 3.08579 6.41421C3.46086 6.78929 3.96957 7 4.5 7ZM6 9.25C6 8.56 6.56 8 7.25 8H12.75C13.44 8 14 8.56 14 9.25V14C14 15.0609 13.5786 16.0783 12.8284 16.8284C12.0783 17.5786 11.0609 18 10 18C8.93913 18 7.92172 17.5786 7.17157 16.8284C6.42143 16.0783 6 15.0609 6 14V9.25ZM5 9.25C5 8.787 5.14 8.358 5.379 8H3.25C2.56 8 2 8.56 2 9.25V13C1.99995 13.4281 2.09154 13.8513 2.2686 14.2411C2.44566 14.6309 2.7041 14.9782 3.02655 15.2599C3.34901 15.5415 3.728 15.7508 4.13807 15.8738C4.54813 15.9968 4.97978 16.0307 5.404 15.973C5.13691 15.3495 4.99945 14.6783 5 14V9.25ZM15 14C15 14.7 14.856 15.368 14.596 15.973C14.728 15.991 14.8627 16 15 16C15.7956 16 16.5587 15.6839 17.1213 15.1213C17.6839 14.5587 18 13.7956 18 13V9.25C18 8.56 17.44 8 16.75 8H14.621C14.861 8.358 15 8.787 15 9.25V14Z" />
        </SvgIcon>
        </ListItemIcon>
        <ListItemText
          primary="Teams"
          className={selectedItem === 'Teams' ? classes.selectedText : ''}
        />
      </ListItem>
    </React.Fragment>
  );
  

  const renderWorkspaceName = (
    <ListItem className={classes.drawerListItem} style={{ marginTop: 'auto' }}>
      <ListItemText primary={`Workspace Name: ${workspace_name}`} />
    </ListItem>
  );
    
  return (
    <Drawer
        
      className={classes.drawer}
      classes={{ paper: classes.drawerPaper }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar className={classes.drawerHeader} style={{ height: '100px' }}>
        <img
          src={agencyKineticsLogo}
          alt="AgencyKinetics"
          // style={{ width: "100%", height: "100%", marginBottom: "10px" }}
        />
        {/* <Box ml={1}>
          <Typography className={classes.drawerBrandingText}>Agency Kinetics</Typography>
        </Box> */}
      </Toolbar>

{/* Super Admin */}
      {userRole === 'SUPERADMIN' && renderDashboard}
      {userRole === 'SUPERADMIN' && renderOrders}
      {userRole === 'SUPERADMIN' && renderClients}
      {userRole === 'SUPERADMIN' && renderServices}
      {userRole === 'SUPERADMIN' && renderProposals}
      {userRole === 'SUPERADMIN' && renderInvoices}
      {userRole === 'SUPERADMIN' && renderTickets}
      {userRole === 'SUPERADMIN' && renderTeams}
      {userRole === 'SUPERADMIN' && renderWorkspaceName} 

{/* Admin */}
      {userRole === 'ADMIN' && renderDashboard}
      {userRole === 'ADMIN' && renderOrders}
      {userRole === 'ADMIN' && renderClients}
      {userRole === 'ADMIN' && renderServices}
      {userRole === 'ADMIN' && renderProposals}
      {userRole === 'ADMIN' && renderInvoices}
      {userRole === 'ADMIN' && renderTickets}
      {userRole === 'ADMIN' && renderTeams}
      {userRole === 'ADMIN' && renderWorkspaceName}

{/* project manager */}
      {userRole === 'PROJECTMANAGER' && renderServices}
      {userRole === 'PROJECTMANAGER' && renderClients}
      {userRole === 'PROJECTMANAGER' && renderOrders}
      {userRole === 'PROJECTMANAGER' && renderProposals}
      {userRole === 'PROJECTMANAGER' && renderInvoices}
      {userRole === 'PROJECTMANAGER' && renderTickets}
      {userRole === 'PROJECTMANAGER' && renderTeams}
      {userRole === 'PROJECTMANAGER' && renderWorkspaceName}


{/* Assignee */}
      {userRole === 'ASSIGNEE' && renderOrders}
      {userRole === 'ASSIGNEE' && renderServices}
      {userRole === 'ASSIGNEE' && renderTickets}
      {userRole === 'ASSIGNEE' && renderWorkspaceName}

{/* client */}
      {userRole === 'CLIENT' && renderDashboard}
      {userRole === 'CLIENT' && renderOrders}
      {userRole === 'CLIENT' && renderServices}
      {userRole === 'CLIENT' && renderProposals}
      {userRole === 'CLIENT' && renderInvoices}
      {userRole === 'CLIENT' && renderTickets}
      {userRole === 'CLIENT' && renderWorkspaceName}
    </Drawer>
  );
}