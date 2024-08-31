import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonText
} from '@ionic/react';
import useSQLiteDB from '../composables/useSQLiteDB';
import './Login.css';

const Login: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const history = useHistory();
  const { validateLogin } = useSQLiteDB('');

  // Check if user is already logged in
  useEffect(() => {
    const storedPharmacyName = localStorage.getItem('pharmacyName');
    if (storedPharmacyName) {
      // If user is already logged in, redirect to HomeAfterLogin page
      history.push({
        pathname: '/homeafterlogin',
        state: { pharmacyName: storedPharmacyName }
      });
    }
  }, [history]);

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      setToastMessage('Please enter both email/phone and password.');
      setShowToast(true);
      return;
    }

    try {
      await validateLogin(
        emailOrPhone,
        password,
        (pharmacyName) => {
          // On successful login, store the pharmacy name in local storage
          localStorage.setItem('pharmacyName', pharmacyName);

          // Redirect to HomeAfterLogin page
          history.push({
            pathname: '/homeafterlogin',
            state: { pharmacyName }
          });
        },
        (error) => {
          setToastMessage(error.message);
          setShowToast(true);
        }
      );
    } catch (error) {
      setToastMessage('An error occurred during login.');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader className='headerclass'>
        
          <IonTitle>Login</IonTitle>
        
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="login-container">
          <div className="login-box">
            <IonText className="login-title" color="primary">
              <h1>Welcome Back!</h1>
            </IonText>
            <IonItem className="input-item">
              <IonLabel position="floating">Email or Phone</IonLabel>
              <IonInput
                type="text"
                value={emailOrPhone}
                onIonInput={(e) => setEmailOrPhone(e.target.value as string)}
                required
              />
            </IonItem>
            <IonItem className="input-item">
              <IonLabel position="floating">Password</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonInput={(e) => setPassword(e.target.value as string)}
                required
              />
            </IonItem>
            <IonButton expand="block" onClick={handleLogin} className="login-button">
              Login
            </IonButton>
          </div>
          <IonToast
            isOpen={showToast}
            message={toastMessage}
            duration={3000}
            onDidDismiss={() => setShowToast(false)}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;