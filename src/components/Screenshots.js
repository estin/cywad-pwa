import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || '';

const classes = {
  paper: {
    position: 'absolute',
    width: '70%',
    height: 'auto',
    margin: 'auto',
    backgroundColor: 'white',
    // backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    // boxShadow: theme.shadows[5],
    // padding: theme.spacing(2, 4, 3),
    textAlign: 'center',
    overflow: 'auto',
  },
  container: {
    maxWidth: '90%',
    margin: 'auto',
    overflow: 'auto',
  },
  screenshot: {
    width: '80%',
    height: '80%',
    margin: 'auto',
    display: 'block',
  },
  title: {
    margin: '30px auto',
  },
  galleryButton: {
    marginTop: '30px',
  },
};

const Screenshots = ({ item, classes }) => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (!item.screenshots) {
    return null;
  }

  if (item.screenshots && item.screenshots.length === 0) {
    return null;
  }

  const handleOpen = event => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleNext = () => {
    setIndex(Math.min(index + 1, item.screenshots.length - 1));
  };

  const handlePrev = () => {
    setIndex(Math.max(index - 1, 0));
  };

  const screenshot = item.screenshots[index];

  return (
    <React.Fragment>
      <Button size="small" onClick={handleOpen}>
        screenshots ({item.screenshots.length})
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className={classes.paper}>
          <Typography className={classes.title} color="textPrimary">
            {screenshot.name}
          </Typography>
          <div className={classes.container}>
            <img
              className={classes.screenshot}
              key={item.name}
              alt={item.name}
              src={`${apiEndpoint}/screenshot/${
                screenshot.uri
              }${window.getQsWithToken()}`}
            />
          </div>
          <Button
            disabled={index === 0}
            className={classes.galleryButton}
            onClick={handlePrev}
          >
            Prev
          </Button>
          <Button
            color="primary"
            className={classes.galleryButton}
            onClick={handleClose}
          >
            Close
          </Button>
          <Button
            disabled={index === item.screenshots.length - 1}
            className={classes.galleryButton}
            onClick={handleNext}
          >
            Next
          </Button>
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default withStyles(classes)(Screenshots);
