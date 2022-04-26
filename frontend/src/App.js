import './App.css';
import Nav from './components/Nav';
import Home from './components/Home';
import SearchResults from './components/SearchResults';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <Nav />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/search" exact component={SearchResults} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
