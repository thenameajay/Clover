import { createRoot } from 'react-dom/client'
import { Route, Routes } from "react-router-dom";
import { BrowserRouter } from 'react-router-dom';
import FinishSignUp from './Authentication/FinishSignUp.jsx';
import LoginSignUp from './Authentication/LoginSignup.jsx';
import MailVerification from './Authentication/MailVerification.jsx';
import PasswordReset from './Authentication/PasswordReset.jsx';
import { StrictMode } from 'react';
import ChangeEmailID from './Authentication/ChangeEmailID.jsx';
import ChatScreen from './Chating/ChatScreen.jsx';
import LogoutSpecificDevice from './Authentication/LogoutSpecificDevice.jsx';

navigator.serviceWorker.register('/firebase-messaging-sw.js')
  .then((registration) => {
    // console.log('Service Worker registered');
    console.log('Service Worker registered with scope:', registration.scope);
  })
  .catch((error) => {
    console.error('Service Worker registration failed:', error);
  });


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<ChatScreen />} />
        <Route path='/home' element={<ChatScreen />} />
        <Route path='/loginsignup' element={<LoginSignUp />} />
        <Route path='/mailverification' element={<MailVerification />} />
        <Route path='/finish-passwordless-signup' element={<FinishSignUp />} />
        <Route path='/forgot-password' element={<PasswordReset />} />
        <Route path='/change-email-id' element={<ChangeEmailID />} />
        <Route path='/logoutspecificaccount' element={<LogoutSpecificDevice />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
