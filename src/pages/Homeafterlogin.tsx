import React from 'react';
import { useLocation, useHistory } from 'react-router-dom'; // Import useHistory
import {
  IonContent,
  IonHeader,
  IonPage,
  IonButton,
  IonImg,
  IonGrid,
  IonRow,
  IonCol,
  IonFooter,
  IonText
} from '@ionic/react';
import { RouteState } from './types'; // Adjust the import path based on where you define your types
import './Homeafterlogin.css';

const Home: React.FC = () => {
  const location = useLocation();
  const history = useHistory(); // Initialize useHistory

  const state = location.state as RouteState | undefined;
  const pharmacyName = state?.pharmacyName || '';
  console.log(pharmacyName)
  const navigateTo = (path: string) => {
    history.push({
      pathname: path,
      state: { pharmacyName }
    });
  };
  const handlelogout = () => {
    localStorage.clear();
    // Redirect to login page or perform other logout actions
};




  return (
    <IonPage>
      <IonHeader className='pgcolor'>
        <div className="hd-button">
          <IonButton shape="round" color="light" onClick={handlelogout} routerLink='/home'>LogOut</IonButton>
          
        </div>
      </IonHeader>
      <IonContent fullscreen className='pgcolor'>
        <IonGrid className="custom-grid">
          <IonRow className='custom-row'>
            <IonCol className="custom-col">
              <IonImg  onClick={() => navigateTo(`/add/${pharmacyName}`)} src="https://images.pexels.com/photos/593451/pexels-photo-593451.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" className="box-image"/>
              <div className="overlay-text">Add</div>
              {/* <IonButton expand="full" onClick={() => navigateTo(/add/${pharmacyName})}>Add Medicine</IonButton> */}
            </IonCol>
            <IonCol className="custom-col">
              
              <IonImg onClick={() => navigateTo(`/search/${pharmacyName}`)} src="https://images.pexels.com/photos/593451/pexels-photo-593451.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" className="box-image"/>
              <div className="overlay-text">Search</div>
              {/* <IonButton expand="full" onClick={() => navigateTo(/search/${pharmacyName})}>Search Medicines</IonButton> */}
            </IonCol>
          </IonRow>
          <IonRow className='custom-row'>
            <IonCol className="custom-col">
              <IonImg onClick={() => navigateTo(`/accounting/${pharmacyName.replace(/\s+/g, '_')}`)} src="https://images.pexels.com/photos/593451/pexels-photo-593451.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" className="box-image"/>
              <div className="overlay-text">Accounting</div>
              {/* <IonButton expand="full" onClick={() => navigateTo(/accounting/${pharmacyName.replace(/\s+/g, '_')})}>Accounting</IonButton> */}
            </IonCol>
            <IonCol className="custom-col">
              <IonImg  onClick={() => navigateTo(`/orders/${pharmacyName.replace(/\s+/g, '_')}`)} src="https://images.pexels.com/photos/593451/pexels-photo-593451.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" className="box-image"/>
              <div className="overlay-text">Orders</div>
              {/* <IonButton expand="full" onClick={() => navigateTo(/orders/${pharmacyName.replace(/\s+/g, '_')})}>Orders</IonButton> */}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
      <IonFooter className='footer'>
        <IonText>Contact Us : 9010203040</IonText>
        <IonText>Email : {pharmacyName.replace(/\s+/g, '_')}@gmail.com</IonText>
      </IonFooter>
    </IonPage>
  );
};

export default Home;