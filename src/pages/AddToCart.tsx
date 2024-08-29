
import {
  IonHeader,
  IonPage,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonTitle,
  IonText,
  IonFooter,
  IonToast
} from "@ionic/react";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import './AddToCart.css';

interface RouteState {
  pharmacyName?: string;
}

const AddToCart: React.FC = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [pharmacyName, setPharmacyName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [patientName, setPatientName] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [gstRate, setGstRate] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const location = useLocation();
  const state = location.state as RouteState | undefined;
  const initialPharmacyName = state?.pharmacyName || '';

  useEffect(() => {
    setPharmacyName(initialPharmacyName);
  }, [initialPharmacyName]);

  useEffect(() => {
    const fetchCartItems = () => {
      if (pharmacyName) {
        const storedCartItems = localStorage.getItem(`cartItems_${pharmacyName}`);
        
        if (storedCartItems) {
          try {
            const parsedItems = JSON.parse(storedCartItems);
            if (Array.isArray(parsedItems)) {
              const itemsWithDiscount = parsedItems.map(item => ({
                ...item,
                discount: item.discount || 0
              }));
              setCartItems(itemsWithDiscount);
            } else {
              console.error("Cart items format is incorrect.");
            }
          } catch (e) {
            console.error("Error parsing cart items:", e);
          }
        }
      }
    };

    fetchCartItems();
  }, [pharmacyName]);

  const applyDiscount = (price: number, discount: number) => {
    return price - (price * discount / 100);
  };

  const calculateTotal = (items: any[], withDiscount: boolean) =>
    items.reduce((total, item) => {
      const price = withDiscount ? applyDiscount(item.price, item.discount) : item.price;
      return total + price * item.quantity;
    }, 0);

  const cartItemsByType = (type: string) =>
    cartItems.filter(item => item.type === type);

  const medicinesTotalWithDiscount = calculateTotal(cartItemsByType("medicines"), true);
  const generalItemsTotalWithDiscount = calculateTotal(cartItemsByType("general_items"), true);

  const handleSave = () => {
    const key=`cartItems_${pharmacyName}`
    const orderCode = `ORD-${Date.now()}`; // Create a unique order code
    const order = {
      orderCode,
      patientName,
      doctorName,
      pharmacyName,
      gstNo,
      gstRate,
      date: new Date().toLocaleDateString(),
      items: cartItems,
      total: medicinesTotalWithDiscount + (medicinesTotalWithDiscount * gstRate / 100) + generalItemsTotalWithDiscount + (generalItemsTotalWithDiscount * gstRate / 100),
    };

    // Fetch existing orders from local storage
    const storedOrders = JSON.parse(localStorage.getItem(`orders_${pharmacyName}`) || '[]');
    
    // Add the new order to the stored orders
    storedOrders.push(order);
    
    // Save back to local storage
    localStorage.setItem(`orders_${pharmacyName}`, JSON.stringify(storedOrders));
    console.log(storedOrders)
    setToastMessage("Order saved successfully.");
    localStorage.removeItem(key);
    setShowToast(true);
  };

const generatePDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(12);
  doc.setFont('Helvetica', 'normal');

  // Header
  doc.text(`Pharmacy Name: ${pharmacyName}`, 10, 10);
  doc.text(`Dr. Name: ${doctorName}`, 10, 20);
  doc.text(`Patient Name: ${patientName}`, 10, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 40);
  doc.text(`GST No: ${gstNo}`, 10, 50);
  doc.text('----------------------------------------', 10, 60);

  // Medicines Table
  let y = 70;
  doc.setFontSize(10);
  doc.text('Medicines', 10, y);
  y += 10;
  
  // Header Row
  doc.text('S.No', 10, y);
  doc.text('Name', 30, y);
  doc.text('Quantity', 80, y);
  doc.text('Batch No', 110, y);
  doc.text('Price', 140, y);
  doc.text('Discount', 170, y);
  y += 10;

  // Item Rows
  cartItemsByType("medicines").forEach((item, index) => {
    doc.text(`${index + 1}`, 10, y);
    doc.text(item.name, 30, y);
    doc.text(`${item.quantity}`, 80, y);
    doc.text(item.batch_no, 110, y);
    doc.text(`${item.price} ₹`, 140, y);
    doc.text(`${item.discount}%`, 170, y);
    y += 10;
  });

  // Medicines Total
  doc.text('----------------------------------------', 10, y);
  y += 10;
  doc.text(`Total: ${medicinesTotalWithDiscount} ₹`, 10, y);
  y += 10;
  doc.text(`GST: ${gstRate} %`, 10, y);
  y += 10;
  doc.text(`Final Total: ${medicinesTotalWithDiscount + (medicinesTotalWithDiscount * gstRate / 100)} ₹`, 10, y);

  // General Items Table
  y += 20;
  doc.text('General Items', 10, y);
  y += 10;

  // Header Row
  doc.text('S.No', 10, y);
  doc.text('Name', 30, y);
  doc.text('Quantity', 80, y);
  doc.text('Price', 110, y);
  doc.text('Discount', 140, y);
  y += 10;

  // Item Rows
  cartItemsByType("general_items").forEach((item, index) => {
    doc.text(`${index + 1}`, 10, y);
    doc.text(item.name, 30, y);
    doc.text(`${item.quantity}`, 80, y);
    doc.text(`${item.price} ₹`, 110, y);
    doc.text(`${item.discount}%`, 140, y);
    y += 10;
  });

  // General Items Total
  doc.text('----------------------------------------', 10, y);
  y += 10;
  doc.text(`Total: ${generalItemsTotalWithDiscount} ₹`, 10, y);
  y += 10;
  doc.text(`GST: ${gstRate} %`, 10, y);
  y += 10;
  doc.text(`Grand Total: ${generalItemsTotalWithDiscount + (generalItemsTotalWithDiscount * gstRate / 100) + medicinesTotalWithDiscount + (medicinesTotalWithDiscount * gstRate / 100)} ₹`, 10, y);

  return doc;
};


  const handlePrint = () => {
    const doc = generatePDF();
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  const handleShare = () => {
    const doc = generatePDF();
    const pdfBlob = doc.output('blob');
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File([pdfBlob], 'receipt.pdf', { type: 'application/pdf' }));

    if (navigator.share) {
        navigator.share({
            title: 'Receipt',
            files: dataTransfer.files
        }).then(() => {
            setToastMessage("Shared successfully.");
            setShowToast(true);
        }).catch((error) => {
            console.error("Error sharing:", error);
            setToastMessage("Sharing failed.");
            setShowToast(true);
        });
    } else {
        setToastMessage("Web Share API not supported.");
        setShowToast(true);
    }
};


  const handleRemove = (index: number) => {
    const updatedCartItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCartItems);
    localStorage.setItem(`cartItems_${pharmacyName}`, JSON.stringify(updatedCartItems));
  };

  return (
    <IonPage>
      <IonHeader className='headercls'>
        <IonTitle>Cart</IonTitle>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem className="itemcls">
          <IonLabel className="labelcls">Pharmacy Name:</IonLabel>
          <IonInput value={pharmacyName} onIonChange={(e) => setPharmacyName(e.detail.value as string)} />
        </IonItem>
        <IonItem className="itemcls">
          <IonLabel className="labelcls">Dr. Name:</IonLabel>
          <IonInput value={doctorName} onIonChange={(e) => setDoctorName(e.detail.value as string)} />
        </IonItem>
        <IonItem className="itemcls">
          <IonLabel className="labelcls">Patient Name:</IonLabel>
          <IonInput value={patientName} onIonChange={(e) => setPatientName(e.detail.value as string)} />
        </IonItem>
        <IonItem className="itemcls">
          <IonLabel className="labelcls">Date:</IonLabel>
          <IonText className="date-text">{new Date().toLocaleDateString()}</IonText>
        </IonItem>
        <IonItem className="itemcls">
          <IonLabel className="labelcls">GST No:</IonLabel>
          <IonInput value={gstNo} onIonChange={(e) => setGstNo(e.detail.value as string)} />
        </IonItem>

        <div className="items-section">
          <div className="section-header">
            <IonLabel className="labelcls">Medicines</IonLabel>
          </div>
          <div className="header-row">
            <div className="header-cell">S.No</div>
            <div className="header-cell">Name</div>
            <div className="header-cell">Quantity</div>
            <div className="header-cell">Batch No</div>
            <div className="header-cell">Price</div>
            <div className="header-cell">Discount (%) / Price</div>
          </div>

          {cartItemsByType("medicines").length === 0 ? (
            <div className="no-items">
              <IonLabel className="labelcls">No items found</IonLabel>
            </div>
          ) : (
            <div className="items-list">
              {cartItemsByType("medicines").map((item, index) => (
                <div key={index} className="item-row">
                  <div className="item-cell">
                    {index + 1}
                    <IonButton
                      className="remove-button"
                      color="danger"
                      onClick={() => handleRemove(index)}
                    >
                      Remove
                    </IonButton>
                  </div>
                  <div className="item-cell">{item.name}</div>
                  <div className="item-cell">{item.quantity}</div>
                  <div className="item-cell">{item.batch_no}</div>
                  <div className="item-cell">{item.price} ₹</div>
                  <div className="item-cell">{item.discount}%</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="items-section">
          <div className="section-header">
            <IonLabel className="labelcls">General Items</IonLabel>
          </div>
          <div className="header-row">
            <div className="header-cell">S.No</div>
            <div className="header-cell">Name</div>
            <div className="header-cell">Quantity</div>
            <div className="header-cell">Price</div>
            <div className="header-cell">Discount (%) / Price</div>
          </div>

          {cartItemsByType("general_items").length === 0 ? (
            <div className="no-items">
              <IonLabel className="labelcls">No items found</IonLabel>
            </div>
          ) : (
            <div className="items-list">
              {cartItemsByType("general_items").map((item, index) => (
                <div key={index} className="item-row">
                  <div className="item-cell">
                    {index + 1}
                    <IonButton
                      className="remove-button"
                      color="danger"
                      onClick={() => handleRemove(index)}
                    >
                      Remove
                    </IonButton>
                  </div>
                  <div className="item-cell">{item.name}</div>
                  <div className="item-cell">{item.quantity}</div>
                  <div className="item-cell">{item.price} ₹</div>
                  <div className="item-cell">{item.discount}%</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <IonFooter>
          <IonButton expand="full" onClick={handleSave}>
            Save
          </IonButton>
          <IonButton expand="full" onClick={handlePrint}>
            Print
          </IonButton>
          <IonButton expand="full" onClick={handleShare}>
            Share
          </IonButton>
        </IonFooter>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default AddToCart;
