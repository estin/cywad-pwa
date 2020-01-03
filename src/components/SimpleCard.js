import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';

import green from '@material-ui/core/colors/green';
import yellow from '@material-ui/core/colors/yellow';
import red from '@material-ui/core/colors/red';

import Screenshots from './Screenshots';

const classes = {
  card: {
    minWidth: 275,
    maxWidth: 275,
  },
  title: {
    fontSize: 14,
  },
  status: {
    fontSize: 14,
  },
  green: {
    color: green[900],
  },
  yellow: {
    color: yellow[800],
  },
  red: {
    color: red[500],
  },
};

const formatDatetime = str => {
  const value = new Date(str);
  const today = new Date().toISOString().slice(0, 10);
  if (today === value.toISOString().slice(0, 10)) {
    return value.toLocaleTimeString();
  }
  return value.toLocaleString();
};

const timeSince = date => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval >= 1) {
    return interval + ' years';
  }
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval + ' months';
  }
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval + ' days';
  }
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval + ' hours';
  }
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval + ' minutes';
  }
  return Math.floor(seconds) + ' seconds';
};

class SimpleCard extends React.Component {
  render() {
    const { classes, item, handleCardUpdate } = this.props;
    const inProgress = ['InWork', 'Err'].indexOf(item.state) >= 0;
    return (
      <Card className={classes.card}>
        <CardContent>
          {inProgress ? (
            <LinearProgress
              variant="determinate"
              value={Math.round((item.steps_done / item.steps_total) * 100)}
              color={item.state === 'Err' ? 'secondary' : 'primary'}
            />
          ) : (
            <div></div>
          )}
          <Typography
            className={classes.title}
            color="textSecondary"
          ></Typography>
          <Typography variant="h5" component="h2">
            {item.name}
          </Typography>
          <Typography
            className={classes.status}
            color="textSecondary"
            title={formatDatetime(item.datetime)}
          >
            {timeSince(new Date(item.datetime))} {item.state}
            {inProgress ? (
              <b>
                {' '}
                {item.steps_done} / {item.steps_total}
              </b>
            ) : null}
          </Typography>
          {item.values.map((value, i) => (
            <Box key={i}>
              <Typography
                variant="body1"
                component="span"
                className={classes[value.level]}
              >
                {value.value}{' '}
              </Typography>
              <Typography variant="body2" component="span">
                {value.key}
              </Typography>
            </Box>
          ))}
          {item.scheduled && (
            <Typography className={classes.status} color="textSecondary">
              scheduled at {formatDatetime(item.scheduled)}
            </Typography>
          )}
        </CardContent>
        <CardActions>
          <Button
            size="small"
            disabled={['InWork', 'InQueue'].indexOf(item.state) >= 0}
            onClick={() => handleCardUpdate(item)}
          >
            update
          </Button>
          <Screenshots item={item} />
        </CardActions>
      </Card>
    );
  }
}

export default withStyles(classes)(SimpleCard);
