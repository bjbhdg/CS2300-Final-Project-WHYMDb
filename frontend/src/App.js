import './App.css';
import Nav from './components/Nav';
import SearchPage from './components/SearchPage';
import SearchResults from './components/SearchResults';
import Account from './components/Account';
import EditDatabase from './components/EditDatabase';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <Nav />
        <Switch>
          <Route path="/" exact component={SearchPage} />
          <Route path="/search" exact component={SearchResults} />
          <Route path="/account" exact component={Account} />
          <Route path="/editDatabase" exact component={EditDatabase} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
