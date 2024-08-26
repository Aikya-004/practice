import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Medicines from './pages/Medicines'; // Import Medicines component
import GeneralItems from './pages/GeneralItems'; // Import GeneralItems component
import Add from './pages/Add'; // Import Add component
import AddToCart from './pages/AddToCart'; // Import AddToCart component
import ViewGeneralItems from './pages/ViewGeneralItems';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import './pages/AddToCart.css'; // Import AddToCart CSS
import ViewMedicines from './pages/ViewMedicines';
import Search from './pages/Search';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Homeafterlogin from './pages/Homeafterlogin'
setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/home">
          <Home />
        </Route>
        <Route exact path="/homeafterlogin">
          <Homeafterlogin/>
        </Route>
        <Route exact path="/Login">
          <Login />
        </Route>
        <Route exact path="/SignUp">
          <Signup />
        </Route>
        
        <Route exact path="/add/:pharmacyName"> {/* Define route for Add */}
          <Add />
        </Route>
        <Route exact path="/add/medicines/:pharmacyName"> {/* Define route for Medicines */}
          <Medicines />
        </Route>
       
       
        <Route path="/view/:pharmacyName" component={ViewMedicines} exact />
        <Route path="/search/:pharmacyName" component={Search} exact />
        <Route exact path="/add/general-items/:pharmacyName"> {/* Define route for General Items */}
          <GeneralItems />
        </Route>
        <Route path="/view-items/:pharmacyName" component={ViewGeneralItems} />
        <Route exact path="/add-to-cart/:pharmacyName"> {/* Define route for AddToCart */}
          <AddToCart />
        </Route>
        <Route exact path="/">
          <Redirect to="/home" /> {/* Change to redirect to /home */}
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
