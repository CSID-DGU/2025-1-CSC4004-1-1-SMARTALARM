import { Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import MyPage from './pages/MyPage';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/:id" element={<MyPage />} />
      </Routes>
    </>
  );
}

export default App;
