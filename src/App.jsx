import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/AppShell';
import Home from './pages/Home';
import History from './pages/History';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import LogFeed from './pages/LogFeed';
import LogNappy from './pages/LogNappy';
import LogSleep from './pages/LogSleep';
import LogMedicine from './pages/LogMedicine';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="history" element={<History />} />
          <Route path="insights" element={<Insights />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/log/feed" element={<LogFeed />} />
        <Route path="/log/nappy" element={<LogNappy />} />
        <Route path="/log/sleep" element={<LogSleep />} />
        <Route path="/log/medicine" element={<LogMedicine />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
