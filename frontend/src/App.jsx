import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './router/index';
import GlobalPreferences from './components/common/GlobalPreferences';

function App() {
  return (
    <BrowserRouter>
      <GlobalPreferences />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
