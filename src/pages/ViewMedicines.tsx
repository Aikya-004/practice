import {
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonContent,
  IonItem,
  IonButton,
  IonLabel,
  IonInput,
  IonCol,
  IonRow,
  IonGrid,
  IonFooter
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import useSQLiteDB from "../composables/useSQLiteDB";
import useConfirmationAlert from "../composables/useConfirmationAlert";

type MedicineItem = {
  id: number;
  name: string;
  type: string;
  quantity: string;
  expiry_date: string;
  batch_no: string;
  price: number;
};

interface RouteState {
  pharmacyName: string;
}

const ViewMedicines: React.FC = () => {
  const location = useLocation();
  const pharmacyName = (location.state as RouteState)?.pharmacyName || '';
  const [items, setItems] = useState<Array<MedicineItem>>([]);
  // const [expiredItems, setExpiredItems] = useState<Array<MedicineItem>>([]);
  const [editItem, setEditItem] = useState<MedicineItem | undefined>();
  const [inputName, setInputName] = useState("");
  const [inputType, setInputType] = useState("");
  const [inputQuantity, setInputQuantity] = useState("");
  const [inputExpiryDate, setInputExpiryDate] = useState("");
  const [inputBatchNo, setInputBatchNo] = useState("");
  const [inputPrice, setInputPrice] = useState<number | undefined>();

  const { performSQLAction, initialized } = useSQLiteDB(pharmacyName);
  const { showConfirmationAlert, ConfirmationAlert } = useConfirmationAlert();

  useEffect(() => {
    if (initialized) {
      loadData();
    }
  }, [initialized, pharmacyName]);

  const loadData = async () => {
    try {
      await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        if (db) {
          const currentDate = new Date().toISOString().split('T')[0];
          const formattedName = pharmacyName.replace(/\s+/g, '_').toLowerCase();

          const respSelect = await db.query(`SELECT * FROM medicines_${formattedName}`);
          const allItems = respSelect?.values || [];

          const nonExpiredItems = allItems.filter((item: MedicineItem) => item.expiry_date >= currentDate);
          const expiredItems = allItems.filter((item: MedicineItem) => item.expiry_date < currentDate);

          setItems(nonExpiredItems);
          await db.query(`DELETE FROM medicines_${formattedName} WHERE expiry_date < ?;`, [currentDate]);
        }
      });
    } catch (error) {
      console.error("Error loading data:", error);
      setItems([]);
    }
  };

  

  const updateItem = async () => {
    try {
      await performSQLAction(
        async (db: SQLiteDBConnection | undefined) => {
          if (!db) {
            throw new Error("Database connection is not available");
          }
          const formattedName = pharmacyName.replace(/\s+/g, '_').toLowerCase();
  
          // Ensure the table name is dynamically formatted
          const tableName = `medicines_${formattedName}`;
  
          // Use the run method for update operations
          await db.run(
            `UPDATE ${tableName} SET name=?, type=?, quantity=?, expiry_date=?, batch_no=?, price=? WHERE id=?`,
            [
              inputName,
              inputType,
              inputQuantity,
              inputExpiryDate,
              inputBatchNo,
              inputPrice,
              editItem?.id,
            ]
          );
  
          // Optionally, fetch and update items after the update
          const respSelect = await db.query(`SELECT * FROM ${tableName};`);
          setItems(respSelect?.values || []);
        },
        async () => {
          resetInputs();
        }
      );
    } catch (error) {
      alert((error as Error).message);
    }
  };
  

  const deleteItem = async (itemId: number) => {
    try {
      await performSQLAction(
        async (db: SQLiteDBConnection | undefined) => {
          if (!db) {
            throw new Error("Database connection is not available");
          }
          const formattedName = pharmacyName.replace(/\s+/g, '_').toLowerCase();
          const tableName = `medicines_${formattedName}`;
  
          // Use the run method for delete operations
          await db.run(
            `DELETE FROM ${tableName} WHERE id=?`,
            [itemId]
          );
  
          // Optionally, fetch and update items after deletion
          const respSelect = await db.query(`SELECT * FROM ${tableName};`);
          setItems(respSelect?.values || []);
        },
        async () => {
          resetInputs();
        }
      );
    } catch (error) {
      alert((error as Error).message);
    }
  };
  

  const confirmDelete = (itemId: number) => {
    showConfirmationAlert(
      "Are you sure you want to delete this item?",
      async () => {
        try {
          await deleteItem(itemId);
        } catch (error) {
          console.error("Error confirming delete:", error);
        }
      }
    );
  };

  const doEditItem = (item: MedicineItem | undefined) => {
    if (item) {
      setEditItem(item);
      setInputName(item.name);
      setInputType(item.type);
      setInputQuantity(item.quantity);
      setInputExpiryDate(item.expiry_date);
      setInputBatchNo(item.batch_no);
      setInputPrice(item.price);
    } else {
      resetInputs();
    }
  };

  const resetInputs = () => {
    setEditItem(undefined);
    setInputName("");
    setInputType("");
    setInputQuantity("");
    setInputExpiryDate("");
    setInputBatchNo("");
    setInputPrice(undefined);
  };

  const formattedPharmacyName = pharmacyName.replace(/\s+/g, '_');

  return (
    <IonPage>
      <IonHeader className='headercls'>
       
          <IonTitle>View Medicines</IonTitle>
        
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonGrid>
          <IonRow className='titles'>
            <IonCol className='tablecol'>S.No</IonCol>
            <IonCol className='tablecol'>Name</IonCol>
            <IonCol className='tablecol'>Type</IonCol>
            <IonCol className='tablecol'>Quantity</IonCol>
            <IonCol className='tablecol'>Expiry Date</IonCol>
            <IonCol className='tablecol'>Batch No</IonCol>
            <IonCol className='tablecol'>Price</IonCol>
            <IonCol className='tablecol'>Edit</IonCol>
            <IonCol className='tablecol'>Delete</IonCol>
          </IonRow>
          {items.map((item, index) => (
            <IonRow key={item.id}>
              <IonCol className='tablecol'>{index + 1}</IonCol>
              <IonCol className='tablecol'>{item.name}</IonCol>
              <IonCol className='tablecol'>{item.type}</IonCol>
              <IonCol className='tablecol'>{item.quantity}</IonCol>
              <IonCol className='tablecol'>{item.expiry_date}</IonCol>
              <IonCol className='tablecol'>{item.batch_no}</IonCol>
              <IonCol className='tablecol'>{item.price}</IonCol>
              <IonCol className='tablecol'>
                <IonButton color="light" onClick={() => doEditItem(item)}>EDIT</IonButton>
              </IonCol>
              <IonCol className='tablecol'>
                <IonButton color="light" onClick={() => confirmDelete(item.id)}>DELETE</IonButton>
              </IonCol>
            </IonRow>
          ))}
        </IonGrid>

        {editItem && (
          <>
            <IonItem className="itemcls">
              <IonLabel className="labelcls">Name</IonLabel>
              <IonInput
                type="text"
                value={inputName}
                onIonChange={(e) => setInputName(e.detail.value as string)}
              />
            </IonItem>
            <IonItem className="itemcls">
              <IonLabel className="labelcls">Type</IonLabel>
              <IonInput
                type="text"
                value={inputType}
                onIonChange={(e) => setInputType(e.detail.value as string)}
              />
            </IonItem>
            <IonItem className="itemcls">
              <IonLabel className="labelcls">Quantity</IonLabel>
              <IonInput
                type="text"
                value={inputQuantity}
                onIonChange={(e) => setInputQuantity(e.detail.value as string)}
              />
            </IonItem>
            <IonItem className="itemcls">
              <IonLabel className="labelcls">Expiry Date</IonLabel>
              <IonInput
                type="text"
                value={inputExpiryDate}
                onIonChange={(e) => setInputExpiryDate(e.detail.value as string)}
              />
            </IonItem>
            <IonItem className="itemcls">
              <IonLabel className="labelcls">Batch No</IonLabel>
              <IonInput
                type="text"
                value={inputBatchNo}
                onIonChange={(e) => setInputBatchNo(e.detail.value as string)}
              />
            </IonItem>
            <IonItem className="itemcls">
              <IonLabel className="labelcls">Price</IonLabel>
              <IonInput
                type="number"
                value={inputPrice}
                onIonChange={(e) => setInputPrice(parseFloat(e.detail.value as string))}
              />
            </IonItem>
            <IonButton expand="full" onClick={updateItem}>Update Item</IonButton>
          </>
        )}

        <IonFooter>
          <IonButton expand="full" color="primary" onClick={loadData}>Refresh</IonButton>
        </IonFooter>

        {ConfirmationAlert}
      </IonContent>
    </IonPage>
  );
};

export default ViewMedicines;
