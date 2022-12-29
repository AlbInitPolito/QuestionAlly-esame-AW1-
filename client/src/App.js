import Qnavbar from './Qnavbar';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import React, { useState, useEffect} from 'react';
import { LoginForm } from './LoginForm';
import LoadingMessage from './LoadingMessage';
import PageNotFound from './PageNotFound';
import Aborted from './Aborted';
import Thanks from './Thanks';
import Done from './Done';
import API from './API';
import { UserApp, Filling } from './UserApp';
import { AdminApp, AdminCheck, AdminAdd } from './AdminApp';
import './App.css';

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  //const [surveys, setSurveys] = useState([]);
  //const [survey, setSurvey] = useState();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // here you have the user info, if already logged in
        const userinfo = await API.getUserInfo();
        setUsername(userinfo);
        setLoggedIn(true);
      } catch (err) {
        console.error(err.error);
      }
    };
    checkAuth();
  }, [loggedIn]);

  const login = async (credentials, setError) => {
    try {
      await API.login(credentials);
      setLoggedIn(true);
    }
    catch(err) {
      setError("Wrong username or password!");
    }
  }

  const logout = () => {
    API.logout();
    setLoggedIn(false);
    setUsername(undefined);
  }

  /*
  useEffect( () => {
    if(load && loggedIn){
      setLoading(true);
      API.loadUserSurveys().then( (q) => setSurveys(q))
      .catch((e)=>{throw e});
      setLoading(false);
      setLoad(false);
    }
    else if(load){
      setLoading(true);
      API.loadAllSurveys().then( (q) => setSurveys(q))
      .catch((e)=>{throw e});
      setLoading(false);
      setLoad(false);
    }
  }, [load, loggedIn]
  );
  */
/*
  const getSurvey = (id) => {
    setLoading(true);
    API.getSurvey(id).then ( (q) => setSurvey(q))
    .catch((e)=>{throw e});
    setLoading(false);
    setLoad(false);
  }

  const loadAllSurveys = () => {
    setLoading(true);
  }
*/

const addCompiling = async (id, name, answers, success, abort) => {
  API.addCompiling(id, name, answers).then((res) => {if(!res.errors) {
    //REDIRECT THANKS
    //console.log(res);
    success();
  }
  else {
    //REDIRECT ERROR
    //console.log(res.errors);
    abort();
  }
}).catch((e) => {
  console.log(e);
  abort();
});
}

const addSurvey = async (title, questions, success, abort) => {
  API.addSurvey(title, questions).then((res) => {
    if(!res.errors) {
      success();
    }
    else{
      abort();
    }
  }).catch((e) => {
    console.log(e);
    abort();
  });
}

  return (
    <Router>

      <div className="App">
        <Qnavbar loggedIn={loggedIn} username={username} logout={logout}/>
      </div>

      {loading && <LoadingMessage />}

      <Switch>

        <Route path="/login" render={() => 
          { return loggedIn ? <Redirect to="/dashboard" /> : <>
          <LoginForm login={login} />
        </>
        }} />

        <Route path="/home" render={() => { return loggedIn ? <Redirect to="/dashboard" /> : <>
          <UserApp setLoading={setLoading}/>
        </>
        }} />

        {/*}
        <Route exact path="/dashboard/:id/" render={() => { 
          return loggedIn ? <AdminApp setLoading={setLoading} username={username}/>
        : <Redirect to="/login" />
        }} />
        {*/}

        <Route path="/dashboard/check/:id/" render={({match}) => {
          return loggedIn ? <AdminCheck setLoading={setLoading} username={username} surveyId={match.params.id}/>
          : <Redirect to="/login" />
        }} />

        <Route path="/compile/:id" render={({match}) => { return loggedIn ? <Redirect to="/dashboard" />
        : <Filling setLoading={setLoading} surveyId={match.params.id} addCompiling={addCompiling}/>
        }}/>

        <Route exact path="/new" render={() => { return loggedIn ? <AdminAdd addSurvey={addSurvey}/>
        : <Redirect to="/login" />
        }} />

        <Route path="/dashboard" render={() => { return loggedIn ? <AdminApp setLoading={setLoading} username={username} mode="all"/>
        : <Redirect to="/login" />
        }} />

        <Route path="/thanks" render={({location}) => location.state.red === true ? <Thanks />
        : <Redirect to="/home"/> } />

        <Route path="/done" render={({location}) => location.state.red === true ? <Done />
        : <Redirect to="/home"/> } />

        <Route path="/aborted" render={({location}) => ((location.state!==undefined)&&(location.state.red === true)) ? <> <Aborted message={location.state.message}/> </>
        : <Redirect to="/home"/> } />

        <Route exact path="/" render={() => { return loggedIn ? <Redirect to="/dashboard" /> : <Redirect to="/home" /> }} />

        <Route path="/" render={() => { return <PageNotFound />}} />

      </Switch>

    </Router>
  );
}

export default App;
