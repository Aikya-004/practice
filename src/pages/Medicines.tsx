import {
  IonHeader,
  IonPage,
  IonContent,
  IonItem,
  IonButton,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonFooter,
  IonText,
  IonToolbar,
  IonTitle
} from "@ionic/react";
import React, { useState, useEffect } from "react";
import useSQLiteDB from "../composables/useSQLiteDB";
import { useLocation, useHistory } from "react-router-dom";
import './Medicines.css';

// Define an interface for route state
interface RouteState {
  pharmacyName: string;
}

const Medicines: React.FC = () => {
  const [inputName, setInputName] = useState("");
  const [inputType, setInputType] = useState("");
  const [inputQuantity, setInputQuantity] = useState("");
  const [inputExpiryDate, setInputExpiryDate] = useState("");
  const [inputBatchNo, setInputBatchNo] = useState("");
  const [inputPrice, setInputPrice] = useState<number | undefined>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Use the RouteState interface to type the location state
  const location = useLocation<RouteState>();
  const history = useHistory();
  const pharmacyName = location.state?.pharmacyName || '';

  // Initialize useSQLiteDB with pharmacyName
  const { performSQLAction, initialized } = useSQLiteDB(pharmacyName);

  useEffect(() => {
    if (initialized) {
      deleteExpiredMedicines();
    }
  }, [initialized]);

  const validateInputs = () => {
    const currentDate = new Date().toISOString().split('T')[0];

    if (!inputName) {
      setToastMessage("Name is required");
      setShowToast(true);
      return false;
    }
    if (!inputType) {
      setToastMessage("Type is required");
      setShowToast(true);
      return false;
    }
    if (!inputQuantity) {
      setToastMessage("Quantity is required");
      setShowToast(true);
      return false;
    }
    if (!inputExpiryDate) {
      setToastMessage("Expiry Date is required");
      setShowToast(true);
      return false;
    }
    if (inputExpiryDate < currentDate) {
      setToastMessage("Expiry Date cannot be in the past");
      setShowToast(true);
      return false;
    }
    if (!inputBatchNo) {
      setToastMessage("Batch No is required");
      setShowToast(true);
      return false;
    }
    if (inputPrice === undefined || inputPrice <= 0) {
      setToastMessage("Price must be a positive number");
      setShowToast(true);
      return false;
    }
    return true;
  };

  const addItem = async () => {
    if (!validateInputs()) return;

    const tableName = `medicines_${pharmacyName}`;

    await performSQLAction(async (db) => {
      await db?.query(
        `INSERT INTO ${tableName} (name, type, quantity, expiry_date, batch_no, price) VALUES (?, ?, ?, ?, ?, ?);`,
        [inputName, inputType, inputQuantity, inputExpiryDate, inputBatchNo, inputPrice]
      );
      resetInputs();
      setToastMessage("Medicine added successfully!");
      setShowToast(true);
    });
  };

  const resetInputs = () => {
    setInputName("");
    setInputType("");
    setInputQuantity("");
    setInputExpiryDate("");
    setInputBatchNo("");
    setInputPrice(undefined);
  };

  const deleteExpiredMedicines = async () => {
    await performSQLAction(async (db) => {
      const currentDate = new Date().toISOString().split('T')[0];
      const tableName = `medicines_${pharmacyName}`;
      await db?.query(
        `DELETE FROM ${tableName} WHERE expiry_date < ?;`,
        [currentDate]
      );
    });
  };

  const viewMedicines = () => {
    history.push({
      pathname: `/view/${pharmacyName}`,
      state: { pharmacyName }
    });
  };

  return (
    <IonPage>
      <IonHeader className="headerclass">
        
          <IonTitle>Add Medicines</IonTitle>
        
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="form-container">
          <IonItem className="form-item">
            <IonLabel>Name</IonLabel>
            <IonInput
              value={inputName}
              onIonInput={(e) => setInputName(e.target.value as string)}
            />
          </IonItem>
          <IonItem className="form-item">
            <IonLabel>Type</IonLabel>
            <IonSelect
              value={inputType}
              placeholder="Select Type"
              onIonChange={(e) => setInputType(e.detail.value as string)}
            >
              <IonSelectOption value="Tablet">Tablet</IonSelectOption>
              <IonSelectOption value="Syrup">Syrup</IonSelectOption>
              <IonSelectOption value="Ointment">Ointment</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem className="form-item">
            <IonLabel>Quantity</IonLabel>
            <IonInput
              type="number"
              value={inputQuantity}
              onIonInput={(e) => setInputQuantity(e.target.value as string)}
            />
          </IonItem>
          <IonItem className="form-item">
            <IonLabel>Expiry Date</IonLabel>
            <IonInput
              type="date"
              value={inputExpiryDate}
              onIonInput={(e) => setInputExpiryDate(e.target.value as string)}
            />
          </IonItem>
          <IonItem className="form-item">
            <IonLabel>Batch No</IonLabel>
            <IonInput
              value={inputBatchNo}
              onIonInput={(e) => setInputBatchNo(e.target.value as string)}
            />
          </IonItem>
          <IonItem className="form-item">
            <IonLabel>Price</IonLabel>
            <IonInput
              type="number"
              value={inputPrice}
              onIonInput={(e) => setInputPrice(parseFloat(e.target.value as string))}
            />
          </IonItem>
          <IonButton expand="full" onClick={addItem}>Add Medicine</IonButton>
          <IonButton expand="full" onClick={viewMedicines} color="light">View Medicines</IonButton>
          <IonToast
            isOpen={showToast}
            message={toastMessage}
            duration={3000}
            onDidDismiss={() => setShowToast(false)}
          />
        </div>
      </IonContent>
      <IonFooter className="footer">
        <IonText>Contact Us : 9010203040</IonText>
        <IonText>Email : abc@gmail.com</IonText>
      </IonFooter>
    </IonPage>
  );
};

export default Medicines;