import React, { useState, useEffect, useMemo } from "react";
import {
  IonHeader,
  IonPage,
  IonContent,
  IonItem,
  IonLabel,
  IonTitle,
  IonList,
  IonText,
  IonButton,
  IonToast
} from "@ionic/react";
import { useLocation } from 'react-router-dom';
import './orders.css';

interface RouteState {
  pharmacyName?: string;
}

const Orders: React.FC = () => {
  const [pharmacyName, setPharmacyName] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const location = useLocation();
  const state = location.state as RouteState | undefined;
  const initialPharmacyName = state?.pharmacyName || '';

  useEffect(() => {
    if (initialPharmacyName) {
      setPharmacyName(initialPharmacyName);
    }
  }, [initialPharmacyName]);

  useEffect(() => {
    if (pharmacyName) {
      const fetchOrders = () => {
        const storedOrders = JSON.parse(localStorage.getItem(`orders_${pharmacyName}`) || '[]');
        if (Array.isArray(storedOrders)) {
          setOrders(storedOrders);
        } else {
          console.error("Orders format is incorrect.");
        }
      };
      fetchOrders();
    }
  }, [pharmacyName]);

  const handleDeleteOrder = (orderCode: string) => {
    const updatedOrders = orders.filter(order => order.orderCode !== orderCode);
    setOrders(updatedOrders);
    localStorage.setItem(`orders_${pharmacyName}`, JSON.stringify(updatedOrders));
    setToastMessage("Order deleted successfully.");
    setShowToast(true);
  };

  const renderedOrders = useMemo(() => {
    return orders.map((order, index) => (
      <IonItem key={index} className="order-item">
        <IonLabel>
          <h2>Order Code: {order.orderCode}</h2>
          <p>Patient Name: {order.patientName}</p>
          <p>Total: {order.total.toFixed(2)} ₹</p>
          <p>Date: {order.date}</p>
          <p>GST No: {order.gstNo}</p>
          <p>GST Rate: {order.gstRate} %</p>
          <h3>Items:</h3>
          {order.items && order.items.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, itemIndex: number) => (
                  <tr key={itemIndex}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price.toFixed(2)} ₹</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No items in this order.</p>
          )}
        </IonLabel>
        <IonButton slot="end" color="danger" onClick={() => handleDeleteOrder(order.orderCode)}>Delete</IonButton>
      </IonItem>
    ));
  }, [orders]);

  return (
    <IonPage>
      <IonHeader className="headercls">
        <IonTitle>Orders</IonTitle>
      </IonHeader>
      <IonContent className="ion-padding">
        {orders.length > 0 ? (
          <IonList>
            {renderedOrders}
          </IonList>
        ) : (
          <IonText>No orders found.</IonText>
        )}
      </IonContent>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
      />
    </IonPage>
  );
};

export default Orders;
