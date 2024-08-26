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
  IonTitle,
  IonList,
  IonListHeader,
} from "@ionic/react";
import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import useSQLiteDB from "../composables/useSQLiteDB";

interface RouteState {
  pharmacyName: string;
}

const Search: React.FC = () => {
  const [searchType, setSearchType] = useState<"medicines" | "general_items">("medicines");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const inputRef = useRef<HTMLIonInputElement>(null);

  const location = useLocation();
  const history = useHistory();
  const state = location.state as RouteState | undefined;
  const pharmacyName = state?.pharmacyName || '';

  const { performSQLAction } = useSQLiteDB(pharmacyName);

  const navigateTo = (path: string) => {
    history.push({
      pathname: path,
      state: { pharmacyName },
    });
  };

  useEffect(() => {
    if (pharmacyName) {
      fetchAllItems();
    }
  }, [searchType, pharmacyName]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        searchItems();
      }
    };

    const inputElement = inputRef.current?.getInputElement();
    inputElement?.then((element) => {
      element?.addEventListener("keydown", handleKeyPress);
    });

    return () => {
      inputElement?.then((element) => {
        element?.removeEventListener("keydown", handleKeyPress);
      });
    };
  }, [searchText]);

  const fetchAllItems = async () => {
    await performSQLAction(async (db) => {
      if (db) {
        const query = `SELECT * FROM ${searchType}_${pharmacyName};`;
        const results = await db.query(query);
        setSearchResults(results?.values ?? []);
      }
    });
  };

  const searchItems = async () => {
    if (!searchText.trim()) {
      setToastMessage("Please enter a search term.");
      setShowToast(true);
      return;
    }

    await performSQLAction(async (db) => {
      if (db) {
        const query = `SELECT * FROM ${searchType}_${pharmacyName} WHERE name LIKE ?;`;
        const results = await db.query(query, [`%${searchText}%`]);
        const items = results?.values ?? [];

        if (items.length === 0) {
          setToastMessage("No results found.");
          setShowToast(true);
        }

        setSearchResults(items);
        setSuggestions([]);
      }
    });
  };

  const fetchSuggestions = async (text: string) => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    await performSQLAction(async (db) => {
      if (db) {
        const query = `SELECT name FROM ${searchType}_${pharmacyName} WHERE name LIKE ? LIMIT 5;`;
        const results = await db.query(query, [`${text}%`]);
        const items = results?.values ?? [];
        setSuggestions(items);
      }
    });
  };

  const addToCart = async (item: any, quantity: number) => {
    if (quantity <= 0 || quantity > item.quantity) {
      setToastMessage("Invalid quantity.");
      setShowToast(true);
      return;
    }

    const newItem = { ...item, quantity };
    const newQuantity = item.quantity - quantity;

    await performSQLAction(async (db) => {
      if (db) {
        await db.query(
          `UPDATE ${searchType}_${pharmacyName} SET quantity = ? WHERE id = ?;`,
          [newQuantity, item.id]
        );
      }
    });

    let cartItems = JSON.parse(localStorage.getItem(`cartItems_${pharmacyName}`) || "[]");

    newItem.type = searchType;
    cartItems.push(newItem);
    localStorage.setItem(`cartItems_${pharmacyName}`, JSON.stringify(cartItems));
    console.log(cartItems);
    setToastMessage("Item added to cart.");
    setShowToast(true);

    await searchItems();

    const inputElement = document.getElementById(`quantity-${item.id}`) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = "";
    }
  };

  const goToCart = () => {
    const path = `/add-to-cart/${pharmacyName.replace(/\s+/g, "_")}`;
    navigateTo(path);
  };

  return (
    <IonPage>
      <IonHeader className="pgcolor">
        <div className="hd-button">
          <IonTitle>Search</IonTitle>
          <IonButton shape="round" color="light" onClick={goToCart}>
            Cart
          </IonButton>
        </div>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonItem className="itemcls">
          <IonLabel className="labelcls">Type</IonLabel>
          <IonSelect
            value={searchType}
            onIonChange={(e) => setSearchType(e.detail.value as "medicines" | "general_items")}
          >
            <IonSelectOption value="medicines">Medicines</IonSelectOption>
            <IonSelectOption value="general_items">General Items</IonSelectOption>
          </IonSelect>
        </IonItem>
        <div className="form-container">
          <IonItem className="itemcls">
            <IonInput
              type="text"
              placeholder="Search by name"
              value={searchText}
              onIonInput={(e) => {
                const value = e.detail.value as string;
                setSearchText(value);
                fetchSuggestions(value);
              }}
              ref={inputRef}
            />
            <IonButton color="light" onClick={searchItems}>
              Search
            </IonButton>
          </IonItem>
        </div>
        {suggestions.length > 0 && (
          <IonList>
            <IonListHeader>
              <IonLabel>Searching for...</IonLabel>
            </IonListHeader>
            {suggestions.map((suggestion, index) => (
              <IonItem
                key={index}
                onClick={() => {
                  setSearchText(suggestion.name);
                  setSuggestions([]);
                  searchItems();
                }}
              >
                <IonLabel>{suggestion.name}</IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
        <div className="listcls">
          {searchResults.map((item) => (
            <div
              key={item.id}
              className="itemcls"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p>
                  <strong>Name:</strong> {item.name}
                </p>
                <p>
                  <strong>Type:</strong> {searchType}
                </p>
                <p>
                  <strong>Quantity:</strong> {item.quantity}
                </p>
                <p>
                  <strong>Expiry Date:</strong> {item.expiry_date}
                </p>
                <p>
                  <strong>Batch No:</strong> {item.batch_no}
                </p>
                <p>
                  <strong>Price:</strong> Rs. {item.price}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <IonInput
                  type="number"
                  placeholder="Quantity"
                  id={`quantity-${item.id}`}
                />
                <IonButton
                  color="light"
                  onClick={() => {
                    const inputElement = document.getElementById(
                      `quantity-${item.id}`
                    ) as HTMLInputElement;
                    const quantity = parseInt(inputElement.value, 10);
                    addToCart(item, quantity);
                  }}
                >
                  Add to Cart
                </IonButton>
              </div>
            </div>
          ))}
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

export default Search;
