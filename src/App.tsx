import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Verification from './pages/Verification';
import Creation from './pages/Creation';
import Certificate from './pages/Certificate';
import { ToastContainer, Zoom } from 'react-toastify';
import Footer from './components/Footer';
import ScrollPageWrapper from './utils/ScrollPageWrapper';
import { useUVerifyTheme } from './utils/hooks';
import { useUVerifyConfig } from './utils/UVerifyConfigProvider';

function App() {
  const { background, hideFooter } = useUVerifyTheme();
  const config = useUVerifyConfig();

  return config.backendUrl !== '' ? (
    <div className={`min-w-screen min-h-screen ${background} flex flex-col`}>
      <div className="grow flex justify-center">
        <Router>
          <ScrollPageWrapper>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/verify" element={<Verification />} />
              <Route path="/verify/:hash" element={<Certificate />} />
              <Route path="/verify/raw/:data" element={<Certificate />} />
              <Route path="/verify/:hash/:query" element={<Certificate />} />
              <Route path="/create" element={<Creation />} />
            </Routes>
          </ScrollPageWrapper>
        </Router>
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          transition={Zoom}
        />
      </div>
      {!hideFooter && <Footer />}
    </div>
  ) : (
    <></>
  );
}

export default App;
