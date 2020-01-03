import React, { useEffect, useState, Fragment } from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';

import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import MenuIcon from '@material-ui/icons/Menu';
import RefreshIcon from '@material-ui/icons/Refresh';

import SimpleCard from './components/SimpleCard';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || '';
const TOKEN_KEY = 'cywad-token';
const UPDATES_MAX_DELAY = 60 * 1000;

const useStyles = makeStyles(theme => ({
  root: {
    padding: 0,
    flexGrow: 1,
  },
  appBar: {
    paddingBottom: theme.spacing(2),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  cell: {
    padding: '15px 0px 0px 15px',
  },
  widgetFrom: {
    '& > *': {
      margin: theme.spacing(1),
      width: 200,
    },
  },
  widgetPreview: {
    border: 'thick double #3f51b5',
  },
}));

window.getQsWithToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    return `?token=${token}`;
  }
  return '';
};

const Widget = props => {
  const [width, setWidth] = React.useState(500);
  const [height, setHeight] = React.useState(100);
  const [fontSize, setFontSize] = React.useState(14);

  const classes = useStyles();

  const origin = apiEndpoint || window.location.origin;
  const url = `${origin}/widget/png/${width}/${height}/${fontSize}${window.getQsWithToken()}`;

  return (
    <Grid
      className={classes.cell}
      container
      spacing={3}
      align="center"
      justify="center"
      alignItems="center"
      alignContent="center"
    >
      <Grid className={classes.cell} item xs={12}>
        <Typography variant="h6" className={classes.title}>
          Parameters
        </Typography>
        <form className={classes.widgetFrom} noValidate autoComplete="off">
          <TextField
            label="Width"
            value={width}
            onChange={e => setWidth(e.target.value)}
          />
          <TextField
            label="Heigth"
            value={height}
            onChange={e => setHeight(e.target.value)}
          />
          <TextField
            label="Font size"
            value={fontSize}
            onChange={e => setFontSize(e.target.value)}
          />
        </form>
      </Grid>
      <Grid className={classes.cell} item xs={12}>
        <Typography variant="h6" className={classes.title}>
          Url
        </Typography>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      </Grid>
      <Grid className={classes.cell} item>
        <Typography variant="h6" className={classes.title}>
          Preview
        </Typography>
        <img
          alt="widget"
          id="widget-preview"
          src={url}
          className={classes.widgetPreview}
        />
      </Grid>
    </Grid>
  );
};

const pathNameToPageTitle = {
  '/': 'Items',
  '/index.html': 'Items',
  '/widget': 'PNG Widget',
};

const AppMenu = props => {
  const location = useLocation();
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Fragment>
      <IconButton
        edge="start"
        className={classes.menuButton}
        color="inherit"
        onClick={handleClick}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem component={Link} to="/" onClick={handleClose}>
          Items
        </MenuItem>
        <MenuItem component={Link} to="/widget" onClick={handleClose}>
          PNG widget
        </MenuItem>
      </Menu>
      <Typography variant="h6" className={classes.title}>
        {pathNameToPageTitle[location.pathname] || location.pathname}
      </Typography>
    </Fragment>
  );
};

const Items = props => {
  const classes = useStyles();
  const { items, handleCardUpdate } = props;

  return (
    <Grid className={classes.cell} container spacing={3} justify="center">
      {items.map(item => (
        <Grid key={item.slug} className={classes.cell} item>
          <SimpleCard item={item} handleCardUpdate={handleCardUpdate} />
        </Grid>
      ))}
    </Grid>
  );
};

const useEventSourceListener = (url, listenCallback) => {
  const listenCallbackRef = React.useRef(listenCallback);

  React.useEffect(() => {
    // On re-render, the listener should be updated.
    listenCallbackRef.current = listenCallback;
  });

  React.useEffect(() => {
    const eventSource = new EventSource(url, {
      withCredentials: true,
    });

    eventSource.addEventListener(
      'heartbeat',
      e => {
        listenCallbackRef.current('heartbeat', JSON.parse(e.data));
      },
      false
    );

    eventSource.addEventListener(
      'item',
      e => {
        listenCallbackRef.current('item', JSON.parse(e.data));
      },
      false
    );

    return () => {
      eventSource.close();
    };
  }, [url]);
};

const UpdatedAt = ({ info }) => {
  const classes = useStyles();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setInterval(() => {
      setNow(new Date());
    }, UPDATES_MAX_DELAY);
  });

  if (!info) {
    return null;
  }

  const dateTime = new Date(info.server_datetime);
  const noUpdates = now.getTime() - dateTime.getTime() > UPDATES_MAX_DELAY;
  const reprTime =
    now.toISOString().slice(0, 10) === info.server_datetime.slice(0, 10)
      ? dateTime.toLocaleTimeString()
      : dateTime.toLocaleString();

  return (
    <Typography
      variant="h6"
      className={classes.title}
      color={noUpdates ? 'error' : 'initial'}
    >
      Updated at: {reprTime}
      {noUpdates && `  data is't actual!`}
    </Typography>
  );
};

const App = props => {
  const classes = useStyles();
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [info, setInfo] = useState(null);
  const [items, setItems] = useState([]);

  const fetchData = () => {
    setIsLoaded(false);

    return fetch(`${apiEndpoint}/api/items${window.getQsWithToken()}`, {
      credentials: 'include',
    })
      .then(res => {
        const token = res.headers.get(TOKEN_KEY);
        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
        }
        return res.json();
      })
      .then(
        result => {
          setIsLoaded(true);
          setInfo(result.info);
          setItems(result.items);
        },
        error => {
          setIsLoaded(true);
          setError(error);
        }
      );
  };

  const cardUpdate = item => {
    fetch(`${apiEndpoint}/api/${item.slug}/update${window.getQsWithToken()}`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(
        result => {
          setInfo({ ...info, server_datetime: result.server_datetime });
          setItems(
            items.map(i => {
              if (i.slug === item.slug) {
                return result.item;
              }
              return i;
            })
          );
        },
        error => {
          setError(error);
        }
      );
  };

  useEffect(() => {
    // get token from qs
    const match = Array.from(window.location.href.matchAll('token=([^&]*)'));
    if (match && match.length > 0 && match[0].length > 0) {
      localStorage.setItem(TOKEN_KEY, match[0][1]);
    }

    fetchData();
  }, []);

  useEventSourceListener(
    `${apiEndpoint}/sse${window.getQsWithToken()}`,
    (type, message) => {
      setInfo({ ...info, server_datetime: message.server_datetime });
      if (type === 'item') {
        setItems(
          items.map(i => {
            if (i.slug === message.item.slug) {
              return message.item;
            }
            return i;
          })
        );
      }
    }
  );

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className={classes.root}>
      <Router>
        <AppBar position="static">
          <Toolbar>
            <AppMenu />
            <UpdatedAt info={info} />
            <RefreshIcon
              onClick={e => {
                fetchData();
              }}
            />
          </Toolbar>
        </AppBar>
        {isLoaded ? (
          <Switch>
            <Route path="/widget">
              <Widget />
            </Route>
            <Route path="/">
              <Items items={items} handleCardUpdate={cardUpdate} />
            </Route>
          </Switch>
        ) : (
          <Typography variant="h6">Loading...</Typography>
        )}
      </Router>
    </div>
  );
};

export default App;
