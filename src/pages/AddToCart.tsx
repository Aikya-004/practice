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
              setCartItems(parsedItems);
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
      const price = withDiscount ? applyDiscount(item.price, item.discount || 0) : item.price;
      return total + price * item.quantity;
    }, 0);

  const cartItemsByType = (type: string) =>
    cartItems.filter(item => item.type === type);

  const handleQuantityChange = (index: number, value: number, type: string) => {
    const updatedItems = [...cartItems];
    const itemTypeIndex = updatedItems.findIndex(item => item.type === type && cartItemsByType(type).indexOf(item) === index);

    if (itemTypeIndex !== -1) {
        updatedItems[itemTypeIndex].quantity = value;
        setCartItems(updatedItems);
        localStorage.setItem(`cartItems_${pharmacyName}`, JSON.stringify(updatedItems));
    }
};
  const handleDiscountChange = (index: number, value: number, type: string) => {
    const updatedItems = [...cartItems];
    const itemTypeIndex = updatedItems.findIndex(item => item.type === type && cartItemsByType(type).indexOf(item) === index);
    
    if (itemTypeIndex !== -1) {
        updatedItems[itemTypeIndex].discount = value;
        setCartItems(updatedItems);
        localStorage.setItem(`cartItems_${pharmacyName}`, JSON.stringify(updatedItems));
    }
};

  const medicinesTotal = calculateTotal(cartItemsByType("medicines"), true);
  const generalItemsTotal = calculateTotal(cartItemsByType("general_items"), true);
  // const medicinesTotal = calculateTotal(cartItemsByType("medicines"));
  //   const generalItemsTotal = calculateTotal(cartItemsByType("generalItems"));
  const gstAmount = (medicinesTotal + generalItemsTotal) * gstRate / 100;
  const twoTotal=medicinesTotal + generalItemsTotal

    const finalTotal = medicinesTotal + generalItemsTotal + gstAmount;

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
      total: medicinesTotal + (medicinesTotal * gstRate / 100) + generalItemsTotal + (generalItemsTotal * gstRate / 100),
    };

    // Fetch existing orders from local storage
    const storedOrders = JSON.parse(localStorage.getItem(`orders_${pharmacyName}`) || '[]');
    
    // Add the new order to the stored orders
    storedOrders.push(order);
    
    // Save back to local storage
    localStorage.setItem(`orders_${pharmacyName}`, JSON.stringify(storedOrders));
    setToastMessage("Order saved successfully.");
    localStorage.removeItem(key);
    setShowToast(true);
  };

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
    doc.text(`Medicine Total: ${medicinesTotal} ₹`, 14, y);
    y += 10;
    
  
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
    doc.text(`General Items Total: ${generalItemsTotal}₹`, 14, y);
    y += 10;
    let total=generalItemsTotal+medicinesTotal
    doc.text(` Total: ${total}`, 14, y);
    y +=10;
    doc.text(`GST: ${gstRate} %`, 14, y);
    y += 10;
    doc.text(`Grand Total: ${generalItemsTotal + (generalItemsTotal * gstRate / 100) + medicinesTotal + (medicinesTotal * gstRate / 100)} ₹`, 14, y);
  
    return doc;
  };
  const handlePrint = () => {
    try {
      const doc = generatePDF();
      doc.autoPrint();
      const pdfOutput = doc.output('bloburl');
      console.log("PDF Output URL:", pdfOutput);
      window.open(pdfOutput, '_blank');
    } catch (error) {
      console.error('Error during PDF generation or print:', error);
    }
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
      <IonHeader className='headerclass'>
        <IonTitle>Cart</IonTitle>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem className="itemcls">
          <IonLabel className="labelcls">Pharmacy Name:</IonLabel>
          <IonInput value={pharmacyName} readonly />
        </IonItem>
        <IonItem className="itemcls">
          <IonLabel className="labelcls">Doctor Name:</IonLabel>
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
            <div className="header-cell">Discount (%)</div>
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
    <div className="item-cell"><IonInput
        type="number"
        value={item.quantity}
        onIonChange={(e) => handleQuantityChange(index, parseInt(e.detail.value as string), "medicines")}
      /></div>
    <div className="item-cell">{item.batch_no}</div>
    <div className="item-cell">{item.price} ₹</div>
    <div className="item-cell">
      <IonInput
        type="number"
        value={item.discount || 0}
        onIonChange={(e) => handleDiscountChange(index, parseFloat(e.detail.value as string), "medicines")}
      />
    </div>
  </div>
))}
            </div>
          )}
        <div className="total-row">
            <IonLabel className="labelcls">Total:</IonLabel>
            <IonText className="total-amount">{medicinesTotal} ₹</IonText>
          </div>
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
            <div className="header-cell">Discount (%)</div>
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
    <div className="item-cell"><IonInput
        type="number"
        value={item.quantity}
        onIonChange={(e) => handleQuantityChange(index, parseInt(e.detail.value as string), "general_items")}
      /></div>
    <div className="item-cell">{item.price} ₹</div>
    <div className="item-cell">
      <IonInput
        type="number"
        value={item.discount || 0}
        onIonChange={(e) => handleDiscountChange(index, parseFloat(e.detail.value as string), "general_items")}
      />
    </div>
  </div>
))}
            </div>
          )}
        <div className="total-row">
                        <IonLabel className="labelcls">Total:</IonLabel>
                        <IonText className="total-amount">{generalItemsTotal} ₹</IonText>
                    </div>
        </div>
        <IonItem className="itemcls">
                    <IonLabel className="labelcls">Total:</IonLabel>
                    <IonText>{twoTotal} ₹</IonText>
                </IonItem>
        <IonItem className="itemcls">
                    <IonLabel className="labelcls">GST Rate (%)  : </IonLabel>
                    <IonInput
                        type="number"
                        value={gstRate}
                        onIonChange={(e) => setGstRate(Number(e.detail.value))}
                    />
                </IonItem>
                
        
                <IonItem className="itemcls">
                    <IonLabel className="labelcls">Grand Total:</IonLabel>
                    <IonText>{finalTotal} ₹</IonText>
                </IonItem>

        <div className="footer-actions">
          <IonButton className="buttoncls" onClick={handleSave}>Save</IonButton>
          <IonButton className="buttoncls" onClick={handlePrint}>Print</IonButton>
          <IonButton className="buttoncls" onClick={handleShare}>Share</IonButton>
        </div>

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