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
import 'jspdf-autotable';
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
    const doc = generatePDF();
    doc.save("receipt.pdf");
    setToastMessage("Saved successfully.");
    setShowToast(true);
  };

  // Generate PDF function with correct usage of autoTable and lastAutoTable
const generatePDF = () => {
  const doc = new jsPDF();

  // Add header
  doc.setFontSize(16);
  doc.text('Receipt', 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Pharmacy Name: ${pharmacyName}`, 14, 30);
  doc.text(`Dr. Name: ${doctorName}`, 14, 40);
  doc.text(`Patient Name: ${patientName}`, 14, 50);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 60);
  doc.text(`GST No: ${gstNo}`, 14, 70);

  // Add Medicines Table
  doc.setFontSize(14);
  doc.text('Medicines', 14, 85);

  doc.autoTable({
    startY: 90,
    head: [['S.No', 'Name', 'Quantity', 'Batch No', 'Price', 'Discount (%)']],
    body: cartItemsByType("medicines").map((item, index) => [
      index + 1,
      item.name,
      item.quantity,
      item.batch_no,
      `${item.price} ₹`,
      `${item.discount}%`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [0, 0, 255], textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
    margin: { top: 20 },
  });

  // The correct way to access lastAutoTable
  let y = doc.autoTable.previous.finalY + 10;
  doc.text(`Total: ${medicinesTotalWithDiscount} ₹`, 14, y);
  y += 10;
  doc.text(`GST: ${gstRate} %`, 14, y);
  y += 10;
  doc.text(`Final Total: ${medicinesTotalWithDiscount + (medicinesTotalWithDiscount * gstRate / 100)} ₹`, 14, y);

  // Add General Items Table
  y += 20;
  doc.setFontSize(14);
  doc.text('General Items', 14, y);

  doc.autoTable({
    startY: y + 10,
    head: [['S.No', 'Name', 'Quantity', 'Price', 'Discount (%)']],
    body: cartItemsByType("general_items").map((item, index) => [
      index + 1,
      item.name,
      item.quantity,
      `${item.price} ₹`,
      `${item.discount}%`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [0, 150, 0], textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
    margin: { top: 20 },
  });

  y = doc.autoTable.previous.finalY + 10;
  doc.text(`Total: ${generalItemsTotalWithDiscount} ₹`, 14, y);
  y += 10;
  doc.text(`GST: ${gstRate} %`, 14, y);
  y += 10;
  doc.text(`Grand Total: ${generalItemsTotalWithDiscount + (generalItemsTotalWithDiscount * gstRate / 100) + medicinesTotalWithDiscount + (medicinesTotalWithDiscount * gstRate / 100)} ₹`, 14, y);

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
        <IonItem className="itemcls">
          <IonLabel className="labelcls">GST Rate:</IonLabel>
          <IonInput type="number" value={gstRate} onIonChange={(e) => setGstRate(Number(e.detail.value))} />
        </IonItem>
        <IonItem className="itemcls">
          <IonLabel className="labelcls">Medicines:</IonLabel>
        </IonItem>
        {cartItemsByType("medicines").map((item, index) => (
          <IonItem key={index}>
            <IonLabel>{item.name} - {item.quantity} - {item.price} ₹ - {item.discount}%</IonLabel>
            <IonButton onClick={() => handleRemove(index)}>Remove</IonButton>
          </IonItem>
        ))}
        <IonItem className="itemcls">
          <IonLabel className="labelcls">General Items:</IonLabel>
        </IonItem>
        {cartItemsByType("general_items").map((item, index) => (
          <IonItem key={index}>
            <IonLabel>{item.name} - {item.quantity} - {item.price} ₹ - {item.discount}%</IonLabel>
            <IonButton onClick={() => handleRemove(index)}>Remove</IonButton>
          </IonItem>
        ))}
        <IonFooter>
          <IonButton expand="full" onClick={handleSave}>Save</IonButton>
          <IonButton expand="full" onClick={handlePrint}>Print</IonButton>
          <IonButton expand="full" onClick={handleShare}>Share</IonButton>
        </IonFooter>
      </IonContent>
      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={2000}
        onDidDismiss={() => setShowToast(false)}
      />
    </IonPage>
  );
};

export default AddToCart;
