import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonImg, IonToolbar, IonGrid, IonRow, IonCol, IonButton, IonText, IonFooter, IonModal, IonInput, IonItem, IonLabel, IonToast } from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  
  // Mock authentication status, replace with actual authentication logic
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  // State for managing login modal visibility
  const [showLogin, setShowLogin] = useState(false);
  
  // Toast message state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const state = location.state as { pharmacyName?: string } | undefined;
  const pharmacyName = state?.pharmacyName || '';

  const handleNavigation = (path: string) => {
    if (isLoggedIn) {
      history.push({
        pathname: path,
        state: { pharmacyName }
      });
    } else {
      setToastMessage('Please log in to access this feature');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader className='pgcolor'>
        <div className="hd-button">
          <IonButton shape="round"  color = "light" routerLink='/Login'>Login</IonButton>
          <IonButton shape="round" color="light" routerLink='/SignUp'>SignUp</IonButton>
        </div>
      </IonHeader>
      <IonContent fullscreen className='pgcolor'>
        <IonGrid className="custom-grid">
          <IonRow className='custom-row'>
            <IonCol className="custom-col">

              <IonImg  onClick={() => handleNavigation("/add/medicines/${pharmacyName}")} src="https://images.pexels.com/photos/593451/pexels-photo-593451.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" className="box-image" />
              {/* <IonButton className='full-link' onClick={() => handleNavigation("/add/medicines/${pharmacyName}")}>Add</IonButton> */}
              <div className="overlay-text">Add</div>

              

            </IonCol>
            <IonCol className="custom-col">
              <IonImg onClick={() => handleNavigation("/search/${pharmacyName}")} src="https://images.pexels.com/photos/593451/pexels-photo-593451.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" className="box-image" />
              <div className="overlay-text">Search</div>
              {/* <IonButton className='full-link' onClick={() => handleNavigation("/search/${pharmacyName}")}>Search</IonButton> */}
            </IonCol>
          </IonRow>
          <IonRow className='custom-row'>
            <IonCol className="custom-col">
              <IonImg onClick={() => handleNavigation("/accounting")} src="https://images.pexels.com/photos/593451/pexels-photo-593451.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" className="box-image" />
              <div className="overlay-text">Accounting</div>
              {/* <IonButton className='full-link' onClick={() => handleNavigation("/accounting")}>Accounting</IonButton> */}
            </IonCol>
            <IonCol className="custom-col">
              
              <IonImg onClick={() => handleNavigation("/Orders/${pharmacyName}")} src="https://images.pexels.com/photos/593451/pexels-photo-593451.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" className="box-image" />
              <div className="overlay-text">Orders</div>
              {/* <IonButton className='full-link' onClick={() => handleNavigation("/orders")}>Orders</IonButton> */}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
      <IonFooter className='footer'>
        <IonText>Contact Us: 9010203040</IonText>
        <IonText>Email: abc@gmail.com</IonText>
      </IonFooter>
      
      <IonModal isOpen={showLogin} onDidDismiss={() => setShowLogin(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Login</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonItem>
            <IonLabel position="floating">Username</IonLabel>
            <IonInput></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Password</IonLabel>
            <IonInput type="password"></IonInput>
          </IonItem>
          <IonButton expand="full" onClick={() => {
            // Perform login logic here
            setIsLoggedIn(true);
            setShowLogin(false);
          }}>Login</IonButton>
          <IonButton expand="full" color="light" onClick={() => setShowLogin(false)}>Cancel</IonButton>
        </IonContent>
      </IonModal>
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
      />
    </IonPage>
  );
};

export default Home;